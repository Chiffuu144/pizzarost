import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import axios from 'axios'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import AdminPageLayout from './AdminPageLayout'

const ProductReviews = () => {
    const [productSearch, setProductSearch] = useState('')
    const [reviewSearch, setReviewSearch] = useState('')
    const [products, setProducts] = useState([])
    const [productsLoading, setProductsLoading] = useState(true)
    const [productsError, setProductsError] = useState('')

    useEffect(() => {
        const getProducts = async () => {
            try {
                const { data } = await axios.get(
                    `${import.meta.env.VITE_API}/admin/products`,
                    { withCredentials: true }
                )
                setProducts(data.products)
            } catch (requestError) {
                setProductsError(requestError.response?.data?.message || requestError.message)
            } finally {
                setProductsLoading(false)
            }
        }

        getProducts()
    }, [])

    const deleteReview = async (reviewId, productId) => {
        const result = await Swal.fire({
            title: 'Delete this review?',
            text: 'This review and its rating will be removed.',
            icon: 'warning',
            confirmButtonText: 'Delete review',
            showCancelButton: true
        })
        if (!result.isConfirmed) return

        try {
            const { data } = await axios.delete(
                `${import.meta.env.VITE_API}/reviews?id=${encodeURIComponent(reviewId)}&productId=${encodeURIComponent(productId)}`,
                { withCredentials: true }
            )
            setProducts(currentProducts => currentProducts.map(product =>
                product._id === productId
                    ? { ...product, reviews: data.reviews, ratings: data.ratings, numOfReviews: data.numOfReviews }
                    : product
            ))
            toast.success('Review deleted')
        } catch (requestError) {
            toast.error(requestError.response?.data?.message || requestError.message || 'Unable to delete this review')
        }
    }

    const normalizedProductSearch = productSearch.trim().toLowerCase().replace(/^product\s*#?\s*/, '').replace(/^#/, '')
    const filteredProducts = products.filter(product =>
        String(product._id || '').toLowerCase().includes(normalizedProductSearch)
    )

    const columns = [
        {
            field: 'productId',
            headerName: 'Product #',
            width: 190,
            renderCell: params => <span className="pizzaro-admin-id" title={params.value}>{params.value}</span>
        },
        {
            field: 'rating',
            headerName: 'Rating',
            width: 110,
            align: 'right',
            headerAlign: 'right',
            renderCell: params => <span className="pizzaro-admin-review-rating">{params.value} / 5</span>
        },
        { field: 'comment', headerName: 'Comment', flex: 1, minWidth: 220 },
        { field: 'user', headerName: 'Customer', width: 170 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 90,
            sortable: false,
            filterable: false,
            renderCell: params => (
                <button
                    className="pizzaro-admin-row-action is-danger"
                    type="button"
                    aria-label={`Delete review ${params.id} for product ${params.row.productId}`}
                    onClick={() => deleteReview(params.id, params.row.productId)}
                >
                    <i className="fa fa-trash" aria-hidden="true" />
                </button>
            )
        }
    ]
    const rows = filteredProducts.flatMap(product =>
        (product.reviews || []).map(review => ({
            id: review._id,
            productId: product._id,
            comment: review.comment,
            rating: review.rating,
            user: review.name || 'Unknown'
        }))
    )
    const normalizedReviewSearch = reviewSearch.trim().toLowerCase()
    const filteredRows = rows.filter(row =>
        [row.comment, row.user, row.rating, row.productId].some(value =>
            String(value).toLowerCase().includes(normalizedReviewSearch)
        )
    )

    return (
        <>
            <AdminPageLayout title="Product Reviews" description="Find and moderate feedback for a menu item.">
                <div className="pizzaro-admin-review-search">
                    <label htmlFor="productSearch">Search by product #</label>
                    <div className="pizzaro-admin-review-search-controls">
                        <input
                            id="productSearch"
                            type="search"
                            aria-label="Search products by product number"
                            value={productSearch}
                            onChange={event => setProductSearch(event.target.value)}
                            placeholder="Enter product #"
                            disabled={productsLoading || Boolean(productsError)}
                        />
                    </div>
                </div>
                {productsError && <p role="alert" className="pizzaro-admin-inline-error">{productsError}</p>}
                {!productsLoading && !productsError && !products.length && (
                    <p className="pizzaro-admin-empty-state">No products are available to review yet.</p>
                )}
                {!productsLoading && products.length > 0 && productSearch.trim() && !filteredProducts.length && (
                    <p className="pizzaro-admin-empty-state">No product numbers match “{productSearch.trim()}”.</p>
                )}
                {productsLoading && <p className="pizzaro-admin-page-loading" role="status">Loading reviews…</p>}
                {!productsLoading && !productsError && (
                    <>
                        <div className="pizzaro-admin-list-summary">
                            <span>
                                {normalizedReviewSearch
                                    ? `${filteredRows.length} matching ${filteredRows.length === 1 ? 'review' : 'reviews'}`
                                    : `${filteredRows.length} ${filteredRows.length === 1 ? 'review' : 'reviews'}`}
                            </span>
                            <input
                                type="search"
                                className="pizzaro-admin-review-list-search"
                                aria-label="Search reviews by customer, comment, or rating"
                                placeholder="Search reviews"
                                value={reviewSearch}
                                onChange={event => setReviewSearch(event.target.value)}
                            />
                        </div>
                        {!!filteredRows.length && (
                            <div className="pizzaro-orders-grid">
                                <DataGrid
                                    className="pizzaro-admin-grid"
                                    rows={filteredRows}
                                    columns={columns}
                                    getRowId={row => row.id}
                                    initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
                                    pageSizeOptions={[5, 10, 25]}
                                    disableRowSelectionOnClick
                                    autoHeight
                                />
                            </div>
                        )}
                        {!filteredRows.length && (
                            <p className="pizzaro-admin-empty-state">
                                {normalizedProductSearch
                                    ? 'No reviews found for this product number.'
                                    : normalizedReviewSearch
                                        ? `No reviews match “${reviewSearch.trim()}”.`
                                        : 'No product reviews yet.'}
                            </p>
                        )}
                    </>
                )}
            </AdminPageLayout>
        </>
    )
}

export default ProductReviews
