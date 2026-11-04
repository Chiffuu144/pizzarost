import { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import { Link, useNavigate, useLocation } from 'react-router-dom'

import MetaData from '../Layout/MetaData'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { login, clearErrors } from '../../actions/userActions'
import { loginValidationSchema } from '../../utils/validationSchemas'
import SocialLoginButtons from './SocialLoginButtons'

const Login = () => {
    const { isAuthenticated, error, loading, user } = useSelector(state => state.auth)
    const [rememberedEmail] = useState(() => localStorage.getItem('pizzaroRememberedEmail') || '')
    const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem('pizzaroRememberedEmail')));
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()

    const formik = useFormik({
        initialValues: { email: rememberedEmail, password: '' },
        validationSchema: loginValidationSchema,
        validateOnMount: true,
        onSubmit: values => {
            if (rememberMe) {
                localStorage.setItem('pizzaroRememberedEmail', values.email.trim())
            } else {
                localStorage.removeItem('pizzaroRememberedEmail')
            }
            dispatch(login(values.email.trim(), values.password))
        }
    })

    const redirect = location.search ? new URLSearchParams(location.search).get('redirect') : ''

    useEffect(() => {
        if (isAuthenticated && redirect === 'shipping') {
            navigate(`/${redirect}`)
        } else if (isAuthenticated) {
            navigate(user?.role === 'admin' ? '/dashboard' : '/')
        }
        if (error) {
            if (error !== 'Login first to access this resource') {
                toast.error(error)
            }
            dispatch(clearErrors());
        }
    }, [error, isAuthenticated, user, dispatch, navigate, redirect])

    return (
        <main className="pizzaro-login" role="dialog" aria-modal="true" aria-label="Sign in to Pizzaro">
            <MetaData title={'Sign in | Pizzaro'} />
            <section className="pizzaro-login-visual" aria-label="Pizzaro pizza">
                <div className="pizzaro-login-brand">
                    <Link to="/" className="pizzaro-brand-link" aria-label="Pizzaro home">
                        <img className="pizzaro-brand-icon" src="/images/pizzaro-mark.svg" alt="" />
                        <span className="pizzaro-wordmark">Pizzaro</span>
                    </Link>
                </div>
                <div className="pizzaro-login-message">
                    <p>MADE FRESH, SHARED WITH LOVE</p>
                    <h1>Freshly Baked.<br /><em>Always Delicious.</em></h1>
                    <span>Sign in and get ready for your next favorite pizza.</span>
                </div>
            </section>
            <section className="pizzaro-login-panel">
                <Link to="/" className="pizzaro-back-home">
                    <i className="fa fa-arrow-left" aria-hidden="true" /> Back to Home
                </Link>
                <form className="pizzaro-login-form" onSubmit={formik.handleSubmit} noValidate>
                    <div className="pizzaro-login-heading">
                        <p className="pizza-hero-eyebrow">WELCOME TO PIZZARO</p>
                        <h2>Welcome Back!</h2>
                        <p>Sign in to continue to Pizzaro.</p>
                    </div>
                    <div className="pizzaro-field">
                        <label htmlFor="email_field">Email address</label>
                        <input
                            type="email"
                            id="email_field"
                            name="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            aria-invalid={formik.touched.email && Boolean(formik.errors.email)}
                            aria-describedby={formik.touched.email && formik.errors.email ? 'email-error' : undefined}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <small id="email-error" className="pizzaro-field-error" role="alert">{formik.errors.email}</small>
                        )}
                    </div>
                    <div className="pizzaro-field">
                        <label htmlFor="password_field">Password</label>
                        <div className="pizzaro-password-field">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password_field"
                                name="password"
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                aria-invalid={formik.touched.password && Boolean(formik.errors.password)}
                                aria-describedby={formik.touched.password && formik.errors.password ? 'password-error' : undefined}
                            />
                            <button
                                type="button"
                                className="pizzaro-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                aria-pressed={showPassword}
                            >
                                <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
                            </button>
                        </div>
                        {formik.touched.password && formik.errors.password && (
                            <small id="password-error" className="pizzaro-field-error" role="alert">{formik.errors.password}</small>
                        )}
                    </div>
                    <div className="pizzaro-login-options">
                        <label className="pizzaro-remember">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>Remember my email</span>
                        </label>
                        <Link to="/password/forgot">Forgot password?</Link>
                    </div>
                    <button className="pizzaro-sign-in" type="submit" disabled={loading || formik.isSubmitting}>
                        {loading ? <><span className="pizzaro-button-spinner" aria-hidden="true" /> Signing in…</> : 'Sign In'}
                    </button>
                    <SocialLoginButtons />
                    <p className="pizzaro-sign-up">New to Pizzaro? <Link to="/register">Create an account</Link></p>
                </form>
            </section>
        </main>
    )
}

export default Login
