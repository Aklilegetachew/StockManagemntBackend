import { AppDataSource } from "../../data-source"
import { StockRequest, StockRequestStatus } from "../../entities/StockRequest"
import { StockRequestItem } from "../../entities/StockRequestItem"
import { BranchProduct } from "../../entities/BranchProduct"
import { CentralStock } from "../../entities/CentralStock"
import { AppError } from "../../errors/AppError"
import { Branch } from "../../entities/branches"
import { Product } from "../../entities/Product"
import { User } from "../../entities/user"
import { StockMovement, StockMovementType } from "../../entities/StockMovement"

export class StockRequestService {
  static stockRequestRepo = AppDataSource.getRepository(StockRequest)
  static stockRequestItemRepo = AppDataSource.getRepository(StockRequestItem)
  static branchProductRepo = AppDataSource.getRepository(BranchProduct)
  static centralStockRepo = AppDataSource.getRepository(CentralStock)
  static branchRepo = AppDataSource.getRepository(Branch)
  static productRepo = AppDataSource.getRepository(Product)
  static userRepo = AppDataSource.getRepository(User)

  // Branch creates multi-product stock request
  static async createRequest(
    branchId: string,
    userId: string,
    items: { productId: string; quantity: number }[]
  ) {
    if (!items.length)
      throw new AppError("At least one product is required", 400)

    const branch = await this.branchRepo.findOneBy({
      id: branchId,
      isActive: true,
    })
    if (!branch) throw new AppError("Branch not found", 404)

    const user = await this.userRepo.findOneBy({ id: userId })
    if (!user) throw new AppError("User not found", 404)

    const stockRequestItems: StockRequestItem[] = []
    for (const item of items) {
      if (item.quantity <= 0)
        throw new AppError("Requested quantity must be greater than zero", 400)

      const product = await this.productRepo.findOneBy({
        id: item.productId,
        isActive: true,
      })
      if (!product)
        throw new AppError(`Product not found: ${item.productId}`, 404)

      stockRequestItems.push(
        this.stockRequestItemRepo.create({
          product,
          requestedQuantity: item.quantity,
        })
      )
    }

    const stockRequest = this.stockRequestRepo.create({
      branch,
      requestedBy: user,
      items: stockRequestItems,
      status: StockRequestStatus.PENDING,
    })

    return this.stockRequestRepo.save(stockRequest)
  }

  // Central approves request (can be partial)
  static async approveRequest(
    requestId: string,
    approvedItems: { itemId: string; approvedQuantity: number }[],
    note?: string
  ) {
    const request = await this.stockRequestRepo.findOne({
      where: { id: requestId },
      relations: ["items"],
    })
    if (!request) throw new AppError("Stock request not found", 404)
    if (request.status !== StockRequestStatus.PENDING)
      throw new AppError("Only pending requests can be approved", 400)

    for (const approvedItem of approvedItems) {
      const item = request.items.find((i) => i.id === approvedItem.itemId)
      if (!item)
        throw new AppError(`Item not found: ${approvedItem.itemId}`, 404)
      if (
        approvedItem.approvedQuantity < 0 ||
        approvedItem.approvedQuantity > item.requestedQuantity
      )
        throw new AppError(
          "Approved quantity must be between 0 and requested quantity",
          400
        )

      item.approvedQuantity = approvedItem.approvedQuantity
    }

    request.status = StockRequestStatus.APPROVED
    request.approvedAt = new Date()
    request.note = note

    return this.stockRequestRepo.save(request)
  }

  // Dispatch only approved quantities with transaction
  static async dispatchRequest(requestId: string) {
    return await AppDataSource.transaction(async (manager) => {
      const request = await manager.getRepository(StockRequest).findOne({
        where: { id: requestId },
        relations: ["items", "branch"],
      })
      if (!request) throw new AppError("Stock request not found", 404)
      if (request.status !== StockRequestStatus.APPROVED)
        throw new AppError("Only approved requests can be dispatched", 400)

      for (const item of request.items) {
        const centralStock = await manager.getRepository(CentralStock).findOne({
          where: { product: { id: item.product.id } },
        })
        if (!centralStock || item.approvedQuantity! > centralStock.quantity)
          throw new AppError(
            `Insufficient stock for product: ${item.product.name}`,
            400
          )

        centralStock.quantity -= item.approvedQuantity!
        await manager.getRepository(CentralStock).save(centralStock)

        await manager.getRepository(StockMovement).save({
          product: item.product,
          type: StockMovementType.DEDUCTION,
          quantity: item.approvedQuantity!,
          reference: request.id,
          note: `Dispatched to ${request.branch.name}`,
        })
      }

      request.status = StockRequestStatus.DISPATCHED
      request.dispatchedAt = new Date()
      return manager.getRepository(StockRequest).save(request)
    })
  }

  // Branch receives dispatched stock with transaction
  static async receiveStock(requestId: string) {
    return await AppDataSource.transaction(async (manager) => {
      const request = await manager.getRepository(StockRequest).findOne({
        where: { id: requestId },
        relations: ["items", "branch"],
      })
      if (!request) throw new AppError("Stock request not found", 404)
      if (request.status !== StockRequestStatus.DISPATCHED)
        throw new AppError("Only dispatched requests can be received", 400)

      for (const item of request.items) {
        let branchProduct = await manager.getRepository(BranchProduct).findOne({
          where: {
            branch: { id: request.branch.id },
            product: { id: item.product.id },
          },
        })

        if (!branchProduct) {
          branchProduct = manager.getRepository(BranchProduct).create({
            branch: request.branch,
            product: item.product,
            quantity: item.approvedQuantity!,
          })
        } else {
          branchProduct.quantity += item.approvedQuantity!
        }
        await manager.getRepository(BranchProduct).save(branchProduct)

        await manager.getRepository(StockMovement).save({
          product: item.product,
          branch: request.branch,
          type: StockMovementType.ADDITION,
          quantity: item.approvedQuantity!,
          reference: request.id,
          note: `Received from central`,
        })
      }

      request.status = StockRequestStatus.RECEIVED
      request.receivedAt = new Date()
      return manager.getRepository(StockRequest).save(request)
    })
  }
}
