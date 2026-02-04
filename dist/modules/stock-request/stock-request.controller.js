"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockRequestController = void 0;
const stock_request_service_1 = require("./stock-request.service");
const response_1 = require("../../utils/response");
const AppError_1 = require("../../errors/AppError");
const pdfReceipt_1 = require("../../utils/pdfReceipt");
const data_source_1 = require("../../data-source");
const user_1 = require("../../entities/user");
class StockRequestController {
    static async createRequest(req, res) {
        const branchId = req.user.branchId;
        const userId = req.user.id;
        const { items, urgency } = req.body; // [{ productId, quantity }], urgency?: boolean
        const request = await stock_request_service_1.StockRequestService.createRequest(branchId, userId, items, urgency);
        // Check if PDF receipt is requested
        if (req.query.receipt === "pdf") {
            const user = await data_source_1.AppDataSource.getRepository(user_1.User).findOneBy({ id: userId });
            const fullRequest = await stock_request_service_1.StockRequestService.stockRequestRepo.findOne({
                where: { id: request.id },
                relations: ["items", "items.product", "branch", "requestedBy"],
            });
            if (!fullRequest)
                throw new AppError_1.AppError("Request not found", 404);
            const doc = (0, pdfReceipt_1.generateRequestCreatedReceipt)(fullRequest, user?.fullName || "Unknown");
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=stock-request-${request.id.substring(0, 8)}.pdf`);
            doc.pipe(res);
            doc.end();
            return;
        }
        return (0, response_1.sendResponse)(res, 201, true, "Stock request created successfully", request);
    }
    static async getAllRequests(req, res) {
        const requests = await stock_request_service_1.StockRequestService.getCentralRequests();
        return (0, response_1.sendResponse)(res, 200, true, "Stock requests fetched successfully", requests);
    }
    static async approveRequest(req, res) {
        const { id } = req.params;
        const { items, note } = req.body;
        const userId = req.user?.id;
        if (!Array.isArray(items)) {
            throw new AppError_1.AppError("Items must be an array", 400);
        }
        if (items.length === 0) {
            throw new AppError_1.AppError("At least one item must be approved", 400);
        }
        const approvedItems = items.map((item, index) => {
            if (!item.productId) {
                throw new AppError_1.AppError(`Missing productId at index ${index}`, 400);
            }
            if (typeof item.approvedQuantity !== "number" ||
                isNaN(item.approvedQuantity)) {
                throw new AppError_1.AppError(`Invalid approvedQuantity for product ${item.productId}`, 400);
            }
            return {
                productId: item.productId,
                approvedQuantity: item.approvedQuantity,
            };
        });
        const request = await stock_request_service_1.StockRequestService.approveRequest(id, approvedItems, note);
        // Check if PDF receipt is requested
        if (req.query.receipt === "pdf") {
            const user = await data_source_1.AppDataSource.getRepository(user_1.User).findOneBy({ id: userId });
            const fullRequest = await stock_request_service_1.StockRequestService.stockRequestRepo.findOne({
                where: { id: request.id },
                relations: ["items", "items.product", "branch", "requestedBy"],
            });
            if (!fullRequest)
                throw new AppError_1.AppError("Request not found", 404);
            const doc = (0, pdfReceipt_1.generateApprovalReceipt)(fullRequest, user?.fullName || "Unknown");
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=approval-${request.id.substring(0, 8)}.pdf`);
            doc.pipe(res);
            doc.end();
            return;
        }
        return (0, response_1.sendResponse)(res, 200, true, "Stock request approved successfully", request);
    }
    static async dispatchRequest(req, res) {
        const { id } = req.params;
        const userId = req.user?.id;
        const request = await stock_request_service_1.StockRequestService.dispatchRequest(id, userId);
        // Check if PDF receipt is requested
        if (req.query.receipt === "pdf") {
            const user = await data_source_1.AppDataSource.getRepository(user_1.User).findOneBy({ id: userId });
            const fullRequest = await stock_request_service_1.StockRequestService.stockRequestRepo.findOne({
                where: { id: request.id },
                relations: ["items", "items.product", "branch", "requestedBy"],
            });
            if (!fullRequest)
                throw new AppError_1.AppError("Request not found", 404);
            const doc = (0, pdfReceipt_1.generateDispatchReceipt)(fullRequest, user?.fullName || "Unknown");
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=dispatch-${request.id.substring(0, 8)}.pdf`);
            doc.pipe(res);
            doc.end();
            return;
        }
        return (0, response_1.sendResponse)(res, 200, true, "Stock request dispatched successfully", request);
    }
    static async receiveStock(req, res) {
        const { id } = req.params;
        const { items } = req.body; // [{ productId, receivedQuantity, returnedQuantity, reason }]
        const userId = req.user?.id;
        if (!Array.isArray(items)) {
            throw new AppError_1.AppError("Items must be an array", 400);
        }
        const request = await stock_request_service_1.StockRequestService.receiveStock(id, items, userId);
        // Check if PDF receipt is requested
        if (req.query.receipt === "pdf") {
            const user = await data_source_1.AppDataSource.getRepository(user_1.User).findOneBy({ id: userId });
            const fullRequest = await stock_request_service_1.StockRequestService.stockRequestRepo.findOne({
                where: { id: request.id },
                relations: ["items", "items.product", "branch", "requestedBy"],
            });
            if (!fullRequest)
                throw new AppError_1.AppError("Request not found", 404);
            const doc = (0, pdfReceipt_1.generateReceiveReceipt)(fullRequest, user?.fullName || "Unknown");
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=received-${request.id.substring(0, 8)}.pdf`);
            doc.pipe(res);
            doc.end();
            return;
        }
        return (0, response_1.sendResponse)(res, 200, true, "Stock received successfully", request);
    }
    static async getAllReturns(req, res) {
        const returns = await stock_request_service_1.StockRequestService.getAllReturns();
        return (0, response_1.sendResponse)(res, 200, true, "Stock returns fetched successfully", returns);
    }
    static async getMyBranchReturns(req, res) {
        const branchId = req.user.branchId;
        const returns = await stock_request_service_1.StockRequestService.getBranchReturns(branchId);
        return (0, response_1.sendResponse)(res, 200, true, "My branch stock returns fetched successfully", returns);
    }
    static async getMyBranchRequests(req, res) {
        const branchId = req.user.branchId;
        const requests = await stock_request_service_1.StockRequestService.stockRequestRepo.find({
            where: { branch: { id: branchId } },
            relations: ["items", "branch", "requestedBy"],
        });
        return (0, response_1.sendResponse)(res, 200, true, "My branch stock requests fetched successfully", requests);
    }
    static async editRequestBeforeApproval(req, res) {
        const { id } = req.params;
        const { items } = req.body;
        const request = await stock_request_service_1.StockRequestService.editRequestBeforeApproval(id, items);
        return (0, response_1.sendResponse)(res, 200, true, "Stock request updated successfully", request);
    }
    static async getMyBranchDispatchedRequests(req, res) {
        const branchId = req.user.branchId;
        const response = await stock_request_service_1.StockRequestService.getMyBranchDispatchedRequests(branchId);
        return (0, response_1.sendResponse)(res, 200, true, "My branch dispatched stock requests fetched successfully", response);
    }
    static async getMyBranchReceivedRequests(req, res) {
        const branchId = req.user.branchId;
        const response = await stock_request_service_1.StockRequestService.getMyBranchReceivedRequests(branchId);
        return (0, response_1.sendResponse)(res, 200, true, "My branch received stock requests fetched successfully", response);
    }
    // Supervisor: get requests pending supervisor decision
    static async getSupervisorPendingRequests(req, res) {
        const requests = await stock_request_service_1.StockRequestService.getSupervisorPendingRequests();
        return (0, response_1.sendResponse)(res, 200, true, "Supervisor pending requests fetched successfully", requests);
    }
    // Supervisor: assign a branch to fulfill the request
    static async supervisorAssignBranch(req, res) {
        const { id } = req.params;
        const { branchId } = req.body;
        if (!branchId)
            throw new AppError_1.AppError("branchId is required", 400);
        const request = await stock_request_service_1.StockRequestService.supervisorAssignBranch(id, branchId);
        return (0, response_1.sendResponse)(res, 200, true, "Branch assigned successfully", request);
    }
    // Supervisor: forward request to central
    static async supervisorForwardToCentral(req, res) {
        const { id } = req.params;
        const request = await stock_request_service_1.StockRequestService.supervisorForwardToCentral(id);
        return (0, response_1.sendResponse)(res, 200, true, "Request forwarded to central successfully", request);
    }
    // Branch Manager: get requests assigned to my branch
    static async getAssignedToMyBranchRequests(req, res) {
        const branchId = req.user.branchId;
        const requests = await stock_request_service_1.StockRequestService.getAssignedToMyBranchRequests(branchId);
        return (0, response_1.sendResponse)(res, 200, true, "Assigned to my branch requests fetched successfully", requests);
    }
    // Branch Manager: approve from assigned branch
    static async approveFromBranch(req, res) {
        const { id } = req.params;
        const branchId = req.user.branchId;
        const userId = req.user?.id;
        const { items, note } = req.body;
        if (!Array.isArray(items))
            throw new AppError_1.AppError("Items must be an array", 400);
        if (items.length === 0)
            throw new AppError_1.AppError("At least one item must be approved", 400);
        const approvedItems = items.map((item, index) => {
            if (!item.productId)
                throw new AppError_1.AppError(`Missing productId at index ${index}`, 400);
            if (typeof item.approvedQuantity !== "number" ||
                isNaN(item.approvedQuantity))
                throw new AppError_1.AppError(`Invalid approvedQuantity for product ${item.productId}`, 400);
            return {
                productId: item.productId,
                approvedQuantity: item.approvedQuantity,
            };
        });
        const request = await stock_request_service_1.StockRequestService.approveFromBranch(id, branchId, approvedItems, note, userId);
        return (0, response_1.sendResponse)(res, 200, true, "Request approved and dispatched from branch successfully", request);
    }
    // New endpoint to download receipt for any existing request
    static async downloadReceipt(req, res) {
        const { id } = req.params;
        const userId = req.user?.id;
        const request = await stock_request_service_1.StockRequestService.stockRequestRepo.findOne({
            where: { id },
            relations: ["items", "items.product", "branch", "requestedBy"],
        });
        if (!request)
            throw new AppError_1.AppError("Stock request not found", 404);
        const user = await data_source_1.AppDataSource.getRepository(user_1.User).findOneBy({ id: userId });
        const userName = user?.fullName || "Unknown";
        let doc;
        let filename;
        switch (request.status) {
            case "PENDING":
            case "PENDING_SUPERVISOR":
            case "PENDING_BRANCH_APPROVAL":
                doc = (0, pdfReceipt_1.generateRequestCreatedReceipt)(request, request.requestedBy?.fullName || userName);
                filename = `stock-request-${id.substring(0, 8)}.pdf`;
                break;
            case "APPROVED":
                doc = (0, pdfReceipt_1.generateApprovalReceipt)(request, userName);
                filename = `approval-${id.substring(0, 8)}.pdf`;
                break;
            case "DISPATCHED":
                doc = (0, pdfReceipt_1.generateDispatchReceipt)(request, userName);
                filename = `dispatch-${id.substring(0, 8)}.pdf`;
                break;
            case "RECEIVED":
                doc = (0, pdfReceipt_1.generateReceiveReceipt)(request, userName);
                filename = `received-${id.substring(0, 8)}.pdf`;
                break;
            case "REJECTED":
                doc = (0, pdfReceipt_1.generateRequestCreatedReceipt)(request, request.requestedBy?.fullName || userName);
                filename = `rejected-${id.substring(0, 8)}.pdf`;
                break;
            default:
                doc = (0, pdfReceipt_1.generateRequestCreatedReceipt)(request, request.requestedBy?.fullName || userName);
                filename = `request-${id.substring(0, 8)}.pdf`;
        }
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
        doc.pipe(res);
        doc.end();
    }
}
exports.StockRequestController = StockRequestController;
