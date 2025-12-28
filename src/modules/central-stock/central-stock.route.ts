
import { Router } from "express"
import { CentralStockController } from "./central-stock.controller"
import { authMiddleware } from "../../middlewares/auth.middleware"
import { roleGuard } from "../../middlewares/role.middleware"
import { RoleCode } from "../../entities/role"
import { asyncHandler } from "../../utils/asyncHandler"

const router = Router()
router.use(authMiddleware)

// Only central manager or super admin can add stock
router.post(
  "/add",
  roleGuard(RoleCode.CENTRAL_MANAGER, RoleCode.SUPER_ADMIN),
  asyncHandler(CentralStockController.addStock)
)

export default router
