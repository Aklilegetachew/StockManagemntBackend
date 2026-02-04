"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CentralStockController = void 0;
const central_stock_service_1 = require("./central-stock.service");
const response_1 = require("../../utils/response");
class CentralStockController {
    static async addStock(req, res) {
        const { productId, reference, quantity, note } = req.body;
        const userId = req.user?.id;
        const stock = await central_stock_service_1.CentralStockService.addStock(productId, reference, quantity, note, userId);
        return (0, response_1.sendResponse)(res, 200, true, "Stock added to central stock successfully", stock);
    }
    static async updateCentralStock(req, res) {
        const { productId, reference, quantity, note } = req.body;
        const userId = req.user?.id;
        const stock = await central_stock_service_1.CentralStockService.updateCentralStock(productId, reference, quantity, note, userId);
        return (0, response_1.sendResponse)(res, 200, true, "Central stock updated successfully", stock);
    }
    static async getCentralStock(req, res) {
        const summary = await central_stock_service_1.CentralStockService.getCentralStock();
        return (0, response_1.sendResponse)(res, 200, true, "Central stock fetched successfully", summary);
    }
    static async getCentralStockSummary(req, res) {
        const { id } = req.params;
        const summary = await central_stock_service_1.CentralStockService.getCentralStockMovementsSummary(id);
        const safeSummary = summary.map((item) => {
            return {
                ...item,
                requestedBy: item.requestedBy?.fullName || "",
                approvedBy: item.approvedBy?.fullName || "",
            };
        });
        console.log(summary);
        return (0, response_1.sendResponse)(res, 200, true, "Central stock summary fetched successfully", safeSummary);
    }
}
exports.CentralStockController = CentralStockController;
