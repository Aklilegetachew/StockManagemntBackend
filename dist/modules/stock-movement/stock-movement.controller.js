"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockMovementController = void 0;
const stock_movement_service_1 = require("./stock-movement.service");
const response_1 = require("../../utils/response");
class StockMovementController {
    static async getSummary(req, res) {
        const { productId, branchId, fromDate, toDate } = req.query;
        const summary = await stock_movement_service_1.StockMovementService.getStockSummary(productId, branchId, fromDate, toDate);
        return (0, response_1.sendResponse)(res, 200, true, "Stock summary fetched successfully", summary);
    }
    static async getBranchProductSummary(req, res) {
        const { productId, branchId } = req.params;
        const summary = await stock_movement_service_1.StockMovementService.getBranchProductSummary(productId, branchId);
        return (0, response_1.sendResponse)(res, 200, true, "Branch product summary fetched successfully", summary);
    }
}
exports.StockMovementController = StockMovementController;
