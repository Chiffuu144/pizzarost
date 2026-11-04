import axios from 'axios'
import { ADD_TO_CART, REMOVE_ITEM_CART, SAVE_SHIPPING_INFO, CLEAR_CART, RESTORE_CART } from '../constants/cartConstants'

const userCartKey = userId => `cartItems:${userId}`

export const clearUserCart = userId => {
    if (!userId) return
    localStorage.removeItem(userCartKey(userId))
}

const validateCartQuantity = ({ name, stock }, quantity) => {
    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error('Select a valid quantity before adding this item.')
    }
    if (stock < 1) {
        throw new Error(`${name} is currently out of stock.`)
    }
    if (quantity > stock) {
        throw new Error(`Only ${stock} ${name} available right now.`)
    }
}

export const restoreCartForUser = userId => dispatch => {
    if (!userId) return
    try {
        const savedCart = JSON.parse(localStorage.getItem(userCartKey(userId)) || '[]')
        const cartItems = Array.isArray(savedCart) ? savedCart : []
        dispatch({ type: RESTORE_CART, payload: cartItems })
        localStorage.setItem('cartItems', JSON.stringify(cartItems))
    } catch (error) {
        console.error('Unable to restore the saved cart:', error)
        dispatch({ type: RESTORE_CART, payload: [] })
        localStorage.removeItem('cartItems')
    }
}

export const addItemToCart = (id, quantity) => async (dispatch, getState) => {
    const { isAuthenticated, user } = getState().auth
    if (!isAuthenticated || !user) {
        throw Object.assign(new Error('Login first to add items to your cart.'), {
            code: 'LOGIN_REQUIRED'
        })
    }

    const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`)
    const product = data.product

    validateCartQuantity(product, quantity)

    dispatch({
        type: ADD_TO_CART,
        payload: {
            product: product._id,
            name: product.name,
            price: product.price,
            image: product.images[0]?.url || '',
            stock: product.stock,
            quantity
        }
    })
    const updatedCart = getState().cart.cartItems
    localStorage.setItem('cartItems', JSON.stringify(updatedCart))
    saveCartForUser(getState().auth.user?._id, updatedCart)

}

export const removeItemFromCart = (id) => async (dispatch, getState) => {
    dispatch({
        type: REMOVE_ITEM_CART,
        payload: id
    })
    const updatedCart = getState().cart.cartItems
    localStorage.setItem('cartItems', JSON.stringify(updatedCart))
    saveCartForUser(getState().auth.user?._id, updatedCart)
}

export const saveShippingInfo = (data) => async (dispatch) => {
    dispatch({
        type: SAVE_SHIPPING_INFO,
        payload: data
    })
    localStorage.setItem('shippingInfo', JSON.stringify(data))
}

export const clearCart = (userId = null) => async (dispatch, getState) => {
    const effectiveUserId = userId ?? getState?.()?.auth?.user?._id

    dispatch({
        type: CLEAR_CART,
    })

    if (effectiveUserId) {
        clearUserCart(effectiveUserId)
    }

    localStorage.removeItem('cartItems')
    localStorage.removeItem('shippingInfo')

    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
        const key = localStorage.key(i)
        if (key && key.startsWith('cartItems:')) {
            localStorage.removeItem(key)
        }
    }
}

export const saveCartForUser = (userId, cartItems) => {
    if (!userId) return
    localStorage.setItem(userCartKey(userId), JSON.stringify(cartItems))
}
