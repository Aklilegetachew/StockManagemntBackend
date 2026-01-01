import { Request, Response } from "express"
import { UserService } from "./user.service"
import { sendResponse } from "../../utils/response"

export class UserController {
  static async signup(req: Request, res: Response) {
    const user = await UserService.signup(req.body)
    const { passwordHash, ...safeUser } = user
    return sendResponse(
      res,
      201,
      true,
      "User registered successfully",
      safeUser
    )
  }

  static async login(req: Request, res: Response) {
    const result = await UserService.login(req.body)
    return sendResponse(res, 200, true, "Login successful", result)
  }

  static async forgotPassword(req: Request, res: Response) {
    await UserService.forgotPassword(req.body.email)
    return sendResponse(res, 200, true, "Password reset link sent", null)
  }

  static async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body
    await UserService.resetPassword(token, newPassword)
    return sendResponse(
      res,
      200,
      true,
      "Password has been reset successfully",
      null
    )
  }

  static async getAllUsers(req: Request, res: Response) {
    const users = await UserService.findAll()
    const safeUsers = users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      role: user.role.code,
      branch: user.branch?.name || null,
      isActive: user.isActive,
    }))
    return sendResponse(res, 200, true, "Users fetched successfully", safeUsers)
  }

  static async getUserById(req: Request, res: Response) {
    const user = await UserService.findById(req.params.id)
    const safeUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      role: user.role.code,
      branch: user.branch?.name || null,
      isActive: user.isActive,
    }
    return sendResponse(res, 200, true, "User fetched successfully", safeUser)
  }

  static async editUser(req: Request, res: Response) {
    const user = await UserService.editUser(req.params.id, req.body)
    return sendResponse(res, 200, true, "User updated successfully", user)
  }

  static async deleteUser(req: Request, res: Response) {
    await UserService.deleteUser(req.params.id)
    return sendResponse(res, 200, true, "User deleted successfully", null)
  }
}
