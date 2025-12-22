"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../errors/AppError");
const errorHandler = (err, req, res, _next) => {
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
exports.errorHandler = errorHandler;
