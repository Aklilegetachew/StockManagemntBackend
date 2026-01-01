// src/modules/products/product.controller.ts
import { Request, Response } from "express"
import { ProductService } from "./product.service"
import { sendResponse } from "../../utils/response"

export class ProductController {
  static async createProduct(req: Request, res: Response) {
    const product = await ProductService.createProduct(req.body)
    return sendResponse(res, 201, true, "Product created successfully", product)
  }

  static async getProducts(_req: Request, res: Response) {
    const products = await ProductService.getProducts()
    return sendResponse(
      res,
      200,
      true,
      "Products fetched successfully",
      products
    )
  }

  static async getProductById(req: Request, res: Response) {
    const product = await ProductService.getProductById(req.params.id)
    return sendResponse(res, 200, true, "Product fetched successfully", product)
  }

  static async updateProduct(req: Request, res: Response) {
    const product = await ProductService.updateProduct(req.params.id, req.body)
    return sendResponse(res, 200, true, "Product updated successfully", product)
  }

  static async assignProductToBranch(req: Request, res: Response) {
    const result = await ProductService.assignProductToBranch(
      req.params.id,
      req.body.branchId,
      req.body.price,
      req.body.quantity
    )
    return sendResponse(
      res,
      201,
      true,
      "Product assigned to branch successfully",
      result
    )
  }
}
