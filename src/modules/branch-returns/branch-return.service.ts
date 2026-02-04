import { AppDataSource } from "../../data-source"
import { BranchReturn, BranchReturnStatus } from "../../entities/BranchReturn"
import { BranchReturnItem, ReturnReason } from "../../entities/BranchReturnItem"
import { CentralReturnedStock } from "../../entities/CentralReturnedStock"
import { BranchProduct } from "../../entities/BranchProduct"
import { StockMovement, StockMovementType } from "../../entities/StockMovement"
import { AppError } from "../../errors/AppError"
import { Branch } from "../../entities/branches"
import { Product } from "../../entities/Product"
import { User } from "../../entities/user"
import { roundQty } from "../../utils/helperFunction"

export class BranchReturnService {
  static branchReturnRepo = AppDataSource.getRepository(BranchReturn)
  static branchReturnItemRepo = AppDataSource.getRepository(BranchReturnItem)
  static centralReturnedStockRepo = AppDataSource.getRepository(CentralReturnedStock)
  static branchProductRepo = AppDataSource.getRepository(BranchProduct)
  static branchRepo = AppDataSource.getRepository(Branch)
  static productRepo = AppDataSource.getRepository(Product)
  static userRepo = AppDataSource.getRepository(User)

  static async createReturn(
    branchId: string,
    userId: string,
    items: { productId: string; quantity: number; reason: ReturnReason; note?: string }[]
  ) {
    if (!items.length)
      throw new AppError("At least one item is required", 400)

    const branch = await this.branchRepo.findOneBy({
      id: branchId,
      isActive: true,
    })
    if (!branch) throw new AppError("Branch not found", 404)

    const user = await this.userRepo.findOneBy({ id: userId })
    if (!user) throw new AppError("User not found", 404)

    const branchReturn = this.branchReturnRepo.create({
      branch,
      requestedBy: user,
      status: BranchReturnStatus.PENDING,
    })
    await this.branchReturnRepo.save(branchReturn)

    for (const item of items) {
      if (item.quantity <= 0)
        throw new AppError("Quantity must be greater than zero", 400)

      const product = await this.productRepo.findOneBy({
        id: item.productId,
        isActive: true,
      })
      if (!product)
        throw new AppError(`Product not found: ${item.productId}`, 404)

      const branchProduct = await this.branchProductRepo.findOne({
        where: {
          branch: { id: branchId },
          product: { id: item.productId },
        },
      })
      const availableQty = branchProduct ? Number(branchProduct.quantity) : 0
      if (item.quantity > availableQty)
        throw new AppError(
          `Insufficient stock for ${product.name}. Available: ${availableQty}`,
          400
        )

      const returnItem = this.branchReturnItemRepo.create({
        branchReturn,
        product,
        quantity: item.quantity,
        reason: item.reason,
        note: item.note,
      })
      await this.branchReturnItemRepo.save(returnItem)
    }

    return this.branchReturnRepo.findOneOrFail({
      where: { id: branchReturn.id },
      relations: ["items", "items.product", "branch", "requestedBy"],
    })
  }

  static async getSupervisorPendingReturns() {
    return await this.branchReturnRepo.find({
      where: { status: BranchReturnStatus.PENDING },
      relations: ["items", "items.product", "branch", "requestedBy"],
      order: { createdAt: "ASC" },
    })
  }

  static async approveReturn(returnId: string, approverId: string) {
    return await AppDataSource.transaction(async (manager) => {
      const branchReturnRepo = manager.getRepository(BranchReturn)
      const branchReturnItemRepo = manager.getRepository(BranchReturnItem)
      const branchProductRepo = manager.getRepository(BranchProduct)
      const movementRepo = manager.getRepository(StockMovement)
      const centralReturnedStockRepo = manager.getRepository(CentralReturnedStock)
      const userRepo = manager.getRepository(User)

      const branchReturn = await branchReturnRepo.findOne({
        where: { id: returnId },
        relations: ["items", "items.product", "branch", "requestedBy"],
      })

      if (!branchReturn) throw new AppError("Return request not found", 404)
      if (branchReturn.status !== BranchReturnStatus.PENDING)
        throw new AppError("Only pending returns can be approved", 409)

      const approver = await userRepo.findOneBy({ id: approverId })
      if (!approver) throw new AppError("Approver not found", 404)

      const branchId = branchReturn.branch.id

      for (const item of branchReturn.items) {
        const qty = Number(item.quantity)

        const branchProduct = await branchProductRepo.findOne({
          where: {
            branch: { id: branchId },
            product: { id: item.product.id },
          },
        })
        if (!branchProduct)
          throw new AppError(
            `Branch stock missing for product: ${item.product.name}`,
            400
          )

        const currentQty = Number(branchProduct.quantity)
        if (qty > currentQty)
          throw new AppError(
            `Insufficient stock for ${item.product.name}. Available: ${currentQty}`,
            400
          )

        branchProduct.quantity = roundQty(currentQty - qty)
        await branchProductRepo.save(branchProduct)

        const reasonLabel = item.reason
        await movementRepo.save({
          product: item.product,
          branch: branchReturn.branch,
          type: StockMovementType.DEDUCTION,
          quantity: qty,
          reference: branchReturn.id,
          note: `Returned to central - ${reasonLabel}`,
          requestedBy: branchReturn.requestedBy,
          approvedBy: approver,
        })

        const centralReturnedStock = centralReturnedStockRepo.create({
          product: item.product,
          quantity: qty,
          reason: reasonLabel,
          sourceBranch: branchReturn.branch,
          branchReturn,
        })
        await centralReturnedStockRepo.save(centralReturnedStock)
      }

      branchReturn.status = BranchReturnStatus.APPROVED
      branchReturn.approvedAt = new Date()
      branchReturn.approvedBy = approver

      return branchReturnRepo.save(branchReturn)
    })
  }

  static async rejectReturn(returnId: string, rejectionNote?: string) {
    const branchReturn = await this.branchReturnRepo.findOne({
      where: { id: returnId },
      relations: ["items", "items.product", "branch"],
    })

    if (!branchReturn) throw new AppError("Return request not found", 404)
    if (branchReturn.status !== BranchReturnStatus.PENDING)
      throw new AppError("Only pending returns can be rejected", 409)

    branchReturn.status = BranchReturnStatus.REJECTED
    branchReturn.rejectedAt = new Date()
    branchReturn.rejectionNote = rejectionNote ?? null

    return this.branchReturnRepo.save(branchReturn)
  }

  static async getMyBranchReturns(branchId: string) {
    return await this.branchReturnRepo.find({
      where: { branch: { id: branchId } },
      relations: ["items", "items.product", "branch", "requestedBy", "approvedBy"],
      order: { createdAt: "DESC" },
    })
  }

  static async getCentralReturnedStock() {
    return await this.centralReturnedStockRepo.find({
      relations: ["product", "sourceBranch", "branchReturn"],
      order: { createdAt: "DESC" },
    })
  }
}
