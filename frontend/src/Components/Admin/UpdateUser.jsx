import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import AdminPageLayout from './AdminPageLayout'
import { clearErrors, getUserDetails, updateUser } from '../../actions/userActions'
import { UPDATE_USER_RESET } from '../../constants/userConstants'

const UpdateUserForm = ({ user, loading }) => {
    const dispatch = useDispatch()
    const [name, setName] = useState(user.name)
    const [email, setEmail] = useState(user.email)
    const [role, setRole] = useState(user.role === 'admin' ? 'admin' : 'user')

    const submitHandler = event => {
        event.preventDefault()
        dispatch(updateUser(user._id, {
            name: name.trim(),
            email: email.trim(),
            role
        }))
    }

    return (
        <form className="pizzaro-admin-form-card pizzaro-admin-user-form" onSubmit={submitHandler}>
            <header className="pizzaro-admin-form-card-heading">
                <h2>Account details</h2>
                <p>Update this person’s profile and administrator access.</p>
            </header>
            <div className="pizzaro-admin-form-grid">
                <div className="form-group">
                    <label htmlFor="name_field">Name</label>
                    <input
                        type="text"
                        id="name_field"
                        className="form-control"
                        value={name}
                        maxLength={30}
                        required
                        onChange={event => setName(event.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email_field">Email</label>
                    <input
                        type="email"
                        id="email_field"
                        className="form-control"
                        value={email}
                        required
                        onChange={event => setEmail(event.target.value)}
                    />
                </div>
                <div className="form-group is-wide">
                    <label htmlFor="role_field">Role</label>
                    <select
                        id="role_field"
                        className="form-control"
                        value={role}
                        onChange={event => setRole(event.target.value)}
                    >
                        <option value="user">Customer</option>
                        <option value="admin">Administrator</option>
                    </select>
                    <small>Administrators can manage products, orders, and customer accounts.</small>
                </div>
            </div>
            <footer className="pizzaro-admin-form-actions">
                <Link to="/admin/users" className="pizzaro-admin-secondary-action">Cancel</Link>
                <button type="submit" className="pizzaro-admin-primary-action" disabled={loading}>
                    {loading ? 'Saving…' : 'Save changes'}
                </button>
            </footer>
        </form>
    )
}

const UpdateUser = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { id } = useParams()
    const { error, isUpdated, loading } = useSelector(state => state.user)
    const { user } = useSelector(state => state.userDetails)
    const currentUser = user?._id === id ? user : null

    useEffect(() => {
        if (!currentUser) dispatch(getUserDetails(id))
        if (error) {
            toast.error(error, { position: 'bottom-right' })
            dispatch(clearErrors())
        }
        if (isUpdated) {
            toast.success('User updated successfully', { position: 'bottom-right' })
            navigate('/admin/users')
            dispatch({ type: UPDATE_USER_RESET })
        }
    }, [currentUser, dispatch, error, id, isUpdated, navigate])

    return (
        <AdminPageLayout
            title="Edit user"
            description={currentUser ? `Update access and details for ${currentUser.name}.` : 'Loading account details…'}
            actions={<Link to="/admin/users" className="pizzaro-admin-secondary-action">Back to users</Link>}
        >
            {currentUser ? (
                <UpdateUserForm user={currentUser} loading={loading} />
            ) : (
                <p className="pizzaro-admin-page-loading" role="status">Loading user details…</p>
            )}
        </AdminPageLayout>
    )
}

export default UpdateUser
