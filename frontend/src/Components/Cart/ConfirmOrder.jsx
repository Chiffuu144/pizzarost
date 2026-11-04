import { Link, useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
import { useSelector } from 'react-redux'
import { formatCurrency } from '../../utils/formatCurrency'

const ConfirmOrder = () => {
    const navigate = useNavigate()
    const { cartItems, shippingInfo } = useSelector(state => state.cart)
    const { user } = useSelector(state => state.auth)

    const itemsPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    const shippingPrice = itemsPrice > 200 ? 0 : 25
    const taxPrice = Number((0.05 * itemsPrice).toFixed(2))
    const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2)

    const processToPayment = () => {
        sessionStorage.setItem('orderInfo', JSON.stringify({
            itemsPrice: itemsPrice.toFixed(2),
            shippingPrice,
            taxPrice,
            totalPrice
        }))
        navigate('/payment')
    }

    return (
        <>
            <MetaData title="Confirm Order" />
            <main className="pizzaro-checkout-page pizzaro-confirm-page">
                <CheckoutSteps shipping confirmOrder />
                <div className="pizzaro-confirm-layout">
                    <div className="pizzaro-confirm-content">
                        <section className="pizzaro-confirm-section" aria-labelledby="delivery-heading">
                            <header className="pizzaro-confirm-section-heading">
                                <div>
                                    <h1 id="delivery-heading">Review your delivery details</h1>
                                    <p>Make sure we have the right address for your order.</p>
                                </div>
                                <Link className="pizzaro-confirm-edit" to="/shipping">Edit details</Link>
                            </header>
                            <dl className="pizzaro-confirm-delivery">
                                <div>
                                    <dt>Name</dt>
                                    <dd>{user?.name || 'Customer'}</dd>
                                </div>
                                <div>
                                    <dt>Phone</dt>
                                    <dd>{shippingInfo.phoneNo}</dd>
                                </div>
                                <div className="is-address">
                                    <dt>Delivery address</dt>
                                    <dd>{[shippingInfo.address, shippingInfo.city, shippingInfo.postalCode, shippingInfo.country].filter(Boolean).join(', ')}</dd>
                                </div>
                            </dl>
                        </section>

                        <section className="pizzaro-confirm-section pizzaro-confirm-items" aria-labelledby="items-heading">
                            <header className="pizzaro-confirm-section-heading">
                                <div>
                                    <h2 id="items-heading">Your order</h2>
                                    <p>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
                                </div>
                            </header>
                            <ul className="pizzaro-confirm-item-list">
                                {cartItems.map(item => (
                                    <li className="pizzaro-confirm-item" key={item.product}>
                                        <img src={item.image} alt="" width="68" height="68" />
                                        <div className="pizzaro-confirm-item-copy">
                                            <Link to={`/product/${item.product}`}>{item.name}</Link>
                                            <span>{item.quantity} × {formatCurrency(item.price)}</span>
                                        </div>
                                        <strong>{formatCurrency(item.quantity * item.price)}</strong>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                    <aside className="pizzaro-confirm-summary" aria-labelledby="summary-heading">
                        <h2 id="summary-heading">Order summary</h2>
                        <dl>
                            <div>
                                <dt>Subtotal</dt>
                                <dd>{formatCurrency(itemsPrice)}</dd>
                            </div>
                            <div>
                                <dt>Shipping</dt>
                                <dd>{formatCurrency(shippingPrice)}</dd>
                            </div>
                            <div>
                                <dt>Tax</dt>
                                <dd>{formatCurrency(taxPrice)}</dd>
                            </div>
                            <div className="is-total">
                                <dt>Total</dt>
                                <dd>{formatCurrency(totalPrice)}</dd>
                            </div>
                        </dl>
                        <button
                            id="checkout_btn"
                            className="pizzaro-sign-in pizzaro-confirm-submit"
                            type="button"
                            onClick={processToPayment}
                        >
                            Continue to place order
                        </button>
                    </aside>
                </div>
            </main>
        </>
    )
}

export default ConfirmOrder
