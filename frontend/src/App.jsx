import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer, } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Header } from './Components/Layout/Header'
import Footer from './Components/Layout/Footer'

import './App.css'
import ProtectedRoute from './Components/Route/ProtectedRoute';
import { useDispatch } from 'react-redux'
import { loadUser } from './actions/userActions'

const Home = lazy(() => import('./Components/Home'))
const ProductDetails = lazy(() => import('./Components/Product/ProductDetails'))
const Login = lazy(() => import('./Components/User/Login'))
const Register = lazy(() => import('./Components/User/Register'))
const ForgotPassword = lazy(() => import('./Components/User/ForgotPassword'))
const NewPassword = lazy(() => import('./Components/User/NewPassword'))
const Profile = lazy(() => import('./Components/User/Profile'))
const UpdateProfile = lazy(() => import('./Components/User/UpdateProfile'))
const UpdatePassword = lazy(() => import('./Components/User/UpdatePassword'))
const Cart = lazy(() => import('./Components/Cart/Cart'))
const Shipping = lazy(() => import('./Components/Cart/Shipping'))
const ConfirmOrder = lazy(() => import('./Components/Cart/ConfirmOrder'))
const Payment = lazy(() => import('./Components/Cart/Payment'))
const OrderSuccess = lazy(() => import('./Components/Cart/OrderSuccess'))
const ListOrders = lazy(() => import('./Components/Order/ListOrders'))
const OrderDetails = lazy(() => import('./Components/Order/OrderDetails'))
const Dashboard = lazy(() => import('./Components/Admin/Dashboard'))
const ProductsList = lazy(() => import('./Components/Admin/ProductsList'))
const NewProduct = lazy(() => import('./Components/Admin/NewProduct'))
const UpdateProduct = lazy(() => import('./Components/Admin/UpdateProduct'))
const OrdersList = lazy(() => import('./Components/Admin/OrdersList'))
const ProcessOrder = lazy(() => import('./Components/Admin/ProcessOrder'))
const UsersList = lazy(() => import('./Components/Admin/UsersList'))
const UpdateUser = lazy(() => import('./Components/Admin/UpdateUser'))
const ProductReviews = lazy(() => import('./Components/Admin/ProductReviews'))

