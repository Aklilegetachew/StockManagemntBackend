import { Request, Response, NextFunction } from "express"
import { AlertService } from "./alerts.service"
import { sendResponse } from "../../utils/response"
import { RoleCode } from "../../entities/role"

export class AlertController {
  static async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 10

      // If Branch Manager, enforce branchId filter
      // Assuming req.user is populated by authMiddleware
      const user = (req as any).user
      if (user.role.code === RoleCode.BRANCH_MANAGER) {
        if (user.branch?.id) {
          req.query.branchId = user.branch.id
        }
      }

      const data = await AlertService.getAlerts(req.query, page, limit, user)
      return sendResponse(res, 200, true, "Alerts fetched successfully", data)
    } catch (error) {
      next(error)
    }
  }

  static async acknowledgeAlert(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user.id
      const { id } = req.params
      const data = await AlertService.acknowledgeAlert(id, userId)
      return sendResponse(
        res,
        200,
        true,
        "Alert acknowledged successfully",
        data
      )
    } catch (error) {
      next(error)
    }
  }

  static async resolveAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id
      const { id } = req.params
      const data = await AlertService.resolveAlert(id, userId)
      return sendResponse(res, 200, true, "Alert resolved successfully", data)
    } catch (error) {
      next(error)
    }
  }

  static async generateAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AlertService.generateStockAlerts()
      return sendResponse(res, 200, true, "Alerts generated successfully", data)
    } catch (error) {
      next(error)
    }
  }
}
