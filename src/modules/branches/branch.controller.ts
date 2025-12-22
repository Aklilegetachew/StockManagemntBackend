// src/modules/branches/branch.controller.ts
import { Request, Response } from "express"
import { BranchService } from "./branch.service"

export class BranchController {
  static async createBranch(req: Request, res: Response) {
    const branch = await BranchService.createBranch(req.body)
    res.status(201).json({ success: true, data: branch })
  }

  static async getBranches(_req: Request, res: Response) {
    const branches = await BranchService.getBranches()
    res.json({ success: true, data: branches })
  }

  static async getMyBranch(req: Request, res: Response) {
    const branch = await BranchService.getMyBranch((req as any).user)
    res.json({ success: true, data: branch })
  }

  static async updateBranch(req: Request, res: Response) {
    const branch = await BranchService.updateBranch(req.params.id, req.body)
    res.json({ success: true, data: branch })
  }

  static async deactivateBranch(req: Request, res: Response) {
    await BranchService.deactivateBranch(req.params.id)
    res.status(204).send()
  }
}
