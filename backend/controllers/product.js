const Product = require('../models/product')
const Order = require('../models/order')
const mongoose = require('mongoose')
const { Filter } = require('bad-words')
const APIFeatures = require('../utils/apiFeatures');
const {
    MAX_IMAGES_PER_PRODUCT,
    deleteProductImages,
    rollbackProductImages,
    uploadProductImage
} = require('../utils/productImages');
const { reviewableOrderFilter } = require('../utils/orderLifecycle');

const profanityFilter = new Filter();
const STORE_FRONT_CATEGORIES = new Set([
    'Pizza',
    'Cheese Pizza',
    'Spicy Pizza',
    'Pepperoni Pizza',
    'Meat Lovers Pizza',
    'Hawaiian Pizza',
    'Vegetarian Pizza'
]);

const getUploadedImages = req => [
    ...(Array.isArray(req.files) ? req.files : []),
    ...(req.body.images === undefined
        ? []
        : (Array.isArray(req.body.images) ? req.body.images : [req.body.images])
            .map(data => ({ data })))
];

const uploadImages = async images => {
    if (images.length > MAX_IMAGES_PER_PRODUCT) {
        throw Object.assign(new Error(`A product can have at most ${MAX_IMAGES_PER_PRODUCT} images`), {
            statusCode: 400
        });
    }

    const uploaded = [];
    try {
        for (const image of images) {
            const result = await uploadProductImage(image);
            uploaded.push({ public_id: result.public_id, url: result.secure_url });
        }
        return uploaded;
    } catch (error) {
        await rollbackProductImages(uploaded);
        throw error;
    }
};

const readProductFields = body => {
    const fields = ['name', 'price', 'description', 'category', 'seller', 'stock'];
    return Object.fromEntries(fields
        .filter(field => body[field] !== undefined)
        .map(field => [field, body[field]]));
};

const validObjectId = value => mongoose.Types.ObjectId.isValid(value);
const badRequest = (res, message) => res.status(400).json({ success: false, message });

const validOptionalNumber = (value, min, max) => value === undefined ||
    (typeof value === 'string' && value.trim() !== '' &&
        Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max);

exports.newProduct = async (req, res) => {
    const uploaded = await uploadImages(getUploadedImages(req));
    try {
        const product = await Product.create({ ...readProductFields(req.body), images: uploaded });
        return res.status(201).json({ success: true, product });
    } catch (error) {
        await rollbackProductImages(uploaded);
        throw error;
    }
}

exports.getSingleProduct = async (req, res) => {
    if (!validObjectId(req.params.id)) {
        return badRequest(res, 'Invalid product ID');
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }
    if (!STORE_FRONT_CATEGORIES.has(product.category)) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }
    return res.status(200).json({
        success: true,
        product
    })
}

exports.getProducts = async (req, res) => {
    const minPrice = req.query['price[gte]'];
    const maxPrice = req.query['price[lte]'];
    const minRating = req.query.minRating;
    const page = req.query.page;
    const categoryFilters = [
        ...(Array.isArray(req.query.category) ? req.query.category : [req.query.category]),
        ...(Array.isArray(req.query.categories) ? req.query.categories : [req.query.categories])
    ].filter(category => category !== undefined);

    if (!validOptionalNumber(minPrice, 0, Number.MAX_SAFE_INTEGER) ||
        !validOptionalNumber(maxPrice, 0, Number.MAX_SAFE_INTEGER) ||
        !validOptionalNumber(minRating, 0, 5) ||
        (minPrice !== undefined && maxPrice !== undefined && Number(minPrice) > Number(maxPrice)) ||
        (page !== undefined && (typeof page !== 'string' || !/^\d+$/.test(page) || Number(page) < 1)) ||
        (req.query.hasReviews !== undefined && !['true', 'false'].includes(req.query.hasReviews)) ||
        (req.query.keyword !== undefined && (typeof req.query.keyword !== 'string' || req.query.keyword.length > 80)) ||
        (req.query.reviewKeyword !== undefined && typeof req.query.reviewKeyword !== 'string') ||
        (typeof req.query.reviewKeyword === 'string' && req.query.reviewKeyword.length > 80) ||
        categoryFilters.length > 20 ||
        categoryFilters.some(category => typeof category !== 'string' || !category.trim() || category.length > 60)) {
        return badRequest(res, 'One or more catalog filters are invalid');
    }

    const resPerPage = 4;
    const storefrontQuery = { category: { $in: [...STORE_FRONT_CATEGORIES] } };
    const productsCount = await Product.countDocuments(storefrontQuery);

    const apiFeatures = new APIFeatures(Product.find(storefrontQuery), req.query).search().filter()
    const filteredProductsCount = await Product.countDocuments(apiFeatures.query.getFilter());

    apiFeatures.pagination(resPerPage);
    const products = await apiFeatures.query;
    const availableCategories = await Product.distinct('category', { category: { $in: [...STORE_FRONT_CATEGORIES] } });

    return res.status(200).json({
        success: true,
        products,
        filteredProductsCount,
        categories: availableCategories,
        resPerPage,
        productsCount,

    })
}

