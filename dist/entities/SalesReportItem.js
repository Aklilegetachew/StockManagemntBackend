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
exports.SalesReportItem = void 0;
const typeorm_1 = require("typeorm");
const SalesReport_1 = require("./SalesReport");
const Product_1 = require("./Product");
let SalesReportItem = class SalesReportItem {
};
exports.SalesReportItem = SalesReportItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], SalesReportItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SalesReport_1.SalesReport, (report) => report.items, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", SalesReport_1.SalesReport)
], SalesReportItem.prototype, "salesReport", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Product_1.Product, { nullable: false }),
    __metadata("design:type", Product_1.Product)
], SalesReportItem.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], SalesReportItem.prototype, "quantitySold", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SalesReportItem.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SalesReportItem.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SalesReportItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SalesReportItem.prototype, "updatedAt", void 0);
exports.SalesReportItem = SalesReportItem = __decorate([
    (0, typeorm_1.Entity)({ name: "sales_report_items" }),
    (0, typeorm_1.Unique)(["salesReport", "product"])
], SalesReportItem);
