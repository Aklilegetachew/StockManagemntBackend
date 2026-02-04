// src/modules/report/reports.routes.ts
import { Router } from "express"

import { authMiddleware } from "../../middlewares/auth.middleware"
import { RoleCode } from "../../entities/role"
import { roleGuard } from "../../middlewares/role.middleware"
import { asyncHandler } from "../../utils/asyncHandler"
import { ReportController } from "./report.controller"

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// Reports are accessible by Super Admin and Central Manager
router.use(roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER, RoleCode.SUPERVISOR))

// ==================== 1. CURRENT STOCK REPORT ====================
// GET /reports/current-stock
// Query: branchId (optional - omit for central), productId, categoryId, lowStockOnly, lowStockThreshold
router.get("/current-stock", asyncHandler(ReportController.getCurrentStock))

// ==================== 2. STOCK MOVEMENT REPORT ====================
// GET /reports/stock-movements
// Query: branchId ("central" or ID), productId, movementType, startDate, endDate
router.get("/stock-movements", asyncHandler(ReportController.getStockMovements))

// ==================== 3. REQUESTED ITEMS REPORT ====================
// GET /reports/requested-items
// Query: branchId, status (single or comma-separated), startDate, endDate, productId
router.get("/requested-items", asyncHandler(ReportController.getRequestedItems))

// ==================== 4. LOW STOCK ALERT REPORT ====================
// GET /reports/low-stock
// Query: threshold (default: 10)
router.get("/low-stock", asyncHandler(ReportController.getLowStockReport))

// ==================== 5. SALES SUMMARY REPORT ====================
// GET /reports/sales-summary
// Query: branchId, productId, startDate, endDate
router.get("/sales-summary", asyncHandler(ReportController.getSalesSummary))

export default router
