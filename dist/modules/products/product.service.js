"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
// src/modules/products/product.service.ts
const data_source_1 = require("../../data-source");
const Product_1 = require("../../entities/Product");
const branches_1 = require("../../entities/branches");
const BranchProduct_1 = require("../../entities/BranchProduct");
const AppError_1 = require("../../errors/AppError");
const CentralStock_1 = require("../../entities/CentralStock");
class ProductService {
    static async createProduct(data) {
        const exists = await this.productRepo.findOne({
            where: [{ name: data.name }, { sku: data.sku }],
        });
        if (exists)
            throw new AppError_1.AppError("Product already exists", 409);
        // 1️⃣ Create product
        const product = this.productRepo.create(data);
        const savedProduct = await this.productRepo.save(product);
        // 2️⃣ Create corresponding central stock
        await this.centralStockRepo.save({
            product: { id: savedProduct.id },
            quantity: 0,
        });
        return savedProduct;
    }
    static async getProducts() {
        return this.productRepo.find({ where: { isActive: true } });
    }
    static async getProductById(id) {
        const product = await this.productRepo.findOneBy({ id });
        if (!product)
            throw new AppError_1.AppError("Product not found", 404);
        return product;
    }
    static async updateProduct(id, data) {
        const product = await this.getProductById(id);
        Object.assign(product, data);
        return this.productRepo.save(product);
    }
    static async assignProductToBranch(productId, branchId) {
        const product = await this.getProductById(productId);
        const branch = await this.branchRepo.findOneBy({
            id: branchId,
            isActive: true,
        });
        if (!branch)
            throw new AppError_1.AppError("Branch not found", 404);
        const exists = await this.branchProductRepo.findOne({
            where: { product, branch },
        });
        if (exists)
            return exists;
        const bp = this.branchProductRepo.create({
            product,
            branch,
            quantity: 0,
        });
        return this.branchProductRepo.save(bp);
    }
}
exports.ProductService = ProductService;
ProductService.productRepo = data_source_1.AppDataSource.getRepository(Product_1.Product);
ProductService.branchRepo = data_source_1.AppDataSource.getRepository(branches_1.Branch);
ProductService.branchProductRepo = data_source_1.AppDataSource.getRepository(BranchProduct_1.BranchProduct);
ProductService.centralStockRepo = data_source_1.AppDataSource.getRepository(CentralStock_1.CentralStock);
