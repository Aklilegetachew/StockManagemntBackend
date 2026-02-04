"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
const role_service_1 = require("./role.service");
const response_1 = require("../../utils/response");
class RoleController {
    static async createRole(req, res) {
        const role = await role_service_1.RoleService.createRole(req.body);
        return (0, response_1.sendResponse)(res, 201, true, "Role created successfully", role);
    }
    static async getRoles(_req, res) {
        const roles = await role_service_1.RoleService.getRoles();
        return (0, response_1.sendResponse)(res, 200, true, "Roles fetched successfully", roles);
    }
    static async getRoleById(req, res) {
        const role = await role_service_1.RoleService.getRoleById(req.params.id);
        return (0, response_1.sendResponse)(res, 200, true, "Role fetched successfully", role);
    }
    static async updateRole(req, res) {
        const role = await role_service_1.RoleService.updateRole(req.params.id, req.body);
        return (0, response_1.sendResponse)(res, 200, true, "Role updated successfully", role);
    }
    static async deleteRole(req, res) {
        await role_service_1.RoleService.deleteRole(req.params.id);
        return (0, response_1.sendResponse)(res, 200, true, "Role deleted successfully", null);
    }
}
exports.RoleController = RoleController;
