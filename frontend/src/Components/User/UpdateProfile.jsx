import { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import MetaData from '../Layout/MetaData'
import { useNavigate } from 'react-router-dom'
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
        ? <div className="invalid-feedback">{formik.errors[field]}</div>
        : null

    return (
        <>
            <MetaData title="Update Profile" />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={formik.handleSubmit} encType="multipart/form-data" noValidate>
                        <h1 className="mt-2 mb-4">Update Profile</h1>
                        <div className="form-group">
                            <label htmlFor="profile_name">Name</label>
                            <input id="profile_name" name="name" autoComplete="name"
                                className={`form-control ${fieldError('name') ? 'is-invalid' : ''}`}
                                value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            {fieldError('name')}
                        </div>
                        <div className="form-group">
                            <label htmlFor="profile_email">Email</label>
                            <input id="profile_email" name="email" type="email" autoComplete="email"
                                className={`form-control ${fieldError('email') ? 'is-invalid' : ''}`}
                                value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            {fieldError('email')}
                        </div>
                        <div className="form-group">
                            <label htmlFor="profile_phone">Contact number</label>
                            <input id="profile_phone" name="phoneNo" type="tel" autoComplete="tel"
                                className={`form-control ${fieldError('phoneNo') ? 'is-invalid' : ''}`}
                                value={formik.values.phoneNo} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            {fieldError('phoneNo')}
                        </div>
                        <div className="form-group">
                            <label htmlFor="profile_address">Address</label>
                            <textarea id="profile_address" name="address" autoComplete="street-address" rows="3"
                                className={`form-control ${fieldError('address') ? 'is-invalid' : ''}`}
                                value={formik.values.address} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            {fieldError('address')}
                        </div>
                        <div className="form-group">
                            <label htmlFor="avatar_upload">Profile photo</label>
                            <div className="d-flex align-items-center">
                                <img src={avatarPreview || user?.avatar?.url || '/images/default_avatar.jpg'} className="avatar rounded-circle mr-3" alt="Avatar preview" />
                                <input id="avatar_upload" name="avatar" type="file" className="form-control"
                                    accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} />
                            </div>
                            <small className="form-text text-muted">Optional; JPEG, PNG, or WebP up to 5 MB.</small>
                        </div>
                        <button type="submit" className="btn update-btn btn-block mt-4 mb-3"
                            disabled={loading || formik.isSubmitting || !formik.isValid}>
                            {loading || formik.isSubmitting ? 'Saving...' : 'Save profile'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default UpdateProfile
