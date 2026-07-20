"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const firebase_1 = require("../config/firebase");
const user_repository_1 = require("../repositories/user.repository");
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../config/logger");
class UserService {
    userRepository = new user_repository_1.UserRepository();
    /**
     * Registers a new user profiles in Firestore after verifying their Firebase ID token.
     * @param idToken Firebase client identity token
     * @param name User's full name
     * @param phone User's contact number
     */
    async register(idToken, name, phone) {
        try {
            // 1. Verify token with Firebase Authentication
            const decodedToken = await firebase_1.auth.verifyIdToken(idToken);
            const { uid, email } = decodedToken;
            if (!email) {
                throw new Error('Firebase token is missing an email address.');
            }
            // 2. Check if the user document already exists in Firestore
            const existingUser = await this.userRepository.findById(uid);
            if (existingUser) {
                throw new Error('User account is already registered in our system.');
            }
            // 3. Persist profile document to database (default role: CUSTOMER)
            const newUser = {
                email: email.toLowerCase(),
                name,
                phone,
                role: 'CUSTOMER',
                addresses: [],
            };
            const savedUser = await this.userRepository.save(uid, newUser);
            // 4. Generate custom JWT token for session authorizations
            const token = (0, jwt_1.generateToken)({
                uid,
                email: savedUser.email,
                role: savedUser.role,
                name: savedUser.name,
            });
            logger_1.logger.info(`👤 New client registered: ${savedUser.email} (${uid})`);
            return { user: savedUser, token };
        }
        catch (error) {
            logger_1.logger.error('Error in UserService register:', error);
            throw error;
        }
    }
    /**
     * Authenticates a user and issues a JWT token. Creates a profile document if it is missing.
     * @param idToken Firebase client identity token
     */
    async login(idToken) {
        try {
            // 1. Verify token with Firebase Authentication
            const decodedToken = await firebase_1.auth.verifyIdToken(idToken);
            const { uid, email, name } = decodedToken;
            if (!email) {
                throw new Error('Firebase token is missing an email address.');
            }
            // 2. Fetch profile document from Firestore
            let userDoc = await this.userRepository.findById(uid);
            // 3. Fallback: Create user record if missing (e.g. social login signup bypasses standard register)
            if (!userDoc) {
                const newUser = {
                    email: email.toLowerCase(),
                    name: name || 'Couture Client',
                    phone: '',
                    role: 'CUSTOMER',
                    addresses: [],
                };
                userDoc = await this.userRepository.save(uid, newUser);
                logger_1.logger.info(`👤 Auto-created missing user document for: ${email}`);
            }
            // 4. Issue custom JWT token
            const token = (0, jwt_1.generateToken)({
                uid,
                email: userDoc.email,
                role: userDoc.role,
                name: userDoc.name,
            });
            logger_1.logger.info(`👤 Client logged in: ${userDoc.email} (${uid})`);
            return { user: userDoc, token };
        }
        catch (error) {
            logger_1.logger.error('Error in UserService login:', error);
            throw error;
        }
    }
    /**
     * Retrieves a client's profile details.
     * @param uid Firebase auth uid
     */
    async getProfile(uid) {
        const userDoc = await this.userRepository.findById(uid);
        if (!userDoc) {
            throw new Error(`Profile not found for client: ${uid}`);
        }
        return userDoc;
    }
    /**
     * Appends a shipping address to the customer's address book.
     * @param uid User Firebase UID
     * @param address Shipping address details
     */
    async addAddress(uid, address) {
        return this.userRepository.addAddress(uid, address);
    }
    /**
     * Deletes a shipping address from the customer's address book.
     * @param uid User Firebase UID
     * @param addressId Unique address card ID
     */
    async deleteAddress(uid, addressId) {
        return this.userRepository.deleteAddress(uid, addressId);
    }
}
exports.UserService = UserService;
exports.default = UserService;
