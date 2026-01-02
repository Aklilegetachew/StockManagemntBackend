import { Request, Response, NextFunction } from "express"
import { SalesReportService } from "./sales-report.service"
import { sendResponse } from "../../utils/response"
import { AppError } from "../../errors/AppError"

export class SalesReportController {
  static async uploadSalesReport(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.file) {
        throw new AppError("File is required", 400)
      }

      const { startDate, endDate } = req.body

      if (!startDate || !endDate) {
        throw new AppError("startDate and endDate are required", 400)
      }

      // Check if user is authenticated and has ID
      if (!(req as any).user || !(req as any).user.id) {
        throw new AppError("User not authenticated", 401)
      }

      const result = await SalesReportService.uploadSalesReport({
        startDate,
        endDate,
        userId: (req as any).user.id,
        file: req.file,
      })

      return sendResponse(res, 201, true, result.message, {
        dateRange: result.dateRange,
        branches: result.branches,
      })
    } catch (error) {
      next(error)
    }
  }
}
