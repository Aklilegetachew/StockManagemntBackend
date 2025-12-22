// src/modules/products/product.routes.ts
import { Router } from "express"
import { ProductController } from "./product.controller"
import { asyncHandler } from "../../utils/asyncHandler"
import { authMiddleware } from "../../middlewares/auth.middleware"
import { roleGuard } from "../../middlewares/role.middleware"
import { RoleCode } from "../../entities/role"

const router = Router()

router.use(authMiddleware)

// Central & Super Admin
router.post(
  "/",
  roleGuard(RoleCode.CENTRAL_MANAGER, RoleCode.SUPER_ADMIN),
  asyncHandler(ProductController.createProduct)
)

router.get("/", asyncHandler(ProductController.getProducts))

router.get("/:id", asyncHandler(ProductController.getProductById))

router.put(
  "/:id",
  roleGuard(RoleCode.CENTRAL_MANAGER, RoleCode.SUPER_ADMIN),
  asyncHandler(ProductController.updateProduct)
)

// Assign product to branch
router.post(
  "/:id/assign-branch",
  roleGuard(RoleCode.CENTRAL_MANAGER),
  asyncHandler(ProductController.assignProductToBranch)
)

export default router
