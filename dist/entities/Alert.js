"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alert = exports.AlertType = exports.AlertStatus = exports.AlertPriority = void 0;
const typeorm_1 = require("typeorm");
const branches_1 = require("./branches");
const Product_1 = require("./Product");
const user_1 = require("./user");
var AlertPriority;
(function (AlertPriority) {
    AlertPriority["CRITICAL"] = "CRITICAL";
    AlertPriority["HIGH"] = "HIGH";
    AlertPriority["MEDIUM"] = "MEDIUM";
    AlertPriority["LOW"] = "LOW";
})(AlertPriority || (exports.AlertPriority = AlertPriority = {}));
var AlertStatus;
(function (AlertStatus) {
    AlertStatus["NEW"] = "NEW";
    AlertStatus["ACKNOWLEDGED"] = "ACKNOWLEDGED";
    AlertStatus["RESOLVED"] = "RESOLVED";
})(AlertStatus || (exports.AlertStatus = AlertStatus = {}));
var AlertType;
(function (AlertType) {
    AlertType["LOW_STOCK"] = "LOW_STOCK";
    AlertType["CRITICAL_STOCK"] = "CRITICAL_STOCK";
    AlertType["LATE_ORDER"] = "LATE_ORDER";
})(AlertType || (exports.AlertType = AlertType = {}));
let Alert = class Alert {
};
exports.Alert = Alert;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Alert.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: AlertPriority,
        default: AlertPriority.MEDIUM,
    }),
    __metadata("design:type", String)
], Alert.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: AlertStatus,
        default: AlertStatus.NEW,
    }),
    __metadata("design:type", String)
], Alert.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: AlertType,
    }),
    __metadata("design:type", String)
], Alert.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Alert.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Alert.prototype, "branchId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branches_1.Branch, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "branchId" }),
    __metadata("design:type", branches_1.Branch)
], Alert.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Alert.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Product_1.Product, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "productId" }),
    __metadata("design:type", Product_1.Product
    // Tracking who managed the alert
    )
], Alert.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "acknowledgedBy" }),
    __metadata("design:type", user_1.User)
], Alert.prototype, "acknowledgedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Alert.prototype, "acknowledgedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "resolvedBy" }),
    __metadata("design:type", user_1.User)
], Alert.prototype, "resolvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Alert.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Alert.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Alert.prototype, "updatedAt", void 0);
exports.Alert = Alert = __decorate([
    (0, typeorm_1.Entity)({ name: "alerts" })
], Alert);
