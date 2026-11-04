const fs = require('fs/promises');
const cloudinary = require('cloudinary').v2;

const MAX_IMAGES_PER_PRODUCT = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const DATA_URL_PATTERN = /^data:image\/(?:jpeg|png|webp);base64,([a-zA-Z0-9+/]+={0,2})$/;

const uploadProductImage = async image => {
    if (image.path) {
        return cloudinary.uploader.upload(image.path, {
            folder: 'products',
            transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
        }).finally(() => fs.unlink(image.path).catch(error => {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }));
    }

    if (typeof image.data !== 'string') {
        throw new Error('Invalid image upload');
    }

    const match = image.data.match(DATA_URL_PATTERN);
    if (!match || Buffer.from(match[1], 'base64').length > MAX_IMAGE_SIZE) {
        const error = new Error('Images must be JPEG, PNG, or WebP files smaller than 5 MB');
        error.statusCode = 400;
        throw error;
    }

    return cloudinary.uploader.upload(image.data, {
        folder: 'products',
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
    });
};

const deleteProductImages = async images => {
    const results = await Promise.allSettled(
        [...new Set(images.map(image => image.public_id).filter(Boolean))]
            .map(publicId => cloudinary.uploader.destroy(publicId))
    );

    return results.flatMap((result, index) => result.status === 'rejected'
        ? [{ publicId: [...new Set(images.map(image => image.public_id).filter(Boolean))][index], error: result.reason }]
        : []);
};

const rollbackProductImages = async images => {
    const failures = await deleteProductImages(images);
    failures.forEach(({ publicId, error }) => {
        console.error(`Unable to roll back Cloudinary image ${publicId}:`, error);
    });
};

module.exports = {
    MAX_IMAGES_PER_PRODUCT,
    deleteProductImages,
    rollbackProductImages,
    uploadProductImage
};
