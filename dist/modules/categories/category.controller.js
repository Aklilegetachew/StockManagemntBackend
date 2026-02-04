"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const category_service_1 = require("./category.service");
const response_1 = require("../../utils/response");
class CategoryController {
    static async createCategory(req, res, next) {
        try {
            const category = await category_service_1.CategoryService.createCategory(req.body);
            return (0, response_1.sendResponse)(res, 201, true, "Category created successfully", category);
        }
        catch (error) {
            next(error);
        }
    }
    static async getCategories(req, res, next) {
        try {
            const categories = await category_service_1.CategoryService.getCategories();
            return (0, response_1.sendResponse)(res, 200, true, "Categories fetched successfully", categories);
        }
        catch (error) {
            next(error);
        }
    }
    static async getCategoryById(req, res, next) {
        try {
            const { id } = req.params;
            const category = await category_service_1.CategoryService.getCategoryById(id);
            return (0, response_1.sendResponse)(res, 200, true, "Category fetched successfully", category);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateCategory(req, res, next) {
        try {
            const { id } = req.params;
            const category = await category_service_1.CategoryService.updateCategory(id, req.body);
            return (0, response_1.sendResponse)(res, 200, true, "Category updated successfully", category);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CategoryController = CategoryController;
