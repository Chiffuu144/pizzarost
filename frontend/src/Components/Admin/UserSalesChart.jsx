import { useEffect, useState } from 'react'
import axios from 'axios'
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'
import { Alert, Box, CircularProgress } from '@mui/material'
import { formatCurrency } from '../../utils/formatCurrency'

const UserSalesChart = () => {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let isCurrent = true
        axios.get(`${import.meta.env.VITE_API}/admin/customer-sales`, { withCredentials: true })
            .then(({ data }) => {
                if (isCurrent) setSales(data.customerSales || [])
            })
            .catch(requestError => {
                if (isCurrent) setError(requestError.response?.data?.message || requestError.message || 'Unable to load customer sales.')
            })
            .finally(() => {
                if (isCurrent) setLoading(false)
            })
        return () => { isCurrent = false }
    }, [])

    if (loading) return <Box className="admin-chart-state" role="status"><CircularProgress size={26} /></Box>
    if (error) return <Alert severity="error">{error}</Alert>
    if (!sales.length) return <p className="admin-chart-empty">Completed customer sales will appear here.</p>

    return (
        <ResponsiveContainer width="100%" height={340}>
            <BarChart data={sales} margin={{ top: 12, right: 12, bottom: 18, left: 8 }}>
                <CartesianGrid vertical={false} stroke="#e8e5e1" strokeDasharray="3 5" />
                <XAxis dataKey="userDetails.name" tick={{ fill: '#69645f', fontSize: 11 }}
                    interval={0} angle={-25} textAnchor="end" axisLine={false} tickLine={false} />
                <YAxis tickFormatter={value => `₱${Number(value).toLocaleString()}`}
                    width={76} tick={{ fill: '#69645f', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={value => formatCurrency(value)} />
                <Bar dataKey="total" name="Completed sales" fill="#b93434" radius={[3, 3, 0, 0]} maxBarSize={42} isAnimationActive />
            </BarChart>
        </ResponsiveContainer>
    )
}

export default UserSalesChart
