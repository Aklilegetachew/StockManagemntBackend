"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertController = void 0;
const alerts_service_1 = require("./alerts.service");
const response_1 = require("../../utils/response");
const role_1 = require("../../entities/role");
class AlertController {
    static async getAlerts(req, res, next) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            // If Branch Manager, enforce branchId filter
            // Assuming req.user is populated by authMiddleware
            const user = req.user;
            if (user.role.code === role_1.RoleCode.BRANCH_MANAGER) {
                if (user.branch?.id) {
                    req.query.branchId = user.branch.id;
                }
            }
            const data = await alerts_service_1.AlertService.getAlerts(req.query, page, limit, user);
            return (0, response_1.sendResponse)(res, 200, true, "Alerts fetched successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
    static async acknowledgeAlert(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const data = await alerts_service_1.AlertService.acknowledgeAlert(id, userId);
            return (0, response_1.sendResponse)(res, 200, true, "Alert acknowledged successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
    static async resolveAlert(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const data = await alerts_service_1.AlertService.resolveAlert(id, userId);
            return (0, response_1.sendResponse)(res, 200, true, "Alert resolved successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
    static async generateAlerts(req, res, next) {
        try {
            const data = await alerts_service_1.AlertService.generateStockAlerts();
            return (0, response_1.sendResponse)(res, 200, true, "Alerts generated successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AlertController = AlertController;