exports.updateProduct = async (req, res) => {
    if (!validObjectId(req.params.id)) {
        return badRequest(res, 'Invalid product ID');
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let retainedPublicIds;
    try {
        retainedPublicIds = req.body.retainedImages === undefined
            ? product.images.map(image => image.public_id)
            : JSON.parse(req.body.retainedImages);
    } catch {
        return badRequest(res, 'The retained image list is invalid');
    }
    if (!Array.isArray(retainedPublicIds) ||
        retainedPublicIds.some(publicId => typeof publicId !== 'string')) {
        return badRequest(res, 'The retained image list is invalid');
    }

    const retainedSet = new Set(retainedPublicIds);
    const retainedImages = product.images.filter(image => retainedSet.has(image.public_id));
    if (retainedImages.length !== retainedSet.size) {
        return badRequest(res, 'One or more selected images do not belong to this product');
    }

    const imagesToUpload = getUploadedImages(req);
    if (retainedImages.length + imagesToUpload.length > MAX_IMAGES_PER_PRODUCT) {
        return badRequest(res, `A product can have at most ${MAX_IMAGES_PER_PRODUCT} images`);
    }
    const uploaded = await uploadImages(imagesToUpload);
    const removedImages = product.images.filter(image => !retainedSet.has(image.public_id));
    Object.assign(product, readProductFields(req.body), { images: [...retainedImages, ...uploaded] });

    try {
        await product.save();
    } catch (error) {
        await rollbackProductImages(uploaded);
        throw error;
    }

    const cleanupFailures = await deleteProductImages(removedImages);
    cleanupFailures.forEach(({ publicId, error }) => {
        console.error(`Unable to remove Cloudinary image ${publicId}:`, error);
    });
    return res.status(200).json({
        success: true,
        product,
        ...(cleanupFailures.length ? { cleanupWarning: 'Some removed images could not be deleted from storage' } : {})
    });
}

const removeProducts = async products => {
    const ids = products.map(product => product._id);
    await Product.deleteMany({ _id: { $in: ids } });
    const cleanupFailures = await deleteProductImages(products.flatMap(product => product.images));
    cleanupFailures.forEach(({ publicId, error }) => {
        console.error(`Unable to remove Cloudinary image ${publicId}:`, error);
    });
    return cleanupFailures.length;
};

exports.deleteProduct = async (req, res) => {
    if (!validObjectId(req.params.id)) {
        return badRequest(res, 'Invalid product ID');
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }

    const cleanupFailureCount = await removeProducts([product]);
    return res.status(cleanupFailureCount ? 207 : 200).json({
        success: true,
        message: 'Product deleted',
        ...(cleanupFailureCount ? { cleanupWarning: 'Product photos could not all be deleted from storage' } : {})
    })
}

exports.deleteProducts = async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || ids.length > 100 ||
        ids.some(id => !validObjectId(id))) {
        return badRequest(res, 'Provide between 1 and 100 valid product IDs');
    }
    const uniqueIds = [...new Set(ids)];
    const products = await Product.find({ _id: { $in: uniqueIds } });
    if (products.length !== uniqueIds.length) {
        return res.status(404).json({
            success: false,
            message: 'One or more selected products no longer exist'
        });
    }

    const cleanupFailureCount = await removeProducts(products);
    return res.status(cleanupFailureCount ? 207 : 200).json({
        success: true,
        deletedCount: products.length,
        ...(cleanupFailureCount ? { cleanupWarning: 'Some product photos could not be deleted from storage' } : {})
    });
}

