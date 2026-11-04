import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import MetaData from '../Layout/MetaData'
import { formatCurrency } from '../../utils/formatCurrency'
import { displayOrderStatus } from '../../utils/orderStatus'
import Loader from '../Layout/Loader'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDispatch, useSelector } from 'react-redux'
import { getOrderDetails } from '../../actions/orderActions'

const OrderDetails = () => {
    const dispatch = useDispatch()
    const { loading, error, order = {} } = useSelector(state => state.orderDetails)
    const { id } = useParams()
    const { shippingInfo, orderItems = [], user, itemsPrice, shippingPrice, taxPrice, totalPrice, orderStatus } = order
    const status = displayOrderStatus(orderStatus)
    const statusClass = status?.toLowerCase().replace(/\s+/g, '-')
    const shippingAddress = shippingInfo && [
        shippingInfo.address,
        shippingInfo.city,
        shippingInfo.postalCode,
        shippingInfo.country
    ].filter(Boolean).join(', ')

    useEffect(() => {
        dispatch(getOrderDetails(id))

        if (error) {
            toast.error(error, { position: 'bottom-right' })
        }
    }, [error, id, dispatch])

    return (
        <>
            <MetaData title="Order Details" />
            {loading ? <Loader /> : (
                <main className="pizzaro-order-details-page">
                    <div className="pizzaro-order-details-layout">
                        <header className="pizzaro-order-details-heading">
                            <div>
                                <h1>Order details</h1>
                                <p>Order <strong>#{order._id}</strong></p>
                            </div>
                            {status && <span className={`pizzaro-order-detail-status is-${statusClass}`}>{status}</span>}
                            <button
                                type="button"
                                className="pizzaro-order-details-print"
                                onClick={() => window.print()}
                            >
                                <i className="fa fa-print" aria-hidden="true" />
                                Print receipt
                            </button>
                        </header>

                        <div className="pizzaro-order-details-grid">
                            <div className="pizzaro-order-details-main">
                                <section className="pizzaro-order-detail-panel" aria-labelledby="order-delivery-heading">
                                    <h2 id="order-delivery-heading">Delivery details</h2>
                                    <dl className="pizzaro-order-detail-delivery">
                                        <div>
                                            <dt>Name</dt>
                                            <dd>{user?.name || '—'}</dd>
                                        </div>
                                        <div>
                                            <dt>Phone</dt>
                                            <dd>{shippingInfo?.phoneNo || '—'}</dd>
                                        </div>
                                        <div className="is-address">
                                            <dt>Address</dt>
                                            <dd>{shippingAddress || '—'}</dd>
                                        </div>
                                    </dl>
                                </section>

                                <section className="pizzaro-order-detail-panel" aria-labelledby="order-items-heading">
                                    <h2 id="order-items-heading">Items in this order</h2>
                                    {orderItems.length ? (
                                        <ul className="pizzaro-order-detail-items">
                                            {orderItems.map(item => (
                                                <li className="pizzaro-order-detail-item" key={item.product}>
                                                    <img src={item.image} alt="" width="64" height="64" />
                                                    <div className="pizzaro-order-detail-item-copy">
                                                        <Link to={`/product/${item.product}`}>{item.name}</Link>
                                                        <span>{item.quantity} × {formatCurrency(item.price)}</span>
                                                    </div>
                                                    <strong>{formatCurrency(item.quantity * item.price)}</strong>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <p className="pizzaro-order-detail-empty">No items are available for this order.</p>}
                                </section>
                            </div>

                            <aside className="pizzaro-order-detail-summary" aria-labelledby="order-total-heading">
                                <h2 id="order-total-heading">Order total</h2>
                                <dl>
                                    <div>
                                        <dt>Subtotal</dt>
                                        <dd>{formatCurrency(itemsPrice || 0)}</dd>
                                    </div>
                                    <div>
                                        <dt>Shipping</dt>
                                        <dd>{formatCurrency(shippingPrice || 0)}</dd>
                                    </div>
                                    <div>
                                        <dt>Tax</dt>
                                        <dd>{formatCurrency(taxPrice || 0)}</dd>
                                    </div>
                                    <div className="is-total">
                                        <dt>Total</dt>
                                        <dd>{formatCurrency(totalPrice || 0)}</dd>
                                    </div>
                                </dl>
                                <Link className="pizzaro-order-detail-back" to="/orders/me">Back to my orders</Link>
                            </aside>
                        </div>
                    </div>
                </main>
            )}
        </>
    )
}

export default OrderDetails
