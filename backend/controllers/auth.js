const User = require('../models/user');
const crypto = require('crypto')
const cloudinary = require('cloudinary')
const sendEmail = require('../utils/sendEmail')
const sendToken = require('../utils/jwtToken');
const validator = require('validator')
const { createPasswordResetEmail } = require('../utils/emailTemplates');
const uploadAvatarImage = require('../utils/avatarImage');

exports.registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;

        let avatarData = {
            public_id: 'default_avatar',
            url: 'https://res.cloudinary.com/shopit/image/upload/v1606305757/avatars/default_avatar_ohsezt.jpg'
        }

        if (req.file) {
            const result = await uploadAvatarImage(req.file);
            avatarData = {
                public_id: result.public_id,
                url: result.secure_url
            }
        }

        const user = await User.create({
            name,
            email: normalizedEmail,
            password,
            avatar: avatarData,
        })

        sendToken(user, 200, res)
    } catch (error) {
        console.error('registerUser error:', error)
        return res.status(500).json({ message: error.message || 'Registration failed' })
    }
}

exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!validator.isEmail(normalizedEmail) ||
        typeof password !== 'string' || !password || password.length > 256) {
        return res.status(400).json({ success: false, message: 'Enter a valid email and password' })
    }

    let user = await User.findOne({ email: normalizedEmail }).select('+password')
    if (!user) {
        return res.status(401).json({ message: 'Invalid Email or Password' })
    }


    // Checks if password is correct or not
    const isPasswordMatched = user.password
        ? await user.comparePassword(password)
        : false;


    if (!isPasswordMatched) {
        return res.status(401).json({ message: 'Invalid Email or Password' })
    }
    if (user.isActive === false) {
        return res.status(403).json({ message: 'This account has been deactivated. Contact support for help.' })
    }
    const token = user.getJwtToken();

    // res.status(201).json({
    //     success: true,
    //     token,
    //     user
    // });
    user = await User.findOne({ email: normalizedEmail })
    sendToken(user, 200, res)
}

exports.socialLogin = async (req, res, next) => {
    const idToken = req.body?.idToken;
    if (typeof idToken !== 'string' || !idToken.trim() || idToken.length > 10000) {
        return res.status(400).json({ success: false, message: 'A Firebase ID token is required' });
    }

    let claims;
    try {
        const { getFirebaseAuth } = require('../config/firebaseAdmin');
        claims = await getFirebaseAuth().verifyIdToken(idToken);
    } catch (error) {
        if (error.code && error.code.startsWith('auth/')) {
            return res.status(401).json({ success: false, message: 'The social sign-in token is invalid or expired' });
        }
        return res.status(500).json({
            success: false,
            message: error.message || 'Social sign-in could not be completed. Please try again.'
        });
    }

    const providerId = claims.firebase?.sign_in_provider;
    const authProvider = providerId === 'google.com'
        ? 'google'
        : providerId === 'facebook.com'
            ? 'facebook'
            : null;
    const email = typeof claims.email === 'string' ? claims.email.trim().toLowerCase() : '';

    if (!authProvider) {
        return res.status(401).json({ success: false, message: 'Sign in with Google or Facebook to continue' });
    }
    if (!email) {
        return res.status(401).json({ success: false, message: 'Your social account did not provide an email address' });
    }
    if (authProvider === 'google' && claims.email_verified !== true) {
        return res.status(401).json({ success: false, message: 'A verified email address is required for social sign-in' });
    }

    try {
        const userByUid = await User.findOne({ firebaseUid: claims.uid });
        const userByEmail = await User.findOne({
            email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
        });

        if (userByUid && userByEmail && userByUid.id !== userByEmail.id) {
            return res.status(409).json({ success: false, message: 'This email is already associated with another account' });
        }
        if (userByEmail && !userByUid && claims.email_verified !== true) {
            return res.status(409).json({
                success: false,
                message: 'This Facebook email is not verified, so it cannot be linked to an existing account. Sign in with that account first.'
            });
        }
        if (userByEmail?.firebaseUid && userByEmail.firebaseUid !== claims.uid) {
            return res.status(409).json({ success: false, message: 'This email is already linked to a different social account' });
        }

        let user = userByUid || userByEmail;
        if (user?.isActive === false) {
            return res.status(403).json({ success: false, message: 'This account has been deactivated. Contact support for help.' });
        }
        const defaultAvatar = {
            public_id: `firebase_${claims.uid}`,
            url: typeof claims.picture === 'string' && claims.picture
                ? claims.picture
                : 'https://res.cloudinary.com/shopit/image/upload/v1606305757/avatars/default_avatar_ohsezt.jpg'
        };

        if (!user) {
            const fallbackName = email.split('@')[0];
            const verifiedName = typeof claims.name === 'string' ? claims.name.trim() : '';
            const name = (verifiedName || fallbackName).slice(0, 30);
            user = new User({
                name,
                email,
                firebaseUid: claims.uid,
                authProviders: [authProvider],
                role: 'user',
                avatar: defaultAvatar
            });
        } else {
            if (!user.firebaseUid) user.firebaseUid = claims.uid;

            const existingEmail = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';
            if (!existingEmail && email) {
                user.email = email;
            }
            if (userByUid && claims.email_verified === true && existingEmail && existingEmail !== email) {
                user.email = email;
            }

            const savedRole = typeof user.role === 'string' ? user.role : 'user';
            user.role = savedRole === 'customer' ? 'user' : (savedRole === 'admin' ? 'admin' : 'user');

            const existingProviders = Array.isArray(user.authProviders)
                ? user.authProviders.filter(provider => provider && typeof provider === 'string')
                : [];
            user.authProviders = [...new Set([...existingProviders, authProvider])];

            if (!user.avatar || typeof user.avatar !== 'object' || !user.avatar.public_id || !user.avatar.url) {
                user.avatar = defaultAvatar;
            }

            const fallbackName = email.split('@')[0];
            const verifiedName = typeof claims.name === 'string' ? claims.name.trim() : '';
            if (!user.name || typeof user.name !== 'string' || !user.name.trim()) {
                user.name = (verifiedName || fallbackName).slice(0, 30);
            }
        }

        await user.save();
        return sendToken(user, 200, res, true);
    } catch (error) {
        console.error('socialLogin failed:', error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'This social account is already linked to another user' });
        }
        return res.status(500).json({
            success: false,
            message: error.message || 'Social sign-in could not be completed. Please try again.'
        });
    }
};

exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json({ error: 'User not found with this email' })

    }
    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    // Create reset password url
    const frontendUrl = (process.env.FRONTEND_URL || `${req.protocol}://localhost:5173`).replace(/\/+$/, '');
    const resetUrl = `${frontendUrl}/password/reset/${resetToken}`;
    try {
        const resetEmail = createPasswordResetEmail({ name: user.name, resetUrl });
        await sendEmail({
            email: user.email,
            ...resetEmail
        })

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ error: error.message })

    }
}

exports.resetPassword = async (req, res, next) => {
    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return res.status(400).json({ message: 'Password reset token is invalid or has been expired' })

    }

    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message: 'Password does not match' })

    }

    // Setup new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    const token = user.getJwtToken();
    return res.status(201).json({
        success: true,
        token,
        user
    });

}

exports.getUserProfile = async (req, res, next) => {
    const user = await User.findById(req.user.id);

    return res.status(200).json({
        success: true,
        user
    })
}

exports.updateProfile = async (req, res, next) => {
    try {
        const { name, email, phoneNo, address } = req.body;
        const normalizedName = typeof name === 'string' ? name.trim() : '';
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const normalizedPhone = typeof phoneNo === 'string' ? phoneNo.trim() : '';
        const normalizedAddress = typeof address === 'string' ? address.trim() : '';
        const phoneDigits = normalizedPhone.replace(/\D/g, '');

        if (normalizedName.length < 2 || normalizedName.length > 30 ||
            !validator.isEmail(normalizedEmail) ||
            !/^[+()\d\s.-]+$/.test(normalizedPhone) ||
            phoneDigits.length < 7 || phoneDigits.length > 15 ||
            normalizedAddress.length < 5 || normalizedAddress.length > 200) {
            return res.status(400).json({
                success: false,
                message: 'Enter a valid name, email, contact number, and address'
            });
        }

        const newUserData = {
            name: normalizedName,
            email: normalizedEmail,
            phoneNo: normalizedPhone,
            address: normalizedAddress
        }

        let previousAvatarPublicId;
        if (req.file) {
            const existingUser = await User.findById(req.user.id).select('avatar');
            if (!existingUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            previousAvatarPublicId = existingUser.avatar?.public_id;
            const result = await uploadAvatarImage(req.file);
            newUserData.avatar = {
                public_id: result.public_id,
                url: result.secure_url
            }
        }

        const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
        })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        if (previousAvatarPublicId && previousAvatarPublicId !== user.avatar?.public_id) {
            try {
                await cloudinary.v2.uploader.destroy(previousAvatarPublicId);
            } catch (error) {
                console.error(`Unable to delete previous avatar ${previousAvatarPublicId}:`, error);
            }
        }

        return res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        console.error('updateProfile error:', error)
        return res.status(500).json({ message: error.message || 'Server error updating profile' })
    }
}

exports.updatePassword = async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    if (!user || !user.password) {
        return res.status(400).json({ message: 'Set a password through password recovery before using this option' });
    }
    // Check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword)
    if (!isMatched) {
        return res.status(400).json({ message: 'Old password is incorrect' })
    }
    user.password = req.body.password;
    await user.save();
    // const token = user.getJwtToken();

    // return res.status(201).json({
    //     success: true,
    //     user,
    //     token
    // });
    sendToken(user, 200, res)

}

exports.allUsers = async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    })
}

exports.deleteUser = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(401).json({ message: `User does not found with id: ${req.params.id}` })
        // return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }

    // Remove avatar from cloudinary
    const image_id = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(image_id);
    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({
        success: true,
    })
}

exports.getUserDetails = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(400).json({ message: `User does not found with id: ${req.params.id}` })
        // return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })
}

exports.updateUser = async (req, res, next) => {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const role = req.body.role;
    if (name.length < 2 || name.length > 30 || !validator.isEmail(email) ||
        !['user', 'admin'].includes(role)) {
        return res.status(400).json({
            success: false,
            message: 'Enter a valid name, email, and role'
        });
    }

    const newUserData = {
        name,
        email,
        role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        // useFindAndModify: false
    })
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
        success: true,
        user
    })
}

exports.updateUserStatus = async (req, res) => {
    if (typeof req.body?.isActive !== 'boolean') {
        return res.status(400).json({ success: false, message: 'Account status must be active or inactive' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!req.body.isActive && String(req.user._id) === String(user._id)) {
        return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
    }

    if (!req.body.isActive && user.role === 'admin' && user.isActive !== false) {
        const activeAdminCount = await User.countDocuments({ role: 'admin', isActive: { $ne: false } });
        if (activeAdminCount <= 1) {
            return res.status(400).json({ success: false, message: 'The last active administrator cannot be deactivated' });
        }
    }

    user.isActive = req.body.isActive;
    await user.save();

    return res.status(200).json({ success: true, user });
}

exports.logout = async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    return res.status(200).json({
        success: true,
        message: 'Logged out'
    })
}