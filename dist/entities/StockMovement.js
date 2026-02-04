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
exports.StockMovement = exports.StockMovementType = void 0;
// src/entities/StockMovement.ts
const typeorm_1 = require("typeorm");
const Product_1 = require("./Product");
const branches_1 = require("./branches");
const user_1 = require("./user");
var StockMovementType;
(function (StockMovementType) {
    StockMovementType["ADDITION"] = "ADDITION";
    StockMovementType["DEDUCTION"] = "DEDUCTION";
    StockMovementType["SALE"] = "SALE";
    StockMovementType["TRANSFER_IN"] = "TRANSFER_IN";
    StockMovementType["TRANSFER_OUT"] = "TRANSFER_OUT";
})(StockMovementType || (exports.StockMovementType = StockMovementType = {}));
let StockMovement = class StockMovement {
};
exports.StockMovement = StockMovement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], StockMovement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Product_1.Product, { eager: true }),
    __metadata("design:type", Product_1.Product)
], StockMovement.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branches_1.Branch, { nullable: true, eager: true }),
    __metadata("design:type", branches_1.Branch // null means central stock
    )
], StockMovement.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: StockMovementType }),
    __metadata("design:type", String)
], StockMovement.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 12,
        scale: 2,
    }),
    __metadata("design:type", Number)
], StockMovement.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StockMovement.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], StockMovement.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, { nullable: true, eager: true }),
    __metadata("design:type", user_1.User // user who initiated/requested the movement
    )
], StockMovement.prototype, "requestedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, { nullable: true, eager: true }),
    __metadata("design:type", user_1.User // user who approved/performed the action
    )
], StockMovement.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StockMovement.prototype, "createdAt", void 0);
exports.StockMovement = StockMovement = __decorate([
    (0, typeorm_1.Entity)({ name: "stock_movements" })
], StockMovement);
