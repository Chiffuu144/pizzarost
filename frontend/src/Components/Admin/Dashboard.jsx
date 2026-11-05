import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
    AddRounded,
    AttachMoneyRounded,
    CircleNotificationsRounded,
    GroupRounded,
    Inventory2Rounded,
    NotificationsNoneRounded,
    SearchRounded,
    ShoppingBagRounded,
    WarningAmberRounded
} from '@mui/icons-material'
import { Alert, Autocomplete, Avatar, Box, Button, InputAdornment, Menu, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'
import { allOrders } from '../../actions/orderActions'
import { getAdminProducts } from '../../actions/productActions'
import { formatCurrency } from '../../utils/formatCurrency'
import { isRevenueOrder } from '../../utils/orderRevenue'
import MonthlySalesChart from './MonthlySalesChart'
import { MetricCard, RevenueWaveChart, TrendingItemsList } from './DashboardWidgets'

const Dashboard = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { products = [], productsCount, error: productError } = useSelector(state => state.products)
    const { orders = [], error: orderError } = useSelector(state => state.allOrders)
    const { user } = useSelector(state => state.auth)
    const [customers, setCustomers] = useState([])
    const [search, setSearch] = useState('')
    const [customerError, setCustomerError] = useState('')
    const [notificationAnchor, setNotificationAnchor] = useState(null)

    useEffect(() => {
        dispatch(getAdminProducts())
    }, [dispatch])

    useEffect(() => {
        if (!orders.length) dispatch(allOrders())
    }, [dispatch, orders.length])

    useEffect(() => {
        let current = true
        axios.get(`${import.meta.env.VITE_API}/admin/users`, { withCredentials: true })
            .then(({ data }) => {
                if (current) setCustomers(data.users || [])
            })
            .catch(error => {
                if (current) setCustomerError(error.response?.data?.message || 'Customer count is unavailable.')
            })
        return () => { current = false }
    }, [])

    const searchOptions = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return []

        const includesQuery = values => values.some(value => String(value || '').toLowerCase().includes(query))
        const productOptions = products
            .filter(product => includesQuery([product.name, product.category, product.description]))
            .slice(0, 8)
            .map(product => ({
                id: `product-${product._id}`,
                type: 'Menu',
                label: product.name,
                detail: `${product.category || 'Menu item'} · ${formatCurrency(product.price)}`,
                to: `/admin/product/${product._id}`
            }))
        const orderOptions = orders
            .filter(order => includesQuery([
                order._id,
                String(order._id || '').slice(-6),
                order.orderStatus,
                order.user?.name,
                order.user?.email,
                ...(order.orderItems || []).map(item => item.name)
            ]))
            .slice(0, 8)
            .map(order => ({
                id: `order-${order._id}`,
                type: 'Orders',
                label: `Order #${String(order._id).slice(-6)}`,
                detail: `${order.orderStatus} · ${formatCurrency(order.totalPrice)}`,
                to: `/admin/order/${order._id}`
            }))
        const customerOptions = customers
            .filter(customer => customer.role !== 'admin' && includesQuery([
                customer.name,
                customer.email,
                customer._id
            ]))
            .slice(0, 8)
            .map(customer => ({
                id: `customer-${customer._id}`,
                type: 'Customers',
                label: customer.name || customer.email,
                detail: customer.email || 'Customer account',
                to: `/admin/user/${customer._id}`
            }))

        return [...productOptions, ...orderOptions, ...customerOptions]
    }, [customers, orders, products, search])
    const completedOrders = orders.filter(order => ['Completed', 'Shipped', 'Delivered'].includes(order.orderStatus))
    const totalRevenue = orders
        .filter(isRevenueOrder)
        .reduce((total, order) => total + Number(order.totalPrice || 0), 0)
    const attentionOrders = orders.filter(order => ['Pending', 'Processing'].includes(order.orderStatus))
    const lowStockProducts = products.filter(product => Number(product.stock) <= 5)
    const notifications = [
        ...attentionOrders.map(order => ({
            key: `order-${order._id}`,
            label: `${order.orderStatus} order`,
            detail: `Order #${String(order._id).slice(-6)}`,
            to: `/admin/order/${order._id}`,
            icon: CircleNotificationsRounded
        })),
        ...lowStockProducts.map(product => ({
            key: `stock-${product._id}`,
            label: 'Low stock',
            detail: `${product.name} · ${product.stock ?? 0} left`,
            to: '/admin/products',
            icon: WarningAmberRounded
        }))
    ]
    const adminName = user?.name?.trim() || 'Admin'
    const adminInitials = adminName.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()
    const dashboardError = productError || orderError || customerError

    return (
        <>
            <MetaData title="Admin Dashboard | Pizzaro" />
            <div className="pizzaro-admin-shell">
                <Sidebar />
                <main className="pizzaro-admin-main">
                    <header className="pizzaro-admin-topbar">
                        <div className="pizzaro-admin-breadcrumb"><Typography component="span">Dashboard</Typography><span>/</span><strong>Overview</strong></div>
                        <Autocomplete
                            className="pizzaro-admin-search"
                            options={searchOptions}
                            groupBy={option => option.type}
                            getOptionLabel={option => option.label}
                            filterOptions={options => options}
                            noOptionsText={search.trim() ? 'No matching orders, menu items, or customers' : 'Type to search orders, menu items, or customers'}
                            onInputChange={(_, value) => setSearch(value)}
                            onChange={(_, option) => {
                                if (option) {
                                    setSearch('')
                                    navigate(option.to)
                                }
                            }}
                            renderOption={(props, option) => (
                                <li {...props} key={option.id}>
                                    <Box>
                                        <Typography component="span">{option.label}</Typography>
                                        <Typography component="small" display="block">{option.detail}</Typography>
                                    </Box>
                                </li>
                            )}
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    placeholder="Search orders, menu, customers..."
                                    slotProps={{
                                        ...params.slotProps,
                                        input: {
                                            ...params.slotProps.input,
                                            startAdornment: (
                                                <>
                                                    <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment>
                                                    {params.slotProps.input.startAdornment}
                                                </>
                                            )
                                        },
                                        htmlInput: {
                                            ...params.slotProps.htmlInput,
                                            'aria-label': 'Search orders, menu items, or customers'
                                        }
                                    }}
                                />
                            )}
                        />
                        <Stack direction="row" spacing={1.25} alignItems="center" className="pizzaro-admin-actions">
                            <Button component={Link} to="/admin/product" className="pizzaro-quick-action" startIcon={<AddRounded />}>Add product</Button>
                            <Button
                                className="pizzaro-notification-button"
                                aria-label={`Notifications, ${notifications.length} alerts`}
                                aria-haspopup="menu"
                                aria-expanded={Boolean(notificationAnchor)}
                                onClick={event => setNotificationAnchor(event.currentTarget)}
                            >
                                <NotificationsNoneRounded />
                                {notifications.length > 0 && <span>{notifications.length > 99 ? '99+' : notifications.length}</span>}
                            </Button>
                            <Menu
                                anchorEl={notificationAnchor}
                                open={Boolean(notificationAnchor)}
                                onClose={() => setNotificationAnchor(null)}
                                slotProps={{ paper: { className: 'pizzaro-notification-menu' } }}
                                MenuListProps={{ 'aria-label': 'Store notifications' }}
                            >
                                <Typography className="pizzaro-notification-title">Store alerts</Typography>
                                {notifications.length ? notifications.slice(0, 8).map(notification => {
                                    const NotificationIcon = notification.icon
                                    return (
                                        <MenuItem
                                            component={Link}
                                            to={notification.to}
                                            key={notification.key}
                                            onClick={() => setNotificationAnchor(null)}
                                        >
                                            <NotificationIcon fontSize="small" />
                                            <span><strong>{notification.label}</strong><small>{notification.detail}</small></span>
                                        </MenuItem>
                                    )
                                }) : (
                                    <Typography className="pizzaro-notification-empty">You&apos;re all caught up. No orders need attention and stock levels look good.</Typography>
                                )}
                            </Menu>
                            <Avatar className="pizzaro-admin-avatar" src={user?.avatar?.url} alt={adminName}>
                                {adminInitials}
                            </Avatar>
                            <Typography className="pizzaro-admin-name">{adminName}</Typography>
                        </Stack>
                    </header>

                    <Box className="pizzaro-dashboard-heading">
                        <div><Typography component="h1">Dashboard</Typography><Typography component="p">A pulse check on today&apos;s pizza business.</Typography></div>
                        <Button component={Link} to="/admin/orders" className="pizzaro-outline-action">View orders</Button>
                    </Box>

                    {dashboardError && <Alert severity="error" className="pizzaro-dashboard-alert">{dashboardError}</Alert>}

                    <section className="pizzaro-dashboard-top-grid" aria-label="Store overview">
                        <div className="pizzaro-metrics-grid">
                            <MetricCard label="Total menu items" value={(productsCount ?? products.length).toLocaleString()} note="Published in catalogue" icon={Inventory2Rounded} />
                            <MetricCard label="Total revenue" value={formatCurrency(totalRevenue)} note="Paid orders, all time" icon={AttachMoneyRounded} tone="gold" />
                            <MetricCard label="Total orders" value={orders.length.toLocaleString()} note={`${completedOrders.length} completed`} icon={ShoppingBagRounded} tone="slate" />
                            <MetricCard label="Total customers" value={customers.length.toLocaleString()} note="Registered store customers" icon={GroupRounded} tone="green" />
                        </div>
                        <RevenueWaveChart orders={orders} />
                    </section>

                    <section className="pizzaro-dashboard-bottom-grid" aria-label="Store analytics">
                        <TrendingItemsList products={products} orders={orders} />
                        <MonthlySalesChart />
                    </section>
                </main>
            </div>
        </>
    )
}

export default Dashboard
