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
exports.SalesReport = void 0;
const typeorm_1 = require("typeorm");
const branches_1 = require("./branches");
const user_1 = require("./user");
let SalesReport = class SalesReport {
};
exports.SalesReport = SalesReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], SalesReport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branches_1.Branch, { nullable: false }),
    __metadata("design:type", branches_1.Branch)
], SalesReport.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], SalesReport.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], SalesReport.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, { nullable: false }),
    __metadata("design:type", user_1.User)
], SalesReport.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SalesReport.prototype, "originalFileName", void 0);
__decorate([
    (0, typeorm_1.OneToMany)("SalesReportItem", "salesReport", {
        cascade: true,
    }),
    __metadata("design:type", Array)
], SalesReport.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SalesReport.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SalesReport.prototype, "updatedAt", void 0);
exports.SalesReport = SalesReport = __decorate([
    (0, typeorm_1.Entity)({ name: "sales_reports" })
], SalesReport);
