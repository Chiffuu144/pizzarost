import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import MetaData from '../Layout/MetaData'
import ListReviews from '../Review/ListReviews'
import { getProductDetails, clearErrors } from '../../actions/productActions'
import { addItemToCart } from '../../actions/cartActions'
import { formatCurrency } from '../../utils/formatCurrency'

const ProductGallery = ({ product }) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const images = product.images || []

    if (!images.length) return null

    const activeImage = images[activeImageIndex] || images[0]

    return (
        <div className="product-gallery">
            <div className="product-gallery-main">
                <img
                    className="product-gallery-image"
                    src={activeImage.url}
                    alt={`${product.name}, image ${activeImageIndex + 1}`}
                />
            </div>
            {images.length > 1 && (
                <div className="product-gallery-thumbnails" role="group" aria-label="Choose a product image">
                    {images.map((image, index) => (
                        <button
                            key={image.public_id || image.url}
                            type="button"
                            className={`product-gallery-thumbnail${index === activeImageIndex ? ' active' : ''}`}
                            aria-label={`Show image ${index + 1} of ${images.length}`}
                            aria-pressed={index === activeImageIndex}
                            onClick={() => setActiveImageIndex(index)}
                        >
                            <img src={image.url} alt="" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

const ProductDetails = () => {
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { loading, error, product } = useSelector(state => state.productDetails)
    const { user } = useSelector(state => state.auth)
    const [quantity, setQuantity] = useState(1)
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [errorReview, setErrorReview] = useState('')
    const [reviewAccess, setReviewAccess] = useState({ canReview: false, userReview: null })
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)
    const [reviewSubmitting, setReviewSubmitting] = useState(false)
    const visibleReviewAccess = user?._id
        ? reviewAccess
        : { canReview: false, userReview: null }

    useEffect(() => {
        dispatch(getProductDetails(id))
    }, [dispatch, id])

    useEffect(() => {
        if (error) {
            toast.error(error)
            dispatch(clearErrors())
        }
    }, [dispatch, error])

    useEffect(() => {
        let isCurrent = true
        if (!user?._id) {
            return () => { isCurrent = false }
        }

        axios.get(`${import.meta.env.VITE_API}/reviews?id=${encodeURIComponent(id)}`, {
            withCredentials: true
        }).then(({ data }) => {
            if (isCurrent) {
                setReviewAccess({ canReview: data.canReview, userReview: data.userReview })
            }
        }).catch(requestError => {
            if (isCurrent) {
                setErrorReview(requestError.response?.data?.message || requestError.message)
            }
        })

        return () => { isCurrent = false }
    }, [id, user?._id])

    const openReviewForm = review => {
        setRating(review?.rating || 0)
        setComment(review?.comment || '')
        setErrorReview('')
        setIsReviewFormOpen(true)
    }

    const submitReview = async event => {
        event.preventDefault()
        setErrorReview('')
        setReviewSubmitting(true)
        try {
            const { data } = await axios.put(
                `${import.meta.env.VITE_API}/review`,
                { productId: id, rating, comment },
                { withCredentials: true }
            )
            setReviewAccess(access => ({ ...access, userReview: data.review }))
            setIsReviewFormOpen(false)
            dispatch(getProductDetails(id))
            toast.success('Your review has been saved')
        } catch (requestError) {
            setErrorReview(requestError.response?.data?.message || requestError.message || 'Unable to save your review')
        } finally {
            setReviewSubmitting(false)
        }
    }

    const addToCart = async () => {
        if (quantity > product.stock) {
            toast.error(`Only ${product.stock} ${product.name} available right now.`)
            return
        }

        try {
            await dispatch(addItemToCart(id, quantity))
            toast.success(`${product.name} added to your cart`)
        } catch (requestError) {
            if (requestError.code === 'LOGIN_REQUIRED') {
                toast.error(requestError.message)
                navigate('/login', {
                    state: { from: `${location.pathname}${location.search}${location.hash}` }
                })
                return
            }
            toast.error(requestError.response?.data?.message || requestError.message || 'Unable to add this product to your cart')
        }
    }

    if (loading || !product._id) {
        return <p className="text-center my-5" role="status">Loading product…</p>
    }

    return (
        <>
            <MetaData title={product.name} />
            <main className="pizzaro-product-page">
                <div className="pizzaro-product-layout">
                    <ProductGallery key={product._id} product={product} />
                    <section className="pizzaro-product-information" aria-labelledby="product-title">
                        <p className="pizzaro-product-category">{product.category}</p>
                        <h1 id="product-title">{product.name}</h1>
                        <p id="product_id">Product #{product._id}</p>
                        <div className="pizzaro-product-rating">
                            <span className="rating-outer" aria-label={`${product.ratings || 0} out of 5 stars`}>
                                <span className="rating-inner" style={{ width: `${((product.ratings || 0) / 5) * 100}%` }} />
                            </span>
                            <span>({product.numOfReviews || 0} {product.numOfReviews === 1 ? 'review' : 'reviews'})</span>
                        </div>

                        <div className="pizzaro-product-purchase">
                            <p id="product_price">{formatCurrency(product.price)}</p>
                            <p className="pizzaro-product-stock">
                                <span className={`pizzaro-stock-indicator${product.stock > 0 ? ' is-available' : ''}`} aria-hidden="true" />
                                {product.stock > 0 ? 'In stock' : 'Out of stock'}
                            </p>
                            <div className="pizzaro-product-order-controls">
                                <div className="pizzaro-quantity-control" aria-label="Choose quantity">
                                    <button
                                        type="button"
                                        aria-label="Decrease quantity"
                                        disabled={quantity <= 1}
                                        onClick={() => setQuantity(current => Math.max(1, current - 1))}
                                    >−</button>
                                    <input
                                        type="number"
                                        aria-label="Quantity"
                                        min="1"
                                        max={product.stock}
                                        value={quantity}
                                        onChange={event => {
                                            const nextQuantity = Number(event.target.value)
                                            if (Number.isInteger(nextQuantity) && nextQuantity >= 1 && nextQuantity <= product.stock) {
                                                setQuantity(nextQuantity)
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        aria-label="Increase quantity"
                                        disabled={quantity >= product.stock}
                                        onClick={() => setQuantity(current => Math.min(product.stock, current + 1))}
                                    >+</button>
                                </div>
                                <button
                                    type="button"
                                    id="cart_btn"
                                    className="pizzaro-product-add-button"
                                    disabled={product.stock === 0}
                                    onClick={addToCart}
                                >
                                    <i className="fa fa-shopping-bag" aria-hidden="true" />
                                    {product.stock === 0 ? 'Sold out' : 'Add to cart'}
                                </button>
                            </div>
                        </div>

                        <div className="pizzaro-product-description-block">
                            <h2>Description</h2>
                            <p>{product.description}</p>
                            <p className="pizzaro-product-seller">Prepared by <strong>{product.seller}</strong></p>
                        </div>
                    </section>
                </div>

                <section className="pizzaro-product-reviews" aria-labelledby="product-reviews-heading">
                    <div className="pizzaro-product-reviews-heading">
                        <div>
                            <h2 id="product-reviews-heading">Reviews</h2>
                            <p>{product.numOfReviews || 0} {product.numOfReviews === 1 ? 'customer review' : 'customer reviews'}</p>
                        </div>
                        {!user ? (
                            <Link className="pizzaro-review-action" to="/login">
                                Sign in to review
                            </Link>
                        ) : visibleReviewAccess.userReview ? (
                            <button type="button" className="pizzaro-review-action" onClick={() => openReviewForm(visibleReviewAccess.userReview)}>
                                Edit your review
                            </button>
                        ) : visibleReviewAccess.canReview ? (
                            <button type="button" className="pizzaro-review-action" onClick={() => openReviewForm(null)}>
                                Write a review
                            </button>
                        ) : (
                            <p className="pizzaro-review-notice">A completed or delivered order containing this item is required to leave a review.</p>
                        )}
                    </div>

                    {isReviewFormOpen && (
                        <form className="pizzaro-review-form" onSubmit={submitReview}>
                            <fieldset disabled={reviewSubmitting}>
                                <legend>{visibleReviewAccess.userReview ? 'Update your review' : 'Write a review'}</legend>
                                <div role="radiogroup" aria-label="Star rating" className="pizzaro-review-stars">
                                    {[1, 2, 3, 4, 5].map(value => (
                                        <button
                                            key={value}
                                            type="button"
                                            role="radio"
                                            aria-checked={rating === value}
                                            aria-label={`${value} star${value === 1 ? '' : 's'}`}
                                            onClick={() => setRating(value)}
                                        >
                                            <i className={`fa fa-star${rating >= value ? ' is-selected' : ''}`} aria-hidden="true" />
                                        </button>
                                    ))}
                                </div>
                                <label htmlFor="review-comment">Your review</label>
                                <textarea
                                    id="review-comment"
                                    value={comment}
                                    onChange={event => setComment(event.target.value)}
                                    maxLength={1000}
                                    required
                                    rows={4}
                                />
                                <div className="pizzaro-review-form-actions">
                                    <button className="pizzaro-review-action" type="submit" disabled={rating < 1}>
                                        {reviewSubmitting ? 'Saving…' : 'Save review'}
                                    </button>
                                    <button
                                        className="pizzaro-review-cancel"
                                        type="button"
                                        onClick={() => setIsReviewFormOpen(false)}
                                    >Cancel</button>
                                </div>
                            </fieldset>
                            {errorReview && <p className="pizzaro-review-error" role="alert">{errorReview}</p>}
                        </form>
                    )}

                    {product.reviews?.length > 0 ? (
                        <ListReviews
                            reviews={product.reviews}
                            currentUserId={user?._id}
                            onEdit={openReviewForm}
                        />
                    ) : (
                        <p className="pizzaro-reviews-empty">No reviews yet. Be the first to share what you think.</p>
                    )}
                </section>
            </main>
        </>
    )
}

export default ProductDetails
