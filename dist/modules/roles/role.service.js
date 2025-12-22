"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const data_source_1 = require("../../data-source");
const role_1 = require("../../entities/role");
const AppError_1 = require("../../errors/AppError");
class RoleService {
    static async createRole(data) {
        const { name, code } = data;
        const exists = await this.roleRepo.findOne({
            where: [{ name }, { code }],
        });
        if (exists) {
            throw new AppError_1.AppError("Role already exists", 409);
        }
        const role = this.roleRepo.create({ name, code });
        return this.roleRepo.save(role);
    }
    static async getRoles() {
        return this.roleRepo.find();
    }
    static async getRoleById(id) {
        const role = await this.roleRepo.findOneBy({ id });
        if (!role)
            throw new AppError_1.AppError("Role not found", 404);
        return role;
    }
    static async updateRole(id, data) {
        const role = await this.getRoleById(id);
        Object.assign(role, data);
        return this.roleRepo.save(role);
    }
    static async deleteRole(id) {
        const role = await this.getRoleById(id);
        if (role.users?.length) {
            throw new AppError_1.AppError("Cannot delete role assigned to users", 400);
        }
        await this.roleRepo.remove(role);
    }
}
exports.RoleService = RoleService;
RoleService.roleRepo = data_source_1.AppDataSource.getRepository(role_1.Role);
