// src/modules/stock-request/stock-request.controller.ts
import { Request, Response } from "express"
import { StockRequestService } from "./stock-request.service"
import { sendResponse } from "../../utils/response"
import { AppError } from "../../errors/AppError"

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
    return sendResponse(
      res,
      201,
      true,
      "Stock request created successfully",
      request
    )
  }

  static async getAllRequests(req: Request, res: Response) {
    const requests = await StockRequestService.stockRequestRepo.find({
      relations: ["items", "branch", "requestedBy"],
    })
    return sendResponse(
      res,
      200,
      true,
      "Stock requests fetched successfully",
      requests
    )
  }

  static async approveRequest(req: Request, res: Response) {
    const { id } = req.params
    const { items, note } = req.body

    if (!Array.isArray(items)) {
      throw new AppError("Items must be an array", 400)
    }

    if (items.length === 0) {
      throw new AppError("At least one item must be approved", 400)
    }

    const approvedItems = items.map((item, index) => {
      if (!item.productId) {
        throw new AppError(`Missing productId at index ${index}`, 400)
      }

      if (
        typeof item.approvedQuantity !== "number" ||
        isNaN(item.approvedQuantity)
      ) {
        throw new AppError(
          `Invalid approvedQuantity for product ${item.productId}`,
          400
        )
      }

      return {
        productId: item.productId,
        approvedQuantity: item.approvedQuantity,
      }
    })

    const request = await StockRequestService.approveRequest(
      id,
      approvedItems,
      note
    )

    return sendResponse(
      res,
      200,
      true,
      "Stock request approved successfully",
      request
    )
  }

  static async dispatchRequest(req: Request, res: Response) {
    const { id } = req.params
    const request = await StockRequestService.dispatchRequest(id)
    return sendResponse(
      res,
      200,
      true,
      "Stock request dispatched successfully",
      request
    )
  }

  static async receiveStock(req: Request, res: Response) {
    const { id } = req.params
    const request = await StockRequestService.receiveStock(id)
    return sendResponse(res, 200, true, "Stock received successfully", request)
  }

  static async getMyBranchRequests(req: Request, res: Response) {
    const branchId = (req as any).user.branchId
    const requests = await StockRequestService.stockRequestRepo.find({
      where: { branch: { id: branchId } },
      relations: ["items", "branch", "requestedBy"],
    })
    return sendResponse(
      res,
      200,
      true,
      "My branch stock requests fetched successfully",
      requests
    )
  }

  static async editRequestBeforeApproval(req: Request, res: Response) {
    const { id } = req.params
    const { items } = req.body
    const request = await StockRequestService.editRequestBeforeApproval(
      id,
      items
    )
    return sendResponse(
      res,
      200,
      true,
      "Stock request updated successfully",
      request
    )
  }

  static async getMyBranchDispatchedRequests(req: Request, res: Response) {
    const branchId = (req as any).user.branchId
    const response = await StockRequestService.getMyBranchDispatchedRequests(
      branchId
    )
    return sendResponse(
      res,
      200,
      true,
      "My branch dispatched stock requests fetched successfully",
      response
    )
  }

  static async getMyBranchReceivedRequests(req: Request, res: Response) {
    const branchId = (req as any).user.branchId
    const response = await StockRequestService.getMyBranchReceivedRequests(
      branchId
    )
    return sendResponse(
      res,
      200,
      true,
      "My branch received stock requests fetched successfully",
      response
    )
  }
}
