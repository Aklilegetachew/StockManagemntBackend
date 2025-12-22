import { AppDataSource } from "../../data-source"
import { Role, RoleCode } from "../../entities/role"
import { AppError } from "../../errors/AppError"

export class RoleService {
  static roleRepo = AppDataSource.getRepository(Role)

  static async createRole(data: { name: string; code: RoleCode }) {
    const { name, code } = data

    const exists = await this.roleRepo.findOne({
      where: [{ name }, { code }],
    })

    if (exists) {
      throw new AppError("Role already exists", 409)
    }

    const role = this.roleRepo.create({ name, code })
    return this.roleRepo.save(role)
  }

  static async getRoles() {
    return this.roleRepo.find()
  }

  static async getRoleById(id: string) {
    const role = await this.roleRepo.findOneBy({ id })
    if (!role) throw new AppError("Role not found", 404)
    return role
  }

  static async updateRole(id: string, data: Partial<{ name: string }>) {
    const role = await this.getRoleById(id)

    Object.assign(role, data)
    return this.roleRepo.save(role)
  }

  static async deleteRole(id: string) {
    const role = await this.getRoleById(id)

    if (role.users?.length) {
      throw new AppError("Cannot delete role assigned to users", 400)
    }

    await this.roleRepo.remove(role)
  }
}
