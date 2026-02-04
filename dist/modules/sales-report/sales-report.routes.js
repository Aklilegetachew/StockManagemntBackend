"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const sales_report_controller_1 = require("./sales-report.controller");
const asyncHandler_1 = require("../../utils/asyncHandler");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const role_1 = require("../../entities/role");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.use(auth_middleware_1.authMiddleware);
router.post("/upload", (0, role_middleware_1.roleGuard)(role_1.RoleCode.SUPER_ADMIN, role_1.RoleCode.CENTRAL_MANAGER), upload.single("file"), (0, asyncHandler_1.asyncHandler)(sales_report_controller_1.SalesReportController.uploadSalesReport));
exports.default = router;
