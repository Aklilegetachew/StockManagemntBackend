// src/modules/central-stock/central-stock.service.ts
import { IsNull } from "typeorm"
import { AppDataSource } from "../../data-source"
import { CentralStock } from "../../entities/CentralStock"
import { Product } from "../../entities/Product"
import { StockMovement, StockMovementType } from "../../entities/StockMovement"
import { AppError } from "../../errors/AppError"
import { roundQty } from "../../utils/helperFunction"

export class CentralStockService {
  static centralStockRepo = AppDataSource.getRepository(CentralStock)
  static productRepo = AppDataSource.getRepository(Product)

  /**
   * Add material to central stock
   * @param productId - Product being added
   * @param quantity - Quantity to add (must be >0)
   * @param note - Optional note (e.g., "purchase", "correction")
   */
  static async addStock(
    productId: string,
    reference: string,
    quantity: number,
    note?: string
  ) {
    if (quantity <= 0)
      throw new AppError("Quantity must be greater than zero", 400)

    const product = await this.productRepo.findOneBy({
      id: productId,
      isActive: true,
    })
    if (!product) throw new AppError("Product not found", 404)

    let centralStock = await this.centralStockRepo.findOne({
      where: { product: { id: productId } },
    })

    if (!centralStock) {
      // Create central stock entry if it doesn't exist yet
      centralStock = this.centralStockRepo.create({
        product,
        quantity,
      })
    } else {
      centralStock.quantity = roundQty(
        Number(centralStock.quantity) + Number(quantity)
      )
    }

    if (note) (centralStock as any).note = note

    const savedCentralStock = await this.centralStockRepo.save(centralStock)
    await AppDataSource.getRepository(StockMovement).save({
      product: product,
      type: StockMovementType.ADDITION,
      quantity: quantity,
      reference: reference,
      note: note,
    })
    return savedCentralStock
  }

  static async updateCentralStock(
    productId: string,
    reference: string,
    quantity: number,
    note?: string
  ) {
    if (quantity <= 0)
      throw new AppError("Quantity must be greater than zero", 400)

    const product = await this.productRepo.findOneBy({
      id: productId,
      isActive: true,
    })
    if (!product) throw new AppError("Product not found", 404)

    let centralStock = await this.centralStockRepo.findOne({
      where: { product: { id: productId } },
    })

    if (!centralStock) {
      // Create central stock entry if it doesn't exist yet
      centralStock = this.centralStockRepo.create({
        product,
        quantity,
      })
    } else {
      centralStock.quantity = roundQty(
        Number(centralStock.quantity) + Number(quantity)
      )
    }

    if (note) (centralStock as any).note = note

    const savedCentralStock = await this.centralStockRepo.save(centralStock)
    await AppDataSource.getRepository(StockMovement).save({
      product: product,
      type: StockMovementType.ADDITION,
      quantity: quantity,
      reference: reference,
      note: note,
    })
    return savedCentralStock
  }

  static async getCentralStock() {
    const summary = await this.centralStockRepo.find({
      select: {
        product: {
          id: true,
          name: true,
        },
        id:true,
        quantity: true,
      },
    })
    return summary
  }
  static async getCentralStockMovementsSummary(productId: string) {
    const repo = AppDataSource.getRepository(StockMovement)

    return repo.find({
      where: {
        product: { id: productId },
        branch: IsNull(),
      },
      order: {
        createdAt: "DESC",
      },
    })
  }
}
