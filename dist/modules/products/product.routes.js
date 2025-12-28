"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const asyncHandler_1 = require("../../utils/asyncHandler");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const role_1 = require("../../entities/role");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Central & Super Admin
router.post("/", (0, role_middleware_1.roleGuard)(role_1.RoleCode.CENTRAL_MANAGER, role_1.RoleCode.SUPER_ADMIN), (0, asyncHandler_1.asyncHandler)(product_controller_1.ProductController.createProduct));
router.get("/", (0, asyncHandler_1.asyncHandler)(product_controller_1.ProductController.getProducts));
router.get("/:id", (0, asyncHandler_1.asyncHandler)(product_controller_1.ProductController.getProductById));
router.put("/:id", (0, role_middleware_1.roleGuard)(role_1.RoleCode.CENTRAL_MANAGER, role_1.RoleCode.SUPER_ADMIN), (0, asyncHandler_1.asyncHandler)(product_controller_1.ProductController.updateProduct));
// Assign product to branch
router.post("/:id/assign-branch", (0, role_middleware_1.roleGuard)(role_1.RoleCode.CENTRAL_MANAGER), (0, asyncHandler_1.asyncHandler)(product_controller_1.ProductController.assignProductToBranch));
exports.default = router;
