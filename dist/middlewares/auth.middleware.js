"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../errors/AppError");
const authMiddleware = (req, _res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        throw new AppError_1.AppError("Unauthorized", 401);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        throw new AppError_1.AppError("Invalid token", 401);
    }
};
exports.authMiddleware = authMiddleware;
