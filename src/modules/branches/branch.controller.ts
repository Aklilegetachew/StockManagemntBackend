// src/modules/branches/branch.controller.ts
import { Request, Response } from "express"
import { BranchService } from "./branch.service"
import { sendResponse } from "../../utils/response"

export class BranchController {
  static async createBranch(req: Request, res: Response) {
    const branch = await BranchService.createBranch(req.body)
    return sendResponse(res, 201, true, "Branch created successfully", branch)
  }

  static async getBranches(_req: Request, res: Response) {
    const branches = await BranchService.getBranches()
    return sendResponse(
      res,
      200,
      true,
      "Branches fetched successfully",
      branches
    )
  }

  static async getMyBranch(req: Request, res: Response) {
    const branch = await BranchService.getMyBranch((req as any).user)
    return sendResponse(res, 200, true, "Branch fetched successfully", branch)
  }

  static async updateBranch(req: Request, res: Response) {
    const branch = await BranchService.updateBranch(req.params.id, req.body)
    return sendResponse(res, 200, true, "Branch updated successfully", branch)
  }

  static async deactivateBranch(req: Request, res: Response) {
    await BranchService.deactivateBranch(req.params.id)
    return sendResponse(res, 200, true, "Branch deactivated successfully", null)
  }

  static async getBranchStock(req: Request, res: Response) {
    const stock = await BranchService.getBranchStock(req.params.id)
    return sendResponse(
      res,
      200,
      true,
      "Branch stock fetched successfully",
      stock
    )
  }

  static async getBranchStockSummary(req: Request, res: Response) {
    const summary = await BranchService.getBranchStockSummary()
    return sendResponse(
      res,
      200,
      true,
      "Branch stock summary fetched successfully",
      summary
    )
  }
}
