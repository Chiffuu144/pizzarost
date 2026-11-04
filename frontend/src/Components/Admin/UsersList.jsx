import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import 'react-toastify/dist/ReactToastify.css';

import AdminPageLayout from './AdminPageLayout'

// import axios from 'axios';
// import { getToken, errMsg, successMsg } from '../Utils/helpers';
import { DataGrid, } from '@mui/x-data-grid'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useDispatch, useSelector } from 'react-redux'
import { allUsers, deleteUser, clearErrors } from '../../actions/userActions'
import { DELETE_USER_RESET } from '../../constants/userConstants'


const UsersList = () => {
    const dispatch = useDispatch();
    const { loading, error, users } = useSelector(state => state.allUsers);
    const { isDeleted } = useSelector(state => state.user)
    const errMsg = (message = '') => toast.error(message, {
        position: 'bottom-right'
    });
    const successMsg = (message = '') => toast.success(message, {
        position: 'bottom-right'
    });
    // const [loading, setLoading] = useState(true)
    // const [error, setError] = useState('')
    // const [allUsers, setAllUsers] = useState([])
    // const [isDeleted, setIsDeleted] = useState('')
    // const config = {
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${getToken()}`
    //     }
    // }
    // const listUsers = async () => {
    //     try {

    //         const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/users`, config)
    //         setAllUsers(data.users)
    //         setLoading(false)

    //     } catch (error) {
    //         setError(error.response.data.message)

    //     }
    // }
    // const deleteUser = async (id) => {
    //     try {
    //         const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/user/${id}`, config)
    //         setIsDeleted(data.success)
    //         setLoading(false)

    //     } catch (error) {
    //         setError(error.response.data.message)

    //     }
    // }

    // useEffect(() => {
    //     listUsers();
    //     if (error) {
    //         errMsg(error);
    //         setError('')
    //     }
    //     if (isDeleted) {
    //         successMsg('User deleted successfully');
    //         navigate('/admin/users');

    //     }

    // }, [error, isDeleted,])

    useEffect(() => {
        dispatch(allUsers());

        if (error) {
            errMsg(error);
            dispatch(clearErrors())
        }

        if (isDeleted) {
            successMsg('User deleted successfully');
            // navigate('/admin/users');
            dispatch({ type: DELETE_USER_RESET })
        }

    }, [dispatch, error, isDeleted])


    const deleteUserHandler = (id) => {
        dispatch(deleteUser(id))
    }

    const columns = [
        {
            field: 'id',
            headerName: 'User ID',
            width: 190,
            renderCell: params => <span className="pizzaro-admin-id" title={params.value}>{params.value}</span>
        },
        {
            field: 'name',
            headerName: 'Name',
            flex: 0.8,
            minWidth: 150
        },
        {
            field: 'email',
            headerName: 'Email',
            flex: 1,
            minWidth: 210
        },
        {
            field: 'role',
            headerName: 'Role',
            width: 130,
            renderCell: params => <span className={`pizzaro-admin-role${params.value === 'admin' ? ' is-admin' : ''}`}>{params.value}</span>
        },

        {
            field: 'actions',
            headerName: 'Actions',
            width: 110,
            sortable: false,
            filterable: false,
            renderCell: (params) => (

                <>
                    <Link to={`/admin/user/${params.id}`} className="pizzaro-admin-row-action" aria-label={`Edit user ${params.id}`}>
                        <i className="fa fa-pencil" aria-hidden="true"></i>
                    </Link>
                    <button className="pizzaro-admin-row-action is-danger" aria-label={`Delete user ${params.id}`} onClick={() => deleteUserHandler(params.id)}>
                        <i className="fa fa-trash" aria-hidden="true"></i>
                    </button>
                </>
            )
        }
    ];
    const rows = users.map(user => ({
        id: user._id,
        name: user.name,

        email: user.email,
        role: user.role === 'admin' ? 'admin' : 'user',
    }));

    return (
        <>
            <AdminPageLayout title="All Users" description="Manage customer accounts and store access.">
                <div className="pizzaro-admin-list-summary">
                    <span>{users.length} {users.length === 1 ? 'user' : 'users'}</span>
                </div>
                {loading ? (
                    <p className="pizzaro-admin-page-loading" role="status">Loading users…</p>
                ) : (
                    <div className="pizzaro-orders-grid">
                        <DataGrid
                            className="pizzaro-admin-grid"
                            rows={rows}
                            columns={columns}
                            initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
                            pageSizeOptions={[5, 10, 25]}
                            disableRowSelectionOnClick
                            getRowId={row => row.id}
                            showToolbar
                            autoHeight
                        />
                    </div>
                )}
            </AdminPageLayout>
        </>
    )
}

export default UsersList
