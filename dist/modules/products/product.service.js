"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
// src/modules/products/product.service.ts
const data_source_1 = require("../../data-source");
const Product_1 = require("../../entities/Product");
const branches_1 = require("../../entities/branches");
const BranchProduct_1 = require("../../entities/BranchProduct");
const CentralStock_1 = require("../../entities/CentralStock");
const AppError_1 = require("../../errors/AppError");
class ProductService {
    // -------------------------
    // Product
    // -------------------------
    static async createProduct(data) {
        if (!data.name || !data.sku) {
            throw new AppError_1.AppError("Product name and SKU are required", 400);
        }
        const exists = await this.productRepo.findOne({
            where: { name: data.name },
        });
        if (exists) {
            throw new AppError_1.AppError("A product with the same name already exists", 409);
        }
        const checkSku = await this.productRepo.findOne({
            where: { sku: data.sku },
        });
        if (checkSku) {
            throw new AppError_1.AppError("A product with the same SKU already exists", 409);
        }
        const product = this.productRepo.create(data);
        if (data.categoryId) {
            product.category = { id: data.categoryId };
        }
        const savedProduct = await this.productRepo.save(product);
        // Ensure central stock is created once
        await this.centralStockRepo.save({
            product: { id: savedProduct.id },
            quantity: 0,
        });
        return savedProduct;
    }
    static async getProducts() {
        return this.productRepo.find({
            where: { isActive: true },
            relations: ["category"],
        });
    }
    static async getProductById(id) {
        const product = await this.productRepo.findOne({
            where: { id },
            relations: ["category"],
        });
        if (!product) {
            throw new AppError_1.AppError("Product not found", 404);
        }
        return product;
    }
    static async updateProduct(id, data) {
        const product = await this.getProductById(id);
        // Optional guard: prevent changing immutable fields
        if ("id" in data) {
            delete data.id;
        }
        if (data.sku && data.sku !== product.sku) {
            const checkSku = await this.productRepo.findOne({
                where: { sku: data.sku },
            });
            if (checkSku) {
                throw new AppError_1.AppError("A product with the same SKU already exists", 409);
            }
        }
        if (data.categoryId) {
            product.category = { id: data.categoryId };
        }
        Object.assign(product, data);
        return this.productRepo.save(product);
    }
    // -------------------------
    // Branch assignment
    // -------------------------
    static async assignProductToBranch(productId, branchId, price, quantity) {
        if (price < 0 || quantity < 0) {
            throw new AppError_1.AppError("Price and quantity must be non-negative", 400);
        }
        const product = await this.getProductById(productId);
        const branch = await this.branchRepo.findOne({
            where: { id: branchId, isActive: true },
        });
        if (!branch) {
            throw new AppError_1.AppError("Branch not found or inactive", 404);
        }
        const alreadyAssigned = await this.branchProductRepo.findOne({
            where: {
                product: { id: product.id },
                branch: { id: branch.id },
            },
        });
        if (alreadyAssigned) {
            throw new AppError_1.AppError("This product is already assigned to the branch", 409);
        }
        const branchProduct = this.branchProductRepo.create({
            product,
            branch,
            price,
            quantity,
        });
        return this.branchProductRepo.save(branchProduct);
    }
}
exports.ProductService = ProductService;
ProductService.productRepo = data_source_1.AppDataSource.getRepository(Product_1.Product);
ProductService.branchRepo = data_source_1.AppDataSource.getRepository(branches_1.Branch);
ProductService.branchProductRepo = data_source_1.AppDataSource.getRepository(BranchProduct_1.BranchProduct);
ProductService.centralStockRepo = data_source_1.AppDataSource.getRepository(CentralStock_1.CentralStock);
