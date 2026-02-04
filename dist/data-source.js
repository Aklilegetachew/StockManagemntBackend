"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = require("./entities/user");
const branches_1 = require("./entities/branches");
const role_1 = require("./entities/role");
const userActivity_1 = require("./entities/userActivity");
const Product_1 = require("./entities/Product");
const CentralStock_1 = require("./entities/CentralStock");
const BranchProduct_1 = require("./entities/BranchProduct");
const StockRequest_1 = require("./entities/StockRequest");
const StockMovement_1 = require("./entities/StockMovement");
const StockRequestItem_1 = require("./entities/StockRequestItem");
const Category_1 = require("./entities/Category");
const SalesReport_1 = require("./entities/SalesReport");
const SalesReportItem_1 = require("./entities/SalesReportItem");
const Alert_1 = require("./entities/Alert");
const StockRequestReturn_1 = require("./entities/StockRequestReturn");
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [
        user_1.User,
        branches_1.Branch,
        role_1.Role,
        userActivity_1.UserActivityLog,
        Product_1.Product,
        CentralStock_1.CentralStock,
        BranchProduct_1.BranchProduct,
        StockRequest_1.StockRequest,
        StockMovement_1.StockMovement,
        StockRequestItem_1.StockRequestItem,
        Category_1.Category,
        SalesReport_1.SalesReport,
        SalesReportItem_1.SalesReportItem,
        Alert_1.Alert,
        StockRequestReturn_1.StockRequestReturn,
    ],
    migrations: [],
    subscribers: [],
});
