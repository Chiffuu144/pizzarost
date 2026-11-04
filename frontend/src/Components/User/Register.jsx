import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import MetaData from '../Layout/MetaData'
import { useDispatch, useSelector } from 'react-redux'
import { register, clearErrors } from '../../actions/userActions'
import SocialLoginButtons from './SocialLoginButtons'

const Register = () => {
    const dispatch = useDispatch()
    const { isAuthenticated, error, loading } = useSelector(state => state.auth)
    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
    })
    const [avatar, setAvatar] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState('')
    const [avatarName, setAvatarName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const { name, email, password } = user

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }

        if (error) {
            if (error !== 'Login first to access this resource') {
                toast.error(error)
            }
            dispatch(clearErrors())
        }
    }, [error, navigate, isAuthenticated, dispatch])

    const submitHandler = (event) => {
        event.preventDefault()

        const formData = new FormData()
        formData.set('name', name)
        formData.set('email', email)
        formData.set('password', password)
        if (avatar) formData.set('avatar', avatar)

        dispatch(register(formData))
    }

    const onChange = (event) => {
        if (event.target.name !== 'avatar') {
            setUser({ ...user, [event.target.name]: event.target.value })
            return
        }

        const file = event.target.files?.[0]
        if (!file) return

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
            toast.error('Choose a JPEG, PNG, or WebP photo up to 5 MB.')
            event.target.value = ''
            return
        }

        setAvatarName(file.name)
        setAvatar(file)
        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setAvatarPreview(reader.result)
            }
        }
        reader.onerror = () => toast.error('Unable to read this image. Please choose another file.')
        reader.readAsDataURL(file)
    }

    return (
        <main className="pizzaro-login pizzaro-register" role="dialog" aria-modal="true" aria-label="Create a Pizzaro account">
            <MetaData title="Create an account | Pizzaro" />
            <section className="pizzaro-login-visual" aria-label="Pizzaro pizza">
                <div className="pizzaro-login-brand">
                    <Link to="/" className="pizzaro-brand-link" aria-label="Pizzaro home">
                        <img className="pizzaro-brand-icon" src="/images/pizzaro-mark.svg" alt="" />
                        <span className="pizzaro-wordmark">Pizzaro</span>
                    </Link>
                </div>
                <div className="pizzaro-login-message">
                    <p>GOOD FOOD IS BETTER TOGETHER</p>
                    <h1>Make Room<br /><em>for Something Delicious.</em></h1>
                    <span>Create your account and find your next favorite slice.</span>
                </div>
            </section>
            <section className="pizzaro-login-panel">
                <Link to="/" className="pizzaro-back-home">
                    <i className="fa fa-arrow-left" aria-hidden="true" /> Back to Home
                </Link>
                <form className="pizzaro-login-form pizzaro-register-form" onSubmit={submitHandler} encType="multipart/form-data">
                    <div className="pizzaro-login-heading">
                        <p className="pizza-hero-eyebrow">JOIN THE PIZZARO TABLE</p>
                        <h2>Create Account</h2>
                        <p>Sign up to order your favorites.</p>
                    </div>
                    <div className="pizzaro-field">
                        <label htmlFor="name_field">Full name</label>
                        <input
                            type="text"
                            id="name_field"
                            name="name"
                            autoComplete="name"
                            placeholder="Your name"
                            value={name}
                            onChange={onChange}
                            maxLength={30}
                            required
                        />
                    </div>
                    <div className="pizzaro-field">
                        <label htmlFor="register_email_field">Email address</label>
                        <input
                            type="email"
                            id="register_email_field"
                            name="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="pizzaro-field">
                        <label htmlFor="register_password_field">Password</label>
                        <div className="pizzaro-password-field">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="register_password_field"
                                name="password"
                                autoComplete="new-password"
                                placeholder="At least 6 characters"
                                value={password}
                                onChange={onChange}
                                minLength={6}
                                required
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
                    </div>
                    <div className="pizzaro-field pizzaro-avatar-field">
                        <label htmlFor="avatar_upload">Profile photo</label>
                        <div className="pizzaro-avatar-upload">
                            {avatarPreview
                                ? <img src={avatarPreview} alt="Profile photo preview" />
                                : <span className="pizzaro-avatar-placeholder" aria-hidden="true"><i className="fa fa-user" /></span>}
                            <div className="pizzaro-avatar-control">
                                <input
                                    type="file"
                                    name="avatar"
                                    id="avatar_upload"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={onChange}
                                    required
                                />
                                <label htmlFor="avatar_upload">Choose a photo</label>
                                <span>{avatarName || 'JPEG, PNG, or WebP up to 5 MB'}</span>
                            </div>
                        </div>
                    </div>
                    <button className="pizzaro-sign-in" type="submit" disabled={loading}>
                        {loading ? <><span className="pizzaro-button-spinner" aria-hidden="true" /> Creating account…</> : 'Create Account'}
                    </button>
                    <SocialLoginButtons />
                    <p className="pizzaro-sign-up">Already have an account? <Link to="/login">Sign in</Link></p>
                </form>
            </section>
        </main>
    )
}

export default Register
