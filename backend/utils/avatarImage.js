const fs = require('fs/promises');
const cloudinary = require('cloudinary').v2;

const uploadAvatarImage = async file => {
    if (!file?.path) {
        const error = new Error('A valid avatar image is required');
        error.statusCode = 400;
        throw error;
    }

    return cloudinary.uploader.upload(file.path, {
        folder: 'avatars',
        width: 150,
        crop: 'scale'
    }).finally(async () => {
        try {
            await fs.unlink(file.path);
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }
    });
};

module.exports = uploadAvatarImage;
