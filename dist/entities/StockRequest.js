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
exports.StockRequest = exports.StockRequestStatus = void 0;
const typeorm_1 = require("typeorm");
const branches_1 = require("./branches");
const user_1 = require("./user");
const StockRequestItem_1 = require("./StockRequestItem");
var StockRequestStatus;
(function (StockRequestStatus) {
    StockRequestStatus["PENDING"] = "PENDING";
    StockRequestStatus["PENDING_SUPERVISOR"] = "PENDING_SUPERVISOR";
    StockRequestStatus["PENDING_BRANCH_APPROVAL"] = "PENDING_BRANCH_APPROVAL";
    StockRequestStatus["APPROVED"] = "APPROVED";
    StockRequestStatus["REJECTED"] = "REJECTED";
    StockRequestStatus["DISPATCHED"] = "DISPATCHED";
    StockRequestStatus["RECEIVED"] = "RECEIVED";
})(StockRequestStatus || (exports.StockRequestStatus = StockRequestStatus = {}));
let StockRequest = class StockRequest {
};
exports.StockRequest = StockRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], StockRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branches_1.Branch, { eager: true }),
    __metadata("design:type", branches_1.Branch)
], StockRequest.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, { eager: true }),
    __metadata("design:type", user_1.User)
], StockRequest.prototype, "requestedBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => StockRequestItem_1.StockRequestItem, (item) => item.stockRequest, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], StockRequest.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: StockRequestStatus,
        default: StockRequestStatus.PENDING,
    }),
    __metadata("design:type", String)
], StockRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], StockRequest.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], StockRequest.prototype, "dispatchedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], StockRequest.prototype, "receivedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], StockRequest.prototype, "rejectedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], StockRequest.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], StockRequest.prototype, "urgency", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branches_1.Branch, { nullable: true, eager: true }),
    __metadata("design:type", Object)
], StockRequest.prototype, "assignedBranch", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], StockRequest.prototype, "supervisorForwardedToCentral", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StockRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], StockRequest.prototype, "updatedAt", void 0);
exports.StockRequest = StockRequest = __decorate([
    (0, typeorm_1.Entity)({ name: "stock_requests" })
], StockRequest);
