import { AppDataSource } from "../../data-source"
import { User } from "../../entities/user"
import { Role } from "../../entities/role"
import { Branch } from "../../entities/branches"
import { AppError } from "../../errors/AppError"
import { hashPassword, comparePassword } from "../../utils/password"
import { signToken } from "../../utils/jwt"
import { EmailService } from "../../utils/email"
import crypto from "crypto"

export class UserService {
  static userRepo = AppDataSource.getRepository(User)
  static roleRepo = AppDataSource.getRepository(Role)
  static branchRepo = AppDataSource.getRepository(Branch)

  static async signup(data: any) {
    const { fullName, email, username, password, roleCode, branchId } = data

    const exists = await this.userRepo.findOne({
      where: [{ email }, { username }],
    })

    if (exists) throw new AppError("User already exists", 409)

    const role = await this.roleRepo.findOneBy({ code: roleCode })
    if (!role) throw new AppError("Invalid role")

    let branch = null
    if (role.code === "BRANCH_MANAGER") {
      if (!branchId) throw new AppError("Branch is required")
      branch = await this.branchRepo.findOneBy({ id: branchId })
      if (!branch) throw new AppError("Branch not found")
    }

    const user = this.userRepo.create({
      fullName,
      email,
      username,
      passwordHash: await hashPassword(password),
      role,
      branch,
    })

    return this.userRepo.save(user)
  }

  static async login(data: any) {
    const { username, password } = data

    const user = await this.userRepo.findOne({
      where: { username },
    })

    if (!user) throw new AppError("Invalid credentials", 401)

    const isMatch = await comparePassword(password, user.passwordHash)
    if (!isMatch) throw new AppError("Invalid credentials", 401)

    const token = signToken({
      id: user.id,
      role: user.role.code,
      branchId: user.branch?.id,
    })

    return { token, user }
  }

  static async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } })
    if (!user) return

    // Generate token
    const token = crypto.randomBytes(32).toString("hex")

    // Set token & expiry (1 hour)
    user.resetPasswordToken = token
    user.resetPasswordExpires = new Date(Date.now() + 3600000)

    await this.userRepo.save(user)

    // Send email
    await EmailService.sendPasswordResetEmail(user.email, token)
  }

  static async resetPassword(token: string, newPassword: any) {
    const user = await this.userRepo.findOne({
      where: {
        resetPasswordToken: token,
      },
    })

    if (
      !user ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new AppError("Invalid or expired token", 400)
    }

    user.passwordHash = await hashPassword(newPassword)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    await this.userRepo.save(user)
  }

  static async editUser(userId: string, data: any) {
    const user = await this.userRepo.findOneBy({ id: userId })
    if (!user) throw new AppError("User not found", 404)

    Object.assign(user, data)
    return this.userRepo.save(user)
  }

  static async deleteUser(userId: string) {
    const user = await this.userRepo.findOneBy({ id: userId })
    if (!user) throw new AppError("User not found", 404)

    await this.userRepo.remove(user)
  }
}
