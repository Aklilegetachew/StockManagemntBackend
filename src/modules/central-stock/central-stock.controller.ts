import { Request, Response } from "express"
import { CentralStockService } from "./central-stock.service"

export class CentralStockController {
  static async addStock(req: Request, res: Response) {
    const { productId, reference, quantity, note } = req.body
    const stock = await CentralStockService.addStock(productId, reference, quantity, note)

    res.status(200).json(stock)
  }
}
