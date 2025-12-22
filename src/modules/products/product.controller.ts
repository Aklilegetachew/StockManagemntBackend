// src/modules/products/product.controller.ts
import { Request, Response } from "express";
import { ProductService } from "./product.service";

export class ProductController {
  static async createProduct(req: Request, res: Response) {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  }

  static async getProducts(_req: Request, res: Response) {
    const products = await ProductService.getProducts();
    res.json({ success: true, data: products });
  }

  static async getProductById(req: Request, res: Response) {
    const product = await ProductService.getProductById(req.params.id);
    res.json({ success: true, data: product });
  }

  static async updateProduct(req: Request, res: Response) {
    const product = await ProductService.updateProduct(
      req.params.id,
      req.body
    );
    res.json({ success: true, data: product });
  }

  static async assignProductToBranch(req: Request, res: Response) {
    const result = await ProductService.assignProductToBranch(
      req.params.id,
      req.body.branchId
    );
    res.status(201).json({ success: true, data: result });
  }
}
