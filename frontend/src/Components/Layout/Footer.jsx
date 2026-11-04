import { Link, useLocation } from 'react-router-dom'

const Footer = () => {
    const location = useLocation()

    return (
        <footer className={`pizzaro-footer${location.pathname === '/' ? ' pizzaro-home-footer' : ''}`}>
            <div className="pizzaro-footer-main">
                <div className="pizzaro-footer-brand">
                    <Link to="/#top" className="pizzaro-brand-link" aria-label="Pizzaro home">
                        <img className="pizzaro-brand-icon" src="/images/pizzaro-mark.svg" alt="" />
                        <span className="pizzaro-wordmark">Pizzaro</span>
                    </Link>
                    <p>Freshly baked favorites, made to bring people together.</p>
                </div>
                <nav className="pizzaro-footer-links" aria-label="Footer navigation">
                    <Link to="/#top">Home</Link>
                    <Link to="/#products">Menu</Link>
                    <Link to="/#about">About Us</Link>
                    <Link to="/cart">Your Cart</Link>
                </nav>
            </div>
            <div className="pizzaro-footer-bottom">
                <p>© 2026–2027 Pizzaro. All rights reserved.</p>
            </div>
        </footer>
    )
}

export default Footer