const ScrollToHash = () => {
  const { hash, pathname } = useLocation()

  useEffect(() => {
    if (!hash) return undefined

    const frame = window.requestAnimationFrame(() => {
      const target = decodeURIComponent(hash.slice(1))
      if (target === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        document.getElementById(target)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [hash, pathname])

  return null
}

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(loadUser())
  }, [dispatch])

  // const [state, setState] = useState({
  //   cartItems: localStorage.getItem('cartItems')
  //     ? JSON.parse(localStorage.getItem('cartItems'))
  //     : [],

  //   shippingInfo: localStorage.getItem('shippingInfo')
  //     ? JSON.parse(localStorage.getItem('shippingInfo'))
  //     : {},
  // })

  // const addItemToCart = async (id, quantity) => {
  //   console.log(id, quantity)
  //   try {
  //     const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`)
  //     console.log(data)

  //     const item = {
  //       product: data.product._id,
  //       name: data.product.name,
  //       price: data.product.price,
  //       image: data.product.images[0].url ? data.product.images[0].url : '',
  //       stock: data.product.stock,
  //       quantity: quantity
  //     }
  //     console.log(item)

  //     const isItemExist = state.cartItems.find(i => i.product === item.product)


  //     if (isItemExist) {
  //       setState({
  //         ...state,
  //         cartItems: state.cartItems.map(i => i.product === isItemExist.product ? item : i)
  //       })
  //     }
  //     else {
  //       setState({
  //         ...state,
  //         cartItems: [...state.cartItems, item]
  //       })
  //     }

  //     toast.success('Item Added to Cart', {
  //       position: 'bottom-right'
  //     })



  //   } catch (error) {
  //     toast.error(error, {
  //       position: 'top-left'
  //     });

  //   }

  // }

  // const removeItemFromCart = async (id) => {
  //   setState({
  //     ...state,
  //     cartItems: state.cartItems.filter(i => i.product !== id)
  //   })
  //   localStorage.setItem('cartItems', JSON.stringify(state.cartItems))
  // }

  // const saveShippingInfo = async (data) => {
  //   setState({
  //     ...state,
  //     shippingInfo: data
  //   })
  //   localStorage.setItem('shippingInfo', JSON.stringify(data))
  // }


  return (
    <>

      <Router>
        <ScrollToHash />
        <AdminAwareHeader />
        <Suspense fallback={<main className="pizzaro-route-loading" role="status">Loading page...</main>}>
        <Routes>
          <Route path="/" element={<Home />} exact="true" />
          {/* <Route path="/product/:id" element={<ProductDetails cartItems={state.cartItems} addItemToCart={addItemToCart} />} exact="true" /> */}
          <Route path="/product/:id" element={<ProductDetails />} exact="true" />

          <Route path="/search/:keyword" element={<Home />} exact="true" />
          <Route path="/login" element={<Login />} exact="true" />
          <Route path="/register" element={<Register exact="true" />} />
          <Route path="/password/forgot" element={<ForgotPassword />} exact="true" />
          <Route path="/password/reset/:token" element={<NewPassword />} exact="true" />
          <Route
            path="/me"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }

            exact="true"
          />
          <Route
            path="/me/update"
            element={
              <ProtectedRoute>
                <UpdateProfile />
              </ProtectedRoute>
            }
            exact="true"
          />
          <Route
            path="/password/update"
            element={
              <ProtectedRoute>
                <UpdatePassword />
              </ProtectedRoute>
            }
          />
          {/* <Route path="/cart" element={<Cart cartItems={state.cartItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} />} exact="true" />
          <Route path="/shipping" element={<Shipping shipping={state.shippingInfo} saveShippingInfo={saveShippingInfo} />} />
          <Route path="/confirm" element={<ConfirmOrder cartItems={state.cartItems} shippingInfo={state.shippingInfo} />} />
          <Route path="/payment" element={<Payment cartItems={state.cartItems} shippingInfo={state.shippingInfo} />} /> */}

          <Route path="/cart" element={<Cart />} exact="true" />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/confirm" element={<ConfirmOrder />} />
          <Route path="/payment" element={<Payment />} />


          <Route path="/success" element={<OrderSuccess />} />
          <Route
            path="/orders/me"
            element={
              <ProtectedRoute>
                <ListOrders />
              </ProtectedRoute>
            }
          />
          <Route path="/order/:id" element={<OrderDetails />} />

          <Route path="/admin/product" element={
            <ProtectedRoute isAdmin={true} >
              <NewProduct />
            </ProtectedRoute>} />
          <Route
            path="/admin/product/:id"
            element={
              <ProtectedRoute isAdmin={true}>
                <UpdateProduct />
              </ProtectedRoute>
            } />
          <Route
            path="/admin/order/:id"
            element={
              <ProtectedRoute isAdmin={true}>
                <ProcessOrder />
              </ProtectedRoute>
            } />
          <Route
            path="/admin/user/:id"
            element={
              <ProtectedRoute isAdmin={true}>
                <UpdateUser />
              </ProtectedRoute>
            } />

          <Route
            path="/admin/products"
            element={
              <ProtectedRoute isAdmin={true}>
                <ProductsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute isAdmin={true}>
                <UsersList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute isAdmin={true}>
                <OrdersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute isAdmin={true} >
                <ProductReviews />
              </ProtectedRoute>} />

        </Routes>
        </Suspense>

        <AdminAwareFooter />
      </Router>
      <ToastContainer />
    </>
  )
}

function AdminAwareHeader() {
  const { pathname } = useLocation()
  const isAdminSurface = pathname === '/dashboard' || pathname.startsWith('/admin/')
  return isAdminSurface ? null : <Header />
}

function AdminAwareFooter() {
  const { pathname } = useLocation()
  const isAdminSurface = pathname === '/dashboard' || pathname.startsWith('/admin/')
  return isAdminSurface ? null : <Footer />
}

export default App
