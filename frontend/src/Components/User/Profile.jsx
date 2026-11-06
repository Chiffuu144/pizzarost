import { Link, Navigate } from 'react-router-dom'
import Loader from '../Layout/Loader'
import MetaData from '../Layout/MetaData'

import { useSelector } from 'react-redux'

const Profile = () => {
    const { user, loading } = useSelector(state => state.auth)
    const initials = user?.name?.trim().split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()

    if (!loading && !user) {
        return <Navigate to="/login" replace />
    }

    const joinedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : '—'
    const details = [
        { label: 'Full name', value: user?.name || '—' },
        { label: 'Email address', value: user?.email || '—' },
        { label: 'Phone number', value: user?.phoneNo || 'Not added yet', isMissing: !user?.phoneNo },
        { label: 'Delivery address', value: user?.address || 'Not added yet', isMissing: !user?.address },
        { label: 'Member since', value: joinedDate }
    ]

    // const [loading, setLoading] = useState(true)
    // const [user, setUser] = useState({})


    // const getProfile = async () => {
    //     const config = {
    //         headers: {
    //             'Authorization': `Bearer ${getToken()}`
    //         }
    //     }
    //     try {
    //         const { data } = await axios.get(`http://localhost:4001/api/v1/me`, config)
    //         console.log(data.user)
    //         setUser(data.user)
    //         setLoading(false)
    //     } catch (error) {
    //         console.log(error)
    //         toast.error("invalid user or password", {
    //             position: 'bottom-center'
    //         })
    //     }

    // }

    // useEffect(() => {

    //     getProfile()

    // }, [])
    return (
        <>
            {loading ? <Loader /> : (
                <>
                    <MetaData title="My profile | Pizzaro" />

                    <main className="pizzaro-commerce-page pizzaro-profile-page">
                        <div className="pizzaro-profile-content">
                            <header className="pizzaro-profile-heading">
                                <h1>My profile</h1>
                                <p>Your account and delivery details, all in one place.</p>
                            </header>

                            <section className="pizzaro-profile-panel" aria-label="Profile details">
                                <div className="pizzaro-profile-identity">
                                    <figure className="pizzaro-profile-avatar">
                                        {user?.avatar?.url
                                            ? <img src={user.avatar.url} alt={`${user?.name || 'User'} profile`} />
                                            : <span className="pizzaro-profile-avatar-fallback" aria-label="Profile photo not set">{initials || 'U'}</span>}
                                    </figure>
                                    <div className="pizzaro-profile-identity-copy">
                                        <h2>{user?.name}</h2>
                                        <p>{user?.email}</p>
                                    </div>
                                    <Link to="/me/update" className="pizzaro-profile-edit">
                                        Edit profile
                                    </Link>
                                </div>

                                <div className="pizzaro-profile-details">
                                    <h2>Personal details</h2>
                                    <dl>
                                        {details.map(({ label, value, isMissing }) => (
                                            <div className="pizzaro-profile-detail" key={label}>
                                                <dt>{label}</dt>
                                                <dd className={isMissing ? 'is-missing' : ''}>{value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                    {(!user?.phoneNo || !user?.address) && (
                                        <p className="pizzaro-profile-hint">
                                            Add your phone number and delivery address to make checkout quicker.
                                        </p>
                                    )}
                                </div>

                                <nav className="pizzaro-profile-actions" aria-label="Profile actions">
                                    {user.role !== 'admin' && (
                                        <Link to="/orders/me" className="pizzaro-profile-secondary">
                                            My orders
                                        </Link>
                                    )}
                                    <Link to="/password/update" className="pizzaro-profile-secondary">
                                        Change password
                                    </Link>
                                </nav>
                            </section>
                        </div>
                    </main>
                </>
            )}
        </>
    )
}

export default Profile