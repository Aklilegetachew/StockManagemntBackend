"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const data_source_1 = require("../../data-source");
const Category_1 = require("../../entities/Category");
const AppError_1 = require("../../errors/AppError");
class CategoryService {
    static async createCategory(data) {
        if (!data.name) {
            throw new AppError_1.AppError("Category name is required", 400);
        }
        const exists = await this.categoryRepo.findOne({
            where: { name: data.name },
        });
        if (exists) {
            throw new AppError_1.AppError("Category with this name already exists", 409);
        }
        const category = this.categoryRepo.create(data);
        return this.categoryRepo.save(category);
    }
    static async getCategories() {
        return this.categoryRepo.find({
            order: {
                createdAt: "DESC",
            },
        });
    }
    static async getCategoryById(id) {
        const category = await this.categoryRepo.findOne({
            where: { id },
            relations: ["products"],
        });
        if (!category) {
            throw new AppError_1.AppError("Category not found", 404);
        }
        return category;
    }
    static async updateCategory(id, data) {
        const category = await this.getCategoryById(id);
        Object.assign(category, data);
        return this.categoryRepo.save(category);
    }
}
exports.CategoryService = CategoryService;
CategoryService.categoryRepo = data_source_1.AppDataSource.getRepository(Category_1.Category);
