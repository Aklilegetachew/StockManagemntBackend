"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesReportService = void 0;
const data_source_1 = require("../../data-source");
const SalesReport_1 = require("../../entities/SalesReport");
const SalesReportItem_1 = require("../../entities/SalesReportItem");
const branches_1 = require("../../entities/branches");
const Product_1 = require("../../entities/Product");
const BranchProduct_1 = require("../../entities/BranchProduct");
const StockMovement_1 = require("../../entities/StockMovement");
const user_1 = require("../../entities/user");
const AppError_1 = require("../../errors/AppError");
const xlsx_1 = __importDefault(require("xlsx"));
class SalesReportService {
    static async uploadSalesReport(data) {
        const { startDate, endDate, userId, file } = data;
        // 1. Validate Date Range
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) {
            throw new AppError_1.AppError("Start date cannot be after end date", 400);
        }
        // 2. Parse Excel
        const workbook = xlsx_1.default.read(file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = xlsx_1.default.utils.sheet_to_json(worksheet);
        if (rows.length === 0) {
            throw new AppError_1.AppError("Excel file is empty", 400);
        }
        // 3. Extract branch names from first row (column headers)
        const firstRow = rows[0];
        const branchColumns = [];
        Object.keys(firstRow).forEach((key) => {
            const normalizedKey = key.toLowerCase().trim();
            // Skip known product columns
            if (!normalizedKey.includes("productid") &&
                !normalizedKey.includes("description") &&
                !normalizedKey.includes("unit") &&
                !normalizedKey.includes("price") &&
                !normalizedKey.includes("sku")) {
                branchColumns.push(key); // Keep original case for lookup
            }
        });
        if (branchColumns.length === 0) {
            throw new AppError_1.AppError("No branch columns found in Excel", 400);
        }
        // 4. Start Transaction
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const user = await queryRunner.manager.findOneBy(user_1.User, { id: userId });
            if (!user)
                throw new AppError_1.AppError("User not found", 404);
            // Fetch all branches and create a map by name (case-insensitive)
            const allBranches = await queryRunner.manager.find(branches_1.Branch);
            const branchMap = new Map();
            allBranches.forEach((b) => {
                branchMap.set(b.name.toLowerCase().trim(), b);
            });
            // Track reports and summaries per branch
            const branchReports = new Map();
            const branchSummaries = new Map();
            // Initialize reports for each branch column
            for (const branchColName of branchColumns) {
                const branchNameNormalized = branchColName.toLowerCase().trim();
                const branch = branchMap.get(branchNameNormalized);
                if (!branch) {
                    throw new AppError_1.AppError(`Branch "${branchColName}" not found in system`, 400);
                }
                // Check for duplicate report
                const existingReport = await queryRunner.manager.findOne(SalesReport_1.SalesReport, {
                    where: {
                        branch: { id: branch.id },
                        startDate: start,
                        endDate: end,
                    },
                });
                if (existingReport) {
                    throw new AppError_1.AppError(`A sales report for branch "${branch.name}" and this date range already exists`, 409);
                }
                // Create report for this branch
                const report = queryRunner.manager.create(SalesReport_1.SalesReport, {
                    branch,
                    startDate: start,
                    endDate: end,
                    uploadedBy: user,
                    originalFileName: file.originalname,
                });
                const savedReport = await queryRunner.manager.save(report);
                branchReports.set(branch.id, savedReport);
                branchSummaries.set(branch.id, {
                    branchName: branch.name,
                    totalProducts: 0,
                    totalQuantitySold: 0,
                    totalRevenue: 0,
                });
            }
            // 5. Process each product row
            for (const row of rows) {
                const normalizedRow = Object.keys(row).reduce((acc, key) => {
                    acc[key.toLowerCase().trim()] = row[key];
                    return acc;
                }, {});
                const productId = normalizedRow["productid"] || normalizedRow["sku"];
                const description = normalizedRow["description"] || normalizedRow["name"];
                if (!productId && !description)
                    continue; // Skip invalid rows
                // Find product by SKU or name
                let product = await queryRunner.manager.findOne(Product_1.Product, {
                    where: productId ? { sku: productId } : { name: description },
                });
                if (!product && description) {
                    // Fallback: Case-insensitive search
                    product = await queryRunner.manager
                        .createQueryBuilder(Product_1.Product, "product")
                        .where("LOWER(product.name) = LOWER(:name)", { name: description })
                        .getOne();
                }
                if (!product) {
                    throw new AppError_1.AppError(`Product not found in system: ${productId || description}`, 400);
                }
                // Process sales for each branch column
                for (const branchColName of branchColumns) {
                    const quantity = Number(row[branchColName] || 0);
                    if (isNaN(quantity) || quantity <= 0)
                        continue; // Skip zero sales
                    const branchNameNormalized = branchColName.toLowerCase().trim();
                    const branch = branchMap.get(branchNameNormalized);
                    // Check inventory
                    const branchProduct = await queryRunner.manager.findOne(BranchProduct_1.BranchProduct, {
                        where: {
                            branch: { id: branch.id },
                            product: { id: product.id },
                        },
                    });
                    if (!branchProduct) {
                        throw new AppError_1.AppError(`Product "${product.name}" is not assigned to branch "${branch.name}"`, 400);
                    }
                    const currentStock = Number(branchProduct.quantity);
                    if (currentStock < quantity) {
                        throw new AppError_1.AppError(`Insufficient stock for "${product.name}" at branch "${branch.name}". Available: ${currentStock}, Sold: ${quantity}. The upload has been rejected.`, 409);
                    }
                    // Deduct stock
                    branchProduct.quantity = currentStock - quantity;
                    await queryRunner.manager.save(branchProduct);
                    // Create report item
                    const savedReport = branchReports.get(branch.id);
                    const item = queryRunner.manager.create(SalesReportItem_1.SalesReportItem, {
                        salesReport: savedReport,
                        product,
                        quantitySold: quantity,
                        unitPrice: 0, // Not tracking price from this Excel format
                        totalAmount: 0,
                    });
                    await queryRunner.manager.save(item);
                    // Create stock movement
                    const movement = queryRunner.manager.create(StockMovement_1.StockMovement, {
                        product,
                        branch,
                        type: StockMovement_1.StockMovementType.SALE,
                        quantity: quantity,
                        reference: savedReport.id,
                        createdAt: end,
                        note: `Sales Report: ${start.toISOString().split("T")[0]} to ${end.toISOString().split("T")[0]}`,
                    });
                    await queryRunner.manager.save(movement);
                    // Update summary
                    const summary = branchSummaries.get(branch.id);
                    summary.totalProducts++;
                    summary.totalQuantitySold += quantity;
                }
            }
            await queryRunner.commitTransaction();
            // Return summary for all branches
            return {
                message: "Sales reports imported successfully for all branches",
                dateRange: {
                    start: startDate,
                    end: endDate,
                },
                branches: Array.from(branchSummaries.values()),
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
}
exports.SalesReportService = SalesReportService;
