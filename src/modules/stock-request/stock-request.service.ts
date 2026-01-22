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
import { roundQty } from "../../utils/helperFunction"

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
    approvedItems: { productId: string; approvedQuantity: number }[],
    note?: string
  ) {
    const request = await this.stockRequestRepo.findOne({
      where: { id: requestId },
      relations: ["items", "items.product"],
    })

    if (!request) {
      throw new AppError("Stock request not found", 404)
    }

    if (request.status !== StockRequestStatus.PENDING) {
      throw new AppError("Only pending requests can be approved", 409)
    }

    if (!Array.isArray(request.items)) {
      throw new AppError("Stock request items are corrupted", 500)
    }

    // Map for O(1) lookup
    const requestItemMap = new Map(
      request.items.map((item) => [item.product.id, item])
    )

    for (const approvedItem of approvedItems) {
      const item = requestItemMap.get(approvedItem.productId)

      if (!item) {
        throw new AppError(
          `Product ${approvedItem.productId} is not part of this request`,
          404
        )
      }

      if (approvedItem.approvedQuantity < 0) {
        throw new AppError(
          `Approved quantity cannot be negative (${item.product.name})`,
          400
        )
      }

      if (approvedItem.approvedQuantity > item.requestedQuantity) {
        throw new AppError(
          `Approved quantity exceeds requested quantity for ${item.product.name}`,
          400
        )
      }

      // Check if central stock has enough quantity
      if (approvedItem.approvedQuantity > 0) {
        const centralStock = await this.centralStockRepo.findOne({
          where: { product: { id: item.product.id } },
        })

        const availableQty = centralStock ? Number(centralStock.quantity) : 0

        if (approvedItem.approvedQuantity > availableQty) {
          throw new AppError(
            `Insufficient central stock for ${item.product.name}. Available: ${availableQty}, Requested: ${approvedItem.approvedQuantity}`,
            400
          )
        }
      }

      item.approvedQuantity = approvedItem.approvedQuantity
    }

    // Determine final status
    const fullyApproved = request.items.every(
      (i) => i.approvedQuantity === i.requestedQuantity
    )

    request.status = StockRequestStatus.APPROVED

    request.approvedAt = new Date()
    request.note = note ?? ""

    return this.stockRequestRepo.save(request)
  }

  // Dispatch only approved quantities with transaction
  static async dispatchRequest(requestId: string, dispatcherId?: string) {
    return await AppDataSource.transaction(async (manager) => {
      const requestRepo = manager.getRepository(StockRequest)
      const centralStockRepo = manager.getRepository(CentralStock)
      const movementRepo = manager.getRepository(StockMovement)
      const userRepo = manager.getRepository(User)

      const request = await requestRepo.findOne({
        where: { id: requestId },
        relations: ["items", "items.product", "branch", "requestedBy"],
      })

      if (!request) throw new AppError("Stock request not found", 404)
      if (request.status !== StockRequestStatus.APPROVED)
        throw new AppError("Only approved requests can be dispatched", 400)

      // Fetch dispatcher user if provided
      let approvedBy: User | undefined
      if (dispatcherId) {
        const user = await userRepo.findOneBy({ id: dispatcherId })
        if (user) approvedBy = user
      }

      for (const item of request.items) {
        const approvedQty = Number(item.approvedQuantity ?? 0)

        if (approvedQty <= 0) continue

        const centralStock = await centralStockRepo.findOne({
          where: { product: { id: item.product.id } },
        })

        if (!centralStock)
          throw new AppError(
            `Central stock missing for product: ${item.product.name}`,
            400
          )

        const currentQty = Number(centralStock.quantity)

        if (approvedQty > currentQty)
          throw new AppError(
            `Insufficient stock for product: ${item.product.name}`,
            400
          )

        centralStock.quantity = roundQty(currentQty - approvedQty)
        await centralStockRepo.save(centralStock)

        await movementRepo.save({
          product: item.product,
          type: StockMovementType.DEDUCTION,
          quantity: approvedQty,
          reference: request.id,
          note: `Dispatched to ${request.branch.name}`,
          requestedBy: request.requestedBy,
          approvedBy: approvedBy,
        })
      }

      request.status = StockRequestStatus.DISPATCHED
      request.dispatchedAt = new Date()

      return requestRepo.save(request)
    })
  }

  static async receiveStock(requestId: string) {
    return await AppDataSource.transaction(async (manager) => {
      const requestRepo = manager.getRepository(StockRequest)
      const branchProductRepo = manager.getRepository(BranchProduct)
      const movementRepo = manager.getRepository(StockMovement)

      const request = await requestRepo.findOne({
        where: { id: requestId },
        relations: ["items", "items.product", "branch", "requestedBy"],
      })

      if (!request) throw new AppError("Stock request not found", 404)
      if (request.status !== StockRequestStatus.DISPATCHED)
        throw new AppError("Only dispatched requests can be received", 400)

      for (const item of request.items) {
        const approvedQty = Number(item.approvedQuantity ?? 0)

        if (approvedQty <= 0) continue // skip safely

        let branchProduct = await branchProductRepo.findOne({
          where: {
            branch: { id: request.branch.id },
            product: { id: item.product.id },
          },
        })

        if (!branchProduct) {
          branchProduct = branchProductRepo.create({
            branch: request.branch,
            product: item.product,
            quantity: roundQty(approvedQty),
          })
        } else {
          const currentQty = Number(branchProduct.quantity)
          branchProduct.quantity = roundQty(currentQty + approvedQty)
        }

        await branchProductRepo.save(branchProduct)

        await movementRepo.save({
          product: item.product,
          branch: request.branch,
          type: StockMovementType.ADDITION,
          quantity: approvedQty,
          reference: request.id,
          note: "Received from central",
          requestedBy: request.requestedBy,
        })
      }

      request.status = StockRequestStatus.RECEIVED
      request.receivedAt = new Date()

      return requestRepo.save(request)
    })
  }

  static async editRequestBeforeApproval(
    requestId: string,
    items: { productId: string; quantity: number }[]
  ) {
    const request = await this.stockRequestRepo.findOne({
      where: { id: requestId },
      relations: ["items", "items.product", "branch"],
    })
    if (!request) throw new AppError("Stock request not found", 404)
    if (request.status !== StockRequestStatus.PENDING)
      throw new AppError("Only pending requests can be edited", 400)

    for (const item of items) {
      const requestItem = request.items.find(
        (i) => i.product.id === item.productId
      )
      if (!requestItem)
        throw new AppError(`Item not found: ${item.productId}`, 404)
      requestItem.requestedQuantity = item.quantity
    }

    return this.stockRequestRepo.save(request)
  }

  static async getMyBranchDispatchedRequests(branchId: string) {
    const requests = await this.stockRequestRepo.find({
      where: {
        branch: { id: branchId },
        status: StockRequestStatus.DISPATCHED,
      },
      relations: ["items", "branch", "requestedBy"],
    })
    return requests
  }

  static async getMyBranchReceivedRequests(branchId: string) {
    const requests = await this.stockRequestRepo.find({
      where: {
        branch: { id: branchId },
        status: StockRequestStatus.RECEIVED,
      },
      relations: ["items", "branch", "requestedBy"],
    })
    return requests
  }
}
