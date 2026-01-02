import { Router } from "express"
import { AlertController } from "./alerts.controller"
import { asyncHandler } from "../../utils/asyncHandler"
import { authMiddleware } from "../../middlewares/auth.middleware"
import { roleGuard } from "../../middlewares/role.middleware"
import { RoleCode } from "../../entities/role"

const router = Router()

router.use(authMiddleware)

// Listing alerts (Branch Managers can see their own, Central/Super see all)
// Assuming controller handles filtering by user role or we pass user to service
router.get(
  "/",
  // roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER, RoleCode.BRANCH_MANAGER), // Everyone authorized can view
  asyncHandler(AlertController.getAlerts)
)

router.post(
  "/generate",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER), // Only admins can trigger manual generation
  asyncHandler(AlertController.generateAlerts)
)

router.patch(
  "/:id/acknowledge",
  // roleGuard(...), // Accessible by relevant staff
  asyncHandler(AlertController.acknowledgeAlert)
)

router.patch(
  "/:id/resolve",
  // roleGuard(...),
  asyncHandler(AlertController.resolveAlert)
)

export default router
