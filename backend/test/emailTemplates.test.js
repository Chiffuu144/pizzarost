const test = require('node:test')
const assert = require('node:assert/strict')
const {
    createOrderStatusEmail,
    createPasswordResetEmail
} = require('../utils/emailTemplates')

test('creates a branded password-reset email with escaped values and a reset action', () => {
    const email = createPasswordResetEmail({
        name: '<Taylor>',
        resetUrl: 'https://pizzaro.example/password/reset/token?source=mail'
    })

    assert.equal(email.subject, 'Reset your Pizzaro password')
    assert.match(email.message, /expires in 30 minutes/)
    assert.match(email.html, /background-color:#211f20/)
    assert.match(email.html, /bgcolor="#b91c1c"/)
    assert.match(email.html, /href="https:\/\/pizzaro\.example\/password\/reset\/token\?source=mail"/)
    assert.match(email.html, /Hello &lt;Taylor&gt;/)
    assert.doesNotMatch(email.html, /Hello <Taylor>/)
})

test('creates a branded order email with escaped order content, totals, and order link', () => {
    const originalFrontendUrl = process.env.FRONTEND_URL
    process.env.FRONTEND_URL = 'https://pizzaro.example/'

    try {
        const email = createOrderStatusEmail({
            _id: 'order-123',
            orderStatus: 'Completed',
            user: { name: '<Taylor>' },
            orderItems: [{ name: '<Margherita>', quantity: 2, price: 250 }],
            itemsPrice: 500,
            taxPrice: 25,
            shippingPrice: 0,
            totalPrice: 525
        })

        assert.match(email.subject, /Pizzaro order order-123: Completed/)
        assert.match(email.html, /Your order has an update/)
        assert.match(email.html, /background-color:#211f20/)
        assert.match(email.html, /#order-123/)
        assert.match(email.html, /&lt;Margherita&gt;/)
        assert.doesNotMatch(email.html, /<td[^>]*><Margherita>/)
        assert.doesNotMatch(email.html, /Your Pizzaro order status has been updated/)
        assert.match(email.message, /Grand total: ₱525\.00/)
        assert.match(email.html, /href="https:\/\/pizzaro\.example\/orders\/me"/)
        assert.match(email.html, /Your itemized receipt is attached as a PDF/)
    } finally {
        if (originalFrontendUrl === undefined) {
            delete process.env.FRONTEND_URL
        } else {
            process.env.FRONTEND_URL = originalFrontendUrl
        }
    }
})
