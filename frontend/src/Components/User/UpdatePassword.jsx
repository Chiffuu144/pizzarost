import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDispatch, useSelector } from 'react-redux'
import { updatePassword, clearErrors } from '../../actions/userActions'
import { UPDATE_PASSWORD_RESET } from '../../constants/userConstants'

const UpdatePassword = () => {
    const dispatch = useDispatch()
    const { error, isUpdated, loading } = useSelector(state => state.user)
    const [oldPassword, setOldPassword] = useState('')
    const [password, setPassword] = useState('')
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'bottom-right' })
            dispatch(clearErrors())
        }
        if (isUpdated) {
            navigate('/me', { replace: true })
            dispatch({ type: UPDATE_PASSWORD_RESET })
        }
    }, [dispatch, error, navigate, isUpdated])

    const submitHandler = event => {
        event.preventDefault()
        const formData = new FormData()
        formData.set('oldPassword', oldPassword)
        formData.set('password', password)
        dispatch(updatePassword(formData))
    }

    return (
        <>
            <MetaData title="Change password" />
            <main className="pizzaro-profile-page pizzaro-password-update-page">
                <div className="pizzaro-password-content">
                    <Link to="/me" className="pizzaro-password-back">
                        <i className="fa fa-arrow-left" aria-hidden="true" />
                        Back to profile
                    </Link>
                    <form className="pizzaro-password-form" onSubmit={submitHandler}>
                        <header className="pizzaro-password-heading">
                            <img src="/images/pizzaro-mark.svg" alt="" />
                            <div>
                                <h1>Update password</h1>
                                <p>Confirm your current password, then choose a new one.</p>
                            </div>
                        </header>
                        <div className="pizzaro-password-fields">
                            <div className="pizzaro-password-field">
                                <label htmlFor="old_password_field">Current password</label>
                                <div className="pizzaro-password-input">
                                    <input
                                        type={showOldPassword ? 'text' : 'password'}
                                        id="old_password_field"
                                        name="oldPassword"
                                        autoComplete="current-password"
                                        value={oldPassword}
                                        onChange={event => setOldPassword(event.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="pizzaro-password-visibility"
                                        onClick={() => setShowOldPassword(value => !value)}
                                        aria-label={showOldPassword ? 'Hide current password' : 'Show current password'}
                                        aria-pressed={showOldPassword}
                                    >
                                        <i className={`fa ${showOldPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                            <div className="pizzaro-password-field">
                                <label htmlFor="new_password_field">New password</label>
                                <div className="pizzaro-password-input">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="new_password_field"
                                        name="password"
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={event => setPassword(event.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="pizzaro-password-visibility"
                                        onClick={() => setShowPassword(value => !value)}
                                        aria-label={showPassword ? 'Hide new password' : 'Show new password'}
                                        aria-pressed={showPassword}
                                    >
                                        <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="pizzaro-password-submit" disabled={loading}>
                            {loading ? 'Updating password…' : 'Update password'}
                        </button>
                    </form>
                </div>
            </main>
        </>
    )
}

export default UpdatePassword
