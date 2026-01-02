import { Router } from "express"
import { AnalyticsController } from "./analytics.controller"
import { asyncHandler } from "../../utils/asyncHandler"
import { authMiddleware } from "../../middlewares/auth.middleware"
import { roleGuard } from "../../middlewares/role.middleware"
import { RoleCode } from "../../entities/role"

const router = Router()

router.use(authMiddleware)

// ==================== INVENTORY HEALTH ====================

router.get(
  "/inventory/low-stock",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  asyncHandler(AnalyticsController.getLowStockByBranch)
)

router.get(
  "/inventory/central-stock",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  asyncHandler(AnalyticsController.getCentralStockHealth)
)

router.get(
  "/inventory/pending-requests",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  asyncHandler(AnalyticsController.getPendingRequests)
)

router.get(
  "/inventory/product-status",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  asyncHandler(AnalyticsController.getProductStatus)
)

// ==================== PRODUCT MOVEMENT ====================

router.get(
  "/products/movement",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  asyncHandler(AnalyticsController.getProductMovement)
)

router.get(
  "/products/branch-movement",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  asyncHandler(AnalyticsController.getBranchWiseMovement)
)

router.get(
  "/products/aging",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  asyncHandler(AnalyticsController.getProductAging)
)

// ==================== BRANCH BEHAVIOR ====================

router.get(
  "/branches/request-frequency",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  asyncHandler(AnalyticsController.getBranchRequestFrequency)
)

router.get(
  "/branches/stock-holding",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  asyncHandler(AnalyticsController.getStockHoldingDuration)
)

// ==================== REQUEST OPERATIONS ====================

router.get(
  "/requests/status-breakdown",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  asyncHandler(AnalyticsController.getRequestStatusBreakdown)
)

router.get(
  "/requests/partial-approvals",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  asyncHandler(AnalyticsController.getPartialApprovals)
)

router.get(
  "/requests/user-activity",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  asyncHandler(AnalyticsController.getUserActivity)
)

// ==================== BRANCH SPECIFIC ====================

router.get(
  "/branch/:branchId/overview",
  roleGuard(
    RoleCode.SUPER_ADMIN,
    RoleCode.CENTRAL_MANAGER,
    RoleCode.BRANCH_MANAGER
  ),
  asyncHandler(AnalyticsController.getBranchOverview)
)

router.get(
  "/branch/:branchId/low-stock",
  roleGuard(
    RoleCode.SUPER_ADMIN,
    RoleCode.CENTRAL_MANAGER,
    RoleCode.BRANCH_MANAGER
  ),
  asyncHandler(AnalyticsController.getBranchLowStock)
)

router.get(
  "/branch/:branchId/recent-dispatched",
  roleGuard(
    RoleCode.SUPER_ADMIN,
    RoleCode.CENTRAL_MANAGER,
    RoleCode.BRANCH_MANAGER
  ),
  asyncHandler(AnalyticsController.getBranchRecentDispatched)
)

export default router
