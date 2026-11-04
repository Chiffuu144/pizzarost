const multer = require("multer");
const path = require("path");

module.exports = multer({
    limits: { fileSize: 5 * 1024 * 1024, files: 10 },
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ||
            !['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
            const error = new Error('Images must be JPEG, PNG, or WebP files');
            error.statusCode = 400;
            return cb(error);
        }
        cb(null, true);
    },
});