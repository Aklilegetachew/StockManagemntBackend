// src/modules/report/report.service.ts
import { Between, IsNull, LessThanOrEqual, MoreThanOrEqual, In } from "typeorm"
import { AppDataSource } from "../../data-source"
import { BranchProduct } from "../../entities/BranchProduct"
import { CentralStock } from "../../entities/CentralStock"
import { StockMovement, StockMovementType } from "../../entities/StockMovement"
import { StockRequest, StockRequestStatus } from "../../entities/StockRequest"
import { SalesReport } from "../../entities/SalesReport"
import { SalesReportItem } from "../../entities/SalesReportItem"
import { Branch } from "../../entities/branches"
import { Product } from "../../entities/Product"
import { AppError } from "../../errors/AppError"

// ===================== INTERFACES =====================

export interface CurrentStockFilters {
  branchId?: string // if null, returns central stock
  productId?: string
  categoryId?: string
  lowStockOnly?: boolean
  lowStockThreshold?: number
}

export interface StockMovementFilters {
  branchId?: string // null = central stock
  productId?: string
  movementType?: StockMovementType
  startDate?: string
  endDate?: string
}

export interface RequestedItemsFilters {
  branchId?: string
  status?: StockRequestStatus | StockRequestStatus[]
  startDate?: string
  endDate?: string
  productId?: string
}

export interface SalesSummaryFilters {
  branchId?: string
  productId?: string
  startDate?: string
  endDate?: string
}

export interface InventoryValuationFilters {
  branchId?: string // null = central stock
  categoryId?: string
}

// ===================== SERVICE =====================

export class ReportService {
  static branchProductRepo = AppDataSource.getRepository(BranchProduct)
  static centralStockRepo = AppDataSource.getRepository(CentralStock)
  static stockMovementRepo = AppDataSource.getRepository(StockMovement)
  static stockRequestRepo = AppDataSource.getRepository(StockRequest)
  static salesReportRepo = AppDataSource.getRepository(SalesReport)
  static salesReportItemRepo = AppDataSource.getRepository(SalesReportItem)
  static branchRepo = AppDataSource.getRepository(Branch)
  static productRepo = AppDataSource.getRepository(Product)

  // ==================== 1. CURRENT STOCK REPORT ====================
  /**
   * Get current stock levels for a branch or central warehouse
   * Can filter by product, category, or show only low stock items
   */
  static async getCurrentStock(filters: CurrentStockFilters) {
    const { branchId, productId, categoryId, lowStockOnly, lowStockThreshold = 10 } = filters

    if (branchId) {
      // Branch stock
      const branch = await this.branchRepo.findOneBy({ id: branchId })
      if (!branch) throw new AppError("Branch not found", 404)

      const query = this.branchProductRepo
        .createQueryBuilder("bp")
        .leftJoinAndSelect("bp.product", "product")
        .leftJoinAndSelect("product.category", "category")
        .leftJoinAndSelect("bp.branch", "branch")
        .where("bp.branch.id = :branchId", { branchId })
        .andWhere("bp.isActive = :isActive", { isActive: true })

      if (productId) {
        query.andWhere("product.id = :productId", { productId })
      }

      if (categoryId) {
        query.andWhere("category.id = :categoryId", { categoryId })
      }

      if (lowStockOnly) {
        query.andWhere("bp.quantity <= :threshold", { threshold: lowStockThreshold })
      }

      query.orderBy("product.name", "ASC")

      const items = await query.getMany()

      const totalItems = items.length
      const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity), 0)
      const lowStockItems = items.filter((item) => Number(item.quantity) <= lowStockThreshold)

