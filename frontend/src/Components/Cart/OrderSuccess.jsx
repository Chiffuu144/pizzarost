import { Link } from 'react-router-dom'
import MetaData from '../Layout/MetaData'

const OrderSuccess = () => (
    <>
        <MetaData title="Order Received" />
        <main className="pizzaro-order-success-page">
            <section className="pizzaro-order-success" aria-labelledby="order-success-heading">
                <div className="pizzaro-order-success-mark" aria-hidden="true">
                    <svg viewBox="0 0 48 48" focusable="false">
                        <path d="m13 24 7.5 7.5L35 17" />
                    </svg>
                </div>
                <h1 id="order-success-heading">Order received</h1>
                <p>Your order is pending confirmation. We’ll keep you updated as it moves through the kitchen.</p>
                <div className="pizzaro-order-success-actions">
                    <Link className="pizzaro-sign-in" to="/orders/me">View my orders</Link>
                    <Link className="pizzaro-order-success-secondary" to="/">Continue shopping</Link>
                </div>
            </section>
        </main>
    </>
)

export default OrderSuccess
