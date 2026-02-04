"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/report/reports.routes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_1 = require("../../entities/role");
const role_middleware_1 = require("../../middlewares/role.middleware");
const asyncHandler_1 = require("../../utils/asyncHandler");
const report_controller_1 = require("./report.controller");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authMiddleware);
// Reports are accessible by Super Admin and Central Manager
router.use((0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.CENTRAL_MANAGER));
// ==================== 1. CURRENT STOCK REPORT ====================
// GET /reports/current-stock
// Query: branchId (optional - omit for central), productId, categoryId, lowStockOnly, lowStockThreshold
router.get("/current-stock", (0, asyncHandler_1.asyncHandler)(report_controller_1.ReportController.getCurrentStock));
// ==================== 2. STOCK MOVEMENT REPORT ====================
// GET /reports/stock-movements
// Query: branchId ("central" or ID), productId, movementType, startDate, endDate
router.get("/stock-movements", (0, asyncHandler_1.asyncHandler)(report_controller_1.ReportController.getStockMovements));
// ==================== 3. REQUESTED ITEMS REPORT ====================
// GET /reports/requested-items
// Query: branchId, status (single or comma-separated), startDate, endDate, productId
router.get("/requested-items", (0, asyncHandler_1.asyncHandler)(report_controller_1.ReportController.getRequestedItems));
// ==================== 4. LOW STOCK ALERT REPORT ====================
// GET /reports/low-stock
// Query: threshold (default: 10)
router.get("/low-stock", (0, asyncHandler_1.asyncHandler)(report_controller_1.ReportController.getLowStockReport));
// ==================== 5. SALES SUMMARY REPORT ====================
// GET /reports/sales-summary
// Query: branchId, productId, startDate, endDate
router.get("/sales-summary", (0, asyncHandler_1.asyncHandler)(report_controller_1.ReportController.getSalesSummary));
exports.default = router;
