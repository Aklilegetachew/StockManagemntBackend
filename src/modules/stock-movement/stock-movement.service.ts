// src/modules/stock-movement/stock-movement.service.ts
import { AppDataSource } from "../../data-source"
import { StockMovement } from "../../entities/StockMovement"
import { AppError } from "../../errors/AppError"

export class StockMovementService {
  static stockMovementRepo = AppDataSource.getRepository(StockMovement)

  /**
   * Get stock movement summary
   * @param productId - filter by product
   * @param branchId - optional, null for central stock
   * @param fromDate - optional
   * @param toDate - optional
   */
  static async getStockSummary(
    productId: string,
    branchId?: string,
    fromDate?: string,
    toDate?: string
  ) {
    const query = this.stockMovementRepo
      .createQueryBuilder("sm")
      .where("sm.productId = :productId", { productId })

    if (branchId) {
      query.andWhere("sm.branchId = :branchId", { branchId })
    } else {
      query.andWhere("sm.branchId IS NULL")
    }

    if (fromDate) {
      query.andWhere("sm.createdAt >= :fromDate", { fromDate })
    }
    if (toDate) {
      query.andWhere("sm.createdAt <= :toDate", { toDate })
    }

    query.orderBy("sm.createdAt", "ASC")

    const movements = await query.getMany()
    if (!movements.length) throw new AppError("No stock movement found", 404)

    return movements
  }

  static async getBranchProductSummary(productId: string, branchId: string) {
    const query = this.stockMovementRepo
      .createQueryBuilder("sm")
      .where("sm.productId = :productId", { productId })
      .andWhere("sm.branchId = :branchId", { branchId })

    const movements = await query.getMany()
    if (!movements.length) throw new AppError("No stock movement found", 404)

    return movements
  }
}
