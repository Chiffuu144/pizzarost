import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip as ChartTooltip,
    XAxis,
    YAxis
} from 'recharts'
import {
    Alert,
    Box,
    CircularProgress,
    Paper,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material'
import { formatCurrency } from '../../utils/formatCurrency'

const dateKey = date => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const todayKey = () => dateKey(new Date())

const getDateRange = preset => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = dateKey(today)
    if (preset === 'month') {
        return { startDate: dateKey(new Date(today.getFullYear(), today.getMonth(), 1)), endDate }
    }
    const days = preset === '7' ? 7 : 30
    const start = new Date(today)
    start.setDate(start.getDate() - days + 1)
    return { startDate: dateKey(start), endDate }
}

const SalesTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const date = new Date(`${label}T00:00:00`)
    return (
        <div className="admin-sales-tooltip">
            <strong>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
            <span>{formatCurrency(payload[0].value)}</span>
        </div>
    )
}

const MonthlySalesChart = () => {
    const [preset, setPreset] = useState('30')
    const [range, setRange] = useState(() => getDateRange('30'))
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const rangeError = !range.startDate || !range.endDate
        ? 'Choose both a start and end date.'
        : range.startDate > range.endDate
            ? 'Start date must be on or before end date.'
            : ''

    useEffect(() => {
        if (rangeError) return undefined

        let isCurrent = true
        const loadSales = async () => {
            setLoading(true)
            setError('')
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/sales-per-day`, {
                    params: range,
                    withCredentials: true
                })
                if (isCurrent) setSales(data.salesPerDay)
            } catch (requestError) {
                if (isCurrent) {
                    setSales([])
                    setError(requestError.response?.data?.message || requestError.message || 'Unable to load sales data.')
                }
            } finally {
                if (isCurrent) setLoading(false)
            }
        }
        loadSales()
        return () => { isCurrent = false }
    }, [range, rangeError])

    const chartData = useMemo(() => {
        if (!range.startDate || !range.endDate || range.startDate > range.endDate) return []
        const totalsByDate = new Map(sales.map(item => [item.date, item.total]))
        const result = []
        const cursor = new Date(`${range.startDate}T00:00:00.000Z`)
        const end = new Date(`${range.endDate}T00:00:00.000Z`)
        while (cursor <= end) {
            const date = cursor.toISOString().slice(0, 10)
            result.push({ date, total: totalsByDate.get(date) || 0 })
            cursor.setUTCDate(cursor.getUTCDate() + 1)
        }
        return result
    }, [range, sales])

    const totalRevenue = chartData.reduce((total, item) => total + item.total, 0)

    const selectPreset = (_, nextPreset) => {
        if (!nextPreset) return
        setPreset(nextPreset)
        if (nextPreset !== 'custom') setRange(getDateRange(nextPreset))
    }

    const updateCustomDate = (field, value) => {
        setPreset('custom')
        setRange(current => ({ ...current, [field]: value }))
    }

    return (
        <Paper className="admin-sales-panel pizzaro-dashboard-sales-panel" elevation={0}>
            <Box className="admin-sales-heading">
                <div>
                    <Typography component="h2" className="admin-sales-title">Sales over time</Typography>
                    <Typography component="p" className="admin-sales-description">
                        Revenue from completed orders
                    </Typography>
                </div>
                <Typography component="p" className="admin-sales-total">{formatCurrency(totalRevenue)}</Typography>
            </Box>

            <Stack className="admin-sales-controls" direction="row" useFlexGap flexWrap="wrap" spacing={1.5}>
                <ToggleButtonGroup
                    value={preset}
                    exclusive
                    onChange={selectPreset}
                    size="small"
                    aria-label="Sales chart date range"
                >
                    <ToggleButton value="7">7 days</ToggleButton>
                    <ToggleButton value="30">30 days</ToggleButton>
                    <ToggleButton value="month">This month</ToggleButton>
                    <ToggleButton value="custom">Custom</ToggleButton>
                </ToggleButtonGroup>
                {preset === 'custom' && (
                    <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
                        <TextField
                            label="Start date"
                            type="date"
                            size="small"
                            value={range.startDate}
                            onChange={event => updateCustomDate('startDate', event.target.value)}
                            slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: range.endDate } }}
                        />
                        <TextField
                            label="End date"
                            type="date"
                            size="small"
                            value={range.endDate}
                            onChange={event => updateCustomDate('endDate', event.target.value)}
                            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: range.startDate, max: todayKey() } }}
                        />
                    </Stack>
                )}
            </Stack>

            {rangeError || error ? (
                <Alert severity="error" className="admin-sales-state">{rangeError || error}</Alert>
            ) : loading ? (
                <Box className="admin-sales-state" role="status" aria-label="Loading sales data">
                    <CircularProgress size={28} />
                </Box>
            ) : chartData.length === 0 ? (
                <Typography className="admin-sales-state">No dates in this range.</Typography>
            ) : (
                <Box className="admin-sales-chart" role="img" aria-label="Daily revenue line chart">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 12, right: 16, bottom: 4, left: 8 }}>
                            <CartesianGrid vertical={false} stroke="#3c3c42" strokeDasharray="3 5" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={value => new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                minTickGap={24}
                                tick={{ fill: '#aeb0b7', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tickFormatter={value => `₱${Number(value).toLocaleString()}`}
                                width={76}
                                tick={{ fill: '#aeb0b7', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <ChartTooltip content={<SalesTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="total"
                                name="Revenue"
                                stroke="#e63946"
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 5, fill: '#e63946', stroke: '#202024', strokeWidth: 2 }}
                                animationDuration={450}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            )}
        </Paper>
    )
}

export default MonthlySalesChart
