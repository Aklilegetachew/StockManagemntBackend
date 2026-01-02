import { Request, Response, NextFunction } from "express"
import { AnalyticsService } from "./analytics.service"
import { sendResponse } from "../../utils/response"

export class AnalyticsController {
  // ==================== INVENTORY HEALTH ====================

  static async getLowStockByBranch(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await AnalyticsService.getLowStockByBranch()
      return sendResponse(
        res,
        200,
        true,
        "Low stock data fetched successfully",
        data
      )
    } catch (error) {
      next(error)
    }
  }

  static async getCentralStockHealth(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await AnalyticsService.getCentralStockHealth()
      return sendResponse(
        res,
        200,
        true,
        "Central stock health fetched successfully",
        data
      )
    } catch (error) {
      next(error)
    }
  }

  static async getPendingRequests(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await AnalyticsService.getPendingRequests()
      return sendResponse(
        res,
        200,
        true,
        "Pending requests data fetched successfully",
        data
      )
    } catch (error) {
      next(error)
    }
  }

  static async getProductStatus(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await AnalyticsService.getProductStatus()
      return sendResponse(
        res,
        200,
        true,
        "Product status fetched successfully",
        data
      )
    } catch (error) {
      next(error)
    }
  }

  // ==================== PRODUCT MOVEMENT ====================

  static async getProductMovement(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await AnalyticsService.getProductMovement()
      return sendResponse(
        res,
        200,
        true,
        "Product movement data fetched successfully",
        data
      )
    } catch (error) {
      next(error)
    }
  }

  static async getBranchWiseMovement(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await AnalyticsService.getBranchWiseMovement()
      return sendResponse(
        res,
        200,
        true,
        "Branch-wise movement data fetched successfully",
        data
      )
    } catch (error) {
      next(error)
    }
  }

  static async getProductAging(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await AnalyticsService.getProductAging()
      return sendResponse(
        res,
        200,
        true,
        "Product aging data fetched successfully",
        data
      )
    } catch (error) {
      next(error)
    }
  }

  // ==================== BRANCH BEHAVIOR ====================

  static async getBranchRequestFrequency(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await AnalyticsService.getBranchRequestFrequency()
      return sendResponse(
        res,
        200,
        true,
        "Branch request frequency fetched successfully",
        data
      )
    } catch (error) {
      next(error)
    }
  }

  static async getStockHoldingDuration(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await AnalyticsService.getStockHoldingDuration()
      return sendResponse(
        res,
        200,
        true,
        "Stock holding duration fetched successfully",
        data
      )
    } catch (error) {
      next(error)
    }
  }

  // ==================== REQUEST OPERATIONS ====================

  static async getRequestStatusBreakdown(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await AnalyticsService.getRequestStatusBreakdown()
      return sendResponse(
        res,
        200,
        true,
        "Request status breakdown fetched successfully",
        data
      )
    } catch (error) {
      next(error)
    }
  }

  static async getPartialApprovals(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await AnalyticsService.getPartialApprovals()
      return sendResponse(
        res,
        200,
        true,
        "Partial approvals data fetched successfully",
        data
      )
    } catch (error) {
      next(error)
    }
  }

  static async getUserActivity(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await AnalyticsService.getUserActivity()
      return sendResponse(
        res,
        200,
        true,
        "User activity data fetched successfully",
        data
      )
    } catch (error) {
      next(error)
    }
  }

  // ==================== BRANCH SPECIFIC ====================

  static async getBranchOverview(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { branchId } = req.params
      const data = await AnalyticsService.getBranchOverview(branchId)
      return sendResponse(
        res,
        200,
        true,
        "Branch overview fetched successfully",
        data
      )
    } catch (error) {
      next(error)
    }
  }

  static async getBranchLowStock(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { branchId } = req.params
      const data = await AnalyticsService.getBranchLowStock(branchId)
      return sendResponse(
        res,
        200,
        true,
        "Branch low stock fetched successfully",
        data
      )
    } catch (error) {
      next(error)
    }
  }

  static async getBranchRecentDispatched(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { branchId } = req.params
      const data = await AnalyticsService.getBranchRecentDispatched(branchId)
      return sendResponse(
        res,
        200,
        true,
        "Branch recent dispatched fetched successfully",
        data
      )
    } catch (error) {
      next(error)
    }
  }
}
