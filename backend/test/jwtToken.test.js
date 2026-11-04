const test = require('node:test')
const assert = require('node:assert/strict')
const { parsePositiveDurationInDays } = require('../utils/jwtToken')

test('parses cookie expiry values like 7d and 720d as valid day counts', () => {
    assert.equal(parsePositiveDurationInDays('7d'), 7)
    assert.equal(parsePositiveDurationInDays('720d'), 720)
    assert.equal(parsePositiveDurationInDays('7'), 7)
    assert.equal(parsePositiveDurationInDays('12h'), 0.5)
    assert.equal(parsePositiveDurationInDays('90m'), 0.0625)
    assert.equal(parsePositiveDurationInDays('0'), null)
    assert.equal(parsePositiveDurationInDays('invalid'), null)
})
