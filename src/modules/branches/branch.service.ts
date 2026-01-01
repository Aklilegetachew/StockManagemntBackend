// src/modules/branches/branch.service.ts
import { AppDataSource } from "../../data-source"
import { Branch } from "../../entities/branches"
import { BranchProduct } from "../../entities/BranchProduct"
import { Product } from "../../entities/Product"
import { AppError } from "../../errors/AppError"
import { RoleCode } from "../../entities/role"

export class BranchService {
  static branchRepo = AppDataSource.getRepository(Branch)
  static branchProductRepo = AppDataSource.getRepository(BranchProduct)

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

  static async getBranchStock(branchId: string) {
    const branch = await this.branchRepo.findOneBy({ id: branchId })
    if (!branch) throw new AppError("Branch not found", 404)

    const stocks = await this.branchProductRepo.find({
      where: { branch: { id: branchId } },
      relations: ["product"],
    })

    return {
      branch: {
        id: branch.id,
        name: branch.name,
        location: branch.location,
      },
      products: stocks.map((s) => ({
        productId: s.product.id,
        name: s.product.name,
        sku: s.product.sku,
        unit: s.product.unit,
        quantity: Number(s.quantity),
        price: Number(s.price),
      })),
    }
  }

  static async getBranchStockSummary() {
    const summary = await this.branchRepo
      .createQueryBuilder("branch")
      .leftJoin("branch.products", "bp")
      .select("branch.id", "branchId")
      .addSelect("branch.name", "branchName")
      .addSelect("COUNT(bp.id)", "totalProducts")
      .addSelect("SUM(bp.quantity)", "totalQuantity")
      .where("branch.isActive = :isActive", { isActive: true })
      .groupBy("branch.id")
      .getRawMany()

    return summary.map((s) => ({
      branchId: s.branchId,
      branchName: s.branchName,
      totalProducts: Number(s.totalProducts),
      totalQuantity: Number(s.totalQuantity || 0),
    }))
  }
}
