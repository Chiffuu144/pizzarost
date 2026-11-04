const express = require('express');
const app = express();
const cors = require('cors')
const cookieParser = require('cookie-parser')
const products = require('./routes/product');
const auth = require('./routes/auth');
const socialAuth = require('./routes/socialAuth');
const order = require('./routes/order');

// app.use(cors());
app.use(cors({
origin: process.env.FRONTEND_URL || "http://localhost:5173",    credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1/auth', socialAuth);
app.use('/api/auth', socialAuth);
app.use('/api/v1', order);

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }
    console.error(error);

    const isValidationError = error.name === 'ValidationError';
    const isBadObjectId = error.name === 'CastError';
    const isUploadLimitError = error.name === 'MulterError';
    const statusCode = error.statusCode ||
        (isValidationError || isBadObjectId ? 400 : isUploadLimitError ? 413 : 500);
    const message = statusCode >= 500 && statusCode !== 413
        ? 'An unexpected server error occurred'
        : error.message;
    return res.status(statusCode).json({ success: false, message });
});

module.exports = app;
