const test = require('node:test')
const assert = require('node:assert/strict')
const User = require('../models/user')

test('new accounts are active by default and can be deactivated', () => {
    const user = new User({
        name: 'Sofia Romano',
        email: 'sofia@example.test',
        avatar: {
            public_id: 'test-avatar',
            url: 'https://example.test/avatar.png'
        }
    })

    assert.equal(user.isActive, true)

    user.isActive = false
    assert.equal(user.isActive, false)
})
