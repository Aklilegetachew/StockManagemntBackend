import { Request, Response } from "express"
import { CentralStockService } from "./central-stock.service"
import { sendResponse } from "../../utils/response"

export class CentralStockController {
  static async addStock(req: Request, res: Response) {
    const { productId, reference, quantity, note } = req.body
    const userId = (req as any).user?.id
    const stock = await CentralStockService.addStock(
      productId,
      reference,
      quantity,
      note,
      userId
    )

    return sendResponse(
      res,
      200,
      true,
      "Stock added to central stock successfully",
      stock
    )
  }

  static async updateCentralStock(req: Request, res: Response) {
    const { productId, reference, quantity, note } = req.body
    const userId = (req as any).user?.id
    const stock = await CentralStockService.updateCentralStock(
      productId,
      reference,
      quantity,
      note,
      userId
    )

    return sendResponse(
      res,
      200,
      true,
      "Central stock updated successfully",
      stock
    )
  }

  static async getCentralStock(req: Request, res: Response) {
    const summary = await CentralStockService.getCentralStock()

    return sendResponse(
      res,
      200,
      true,
      "Central stock fetched successfully",
      summary
    )
  }

  static async getCentralStockSummary(req: Request, res: Response) {
    const { id } = req.params
    const summary = await CentralStockService.getCentralStockMovementsSummary(
      id
    )
    const safeSummary = summary.map((item) => {
      return {
        ...item,
        requestedBy: item.requestedBy?.fullName || "",
        approvedBy: item.approvedBy?.fullName || "",
      }
    })
    console.log(summary)  

    return sendResponse(
      res,
      200,
      true,
      "Central stock summary fetched successfully",
      safeSummary
    )
  }
}
