// src/modules/products/product.service.ts
import { AppDataSource } from "../../data-source"
import { Product } from "../../entities/Product"
import { Branch } from "../../entities/branches"
import { BranchProduct } from "../../entities/BranchProduct"
import { AppError } from "../../errors/AppError"
import { CentralStock } from "../../entities/CentralStock"

export class ProductService {
  static productRepo = AppDataSource.getRepository(Product)
  static branchRepo = AppDataSource.getRepository(Branch)
  static branchProductRepo = AppDataSource.getRepository(BranchProduct)
  static centralStockRepo = AppDataSource.getRepository(CentralStock)

  static async createProduct(data: any) {
    const exists = await this.productRepo.findOne({
      where: [{ name: data.name }, { sku: data.sku }],
    })

    if (exists) throw new AppError("Product already exists", 409)

    // 1️⃣ Create product
    const product = this.productRepo.create(data as Partial<Product>)
    const savedProduct = (await this.productRepo.save(product)) as Product

    // 2️⃣ Create central stock
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
    if (!product) throw new AppError("Product not found", 404)
    return product
  }

  static async updateProduct(id: string, data: any) {
    const product = await this.getProductById(id)
    Object.assign(product, data)
    return this.productRepo.save(product)
  }

  static async assignProductToBranch(productId: string, branchId: string) {
    const product = await this.getProductById(productId)

    const branch = await this.branchRepo.findOneBy({
      id: branchId,
      isActive: true,
    })
    if (!branch) throw new AppError("Branch not found", 404)

    const exists = await this.branchProductRepo.findOne({
      where: { product, branch },
    })
    if (exists) return exists

    const bp = this.branchProductRepo.create({
      product,
      branch,
      quantity: 0,
    })

    return this.branchProductRepo.save(bp)
  }
}
