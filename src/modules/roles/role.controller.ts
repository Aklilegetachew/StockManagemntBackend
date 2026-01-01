import { Request, Response } from "express"
import { RoleService } from "./role.service"
import { sendResponse } from "../../utils/response"

export class RoleController {
  static async createRole(req: Request, res: Response) {
    const role = await RoleService.createRole(req.body)
    return sendResponse(res, 201, true, "Role created successfully", role)
  }

  static async getRoles(_req: Request, res: Response) {
    const roles = await RoleService.getRoles()
    return sendResponse(res, 200, true, "Roles fetched successfully", roles)
  }

  static async getRoleById(req: Request, res: Response) {
    const role = await RoleService.getRoleById(req.params.id)
    return sendResponse(res, 200, true, "Role fetched successfully", role)
  }

  static async updateRole(req: Request, res: Response) {
    const role = await RoleService.updateRole(req.params.id, req.body)
    return sendResponse(res, 200, true, "Role updated successfully", role)
  }

  static async deleteRole(req: Request, res: Response) {
    await RoleService.deleteRole(req.params.id)
    return sendResponse(res, 200, true, "Role deleted successfully", null)
  }
}
