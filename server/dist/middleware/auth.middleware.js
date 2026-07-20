"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const firebase_1 = require("../config/firebase");
const authMiddleware = async (req, res, next) => {
    try {
        let token = '';
        // 1. Extract bearer token from Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        // 2. Fallback to cookie verification
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access Denied. No authentication token provided.',
                errors: ['Unauthorized'],
            });
            return;
        }
        // 3. Verify Firebase ID Token
        const decodedToken = await firebase_1.auth.verifyIdToken(token);
        // 4. Resolve the user's role from Firestore database for real-time permissions check
        const userDoc = await firebase_1.db.collection('users').doc(decodedToken.uid).get();
        let role = 'CUSTOMER';
        if (userDoc.exists) {
            const userData = userDoc.data();
            const dbRole = userData?.role;
            if (dbRole && ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'ORDER_MANAGER', 'DESIGNER', 'CUSTOMER'].includes(dbRole)) {
                role = dbRole;
            }
        }
        // 5. Attach decoded user details to request object
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email || '',
            name: decodedToken.name || userDoc.data()?.name || 'Client',
            role,
        };
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Authentication failed. Invalid or expired token.',
            errors: [error.message || 'Unauthorized'],
        });
    }
};
exports.authMiddleware = authMiddleware;
exports.default = exports.authMiddleware;
