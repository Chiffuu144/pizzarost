import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDispatch, useSelector } from 'react-redux'
import AdminPageLayout from './AdminPageLayout'
import { newProduct, clearErrors } from '../../actions/productActions'
import { NEW_PRODUCT_RESET } from '../../constants/productConstants'
import productCategories from '../../constants/productCategories'
import { createProductValidationSchema } from '../../utils/validationSchemas'
import { readImagePreviews } from '../../utils/readImagePreviews'

const NewProduct = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { loading, error, success } = useSelector(state => state.newProduct)
    const [imagesPreview, setImagesPreview] = useState([])

    const formik = useFormik({
        initialValues: {
            name: '',
            price: '',
            description: '',
            category: '',
            stock: '0',
            seller: '',
            images: []
        },
        validationSchema: createProductValidationSchema(),
        validateOnMount: true,
        onSubmit: async values => {
            const formData = new FormData()
            for (const field of ['name', 'price', 'description', 'category', 'stock', 'seller']) {
                formData.set(field, values[field])
            }
            values.images.forEach(image => formData.append('images', image))
            await dispatch(newProduct(formData))
        }
    })

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'bottom-right' })
            dispatch(clearErrors())
        }
        if (success) {
            toast.success('Product created successfully', { position: 'bottom-right' })
            dispatch({ type: NEW_PRODUCT_RESET })
            navigate('/admin/products')
        }
    }, [dispatch, error, navigate, success])

    const handleImageChange = async event => {
        const files = Array.from(event.currentTarget.files || [])
        event.currentTarget.value = ''
        formik.setFieldTouched('images', true)
        formik.setFieldValue('images', files)
        try {
            const previews = await readImagePreviews(files)
            setImagesPreview(previews)
        } catch (previewError) {
            toast.error(previewError.message)
        }
    }

    const removeImage = index => {
        formik.setFieldValue('images', formik.values.images.filter((_, imageIndex) => imageIndex !== index))
        setImagesPreview(previews => previews.filter((_, imageIndex) => imageIndex !== index))
    }

    const fieldError = field => formik.touched[field] && formik.errors[field]
        ? <div className="invalid-feedback">{formik.errors[field]}</div>
        : null

    return (
        <AdminPageLayout
            title="New product"
            description="Add a pizza to the menu and set its price, stock, and photos."
            actions={<Link to="/admin/products" className="pizzaro-admin-secondary-action">Back to products</Link>}
        >
            <form className="pizzaro-admin-form-card pizzaro-admin-product-form" onSubmit={formik.handleSubmit} encType="multipart/form-data" noValidate>
                <header className="pizzaro-admin-form-card-heading">
                    <h2>Product details</h2>
                    <p>New products will appear in the Pizzaro menu once created.</p>
                </header>
                <div className="pizzaro-admin-form-grid">
                    <div className="form-group">
                        <label htmlFor="name_field">Name</label>
                        <input id="name_field" name="name" className={`form-control ${fieldError('name') ? 'is-invalid' : ''}`}
                            value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                        {fieldError('name')}
                    </div>

                    <div className="form-group">
                        <label htmlFor="price_field">Price</label>
                        <input id="price_field" name="price" type="number" min="0.01" step="0.01"
                            className={`form-control ${fieldError('price') ? 'is-invalid' : ''}`}
                            value={formik.values.price} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                        {fieldError('price')}
                    </div>

                    <div className="form-group is-wide">
                        <label htmlFor="description_field">Description</label>
                        <textarea id="description_field" name="description" className={`form-control ${fieldError('description') ? 'is-invalid' : ''}`}
                            rows="4" value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                        {fieldError('description')}
                    </div>

                    <div className="form-group">
                        <label htmlFor="category_field">Category</label>
                        <select id="category_field" name="category" className={`form-control ${fieldError('category') ? 'is-invalid' : ''}`}
                            value={formik.values.category} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                            <option value="">Choose a category</option>
                            {productCategories.map(category => <option key={category} value={category}>{category}</option>)}
                        </select>
                        {fieldError('category')}
                    </div>

                    <div className="form-group">
                        <label htmlFor="stock_field">Stock</label>
                        <input id="stock_field" name="stock" type="number" min="0" step="1"
                            className={`form-control ${fieldError('stock') ? 'is-invalid' : ''}`}
                            value={formik.values.stock} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                        {fieldError('stock')}
                    </div>

                    <div className="form-group">
                        <label htmlFor="seller_field">Seller name</label>
                        <input id="seller_field" name="seller" className={`form-control ${fieldError('seller') ? 'is-invalid' : ''}`}
                            value={formik.values.seller} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                        {fieldError('seller')}
                    </div>

                    <div className="form-group is-wide pizzaro-admin-image-field">
                        <label htmlFor="product_images">Product images</label>
                        <input id="product_images" name="images" type="file" className="form-control"
                            onChange={handleImageChange} multiple accept="image/jpeg,image/png,image/webp"
                            aria-describedby="product-images-help" />
                        <small id="product-images-help" className="form-text">
                            Add 1–10 JPEG, PNG, or WebP images, up to 5 MB each.
                        </small>
                        {fieldError('images')}
                        <div className="pizzaro-admin-image-list">
                            {imagesPreview.map((preview, index) => (
                                <div className="pizzaro-admin-image-item" key={`${preview}-${index}`}>
                                    <img src={preview} alt={`Product image preview ${index + 1}`} width="112" height="96" />
                                    <button type="button" className="pizzaro-admin-image-remove" onClick={() => removeImage(index)}>
                                        Remove image {index + 1}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <footer className="pizzaro-admin-form-actions">
                    <Link to="/admin/products" className="pizzaro-admin-secondary-action">Cancel</Link>
                    <button type="submit" className="pizzaro-admin-primary-action"
                        disabled={loading || formik.isSubmitting || !formik.isValid}>
                        {loading || formik.isSubmitting ? 'Creating…' : 'Create product'}
                    </button>
                </footer>
            </form>
        </AdminPageLayout>
    )
}

export default NewProduct
