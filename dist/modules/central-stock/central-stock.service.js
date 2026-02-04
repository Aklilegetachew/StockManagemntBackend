"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CentralStockService = void 0;
// src/modules/central-stock/central-stock.service.ts
const typeorm_1 = require("typeorm");
const data_source_1 = require("../../data-source");
const CentralStock_1 = require("../../entities/CentralStock");
const Product_1 = require("../../entities/Product");
const StockMovement_1 = require("../../entities/StockMovement");
const user_1 = require("../../entities/user");
const AppError_1 = require("../../errors/AppError");
const helperFunction_1 = require("../../utils/helperFunction");
class CentralStockService {
    /**
     * Add material to central stock
     * @param productId - Product being added
     * @param quantity - Quantity to add (must be >0)
     * @param note - Optional note (e.g., "purchase", "correction")
     * @param approvedById - Optional user who performed the addition
     */
    static async addStock(productId, reference, quantity, note, approvedById) {
        if (quantity <= 0)
            throw new AppError_1.AppError("Quantity must be greater than zero", 400);
        const product = await this.productRepo.findOneBy({
            id: productId,
            isActive: true,
        });
        if (!product)
            throw new AppError_1.AppError("Product not found", 404);
        // Fetch approver user if provided
        let approvedBy;
        if (approvedById) {
            const user = await this.userRepo.findOneBy({ id: approvedById });
            if (user)
                approvedBy = user;
        }
        let centralStock = await this.centralStockRepo.findOne({
            where: { product: { id: productId } },
        });
        if (!centralStock) {
            // Create central stock entry if it doesn't exist yet
            centralStock = this.centralStockRepo.create({
                product,
                quantity,
            });
        }
        else {
            centralStock.quantity = (0, helperFunction_1.roundQty)(Number(centralStock.quantity) + Number(quantity));
        }
        if (note)
            centralStock.note = note;
        const savedCentralStock = await this.centralStockRepo.save(centralStock);
        await data_source_1.AppDataSource.getRepository(StockMovement_1.StockMovement).save({
            product: product,
            type: StockMovement_1.StockMovementType.ADDITION,
            quantity: quantity,
            reference: reference,
            note: note,
            approvedBy: approvedBy,
        });
        return savedCentralStock;
    }
    static async updateCentralStock(productId, reference, quantity, note, approvedById) {
        if (quantity <= 0)
            throw new AppError_1.AppError("Quantity must be greater than zero", 400);
        const product = await this.productRepo.findOneBy({
            id: productId,
            isActive: true,
        });
        if (!product)
            throw new AppError_1.AppError("Product not found", 404);
        // Fetch approver user if provided
        let approvedBy;
        if (approvedById) {
            const user = await this.userRepo.findOneBy({ id: approvedById });
            if (user)
                approvedBy = user;
        }
        let centralStock = await this.centralStockRepo.findOne({
            where: { product: { id: productId } },
        });
        if (!centralStock) {
            // Create central stock entry if it doesn't exist yet
            centralStock = this.centralStockRepo.create({
                product,
                quantity,
            });
        }
        else {
            centralStock.quantity = (0, helperFunction_1.roundQty)(Number(centralStock.quantity) + Number(quantity));
        }
        if (note)
            centralStock.note = note;
        const savedCentralStock = await this.centralStockRepo.save(centralStock);
        await data_source_1.AppDataSource.getRepository(StockMovement_1.StockMovement).save({
            product: product,
            type: StockMovement_1.StockMovementType.ADDITION,
            quantity: quantity,
            reference: reference,
            note: note,
            approvedBy: approvedBy,
        });
        return savedCentralStock;
    }
    static async getCentralStock() {
        const summary = await this.centralStockRepo.find({
            select: {
                product: {
                    id: true,
                    name: true,
                },
                id: true,
                quantity: true,
            },
        });
        return summary;
    }
    static async getCentralStockMovementsSummary(productId) {
        const repo = data_source_1.AppDataSource.getRepository(StockMovement_1.StockMovement);
        return repo.find({
            where: {
                product: { id: productId },
                branch: (0, typeorm_1.IsNull)(),
            },
            order: {
                createdAt: "DESC",
            },
        });
    }
}
exports.CentralStockService = CentralStockService;
CentralStockService.centralStockRepo = data_source_1.AppDataSource.getRepository(CentralStock_1.CentralStock);
CentralStockService.productRepo = data_source_1.AppDataSource.getRepository(Product_1.Product);
CentralStockService.userRepo = data_source_1.AppDataSource.getRepository(user_1.User);
