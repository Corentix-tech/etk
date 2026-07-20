"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const firebase_1 = require("../config/firebase");
const firebase_2 = require("../utils/firebase");
const logger_1 = require("../config/logger");
class DashboardService {
    /**
     * Aggregates database records to compile comprehensive store analytics.
     */
    async getAnalytics() {
        try {
            // 1. Fetch all paid orders for revenue and count metrics
            const ordersSnapshot = await firebase_1.db
                .collection('orders')
                .where('paymentStatus', '==', 'paid')
                .get();
            const paidOrders = (0, firebase_2.mapQuery)(ordersSnapshot);
            // 2. Query total catalog product documents size
            const productsSnapshot = await firebase_1.db.collection('products').select().get();
            const totalProducts = productsSnapshot.size;
            // 3. Query total user documents with CUSTOMER role
            const usersSnapshot = await firebase_1.db
                .collection('users')
                .where('role', '==', 'CUSTOMER')
                .select()
                .get();
            const totalCustomers = usersSnapshot.size;
            // 4. Query total customized styling request documents size
            const customisationsSnapshot = await firebase_1.db.collection('customisations').select().get();
            const totalCustomisations = customisationsSnapshot.size;
            // Calculate Gross Revenue and compile monthly chart groups
            let totalRevenue = 0;
            const monthlyRevenueMap = {};
            const categorySalesMap = {};
            paidOrders.forEach((order) => {
                totalRevenue += order.total;
                // Group monthly revenue (format: YYYY-MM)
                if (order.createdAt) {
                    const monthKey = order.createdAt.substring(0, 7);
                    monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + order.total;
                }
                // Aggregate category distributions from purchase items list
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach((item) => {
                        const catPrefix = item.sku?.substring(0, 3) || 'GEN';
                        categorySalesMap[catPrefix] = (categorySalesMap[catPrefix] || 0) + item.quantity;
                    });
                }
            });
            // Format monthly revenue charts sorted chronologically
            const monthlyRevenue = Object.keys(monthlyRevenueMap)
                .map((month) => ({
                month,
                revenue: monthlyRevenueMap[month],
            }))
                .sort((a, b) => a.month.localeCompare(b.month));
            // Resolve category sales count mapping values
            const categorySales = Object.keys(categorySalesMap).map((prefix) => {
                let categoryName = 'OTHER';
                if (prefix === 'WOM')
                    categoryName = 'WOMEN';
                else if (prefix === 'MEN')
                    categoryName = 'MEN';
                else if (prefix === 'KID')
                    categoryName = 'KIDS';
                return {
                    category: categoryName,
                    salesCount: categorySalesMap[prefix],
                };
            });
            logger_1.logger.info('📊 Compiled administrative dashboard analytics successfully.');
            return {
                kpis: {
                    totalRevenue,
                    totalOrders: paidOrders.length,
                    totalProducts,
                    totalCustomers,
                    totalCustomisations,
                },
                monthlyRevenue,
                categorySales,
            };
        }
        catch (error) {
            logger_1.logger.error('Error in DashboardService getAnalytics:', error);
            throw error;
        }
    }
}
exports.DashboardService = DashboardService;
exports.default = DashboardService;
