import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import MetaData from '../Layout/MetaData'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addItemToCart, removeItemFromCart } from '../../actions/cartActions'
import { formatCurrency } from '../../utils/formatCurrency'


const Cart = () => {
    const dispatch = useDispatch();
    const { cartItems } = useSelector(state => state.cart)

    const navigate = useNavigate()
    const estimatedTotal = cartItems.reduce((total, item) => total + item.quantity * item.price, 0)


    const increaseQty = async (id, quantity, stock) => {
        const newQty = quantity + 1;
        if (newQty > stock) {
            toast.error(`Only ${stock} item${stock === 1 ? '' : 's'} available in stock.`)
            return
        }
        try {
            await dispatch(addItemToCart(id, newQty))
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Unable to update this item quantity.')
        }
    }

    const decreaseQty = (id, quantity) => {
        const newQty = quantity - 1;
        if (newQty <= 0) return;
        dispatch(addItemToCart(id, newQty))
    }

    const removeCartItemHandler = (id) => {
        dispatch(removeItemFromCart(id))
    }
    const checkoutHandler = () => {
        navigate('/login?redirect=shipping')
    }
    // localStorage.setItem('cartItems', JSON.stringify(cartItems))
    // useEffect(() => {
    //     localStorage.setItem('cartItems', JSON.stringify(cartItems));
    // }, [cartItems]);
    return (
        <>
            <MetaData title={'Your Cart'} />
            <main className="pizzaro-commerce-page pizzaro-cart-page">
                {cartItems.length === 0 ? (
                    <section className="pizzaro-cart-empty">
                        <h1>Your cart is empty</h1>
                        <p>Find a favorite and we’ll get it ready for you.</p>
                        <Link className="pizzaro-cart-primary-button" to="/#products">Browse the menu</Link>
                    </section>
                ) : (
                    <>
                        <header className="pizzaro-cart-heading">
                            <h1>
                                Your Cart
                                <span>
                                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                                </span>
                            </h1>
                            <Link className="pizzaro-cart-continue" to="/#products">Continue shopping</Link>
                        </header>

                        <div className="pizzaro-cart-layout">
                            <section className="pizzaro-cart-items" aria-label="Items in your cart">
                                {cartItems.map(item => (
                                    <article className="pizzaro-cart-item" key={item.product}>
                                        <Link className="pizzaro-cart-item-image" to={`/product/${item.product}`}>
                                            <img src={item.image} alt={item.name} />
                                        </Link>
                                        <div className="pizzaro-cart-item-info">
                                            <Link className="pizzaro-cart-item-name" to={`/product/${item.product}`}>
                                                {item.name}
                                            </Link>
                                            <p>{formatCurrency(item.price)} each</p>
                                        </div>
                                        <div className="pizzaro-cart-item-controls">
                                            <div className="pizzaro-cart-quantity" aria-label={`Quantity for ${item.name}`}>
                                                <button
                                                    type="button"
                                                    aria-label={`Decrease ${item.name} quantity`}
                                                    disabled={item.quantity <= 1}
                                                    onClick={() => decreaseQty(item.product, item.quantity)}
                                                >−</button>
                                                <output aria-live="polite">{item.quantity}</output>
                                                <button
                                                    type="button"
                                                    aria-label={`Increase ${item.name} quantity`}
                                                    onClick={() => increaseQty(item.product, item.quantity, item.stock)}
                                                >+</button>
                                            </div>
                                            <button
                                                type="button"
                                                className="pizzaro-cart-remove"
                                                aria-label={`Remove ${item.name} from cart`}
                                                onClick={() => removeCartItemHandler(item.product)}
                                            >
                                                <i className="fa fa-trash" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </section>

                            <aside id="order_summary" className="pizzaro-cart-summary">
                                <h2>Order Summary</h2>
                                <div className="pizzaro-cart-summary-row">
                                    <span>Items</span>
                                    <strong>{cartItems.length}</strong>
                                </div>
                                <div className="pizzaro-cart-summary-row pizzaro-cart-total">
                                    <span>Estimated total</span>
                                    <strong>{formatCurrency(estimatedTotal)}</strong>
                                </div>
                                <button id="checkout_btn" className="pizzaro-cart-primary-button" onClick={checkoutHandler}>Continue to checkout</button>
                            </aside>
                        </div>
                    </>
                )}
            </main>
        </>
    )
}

export default Cart