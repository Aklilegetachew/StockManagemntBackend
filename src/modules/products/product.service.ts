// src/modules/products/product.service.ts
import { AppDataSource } from "../../data-source"
import { Product } from "../../entities/Product"
import { Branch } from "../../entities/branches"
import { BranchProduct } from "../../entities/BranchProduct"
import { CentralStock } from "../../entities/CentralStock"
import { AppError } from "../../errors/AppError"

export class ProductService {
  static productRepo = AppDataSource.getRepository(Product)
  static branchRepo = AppDataSource.getRepository(Branch)
  static branchProductRepo = AppDataSource.getRepository(BranchProduct)
  static centralStockRepo = AppDataSource.getRepository(CentralStock)

  // -------------------------
  // Product
  // -------------------------
  static async createProduct(data: Partial<Product>) {
    if (!data.name || !data.sku) {
      throw new AppError("Product name and SKU are required", 400)
    }

    const exists = await this.productRepo.findOne({
      where: [{ name: data.name }, { sku: data.sku }],
    })

    if (exists) {
      throw new AppError(
        "A product with the same name or SKU already exists",
        409
      )
    }

    const product = this.productRepo.create(data)
    const savedProduct = await this.productRepo.save(product)

    // Ensure central stock is created once
    await this.centralStockRepo.save({
      product: { id: savedProduct.id },
      quantity: 0,
    })

    return savedProduct
  }

  static async getProducts() {
    return this.productRepo.find({ where: { isActive: true } })
  }

  static async getProductById(id: string) {
    const product = await this.productRepo.findOneBy({ id })

    if (!product) {
      throw new AppError("Product not found", 404)
    }

    return product
  }

  static async updateProduct(id: string, data: Partial<Product>) {
    const product = await this.getProductById(id)

    // Optional guard: prevent changing immutable fields
    if ("id" in data || "sku" in data) {
      throw new AppError("Cannot update immutable product fields", 400)
    }

    Object.assign(product, data)
    return this.productRepo.save(product)
  }

  // -------------------------
  // Branch assignment
  // -------------------------
  static async assignProductToBranch(
    productId: string,
    branchId: string,
    price: number,
    quantity: number
  ) {
    if (price < 0 || quantity < 0) {
      throw new AppError("Price and quantity must be non-negative", 400)
    }

    const product = await this.getProductById(productId)

    const branch = await this.branchRepo.findOne({
      where: { id: branchId, isActive: true },
    })

    if (!branch) {
      throw new AppError("Branch not found or inactive", 404)
    }

    const alreadyAssigned = await this.branchProductRepo.findOne({
      where: {
        product: { id: product.id },
        branch: { id: branch.id },
      },
    })

    if (alreadyAssigned) {
      throw new AppError("This product is already assigned to the branch", 409)
    }

    const branchProduct = this.branchProductRepo.create({
      product,
      branch,
      price,
      quantity,
    })

    return this.branchProductRepo.save(branchProduct)
  }
}
