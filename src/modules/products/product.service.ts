// src/modules/products/product.service.ts
import { AppDataSource } from "../../data-source"
import { Product } from "../../entities/Product"
import { Branch } from "../../entities/branches"
import { BranchProduct } from "../../entities/BranchProduct"
import { AppError } from "../../errors/AppError"

export class ProductService {
  static productRepo = AppDataSource.getRepository(Product)
  static branchRepo = AppDataSource.getRepository(Branch)
  static branchProductRepo = AppDataSource.getRepository(BranchProduct)

  static async createProduct(data: any) {
    const exists = await this.productRepo.findOne({
      where: [{ name: data.name }, { sku: data.sku }],
    })

    if (exists) throw new AppError("Product already exists", 409)

    const product = this.productRepo.create(data)
    return this.productRepo.save(product)
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
    })

    return this.branchProductRepo.save(bp)
  }
}
