"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockRequestService = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../../data-source");
const StockRequest_1 = require("../../entities/StockRequest");
const StockRequestItem_1 = require("../../entities/StockRequestItem");
const StockRequestReturn_1 = require("../../entities/StockRequestReturn");
const BranchProduct_1 = require("../../entities/BranchProduct");
const CentralStock_1 = require("../../entities/CentralStock");
const AppError_1 = require("../../errors/AppError");
const branches_1 = require("../../entities/branches");
const Product_1 = require("../../entities/Product");
const user_1 = require("../../entities/user");
const StockMovement_1 = require("../../entities/StockMovement");
const helperFunction_1 = require("../../utils/helperFunction");
class StockRequestService {
    // Branch creates multi-product stock request
    static async createRequest(branchId, userId, items, urgency) {
        if (!items.length)
            throw new AppError_1.AppError("At least one product is required", 400);
        const branch = await this.branchRepo.findOneBy({
            id: branchId,
            isActive: true,
        });
        if (!branch)
            throw new AppError_1.AppError("Branch not found", 404);
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user)
            throw new AppError_1.AppError("User not found", 404);
        const stockRequestItems = [];
        for (const item of items) {
            if (item.quantity <= 0)
                throw new AppError_1.AppError("Requested quantity must be greater than zero", 400);
            const product = await this.productRepo.findOneBy({
                id: item.productId,
                isActive: true,
            });
            if (!product)
                throw new AppError_1.AppError(`Product not found: ${item.productId}`, 404);
            stockRequestItems.push(this.stockRequestItemRepo.create({
                product,
                requestedQuantity: item.quantity,
            }));
        }
        const isUrgent = urgency === true;
        const stockRequest = this.stockRequestRepo.create({
            branch,
            requestedBy: user,
            items: stockRequestItems,
            status: isUrgent ? StockRequest_1.StockRequestStatus.PENDING_SUPERVISOR : StockRequest_1.StockRequestStatus.PENDING,
            urgency: isUrgent,
        });
        return this.stockRequestRepo.save(stockRequest);
    }
    // Central views requests (excludes supervisor-specific statuses)
    static async getCentralRequests() {
        return await this.stockRequestRepo.find({
            where: {
                status: (0, typeorm_1.Not)((0, typeorm_1.In)([
                    StockRequest_1.StockRequestStatus.PENDING_SUPERVISOR,
                    StockRequest_1.StockRequestStatus.PENDING_BRANCH_APPROVAL,
                ])),
            },
            relations: ["items", "branch", "requestedBy", "assignedBranch"],
            order: { createdAt: "DESC" },
        });
    }
    // Central approves request (can be partial)
    static async approveRequest(requestId, approvedItems, note) {
        const request = await this.stockRequestRepo.findOne({
            where: { id: requestId },
            relations: ["items", "items.product"],
        });
        if (!request) {
            throw new AppError_1.AppError("Stock request not found", 404);
        }
        if (request.status !== StockRequest_1.StockRequestStatus.PENDING) {
            throw new AppError_1.AppError("Only pending requests can be approved", 409);
        }
        if (!Array.isArray(request.items)) {
            throw new AppError_1.AppError("Stock request items are corrupted", 500);
        }
        // Map for O(1) lookup
        const requestItemMap = new Map(request.items.map((item) => [item.product.id, item]));
        for (const approvedItem of approvedItems) {
            const item = requestItemMap.get(approvedItem.productId);
            if (!item) {
                throw new AppError_1.AppError(`Product ${approvedItem.productId} is not part of this request`, 404);
            }
            if (approvedItem.approvedQuantity < 0) {
                throw new AppError_1.AppError(`Approved quantity cannot be negative (${item.product.name})`, 400);
            }
            if (approvedItem.approvedQuantity > item.requestedQuantity) {
                throw new AppError_1.AppError(`Approved quantity exceeds requested quantity for ${item.product.name}`, 400);
            }
            // Check if central stock has enough quantity
            if (approvedItem.approvedQuantity > 0) {
                const centralStock = await this.centralStockRepo.findOne({
                    where: { product: { id: item.product.id } },
                });
                const availableQty = centralStock ? Number(centralStock.quantity) : 0;
                if (approvedItem.approvedQuantity > availableQty) {
                    throw new AppError_1.AppError(`Insufficient central stock for ${item.product.name}. Available: ${availableQty}, Requested: ${approvedItem.approvedQuantity}`, 400);
                }
            }
            item.approvedQuantity = approvedItem.approvedQuantity;
        }
        // Determine final status
        const fullyApproved = request.items.every((i) => i.approvedQuantity === i.requestedQuantity);
        request.status = StockRequest_1.StockRequestStatus.APPROVED;
        request.approvedAt = new Date();
        request.note = note ?? "";
        return this.stockRequestRepo.save(request);
    }
    // Dispatch only approved quantities with transaction
    static async dispatchRequest(requestId, dispatcherId) {
        return await data_source_1.AppDataSource.transaction(async (manager) => {
            const requestRepo = manager.getRepository(StockRequest_1.StockRequest);
            const centralStockRepo = manager.getRepository(CentralStock_1.CentralStock);
            const movementRepo = manager.getRepository(StockMovement_1.StockMovement);
            const userRepo = manager.getRepository(user_1.User);
            const request = await requestRepo.findOne({
                where: { id: requestId },
                relations: ["items", "items.product", "branch", "requestedBy"],
            });
            if (!request)
                throw new AppError_1.AppError("Stock request not found", 404);
            if (request.status !== StockRequest_1.StockRequestStatus.APPROVED)
                throw new AppError_1.AppError("Only approved requests can be dispatched", 400);
            // Fetch dispatcher user if provided
            let approvedBy;
            if (dispatcherId) {
                const user = await userRepo.findOneBy({ id: dispatcherId });
                if (user)
                    approvedBy = user;
            }
            for (const item of request.items) {
                const approvedQty = Number(item.approvedQuantity ?? 0);
                if (approvedQty <= 0)
                    continue;
                const centralStock = await centralStockRepo.findOne({
                    where: { product: { id: item.product.id } },
                });
                if (!centralStock)
                    throw new AppError_1.AppError(`Central stock missing for product: ${item.product.name}`, 400);
                const currentQty = Number(centralStock.quantity);
                if (approvedQty > currentQty)
                    throw new AppError_1.AppError(`Insufficient stock for product: ${item.product.name}`, 400);
                centralStock.quantity = (0, helperFunction_1.roundQty)(currentQty - approvedQty);
                await centralStockRepo.save(centralStock);
                await movementRepo.save({
                    product: item.product,
                    type: StockMovement_1.StockMovementType.DEDUCTION,
                    quantity: approvedQty,
                    reference: request.id,
                    note: `Dispatched to ${request.branch.name}`,
                    requestedBy: request.requestedBy,
                    approvedBy: approvedBy,
                });
            }
            request.status = StockRequest_1.StockRequestStatus.DISPATCHED;
            request.dispatchedAt = new Date();
            return requestRepo.save(request);
        });
    }
    static async receiveStock(requestId, receivingItems, userId) {
        return await data_source_1.AppDataSource.transaction(async (manager) => {
            const requestRepo = manager.getRepository(StockRequest_1.StockRequest);
            const branchProductRepo = manager.getRepository(BranchProduct_1.BranchProduct);
            const movementRepo = manager.getRepository(StockMovement_1.StockMovement);
            const returnRepo = manager.getRepository(StockRequestReturn_1.StockRequestReturn);
            const userRepo = manager.getRepository(user_1.User);
            const request = await requestRepo.findOne({
                where: { id: requestId },
                relations: ["items", "items.product", "branch", "requestedBy"],
            });
            if (!request)
                throw new AppError_1.AppError("Stock request not found", 404);
            if (request.status !== StockRequest_1.StockRequestStatus.DISPATCHED)
                throw new AppError_1.AppError("Only dispatched requests can be received", 400);
            const reportedBy = userId
                ? await userRepo.findOneBy({ id: userId })
                : undefined;
            // Map for easier access
            const itemMap = new Map(request.items.map((i) => [i.product.id, i]));
            for (const receiveInfo of receivingItems) {
                const item = itemMap.get(receiveInfo.productId);
                if (!item) {
                    throw new AppError_1.AppError(`Product ${receiveInfo.productId} is not part of this request`, 404);
                }
                const approvedQty = Number(item.approvedQuantity ?? 0);
                const totalReporting = Number(receiveInfo.receivedQuantity) +
                    Number(receiveInfo.returnedQuantity);
                if (totalReporting > approvedQty) {
                    throw new AppError_1.AppError(`Total received and returned (${totalReporting}) for ${item.product.name} exceeds approved amount (${approvedQty})`, 400);
                }
                // 1. Handle received portion
                if (receiveInfo.receivedQuantity > 0) {
                    let branchProduct = await branchProductRepo.findOne({
                        where: {
                            branch: { id: request.branch.id },
                            product: { id: item.product.id },
                        },
                    });
                    if (!branchProduct) {
                        branchProduct = branchProductRepo.create({
                            branch: request.branch,
                            product: item.product,
                            quantity: (0, helperFunction_1.roundQty)(receiveInfo.receivedQuantity),
                        });
                    }
                    else {
                        const currentQty = Number(branchProduct.quantity);
                        branchProduct.quantity = (0, helperFunction_1.roundQty)(currentQty + receiveInfo.receivedQuantity);
                    }
                    await branchProductRepo.save(branchProduct);
                    await movementRepo.save({
                        product: item.product,
                        branch: request.branch,
                        type: StockMovement_1.StockMovementType.ADDITION,
                        quantity: receiveInfo.receivedQuantity,
                        reference: request.id,
                        note: "Received from central",
                        requestedBy: request.requestedBy,
                    });
                }
                // 2. Handle returned portion
                if (receiveInfo.returnedQuantity > 0) {
                    const stockReturn = returnRepo.create({
                        stockRequest: request,
                        stockRequestItem: item,
                        branch: request.branch,
                        quantity: receiveInfo.returnedQuantity,
                        reason: receiveInfo.reason || "Damaged/Defective",
                        reportedBy: reportedBy || undefined,
                    });
                    await returnRepo.save(stockReturn);
                }
                // 3. Update request item record
                item.receivedQuantity = receiveInfo.receivedQuantity;
                item.returnedQuantity = receiveInfo.returnedQuantity;
                await manager.getRepository(StockRequestItem_1.StockRequestItem).save(item);
            }
            request.status = StockRequest_1.StockRequestStatus.RECEIVED;
            request.receivedAt = new Date();
            return requestRepo.save(request);
        });
    }
    static async getAllReturns() {
        return await this.stockRequestReturnRepo.find({
            relations: [
                "stockRequest",
                "stockRequestItem",
                "stockRequestItem.product",
                "branch",
                "reportedBy",
            ],
            order: { returnedAt: "DESC" },
        });
    }
    static async getBranchReturns(branchId) {
        return await this.stockRequestReturnRepo.find({
            where: { branch: { id: branchId } },
            relations: [
                "stockRequest",
                "stockRequestItem",
                "stockRequestItem.product",
                "branch",
                "reportedBy",
            ],
            order: { returnedAt: "DESC" },
        });
    }
    static async editRequestBeforeApproval(requestId, items) {
        const request = await this.stockRequestRepo.findOne({
            where: { id: requestId },
            relations: ["items", "items.product", "branch"],
        });
        if (!request)
            throw new AppError_1.AppError("Stock request not found", 404);
        if (request.status !== StockRequest_1.StockRequestStatus.PENDING &&
            request.status !== StockRequest_1.StockRequestStatus.PENDING_SUPERVISOR)
            throw new AppError_1.AppError("Only pending requests can be edited", 400);
        for (const item of items) {
            const requestItem = request.items.find((i) => i.product.id === item.productId);
            if (!requestItem)
                throw new AppError_1.AppError(`Item not found: ${item.productId}`, 404);
            requestItem.requestedQuantity = item.quantity;
        }
        return this.stockRequestRepo.save(request);
    }
    static async getMyBranchDispatchedRequests(branchId) {
        const requests = await this.stockRequestRepo.find({
            where: {
                branch: { id: branchId },
                status: StockRequest_1.StockRequestStatus.DISPATCHED,
            },
            relations: ["items", "branch", "requestedBy"],
        });
        return requests;
    }
    static async getMyBranchReceivedRequests(branchId) {
        const requests = await this.stockRequestRepo.find({
            where: {
                branch: { id: branchId },
                status: StockRequest_1.StockRequestStatus.RECEIVED,
            },
            relations: ["items", "branch", "requestedBy"],
        });
        return requests;
    }
    // Supervisor: get requests pending supervisor decision
    static async getSupervisorPendingRequests() {
        return await this.stockRequestRepo.find({
            where: { status: StockRequest_1.StockRequestStatus.PENDING_SUPERVISOR },
            relations: ["items", "items.product", "branch", "requestedBy"],
            order: { createdAt: "ASC" },
        });
    }
    // Supervisor: assign a branch to fulfill the request
    static async supervisorAssignBranch(requestId, branchId) {
        const request = await this.stockRequestRepo.findOne({
            where: { id: requestId },
            relations: ["items", "items.product", "branch", "assignedBranch"],
        });
        if (!request)
            throw new AppError_1.AppError("Stock request not found", 404);
        if (request.status !== StockRequest_1.StockRequestStatus.PENDING_SUPERVISOR)
            throw new AppError_1.AppError("Only requests pending supervisor decision can be assigned", 409);
        const assignedBranch = await this.branchRepo.findOneBy({
            id: branchId,
            isActive: true,
        });
        if (!assignedBranch)
            throw new AppError_1.AppError("Branch not found", 404);
        if (assignedBranch.id === request.branch.id)
            throw new AppError_1.AppError("Cannot assign the requesting branch to fulfill its own request", 400);
        request.assignedBranch = assignedBranch;
        request.status = StockRequest_1.StockRequestStatus.PENDING_BRANCH_APPROVAL;
        return this.stockRequestRepo.save(request);
    }
    // Supervisor: forward request to central
    static async supervisorForwardToCentral(requestId) {
        const request = await this.stockRequestRepo.findOne({
            where: { id: requestId },
            relations: ["items", "items.product", "branch"],
        });
        if (!request)
            throw new AppError_1.AppError("Stock request not found", 404);
        if (request.status !== StockRequest_1.StockRequestStatus.PENDING_SUPERVISOR)
            throw new AppError_1.AppError("Only requests pending supervisor decision can be forwarded", 409);
        request.supervisorForwardedToCentral = true;
        request.status = StockRequest_1.StockRequestStatus.PENDING;
        return this.stockRequestRepo.save(request);
    }
    // Branch Manager: get requests assigned to my branch
    static async getAssignedToMyBranchRequests(branchId) {
        return await this.stockRequestRepo.find({
            where: {
                assignedBranch: { id: branchId },
                status: StockRequest_1.StockRequestStatus.PENDING_BRANCH_APPROVAL,
            },
            relations: ["items", "items.product", "branch", "assignedBranch", "requestedBy"],
            order: { createdAt: "ASC" },
        });
    }
    // Branch Manager: approve from assigned branch (deduct from BranchProduct)
    static async approveFromBranch(requestId, branchId, approvedItems, note, approverId) {
        return await data_source_1.AppDataSource.transaction(async (manager) => {
            const requestRepo = manager.getRepository(StockRequest_1.StockRequest);
            const branchProductRepo = manager.getRepository(BranchProduct_1.BranchProduct);
            const movementRepo = manager.getRepository(StockMovement_1.StockMovement);
            const stockRequestItemRepo = manager.getRepository(StockRequestItem_1.StockRequestItem);
            const userRepo = manager.getRepository(user_1.User);
            const request = await requestRepo.findOne({
                where: { id: requestId },
                relations: ["items", "items.product", "branch", "assignedBranch", "requestedBy"],
            });
            if (!request)
                throw new AppError_1.AppError("Stock request not found", 404);
            if (request.status !== StockRequest_1.StockRequestStatus.PENDING_BRANCH_APPROVAL)
                throw new AppError_1.AppError("Only requests pending branch approval can be approved", 409);
            if (!request.assignedBranch || request.assignedBranch.id !== branchId)
                throw new AppError_1.AppError("This request is not assigned to your branch", 403);
            const requestItemMap = new Map(request.items.map((item) => [item.product.id, item]));
            for (const approvedItem of approvedItems) {
                const item = requestItemMap.get(approvedItem.productId);
                if (!item)
                    throw new AppError_1.AppError(`Product ${approvedItem.productId} is not part of this request`, 404);
                if (approvedItem.approvedQuantity < 0)
                    throw new AppError_1.AppError(`Approved quantity cannot be negative (${item.product.name})`, 400);
                if (approvedItem.approvedQuantity > item.requestedQuantity)
                    throw new AppError_1.AppError(`Approved quantity exceeds requested quantity for ${item.product.name}`, 400);
                if (approvedItem.approvedQuantity > 0) {
                    const branchProduct = await branchProductRepo.findOne({
                        where: {
                            branch: { id: branchId },
                            product: { id: item.product.id },
                        },
                    });
                    const availableQty = branchProduct
                        ? Number(branchProduct.quantity)
                        : 0;
                    if (approvedItem.approvedQuantity > availableQty)
                        throw new AppError_1.AppError(`Insufficient stock for ${item.product.name}. Available: ${availableQty}, Requested: ${approvedItem.approvedQuantity}`, 400);
                }
            }
            let approvedBy;
            if (approverId) {
                const user = await userRepo.findOneBy({ id: approverId });
                if (user)
                    approvedBy = user;
            }
            for (const approvedItem of approvedItems) {
                const item = requestItemMap.get(approvedItem.productId);
                const approvedQty = approvedItem.approvedQuantity;
                item.approvedQuantity = approvedQty;
                await stockRequestItemRepo.save(item);
                if (approvedQty <= 0)
                    continue;
                const branchProduct = await branchProductRepo.findOne({
                    where: {
                        branch: { id: branchId },
                        product: { id: item.product.id },
                    },
                });
                if (!branchProduct)
                    throw new AppError_1.AppError(`Branch stock missing for product: ${item.product.name}`, 400);
                const currentQty = Number(branchProduct.quantity);
                if (approvedQty > currentQty)
                    throw new AppError_1.AppError(`Insufficient stock for product: ${item.product.name}`, 400);
                branchProduct.quantity = (0, helperFunction_1.roundQty)(currentQty - approvedQty);
                await branchProductRepo.save(branchProduct);
                await movementRepo.save({
                    product: item.product,
                    branch: request.assignedBranch,
                    type: StockMovement_1.StockMovementType.DEDUCTION,
                    quantity: approvedQty,
                    reference: request.id,
                    note: `Dispatched to ${request.branch.name} (branch-to-branch)`,
                    requestedBy: request.requestedBy,
                    approvedBy: approvedBy,
                });
            }
            request.status = StockRequest_1.StockRequestStatus.DISPATCHED;
            request.approvedAt = new Date();
            request.dispatchedAt = new Date();
            request.note = note ?? "";
            return requestRepo.save(request);
        });
    }
}
exports.StockRequestService = StockRequestService;
StockRequestService.stockRequestRepo = data_source_1.AppDataSource.getRepository(StockRequest_1.StockRequest);
StockRequestService.stockRequestItemRepo = data_source_1.AppDataSource.getRepository(StockRequestItem_1.StockRequestItem);
StockRequestService.branchProductRepo = data_source_1.AppDataSource.getRepository(BranchProduct_1.BranchProduct);
StockRequestService.centralStockRepo = data_source_1.AppDataSource.getRepository(CentralStock_1.CentralStock);
StockRequestService.branchRepo = data_source_1.AppDataSource.getRepository(branches_1.Branch);
StockRequestService.productRepo = data_source_1.AppDataSource.getRepository(Product_1.Product);
StockRequestService.userRepo = data_source_1.AppDataSource.getRepository(user_1.User);
StockRequestService.stockRequestReturnRepo = data_source_1.AppDataSource.getRepository(StockRequestReturn_1.StockRequestReturn);
