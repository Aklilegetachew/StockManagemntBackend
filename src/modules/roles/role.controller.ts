import { Request, Response } from "express"
import { RoleService } from "./role.service"

export class RoleController {
  static async createRole(req: Request, res: Response) {
    const role = await RoleService.createRole(req.body)
    res.status(201).json({ success: true, data: role })
  }

  static async getRoles(_req: Request, res: Response) {
    const roles = await RoleService.getRoles()
    res.json({ success: true, data: roles })
  }

  static async getRoleById(req: Request, res: Response) {
    const role = await RoleService.getRoleById(req.params.id)
    res.json({ success: true, data: role })
  }

  static async updateRole(req: Request, res: Response) {
    const role = await RoleService.updateRole(req.params.id, req.body)
    res.json({ success: true, data: role })
  }

  static async deleteRole(req: Request, res: Response) {
    await RoleService.deleteRole(req.params.id)
    res.status(204).send()
  }
}
