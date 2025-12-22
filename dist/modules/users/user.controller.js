"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
class UserController {
    static async signup(req, res) {
        const user = await user_service_1.UserService.signup(req.body);
        res.status(201).json({ success: true, data: user });
    }
    static async login(req, res) {
        const result = await user_service_1.UserService.login(req.body);
        res.json({ success: true, data: result });
    }
    static async forgotPassword(req, res) {
        await user_service_1.UserService.forgotPassword(req.body.email);
        res.json({ success: true, message: "Password reset link sent" });
    }
    static async resetPassword(req, res) {
        const { token, newPassword } = req.body;
        await user_service_1.UserService.resetPassword(token, newPassword);
        res.json({ success: true, message: "Password has been reset successfully" });
    }
    static async editUser(req, res) {
        const user = await user_service_1.UserService.editUser(req.params.id, req.body);
        res.json({ success: true, data: user });
    }
    static async deleteUser(req, res) {
        await user_service_1.UserService.deleteUser(req.params.id);
        res.status(204).send();
    }
}
exports.UserController = UserController;
