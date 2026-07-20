"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const product_repository_1 = require("../repositories/product.repository");
const slug_1 = require("../utils/slug");
const sku_1 = require("../utils/sku");
const cloudinary_1 = require("../utils/cloudinary");
const pagination_1 = require("../utils/pagination");
const logger_1 = require("../config/logger");
class ProductService {
    productRepository = new product_repository_1.ProductRepository();
    /**
     * Registers a brand new garment product, uploading any local files to Cloudinary.
     */
    async createProduct(productData, localImagePaths) {
        try {
            // 1. Generate unique URL lookup slug
            const slug = (0, slug_1.slugify)(productData.name);
            const existingProduct = await this.productRepository.findBySlug(slug);
            if (existingProduct) {
                throw new Error(`A product with name/slug "${productData.name}" already exists.`);
            }
            // 2. Generate unique SKU identification code
            const nextSequence = await this.productRepository.getNextSequence();
            const sku = (0, sku_1.generateSku)(productData.category, productData.fabric, nextSequence);
            // 3. Upload gallery pictures to Cloudinary products folder
            const imageUrls = [];
            for (const path of localImagePaths) {
                const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(path, 'products');
                imageUrls.push(uploadResult.secureUrl);
            }
            const newProduct = {
                ...productData,
                slug,
                sku,
                images: imageUrls,
            };
            const createdProduct = await this.productRepository.create(newProduct);
            logger_1.logger.info(`👗 Registered new product: ${createdProduct.name} (${createdProduct.sku})`);
            return createdProduct;
        }
        catch (error) {
            logger_1.logger.error('Error in ProductService createProduct:', error);
            throw error;
        }
    }
    /**
     * Modifies an existing product, optional file uploads are added directly to the image gallery.
     */
    async updateProduct(id, updateData, localImagePaths) {
        try {
            const existingProduct = await this.productRepository.findById(id);
            if (!existingProduct) {
                throw new Error(`Product with ID ${id} not found.`);
            }
            let imageUrls = [...(existingProduct.images || [])];
            // Handle file uploads if new images are provided
            if (localImagePaths && localImagePaths.length > 0) {
                const newUrls = [];
                for (const path of localImagePaths) {
                    const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(path, 'products');
                    newUrls.push(uploadResult.secureUrl);
                }
                imageUrls = [...imageUrls, ...newUrls];
            }
            const updatedFields = {
                ...updateData,
                images: imageUrls,
                ...(updateData.name && { slug: (0, slug_1.slugify)(updateData.name) }),
            };
            const updatedProduct = await this.productRepository.update(id, updatedFields);
            logger_1.logger.info(`👗 Updated product: ${existingProduct.sku}`);
            return updatedProduct;
        }
        catch (error) {
            logger_1.logger.error(`Error in ProductService updateProduct for ID ${id}:`, error);
            throw error;
        }
    }
    /**
     * Removes a product catalog document and purges its images from Cloudinary.
     */
    async deleteProduct(id) {
        try {
            const product = await this.productRepository.findById(id);
            if (!product) {
                throw new Error(`Product with ID ${id} not found.`);
            }
            // Purge assets from Cloudinary (extracting public ID from Cloudinary secure URL)
            for (const url of product.images) {
                const urlParts = url.split('/');
                const fileWithExtension = urlParts[urlParts.length - 1];
                const publicId = `etniko/products/${fileWithExtension.split('.')[0]}`;
                await (0, cloudinary_1.deleteFromCloudinary)(publicId);
            }
            await this.productRepository.delete(id);
            logger_1.logger.info(`👗 Deleted product catalog: ${product.name} (${product.sku})`);
        }
        catch (error) {
            logger_1.logger.error(`Error in ProductService deleteProduct for ID ${id}:`, error);
            throw error;
        }
    }
    /**
     * Fetches a single product record by its Firestore Document ID.
     */
    async getProductById(id) {
        return this.productRepository.findById(id);
    }
    /**
     * Fetches a single product record by its unique URL slug.
     */
    async getProductBySlug(slug) {
        return this.productRepository.findBySlug(slug);
    }
    /**
     * Lists products matching filters with paginated pagination metadata.
     */
    async listProducts(filters, page = 1, limit = 10) {
        const { items, total } = await this.productRepository.list(filters, { page, limit });
        const pagination = (0, pagination_1.getPaginationMetadata)(total, page, limit);
        return { items, pagination };
    }
    /**
     * Increments or decrements sizes stock levels.
     */
    async updateStock(id, size, quantityToDeduct) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new Error(`Product with ID ${id} not found.`);
        }
        const currentStock = product.sizes[size] || 0;
        if (currentStock < quantityToDeduct) {
            throw new Error(`Insufficient stock for product ${product.name} in size ${size}. Available: ${currentStock}`);
        }
        const updatedSizes = {
            ...product.sizes,
            [size]: currentStock - quantityToDeduct,
        };
        return this.productRepository.update(id, { sizes: updatedSizes });
    }
}
exports.ProductService = ProductService;
exports.default = ProductService;
