"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stock_movement_controller_1 = require("./stock-movement.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const role_1 = require("../../entities/role");
const asyncHandler_1 = require("../../utils/asyncHandler");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Central manager or super admin can view stock movement
router.get("/summary", (0, role_middleware_1.roleGuard)(role_1.RoleCode.CENTRAL_MANAGER, role_1.RoleCode.SUPER_ADMIN), (0, asyncHandler_1.asyncHandler)(stock_movement_controller_1.StockMovementController.getSummary));
// branch stock movent for a product of specific branch 
router.get("/branch/:branchId/product/:productId/summary", (0, role_middleware_1.roleGuard)(role_1.RoleCode.BRANCH_MANAGER, role_1.RoleCode.SUPER_ADMIN), (0, asyncHandler_1.asyncHandler)(stock_movement_controller_1.StockMovementController.getBranchProductSummary));
exports.default = router;
