const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        minlength: [2, 'Product name must be at least 2 characters'],
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        min: [0.01, 'Product price must be greater than zero'],
        max: [1000000, 'Product price cannot exceed 1,000,000'],
        default: 0.0
    },
    description: {
        type: String,
        required: [true, 'Please enter product description'],
        trim: true,
        minlength: [10, 'Product description must be at least 10 characters'],
        maxlength: [2000, 'Product description cannot exceed 2,000 characters']
    },
    ratings: {
        type: Number,
        default: 0
    },

    images: {
        type: [{
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
        }],
        validate: [
            {
                validator: images => Array.isArray(images) && images.length > 0,
                message: 'A product must have at least one image'
            },
            {
                validator: images => Array.isArray(images) && images.length <= 10,
                message: 'A product can have at most 10 images'
            }
        ]
    },
    category: {
        type: String,
        required: [true, 'Please select category for this product'],
        enum: {
            values: [
                'Pizza',
                'Cheese Pizza',
                'Spicy Pizza',
                'Pepperoni Pizza',
                'Meat Lovers Pizza',
                'Hawaiian Pizza',
                'Vegetarian Pizza'
            ],
            message: 'Please select correct category for product'
        }
    },
    seller: {
        type: String,
        required: [true, 'Please enter product seller'],
        trim: true,
        maxlength: [80, 'Seller name cannot exceed 80 characters']
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        min: [0, 'Product stock cannot be negative'],
        max: [1000000, 'Product stock cannot exceed 1,000,000'],
        validate: {
            validator: Number.isInteger,
            message: 'Product stock must be a whole number'
        },
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    // numOfReviews: {
    //     type: Number,
    //     default: 0
    // },
    // reviews: [
    //     {
    //         user: {
    //             type: mongoose.Schema.ObjectId,
    //             ref: 'User',
    //             required: true
    //         },
    //         name: {
    //             type: String,
    //             required: true
    //         },
    //         rating: {
    //             type: Number,
    //             required: true
    //         },
    //         comment: {
    //             type: String,
    //             required: true
    //         }
    //     }
    // ],
    // user: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'User',

    // },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Product', productSchema);