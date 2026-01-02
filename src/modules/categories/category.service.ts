import { AppDataSource } from "../../data-source"
import { Category } from "../../entities/Category"
import { AppError } from "../../errors/AppError"

export class CategoryService {
  static categoryRepo = AppDataSource.getRepository(Category)

  static async createCategory(data: Partial<Category>) {
    if (!data.name) {
      throw new AppError("Category name is required", 400)
    }

    const exists = await this.categoryRepo.findOne({
      where: { name: data.name },
    })

    if (exists) {
      throw new AppError("Category with this name already exists", 409)
    }

    const category = this.categoryRepo.create(data)
    return this.categoryRepo.save(category)
  }

  static async getCategories() {
    return this.categoryRepo.find({
      order: {
        createdAt: "DESC",
      },
    })
  }

  static async getCategoryById(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ["products"],
    })

    if (!category) {
      throw new AppError("Category not found", 404)
    }

    return category
  }

  static async updateCategory(id: string, data: Partial<Category>) {
    const category = await this.getCategoryById(id)

    Object.assign(category, data)
    return this.categoryRepo.save(category)
  }
}
