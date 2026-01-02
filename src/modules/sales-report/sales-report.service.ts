import { AppDataSource } from "../../data-source"
import { SalesReport } from "../../entities/SalesReport"
import { SalesReportItem } from "../../entities/SalesReportItem"
import { Branch } from "../../entities/branches"
import { Product } from "../../entities/Product"
import { BranchProduct } from "../../entities/BranchProduct"
import { StockMovement, StockMovementType } from "../../entities/StockMovement"
import { User } from "../../entities/user"
import { AppError } from "../../errors/AppError"
import xlsx from "xlsx"

interface SalesUploadData {
  startDate: string
  endDate: string
  userId: string
  file: Express.Multer.File
}

export class SalesReportService {
  static async uploadSalesReport(data: SalesUploadData) {
    const { startDate, endDate, userId, file } = data

    // 1. Validate Date Range
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (start > end) {
      throw new AppError("Start date cannot be after end date", 400)
    }

    // 2. Parse Excel
    const workbook = xlsx.read(file.buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const rows: any[] = xlsx.utils.sheet_to_json(worksheet)

    if (rows.length === 0) {
      throw new AppError("Excel file is empty", 400)
    }

    // 3. Extract branch names from first row (column headers)
    const firstRow = rows[0]
    const branchColumns: string[] = []

    Object.keys(firstRow).forEach((key) => {
      const normalizedKey = key.toLowerCase().trim()
      // Skip known product columns
      if (
        !normalizedKey.includes("productid") &&
        !normalizedKey.includes("description") &&
        !normalizedKey.includes("unit") &&
        !normalizedKey.includes("price") &&
        !normalizedKey.includes("sku")
      ) {
        branchColumns.push(key) // Keep original case for lookup
      }
    })

    if (branchColumns.length === 0) {
      throw new AppError("No branch columns found in Excel", 400)
    }

    // 4. Start Transaction
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const user = await queryRunner.manager.findOneBy(User, { id: userId })
      if (!user) throw new AppError("User not found", 404)

      // Fetch all branches and create a map by name (case-insensitive)
      const allBranches = await queryRunner.manager.find(Branch)
      const branchMap = new Map<string, Branch>()
      allBranches.forEach((b) => {
        branchMap.set(b.name.toLowerCase().trim(), b)
      })

      // Track reports and summaries per branch
      const branchReports = new Map<string, any>()
      const branchSummaries = new Map<string, any>()

      // Initialize reports for each branch column
      for (const branchColName of branchColumns) {
        const branchNameNormalized = branchColName.toLowerCase().trim()
        const branch = branchMap.get(branchNameNormalized)

        if (!branch) {
          throw new AppError(
            `Branch "${branchColName}" not found in system`,
            400
          )
        }

        // Check for duplicate report
        const existingReport = await queryRunner.manager.findOne(SalesReport, {
          where: {
            branch: { id: branch.id },
            startDate: start,
            endDate: end,
          },
        })

        if (existingReport) {
          throw new AppError(
            `A sales report for branch "${branch.name}" and this date range already exists`,
            409
          )
        }

        // Create report for this branch
        const report = queryRunner.manager.create(SalesReport, {
          branch,
          startDate: start,
          endDate: end,
          uploadedBy: user,
          originalFileName: file.originalname,
        })
        const savedReport = await queryRunner.manager.save(report)

        branchReports.set(branch.id, savedReport)
        branchSummaries.set(branch.id, {
          branchName: branch.name,
          totalProducts: 0,
          totalQuantitySold: 0,
          totalRevenue: 0,
        })
      }

      // 5. Process each product row
      for (const row of rows) {
        const normalizedRow = Object.keys(row).reduce((acc, key) => {
          acc[key.toLowerCase().trim()] = row[key]
          return acc
        }, {} as any)

        const productId = normalizedRow["productid"] || normalizedRow["sku"]
        const description =
          normalizedRow["description"] || normalizedRow["name"]

        if (!productId && !description) continue // Skip invalid rows

        // Find product by SKU or name
        let product = await queryRunner.manager.findOne(Product, {
          where: productId ? { sku: productId } : { name: description },
        })

        if (!product && description) {
          // Fallback: Case-insensitive search
          product = await queryRunner.manager
            .createQueryBuilder(Product, "product")
            .where("LOWER(product.name) = LOWER(:name)", { name: description })
            .getOne()
        }

        if (!product) {
          throw new AppError(
            `Product not found in system: ${productId || description}`,
            400
          )
        }

        // Process sales for each branch column
        for (const branchColName of branchColumns) {
          const quantity = Number(row[branchColName] || 0)
          if (isNaN(quantity) || quantity <= 0) continue // Skip zero sales

          const branchNameNormalized = branchColName.toLowerCase().trim()
          const branch = branchMap.get(branchNameNormalized)!

          // Check inventory
          const branchProduct = await queryRunner.manager.findOne(
            BranchProduct,
            {
              where: {
                branch: { id: branch.id },
                product: { id: product.id },
              },
            }
          )

          if (!branchProduct) {
            throw new AppError(
              `Product "${product.name}" is not assigned to branch "${branch.name}"`,
              400
            )
          }

          const currentStock = Number(branchProduct.quantity)
          if (currentStock < quantity) {
            throw new AppError(
              `Insufficient stock for "${product.name}" at branch "${branch.name}". Available: ${currentStock}, Sold: ${quantity}. The upload has been rejected.`,
              409
            )
          }

          // Deduct stock
          branchProduct.quantity = currentStock - quantity
          await queryRunner.manager.save(branchProduct)

          // Create report item
          const savedReport = branchReports.get(branch.id)
          const item = queryRunner.manager.create(SalesReportItem, {
            salesReport: savedReport,
            product,
            quantitySold: quantity,
            unitPrice: 0, // Not tracking price from this Excel format
            totalAmount: 0,
          })
          await queryRunner.manager.save(item)

          // Create stock movement
          const movement = queryRunner.manager.create(StockMovement, {
            product,
            branch,
            type: StockMovementType.SALE,
            quantity: quantity,
            reference: savedReport.id,
            createdAt: end,
            note: `Sales Report: ${start.toISOString().split("T")[0]} to ${
              end.toISOString().split("T")[0]
            }`,
          })
          await queryRunner.manager.save(movement)

          // Update summary
          const summary = branchSummaries.get(branch.id)!
          summary.totalProducts++
          summary.totalQuantitySold += quantity
        }
      }

      await queryRunner.commitTransaction()

      // Return summary for all branches
      return {
        message: "Sales reports imported successfully for all branches",
        dateRange: {
          start: startDate,
          end: endDate,
        },
        branches: Array.from(branchSummaries.values()),
      }
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }
}
