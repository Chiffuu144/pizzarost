import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Loader from '../Layout/Loader'

const ProtectedRoute = ({ children, isAdmin = false }) => {
    const { isAuthenticated, loading, user } = useSelector(state => state.auth)

    if (loading) {
        return <Loader />
    }

    if (!isAuthenticated || !user) {
        return <Navigate to='/login' />
    }

    if (isAdmin && user.role !== 'admin') {
        return <Navigate to='/' />
    }

    return children
};

export default ProtectedRoute;