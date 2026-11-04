import * as Yup from 'yup'

const validImage = Yup.mixed()
    .test('image-type', 'Use a JPEG, PNG, or WebP image.', file =>
        !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    )
    .test('image-size', 'Each image must be 5 MB or smaller.', file =>
        !file || file.size <= 5 * 1024 * 1024
    )

export const createProductValidationSchema = (existingImageCount = 0) => Yup.object({
    name: Yup.string()
        .trim()
        .min(2, 'Name must be at least 2 characters.')
        .max(100, 'Name cannot exceed 100 characters.')
        .required('Enter a product name.'),
    price: Yup.number()
        .typeError('Enter a valid price.')
        .positive('Price must be greater than zero.')
        .max(1000000, 'Price is too high.')
        .required('Enter a price.'),
    description: Yup.string()
        .trim()
        .min(10, 'Description must be at least 10 characters.')
        .max(2000, 'Description cannot exceed 2,000 characters.')
        .required('Enter a product description.'),
    category: Yup.string().required('Choose a category.'),
    stock: Yup.number()
        .typeError('Enter a valid stock quantity.')
        .integer('Stock must be a whole number.')
        .min(0, 'Stock cannot be negative.')
        .required('Enter a stock quantity.'),
    seller: Yup.string()
        .trim()
        .max(80, 'Seller name cannot exceed 80 characters.')
        .required('Enter a seller name.'),
    images: Yup.array()
        .of(validImage)
        .max(10, 'A product can have at most 10 new images.')
        .test('image-count', 'Add at least one product image.', files =>
            existingImageCount + (files?.length || 0) > 0
        )
        .test('total-image-count', 'A product can have at most 10 images.', files =>
            existingImageCount + (files?.length || 0) <= 10
        )
})

export const loginValidationSchema = Yup.object({
    email: Yup.string()
        .trim()
        .email('Enter a valid email address.')
        .required('Enter your email address.'),
    password: Yup.string().required('Enter your password.')
})

export const updateProfileValidationSchema = Yup.object({
    name: Yup.string()
        .trim()
        .min(2, 'Name must be at least 2 characters.')
        .max(30, 'Name cannot exceed 30 characters.')
        .required('Enter your name.'),
    email: Yup.string()
        .trim()
        .email('Enter a valid email address.')
        .required('Enter your email address.'),
    phoneNo: Yup.string()
        .trim()
        .matches(/^[+()\d\s.-]+$/, 'Enter a valid contact number.')
        .test('phone-digits', 'Contact number must have 7 to 15 digits.', value =>
            (value?.replace(/\D/g, '').length || 0) >= 7 &&
            (value?.replace(/\D/g, '').length || 0) <= 15
        )
        .required('Enter your contact number.'),
    address: Yup.string()
        .trim()
        .min(5, 'Address must be at least 5 characters.')
        .max(200, 'Address cannot exceed 200 characters.')
        .required('Enter your address.')
})
