"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/branches/branch.routes.ts
const express_1 = require("express");
const branch_controller_1 = require("./branch.controller");
const asyncHandler_1 = require("../../utils/asyncHandler");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const role_1 = require("../../entities/role");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// SUPER_ADMIN only
router.post("/", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN), (0, asyncHandler_1.asyncHandler)(branch_controller_1.BranchController.createBranch));
router.put("/:id", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN), (0, asyncHandler_1.asyncHandler)(branch_controller_1.BranchController.updateBranch));
// SUPER_ADMIN & CENTRAL_MANAGER
router.get("/", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.CENTRAL_MANAGER), (0, asyncHandler_1.asyncHandler)(branch_controller_1.BranchController.getBranches));
// BRANCH_MANAGER (own branch)
router.get("/me", (0, role_middleware_1.roleGuard)(role_1.RoleCode.BRANCH_MANAGER), (0, asyncHandler_1.asyncHandler)(branch_controller_1.BranchController.getMyBranch));
router.patch("/:id/deactivate", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN), (0, asyncHandler_1.asyncHandler)(branch_controller_1.BranchController.deactivateBranch));
exports.default = router;
