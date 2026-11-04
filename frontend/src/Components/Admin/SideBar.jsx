import { NavLink, useNavigate } from 'react-router-dom'
import {
    AssessmentOutlined,
    ChevronRight,
    DashboardOutlined,
    ExitToAppRounded,
    HomeOutlined,
    Inventory2Outlined,
    LocalShippingOutlined,
    PeopleAltOutlined,
    ReviewsOutlined,
} from '@mui/icons-material'
import { Avatar, IconButton, Tooltip } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { logout } from '../../actions/userActions'

const navigation = [
    { label: 'Home', to: '/', icon: HomeOutlined },
    { label: 'Overview', to: '/dashboard', icon: DashboardOutlined },
    { label: 'Orders', to: '/admin/orders', icon: LocalShippingOutlined },
    { label: 'Products', to: '/admin/products', icon: Inventory2Outlined },
    { label: 'Users', to: '/admin/users', icon: PeopleAltOutlined },
    { label: 'Analytics', to: '/dashboard', icon: AssessmentOutlined },
    { label: 'Reviews', to: '/admin/reviews', icon: ReviewsOutlined }
]

const Sidebar = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector(state => state.auth)
    const name = user?.name?.trim() || 'Admin'
    const initials = name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()

    const handleLogout = async () => {
        try {
            await dispatch(logout())
            navigate('/login')
            toast.success('Logged out successfully', { position: 'bottom-right' })
        } catch (error) {
            toast.error(error.message || 'Logout failed', { position: 'bottom-right' })
        }
    }

    return (
        <aside className="sidebar-wrapper pizzaro-admin-sidebar">
            <nav id="pizzaro-admin-sidebar" aria-label="Admin navigation">
                <NavLink to="/dashboard" className="admin-brand">
                    <img className="admin-brand-logo" src="/images/pizzaro-mark.svg" alt="" />
                    <span><strong>Pizzaro</strong><small>Admin User</small></span>
                </NavLink>
                <p className="admin-nav-heading">Menu</p>
                <ul className="admin-nav-list">
                    {navigation.map(({ label, to, icon: Icon }) => (
                        <li key={label}>
                            <NavLink to={to} className={({ isActive }) => isActive && label !== 'Analytics' ? 'active' : ''}>
                                <Icon fontSize="small" />
                                <span>{label}</span>
                                {label === 'Overview' && <ChevronRight className="admin-nav-arrow" fontSize="small" />}
                            </NavLink>
                        </li>
                    ))}
                </ul>
                <div className="admin-sidebar-user">
                    <Avatar className="admin-user-avatar" src={user?.avatar?.url} alt={name}>
                        {initials}
                    </Avatar>
                    <span className="admin-sidebar-user-copy">
                        <strong title={name}>{name}</strong>
                        <small>{user?.role === 'admin' ? 'Store administrator' : 'Store team'}</small>
                    </span>
                    <Tooltip title="Log out">
                        <IconButton
                            className="admin-sidebar-logout"
                            aria-label="Log out"
                            onClick={handleLogout}
                            size="small"
                        >
                            <ExitToAppRounded fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            </nav>
        </aside>
    )
}

export default Sidebar
