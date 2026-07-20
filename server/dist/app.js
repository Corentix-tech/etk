"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import configurations
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
// Import middlewares
const rateLimiter_middleware_1 = require("./middleware/rateLimiter.middleware");
const notFound_middleware_1 = require("./middleware/notFound.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const customisation_routes_1 = __importDefault(require("./routes/customisation.routes"));
const lookbook_routes_1 = __importDefault(require("./routes/lookbook.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const homepage_routes_1 = __importDefault(require("./routes/homepage.routes"));
// Load environment variables
dotenv_1.default.config();
// Create Express App
const app = (0, express_1.default)();
// ----------------------
// Global Middlewares
// ----------------------
app.use((0, helmet_1.default)());
const allowedOrigins = [env_1.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, compression_1.default)());
// Connect morgan logger to winston HTTP log stream
app.use((0, morgan_1.default)("combined", {
    stream: {
        write: (message) => logger_1.logger.http(message.trim()),
    },
}));
// Apply global rate limiting to all api endpoints
app.use("/api", rateLimiter_middleware_1.apiRateLimiter);
// ----------------------
// Routes Mounting
// ----------------------
app.use("/api/auth", auth_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api/customisations", customisation_routes_1.default);
app.use("/api/lookbooks", lookbook_routes_1.default);
app.use("/api/settings", settings_routes_1.default);
app.use("/api/dashboard", dashboard_routes_1.default);
app.use("/api/homepage", homepage_routes_1.default);
// Health Check Route
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "ETNIKO Backend is running successfully 🚀",
        timestamp: new Date().toISOString(),
    });
});
// ----------------------
// Error Handlers
// ----------------------
app.use(notFound_middleware_1.notFoundMiddleware);
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
