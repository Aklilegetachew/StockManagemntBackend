import "reflect-metadata"
import { DataSource } from "typeorm"
import dotenv from "dotenv"
import { User } from "./entities/user"
import { Branch } from "./entities/branches"
import { Role } from "./entities/role"
import { UserActivityLog } from "./entities/userActivity"
import { Product } from "./entities/Product"
import { CentralStock } from "./entities/CentralStock"
import { BranchProduct } from "./entities/BranchProduct"
import { StockRequest } from "./entities/StockRequest"
import { StockMovement } from "./entities/StockMovement"
import { StockRequestItem } from "./entities/StockRequestItem"
import { Category } from "./entities/Category"
import { SalesReport } from "./entities/SalesReport"
import { SalesReportItem } from "./entities/SalesReportItem"
import { Alert } from "./entities/Alert"

dotenv.config()

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [
    User,
    Branch,
    Role,
    UserActivityLog,
    Product,
    CentralStock,
    BranchProduct,
    StockRequest,
    StockMovement,
    StockRequestItem,
    Category,
    SalesReport,
    SalesReportItem,
    Alert,
  ],
  migrations: [],
  subscribers: [],
})
