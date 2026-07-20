"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const user_service_1 = require("../services/user.service");
const response_1 = require("../utils/response");
const env_1 = require("../config/env");
class AuthController {
    userService = new user_service_1.UserService();
    /**
     * Helper to attach JWT session token to an HTTP-Only secure cookie.
     */
    setTokenCookie(res, token) {
        res.cookie('token', token, {
            httpOnly: true,
            secure: env_1.env.NODE_ENV === 'production',
            sameSite: env_1.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        });
    }
    /**
     * Handles new client registration calls.
     */
    register = async (req, res, next) => {
        try {
            const { idToken, name, phone } = req.body;
            const { user, token } = await this.userService.register(idToken, name, phone);
            this.setTokenCookie(res, token);
            (0, response_1.sendSuccess)(res, { user, token }, 'Registration completed successfully.', 201);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Handles client login verification calls.
     */
    login = async (req, res, next) => {
        try {
            const { idToken } = req.body;
            const { user, token } = await this.userService.login(idToken);
            this.setTokenCookie(res, token);
            (0, response_1.sendSuccess)(res, { user, token }, 'Logged in successfully.', 200);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Clears the HTTP-Only JWT session cookie on client logout.
     */
    logout = async (req, res, next) => {
        try {
            res.clearCookie('token', {
                httpOnly: true,
                secure: env_1.env.NODE_ENV === 'production',
                sameSite: env_1.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            });
            (0, response_1.sendSuccess)(res, {}, 'Logged out successfully.', 200);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Fetches the current logged in user's profile details.
     */
    getProfile = async (req, res, next) => {
        try {
            const uid = req.user.uid;
            const user = await this.userService.getProfile(uid);
            (0, response_1.sendSuccess)(res, { user }, 'Profile retrieved successfully.', 200);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Appends an address card to the user's registry.
     */
    addAddress = async (req, res, next) => {
        try {
            const uid = req.user.uid;
            const address = await this.userService.addAddress(uid, req.body);
            (0, response_1.sendSuccess)(res, { address }, 'Address added successfully.', 201);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Removes an address card from the user's registry.
     */
    deleteAddress = async (req, res, next) => {
        try {
            const uid = req.user.uid;
            const { addressId } = req.params;
            const updatedAddresses = await this.userService.deleteAddress(uid, addressId);
            (0, response_1.sendSuccess)(res, { addresses: updatedAddresses }, 'Address removed successfully.', 200);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AuthController = AuthController;
exports.default = AuthController;
