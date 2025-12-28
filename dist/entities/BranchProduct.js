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
exports.BranchProduct = void 0;
// src/entities/BranchProduct.ts
const typeorm_1 = require("typeorm");
const branches_1 = require("./branches");
const Product_1 = require("./Product");
let BranchProduct = class BranchProduct {
};
exports.BranchProduct = BranchProduct;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], BranchProduct.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branches_1.Branch, { eager: true, onDelete: "CASCADE" }),
    __metadata("design:type", branches_1.Branch)
], BranchProduct.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Product_1.Product, { eager: true, onDelete: "RESTRICT" }),
    __metadata("design:type", Product_1.Product)
], BranchProduct.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 14,
        scale: 3,
        default: 0,
    }),
    __metadata("design:type", Number)
], BranchProduct.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], BranchProduct.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BranchProduct.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BranchProduct.prototype, "updatedAt", void 0);
exports.BranchProduct = BranchProduct = __decorate([
    (0, typeorm_1.Entity)({ name: "branch_products" }),
    (0, typeorm_1.Unique)(["branch", "product"]),
    (0, typeorm_1.Check)(`"quantity" >= 0`)
], BranchProduct);
