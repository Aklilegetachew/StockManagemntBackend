import { Router } from "express"
import { BranchReturnController } from "./branch-return.controller"
import { asyncHandler } from "../../utils/asyncHandler"
import { authMiddleware } from "../../middlewares/auth.middleware"
import { roleGuard } from "../../middlewares/role.middleware"
import { RoleCode } from "../../entities/role"

const router = Router()

router.use(authMiddleware)

// Branch Manager: create return request
router.post(
  "/",
  roleGuard(RoleCode.BRANCH_MANAGER),
  asyncHandler(BranchReturnController.createReturn)
)

// Supervisor: get pending return requests
router.get(
  "/supervisor/pending",
  roleGuard(RoleCode.SUPERVISOR),
  asyncHandler(BranchReturnController.getSupervisorPendingReturns)
)

// Supervisor: approve return
router.put(
  "/:id/approve",
  roleGuard(RoleCode.SUPERVISOR),
  asyncHandler(BranchReturnController.approveReturn)
)

// Supervisor: reject return
router.put(
  "/:id/reject",
  roleGuard(RoleCode.SUPERVISOR),
  asyncHandler(BranchReturnController.rejectReturn)
)

// Branch Manager: get my branch's return requests
router.get(
  "/my-branch",
  roleGuard(RoleCode.BRANCH_MANAGER),
  asyncHandler(BranchReturnController.getMyBranchReturns)
)

// Central Manager / Supervisor: get central returned stock
router.get(
  "/central-returned-stock",
  roleGuard(RoleCode.CENTRAL_MANAGER, RoleCode.SUPERVISOR, RoleCode.SUPER_ADMIN),
  asyncHandler(BranchReturnController.getCentralReturnedStock)
)

export default router
