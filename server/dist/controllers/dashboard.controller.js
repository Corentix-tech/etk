"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const response_1 = require("../utils/response");
class DashboardController {
    dashboardService = new dashboard_service_1.DashboardService();
    /**
     * Compiles gross metrics for the admin interface.
     */
    getAnalytics = async (req, res, next) => {
        try {
            const analytics = await this.dashboardService.getAnalytics();
            (0, response_1.sendSuccess)(res, analytics, 'Dashboard analytics compiled successfully.', 200);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.DashboardController = DashboardController;
exports.default = DashboardController;
