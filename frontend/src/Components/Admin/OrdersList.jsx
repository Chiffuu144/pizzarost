import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import AdminPageLayout from './AdminPageLayout'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid, } from '@mui/x-data-grid'
// import { getToken } from '../Utils/helpers'
// import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { allOrders, clearErrors, deleteOrder } from '../../actions/orderActions'
import { DELETE_ORDER_RESET } from '../../constants/orderConstants'
import { formatCurrency } from '../../utils/formatCurrency'
import { displayOrderStatus } from '../../utils/orderStatus'


const OrdersList = () => {
    // const [loading, setLoading] = useState(true)
    // const [error, setError] = useState('')
    // const [allOrders, setAllOrders] = useState([])
    // const [isDeleted, setIsDeleted] = useState(false)
    const dispatch = useDispatch();
    const { loading, error, orders } = useSelector(state => state.allOrders);
    const { isDeleted } = useSelector(state => state.order)
    const errMsg = (message = '') => toast.error(message, {
        position: 'bottom-right'
    });
    const successMsg = (message = '') => toast.success(message, {
        position: 'bottom-right'
    });

    // const listOrders = async () => {
    //     try {
    //         const config = {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }
    //         const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/orders`, config)
    //         setAllOrders(data.orders)
    //         setLoading(false)
    //     } catch (error) {
    //         setError(error.response.data.message)
    //     }
    // }
    // const deleteOrder = async (id) => {
    //     try {
    //         const config = {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }
    //         const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/order/${id}`, config)
    //         setIsDeleted(data.success)
    //         setLoading(false)
    //     } catch (error) {
    //         setError(error.response.data.message)

    //     }
    // }
    // useEffect(() => {
    //     listOrders()
    //     if (error) {
    //         errMsg(error)
    //         setError('')
    //     }
    //     if (isDeleted) {
    //         successMsg('Order deleted successfully');
    //         navigate('/admin/orders');
    //     }
    // }, [error, isDeleted])

    useEffect(() => {
        dispatch(allOrders())
        if (error) {
            errMsg(error)
            dispatch(clearErrors())

        }
        if (isDeleted) {
            successMsg('Order deleted successfully');
            dispatch({ type: DELETE_ORDER_RESET })
            // navigate('/admin/orders');
        }
    }, [dispatch, error, isDeleted])
    const deleteOrderHandler = (id) => {
        dispatch(deleteOrder(id))
    }

    const columns = [
        {
            field: 'id',
            headerName: 'Order ID',
            flex: 1.3,
            minWidth: 210,
            renderCell: params => <span className="pizzaro-admin-id" title={params.value}>{params.value}</span>
        },
        {
            field: 'numofItems',
            headerName: 'Number of Items',
            flex: 0.9,
            minWidth: 150,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'amount',
            headerName: 'Amount',
            flex: 0.8,
            minWidth: 140,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'status',
            headerName: 'Status',
            flex: 0.9,
            minWidth: 150,
            renderCell: params => (
                <span className={`pizzaro-order-status ${displayOrderStatus(params.value) === 'Completed'
                    ? 'is-completed'
                    : params.value === 'Cancelled'
                        ? 'is-cancelled'
                        : 'is-pending'}`}>
                    {displayOrderStatus(params.value)}
                </span>
            )
        },

        {
            field: 'actions',
            headerName: 'Actions',
            flex: 0.7,
            minWidth: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (

                <>
                    <Link to={`/admin/order/${params.id}`} className="pizzaro-admin-row-action" aria-label={`View order ${params.id}`}>
                        <i className="fa fa-eye" aria-hidden="true"></i>
                    </Link>
                    <button className="pizzaro-admin-row-action is-danger" aria-label={`Delete order ${params.id}`} onClick={() => deleteOrderHandler(params.id)}>
                        <i className="fa fa-trash" aria-hidden="true"></i>
                    </button>
                </>
            )
        }
    ];
    const rows = orders.map(order => ({
        id: order._id,
        numofItems: order.orderItems?.length || 0,
        amount: formatCurrency(order.totalPrice),
        status: displayOrderStatus(order.orderStatus),
    }));

    return (
        <>
            <AdminPageLayout title="All Orders" description="Review order totals, fulfillment, and customer activity.">
                <div className="pizzaro-admin-list-summary">
                    <span>{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
                </div>
                {loading ? (
                    <p className="pizzaro-admin-page-loading" role="status">Loading orders…</p>
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

export default OrdersList