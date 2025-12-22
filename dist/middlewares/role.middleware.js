"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleGuard = void 0;
const AppError_1 = require("../errors/AppError");
const roleGuard = (...allowedRoles) => (req, _res, next) => {
    const user = req.user;
    if (!user || !allowedRoles.includes(user.role)) {
        throw new AppError_1.AppError("Forbidden", 403);
    }
    next();
};
exports.roleGuard = roleGuard;
