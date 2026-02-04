"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const data_source_1 = require("../../data-source");
const BranchProduct_1 = require("../../entities/BranchProduct");
const CentralStock_1 = require("../../entities/CentralStock");
const Product_1 = require("../../entities/Product");
const StockRequest_1 = require("../../entities/StockRequest");
const StockMovement_1 = require("../../entities/StockMovement");
const LOW_STOCK_THRESHOLD = 0.2; // 20%
const LOW_STOCK_MIN = 20; // Minimum quantity threshold
class AnalyticsService {
    // ==================== INVENTORY HEALTH ====================
    static async getLowStockByBranch() {
        const lowStockItems = await data_source_1.AppDataSource.getRepository(BranchProduct_1.BranchProduct)
            .createQueryBuilder("bp")
            .leftJoinAndSelect("bp.product", "product")
            .leftJoinAndSelect("bp.branch", "branch")
            .where("bp.quantity < :threshold", { threshold: LOW_STOCK_MIN })
            .andWhere("product.isActive = :isActive", { isActive: true })
            .orderBy("bp.quantity", "ASC")
            .getMany();
        // Group by branch
        const groupedByBranch = lowStockItems.reduce((acc, item) => {
            const branchName = item.branch.name;
            if (!acc[branchName]) {
                acc[branchName] = {
                    branchId: item.branch.id,
                    branchName: branchName,
                    lowStockProducts: [],
                };
            }
            acc[branchName].lowStockProducts.push({
                productId: item.product.id,
                productName: item.product.name,
                sku: item.product.sku,
                currentQuantity: Number(item.quantity),
                unit: item.product.unit,
            });
            return acc;
        }, {});
        return {
            totalLowStockItems: lowStockItems.length,
            branches: Object.values(groupedByBranch),
        };
    }
    static async getCentralStockHealth() {
        const centralStocks = await data_source_1.AppDataSource.getRepository(CentralStock_1.CentralStock)
            .createQueryBuilder("cs")
            .leftJoinAndSelect("cs.product", "product")
            .where("product.isActive = :isActive", { isActive: true })
            .getMany();
        const lowStock = centralStocks.filter((cs) => Number(cs.quantity) < LOW_STOCK_MIN);
        const outOfStock = centralStocks.filter((cs) => Number(cs.quantity) === 0);
        const healthy = centralStocks.filter((cs) => Number(cs.quantity) >= LOW_STOCK_MIN);
        return {
            total: centralStocks.length,
            healthy: healthy.length,
            lowStock: lowStock.length,
            outOfStock: outOfStock.length,
            lowStockItems: lowStock.map((cs) => ({
                productId: cs.product.id,
                productName: cs.product.name,
                sku: cs.product.sku,
                quantity: Number(cs.quantity),
            })),
        };
    }
    static async getPendingRequests() {
        const pendingCount = await data_source_1.AppDataSource.getRepository(StockRequest_1.StockRequest)
            .createQueryBuilder("sr")
            .where("sr.status = :status", { status: "PENDING" })
            .getCount();
        const pendingRequests = await data_source_1.AppDataSource.getRepository(StockRequest_1.StockRequest)
            .createQueryBuilder("sr")
            .leftJoinAndSelect("sr.branch", "branch")
            .leftJoinAndSelect("sr.requestedBy", "user")
            .where("sr.status = :status", { status: "PENDING" })
            .orderBy("sr.createdAt", "DESC")
            .take(10)
            .getMany();
        return {
            totalPending: pendingCount,
            recentRequests: pendingRequests.map((req) => ({
                requestId: req.id,
                branchName: req.branch.name,
                requestedBy: req.requestedBy.fullName,
                createdAt: req.createdAt,
            })),
        };
    }
    static async getProductStatus() {
        const activeCount = await data_source_1.AppDataSource.getRepository(Product_1.Product)
            .createQueryBuilder("p")
            .where("p.isActive = :isActive", { isActive: true })
            .getCount();
        const inactiveCount = await data_source_1.AppDataSource.getRepository(Product_1.Product)
            .createQueryBuilder("p")
            .where("p.isActive = :isActive", { isActive: false })
            .getCount();
        return {
            active: activeCount,
            inactive: inactiveCount,
            total: activeCount + inactiveCount,
            activePercentage: ((activeCount / (activeCount + inactiveCount)) *
                100).toFixed(2),
        };
    }
    // ==================== PRODUCT MOVEMENT ====================
    static async getProductMovement() {
        const movements = await data_source_1.AppDataSource.getRepository(StockMovement_1.StockMovement)
            .createQueryBuilder("sm")
            .leftJoinAndSelect("sm.product", "product")
            .where("product.isActive = :isActive", { isActive: true })
            .getMany();
        // Count movements per product
        const productMovementCount = movements.reduce((acc, movement) => {
            const productId = movement.product.id;
            if (!acc[productId]) {
                acc[productId] = {
                    product: movement.product,
                    count: 0,
                    totalQuantity: 0,
                };
            }
            acc[productId].count++;
            acc[productId].totalQuantity += Number(movement.quantity);
            return acc;
        }, {});
        const sorted = Object.values(productMovementCount).sort((a, b) => b.count - a.count);
        return {
            highMoving: sorted.slice(0, 10).map((item) => ({
                productId: item.product.id,
                productName: item.product.name,
                sku: item.product.sku,
                movementCount: item.count,
                totalQuantityMoved: item.totalQuantity,
            })),
            slowMoving: sorted
                .slice(-10)
                .reverse()
                .map((item) => ({
                productId: item.product.id,
                productName: item.product.name,
                sku: item.product.sku,
                movementCount: item.count,
                totalQuantityMoved: item.totalQuantity,
            })),
        };
    }
    static async getBranchWiseMovement() {
        const movements = await data_source_1.AppDataSource.getRepository(StockMovement_1.StockMovement)
            .createQueryBuilder("sm")
            .leftJoinAndSelect("sm.branch", "branch")
            .leftJoinAndSelect("sm.product", "product")
            .where("branch.id IS NOT NULL")
            .getMany();
        const branchMovements = movements.reduce((acc, movement) => {
            const branchId = movement.branch?.id;
            if (!branchId)
                return acc;
            if (!acc[branchId]) {
                acc[branchId] = {
                    branchId: branchId,
                    branchName: movement.branch.name,
                    movementCount: 0,
                    totalQuantity: 0,
                };
            }
            acc[branchId].movementCount++;
            acc[branchId].totalQuantity += Number(movement.quantity);
            return acc;
        }, {});
        return {
            branches: Object.values(branchMovements).sort((a, b) => b.movementCount - a.movementCount),
        };
    }
    static async getProductAging() {
        const products = await data_source_1.AppDataSource.getRepository(Product_1.Product)
            .createQueryBuilder("p")
            .where("p.isActive = :isActive", { isActive: true })
            .getMany();
        const agingData = await Promise.all(products.map(async (product) => {
            const lastMovement = await data_source_1.AppDataSource.getRepository(StockMovement_1.StockMovement)
                .createQueryBuilder("sm")
                .where("sm.product.id = :productId", { productId: product.id })
                .orderBy("sm.createdAt", "DESC")
                .getOne();
            const daysSinceLastMovement = lastMovement
                ? Math.floor((Date.now() - lastMovement.createdAt.getTime()) /
                    (1000 * 60 * 60 * 24))
                : null;
            return {
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                lastMovementDate: lastMovement?.createdAt || null,
                daysSinceLastMovement,
            };
        }));
        return {
            products: agingData
                .filter((p) => p.daysSinceLastMovement !== null)
                .sort((a, b) => b.daysSinceLastMovement - a.daysSinceLastMovement),
        };
    }
    // ==================== BRANCH BEHAVIOR ====================
    static async getBranchRequestFrequency() {
        const requests = await data_source_1.AppDataSource.getRepository(StockRequest_1.StockRequest)
            .createQueryBuilder("sr")
            .leftJoinAndSelect("sr.branch", "branch")
            .getMany();
        const branchRequestCount = requests.reduce((acc, req) => {
            const branchId = req.branch.id;
            if (!acc[branchId]) {
                acc[branchId] = {
                    branchId: branchId,
                    branchName: req.branch.name,
                    requestCount: 0,
                };
            }
            acc[branchId].requestCount++;
            return acc;
        }, {});
        return {
            branches: Object.values(branchRequestCount).sort((a, b) => b.requestCount - a.requestCount),
        };
    }
    static async getStockHoldingDuration() {
        const branchProducts = await data_source_1.AppDataSource.getRepository(BranchProduct_1.BranchProduct)
            .createQueryBuilder("bp")
            .leftJoinAndSelect("bp.branch", "branch")
            .leftJoinAndSelect("bp.product", "product")
            .where("bp.quantity > 0")
            .getMany();
        const holdingData = await Promise.all(branchProducts.map(async (bp) => {
            const lastMovement = await data_source_1.AppDataSource.getRepository(StockMovement_1.StockMovement)
                .createQueryBuilder("sm")
                .where("sm.branch.id = :branchId", { branchId: bp.branch.id })
                .andWhere("sm.product.id = :productId", { productId: bp.product.id })
                .orderBy("sm.createdAt", "DESC")
                .getOne();
            const daysHeld = lastMovement
                ? Math.floor((Date.now() - lastMovement.createdAt.getTime()) /
                    (1000 * 60 * 60 * 24))
                : null;
            return {
                branchName: bp.branch.name,
                productName: bp.product.name,
                quantity: Number(bp.quantity),
                lastMovementDate: lastMovement?.createdAt || null,
                daysHeld,
            };
        }));
        return {
            items: holdingData
                .filter((item) => item.daysHeld !== null && item.daysHeld > 30)
                .sort((a, b) => b.daysHeld - a.daysHeld)
                .slice(0, 20),
        };
    }
    // ==================== REQUEST OPERATIONS ====================
    static async getRequestStatusBreakdown() {
        const statuses = ["PENDING", "APPROVED", "DISPATCHED", "RECEIVED"];
        const breakdown = await Promise.all(statuses.map(async (status) => {
            const count = await data_source_1.AppDataSource.getRepository(StockRequest_1.StockRequest)
                .createQueryBuilder("sr")
                .where("sr.status = :status", { status })
                .getCount();
            return { status, count };
        }));
        const total = breakdown.reduce((sum, item) => sum + item.count, 0);
        return {
            breakdown,
            total,
        };
    }
    static async getPartialApprovals() {
        const requests = await data_source_1.AppDataSource.getRepository(StockRequest_1.StockRequest)
            .createQueryBuilder("sr")
            .leftJoinAndSelect("sr.items", "items")
            .where("sr.status IN (:...statuses)", {
            statuses: ["APPROVED", "DISPATCHED", "RECEIVED"],
        })
            .getMany();
        const partialApprovals = requests.filter((req) => {
            return req.items.some((item) => item.approvedQuantity &&
                item.approvedQuantity < item.requestedQuantity);
        });
        return {
            totalPartialApprovals: partialApprovals.length,
            totalRequests: requests.length,
            percentage: ((partialApprovals.length / requests.length) * 100).toFixed(2),
        };
    }
    static async getUserActivity() {
        const requests = await data_source_1.AppDataSource.getRepository(StockRequest_1.StockRequest)
            .createQueryBuilder("sr")
            .leftJoinAndSelect("sr.requestedBy", "user")
            .getMany();
        const userActivity = requests.reduce((acc, req) => {
            const userId = req.requestedBy.id;
            if (!acc[userId]) {
                acc[userId] = {
                    userId: userId,
                    userName: req.requestedBy.fullName,
                    requestCount: 0,
                };
            }
            acc[userId].requestCount++;
            return acc;
        }, {});
        return {
            users: Object.values(userActivity).sort((a, b) => b.requestCount - a.requestCount),
        };
    }
    // ==================== BRANCH SPECIFIC ====================
    static async getBranchOverview(branchId) {
        const branchProducts = await data_source_1.AppDataSource.getRepository(BranchProduct_1.BranchProduct)
            .createQueryBuilder("bp")
            .where("bp.branch.id = :branchId", { branchId })
            .getMany();
        const totalProducts = branchProducts.length;
        const lowStockCount = branchProducts.filter((bp) => Number(bp.quantity) <= LOW_STOCK_MIN).length;
        return {
            totalProducts,
            lowStockCount,
        };
    }
    static async getBranchLowStock(branchId) {
        const lowStockItems = await data_source_1.AppDataSource.getRepository(BranchProduct_1.BranchProduct)
            .createQueryBuilder("bp")
            .leftJoinAndSelect("bp.product", "product")
            .where("bp.branch.id = :branchId", { branchId })
            .andWhere("bp.quantity <= :threshold", { threshold: LOW_STOCK_MIN })
            .orderBy("bp.quantity", "ASC")
            .getMany();
        return {
            lowStockItems: lowStockItems.map((item) => ({
                productId: item.product.id,
                productName: item.product.name,
                sku: item.product.sku,
                quantity: Number(item.quantity),
            })),
        };
    }
    static async getBranchRecentDispatched(branchId) {
        // Determine recent dispatched:
        // We look for StockRequests that are DISPATCHED (or RECEIVED, as they were dispatched once)
        // Filter by branchId
        // Join with items and product
        // Sort by status change date? Usually dispatchedAt.
        // Note: StockRequest stores items.
        const requests = await data_source_1.AppDataSource.getRepository(StockRequest_1.StockRequest)
            .createQueryBuilder("sr")
            .leftJoinAndSelect("sr.items", "items")
            .leftJoinAndSelect("items.product", "product")
            .where("sr.branch.id = :branchId", { branchId })
            .andWhere("sr.status = :status", { status: "DISPATCHED" }) // Explicitly asking for DISPATCHED state or recently dispatched action?
            // User said "recent dispatched products". Usually this means items that are currently in transit (DISPATCHED status) OR items that were recently sent.
            // Let's assume currently DISPATCHED first, or maybe just last 5 dispatched requests.
            .orderBy("sr.updatedAt", "DESC") // Dispatched time usually updates row
            .take(5)
            .getMany();
        const recentDispatched = requests.flatMap((req) => req.items.map((item) => ({
            productName: item.product.name,
            quantity: Number(item.approvedQuantity || item.requestedQuantity), // Use approved if available
            dispatchedDate: req.updatedAt, // Approximate if dispatchedAt not set
            requestId: req.id,
        })));
        return {
            recentDispatched,
        };
    }
}
exports.AnalyticsService = AnalyticsService;
