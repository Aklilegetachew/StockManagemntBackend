// src/utils/pdfReceipt.ts
import PDFDocument from "pdfkit"
import { StockRequest, StockRequestStatus } from "../entities/StockRequest"

// Color schemes for different statuses
const STATUS_COLORS: Record<StockRequestStatus, { primary: string; bg: string; text: string }> = {
  [StockRequestStatus.PENDING]: { primary: "#F59E0B", bg: "#FEF3C7", text: "#92400E" },
  [StockRequestStatus.PENDING_SUPERVISOR]: { primary: "#D97706", bg: "#FED7AA", text: "#9A3412" },
  [StockRequestStatus.PENDING_BRANCH_APPROVAL]: { primary: "#EA580C", bg: "#FFEDD5", text: "#9A3412" },
  [StockRequestStatus.APPROVED]: { primary: "#3B82F6", bg: "#DBEAFE", text: "#1E40AF" },
  [StockRequestStatus.DISPATCHED]: { primary: "#8B5CF6", bg: "#EDE9FE", text: "#5B21B6" },
  [StockRequestStatus.RECEIVED]: { primary: "#10B981", bg: "#D1FAE5", text: "#065F46" },
  [StockRequestStatus.REJECTED]: { primary: "#EF4444", bg: "#FEE2E2", text: "#991B1B" },
}

const COMPANY_NAME = "TOMOCA COFFEE"
const COMPANY_TAGLINE = "Stock Management System"

interface ReceiptOptions {
  title: string
  actionBy?: string
  actionDate?: Date
}

