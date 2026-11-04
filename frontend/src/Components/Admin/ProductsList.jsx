import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'


import AdminPageLayout from './AdminPageLayout'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid, } from '@mui/x-data-grid'
import { useDispatch, useSelector } from 'react-redux'
import {
    getAdminProducts,
    deleteProduct,
    deleteProducts,
    clearErrors,
} from '../../actions/productActions'
import { DELETE_PRODUCT_RESET } from '../../constants/productConstants'
import { formatCurrency } from '../../utils/formatCurrency'

const ProductsList = () => {
    // const [products, setProducts] = useState([])
    // const [error, setError] = useState('')
    const dispatch = useDispatch();
    const { loading, error, products } = useSelector(state => state.products)
    const { error: deleteError, isDeleted } = useSelector(state => state.product)
    const [selectionModel, setSelectionModel] = useState({ type: 'include', ids: new Set() })
    // const getAdminProducts = async () => {
    //     try {

    //         const config = {
    //             headers: {
    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }

    //         const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/products`, config)
    //         console.log(data)
    //         setProducts(data.products)
    //         setLoading(false)
    //     } catch (error) {

    //         setError(error.response.data.message)

    //     }
    // }
    // useEffect(() => {
    //     getAdminProducts()

    //     if (error) {
    //         toast.error(error, {
    //             position: 'bottom-right'
    //         });
    //     }

    //     if (deleteError) {
    //         toast.error(deleteError, {
    //             position: 'bottom-right'
    //         });
    //     }

    //     if (isDeleted) {
    //         toast.success('Product deleted successfully', {
    //             position: 'bottom-right'
    //         })
    //         navigate('/admin/products');

    //     }

    // }, [error, deleteError, isDeleted,])

    // const deleteProduct = async (id) => {
    //     try {
    //         const config = {
    //             headers: {
    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }
    //         const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/product/${id}`, config)

    //         setIsDeleted(data.success)
    //         setLoading(false)
    //     } catch (error) {
    //         setDeleteError(error.response.data.message)

    //     }
    // }
    const deleteProductHandler = async id => {
        if (window.confirm('Delete this product and all of its reviews and photos?')) {
            try {
                const result = await dispatch(deleteProduct(id))
                setSelectionModel({ type: 'include', ids: new Set() })
                if (result.cleanupWarning) toast.warning(result.cleanupWarning)
            } catch (error) {
                toast.error(error.response?.data?.message || error.message || 'Unable to delete this product')
            }
        }
    }

    useEffect(() => {
        dispatch(getAdminProducts())
    }, [dispatch])

    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
            dispatch(clearErrors())
        }

        if (deleteError) {
            toast.error(deleteError, {
                position: 'bottom-right'
            });
            dispatch(clearErrors())
        }

    }, [error, deleteError, dispatch])

    useEffect(() => {
        if (isDeleted) {
            toast.success('Selected product(s) deleted successfully', {
                position: 'bottom-right'
            })
            dispatch(getAdminProducts())
            dispatch({ type: DELETE_PRODUCT_RESET })
        }
    }, [dispatch, isDeleted])

    const deleteSelected = async () => {
        const ids = [...selectionModel.ids]
        if (!ids.length || !window.confirm(`Delete ${ids.length} selected product(s), including their reviews and photos?`)) {
            return
        }
        try {
            const result = await dispatch(deleteProducts(ids))
            setSelectionModel({ type: 'include', ids: new Set() })
            if (result.cleanupWarning) {
                toast.warning(result.cleanupWarning)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Unable to delete selected products')
        }
    }

    const columns = [
        {
            field: 'id',
            headerName: 'Product ID',
            width: 190,
            renderCell: params => <span className="pizzaro-admin-id" title={params.value}>{params.value}</span>
        },
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
            minWidth: 180
        },
        {
            field: 'price',
            headerName: 'Price',
            width: 130,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'stock',
            headerName: 'Stock',
            width: 110,
            align: 'right',
            headerAlign: 'right'
        },

        {
            field: 'actions',
            headerName: 'Actions',
            width: 110,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <>
                <Link to={`/admin/product/${params.id}`} className="pizzaro-admin-row-action" aria-label={`Edit product ${params.id}`}>
                    <i className="fa fa-pencil" aria-hidden="true"></i>
                </Link>
                <button className="pizzaro-admin-row-action is-danger" aria-label={`Delete product ${params.id}`} onClick={event => {
                    event.stopPropagation()
                    deleteProductHandler(params.id)
                }}>
                    <i className="fa fa-trash" aria-hidden="true"></i>
                </button>
                </>
            )
        }
    ];

    const rows = products.map(product => ({
        id: product._id,
        name: product.name,
        price: formatCurrency(product.price),
        stock: product.stock,
    }));



    return (
        <>
            <AdminPageLayout
                title="All Products"
                description="Manage your menu and inventory."
                actions={
                    <Link to="/admin/product" className="pizzaro-quick-action">
                        <i className="fa fa-plus" aria-hidden="true" /> Add product
                    </Link>
                }
            >
                <div className="pizzaro-admin-list-summary">
                    <span>{products.length} {products.length === 1 ? 'product' : 'products'}</span>
                    <button
                        className="pizzaro-admin-secondary-action is-danger"
                        type="button"
                        disabled={!selectionModel.ids.size}
                        onClick={deleteSelected}
                    >
                        Delete selected ({selectionModel.ids.size})
                    </button>
                </div>
                {loading ? (
                    <p className="pizzaro-admin-page-loading" role="status">Loading products…</p>
                ) : (
                    <div className="pizzaro-orders-grid">
                        <DataGrid
                            className="pizzaro-admin-grid"
                            rows={rows}
                            columns={columns}
                            checkboxSelection
                            checkboxSelectionVisibleOnly
                            disableRowSelectionExcludeModel
                            disableRowSelectionOnClick
                            rowSelectionModel={selectionModel}
                            onRowSelectionModelChange={setSelectionModel}
                            getRowId={row => row.id}
                            initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
                            pageSizeOptions={[5, 10, 25]}
                            showToolbar
                            autoHeight
                        />
                    </div>
                )}
            </AdminPageLayout>

        </>
    )
}

export default ProductsList