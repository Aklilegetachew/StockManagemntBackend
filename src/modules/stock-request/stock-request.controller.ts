// src/modules/stock-request/stock-request.controller.ts
import { Request, Response } from "express"
import { StockRequestService } from "./stock-request.service"
import { sendResponse } from "../../utils/response"
import { AppError } from "../../errors/AppError"
import {
  generateRequestCreatedReceipt,
  generateApprovalReceipt,
  generateDispatchReceipt,
  generateReceiveReceipt,
} from "../../utils/pdfReceipt"
import { AppDataSource } from "../../data-source"
import { User } from "../../entities/user"

export class StockRequestController {
  static async createRequest(req: Request, res: Response) {
    const branchId = (req as any).user.branchId
    const userId = (req as any).user.id
    const { items } = req.body // [{ productId, quantity }]
    const request = await StockRequestService.createRequest(
      branchId,
      userId,
      items
    )

    // Check if PDF receipt is requested
    if (req.query.receipt === "pdf") {
      const user = await AppDataSource.getRepository(User).findOneBy({ id: userId })
      const fullRequest = await StockRequestService.stockRequestRepo.findOne({
        where: { id: request.id },
        relations: ["items", "items.product", "branch", "requestedBy"],
      })

      if (!fullRequest) throw new AppError("Request not found", 404)

      const doc = generateRequestCreatedReceipt(fullRequest, user?.fullName || "Unknown")

      res.setHeader("Content-Type", "application/pdf")
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=stock-request-${request.id.substring(0, 8)}.pdf`
      )

      doc.pipe(res)
      doc.end()
      return
    }

    return sendResponse(
      res,
      201,
      true,
      "Stock request created successfully",
      request
    )
  }

  static async getAllRequests(req: Request, res: Response) {
    const requests = await StockRequestService.stockRequestRepo.find({
      relations: ["items", "branch", "requestedBy"],
    })
    return sendResponse(
      res,
      200,
      true,
      "Stock requests fetched successfully",
      requests
    )
  }

  static async approveRequest(req: Request, res: Response) {
    const { id } = req.params
    const { items, note } = req.body
    const userId = (req as any).user?.id

    if (!Array.isArray(items)) {
      throw new AppError("Items must be an array", 400)
    }

    if (items.length === 0) {
      throw new AppError("At least one item must be approved", 400)
    }

    const approvedItems = items.map((item, index) => {
      if (!item.productId) {
        throw new AppError(`Missing productId at index ${index}`, 400)
      }

      if (
        typeof item.approvedQuantity !== "number" ||
        isNaN(item.approvedQuantity)
      ) {
        throw new AppError(
          `Invalid approvedQuantity for product ${item.productId}`,
          400
        )
      }

      return {
        productId: item.productId,
        approvedQuantity: item.approvedQuantity,
      }
    })

    const request = await StockRequestService.approveRequest(
      id,
      approvedItems,
      note
    )

    // Check if PDF receipt is requested
    if (req.query.receipt === "pdf") {
      const user = await AppDataSource.getRepository(User).findOneBy({ id: userId })
      const fullRequest = await StockRequestService.stockRequestRepo.findOne({
        where: { id: request.id },
        relations: ["items", "items.product", "branch", "requestedBy"],
      })

      if (!fullRequest) throw new AppError("Request not found", 404)

      const doc = generateApprovalReceipt(fullRequest, user?.fullName || "Unknown")

      res.setHeader("Content-Type", "application/pdf")
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=approval-${request.id.substring(0, 8)}.pdf`
      )

      doc.pipe(res)
      doc.end()
      return
    }

    return sendResponse(
      res,
      200,
      true,
      "Stock request approved successfully",
      request
    )
  }

  static async dispatchRequest(req: Request, res: Response) {
    const { id } = req.params
    const userId = (req as any).user?.id
    const request = await StockRequestService.dispatchRequest(id, userId)

    // Check if PDF receipt is requested
    if (req.query.receipt === "pdf") {
      const user = await AppDataSource.getRepository(User).findOneBy({ id: userId })
      const fullRequest = await StockRequestService.stockRequestRepo.findOne({
        where: { id: request.id },
        relations: ["items", "items.product", "branch", "requestedBy"],
      })

      if (!fullRequest) throw new AppError("Request not found", 404)

      const doc = generateDispatchReceipt(fullRequest, user?.fullName || "Unknown")

      res.setHeader("Content-Type", "application/pdf")
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=dispatch-${request.id.substring(0, 8)}.pdf`
      )

      doc.pipe(res)
      doc.end()
      return
    }

    return sendResponse(
      res,
      200,
      true,
      "Stock request dispatched successfully",
      request
    )
  }

  static async receiveStock(req: Request, res: Response) {
    const { id } = req.params
    const { items } = req.body // [{ productId, receivedQuantity, returnedQuantity, reason }]
    const userId = (req as any).user?.id

    if (!Array.isArray(items)) {
      throw new AppError("Items must be an array", 400)
    }

    const request = await StockRequestService.receiveStock(id, items, userId)

    // Check if PDF receipt is requested
    if (req.query.receipt === "pdf") {
      const user = await AppDataSource.getRepository(User).findOneBy({ id: userId })
      const fullRequest = await StockRequestService.stockRequestRepo.findOne({
        where: { id: request.id },
        relations: ["items", "items.product", "branch", "requestedBy"],
      })

      if (!fullRequest) throw new AppError("Request not found", 404)

      const doc = generateReceiveReceipt(fullRequest, user?.fullName || "Unknown")

      res.setHeader("Content-Type", "application/pdf")
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=received-${request.id.substring(0, 8)}.pdf`
      )

      doc.pipe(res)
      doc.end()
      return
    }

    return sendResponse(res, 200, true, "Stock received successfully", request)
  }

  static async getAllReturns(req: Request, res: Response) {
    const returns = await StockRequestService.getAllReturns()
    return sendResponse(
      res,
      200,
      true,
      "Stock returns fetched successfully",
      returns
    )
  }

  static async getMyBranchReturns(req: Request, res: Response) {
    const branchId = (req as any).user.branchId
    const returns = await StockRequestService.getBranchReturns(branchId)
    return sendResponse(
      res,
      200,
      true,
      "My branch stock returns fetched successfully",
      returns
    )
  }

  static async getMyBranchRequests(req: Request, res: Response) {
    const branchId = (req as any).user.branchId
    const requests = await StockRequestService.stockRequestRepo.find({
      where: { branch: { id: branchId } },
      relations: ["items", "branch", "requestedBy"],
    })
    return sendResponse(
      res,
      200,
      true,
      "My branch stock requests fetched successfully",
      requests
    )
  }

  static async editRequestBeforeApproval(req: Request, res: Response) {
    const { id } = req.params
    const { items } = req.body
    const request = await StockRequestService.editRequestBeforeApproval(
      id,
      items
    )
    return sendResponse(
      res,
      200,
      true,
      "Stock request updated successfully",
      request
    )
  }

  static async getMyBranchDispatchedRequests(req: Request, res: Response) {
    const branchId = (req as any).user.branchId
    const response = await StockRequestService.getMyBranchDispatchedRequests(
      branchId
    )
    return sendResponse(
      res,
      200,
      true,
      "My branch dispatched stock requests fetched successfully",
      response
    )
  }

  static async getMyBranchReceivedRequests(req: Request, res: Response) {
    const branchId = (req as any).user.branchId
    const response = await StockRequestService.getMyBranchReceivedRequests(
      branchId
    )
    return sendResponse(
      res,
      200,
      true,
      "My branch received stock requests fetched successfully",
      response
    )
  }

  // New endpoint to download receipt for any existing request
  static async downloadReceipt(req: Request, res: Response) {
    const { id } = req.params
    const userId = (req as any).user?.id

    const request = await StockRequestService.stockRequestRepo.findOne({
      where: { id },
      relations: ["items", "items.product", "branch", "requestedBy"],
    })

    if (!request) throw new AppError("Stock request not found", 404)

    const user = await AppDataSource.getRepository(User).findOneBy({ id: userId })
    const userName = user?.fullName || "Unknown"

    let doc
    let filename

    switch (request.status) {
      case "PENDING":
        doc = generateRequestCreatedReceipt(request, request.requestedBy?.fullName || userName)
        filename = `stock-request-${id.substring(0, 8)}.pdf`
        break
      case "APPROVED":
        doc = generateApprovalReceipt(request, userName)
        filename = `approval-${id.substring(0, 8)}.pdf`
        break
      case "DISPATCHED":
        doc = generateDispatchReceipt(request, userName)
        filename = `dispatch-${id.substring(0, 8)}.pdf`
        break
      case "RECEIVED":
        doc = generateReceiveReceipt(request, userName)
        filename = `received-${id.substring(0, 8)}.pdf`
        break
      case "REJECTED":
        doc = generateRequestCreatedReceipt(request, request.requestedBy?.fullName || userName)
        filename = `rejected-${id.substring(0, 8)}.pdf`
        break
      default:
        doc = generateRequestCreatedReceipt(request, request.requestedBy?.fullName || userName)
        filename = `request-${id.substring(0, 8)}.pdf`
    }

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`)

    doc.pipe(res)
    doc.end()
  }
}
