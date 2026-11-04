import { useState } from 'react'
import '../../App.css'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { getUser, logout } from '../Utils/helpers';
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../actions/userActions'

import Search from './Search'
export const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useSelector(state => state.auth)
    const { cartItems } = useSelector(state => state.cart)
    const [failedAvatarUrl, setFailedAvatarUrl] = useState(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const isHome = location.pathname === '/'
    const cartItemCount = cartItems?.length || 0
    const avatarUrl = user?.avatar?.url
    const avatarFailed = failedAvatarUrl === avatarUrl
    const initials = user?.name?.trim().split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()

    // const logoutHandler = () => {
    //     logout(navigate('/'));

    //     toast.success('log out', {
    //         position: 'bottom-right'
    //     });
    // }

    const logoutHandler = async () => {
        try {
            await dispatch(logout())
            setMenuOpen(false)
            navigate('/')
            toast.success('Logged out successfully', {
                position: 'bottom-right'
            })
        } catch (error) {
            toast.error(error.message || 'Logout failed', {
                position: 'bottom-right'
            })
        }
    }

    const closeMenu = () => setMenuOpen(false)

    // useEffect(() => {
    //     setUser(getUser())
    // }, []);
    return (
        <>
            <nav id="top" className={`navbar header-navbar pizzaro-editorial-navbar${isHome ? ' pizzaro-home-navbar' : ''}`}>
                <div className="header-brand">
                    <Link to="/#top" className="pizzaro-brand-link" aria-label="Pizzaro home">
                        <img className="pizzaro-brand-icon" src="/images/pizzaro-mark.svg" alt="" />
                        <span className="pizzaro-wordmark">Pizzaro</span>
                    </Link>
                </div>

                {isHome && (
                    <button
                        className="pizzaro-menu-toggle"
                        type="button"
                        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
                        aria-expanded={menuOpen}
                        aria-controls="pizzaro-main-navigation"
                        onClick={() => setMenuOpen(open => !open)}
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            {menuOpen
                                ? <path d="m6 6 12 12M18 6 6 18" />
                                : <path d="M4 7h16M4 12h16M4 17h16" />}
                        </svg>
                    </button>
                )}

                <nav
                    className={`header-links${isHome ? ` pizzaro-home-links${menuOpen ? ' is-open' : ''}` : ''}`}
                    id={isHome ? 'pizzaro-main-navigation' : undefined}
                    aria-label="Main navigation"
                >
                    <Link to="/#top" onClick={closeMenu}>Home</Link>
                    <Link to="/#products" onClick={closeMenu}>Menu</Link>
                    <Link to="/#about" onClick={closeMenu}>Our Story</Link>
                    {isHome && <Link to="/#locations" onClick={closeMenu}>Locations</Link>}
                    {isHome && (
                        <div className="pizzaro-mobile-account-links">
                            {user ? (
                                <>
                                    <Link to="/me" onClick={closeMenu}>My account</Link>
                                    <Link to="/orders/me" onClick={closeMenu}>My orders</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={closeMenu}>Log in</Link>
                                    <Link to="/register" onClick={closeMenu}>Sign up</Link>
                                </>
                            )}
                        </div>
                    )}
                    {isHome && (
                        <div className="pizzaro-mobile-search">
                            <Search id="mobile-home-search" />
                        </div>
                    )}
                </nav>

                <div className={`header-search${isHome ? ' pizzaro-home-search' : ''}`}>
                    <Search id={isHome ? 'home-search' : 'search_field'} />
                </div>

                <div className="header-actions">
                    {user ? (
                        <div className="header-user-menu dropdown">
                            <Link to="#!" className="header-user-link dropdown-toggle text-white" type="button" id="dropDownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <figure className="avatar avatar-nav">
                                    {avatarUrl && !avatarFailed ? (
                                        <img
                                            src={avatarUrl}
                                            alt=""
                                            className="rounded-circle"
                                            onError={() => setFailedAvatarUrl(avatarUrl)}
                                        />
                                    ) : (
                                        <span className="avatar-fallback" aria-hidden="true">{initials}</span>
                                    )}
                                </figure>
                                <span className="header-user-name" title={user.name}>{user.name}</span>
                            </Link>

                            <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropDownMenuButton">
                                {user.role === 'admin' && (
                                <Link className="dropdown-item" to="/dashboard">Dashboard</Link>
                                )}
                                <Link className="dropdown-item" to="/orders/me">Orders</Link>
                                <Link className="dropdown-item" to="/me">Profile</Link>

                                <button
                                    type="button"
                                    className="dropdown-item text-danger"
                                    onClick={logoutHandler}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className={`btn${isHome ? ' pizzaro-home-login' : ''}`} id="login_btn">
                                {isHome ? 'Log in' : 'Login'}
                            </Link>
                            {isHome && <Link to="/register" className="pizzaro-home-signup">Sign up</Link>}
                        </>
                    )}

                    {isHome && (
                        <Link to="/#products" className="pizzaro-home-order">
                            Order now
                        </Link>
                    )}

                    <Link
                        to="/cart"
                        className="header-cart-link"
                        aria-label={`Open shopping cart, ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}`}
                    >
                        <i className="fa fa-shopping-bag header-cart-icon" aria-hidden="true" />
                        <span id="cart">{isHome ? `${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}` : 'Cart'}</span>
                        {!isHome && cartItems?.length > 0 && <span id="cart_count">{cartItemCount}</span>}
                    </Link>
                </div>

            </nav>
        </>
    )
}
