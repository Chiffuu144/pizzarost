import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDispatch, useSelector } from 'react-redux'
import AdminPageLayout from './AdminPageLayout'
import { updateProduct, getProductDetails, clearErrors } from '../../actions/productActions'
import { UPDATE_PRODUCT_RESET } from '../../constants/productConstants'
import productCategories from '../../constants/productCategories'
import { createProductValidationSchema } from '../../utils/validationSchemas'
import { readImagePreviews } from '../../utils/readImagePreviews'

const UpdateProduct = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { id } = useParams()
    const { error, product } = useSelector(state => state.productDetails)
    const { loading, error: updateError, isUpdated } = useSelector(state => state.product)
    const [removedImageIds, setRemovedImageIds] = useState([])
    const [imagesPreview, setImagesPreview] = useState([])
    const currentProduct = product?._id === id ? product : null
    const retainedImages = (currentProduct?.images || [])
        .filter(image => !removedImageIds.includes(image.public_id))
    const validationSchema = useMemo(
        () => createProductValidationSchema(retainedImages.length),
        [retainedImages.length]
    )

    useEffect(() => {
        if (!currentProduct) {
            dispatch(getProductDetails(id))
        }
        if (error || updateError) {
            toast.error(error || updateError, { position: 'bottom-right' })
            dispatch(clearErrors())
        }
        if (isUpdated) {
            toast.success('Product updated successfully', { position: 'bottom-right' })
            dispatch({ type: UPDATE_PRODUCT_RESET })
            navigate('/admin/products')
        }
    }, [currentProduct, dispatch, error, id, isUpdated, navigate, updateError])

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: currentProduct?.name || '',
            price: currentProduct?.price ?? '',
            description: currentProduct?.description || '',
            category: currentProduct?.category || '',
            stock: currentProduct?.stock ?? 0,
            seller: currentProduct?.seller || '',
            images: []
        },
        validationSchema,
        validateOnMount: true,
        onSubmit: async values => {
            if (!currentProduct) return
            const formData = new FormData()
            for (const field of ['name', 'price', 'description', 'category', 'stock', 'seller']) {
                formData.set(field, values[field])
            }
            formData.set('retainedImages', JSON.stringify(retainedImages.map(image => image.public_id)))
            values.images.forEach(image => formData.append('images', image))
            await dispatch(updateProduct(currentProduct._id, formData))
        }
    })

    const handleImageChange = async event => {
        const files = Array.from(event.currentTarget.files || [])
        event.currentTarget.value = ''
        formik.setFieldTouched('images', true)
        formik.setFieldValue('images', files)
        try {
            setImagesPreview(await readImagePreviews(files))
        } catch (previewError) {
            toast.error(previewError.message)
        }
    }

    const removeNewImage = index => {
        formik.setFieldValue('images', formik.values.images.filter((_, imageIndex) => imageIndex !== index))
        setImagesPreview(previews => previews.filter((_, imageIndex) => imageIndex !== index))
    }

    const fieldError = field => formik.touched[field] && formik.errors[field]
        ? <div className="invalid-feedback">{formik.errors[field]}</div>
        : null

    if (!currentProduct) {
        return (
            <AdminPageLayout
                title="Edit product"
                description="Update menu details, availability, and images."
                actions={<Link to="/admin/products" className="pizzaro-admin-secondary-action">Back to products</Link>}
            >
                <p className="pizzaro-admin-page-loading" role="status">Loading product details…</p>
            </AdminPageLayout>
        )
    }

    return (
        <AdminPageLayout
            title="Edit product"
            description="Update menu details, availability, and images."
            actions={<Link to="/admin/products" className="pizzaro-admin-secondary-action">Back to products</Link>}
        >
            <form className="pizzaro-admin-form-card pizzaro-admin-product-form" onSubmit={formik.handleSubmit} encType="multipart/form-data" noValidate>
                <header className="pizzaro-admin-form-card-heading">
                    <h2>Product details</h2>
                    <p>Changes will appear in the Pizzaro menu once saved.</p>
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
                        <textarea id="description_field" name="description" rows="4"
                            className={`form-control ${fieldError('description') ? 'is-invalid' : ''}`}
                            value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                        {fieldError('description')}
                    </div>
                    <div className="form-group">
                        <label htmlFor="category_field">Category</label>
                        <select id="category_field" name="category" className={`form-control ${fieldError('category') ? 'is-invalid' : ''}`}
                            value={formik.values.category} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                            {!productCategories.includes(formik.values.category) && formik.values.category && (
                                <option value={formik.values.category}>{formik.values.category} (existing category)</option>
                            )}
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
                            Keep or add 1–10 JPEG, PNG, or WebP images, up to 5 MB each.
                        </small>
                        {fieldError('images')}
                        <div className="pizzaro-admin-image-list">
                            {retainedImages.map((image, index) => (
                                <div className="pizzaro-admin-image-item" key={image.public_id}>
                                    <img src={image.url} alt={`Existing product image ${index + 1}`} width="112" height="96" />
                                    <button type="button" className="pizzaro-admin-image-remove"
                                        onClick={() => setRemovedImageIds(ids => [...ids, image.public_id])}>
                                        Remove image {index + 1}
                                    </button>
                                </div>
                            ))}
                            {imagesPreview.map((preview, index) => (
                                <div className="pizzaro-admin-image-item" key={`${preview}-${index}`}>
                                    <img src={preview} alt={`New product image preview ${index + 1}`} width="112" height="96" />
                                    <button type="button" className="pizzaro-admin-image-remove" onClick={() => removeNewImage(index)}>
                                        Remove new image {index + 1}
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
                        {loading || formik.isSubmitting ? 'Saving…' : 'Save changes'}
                    </button>
                </footer>
            </form>
        </AdminPageLayout>
    )
}

export default UpdateProduct