      return {
        reportType: "BRANCH_STOCK",
        branch: branch.name,
        branchId: branch.id,
        generatedAt: new Date(),
        summary: {
          totalProducts: totalItems,
          totalQuantity: totalQuantity,
          lowStockCount: lowStockItems.length,
          lowStockThreshold,
        },
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          sku: item.product.sku,
          category: item.product.category?.name || "Uncategorized",
          quantity: Number(item.quantity),
          unit: item.product.unit,
          price: Number(item.price),
          isLowStock: Number(item.quantity) <= lowStockThreshold,
          lastUpdated: item.updatedAt,
        })),
      }
    } else {
      // Central stock
      const query = this.centralStockRepo
        .createQueryBuilder("cs")
        .leftJoinAndSelect("cs.product", "product")
        .leftJoinAndSelect("product.category", "category")

      if (productId) {
        query.andWhere("product.id = :productId", { productId })
      }

      if (categoryId) {
        query.andWhere("category.id = :categoryId", { categoryId })
      }

      if (lowStockOnly) {
        query.andWhere("cs.quantity <= :threshold", { threshold: lowStockThreshold })
      }

      query.orderBy("product.name", "ASC")

      const items = await query.getMany()

      const totalItems = items.length
      const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity), 0)
      const lowStockItems = items.filter((item) => Number(item.quantity) <= lowStockThreshold)

      return {
        reportType: "CENTRAL_STOCK",
        location: "Central Warehouse",
        generatedAt: new Date(),
        summary: {
          totalProducts: totalItems,
          totalQuantity: totalQuantity,
          lowStockCount: lowStockItems.length,
          lowStockThreshold,
        },
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          sku: item.product.sku,
          category: item.product.category?.name || "Uncategorized",
          quantity: Number(item.quantity),
          unit: item.product.unit,
          isLowStock: Number(item.quantity) <= lowStockThreshold,
          lastUpdated: item.updatedAt,
        })),
      }
    }
  }

  // ==================== 2. STOCK MOVEMENT REPORT ====================
  /**
   * Get stock movements with various filters
   * Can filter by branch/central, product, movement type, date range
   */
  static async getStockMovements(filters: StockMovementFilters) {
    const { branchId, productId, movementType, startDate, endDate } = filters

    const query = this.stockMovementRepo
      .createQueryBuilder("sm")
      .leftJoinAndSelect("sm.product", "product")
      .leftJoinAndSelect("sm.branch", "branch")
      .leftJoinAndSelect("sm.requestedBy", "requestedBy")
      .leftJoinAndSelect("sm.approvedBy", "approvedBy")

    // Branch filter: null means central stock
    if (branchId === "central" || branchId === null || branchId === undefined) {
      query.andWhere("sm.branch IS NULL")
    } else if (branchId) {
      query.andWhere("branch.id = :branchId", { branchId })
    }

    if (productId) {
      query.andWhere("product.id = :productId", { productId })
    }

    if (movementType) {
      query.andWhere("sm.type = :movementType", { movementType })
    }

    if (startDate) {
      query.andWhere("sm.createdAt >= :startDate", { startDate: new Date(startDate) })
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      query.andWhere("sm.createdAt <= :endDate", { endDate: end })
    }

    query.orderBy("sm.createdAt", "DESC")

    const movements = await query.getMany()

    // Calculate summaries
    const summaryByType: Record<string, { count: number; totalQuantity: number }> = {}
    movements.forEach((m) => {
      if (!summaryByType[m.type]) {
        summaryByType[m.type] = { count: 0, totalQuantity: 0 }
      }
      summaryByType[m.type].count++
      summaryByType[m.type].totalQuantity += Number(m.quantity)
    })

    const additions = movements
      .filter((m) => [StockMovementType.ADDITION, StockMovementType.TRANSFER_IN].includes(m.type))
      .reduce((sum, m) => sum + Number(m.quantity), 0)

    const deductions = movements
      .filter((m) => [StockMovementType.DEDUCTION, StockMovementType.SALE, StockMovementType.TRANSFER_OUT].includes(m.type))
      .reduce((sum, m) => sum + Number(m.quantity), 0)

    return {
      reportType: "STOCK_MOVEMENT",
      location: branchId && branchId !== "central" ? movements[0]?.branch?.name || "Branch" : "Central Warehouse",
      filters: {
        branchId: branchId || "central",
        productId,
        movementType,
        startDate,
        endDate,
      },
      generatedAt: new Date(),
      summary: {
        totalMovements: movements.length,
        totalAdditions: additions,
        totalDeductions: deductions,
        netChange: additions - deductions,
        byType: summaryByType,
      },
      movements: movements.map((m) => ({
        id: m.id,
        date: m.createdAt,
        type: m.type,
        productName: m.product.name,
        productSku: m.product.sku,
        quantity: Number(m.quantity),
        unit: m.product.unit,
        reference: m.reference,
        note: m.note,
        requestedBy: m.requestedBy?.fullName || null,
        approvedBy: m.approvedBy?.fullName || null,
      })),
    }
  }

  // ==================== 3. REQUESTED ITEMS REPORT ====================
  /**
   * Get stock requests with filters
   * Can filter by branch, status, date range
   */
  static async getRequestedItems(filters: RequestedItemsFilters) {
    const { branchId, status, startDate, endDate, productId } = filters

    const query = this.stockRequestRepo
      .createQueryBuilder("sr")
      .leftJoinAndSelect("sr.branch", "branch")
      .leftJoinAndSelect("sr.requestedBy", "requestedBy")
      .leftJoinAndSelect("sr.items", "items")
      .leftJoinAndSelect("items.product", "product")

    if (branchId) {
      query.andWhere("branch.id = :branchId", { branchId })
    }

    if (status) {
      if (Array.isArray(status)) {
        query.andWhere("sr.status IN (:...statuses)", { statuses: status })
      } else {
        query.andWhere("sr.status = :status", { status })
      }
    }

    if (startDate) {
      query.andWhere("sr.createdAt >= :startDate", { startDate: new Date(startDate) })
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      query.andWhere("sr.createdAt <= :endDate", { endDate: end })
    }

    if (productId) {
      query.andWhere("product.id = :productId", { productId })
    }

    query.orderBy("sr.createdAt", "DESC")

    const requests = await query.getMany()

    // Calculate summaries
    const summaryByStatus: Record<string, number> = {}
    requests.forEach((r) => {
      summaryByStatus[r.status] = (summaryByStatus[r.status] || 0) + 1
    })

    const totalRequested = requests.reduce(
      (sum, r) => sum + r.items.reduce((itemSum, item) => itemSum + Number(item.requestedQuantity), 0),
      0
    )

    const totalApproved = requests.reduce(
      (sum, r) => sum + r.items.reduce((itemSum, item) => itemSum + Number(item.approvedQuantity || 0), 0),
      0
    )

    return {
      reportType: "REQUESTED_ITEMS",
      filters: {
        branchId,
        status,
        startDate,
        endDate,
        productId,
      },
      generatedAt: new Date(),
      summary: {
        totalRequests: requests.length,
        totalRequestedQuantity: totalRequested,
        totalApprovedQuantity: totalApproved,
        fulfillmentRate: totalRequested > 0 ? ((totalApproved / totalRequested) * 100).toFixed(2) + "%" : "N/A",
        byStatus: summaryByStatus,
      },
      requests: requests.map((r) => ({
        requestId: r.id,
        branch: r.branch.name,
        requestedBy: r.requestedBy.fullName,
        status: r.status,
        createdAt: r.createdAt,
        approvedAt: r.approvedAt,
        dispatchedAt: r.dispatchedAt,
        receivedAt: r.receivedAt,
        note: r.note,
        items: r.items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          sku: item.product.sku,
          requestedQuantity: Number(item.requestedQuantity),
          approvedQuantity: item.approvedQuantity != null ? Number(item.approvedQuantity) : null,
          unit: item.product.unit,
        })),
      })),
    }
  }

  // ==================== 4. LOW STOCK ALERT REPORT ====================
  /**
   * Get products with low stock across all branches and central
   * Helps identify items that need restocking
   */
  static async getLowStockReport(threshold: number = 10) {
    // Central stock low items
    const centralLowStock = await this.centralStockRepo
      .createQueryBuilder("cs")
      .leftJoinAndSelect("cs.product", "product")
      .leftJoinAndSelect("product.category", "category")
      .where("cs.quantity <= :threshold", { threshold })
      .orderBy("cs.quantity", "ASC")
      .getMany()

    // Branch stock low items
    const branchLowStock = await this.branchProductRepo
      .createQueryBuilder("bp")
      .leftJoinAndSelect("bp.product", "product")
      .leftJoinAndSelect("bp.branch", "branch")
      .leftJoinAndSelect("product.category", "category")
      .where("bp.quantity <= :threshold", { threshold })
      .andWhere("bp.isActive = :isActive", { isActive: true })
      .orderBy("bp.quantity", "ASC")
      .getMany()

    // Group branch low stock by branch
    const branchGrouped: Record<string, any[]> = {}
    branchLowStock.forEach((bp) => {
      const branchName = bp.branch.name
      if (!branchGrouped[branchName]) {
        branchGrouped[branchName] = []
      }
      branchGrouped[branchName].push({
        productId: bp.product.id,
        productName: bp.product.name,
        sku: bp.product.sku,
        category: bp.product.category?.name || "Uncategorized",
        currentStock: Number(bp.quantity),
        unit: bp.product.unit,
        severity: Number(bp.quantity) === 0 ? "CRITICAL" : Number(bp.quantity) <= threshold / 2 ? "HIGH" : "MEDIUM",
      })
    })

    return {
      reportType: "LOW_STOCK_ALERT",
      threshold,
      generatedAt: new Date(),
      summary: {
        centralLowStockCount: centralLowStock.length,
        branchLowStockCount: branchLowStock.length,
        totalAlertsCount: centralLowStock.length + branchLowStock.length,
        criticalCount: [...centralLowStock, ...branchLowStock].filter((item) => Number(item.quantity) === 0).length,
      },
      centralWarehouse: {
        location: "Central Warehouse",
        items: centralLowStock.map((cs) => ({
          productId: cs.product.id,
          productName: cs.product.name,
          sku: cs.product.sku,
          category: cs.product.category?.name || "Uncategorized",
          currentStock: Number(cs.quantity),
          unit: cs.product.unit,
          severity: Number(cs.quantity) === 0 ? "CRITICAL" : Number(cs.quantity) <= threshold / 2 ? "HIGH" : "MEDIUM",
        })),
      },
      branches: Object.entries(branchGrouped).map(([branchName, items]) => ({
        branch: branchName,
        itemCount: items.length,
        items,
      })),
    }
  }

  // ==================== 5. SALES SUMMARY REPORT ====================
  /**
   * Get sales summary by branch and date range
   * Aggregates sales data for analysis
   */
  static async getSalesSummary(filters: SalesSummaryFilters) {
    const { branchId, productId, startDate, endDate } = filters

    const query = this.salesReportItemRepo
      .createQueryBuilder("sri")
      .leftJoinAndSelect("sri.salesReport", "sr")
      .leftJoinAndSelect("sr.branch", "branch")
      .leftJoinAndSelect("sri.product", "product")
      .leftJoinAndSelect("product.category", "category")

    if (branchId) {
      query.andWhere("branch.id = :branchId", { branchId })
    }

    if (productId) {
      query.andWhere("product.id = :productId", { productId })
    }

    if (startDate) {
      query.andWhere("sr.startDate >= :startDate", { startDate: new Date(startDate) })
    }

    if (endDate) {
      query.andWhere("sr.endDate <= :endDate", { endDate: new Date(endDate) })
    }

    query.orderBy("sri.createdAt", "DESC")

    const salesItems = await query.getMany()

    // Aggregate by branch
    const byBranch: Record<string, { totalQuantity: number; totalRevenue: number; itemCount: number }> = {}
    // Aggregate by product
    const byProduct: Record<string, { productName: string; totalQuantity: number; totalRevenue: number }> = {}
    // Aggregate by category
    const byCategory: Record<string, { totalQuantity: number; totalRevenue: number }> = {}

    let totalQuantitySold = 0
    let totalRevenue = 0

    salesItems.forEach((item) => {
      const branchName = item.salesReport.branch.name
      const productName = item.product.name
      const categoryName = item.product.category?.name || "Uncategorized"
      const qty = Number(item.quantitySold)
      const revenue = Number(item.totalAmount)

      totalQuantitySold += qty
      totalRevenue += revenue

      // By branch
      if (!byBranch[branchName]) {
        byBranch[branchName] = { totalQuantity: 0, totalRevenue: 0, itemCount: 0 }
      }
      byBranch[branchName].totalQuantity += qty
      byBranch[branchName].totalRevenue += revenue
      byBranch[branchName].itemCount++

      // By product
      if (!byProduct[item.product.id]) {
        byProduct[item.product.id] = { productName, totalQuantity: 0, totalRevenue: 0 }
      }
      byProduct[item.product.id].totalQuantity += qty
      byProduct[item.product.id].totalRevenue += revenue

      // By category
      if (!byCategory[categoryName]) {
        byCategory[categoryName] = { totalQuantity: 0, totalRevenue: 0 }
      }
      byCategory[categoryName].totalQuantity += qty
      byCategory[categoryName].totalRevenue += revenue
    })

    // Top selling products
    const topProducts = Object.entries(byProduct)
      .sort((a, b) => b[1].totalQuantity - a[1].totalQuantity)
      .slice(0, 10)
      .map(([productId, data]) => ({
        productId,
        productName: data.productName,
        totalQuantitySold: data.totalQuantity,
        totalRevenue: data.totalRevenue,
      }))

    return {
      reportType: "SALES_SUMMARY",
      filters: {
        branchId,
        productId,
        startDate,
        endDate,
      },
      generatedAt: new Date(),
      summary: {
        totalSalesRecords: salesItems.length,
        totalQuantitySold,
        totalRevenue,
        uniqueProductsSold: Object.keys(byProduct).length,
        branchesCount: Object.keys(byBranch).length,
      },
      byBranch: Object.entries(byBranch).map(([branch, data]) => ({
        branch,
        ...data,
      })),
      byCategory: Object.entries(byCategory).map(([category, data]) => ({
        category,
        ...data,
      })),
      topSellingProducts: topProducts,
    }
  }
}
