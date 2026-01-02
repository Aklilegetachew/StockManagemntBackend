import { Router } from "express"
import multer from "multer"
import { SalesReportController } from "./sales-report.controller"
import { asyncHandler } from "../../utils/asyncHandler"
import { authMiddleware } from "../../middlewares/auth.middleware"
import { roleGuard } from "../../middlewares/role.middleware"
import { RoleCode } from "../../entities/role"

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.use(authMiddleware)

router.post(
  "/upload",
  roleGuard(RoleCode.SUPER_ADMIN, RoleCode.CENTRAL_MANAGER),
  upload.single("file"),
  asyncHandler(SalesReportController.uploadSalesReport)
)

export default router
