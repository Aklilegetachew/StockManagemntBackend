"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
const role_service_1 = require("./role.service");
class RoleController {
    static async createRole(req, res) {
        const role = await role_service_1.RoleService.createRole(req.body);
        res.status(201).json({ success: true, data: role });
    }
    static async getRoles(_req, res) {
        const roles = await role_service_1.RoleService.getRoles();
        res.json({ success: true, data: roles });
    }
    static async getRoleById(req, res) {
        const role = await role_service_1.RoleService.getRoleById(req.params.id);
        res.json({ success: true, data: role });
    }
    static async updateRole(req, res) {
        const role = await role_service_1.RoleService.updateRole(req.params.id, req.body);
        res.json({ success: true, data: role });
    }
    static async deleteRole(req, res) {
        await role_service_1.RoleService.deleteRole(req.params.id);
        res.status(204).send();
    }
}
exports.RoleController = RoleController;
