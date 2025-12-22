"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchController = void 0;
const branch_service_1 = require("./branch.service");
class BranchController {
    static async createBranch(req, res) {
        const branch = await branch_service_1.BranchService.createBranch(req.body);
        res.status(201).json({ success: true, data: branch });
    }
    static async getBranches(_req, res) {
        const branches = await branch_service_1.BranchService.getBranches();
        res.json({ success: true, data: branches });
    }
    static async getMyBranch(req, res) {
        const branch = await branch_service_1.BranchService.getMyBranch(req.user);
        res.json({ success: true, data: branch });
    }
    static async updateBranch(req, res) {
        const branch = await branch_service_1.BranchService.updateBranch(req.params.id, req.body);
        res.json({ success: true, data: branch });
    }
    static async deactivateBranch(req, res) {
        await branch_service_1.BranchService.deactivateBranch(req.params.id);
        res.status(204).send();
    }
}
exports.BranchController = BranchController;
