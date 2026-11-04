const parsePositiveDurationInDays = (value) => {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        return value;
    }

    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    const match = trimmed.match(/^([0-9]+(?:\.[0-9]+)?)([a-zA-Z]*)$/);
    if (!match) {
        return null;
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers = {
        '': 1,
        d: 1,
        h: 1 / 24,
        m: 1 / (24 * 60),
        s: 1 / (24 * 60 * 60)
    };

    const multiplier = multipliers[unit];
    if (!Number.isFinite(multiplier) || multiplier <= 0) {
        return null;
    }

    const durationInDays = amount * multiplier;
    return durationInDays > 0 ? durationInDays : null;
};

const sendToken = (user, statusCode, res, includeToken = false) => {

    // Create Jwt token
    const token = user.getJwtToken();
    const cookieExpiresInDays = parsePositiveDurationInDays(process.env.COOKIE_EXPIRES_TIME);
    if (!Number.isFinite(cookieExpiresInDays) || cookieExpiresInDays <= 0) {
        throw new Error('COOKIE_EXPIRES_TIME must be a positive number of days or a valid duration such as 7d');
    }

    // console.log("token1", token)
    // Options for cookie
    const options = {
        expires: new Date(Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'DEVELOPMENT',
        sameSite: process.env.NODE_ENV === 'DEVELOPMENT' ? 'lax' : 'none',

    }
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        ...(includeToken ? { token } : {}),
        user
    })

}

module.exports = sendToken;
module.exports.parsePositiveDurationInDays = parsePositiveDurationInDays;