function formatDate(date: Date | undefined | null): string {
  if (!date) return "N/A"
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function drawHeader(doc: PDFKit.PDFDocument, colors: { primary: string; bg: string; text: string }) {
  // Header background
  doc.rect(0, 0, doc.page.width, 120).fill(colors.primary)

  // Company name
  doc.fillColor("#FFFFFF")
    .fontSize(28)
    .font("Helvetica-Bold")
    .text(COMPANY_NAME, 50, 35, { align: "center" })

  // Tagline
  doc.fontSize(12)
    .font("Helvetica")
    .text(COMPANY_TAGLINE, 50, 70, { align: "center" })

  // Decorative line
  doc.moveTo(50, 95).lineTo(doc.page.width - 50, 95).strokeColor("#FFFFFF").lineWidth(0.5).stroke()
}

function drawStatusBadge(
  doc: PDFKit.PDFDocument,
  status: StockRequestStatus,
  x: number,
  y: number,
  colors: { primary: string; bg: string; text: string }
) {
  const badgeWidth = 100
  const badgeHeight = 24
  
  // Badge background
  doc.roundedRect(x, y, badgeWidth, badgeHeight, 4).fill(colors.bg)
  
  // Badge text
  doc.fillColor(colors.text)
    .fontSize(10)
    .font("Helvetica-Bold")
    .text(status, x, y + 7, { width: badgeWidth, align: "center" })
}

function drawSectionTitle(doc: PDFKit.PDFDocument, title: string, y: number, color: string) {
  doc.fillColor(color)
    .fontSize(14)
    .font("Helvetica-Bold")
    .text(title, 50, y)

  doc.moveTo(50, y + 18).lineTo(200, y + 18).strokeColor(color).lineWidth(2).stroke()
  
  return y + 30
}

function drawInfoRow(doc: PDFKit.PDFDocument, label: string, value: string, y: number) {
  doc.fillColor("#374151")
    .fontSize(10)
    .font("Helvetica-Bold")
    .text(label + ":", 50, y)
  
  doc.fillColor("#1F2937")
    .fontSize(10)
    .font("Helvetica")
    .text(value, 180, y)
  
  return y + 18
}

function drawItemsTable(
  doc: PDFKit.PDFDocument,
  items: any[],
  startY: number,
  status: StockRequestStatus,
  colors: { primary: string; bg: string; text: string }
) {
  const tableLeft = 50
  const tableWidth = doc.page.width - 100
  
  const isReceived = status === StockRequestStatus.RECEIVED
  const isApprovedOrDispatched = [
    StockRequestStatus.APPROVED,
    StockRequestStatus.DISPATCHED,
  ].includes(status)

  let colWidths: number[]
  let headers: string[]

  if (isReceived) {
    colWidths = [30, 200, 80, 80, 80, 25]
    headers = ["#", "Product Name", "Req.", "Appr.", "Recv.", "Unit"]
  } else if (isApprovedOrDispatched) {
    colWidths = [40, 200, 80, 80, 95]
    headers = ["#", "Product Name", "Requested", "Approved", "Unit"]
  } else {
    colWidths = [50, 280, 165]
    headers = ["#", "Product Name", "Quantity"]
  }
  
  // Table header
  doc.rect(tableLeft, startY, tableWidth, 25).fill(colors.primary)
  
  doc.fillColor("#FFFFFF").fontSize(10).font("Helvetica-Bold")
  
  let headerX = tableLeft + 10
  headers.forEach((header, i) => {
    doc.text(header, headerX, startY + 8, { width: colWidths[i] - 10 })
    headerX += colWidths[i]
  })
  
  let currentY = startY + 25
  
  // Table rows
  items.forEach((item, index) => {
    const isEven = index % 2 === 0
    
    // Row background
    doc.rect(tableLeft, currentY, tableWidth, 22).fill(isEven ? "#F9FAFB" : "#FFFFFF")
    
    doc.fillColor("#374151").fontSize(9).font("Helvetica")
    
    let cellX = tableLeft + 10
    const productName = item.product?.name || "Unknown Product"
    const unit = item.product?.unit || "pcs"
    
    let rowData: string[]
    if (isReceived) {
      rowData = [
        (index + 1).toString(),
        productName,
        Number(item.requestedQuantity).toFixed(1),
        Number(item.approvedQuantity || 0).toFixed(1),
        Number(item.receivedQuantity || 0).toFixed(1),
        Number(item.returnedQuantity || 0).toFixed(1),
        unit,
      ]
    } else if (isApprovedOrDispatched) {
      rowData = [
        (index + 1).toString(),
        productName,
        Number(item.requestedQuantity).toFixed(2),
        item.approvedQuantity != null ? Number(item.approvedQuantity).toFixed(2) : "-",
        unit,
      ]
    } else {
      rowData = [
        (index + 1).toString(),
        productName,
        `${Number(item.requestedQuantity).toFixed(2)} ${unit}`,
      ]
    }
    
    rowData.forEach((data, i) => {
      doc.text(data, cellX, currentY + 6, { width: colWidths[i] - 10 })
      cellX += colWidths[i]
    })
    
    currentY += 22
  })
  
  // Table border
  doc.rect(tableLeft, startY, tableWidth, currentY - startY)
    .strokeColor("#D1D5DB")
    .lineWidth(1)
    .stroke()
  
  return currentY + 15
}

function drawFooter(doc: PDFKit.PDFDocument, colors: { primary: string }) {
  const footerY = doc.page.height - 60
  
  doc.moveTo(50, footerY).lineTo(doc.page.width - 50, footerY).strokeColor("#E5E7EB").lineWidth(1).stroke()
  
  doc.fillColor("#9CA3AF")
    .fontSize(8)
    .font("Helvetica")
    .text("This is a system-generated document.", 50, footerY + 10, { align: "center" })
  
  doc.text(`Generated on: ${formatDate(new Date())}`, 50, footerY + 22, { align: "center" })
  
  doc.fillColor(colors.primary)
    .fontSize(9)
    .font("Helvetica-Bold")
    .text(COMPANY_NAME + " - Stock Management System", 50, footerY + 38, { align: "center" })
}

export function generateStockRequestReceipt(
  request: StockRequest,
  options: ReceiptOptions
): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: {
      Title: options.title,
      Author: COMPANY_NAME,
      Subject: `Stock Request - ${request.id}`,
    },
  })
  
  const colors = STATUS_COLORS[request.status]
  const showApprovedColumn = [
    StockRequestStatus.APPROVED,
    StockRequestStatus.DISPATCHED,
    StockRequestStatus.RECEIVED,
  ].includes(request.status)
  
  // Draw header
  drawHeader(doc, colors)
  
  // Document title
  let currentY = 140
  doc.fillColor(colors.primary)
    .fontSize(20)
    .font("Helvetica-Bold")
    .text(options.title, 50, currentY, { align: "center" })
  
  // Status badge
  currentY += 35
  drawStatusBadge(doc, request.status, doc.page.width / 2 - 50, currentY, colors)
  
  // Request Information Section
  currentY += 50
  currentY = drawSectionTitle(doc, "Request Information", currentY, colors.primary)
  
  currentY = drawInfoRow(doc, "Request ID", request.id.substring(0, 8).toUpperCase(), currentY)
  currentY = drawInfoRow(doc, "Branch", request.branch?.name || "N/A", currentY)
  currentY = drawInfoRow(doc, "Requested By", request.requestedBy?.fullName || "N/A", currentY)
  currentY = drawInfoRow(doc, "Request Date", formatDate(request.createdAt), currentY)
  
  if (request.approvedAt) {
    currentY = drawInfoRow(doc, "Approved Date", formatDate(request.approvedAt), currentY)
  }
  if (request.dispatchedAt) {
    currentY = drawInfoRow(doc, "Dispatched Date", formatDate(request.dispatchedAt), currentY)
  }
  if (request.receivedAt) {
    currentY = drawInfoRow(doc, "Received Date", formatDate(request.receivedAt), currentY)
  }
  
  if (options.actionBy) {
    currentY = drawInfoRow(doc, "Action By", options.actionBy, currentY)
  }
  
  if (request.note) {
    currentY = drawInfoRow(doc, "Note", request.note, currentY)
  }
  
  // Items Section
  currentY += 15
  currentY = drawSectionTitle(doc, "Requested Items", currentY, colors.primary)
  
  if (request.items && request.items.length > 0) {
    currentY = drawItemsTable(doc, request.items, currentY, request.status, colors)
  } else {
    doc.fillColor("#6B7280")
      .fontSize(10)
      .font("Helvetica-Oblique")
      .text("No items in this request.", 50, currentY)
    currentY += 20
  }
  
  // Summary Section
  if (showApprovedColumn && request.items?.length > 0) {
    currentY += 10
    const totalRequested = request.items.reduce((sum, item) => sum + Number(item.requestedQuantity || 0), 0)
    const totalApproved = request.items.reduce((sum, item) => sum + Number(item.approvedQuantity || 0), 0)
    
    doc.fillColor("#374151")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(`Total Requested: ${totalRequested.toFixed(2)}`, doc.page.width - 250, currentY)
    
    currentY += 15
    doc.fillColor(colors.primary)
      .text(`Total Approved: ${totalApproved.toFixed(2)}`, doc.page.width - 250, currentY)

    if (request.status === StockRequestStatus.RECEIVED) {
      const totalReceived = request.items.reduce((sum, item) => sum + Number(item.receivedQuantity || 0), 0)
      
      currentY += 15
      doc.fillColor("#10B981") // Green for received
        .text(`Total Received: ${totalReceived.toFixed(2)}`, doc.page.width - 250, currentY)
    }
  }
  
  // Footer
  drawFooter(doc, colors)
  
  return doc
}

// Specific receipt generators for each action
export function generateRequestCreatedReceipt(request: StockRequest, requesterName: string) {
  return generateStockRequestReceipt(request, {
    title: "STOCK REQUEST RECEIPT",
    actionBy: requesterName,
    actionDate: request.createdAt,
  })
}

export function generateApprovalReceipt(request: StockRequest, approverName: string) {
  return generateStockRequestReceipt(request, {
    title: "STOCK REQUEST APPROVAL",
    actionBy: approverName,
    actionDate: request.approvedAt,
  })
}

export function generateDispatchReceipt(request: StockRequest, dispatcherName: string) {
  return generateStockRequestReceipt(request, {
    title: "DISPATCH NOTE",
    actionBy: dispatcherName,
    actionDate: request.dispatchedAt,
  })
}

export function generateReceiveReceipt(request: StockRequest, receiverName: string) {
  return generateStockRequestReceipt(request, {
    title: "GOODS RECEIVED NOTE",
    actionBy: receiverName,
    actionDate: request.receivedAt,
  })
}
