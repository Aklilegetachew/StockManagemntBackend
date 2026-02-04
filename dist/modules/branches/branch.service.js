"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchService = void 0;
// src/modules/branches/branch.service.ts
const data_source_1 = require("../../data-source");
const branches_1 = require("../../entities/branches");
const BranchProduct_1 = require("../../entities/BranchProduct");
const AppError_1 = require("../../errors/AppError");
const role_1 = require("../../entities/role");
class BranchService {
    static async createBranch(data) {
        const exists = await this.branchRepo.findOneBy({ name: data.name });
        if (exists)
            throw new AppError_1.AppError("Branch already exists", 409);
        const branch = this.branchRepo.create(data);
        return this.branchRepo.save(branch);
    }
    static async getBranches() {
        return this.branchRepo.find({ where: { isActive: true } });
    }
    static async getMyBranch(user) {
        if (user.role !== role_1.RoleCode.BRANCH_MANAGER) {
            throw new AppError_1.AppError("Not a branch manager", 403);
        }
        if (!user.branchId) {
            throw new AppError_1.AppError("Branch not assigned", 400);
        }
        const branch = await this.branchRepo.findOneBy({
            id: user.branchId,
            isActive: true,
        });
        if (!branch)
            throw new AppError_1.AppError("Branch not found", 404);
        return branch;
    }
    static async updateBranch(id, data) {
        const branch = await this.branchRepo.findOneBy({ id });
        if (!branch)
            throw new AppError_1.AppError("Branch not found", 404);
        Object.assign(branch, data);
        return this.branchRepo.save(branch);
    }
    static async deactivateBranch(id) {
        const branch = await this.branchRepo.findOneBy({ id });
        if (!branch)
            throw new AppError_1.AppError("Branch not found", 404);
        branch.isActive = false;
        await this.branchRepo.save(branch);
    }
    static async getBranchStock(branchId) {
        const branch = await this.branchRepo.findOneBy({ id: branchId });
        if (!branch)
            throw new AppError_1.AppError("Branch not found", 404);
        const stocks = await this.branchProductRepo.find({
            where: { branch: { id: branchId } },
            relations: ["product"],
        });
        return {
            branch: {
                id: branch.id,
                name: branch.name,
                location: branch.location,
            },
            products: stocks.map((s) => ({
                productId: s.product.id,
                name: s.product.name,
                sku: s.product.sku,
                unit: s.product.unit,
                quantity: Number(s.quantity),
                price: Number(s.price),
            })),
        };
    }
    static async getBranchStockSummary() {
        const summary = await this.branchRepo
            .createQueryBuilder("branch")
            .leftJoin("branch.products", "bp")
            .select("branch.id", "branchId")
            .addSelect("branch.name", "branchName")
            .addSelect("COUNT(bp.id)", "totalProducts")
            .addSelect("SUM(bp.quantity)", "totalQuantity")
            .where("branch.isActive = :isActive", { isActive: true })
            .groupBy("branch.id")
            .getRawMany();
        return summary.map((s) => ({
            branchId: s.branchId,
            branchName: s.branchName,
            totalProducts: Number(s.totalProducts),
            totalQuantity: Number(s.totalQuantity || 0),
        }));
    }
}
exports.BranchService = BranchService;
BranchService.branchRepo = data_source_1.AppDataSource.getRepository(branches_1.Branch);
BranchService.branchProductRepo = data_source_1.AppDataSource.getRepository(BranchProduct_1.BranchProduct);
