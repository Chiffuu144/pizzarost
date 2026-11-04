const test = require('node:test')
const assert = require('node:assert/strict')
const { reviewableOrderFilter } = require('../utils/orderLifecycle')

test('review eligibility requires a completed or delivered order containing the product', () => {
    assert.deepEqual(reviewableOrderFilter('user-id', 'product-id'), {
        user: 'user-id',
        orderStatus: { $in: ['Completed', 'Delivered'] },
        'orderItems.product': 'product-id'
    })
})
