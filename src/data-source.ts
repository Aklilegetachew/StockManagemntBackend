import "reflect-metadata"
import { DataSource } from "typeorm"
import dotenv from "dotenv"
import { User } from "./entities/user"
import { Branch } from "./entities/branches"
import { Role } from "./entities/role"
import { UserActivityLog } from "./entities/userActivity"

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
  entities: [User, Branch, Role, UserActivityLog],
  migrations: [],
  subscribers: [],
})
