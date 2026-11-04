import { useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDispatch, useSelector } from 'react-redux'
import { createOrder, clearErrors } from '../../actions/orderActions'
import { clearCart } from '../../actions/cartActions'

const Payment = () => {
    const dispatch = useDispatch()
    const { cartItems, shippingInfo } = useSelector(state => state.cart)
    const { user } = useSelector(state => state.auth)
    const { loading } = useSelector(state => state.newOrder)
    const navigate = useNavigate()
    const submitHandler = async (event) => {
        event.preventDefault()
        try {
            const createdOrder = await dispatch(createOrder({
                orderItems: cartItems,
                shippingInfo
            }))
            if (createdOrder) {
                const currentUserId = user?._id

                if (currentUserId) {
                    localStorage.removeItem(`cartItems:${currentUserId}`)
                }
                localStorage.removeItem('cartItems')
                localStorage.removeItem('shippingInfo')
                for (let i = localStorage.length - 1; i >= 0; i -= 1) {
                    const key = localStorage.key(i)
                    if (key && key.startsWith('cartItems:')) {
                        localStorage.removeItem(key)
                    }
                }

                dispatch(clearCart(currentUserId))
                sessionStorage.removeItem('orderInfo')
                navigate('/success')
            }
        } catch (error) {
            dispatch(clearErrors())
            toast.error(error.response?.data?.message || error.message || 'Unable to place your order')
        }
    }

    return (
        <>
            <MetaData title="Place Order" />
            <main className="pizzaro-checkout-page pizzaro-place-order">
                <CheckoutSteps shipping confirmOrder payment />
                <form className="pizzaro-place-order-form" onSubmit={submitHandler}>
                    <h1>Review and place your order</h1>
                    <p>Your order will be saved as Pending. You can follow its progress from your account.</p>
                    <button
                        id="pay_btn"
                        type="submit"
                        className="btn btn-block py-3"
                        disabled={loading || !cartItems.length}
                    >
                        {loading ? 'Placing order...' : 'Place order'}
                    </button>
                </form>
            </main>
        </>
    )
}

export default Payment
