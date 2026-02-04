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
exports.StockRequestItem = void 0;
// src/entities/StockRequestItem.ts
const typeorm_1 = require("typeorm");
const StockRequest_1 = require("./StockRequest");
const Product_1 = require("./Product");
let StockRequestItem = class StockRequestItem {
};
exports.StockRequestItem = StockRequestItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], StockRequestItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => StockRequest_1.StockRequest, (request) => request.items),
    __metadata("design:type", StockRequest_1.StockRequest)
], StockRequestItem.prototype, "stockRequest", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Product_1.Product, { eager: true }),
    __metadata("design:type", Product_1.Product)
], StockRequestItem.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 12,
        scale: 2,
    }),
    __metadata("design:type", Number)
], StockRequestItem.prototype, "requestedQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 12,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Number)
], StockRequestItem.prototype, "approvedQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 12,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Number)
], StockRequestItem.prototype, "receivedQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 12,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Number)
], StockRequestItem.prototype, "returnedQuantity", void 0);
exports.StockRequestItem = StockRequestItem = __decorate([
    (0, typeorm_1.Entity)({ name: "stock_request_items" })
], StockRequestItem);
