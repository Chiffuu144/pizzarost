import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../Layout/Loader'
import AdminPageLayout from './AdminPageLayout'
import { getOrderDetails, updateOrder, clearErrors } from '../../actions/orderActions'
import { UPDATE_ORDER_RESET } from '../../constants/orderConstants'
import { formatCurrency } from '../../utils/formatCurrency'
import { displayOrderStatus } from '../../utils/orderStatus'

const ProcessOrder = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { id } = useParams()
    const { loading, order = {} } = useSelector(state => state.orderDetails)
    const { error, isUpdated } = useSelector(state => state.order)
    const [selectedStatus, setSelectedStatus] = useState(null)
    const orderId = id
    const {
        shippingInfo,
        orderItems = [],
        user,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        orderStatus
    } = order
    const storedStatus = displayOrderStatus(orderStatus || '')
    const status = selectedStatus?.orderId === orderId
        ? selectedStatus.value
        : storedStatus
    const statusChanged = status !== storedStatus
    const notificationSent = displayOrderStatus(order.lastNotificationStatus) === status
    const canSubmit = Boolean(status) && (statusChanged || !notificationSent)
    const itemCount = orderItems.reduce((count, item) => count + Number(item.quantity || 0), 0)
    const shippingDetails = shippingInfo &&
        `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`

    useEffect(() => {
        dispatch(getOrderDetails(orderId))
    }, [dispatch, orderId])

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'bottom-center' })
            dispatch(clearErrors())
        }
        if (isUpdated) {
            toast.success('Order updated and customer notification sent', { position: 'bottom-center' })
            dispatch({ type: UPDATE_ORDER_RESET })
            navigate('/admin/orders')
        }
    }, [dispatch, error, isUpdated, navigate])

    const updateOrderHandler = async () => {
        if (!status) return
        if (status === 'Cancelled' &&
            !window.confirm('Cancel this order? Any stock already deducted will be restored.')) return
        const result = await dispatch(updateOrder(orderId, { status }))
        if (result?.statusUpdated && !result.notificationSent) {
            dispatch(getOrderDetails(orderId))
        }
    }

    return (
        <AdminPageLayout
            title="Order details"
            description={order._id ? `Order #${order._id}` : 'Review the order and update its status.'}
            actions={<Link to="/admin/orders" className="pizzaro-admin-secondary-action">Back to orders</Link>}
        >
            {loading ? <Loader /> : (
                <div className="pizzaro-order-admin-layout">
                    <div className="pizzaro-order-admin-content">
                        <section className="pizzaro-order-panel">
                            <header className="pizzaro-order-panel-heading">
                                <div>
                                    <h2>Delivery details</h2>
                                    <p>Customer and drop-off information</p>
                                </div>
                                <span className={`pizzaro-order-status-pill is-${String(storedStatus || 'pending').toLowerCase()}`}>
                                    {storedStatus || 'Pending'}
                                </span>
                            </header>
                            <dl className="pizzaro-order-delivery-grid">
                                <div><dt>Customer</dt><dd>{user?.name || '—'}</dd></div>
                                <div><dt>Phone</dt><dd>{shippingInfo?.phoneNo || '—'}</dd></div>
                                <div className="is-address"><dt>Delivery address</dt><dd>{shippingDetails || '—'}</dd></div>
                            </dl>
                        </section>

                        <section className="pizzaro-order-panel">
                            <header className="pizzaro-order-panel-heading">
                                <div>
                                    <h2>Order items</h2>
                                    <p>{itemCount} {itemCount === 1 ? 'item' : 'items'} in this order</p>
                                </div>
                            </header>
                            <div className="pizzaro-order-item-list">
                                {orderItems.map((item, index) => (
                                    <article className="pizzaro-order-item" key={`${item.product}-${index}`}>
                                        <img src={item.image} alt={item.name} />
                                        <div className="pizzaro-order-item-name">
                                            <Link to={`/product/${item.product}`}>{item.name}</Link>
                                            <span>Qty {item.quantity}</span>
                                        </div>
                                        <span className="pizzaro-order-item-unit">{formatCurrency(item.price)} each</span>
                                        <strong>{formatCurrency(item.price * item.quantity)}</strong>
                                    </article>
                                ))}
                                {!orderItems.length && <p className="pizzaro-order-empty">No items were found on this order.</p>}
                            </div>
                            <dl className="pizzaro-order-totals">
                                <div><dt>Subtotal</dt><dd>{formatCurrency(itemsPrice || 0)}</dd></div>
                                <div><dt>Tax</dt><dd>{formatCurrency(taxPrice || 0)}</dd></div>
                                <div><dt>Delivery</dt><dd>{formatCurrency(shippingPrice || 0)}</dd></div>
                                <div className="is-total"><dt>Order total</dt><dd>{formatCurrency(totalPrice || 0)}</dd></div>
                            </dl>
                        </section>
                    </div>

                    <aside className="pizzaro-order-status-panel">
                        <h2>Update status</h2>
                        <p>Choose the current stage of this order.</p>
                        <label htmlFor="order-status">Order status</label>
                        <select
                            id="order-status"
                            className="form-control"
                            name="status"
                            value={status}
                            onChange={event => setSelectedStatus({ orderId, value: event.target.value })}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            {status === 'Shipped' && (
                                <option value={status} disabled>{status} (existing order)</option>
                            )}
                        </select>
                        <button
                            className="pizzaro-order-submit"
                            type="button"
                            disabled={!canSubmit}
                            onClick={updateOrderHandler}
                        >
                            {statusChanged
                                ? 'Save status & notify customer'
                                : notificationSent
                                    ? 'Customer notified'
                                    : 'Send customer update'}
                        </button>
                        <p className="pizzaro-order-notice" role="status">
                            {order.orderStatus !== 'Pending' && !notificationSent
                                ? 'The status was saved, but the email is pending. Retry to send the itemized PDF receipt.'
                                : 'Status updates send the customer an email with an itemized PDF receipt.'}
                        </p>
                    </aside>
                </div>
            )}
        </AdminPageLayout>
    )
}

export default ProcessOrder