exports.getAdminProducts = async (req, res) => {
    const products = await Product.find();
    return res.status(200).json({ success: true, products });
}

exports.createProductReview = async (req, res) => {
    const { rating, comment, productId } = req.body;
    const numericRating = Number(rating);
    const normalizedComment = typeof comment === 'string'
        ? profanityFilter.clean(comment.trim()).trim()
        : '';
    if (!validObjectId(productId) || !Number.isInteger(numericRating) ||
        numericRating < 1 || numericRating > 5 ||
        !normalizedComment || normalizedComment.length > 1000) {
        return badRequest(res, 'Provide a product, a 1–5 star rating, and a review of at most 1000 characters');
    }

    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let review = product.reviews.find(item => item.user.toString() === req.user._id.toString());
    if (!review) {
        const completedOrder = await Order.exists(
            reviewableOrderFilter(req.user._id, productId)
        );
        if (!completedOrder) {
            return res.status(403).json({
                success: false,
                message: 'You can review this product after a completed order containing it'
            });
        }
    }

    if (review) {
        review.rating = numericRating;
        review.comment = normalizedComment;
    } else {
        product.reviews.push({
            user: req.user._id,
            name: req.user.name,
            rating: numericRating,
            comment: normalizedComment
        });
    }
    product.numOfReviews = product.reviews.length;
    product.ratings = product.reviews.reduce((sum, item) => sum + item.rating, 0) /
        product.numOfReviews;
    await product.save();
    review = product.reviews.find(item => item.user.toString() === req.user._id.toString());
    return res.status(200).json({
        success: true,
        review,
        product
    })
}

exports.getProductReviews = async (req, res) => {
    if (!validObjectId(req.query.id)) {
        return badRequest(res, 'Invalid product ID');
    }
    const product = await Product.findById(req.query.id).populate('reviews.user', 'name email');
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const completedOrder = await Order.exists(
        reviewableOrderFilter(req.user._id, product._id)
    );
    const userReview = product.reviews.find(review =>
        (review.user?._id || review.user)?.toString() === req.user._id.toString()
    );
    res.status(200).json({
        success: true,
        reviews: product.reviews,
        canReview: Boolean(completedOrder),
        userReview: userReview || null
    })
}

exports.deleteReview = async (req, res) => {
    if (!validObjectId(req.query.id) || !validObjectId(req.query.productId)) {
        return badRequest(res, 'Invalid review or product ID');
    }
    const product = await Product.findById(req.query.productId);
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id);
    if (reviews.length === product.reviews.length) {
        return res.status(404).json({ success: false, message: 'Review not found' });
    }

    product.reviews = reviews;
    product.numOfReviews = reviews.length;
    product.ratings = reviews.length
        ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length
        : 0;
    await product.save();
    return res.status(200).json({
        success: true,
        reviews: product.reviews,
        ratings: product.ratings,
        numOfReviews: product.numOfReviews
    })
}

exports.productSales = async (req, res, next) => {
    const totalSales = await Order.aggregate([
        { $match: { orderStatus: { $in: ['Completed', 'Shipped', 'Delivered'] } } },
        {
            $group: {
                _id: null,
                total: { $sum: "$itemsPrice" }
            }
        },
    ])
    const sales = await Order.aggregate([
        { $match: { orderStatus: { $in: ['Completed', 'Shipped', 'Delivered'] } } },
        { $project: { _id: 0, orderItems: 1 } },
        { $unwind: "$orderItems" },
        {
            $group: {
                _id: { product: "$orderItems.name" },
                total: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
            }
        },
    ])

    const grandTotal = totalSales[0]?.total || 0;
    const totalPercentage = sales.map(item => ({
            name: item._id.product,
            percent: grandTotal ? Number(((item.total / grandTotal) * 100).toFixed(2)) : 0
    }))
    res.status(200).json({
        success: true,
        totalPercentage,
        sales,
        totalSales
    })

}