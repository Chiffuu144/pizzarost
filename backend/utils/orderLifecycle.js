const REVIEWABLE_STATUSES = new Set(['Completed', 'Delivered']);

const reviewableOrderFilter = (userId, productId) => ({
    user: userId,
    orderStatus: { $in: [...REVIEWABLE_STATUSES] },
    'orderItems.product': productId
});

module.exports = {
    reviewableOrderFilter
};
