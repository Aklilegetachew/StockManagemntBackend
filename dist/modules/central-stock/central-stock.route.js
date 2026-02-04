"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const central_stock_controller_1 = require("./central-stock.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const role_1 = require("../../entities/role");
const asyncHandler_1 = require("../../utils/asyncHandler");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Only central manager or super admin can add stock
router.post("/add", (0, role_middleware_1.roleGuard)(role_1.RoleCode.CENTRAL_MANAGER, role_1.RoleCode.SUPER_ADMIN), (0, asyncHandler_1.asyncHandler)(central_stock_controller_1.CentralStockController.addStock));
router.put("/update", (0, role_middleware_1.roleGuard)(role_1.RoleCode.CENTRAL_MANAGER, role_1.RoleCode.SUPER_ADMIN), (0, asyncHandler_1.asyncHandler)(central_stock_controller_1.CentralStockController.updateCentralStock));
router.get("/", (0, role_middleware_1.roleGuard)(role_1.RoleCode.CENTRAL_MANAGER, role_1.RoleCode.SUPER_ADMIN), (0, asyncHandler_1.asyncHandler)(central_stock_controller_1.CentralStockController.getCentralStock));
router.get("/:id/summary", (0, role_middleware_1.roleGuard)(role_1.RoleCode.CENTRAL_MANAGER, role_1.RoleCode.SUPER_ADMIN), (0, asyncHandler_1.asyncHandler)(central_stock_controller_1.CentralStockController.getCentralStockSummary));
exports.default = router;
