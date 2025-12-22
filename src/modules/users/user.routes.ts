import { Router } from "express"
import { UserController } from "./user.controller"
import { asyncHandler } from "../../utils/asyncHandler"
import { authMiddleware } from "../../middlewares/auth.middleware"

const router = Router()

router.post("/signup", asyncHandler(UserController.signup))
router.post("/login", asyncHandler(UserController.login))
router.post("/forgot-password", asyncHandler(UserController.forgotPassword))
router.post("/reset-password", asyncHandler(UserController.resetPassword))

router.put("/:id", authMiddleware, asyncHandler(UserController.editUser))
router.delete("/:id", authMiddleware, asyncHandler(UserController.deleteUser))

export default router
