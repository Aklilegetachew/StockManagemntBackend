"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const data_source_1 = require("../../data-source");
const user_1 = require("../../entities/user");
const role_1 = require("../../entities/role");
const branches_1 = require("../../entities/branches");
const AppError_1 = require("../../errors/AppError");
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const email_1 = require("../../utils/email");
const crypto_1 = __importDefault(require("crypto"));
class UserService {
    static async signup(data) {
        const { fullName, email, username, password, role: roleId, branch: branchId, } = data;
        // Check if email or username already exists
        const exists = await this.userRepo.findOne({
            where: [{ email }, { username }],
        });
        if (exists)
            throw new AppError_1.AppError("User already exists", 409);
        // Fetch the role entity using the UUID from request
        const role = await this.roleRepo.findOneBy({ id: roleId });
        if (!role)
            throw new AppError_1.AppError("Invalid role", 400);
        // Assign branch only if role requires it
        let assignedBranch = null;
        if (role.code === "BRANCH_MANAGER") {
            if (!branchId)
                throw new AppError_1.AppError("Branch is required for branch managers", 400);
            assignedBranch = await this.branchRepo.findOneBy({ id: branchId });
            if (!assignedBranch)
                throw new AppError_1.AppError("Branch not found", 404);
        }
        // Create user entity
        const user = this.userRepo.create({
            fullName,
            email,
            username,
            passwordHash: await (0, password_1.hashPassword)(password),
            role,
            branch: assignedBranch,
        });
        // Save to database
        return this.userRepo.save(user);
    }
    static async login(data) {
        const { username, password } = data;
        const user = await this.userRepo.findOne({
            where: { username },
        });
        if (!user)
            throw new AppError_1.AppError("Invalid credentials", 401);
        const isMatch = await (0, password_1.comparePassword)(password, user.passwordHash);
        if (!isMatch)
            throw new AppError_1.AppError("Invalid credentials", 401);
        const token = (0, jwt_1.signToken)({
            id: user.id,
            role: user.role.code,
            branchId: user.branch?.id,
        });
        const safeUser = {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            username: user.username,
            role: user.role.code,
            branch: user.branch?.id,
        };
        return { token, user: safeUser };
    }
    static async forgotPassword(email) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user)
            return;
        // Generate token
        const token = crypto_1.default.randomBytes(32).toString("hex");
        // Set token & expiry (1 hour)
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(Date.now() + 3600000);
        await this.userRepo.save(user);
        // Send email
        await email_1.EmailService.sendPasswordResetEmail(user.email, token);
    }
    static async resetPassword(token, newPassword) {
        const user = await this.userRepo.findOne({
            where: {
                resetPasswordToken: token,
            },
        });
        if (!user ||
            !user.resetPasswordExpires ||
            user.resetPasswordExpires < new Date()) {
            throw new AppError_1.AppError("Invalid or expired token", 400);
        }
        user.passwordHash = await (0, password_1.hashPassword)(newPassword);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await this.userRepo.save(user);
    }
    static async findAll() {
        return this.userRepo.find({
            relations: ["role", "branch"],
        });
    }
    static async findById(userId) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ["role", "branch"],
        });
        if (!user)
            throw new AppError_1.AppError("User not found", 404);
        return user;
    }
    static async editUser(userId, data) {
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user)
            throw new AppError_1.AppError("User not found", 404);
        Object.assign(user, data);
        return this.userRepo.save(user);
    }
    static async deleteUser(userId) {
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user)
            throw new AppError_1.AppError("User not found", 404);
        await this.userRepo.remove(user);
    }
}
exports.UserService = UserService;
UserService.userRepo = data_source_1.AppDataSource.getRepository(user_1.User);
UserService.roleRepo = data_source_1.AppDataSource.getRepository(role_1.Role);
UserService.branchRepo = data_source_1.AppDataSource.getRepository(branches_1.Branch);
