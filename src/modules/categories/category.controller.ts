import { Request, Response, NextFunction } from "express" // turbo
import { CategoryService } from "./category.service"
import { sendResponse } from "../../utils/response"

export class CategoryController {
  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.createCategory(req.body)
      return sendResponse(
        res,
        201,
        true,
        "Category created successfully",
        category
      )
    } catch (error) {
      next(error)
    }
  }

  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getCategories()
      return sendResponse(
        res,
        200,
        true,
        "Categories fetched successfully",
        categories
      )
    } catch (error) {
      next(error)
    }
  }

  static async getCategoryById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params
      const category = await CategoryService.getCategoryById(id)
      return sendResponse(
        res,
        200,
        true,
        "Category fetched successfully",
        category
      )
    } catch (error) {
      next(error)
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const category = await CategoryService.updateCategory(id, req.body)
      return sendResponse(
        res,
        200,
        true,
        "Category updated successfully",
        category
      )
    } catch (error) {
      next(error)
    }
  }
}
