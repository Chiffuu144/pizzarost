const test = require('node:test')
const assert = require('node:assert/strict')
const generateReceipt = require('../utils/generateReceipt')

test('generates a PDF receipt with the order line items and totals', async () => {
    const receipt = await generateReceipt({
        _id: 'order-123',
        createdAt: new Date('2026-01-02T03:04:05.000Z'),
        orderStatus: 'Completed',
        user: { name: 'Test Customer', email: 'customer@example.com' },
        orderItems: [{ name: 'Margherita', quantity: 2, price: 250 }],
        itemsPrice: 500,
        taxPrice: 25,
        shippingPrice: 0,
        totalPrice: 525
    })

    assert.ok(Buffer.isBuffer(receipt))
    assert.match(receipt.toString('latin1', 0, 8), /^%PDF-/)
    assert.ok(receipt.length > 1000)
})
