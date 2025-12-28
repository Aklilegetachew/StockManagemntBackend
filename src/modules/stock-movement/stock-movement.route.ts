
import { Router } from "express"
import { StockMovementController } from "./stock-movement.controller"
import { authMiddleware } from "../../middlewares/auth.middleware"
import { roleGuard } from "../../middlewares/role.middleware"
import { RoleCode } from "../../entities/role"
import { asyncHandler } from "../../utils/asyncHandler"

const router = Router()
router.use(authMiddleware)

// Central manager or super admin can view stock movement
router.get(
  "/summary",
  roleGuard(RoleCode.CENTRAL_MANAGER, RoleCode.SUPER_ADMIN),
  asyncHandler(StockMovementController.getSummary)
)

export default router
