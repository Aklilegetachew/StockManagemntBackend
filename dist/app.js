"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("./data-source");
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const role_routes_1 = __importDefault(require("./modules/roles/role.routes"));
const branch_routes_1 = __importDefault(require("./modules/branches/branch.routes"));
const product_routes_1 = __importDefault(require("./modules/products/product.routes"));
const stock_request_route_1 = __importDefault(require("./modules/stock-request/stock-request.route"));
const stock_movement_route_1 = __importDefault(require("./modules/stock-movement/stock-movement.route"));
const central_stock_route_1 = __importDefault(require("./modules/central-stock/central-stock.route"));
const category_routes_1 = __importDefault(require("./modules/categories/category.routes"));
const sales_report_routes_1 = __importDefault(require("./modules/sales-report/sales-report.routes"));
const analytics_routes_1 = __importDefault(require("./modules/analytics/analytics.routes"));
const alerts_routes_1 = __importDefault(require("./modules/alerts/alerts.routes"));
const reports_routes_1 = __importDefault(require("./modules/report/reports.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: false,
}));
app.use(express_1.default.json());
app.use("/api/users", user_routes_1.default);
app.use("/api/roles", role_routes_1.default);
app.use("/api/branches", branch_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/stock-requests", stock_request_route_1.default);
app.use("/api/stock-movements", stock_movement_route_1.default);
app.use("/api/central-stock", central_stock_route_1.default);
app.use("/api/categories", category_routes_1.default);
app.use("/api/sales-reports", sales_report_routes_1.default);
app.use("/api/analytics", analytics_routes_1.default);
app.use("/api/alerts", alerts_routes_1.default);
app.use("/api/reports", reports_routes_1.default);
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use(error_middleware_1.errorHandler);
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log("Database connected ✔️");
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
});
