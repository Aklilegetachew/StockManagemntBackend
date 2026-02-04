"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("./analytics.controller");
const asyncHandler_1 = require("../../utils/asyncHandler");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const role_1 = require("../../entities/role");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// ==================== INVENTORY HEALTH ====================
router.get("/inventory/low-stock", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.CENTRAL_MANAGER), (0, asyncHandler_1.asyncHandler)(analytics_controller_1.AnalyticsController.getLowStockByBranch));
router.get("/inventory/central-stock", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.CENTRAL_MANAGER), (0, asyncHandler_1.asyncHandler)(analytics_controller_1.AnalyticsController.getCentralStockHealth));
router.get("/inventory/pending-requests", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.CENTRAL_MANAGER), (0, asyncHandler_1.asyncHandler)(analytics_controller_1.AnalyticsController.getPendingRequests));
router.get("/inventory/product-status", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.CENTRAL_MANAGER), (0, asyncHandler_1.asyncHandler)(analytics_controller_1.AnalyticsController.getProductStatus));
// ==================== PRODUCT MOVEMENT ====================
router.get("/products/movement", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.CENTRAL_MANAGER), (0, asyncHandler_1.asyncHandler)(analytics_controller_1.AnalyticsController.getProductMovement));
router.get("/products/branch-movement", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.CENTRAL_MANAGER), (0, asyncHandler_1.asyncHandler)(analytics_controller_1.AnalyticsController.getBranchWiseMovement));
router.get("/products/aging", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.CENTRAL_MANAGER), (0, asyncHandler_1.asyncHandler)(analytics_controller_1.AnalyticsController.getProductAging));
// ==================== BRANCH BEHAVIOR ====================
router.get("/branches/request-frequency", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.CENTRAL_MANAGER), (0, asyncHandler_1.asyncHandler)(analytics_controller_1.AnalyticsController.getBranchRequestFrequency));
router.get("/branches/stock-holding", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.CENTRAL_MANAGER), (0, asyncHandler_1.asyncHandler)(analytics_controller_1.AnalyticsController.getStockHoldingDuration));
// ==================== REQUEST OPERATIONS ====================
router.get("/requests/status-breakdown", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.CENTRAL_MANAGER), (0, asyncHandler_1.asyncHandler)(analytics_controller_1.AnalyticsController.getRequestStatusBreakdown));
router.get("/requests/partial-approvals", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.CENTRAL_MANAGER), (0, asyncHandler_1.asyncHandler)(analytics_controller_1.AnalyticsController.getPartialApprovals));
router.get("/requests/user-activity", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.CENTRAL_MANAGER), (0, asyncHandler_1.asyncHandler)(analytics_controller_1.AnalyticsController.getUserActivity));
// ==================== BRANCH SPECIFIC ====================
router.get("/branch/:branchId/overview", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.CENTRAL_MANAGER, role_1.RoleCode.BRANCH_MANAGER), (0, asyncHandler_1.asyncHandler)(analytics_controller_1.AnalyticsController.getBranchOverview));
router.get("/branch/:branchId/low-stock", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.CENTRAL_MANAGER, role_1.RoleCode.BRANCH_MANAGER), (0, asyncHandler_1.asyncHandler)(analytics_controller_1.AnalyticsController.getBranchLowStock));
router.get("/branch/:branchId/recent-dispatched", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.CENTRAL_MANAGER, role_1.RoleCode.BRANCH_MANAGER), (0, asyncHandler_1.asyncHandler)(analytics_controller_1.AnalyticsController.getBranchRecentDispatched));
exports.default = router;
