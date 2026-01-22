// src/modules/report/report.controller.ts
import { Request, Response } from "express"
import { ReportService } from "./report.service"
import { sendResponse } from "../../utils/response"
import { StockMovementType } from "../../entities/StockMovement"
import { StockRequestStatus } from "../../entities/StockRequest"

export class ReportController {
  /**
   * GET /reports/current-stock
   * Query params:
   *   - branchId: string (optional, omit for central stock)
   *   - productId: string (optional)
   *   - categoryId: string (optional)
   *   - lowStockOnly: boolean (optional, default: false)
   *   - lowStockThreshold: number (optional, default: 10)
   */
  static async getCurrentStock(req: Request, res: Response) {
    const { branchId, productId, categoryId, lowStockOnly, lowStockThreshold } = req.query

    const report = await ReportService.getCurrentStock({
      branchId: branchId as string | undefined,
      productId: productId as string | undefined,
      categoryId: categoryId as string | undefined,
      lowStockOnly: lowStockOnly === "true",
      lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : undefined,
    })

    return sendResponse(res, 200, true, "Current stock report generated successfully", report)
  }

  /**
   * GET /reports/stock-movements
   * Query params:
   *   - branchId: string (optional, "central" or omit for central stock)
   *   - productId: string (optional)
   *   - movementType: ADDITION | DEDUCTION | SALE | TRANSFER_IN | TRANSFER_OUT (optional)
   *   - startDate: string (YYYY-MM-DD)
   *   - endDate: string (YYYY-MM-DD)
   */
  static async getStockMovements(req: Request, res: Response) {
    const { branchId, productId, movementType, startDate, endDate } = req.query

    const report = await ReportService.getStockMovements({
      branchId: branchId as string | undefined,
      productId: productId as string | undefined,
      movementType: movementType as StockMovementType | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    })

    return sendResponse(res, 200, true, "Stock movement report generated successfully", report)
  }

  /**
   * GET /reports/requested-items
   * Query params:
   *   - branchId: string (optional)
   *   - status: string or comma-separated (PENDING, APPROVED, DISPATCHED, RECEIVED, REJECTED)
   *   - startDate: string (YYYY-MM-DD)
   *   - endDate: string (YYYY-MM-DD)
   *   - productId: string (optional)
   */
  static async getRequestedItems(req: Request, res: Response) {
    const { branchId, status, startDate, endDate, productId } = req.query

    // Parse status - can be single value or comma-separated
    let parsedStatus: StockRequestStatus | StockRequestStatus[] | undefined
    if (status) {
      const statusStr = status as string
      if (statusStr.includes(",")) {
        parsedStatus = statusStr.split(",").map((s) => s.trim() as StockRequestStatus)
      } else {
        parsedStatus = statusStr as StockRequestStatus
      }
    }

    const report = await ReportService.getRequestedItems({
      branchId: branchId as string | undefined,
      status: parsedStatus,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      productId: productId as string | undefined,
    })

    return sendResponse(res, 200, true, "Requested items report generated successfully", report)
  }

  /**
   * GET /reports/low-stock
   * Query params:
   *   - threshold: number (optional, default: 10)
   */
  static async getLowStockReport(req: Request, res: Response) {
    const { threshold } = req.query

    const report = await ReportService.getLowStockReport(
      threshold ? Number(threshold) : undefined
    )

    return sendResponse(res, 200, true, "Low stock report generated successfully", report)
  }

  /**
   * GET /reports/sales-summary
   * Query params:
   *   - branchId: string (optional)
   *   - productId: string (optional)
   *   - startDate: string (YYYY-MM-DD)
   *   - endDate: string (YYYY-MM-DD)
   */
  static async getSalesSummary(req: Request, res: Response) {
    const { branchId, productId, startDate, endDate } = req.query

    const report = await ReportService.getSalesSummary({
      branchId: branchId as string | undefined,
      productId: productId as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    })

    return sendResponse(res, 200, true, "Sales summary report generated successfully", report)
  }
}
