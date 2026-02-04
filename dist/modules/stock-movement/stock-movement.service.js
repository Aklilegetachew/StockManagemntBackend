"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockMovementService = void 0;
// src/modules/stock-movement/stock-movement.service.ts
const data_source_1 = require("../../data-source");
const StockMovement_1 = require("../../entities/StockMovement");
const AppError_1 = require("../../errors/AppError");
class StockMovementService {
    /**
     * Get stock movement summary
     * @param productId - filter by product
     * @param branchId - optional, null for central stock
     * @param fromDate - optional
     * @param toDate - optional
     */
    static async getStockSummary(productId, branchId, fromDate, toDate) {
        const query = this.stockMovementRepo
            .createQueryBuilder("sm")
            .where("sm.productId = :productId", { productId });
        if (branchId) {
            query.andWhere("sm.branchId = :branchId", { branchId });
        }
        else {
            query.andWhere("sm.branchId IS NULL");
        }
        if (fromDate) {
            query.andWhere("sm.createdAt >= :fromDate", { fromDate });
        }
        if (toDate) {
            query.andWhere("sm.createdAt <= :toDate", { toDate });
        }
        query.orderBy("sm.createdAt", "ASC");
        const movements = await query.getMany();
        if (!movements.length)
            throw new AppError_1.AppError("No stock movement found", 404);
        return movements;
    }
    static async getBranchProductSummary(productId, branchId) {
        const query = this.stockMovementRepo
            .createQueryBuilder("sm")
            .where("sm.productId = :productId", { productId })
            .andWhere("sm.branchId = :branchId", { branchId });
        const movements = await query.getMany();
        if (!movements.length)
            throw new AppError_1.AppError("No stock movement found", 404);
        return movements;
    }
}
exports.StockMovementService = StockMovementService;
StockMovementService.stockMovementRepo = data_source_1.AppDataSource.getRepository(StockMovement_1.StockMovement);
