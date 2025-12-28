// src/modules/stock-request/stock-request.controller.ts
import { Request, Response } from "express"
import { StockRequestService } from "./stock-request.service"

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
    res.status(201).json(request)
  }

  static async getAllRequests(req: Request, res: Response) {
    const requests = await StockRequestService.stockRequestRepo.find({
      relations: ["items", "branch", "requestedBy"],
    })
    res.json(requests)
  }

  static async approveRequest(req: Request, res: Response) {
    const { id } = req.params
    const { approvedItems, note } = req.body
    const request = await StockRequestService.approveRequest(
      id,
      approvedItems,
      note
    )
    res.json(request)
  }

  static async dispatchRequest(req: Request, res: Response) {
    const { id } = req.params
    const request = await StockRequestService.dispatchRequest(id)
    res.json(request)
  }

  static async receiveStock(req: Request, res: Response) {
    const { id } = req.params
    const request = await StockRequestService.receiveStock(id)
    res.json(request)
  }
}
