"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const response_1 = require("../../utils/response");
class UserController {
    static async signup(req, res) {
        const user = await user_service_1.UserService.signup(req.body);
        const { passwordHash, ...safeUser } = user;
        return (0, response_1.sendResponse)(res, 201, true, "User registered successfully", safeUser);
    }
    static async login(req, res) {
        const result = await user_service_1.UserService.login(req.body);
        return (0, response_1.sendResponse)(res, 200, true, "Login successful", result);
    }
    static async forgotPassword(req, res) {
        await user_service_1.UserService.forgotPassword(req.body.email);
        return (0, response_1.sendResponse)(res, 200, true, "Password reset link sent", null);
    }
    static async resetPassword(req, res) {
        const { token, newPassword } = req.body;
        await user_service_1.UserService.resetPassword(token, newPassword);
        return (0, response_1.sendResponse)(res, 200, true, "Password has been reset successfully", null);
    }
    static async getAllUsers(req, res) {
        const users = await user_service_1.UserService.findAll();
        const safeUsers = users.map((user) => ({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            username: user.username,
            role: user.role.code,
            branch: user.branch?.name || null,
            isActive: user.isActive,
        }));
        return (0, response_1.sendResponse)(res, 200, true, "Users fetched successfully", safeUsers);
    }
    static async getUserById(req, res) {
        const user = await user_service_1.UserService.findById(req.params.id);
        const safeUser = {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            username: user.username,
            role: user.role.code,
            branch: user.branch?.name || null,
            isActive: user.isActive,
        };
        return (0, response_1.sendResponse)(res, 200, true, "User fetched successfully", safeUser);
    }
    static async editUser(req, res) {
        const user = await user_service_1.UserService.editUser(req.params.id, req.body);
        return (0, response_1.sendResponse)(res, 200, true, "User updated successfully", user);
    }
    static async deleteUser(req, res) {
        await user_service_1.UserService.deleteUser(req.params.id);
        return (0, response_1.sendResponse)(res, 200, true, "User deleted successfully", null);
    }
}
exports.UserController = UserController;
