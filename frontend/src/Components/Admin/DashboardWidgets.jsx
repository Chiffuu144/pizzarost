import { useMemo, useState } from 'react'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'
import { StarRounded } from '@mui/icons-material'
import { Avatar, Box, Chip, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { formatCurrency } from '../../utils/formatCurrency'
import { isRevenueOrder, revenueDate } from '../../utils/orderRevenue'

const completedStatuses = ['Completed', 'Delivered']
const isCompleted = order => completedStatuses.includes(order.orderStatus)

export const MetricCard = ({ label, value, note, icon: Icon, tone = 'red' }) => (
    <Paper className={`pizzaro-metric-card pizzaro-metric-${tone}`} elevation={0}>
        <Box className="pizzaro-metric-copy">
            <Typography component="span" className="pizzaro-metric-label">{label}</Typography>
            <Typography component="strong" className="pizzaro-metric-value">{value}</Typography>
            <Typography component="span" className="pizzaro-metric-note">{note}</Typography>
        </Box>
        <span className="pizzaro-metric-icon"><Icon /></span>
    </Paper>
)

const formatDay = date => date.toLocaleDateString(undefined, { weekday: 'short' })
const formatDate = date => date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
})
const dayKey = date => [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
].join('-')

export const RevenueWaveChart = ({ orders }) => {
    const data = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(today)
            date.setDate(today.getDate() - 6 + index)
            const key = dayKey(date)
            const value = orders
                .filter(order => isRevenueOrder(order) && dayKey(new Date(revenueDate(order))) === key)
                .reduce((total, order) => total + Number(order.totalPrice || 0), 0)
            return { label: formatDay(date), date: formatDate(date), value }
        })
    }, [orders])
    const todayRevenue = data[data.length - 1]?.value || 0
    const previousRevenue = data[data.length - 2]?.value || 0
    const growth = previousRevenue ? ((todayRevenue - previousRevenue) / previousRevenue) * 100 : null

    return (
        <Paper className="pizzaro-revenue-card" elevation={0}>
            <Box className="pizzaro-section-heading">
                <div>
                    <Typography component="h2">Today&apos;s revenue</Typography>
                    <Typography component="p">Completed order totals · last seven days</Typography>
                </div>
                <Box className="pizzaro-revenue-summary">
                    <span className="pizzaro-revenue-today-label">Today</span>
                    <Typography component="strong">{formatCurrency(todayRevenue)}</Typography>
                    <span className={growth === null ? 'pizzaro-revenue-no-comparison' : growth >= 0 ? 'is-positive' : 'is-negative'}>
                        {growth === null
                            ? 'No completed orders yesterday'
                            : `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}% vs yesterday`}
                    </span>
                </Box>
            </Box>
            <Box className="pizzaro-wave-chart" role="img" aria-label="Revenue for the last seven days">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 4, left: -24, bottom: 0 }}>
                        <defs>
                            <linearGradient id="pizzaroRevenueFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#D32F2F" stopOpacity={0.28} />
                                <stop offset="100%" stopColor="#D32F2F" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#eee9e4" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={value => `₱${Math.round(value / 1000)}k`} />
                        <Tooltip
                            labelFormatter={(_, payload) => payload[0]?.payload.date || ''}
                            formatter={value => formatCurrency(value)}
                        />
                        <Area type="monotone" dataKey="value" stroke="#D32F2F" strokeWidth={3} fill="url(#pizzaroRevenueFill)" />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    )
}

export const TrendingItemsList = ({ products, orders }) => {
    const ranked = useMemo(() => {
        const counts = orders.reduce((map, order) => {
            if (!isCompleted(order)) return map
            order.orderItems?.forEach(item => {
                const id = item.product?._id || item.product
                map[id] = (map[id] || 0) + Number(item.quantity || 0)
            })
            return map
        }, {})
        return [...products]
            .sort((left, right) => (counts[right._id] || 0) - (counts[left._id] || 0))
            .slice(0, 4)
            .map(product => ({ ...product, orderCount: counts[product._id] || 0 }))
    }, [orders, products])

    return (
        <Paper className="pizzaro-dashboard-panel pizzaro-trending-panel" elevation={0}>
            <Box className="pizzaro-section-heading">
                <div><Typography component="h2">Daily trending items</Typography><Typography component="p">The pizzas customers order most</Typography></div>
                <Chip label="Live" size="small" className="pizzaro-live-chip" />
            </Box>
            <Stack component="ol" className="pizzaro-trending-list" spacing={1.5}>
                {ranked.map((product, index) => (
                    <Box component="li" key={product._id || product.name}>
                        <span className="pizzaro-rank">#{index + 1}</span>
                        <Avatar src={product.images?.[0]?.url} alt="" variant="rounded" />
                        <Box className="pizzaro-trending-copy">
                            <Typography component="strong">{product.name}</Typography>
                            <Typography component="span">{formatCurrency(product.price)} · {product.orderCount} orders</Typography>
                        </Box>
                        <span className="pizzaro-rating"><StarRounded /> {Number(product.ratings || 0).toFixed(1)}</span>
                    </Box>
                ))}
                {!ranked.length && <Typography className="pizzaro-empty-state">No product data yet.</Typography>}
            </Stack>
        </Paper>
    )
}

export const SalesBarChart = ({ orders }) => {
    const [range, setRange] = useStateRange()
    const data = useMemo(() => {
        const days = range === 'last30days' ? 30 : range === 'daily' ? 7 : 1
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return Array.from({ length: days }, (_, index) => {
            const date = new Date(today)
            date.setDate(today.getDate() - days + index + 1)
            const key = dayKey(date)
            return {
                label: days === 1 ? 'Today' : range === 'last30days' ? String(date.getDate()) : date.toLocaleDateString(undefined, { weekday: 'short' }),
                date: formatDate(date),
                value: orders.filter(order => isRevenueOrder(order) && dayKey(new Date(revenueDate(order))) === key)
                    .reduce((total, order) => total + Number(order.totalPrice || 0), 0)
            }
        })
    }, [orders, range])

    return (
        <Paper className="pizzaro-dashboard-panel pizzaro-analytics-panel" elevation={0}>
            <Box className="pizzaro-section-heading pizzaro-analytics-heading">
                <div><Typography component="h2">Sales and revenue</Typography><Typography component="p">Paid order totals across recent trading days</Typography></div>
                <ToggleButtonGroup value={range} exclusive onChange={(_, value) => value && setRange(value)} size="small" aria-label="Sales range">
                    <ToggleButton value="last30days">Last 30 days</ToggleButton>
                    <ToggleButton value="daily">Daily</ToggleButton>
                    <ToggleButton value="today">Today</ToggleButton>
                </ToggleButtonGroup>
            </Box>
            <Box className="pizzaro-bar-chart">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="#eee9e4" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Tooltip
                            labelFormatter={(_, payload) => payload[0]?.payload.date || ''}
                            formatter={value => [Number(value) === 0 ? 'No paid revenue' : formatCurrency(value), 'Revenue']}
                            contentStyle={{
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: 8,
                                backgroundColor: '#202024',
                                color: '#f8f9fa'
                            }}
                            labelStyle={{ color: '#f8f9fa' }}
                            itemStyle={{ color: '#f8f9fa' }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#D32F2F" maxBarSize={24}>
                            {data.map(item => <Cell key={item.label} fill={item.value ? '#D32F2F' : '#eaded8'} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    )
}

const useStateRange = () => {
    const [range, setRange] = useState('last30days')
    return [range, setRange]
}
