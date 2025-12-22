"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class EmailService {
    static async sendEmail(to, subject, html, text) {
        const mailOptions = {
            from: process.env.FROM_EMAIL || "no-reply@tomoca.com",
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>?/gm, ""),
        };
        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log("Email sent: %s", info.messageId);
            return info;
        }
        catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    }
    static async sendPasswordResetEmail(email, token) {
        const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;
        const subject = "Password Reset Request";
        const html = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;
        return this.sendEmail(email, subject, html);
    }
}
exports.EmailService = EmailService;
EmailService.transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
