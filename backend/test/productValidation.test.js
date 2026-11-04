const test = require('node:test')
const assert = require('node:assert/strict')
const Product = require('../models/product')
const APIFeatures = require('../utils/apiFeatures')

const validProduct = overrides => new Product({
    name: 'Test pizza',
    price: 250,
    description: 'A valid pizza description.',
    category: 'Pizza',
    seller: 'Pizzaro',
    stock: 10,
    images: [{ public_id: 'test-image', url: 'https://example.com/pizza.png' }],
    ...overrides
})

test('accepts a product with valid price and stock', async () => {
    await assert.doesNotReject(validProduct().validate())
})

test('rejects non-pizza product categories', async () => {
    await assert.rejects(validProduct({ category: 'Laptops' }).validate(), error => {
        assert.equal(error.errors.category.kind, 'enum')
        return true
    })
})

test('rejects a product price outside the allowed range', async () => {
    await assert.rejects(validProduct({ price: 0 }).validate(), error => {
        assert.equal(error.errors.price.kind, 'min')
        return true
    })
})

test('rejects negative and fractional stock quantities', async () => {
    await assert.rejects(validProduct({ stock: -1 }).validate(), error => {
        assert.equal(error.errors.stock.kind, 'min')
        return true
    })
    await assert.rejects(validProduct({ stock: 1.5 }).validate(), error => {
        assert.equal(error.errors.stock.kind, 'user defined')
        return true
    })
})

test('requires at least one image and limits products to ten images', async () => {
    await assert.rejects(validProduct({ images: [] }).validate(), error => {
        assert.equal(error.errors.images.kind, 'user defined')
        return true
    })

    const images = Array.from({ length: 11 }, (_, index) => ({
        public_id: `image-${index}`,
        url: `https://example.com/${index}.png`
    }))
    await assert.rejects(validProduct({ images }).validate(), error => {
        assert.equal(error.errors.images.kind, 'user defined')
        return true
    })
})

test('applies inclusive minimum and maximum price filters', () => {
    let appliedFilter
    const query = {
        find(filter) {
            appliedFilter = filter
            return this
        }
    }

    new APIFeatures(query, {
        'price[gte]': '500',
        'price[lte]': '650'
    }).filter()

    assert.deepEqual(appliedFilter, {
        $and: [{ price: { $gte: 500, $lte: 650 } }]
    })
})

test('combines category, rating, review-presence, and escaped review text filters', () => {
    let appliedFilter
    const query = {
        find(filter) {
            appliedFilter = filter
            return this
        }
    }

    new APIFeatures(query, {
        categories: ['Pizza', 'Vegetarian Pizza'],
        minRating: '4.5',
        hasReviews: 'true',
        reviewKeyword: 'hot.*'
    }).filter()

    assert.deepEqual(appliedFilter, {
        $and: [
            { category: { $in: ['Pizza', 'Vegetarian Pizza'] } },
            { ratings: { $gte: 4.5 } },
            { numOfReviews: { $gt: 0 } },
            { 'reviews.comment': { $regex: 'hot\\.\\*', $options: 'i' } }
        ]
    })
})

test('escapes search text and applies the requested page size and offset', () => {
    let searchFilter
    const query = {
        find(filter) {
            searchFilter = filter
            return this
        },
        limit(value) {
            this.limitValue = value
            return this
        },
        skip(value) {
            this.skipValue = value
            return this
        }
    }

    const features = new APIFeatures(query, { keyword: '.*', page: '3' })
    features.search().pagination(4)

    assert.deepEqual(searchFilter, { name: { $regex: '\\.\\*', $options: 'i' } })
    assert.equal(query.limitValue, 4)
    assert.equal(query.skipValue, 8)
})
