import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import AdminPageLayout from './AdminPageLayout'
import { allUsers, clearErrors, deleteUser, updateUserStatus } from '../../actions/userActions'
import {
    DELETE_USER_RESET,
    UPDATE_USER_STATUS_RESET
} from '../../constants/userConstants'

const userFilters = [
    { key: 'all', label: 'All accounts' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Deactivated' }
]

const UsersList = () => {
    const dispatch = useDispatch()
    const { loading, error: listError, users = [] } = useSelector(state => state.allUsers)
    const {
        error: actionError,
        isDeleted,
        isStatusUpdated,
        statusUpdatedUser,
        statusUpdatingId
    } = useSelector(state => state.user || {})
    const { user: currentUser } = useSelector(state => state.auth || {})
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    const [pendingDeactivation, setPendingDeactivation] = useState(null)

    useEffect(() => {
        dispatch(allUsers())
    }, [dispatch])

    useEffect(() => {
        if (listError || actionError) {
            toast.error(listError || actionError, { position: 'bottom-right' })
            dispatch(clearErrors())
        }
    }, [actionError, dispatch, listError])

    useEffect(() => {
        if (isDeleted) {
            toast.success('User deleted successfully', { position: 'bottom-right' })
            dispatch({ type: DELETE_USER_RESET })
            dispatch(allUsers())
        }
    }, [dispatch, isDeleted])

    useEffect(() => {
        if (isStatusUpdated && statusUpdatedUser) {
            toast.success(
                `${statusUpdatedUser.name} is now ${statusUpdatedUser.isActive ? 'active' : 'deactivated'}`,
                { position: 'bottom-right' }
            )
            dispatch({ type: UPDATE_USER_STATUS_RESET })
        }
    }, [dispatch, isStatusUpdated, statusUpdatedUser])

    const activeCount = users.filter(user => user.isActive !== false).length
    const inactiveCount = users.length - activeCount
    const filteredUsers = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase()

        return users.filter(user => {
            const isActive = user.isActive !== false
            const matchesFilter = filter === 'all' ||
                (filter === 'active' && isActive) ||
                (filter === 'inactive' && !isActive)
            const matchesSearch = !normalizedSearch ||
                `${user.name || ''} ${user.email || ''}`.toLocaleLowerCase().includes(normalizedSearch)

            return matchesFilter && matchesSearch
        })
    }, [filter, search, users])

    const handleStatusToggle = user => {
        if (user.isActive === false) {
            dispatch(updateUserStatus(user._id, true))
            return
        }

        setPendingDeactivation(user)
    }

    const confirmDeactivation = () => {
        if (!pendingDeactivation) return
        dispatch(updateUserStatus(pendingDeactivation._id, false))
        setPendingDeactivation(null)
    }

    const handleDelete = id => dispatch(deleteUser(id))

    return (
        <AdminPageLayout title="User access" description="Manage customer and administrator access.">
            <section className="pizzaro-users-overview" aria-label="Account totals">
                <div>
                    <span>Total accounts</span>
                    <strong>{users.length}</strong>
                </div>
                <div>
                    <span>Active</span>
                    <strong className="is-positive">{activeCount}</strong>
                </div>
                <div>
                    <span>Deactivated</span>
                    <strong className={inactiveCount ? 'is-negative' : ''}>{inactiveCount}</strong>
                </div>
            </section>

            <div className="pizzaro-users-filters" role="group" aria-label="Filter users by access">
                {userFilters.map(({ key, label }) => {
                    const count = key === 'all' ? users.length : key === 'active' ? activeCount : inactiveCount
                    return (
                        <button
                            key={key}
                            type="button"
                            className={`pizzaro-users-filter${filter === key ? ' is-selected' : ''}`}
                            aria-pressed={filter === key}
                            onClick={() => setFilter(key)}
                        >
                            {label}<span>{count}</span>
                        </button>
                    )
                })}
            </div>

            <div className="pizzaro-users-toolbar">
                <label className="pizzaro-users-search">
                    <span className="pizzaro-users-sr-only">Search users by name or email</span>
                    <svg aria-hidden="true" viewBox="0 0 20 20">
                        <circle cx="8.5" cy="8.5" r="5.5" />
                        <path d="m13 13 4 4" />
                    </svg>
                    <input
                        type="search"
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Search name or email"
                    />
                </label>
                <p aria-live="polite">
                    Showing <strong>{filteredUsers.length}</strong> of {users.length} accounts
                </p>
            </div>

            <div className="pizzaro-users-table-wrap">
                {loading ? (
                    <p className="pizzaro-users-state" role="status">Loading accounts…</p>
                ) : filteredUsers.length === 0 ? (
                    <p className="pizzaro-users-state" role="status">
                        {users.length === 0 ? 'No accounts to manage yet.' : 'No accounts match this search.'}
                    </p>
                ) : (
                    <table className="pizzaro-users-table">
                        <thead>
                            <tr>
                                <th scope="col">User</th>
                                <th className="pizzaro-users-role-column" scope="col">Role</th>
                                <th className="pizzaro-users-status-column" scope="col">Access</th>
                                <th scope="col"><span className="pizzaro-users-sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(account => {
                                const isActive = account.isActive !== false
                                const isCurrentUser = String(currentUser?._id) === String(account._id)
                                const isUpdating = statusUpdatingId === account._id
                                const initials = (account.name || '?')
                                    .trim()
                                    .split(/\s+/)
                                    .map(part => part[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()

                                return (
                                    <tr key={account._id}>
                                        <td>
                                            <div className="pizzaro-users-identity">
                                                <Avatar
                                                    className="pizzaro-users-avatar"
                                                    src={account.avatar?.url}
                                                    alt=""
                                                >
                                                    {initials}
                                                </Avatar>
                                                <div className="pizzaro-users-identity-copy">
                                                    <strong>{account.name}</strong>
                                                    <span>{account.email}</span>
                                                    <span className={`pizzaro-users-mobile-status${isActive ? ' is-active' : ' is-inactive'}`}>
                                                        {isActive ? 'Active' : 'Deactivated'}
                                                        <span className="pizzaro-users-mobile-role">{account.role === 'admin' ? ' · Admin' : ' · Customer'}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="pizzaro-users-role-column">
                                            <span className={`pizzaro-admin-role${account.role === 'admin' ? ' is-admin' : ''}`}>
                                                {account.role === 'admin' ? 'Administrator' : 'Customer'}
                                            </span>
                                        </td>
                                        <td className="pizzaro-users-status-column">
                                            <span className={`pizzaro-users-status${isActive ? ' is-active' : ' is-inactive'}`}>
                                                <span aria-hidden="true" />
                                                {isActive ? 'Active' : 'Deactivated'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="pizzaro-users-actions">
                                                <Link
                                                    to={`/admin/user/${account._id}`}
                                                    className="pizzaro-admin-row-action"
                                                    aria-label={`Edit ${account.name}`}
                                                    title="Edit user"
                                                >
                                                    <i className="fa fa-pencil" aria-hidden="true" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    className={`pizzaro-users-access-toggle${isActive ? ' is-active' : ''}`}
                                                    role="switch"
                                                    aria-checked={isActive}
                                                    aria-label={`${isActive ? 'Deactivate' : 'Activate'} ${account.name}`}
                                                    title={isActive ? 'Deactivate account' : 'Activate account'}
                                                    disabled={isUpdating || isCurrentUser}
                                                    onClick={() => handleStatusToggle(account)}
                                                >
                                                    <span />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="pizzaro-admin-row-action is-danger"
                                                    aria-label={`Delete ${account.name}`}
                                                    title="Delete user"
                                                    onClick={() => handleDelete(account._id)}
                                                >
                                                    <i className="fa fa-trash" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <Dialog
                open={Boolean(pendingDeactivation)}
                onClose={() => {
                    if (statusUpdatingId !== pendingDeactivation?._id) setPendingDeactivation(null)
                }}
                aria-labelledby="pizzaro-deactivate-title"
                aria-describedby="pizzaro-deactivate-description"
                slotProps={{ paper: { className: 'pizzaro-users-dialog' } }}
            >
                <DialogTitle id="pizzaro-deactivate-title">Deactivate this account?</DialogTitle>
                <DialogContent id="pizzaro-deactivate-description">
                    {pendingDeactivation && (
                        <p>
                            <strong>{pendingDeactivation.name}</strong> will no longer be able to sign in or place orders.
                            You can reactivate the account at any time.
                        </p>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setPendingDeactivation(null)}
                        disabled={statusUpdatingId === pendingDeactivation?._id}
                    >
                        Keep active
                    </Button>
                    <Button
                        className="pizzaro-users-dialog-confirm"
                        onClick={confirmDeactivation}
                        disabled={statusUpdatingId === pendingDeactivation?._id}
                    >
                        {statusUpdatingId === pendingDeactivation?._id ? 'Deactivating…' : 'Deactivate account'}
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminPageLayout>
    )
}

export default UsersList
