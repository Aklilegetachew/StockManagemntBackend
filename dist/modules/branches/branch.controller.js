"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchController = void 0;
const branch_service_1 = require("./branch.service");
const response_1 = require("../../utils/response");
class BranchController {
    static async createBranch(req, res) {
        const branch = await branch_service_1.BranchService.createBranch(req.body);
        return (0, response_1.sendResponse)(res, 201, true, "Branch created successfully", branch);
    }
    static async getBranches(_req, res) {
        const branches = await branch_service_1.BranchService.getBranches();
        return (0, response_1.sendResponse)(res, 200, true, "Branches fetched successfully", branches);
    }
    static async getMyBranch(req, res) {
        const branch = await branch_service_1.BranchService.getMyBranch(req.user);
        return (0, response_1.sendResponse)(res, 200, true, "Branch fetched successfully", branch);
    }
    static async updateBranch(req, res) {
        const branch = await branch_service_1.BranchService.updateBranch(req.params.id, req.body);
        return (0, response_1.sendResponse)(res, 200, true, "Branch updated successfully", branch);
    }
    static async deactivateBranch(req, res) {
        await branch_service_1.BranchService.deactivateBranch(req.params.id);
        return (0, response_1.sendResponse)(res, 200, true, "Branch deactivated successfully", null);
    }
    static async getBranchStock(req, res) {
        const stock = await branch_service_1.BranchService.getBranchStock(req.params.id);
        return (0, response_1.sendResponse)(res, 200, true, "Branch stock fetched successfully", stock);
    }
    static async getBranchStockSummary(req, res) {
        const summary = await branch_service_1.BranchService.getBranchStockSummary();
        return (0, response_1.sendResponse)(res, 200, true, "Branch stock summary fetched successfully", summary);
    }
}
exports.BranchController = BranchController;
