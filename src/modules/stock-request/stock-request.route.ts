// src/modules/stock-request/stock-request.route.ts
import { Router } from "express"
import { StockRequestController } from "./stock-request.controller"
import { asyncHandler } from "../../utils/asyncHandler"
import { authMiddleware } from "../../middlewares/auth.middleware"
import { roleGuard } from "../../middlewares/role.middleware"
import { RoleCode } from "../../entities/role"

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// --------------------- Branch routes ---------------------
// Branch creates a multi-product stock request
router.post(
  "/",
  roleGuard(RoleCode.BRANCH_MANAGER),
  asyncHandler(StockRequestController.createRequest)
)

// Branch can receive stock for dispatched requests
router.put(
  "/:id/receive",
  roleGuard(RoleCode.BRANCH_MANAGER),
  asyncHandler(StockRequestController.receiveStock)
)

// --------------------- Central / Admin routes ---------------------
// Central views all requests (can filter in future)
router.get(
  "/",
  roleGuard(RoleCode.CENTRAL_MANAGER, RoleCode.SUPER_ADMIN),
  asyncHandler(StockRequestController.getAllRequests)
)

// Central approves requests (partial/full) with optional note
router.put(
  "/:id/approve",
  roleGuard(RoleCode.CENTRAL_MANAGER),
  asyncHandler(StockRequestController.approveRequest)
)

// Central dispatches approved requests
router.put(
  "/:id/dispatch",
  roleGuard(RoleCode.CENTRAL_MANAGER),
  asyncHandler(StockRequestController.dispatchRequest)
)

export default router
