"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesReportController = void 0;
const sales_report_service_1 = require("./sales-report.service");
const response_1 = require("../../utils/response");
const AppError_1 = require("../../errors/AppError");
class SalesReportController {
    static async uploadSalesReport(req, res, next) {
        try {
            if (!req.file) {
                throw new AppError_1.AppError("File is required", 400);
            }
            const { startDate, endDate } = req.body;
            if (!startDate || !endDate) {
                throw new AppError_1.AppError("startDate and endDate are required", 400);
            }
            // Check if user is authenticated and has ID
            if (!req.user || !req.user.id) {
                throw new AppError_1.AppError("User not authenticated", 401);
            }
            const result = await sales_report_service_1.SalesReportService.uploadSalesReport({
                startDate,
                endDate,
                userId: req.user.id,
                file: req.file,
            });
            return (0, response_1.sendResponse)(res, 201, true, result.message, {
                dateRange: result.dateRange,
                branches: result.branches,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SalesReportController = SalesReportController;
