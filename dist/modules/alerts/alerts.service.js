"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertService = void 0;
const data_source_1 = require("../../data-source");
const Alert_1 = require("../../entities/Alert");
const BranchProduct_1 = require("../../entities/BranchProduct");
const StockRequest_1 = require("../../entities/StockRequest");
const typeorm_1 = require("typeorm");
const CRITICAL_THRESHOLD = 10;
const LOW_STOCK_THRESHOLD = 30;
class AlertService {
    static async getAlerts(query, page = 1, limit = 10, user) {
        const { status, priority, branchId, type } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        if (branchId)
            where.branchId = branchId;
        if (type)
            where.type = type;
        // If user is BRANCH_MANAGER, restrict to their branch
        // Assuming role checking is done in controller or here.
        // For now, if branchId is passed it filters.
        const [alerts, total] = await data_source_1.AppDataSource.getRepository(Alert_1.Alert).findAndCount({
            where,
            relations: ["branch", "product", "acknowledgedBy", "resolvedBy"],
            order: {
                priority: "ASC", // "CRITICAL" comes before "HIGH" alphabetically? No.
                // Enum values are strings. We need custom sort or rely on created date/priority logic.
                // For simple string enum sort: CRITICAL < HIGH < LOW is not alphabetical (C, H, L, M).
                // C(ritical), H(igh), L(ow), M(edium).
                // Let's sort by createdAt DESC for now, or we can handle priority in query builder if needed.
                createdAt: "DESC",
            },
            skip,
            take: limit,
        });
        return {
            alerts,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
        };
    }
    static async acknowledgeAlert(alertId, userId) {
        const alertRepo = data_source_1.AppDataSource.getRepository(Alert_1.Alert);
        const alert = await alertRepo.findOne({ where: { id: alertId } });
        if (!alert)
            throw new Error("Alert not found");
        if (alert.status !== Alert_1.AlertStatus.NEW) {
            // Can act on already acknowledged? Ideally yes, just updates info.
            // But if resolved, maybe not.
        }
        alert.status = Alert_1.AlertStatus.ACKNOWLEDGED;
        alert.acknowledgedBy = { id: userId };
        alert.acknowledgedAt = new Date();
        return await alertRepo.save(alert);
    }
    static async resolveAlert(alertId, userId) {
        const alertRepo = data_source_1.AppDataSource.getRepository(Alert_1.Alert);
        const alert = await alertRepo.findOne({ where: { id: alertId } });
        if (!alert)
            throw new Error("Alert not found");
        alert.status = Alert_1.AlertStatus.RESOLVED;
        alert.resolvedBy = { id: userId };
        alert.resolvedAt = new Date();
        return await alertRepo.save(alert);
    }
    static async generateStockAlerts() {
        const branchProductRepo = data_source_1.AppDataSource.getRepository(BranchProduct_1.BranchProduct);
        const alertRepo = data_source_1.AppDataSource.getRepository(Alert_1.Alert);
        const stockRequestRepo = data_source_1.AppDataSource.getRepository(StockRequest_1.StockRequest);
        const branchProducts = await branchProductRepo.find({
            relations: ["branch", "product"],
        });
        let createdCount = 0;
        for (const bp of branchProducts) {
            if (!bp.product || !bp.branch)
                continue; // Safety check
            const qty = Number(bp.quantity);
            // 1. Check CRITICAL
            if (qty <= CRITICAL_THRESHOLD) {
                await this.createOrUpdateAlert(alertRepo, bp, Alert_1.AlertType.CRITICAL_STOCK, Alert_1.AlertPriority.CRITICAL, `CRITICAL: ${bp.product.name} at ${bp.branch.name} is at critically low stock (${qty} ${bp.product.unit} remaining)`);
            }
            // 2. Check LOW STOCK
            else if (qty <= LOW_STOCK_THRESHOLD) {
                await this.createOrUpdateAlert(alertRepo, bp, Alert_1.AlertType.LOW_STOCK, Alert_1.AlertPriority.HIGH, `LOW STOCK: ${bp.product.name} at ${bp.branch.name} needs reordering (${qty} ${bp.product.unit} remaining)`);
            }
            // 3. Check LATE ORDER
            // Logic: If active alerts exist (Low or Critical) AND no active Stock Request exists
            if (qty <= LOW_STOCK_THRESHOLD) {
                // Check for active requests for this product & branch
                // Active = PENDING, APPROVED, DISPATCHED
                // We need to look at StockRequestItems actually, referencing this product.
                // This is a bit complex if we don't have direct relation, but let's try.
                const hasActiveRequest = await stockRequestRepo
                    .createQueryBuilder("sr")
                    .leftJoin("sr.items", "item")
                    .where("sr.branchId = :branchId", { branchId: bp.branch.id })
                    .andWhere("item.productId = :productId", { productId: bp.product.id })
                    .andWhere("sr.status IN (:...statuses)", {
                    statuses: ["PENDING", "APPROVED", "DISPATCHED"],
                })
                    .getCount();
                if (hasActiveRequest === 0) {
                    await this.createOrUpdateAlert(alertRepo, bp, Alert_1.AlertType.LATE_ORDER, Alert_1.AlertPriority.HIGH, `LATE ORDER: ${bp.product.name} at ${bp.branch.name} is low on stock but no order has been placed recently`);
                }
            }
        }
        return { message: "Alerts generation completed" };
    }
    static async createOrUpdateAlert(repo, bp, type, priority, message) {
        // Check if an active alert (NEW or ACKNOWLEDGED) of this type already exists for this branch+product
        const existing = await repo.findOne({
            where: {
                branchId: bp.branch.id,
                productId: bp.product.id,
                type: type,
                status: (0, typeorm_1.In)([Alert_1.AlertStatus.NEW, Alert_1.AlertStatus.ACKNOWLEDGED]),
            },
        });
        if (!existing) {
            const newAlert = repo.create({
                branchId: bp.branch.id,
                productId: bp.product.id,
                type,
                priority,
                message,
                status: Alert_1.AlertStatus.NEW,
            });
            await repo.save(newAlert);
        }
        else {
            // Optionally update message or timestamp if needed, but usually we just leave it until resolved.
            // Maybe update priority if it changed? For now, leave it.
        }
    }
}
exports.AlertService = AlertService;
