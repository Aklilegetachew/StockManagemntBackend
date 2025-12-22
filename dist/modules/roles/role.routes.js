"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const role_controller_1 = require("./role.controller");
const asyncHandler_1 = require("../../utils/asyncHandler");
const router = (0, express_1.Router)();
/**
 * In real production:
 * - Protect these with SUPER_ADMIN role middleware
 */
// router.post("/", authMiddleware, asyncHandler(RoleController.createRole))
// router.get("/", authMiddleware, asyncHandler(RoleController.getRoles))
// router.get("/:id", authMiddleware, asyncHandler(RoleController.getRoleById))
// router.put("/:id", authMiddleware, asyncHandler(RoleController.updateRole))
// router.delete("/:id", authMiddleware, asyncHandler(RoleController.deleteRole))
router.post("/", (0, asyncHandler_1.asyncHandler)(role_controller_1.RoleController.createRole));
router.get("/", (0, asyncHandler_1.asyncHandler)(role_controller_1.RoleController.getRoles));
router.get("/:id", (0, asyncHandler_1.asyncHandler)(role_controller_1.RoleController.getRoleById));
router.put("/:id", (0, asyncHandler_1.asyncHandler)(role_controller_1.RoleController.updateRole));
router.delete("/:id", (0, asyncHandler_1.asyncHandler)(role_controller_1.RoleController.deleteRole));
exports.default = router;
