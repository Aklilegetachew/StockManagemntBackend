import { Request, Response } from "express"
import { UserService } from "./user.service"

export class UserController {
  static async signup(req: Request, res: Response) {
    const user = await UserService.signup(req.body)
    res.status(201).json({ success: true, data: user })
  }

  static async login(req: Request, res: Response) {
    const result = await UserService.login(req.body)
    res.json({ success: true, data: result })
  }

  static async forgotPassword(req: Request, res: Response) {
    await UserService.forgotPassword(req.body.email)
    res.json({ success: true, message: "Password reset link sent" })
  }

  static async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body
    await UserService.resetPassword(token, newPassword)
    res.json({ success: true, message: "Password has been reset successfully" })
  }

  static async editUser(req: Request, res: Response) {
    const user = await UserService.editUser(req.params.id, req.body)
    res.json({ success: true, data: user })
  }

  static async deleteUser(req: Request, res: Response) {
    await UserService.deleteUser(req.params.id)
    res.status(204).send()
  }
}
