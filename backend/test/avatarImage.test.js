const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const uploadAvatarImage = require('../utils/avatarImage');

test('uploads an avatar file and removes its temporary disk file', async () => {
    const filePath = path.join(os.tmpdir(), `pizzaro-avatar-${process.pid}-${Date.now()}.png`);
    const originalUpload = cloudinary.uploader.upload;
    await fs.writeFile(filePath, 'avatar');
    cloudinary.uploader.upload = async (uploadedPath, options) => {
        assert.equal(uploadedPath, filePath);
        assert.deepEqual(options, { folder: 'avatars', width: 150, crop: 'scale' });
        return { public_id: 'avatar-id', secure_url: 'https://example.com/avatar.png' };
    };

    try {
        const result = await uploadAvatarImage({ path: filePath });
        assert.equal(result.public_id, 'avatar-id');
        await assert.rejects(fs.access(filePath), { code: 'ENOENT' });
    } finally {
        cloudinary.uploader.upload = originalUpload;
        await fs.unlink(filePath).catch(error => {
            if (error.code !== 'ENOENT') throw error;
        });
    }
});
