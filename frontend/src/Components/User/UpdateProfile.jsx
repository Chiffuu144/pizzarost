import { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import MetaData from '../Layout/MetaData'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { updateProfile, loadUser, clearErrors } from '../../actions/userActions'
import { UPDATE_PROFILE_RESET } from '../../constants/userConstants'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfileValidationSchema } from '../../utils/validationSchemas'

const UpdateProfile = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector(state => state.auth)
    const { error, isUpdated, loading } = useSelector(state => state.user)
    const [avatar, setAvatar] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState('')
    const initials = user?.name?.trim().split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: user?.name || '',
            email: user?.email || '',
            phoneNo: user?.phoneNo || '',
            address: user?.address || ''
        },
        validationSchema: updateProfileValidationSchema,
        validateOnMount: true,
        onSubmit: async values => {
            const formData = new FormData()
            formData.set('name', values.name.trim())
            formData.set('email', values.email.trim())
            formData.set('phoneNo', values.phoneNo.trim())
            formData.set('address', values.address.trim())
            if (avatar) formData.set('avatar', avatar)
            await dispatch(updateProfile(formData))
        }
    })

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'bottom-right' })
            dispatch(clearErrors())
        }
        if (isUpdated) {
            toast.success('Profile updated successfully', { position: 'bottom-right' })
            dispatch(loadUser())
            dispatch({ type: UPDATE_PROFILE_RESET })
            navigate('/me', { replace: true })
        }
    }, [dispatch, error, isUpdated, navigate])

    const handleAvatarChange = event => {
        const file = event.currentTarget.files?.[0]
        if (!file) return
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
            toast.error('Choose a JPEG, PNG, or WebP avatar smaller than 5 MB')
            event.currentTarget.value = ''
            return
        }
        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result === 'string') setAvatarPreview(reader.result)
        }
        reader.onerror = () => toast.error(`Unable to read ${file.name}`)
        setAvatar(file)
        reader.readAsDataURL(file)
    }

    const fieldError = field => formik.touched[field] && formik.errors[field]
        ? <div className="invalid-feedback" id={`profile_${field}_error`}>{formik.errors[field]}</div>
        : null

    return (
        <>
            <MetaData title="Update Profile" />
            <main className="pizzaro-commerce-page pizzaro-profile-page pizzaro-profile-edit-page">
                <div className="pizzaro-profile-content">
                    <header className="pizzaro-profile-heading">
                        <h1>Edit profile</h1>
                        <p>Keep your contact and delivery details up to date.</p>
                    </header>

                    <form className="pizzaro-profile-form" onSubmit={formik.handleSubmit} encType="multipart/form-data" noValidate>
                        <section className="pizzaro-profile-form-section">
                            <header className="pizzaro-profile-form-heading">
                                <h2>Personal details</h2>
                                <p>These details are used for your account and delivery.</p>
                            </header>

                            <div className="pizzaro-profile-form-grid">
                                <div className="pizzaro-profile-field">
                                    <label htmlFor="profile_name">Full name</label>
                                    <input id="profile_name" name="name" autoComplete="name"
                                        className={`form-control ${fieldError('name') ? 'is-invalid' : ''}`}
                                        aria-invalid={Boolean(fieldError('name'))}
                                        aria-describedby={fieldError('name') ? 'profile_name_error' : undefined}
                                        value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                    {fieldError('name')}
                                </div>
                                <div className="pizzaro-profile-field">
                                    <label htmlFor="profile_email">Email address</label>
                                    <input id="profile_email" name="email" type="email" autoComplete="email"
                                        className={`form-control ${fieldError('email') ? 'is-invalid' : ''}`}
                                        aria-invalid={Boolean(fieldError('email'))}
                                        aria-describedby={fieldError('email') ? 'profile_email_error' : undefined}
                                        value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                    {fieldError('email')}
                                </div>
                                <div className="pizzaro-profile-field">
                                    <label htmlFor="profile_phone">Phone number</label>
                                    <input id="profile_phone" name="phoneNo" type="tel" autoComplete="tel"
                                        placeholder="+63 912 345 6789"
                                        className={`form-control ${fieldError('phoneNo') ? 'is-invalid' : ''}`}
                                        aria-invalid={Boolean(fieldError('phoneNo'))}
                                        aria-describedby={fieldError('phoneNo') ? 'profile_phoneNo_error' : undefined}
                                        value={formik.values.phoneNo} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                    {fieldError('phoneNo')}
                                </div>
                                <div className="pizzaro-profile-field is-wide">
                                    <label htmlFor="profile_address">Delivery address</label>
                                    <textarea id="profile_address" name="address" autoComplete="street-address" rows="3"
                                        placeholder="House number, street, barangay, city"
                                        className={`form-control ${fieldError('address') ? 'is-invalid' : ''}`}
                                        aria-invalid={Boolean(fieldError('address'))}
                                        aria-describedby={fieldError('address') ? 'profile_address_error' : undefined}
                                        value={formik.values.address} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                    {fieldError('address')}
                                </div>
                            </div>
                        </section>

                        <section className="pizzaro-profile-form-section pizzaro-profile-photo-section">
                            <header className="pizzaro-profile-form-heading">
                                <h2>Profile photo</h2>
                                <p>Choose a clear photo so you can recognize your account.</p>
                            </header>
                            <div className="pizzaro-profile-photo-control">
                                {avatarPreview || user?.avatar?.url
                                    ? <img src={avatarPreview || user.avatar.url}
                                        className="pizzaro-profile-photo-preview" alt="Profile photo preview" />
                                    : <span className="pizzaro-profile-photo-preview pizzaro-profile-photo-fallback"
                                        aria-label="Profile photo preview">{initials || 'U'}</span>}
                                <label className="pizzaro-profile-upload" htmlFor="avatar_upload">
                                    <input id="avatar_upload" name="avatar" type="file"
                                        accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} />
                                    <span className="pizzaro-profile-upload-mark">
                                        <img src="/images/pizzaro-mark.svg" alt="" />
                                    </span>
                                    <span className="pizzaro-profile-upload-copy">
                                        <strong>{avatar?.name || 'Choose a profile photo'}</strong>
                                        <span>{avatar ? 'Selected and ready to save' : 'JPEG, PNG, or WebP · up to 5 MB'}</span>
                                    </span>
                                    <span className="pizzaro-profile-upload-action">Browse</span>
                                </label>
                            </div>
                        </section>

                        <footer className="pizzaro-profile-form-actions">
                            <Link to="/me" className="pizzaro-profile-secondary">Cancel</Link>
                            <button type="submit" className="pizzaro-profile-save"
                                disabled={loading || formik.isSubmitting || !formik.isValid}>
                                {loading || formik.isSubmitting ? 'Saving…' : 'Save changes'}
                            </button>
                        </footer>
                    </form>
                </div>
            </main>
        </>
    )
}

export default UpdateProfile
