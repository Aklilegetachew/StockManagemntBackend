import { Router } from "express"
import { UserController } from "./user.controller"
import { asyncHandler } from "../../utils/asyncHandler"
import { authMiddleware } from "../../middlewares/auth.middleware"
import { roleGuard } from "../../middlewares/role.middleware"

const router = Router()

router.get(
  "/",
  authMiddleware,
  roleGuard("SUPER_ADMIN", "CENTRAL_MANAGER"),
  asyncHandler(UserController.getAllUsers)
)
router.get(
  "/:id",
  authMiddleware,
  roleGuard("SUPER_ADMIN", "CENTRAL_MANAGER"),
  asyncHandler(UserController.getUserById)
)
router.post("/signup", asyncHandler(UserController.signup))
router.post("/login", asyncHandler(UserController.login))
router.post("/forgot-password", asyncHandler(UserController.forgotPassword))
router.post("/reset-password", asyncHandler(UserController.resetPassword))

router.put("/:id", authMiddleware, asyncHandler(UserController.editUser))
router.delete("/:id", authMiddleware, asyncHandler(UserController.deleteUser))

export default router
