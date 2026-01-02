import { Router } from "express"
import { CategoryController } from "./category.controller"
import { asyncHandler } from "../../utils/asyncHandler"
import { authMiddleware } from "../../middlewares/auth.middleware"
import { roleGuard } from "../../middlewares/role.middleware"
import { RoleCode } from "../../entities/role"

const router = Router()

router.use(authMiddleware)

router.post(
  "/",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  asyncHandler(CategoryController.createCategory)
)

router.get(
  "/",
 
  roleGuard(
    RoleCode.SUPER_ADMIN,
    RoleCode.CENTRAL_MANAGER,
    RoleCode.BRANCH_MANAGER
  ),
  asyncHandler(CategoryController.getCategories)
)

router.get(
  "/:id",
  roleGuard(
    RoleCode.SUPER_ADMIN,
    RoleCode.CENTRAL_MANAGER,
    RoleCode.BRANCH_MANAGER
  ),
  asyncHandler(CategoryController.getCategoryById)
)

router.put(
  "/:id",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  asyncHandler(CategoryController.updateCategory)
)

export default router
