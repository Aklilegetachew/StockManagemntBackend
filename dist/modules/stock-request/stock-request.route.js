"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/stock-request/stock-request.route.ts
const express_1 = require("express");
const stock_request_controller_1 = require("./stock-request.controller");
const asyncHandler_1 = require("../../utils/asyncHandler");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const role_1 = require("../../entities/role");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authMiddleware);
// --------------------- Branch routes ---------------------
// Branch creates a multi-product stock request
router.post("/", (0, role_middleware_1.roleGuard)(role_1.RoleCode.BRANCH_MANAGER), (0, asyncHandler_1.asyncHandler)(stock_request_controller_1.StockRequestController.createRequest));
// Branch can receive stock for dispatched requests
router.put("/:id/receive", (0, role_middleware_1.roleGuard)(role_1.RoleCode.BRANCH_MANAGER), (0, asyncHandler_1.asyncHandler)(stock_request_controller_1.StockRequestController.receiveStock));
// --------------------- Supervisor routes (must be before /:id) ---------------------
router.get("/supervisor/pending", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPERVISOR), (0, asyncHandler_1.asyncHandler)(stock_request_controller_1.StockRequestController.getSupervisorPendingRequests));
router.put("/:id/supervisor/assign-branch", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPERVISOR), (0, asyncHandler_1.asyncHandler)(stock_request_controller_1.StockRequestController.supervisorAssignBranch));
router.put("/:id/supervisor/forward-to-central", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPERVISOR), (0, asyncHandler_1.asyncHandler)(stock_request_controller_1.StockRequestController.supervisorForwardToCentral));
// Branch Manager: requests assigned to my branch for approval
router.get("/assigned-to-my-branch", (0, role_middleware_1.roleGuard)(role_1.RoleCode.BRANCH_MANAGER), (0, asyncHandler_1.asyncHandler)(stock_request_controller_1.StockRequestController.getAssignedToMyBranchRequests));
router.put("/:id/approve-from-branch", (0, role_middleware_1.roleGuard)(role_1.RoleCode.BRANCH_MANAGER), (0, asyncHandler_1.asyncHandler)(stock_request_controller_1.StockRequestController.approveFromBranch));
// --------------------- Central / Admin routes ---------------------
// Central views all requests (can filter in future)
router.get("/", (0, role_middleware_1.roleGuard)(role_1.RoleCode.CENTRAL_MANAGER, role_1.RoleCode.SUPER_ADMIN), (0, asyncHandler_1.asyncHandler)(stock_request_controller_1.StockRequestController.getAllRequests));
// Central approves requests (partial/full) with optional note
router.put("/:id/approve", (0, role_middleware_1.roleGuard)(role_1.RoleCode.CENTRAL_MANAGER), (0, asyncHandler_1.asyncHandler)(stock_request_controller_1.StockRequestController.approveRequest));
// Central dispatches approved requests
router.put("/:id/dispatch", (0, role_middleware_1.roleGuard)(role_1.RoleCode.CENTRAL_MANAGER), (0, asyncHandler_1.asyncHandler)(stock_request_controller_1.StockRequestController.dispatchRequest));
router.get("/my-branch-requests", (0, role_middleware_1.roleGuard)(role_1.RoleCode.BRANCH_MANAGER), (0, asyncHandler_1.asyncHandler)(stock_request_controller_1.StockRequestController.getMyBranchRequests));
router.put("/editRequestBeforeApproval/:id", (0, role_middleware_1.roleGuard)(role_1.RoleCode.BRANCH_MANAGER), (0, asyncHandler_1.asyncHandler)(stock_request_controller_1.StockRequestController.editRequestBeforeApproval));
router.get("/my-branch-dispatched-requests", (0, role_middleware_1.roleGuard)(role_1.RoleCode.BRANCH_MANAGER), (0, asyncHandler_1.asyncHandler)(stock_request_controller_1.StockRequestController.getMyBranchDispatchedRequests));
router.get("/my-branch-received-requests", (0, role_middleware_1.roleGuard)(role_1.RoleCode.BRANCH_MANAGER), (0, asyncHandler_1.asyncHandler)(stock_request_controller_1.StockRequestController.getMyBranchReceivedRequests));
// Returns management
router.get("/returns", (0, role_middleware_1.roleGuard)(role_1.RoleCode.CENTRAL_MANAGER, role_1.RoleCode.SUPER_ADMIN), (0, asyncHandler_1.asyncHandler)(stock_request_controller_1.StockRequestController.getAllReturns));
router.get("/my-branch/returns", (0, role_middleware_1.roleGuard)(role_1.RoleCode.BRANCH_MANAGER), (0, asyncHandler_1.asyncHandler)(stock_request_controller_1.StockRequestController.getMyBranchReturns));
// Download PDF receipt for any request
router.get("/:id/receipt", (0, role_middleware_1.roleGuard)(role_1.RoleCode.BRANCH_MANAGER, role_1.RoleCode.CENTRAL_MANAGER, role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.SUPERVISOR), (0, asyncHandler_1.asyncHandler)(stock_request_controller_1.StockRequestController.downloadReceipt));
exports.default = router;
