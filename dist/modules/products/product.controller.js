"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = require("./product.service");
class ProductController {
    static async createProduct(req, res) {
        const product = await product_service_1.ProductService.createProduct(req.body);
        res.status(201).json({ success: true, data: product });
    }
    static async getProducts(_req, res) {
        const products = await product_service_1.ProductService.getProducts();
        res.json({ success: true, data: products });
    }
    static async getProductById(req, res) {
        const product = await product_service_1.ProductService.getProductById(req.params.id);
        res.json({ success: true, data: product });
    }
    static async updateProduct(req, res) {
        const product = await product_service_1.ProductService.updateProduct(req.params.id, req.body);
        res.json({ success: true, data: product });
    }
    static async assignProductToBranch(req, res) {
        const result = await product_service_1.ProductService.assignProductToBranch(req.params.id, req.body.branchId);
        res.status(201).json({ success: true, data: result });
    }
}
exports.ProductController = ProductController;
