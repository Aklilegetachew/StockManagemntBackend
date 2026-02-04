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
exports.StockRequestReturn = void 0;
const typeorm_1 = require("typeorm");
const branches_1 = require("./branches");
const StockRequest_1 = require("./StockRequest");
const StockRequestItem_1 = require("./StockRequestItem");
const user_1 = require("./user");
let StockRequestReturn = class StockRequestReturn {
};
exports.StockRequestReturn = StockRequestReturn;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], StockRequestReturn.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => StockRequest_1.StockRequest, { eager: true, onDelete: "CASCADE" }),
    __metadata("design:type", StockRequest_1.StockRequest)
], StockRequestReturn.prototype, "stockRequest", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => StockRequestItem_1.StockRequestItem, { eager: true, onDelete: "CASCADE" }),
    __metadata("design:type", StockRequestItem_1.StockRequestItem)
], StockRequestReturn.prototype, "stockRequestItem", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branches_1.Branch, { eager: true }),
    __metadata("design:type", branches_1.Branch)
], StockRequestReturn.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 12,
        scale: 2,
    }),
    __metadata("design:type", Number)
], StockRequestReturn.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], StockRequestReturn.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, { eager: true, nullable: true }),
    __metadata("design:type", user_1.User)
], StockRequestReturn.prototype, "reportedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "timestamp" }),
    __metadata("design:type", Date)
], StockRequestReturn.prototype, "returnedAt", void 0);
exports.StockRequestReturn = StockRequestReturn = __decorate([
    (0, typeorm_1.Entity)({ name: "stock_returns" })
], StockRequestReturn);
