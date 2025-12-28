
import { Request, Response } from "express"
import { StockMovementService } from "./stock-movement.service"

export class StockMovementController {
  static async getSummary(req: Request, res: Response) {
    const { productId, branchId, fromDate, toDate } = req.query

    const summary = await StockMovementService.getStockSummary(
      productId as string,
      branchId as string,
      fromDate as string,
      toDate as string
    )

    res.status(200).json(summary)
  }
}
