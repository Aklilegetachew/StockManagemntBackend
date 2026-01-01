// src/modules/branches/branch.routes.ts
import { Router } from "express"
import { BranchController } from "./branch.controller"
import { asyncHandler } from "../../utils/asyncHandler"
import { authMiddleware } from "../../middlewares/auth.middleware"
import { roleGuard } from "../../middlewares/role.middleware"
import { RoleCode } from "../../entities/role"

const router = Router()

router.use(authMiddleware)

// SUPER_ADMIN only
router.post(
  "/",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  asyncHandler(BranchController.createBranch)
)

router.put(
  "/:id",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  asyncHandler(BranchController.updateBranch)
)

// SUPER_ADMIN & CENTRAL_MANAGER
router.get(
  "/",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  asyncHandler(BranchController.getBranches)
)

// BRANCH_MANAGER (own branch)
router.get(
  "/me",
  roleGuard(RoleCode.BRANCH_MANAGER),
  asyncHandler(BranchController.getMyBranch)
)

router.patch(
  "/:id/deactivate",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  asyncHandler(BranchController.deactivateBranch)
)

router.get(
  "/stock-summary",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  asyncHandler(BranchController.getBranchStockSummary)
)

router.get(
  "/:id/stocks",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER, RoleCode.BRANCH_MANAGER),
  asyncHandler(BranchController.getBranchStock)
)

export default router
