"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("./analytics.service");
const response_1 = require("../../utils/response");
class AnalyticsController {
    // ==================== INVENTORY HEALTH ====================
    static async getLowStockByBranch(_req, res, next) {
        try {
            const data = await analytics_service_1.AnalyticsService.getLowStockByBranch();
            return (0, response_1.sendResponse)(res, 200, true, "Low stock data fetched successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getCentralStockHealth(_req, res, next) {
        try {
            const data = await analytics_service_1.AnalyticsService.getCentralStockHealth();
            return (0, response_1.sendResponse)(res, 200, true, "Central stock health fetched successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPendingRequests(_req, res, next) {
        try {
            const data = await analytics_service_1.AnalyticsService.getPendingRequests();
            return (0, response_1.sendResponse)(res, 200, true, "Pending requests data fetched successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getProductStatus(_req, res, next) {
        try {
            const data = await analytics_service_1.AnalyticsService.getProductStatus();
            return (0, response_1.sendResponse)(res, 200, true, "Product status fetched successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
    // ==================== PRODUCT MOVEMENT ====================
    static async getProductMovement(_req, res, next) {
        try {
            const data = await analytics_service_1.AnalyticsService.getProductMovement();
            return (0, response_1.sendResponse)(res, 200, true, "Product movement data fetched successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getBranchWiseMovement(_req, res, next) {
        try {
            const data = await analytics_service_1.AnalyticsService.getBranchWiseMovement();
            return (0, response_1.sendResponse)(res, 200, true, "Branch-wise movement data fetched successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getProductAging(_req, res, next) {
        try {
            const data = await analytics_service_1.AnalyticsService.getProductAging();
            return (0, response_1.sendResponse)(res, 200, true, "Product aging data fetched successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
    // ==================== BRANCH BEHAVIOR ====================
    static async getBranchRequestFrequency(_req, res, next) {
        try {
            const data = await analytics_service_1.AnalyticsService.getBranchRequestFrequency();
            return (0, response_1.sendResponse)(res, 200, true, "Branch request frequency fetched successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getStockHoldingDuration(_req, res, next) {
        try {
            const data = await analytics_service_1.AnalyticsService.getStockHoldingDuration();
            return (0, response_1.sendResponse)(res, 200, true, "Stock holding duration fetched successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
    // ==================== REQUEST OPERATIONS ====================
    static async getRequestStatusBreakdown(_req, res, next) {
        try {
            const data = await analytics_service_1.AnalyticsService.getRequestStatusBreakdown();
            return (0, response_1.sendResponse)(res, 200, true, "Request status breakdown fetched successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPartialApprovals(_req, res, next) {
        try {
            const data = await analytics_service_1.AnalyticsService.getPartialApprovals();
            return (0, response_1.sendResponse)(res, 200, true, "Partial approvals data fetched successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getUserActivity(_req, res, next) {
        try {
            const data = await analytics_service_1.AnalyticsService.getUserActivity();
            return (0, response_1.sendResponse)(res, 200, true, "User activity data fetched successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
    // ==================== BRANCH SPECIFIC ====================
    static async getBranchOverview(req, res, next) {
        try {
            const { branchId } = req.params;
            const data = await analytics_service_1.AnalyticsService.getBranchOverview(branchId);
            return (0, response_1.sendResponse)(res, 200, true, "Branch overview fetched successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getBranchLowStock(req, res, next) {
        try {
            const { branchId } = req.params;
            const data = await analytics_service_1.AnalyticsService.getBranchLowStock(branchId);
            return (0, response_1.sendResponse)(res, 200, true, "Branch low stock fetched successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getBranchRecentDispatched(req, res, next) {
        try {
            const { branchId } = req.params;
            const data = await analytics_service_1.AnalyticsService.getBranchRecentDispatched(branchId);
            return (0, response_1.sendResponse)(res, 200, true, "Branch recent dispatched fetched successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AnalyticsController = AnalyticsController;
