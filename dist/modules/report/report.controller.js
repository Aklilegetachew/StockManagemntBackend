"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const report_service_1 = require("./report.service");
const response_1 = require("../../utils/response");
class ReportController {
    /**
     * GET /reports/current-stock
     * Query params:
     *   - branchId: string (optional, omit for central stock)
     *   - productId: string (optional)
     *   - categoryId: string (optional)
     *   - lowStockOnly: boolean (optional, default: false)
     *   - lowStockThreshold: number (optional, default: 10)
     */
    static async getCurrentStock(req, res) {
        const { branchId, productId, categoryId, lowStockOnly, lowStockThreshold } = req.query;
        const report = await report_service_1.ReportService.getCurrentStock({
            branchId: branchId,
            productId: productId,
            categoryId: categoryId,
            lowStockOnly: lowStockOnly === "true",
            lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : undefined,
        });
        return (0, response_1.sendResponse)(res, 200, true, "Current stock report generated successfully", report);
    }
    /**
     * GET /reports/stock-movements
     * Query params:
     *   - branchId: string (optional, "central" or omit for central stock)
     *   - productId: string (optional)
     *   - movementType: ADDITION | DEDUCTION | SALE | TRANSFER_IN | TRANSFER_OUT (optional)
     *   - startDate: string (YYYY-MM-DD)
     *   - endDate: string (YYYY-MM-DD)
     */
    static async getStockMovements(req, res) {
        const { branchId, productId, movementType, startDate, endDate } = req.query;
        const report = await report_service_1.ReportService.getStockMovements({
            branchId: branchId,
            productId: productId,
            movementType: movementType,
            startDate: startDate,
            endDate: endDate,
        });
        return (0, response_1.sendResponse)(res, 200, true, "Stock movement report generated successfully", report);
    }
    /**
     * GET /reports/requested-items
     * Query params:
     *   - branchId: string (optional)
     *   - status: string or comma-separated (PENDING, APPROVED, DISPATCHED, RECEIVED, REJECTED)
     *   - startDate: string (YYYY-MM-DD)
     *   - endDate: string (YYYY-MM-DD)
     *   - productId: string (optional)
     */
    static async getRequestedItems(req, res) {
        const { branchId, status, startDate, endDate, productId } = req.query;
        // Parse status - can be single value or comma-separated
        let parsedStatus;
        if (status) {
            const statusStr = status;
            if (statusStr.includes(",")) {
                parsedStatus = statusStr.split(",").map((s) => s.trim());
            }
            else {
                parsedStatus = statusStr;
            }
        }
        const report = await report_service_1.ReportService.getRequestedItems({
            branchId: branchId,
            status: parsedStatus,
            startDate: startDate,
            endDate: endDate,
            productId: productId,
        });
        return (0, response_1.sendResponse)(res, 200, true, "Requested items report generated successfully", report);
    }
    /**
     * GET /reports/low-stock
     * Query params:
     *   - threshold: number (optional, default: 10)
     */
    static async getLowStockReport(req, res) {
        const { threshold } = req.query;
        const report = await report_service_1.ReportService.getLowStockReport(threshold ? Number(threshold) : undefined);
        return (0, response_1.sendResponse)(res, 200, true, "Low stock report generated successfully", report);
    }
    /**
     * GET /reports/sales-summary
     * Query params:
     *   - branchId: string (optional)
     *   - productId: string (optional)
     *   - startDate: string (YYYY-MM-DD)
     *   - endDate: string (YYYY-MM-DD)
     */
    static async getSalesSummary(req, res) {
        const { branchId, productId, startDate, endDate } = req.query;
        const report = await report_service_1.ReportService.getSalesSummary({
            branchId: branchId,
            productId: productId,
            startDate: startDate,
            endDate: endDate,
        });
        return (0, response_1.sendResponse)(res, 200, true, "Sales summary report generated successfully", report);
    }
}
exports.ReportController = ReportController;
