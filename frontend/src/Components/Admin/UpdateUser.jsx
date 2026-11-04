import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'
import { clearErrors, getUserDetails, updateUser } from '../../actions/userActions'
import { UPDATE_USER_RESET } from '../../constants/userConstants'

const UpdateUserForm = ({ user }) => {
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
        <form className="shadow-lg" onSubmit={submitHandler}>
            <h1 className="mt-2 mb-5">Update User</h1>
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
            <div className="form-group">
                <label htmlFor="role_field">Role</label>
                <select
                    id="role_field"
                    className="form-control"
                    value={role}
                    onChange={event => setRole(event.target.value)}
                >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                </select>
            </div>
            <button type="submit" className="btn update-btn btn-block mt-4 mb-3">Update</button>
        </form>
    )
}

const UpdateUser = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { id } = useParams()
    const { error, isUpdated } = useSelector(state => state.user)
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
        <>
            <MetaData title="Update User" />
            <div className="row">
                <div className="col-12 col-md-2"><Sidebar /></div>
                <div className="col-12 col-md-10">
                    <div className="row wrapper">
                        <div className="col-10 col-lg-5">
                            {currentUser ? <UpdateUserForm user={currentUser} /> : <p role="status">Loading user...</p>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UpdateUser
