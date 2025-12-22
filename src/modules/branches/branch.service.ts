// src/modules/branches/branch.service.ts
import { AppDataSource } from "../../data-source"
import { Branch } from "../../entities/branches"
import { AppError } from "../../errors/AppError"
import { RoleCode } from "../../entities/role"

export class BranchService {
  static branchRepo = AppDataSource.getRepository(Branch)

  static async createBranch(data: { name: string; location?: string }) {
    const exists = await this.branchRepo.findOneBy({ name: data.name })
    if (exists) throw new AppError("Branch already exists", 409)

    const branch = this.branchRepo.create(data)
    return this.branchRepo.save(branch)
  }

  static async getBranches() {
    return this.branchRepo.find({ where: { isActive: true } })
  }

  static async getMyBranch(user: any) {
    if (user.role !== RoleCode.BRANCH_MANAGER) {
      throw new AppError("Not a branch manager", 403)
    }

    if (!user.branchId) {
      throw new AppError("Branch not assigned", 400)
    }

    const branch = await this.branchRepo.findOneBy({
      id: user.branchId,
      isActive: true,
    })

    if (!branch) throw new AppError("Branch not found", 404)
    return branch
  }

  static async updateBranch(
    id: string,
    data: Partial<{ name: string; location: string }>
  ) {
    const branch = await this.branchRepo.findOneBy({ id })
    if (!branch) throw new AppError("Branch not found", 404)

    Object.assign(branch, data)
    return this.branchRepo.save(branch)
  }

  static async deactivateBranch(id: string) {
    const branch = await this.branchRepo.findOneBy({ id })
    if (!branch) throw new AppError("Branch not found", 404)

    branch.isActive = false
    await this.branchRepo.save(branch)
  }
}
