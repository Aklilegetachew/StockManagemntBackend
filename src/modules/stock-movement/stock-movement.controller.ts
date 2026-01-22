import { Request, Response } from "express"
import { StockMovementService } from "./stock-movement.service"
import { sendResponse } from "../../utils/response"

export class StockMovementController {
  static async getSummary(req: Request, res: Response) {
    const { productId, branchId, fromDate, toDate } = req.query

    const summary = await StockMovementService.getStockSummary(
      productId as string,
      branchId as string,
      fromDate as string,
      toDate as string
    )

    return sendResponse(
      res,
      200,
      true,
      "Stock summary fetched successfully",
      summary
    )
  }


  static async getBranchProductSummary(req: Request, res: Response) {
    const { productId, branchId } = req.params
    const summary = await StockMovementService.getBranchProductSummary(
      productId as string,
      branchId as string
    )
    return sendResponse(res, 200, true, "Branch product summary fetched successfully", summary)
  }
}
