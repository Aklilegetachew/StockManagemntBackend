"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = require("./product.service");
const response_1 = require("../../utils/response");
class ProductController {
    static async createProduct(req, res) {
        const product = await product_service_1.ProductService.createProduct(req.body);
        return (0, response_1.sendResponse)(res, 201, true, "Product created successfully", product);
    }
    static async getProducts(_req, res) {
        const products = await product_service_1.ProductService.getProducts();
        return (0, response_1.sendResponse)(res, 200, true, "Products fetched successfully", products);
    }
    static async getProductById(req, res) {
        const product = await product_service_1.ProductService.getProductById(req.params.id);
        return (0, response_1.sendResponse)(res, 200, true, "Product fetched successfully", product);
    }
    static async updateProduct(req, res) {
        const product = await product_service_1.ProductService.updateProduct(req.params.id, req.body);
        return (0, response_1.sendResponse)(res, 200, true, "Product updated successfully", product);
    }
    static async assignProductToBranch(req, res) {
        const result = await product_service_1.ProductService.assignProductToBranch(req.params.id, req.body.branchId, req.body.price, req.body.quantity);
        return (0, response_1.sendResponse)(res, 201, true, "Product assigned to branch successfully", result);
    }
}
exports.ProductController = ProductController;
