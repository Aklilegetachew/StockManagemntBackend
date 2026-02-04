"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alerts_controller_1 = require("./alerts.controller");
const asyncHandler_1 = require("../../utils/asyncHandler");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const role_1 = require("../../entities/role");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Listing alerts (Branch Managers can see their own, Central/Super see all)
// Assuming controller handles filtering by user role or we pass user to service
router.get("/", 
// roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER, RoleCode.BRANCH_MANAGER), // Everyone authorized can view
(0, asyncHandler_1.asyncHandler)(alerts_controller_1.AlertController.getAlerts));
router.post("/generate", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.CENTRAL_MANAGER), // Only admins can trigger manual generation
(0, asyncHandler_1.asyncHandler)(alerts_controller_1.AlertController.generateAlerts));
router.patch("/:id/acknowledge", 
// roleGuard(...), // Accessible by relevant staff
(0, asyncHandler_1.asyncHandler)(alerts_controller_1.AlertController.acknowledgeAlert));
router.patch("/:id/resolve", 
// roleGuard(...),
(0, asyncHandler_1.asyncHandler)(alerts_controller_1.AlertController.resolveAlert));
exports.default = router;
