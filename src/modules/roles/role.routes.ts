import { Router } from "express"
import { RoleController } from "./role.controller"
import { asyncHandler } from "../../utils/asyncHandler"
import { authMiddleware } from "../../middlewares/auth.middleware"

const router = Router()

/**
 * In real production:
 * - Protect these with SUPER_ADMIN role middleware
 */
// router.post("/", authMiddleware, asyncHandler(RoleController.createRole))
// router.get("/", authMiddleware, asyncHandler(RoleController.getRoles))
// router.get("/:id", authMiddleware, asyncHandler(RoleController.getRoleById))
// router.put("/:id", authMiddleware, asyncHandler(RoleController.updateRole))
// router.delete("/:id", authMiddleware, asyncHandler(RoleController.deleteRole))

router.post("/", asyncHandler(RoleController.createRole))
router.get("/", asyncHandler(RoleController.getRoles))
router.get("/:id", asyncHandler(RoleController.getRoleById))
router.put("/:id", asyncHandler(RoleController.updateRole))
router.delete("/:id", asyncHandler(RoleController.deleteRole))

export default router
