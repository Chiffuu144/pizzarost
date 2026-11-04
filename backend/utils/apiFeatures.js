product = require("../models/product");
class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = typeof this.queryStr.keyword === 'string'
            ? this.queryStr.keyword.trim().slice(0, 80)
            : '';
        const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        this.query = this.query.find(safeKeyword
            ? { name: { $regex: safeKeyword, $options: 'i' } }
            : {});
        return this;
    }

    filter() {
        const filters = [];
        const lowerPrice = this.queryStr['price[gte]'];
        const upperPrice = this.queryStr['price[lte]'];
        if (lowerPrice !== undefined || upperPrice !== undefined) {
            const price = {};
            if (lowerPrice !== undefined) price.$gte = Number(lowerPrice);
            if (upperPrice !== undefined) price.$lte = Number(upperPrice);
            filters.push({ price });
        }

        const requestedCategories = [
            ...(Array.isArray(this.queryStr.category) ? this.queryStr.category : [this.queryStr.category]),
            ...(Array.isArray(this.queryStr.categories) ? this.queryStr.categories : [this.queryStr.categories])
        ].filter(category => typeof category === 'string' && category.trim());
        if (requestedCategories.length) {
            filters.push({
                category: { $in: [...new Set(requestedCategories.map(category => category.trim()))] }
            });
        }
        if (this.queryStr.minRating !== undefined) {
            filters.push({ ratings: { $gte: Number(this.queryStr.minRating) } });
        }
        if (this.queryStr.hasReviews === 'true') {
            filters.push({ numOfReviews: { $gt: 0 } });
        } else if (this.queryStr.hasReviews === 'false') {
            filters.push({ numOfReviews: 0 });
        }
        if (typeof this.queryStr.reviewKeyword === 'string' && this.queryStr.reviewKeyword.trim()) {
            const safeReviewKeyword = this.queryStr.reviewKeyword.trim().slice(0, 80)
                .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filters.push({ 'reviews.comment': { $regex: safeReviewKeyword, $options: 'i' } });
        }

        this.query = this.query.find(filters.length ? { $and: filters } : {});
        return this;
    }

    pagination(resPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage - 1);

        this.query = this.query.limit(resPerPage).skip(skip);
        return this;
    }
}
module.exports = APIFeatures