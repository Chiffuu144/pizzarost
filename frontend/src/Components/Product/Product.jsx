import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'
import { addItemToCart } from '../../actions/cartActions'
import { formatCurrency } from '../../utils/formatCurrency'

const Product = ({ product }) => {
    const dispatch = useDispatch()
    const location = useLocation()
    const navigate = useNavigate()

    const addToCart = async () => {
        if (product.stock < 1) {
            toast.error(`${product.name} is currently out of stock.`)
            return
        }

        try {
            await dispatch(addItemToCart(product._id, 1))
            toast.success(`${product.name} added to your cart`)
        } catch (error) {
            if (error.code === 'LOGIN_REQUIRED') {
                toast.error(error.message)
                navigate('/login', {
                    state: { from: `${location.pathname}${location.search}${location.hash}` }
                })
                return
            }
            toast.error(error.response?.data?.message || error.message || 'Unable to add this product to your cart')
        }
    }

    return (
        <div className="col-sm-12 col-md-6 col-lg-3 my-3">
            <article className="card p-3 rounded pizzaro-product-card">
                <Link to={`/product/${product._id}`} className="pizzaro-product-image-link" aria-label={`View ${product.name}`}>
                    <img
                        className="card-img-top"
                        src={product.images?.[0]?.url || '/images/pizzaro-hero.jpg'}
                        alt={product.name}
                        loading="lazy"
                    />
                </Link>
                <div className="card-body d-flex flex-column">
                    <h5 className="card-title">
                        <Link to={`/product/${product._id}`} >{product.name}</Link>
                    </h5>
                    {product.numOfReviews > 0 && (
                        <div className="ratings">
                            <div className="rating-outer">
                                <div className="rating-inner" style={{ width: `${(product.ratings / 5) * 100}%` }}></div>
                            </div>
                            <span id="no_of_reviews">({product.numOfReviews} reviews)</span>
                        </div>
                    )}
                    {product.description && <p className="pizzaro-product-description">{product.description}</p>}
                    <p className="card-text">{formatCurrency(product.price)}</p>
                    <div className="pizzaro-product-actions">
                        <Link to={`/product/${product._id}`} className="pizzaro-product-details">View Details</Link>
                        <button type="button" className="pizzaro-add-cart" onClick={addToCart} disabled={product.stock < 1}>
                            <i className="fa fa-shopping-bag" aria-hidden="true" />
                            {product.stock < 1 ? 'Sold Out' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </article>
        </div>
    )
}

export default Product