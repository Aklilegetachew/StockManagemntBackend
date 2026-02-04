import { Request, Response } from "express"
import { BranchReturnService } from "./branch-return.service"
import { sendResponse } from "../../utils/response"
import { AppError } from "../../errors/AppError"
import { ReturnReason } from "../../entities/BranchReturnItem"

export class BranchReturnController {
  static async createReturn(req: Request, res: Response) {
    const branchId = (req as any).user.branchId
    const userId = (req as any).user.id
    const { items } = req.body

    if (!branchId)
      throw new AppError("Branch is required for this action", 400)

    if (!Array.isArray(items) || items.length === 0)
      throw new AppError("At least one item is required", 400)

    const validatedItems = items.map((item: any, index: number) => {
      if (!item.productId)
        throw new AppError(`Missing productId at index ${index}`, 400)
      if (typeof item.quantity !== "number" || item.quantity <= 0)
        throw new AppError(`Invalid quantity at index ${index}`, 400)
      if (!item.reason || !Object.values(ReturnReason).includes(item.reason))
        throw new AppError(
          `Invalid reason at index ${index}. Must be EXPIRY, DEFECT, or OTHER`,
          400
        )
      return {
        productId: item.productId,
        quantity: item.quantity,
        reason: item.reason as ReturnReason,
        note: item.note,
      }
    })

    const branchReturn = await BranchReturnService.createReturn(
      branchId,
      userId,
      validatedItems
    )

    return sendResponse(
      res,
      201,
      true,
      "Return request created successfully",
      branchReturn
    )
  }

  static async getSupervisorPendingReturns(req: Request, res: Response) {
    const returns = await BranchReturnService.getSupervisorPendingReturns()
    return sendResponse(
      res,
      200,
      true,
      "Pending return requests fetched successfully",
      returns
    )
  }

  static async approveReturn(req: Request, res: Response) {
    const { id } = req.params
    const userId = (req as any).user?.id
    const branchReturn = await BranchReturnService.approveReturn(id, userId!)
    return sendResponse(
      res,
      200,
      true,
      "Return request approved successfully",
      branchReturn
    )
  }

  static async rejectReturn(req: Request, res: Response) {
    const { id } = req.params
    const { rejectionNote } = req.body
    const branchReturn = await BranchReturnService.rejectReturn(id, rejectionNote)
    return sendResponse(
      res,
      200,
      true,
      "Return request rejected successfully",
      branchReturn
    )
  }

  static async getMyBranchReturns(req: Request, res: Response) {
    const branchId = (req as any).user.branchId
    const returns = await BranchReturnService.getMyBranchReturns(branchId)
    return sendResponse(
      res,
      200,
      true,
      "My branch return requests fetched successfully",
      returns
    )
  }

  static async getCentralReturnedStock(req: Request, res: Response) {
    const stock = await BranchReturnService.getCentralReturnedStock()
    return sendResponse(
      res,
      200,
      true,
      "Central returned stock fetched successfully",
      stock
    )
  }
}
