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
    entities: [user_1.User, branches_1.Branch, role_1.Role, userActivity_1.UserActivityLog],
    migrations: [],
    subscribers: [],
});
