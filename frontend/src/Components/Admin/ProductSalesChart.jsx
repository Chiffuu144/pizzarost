import { useEffect, useState } from 'react'
import axios from 'axios'
import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts'
import { Alert, Box, CircularProgress } from '@mui/material'

const pieColors = ['#b93434', '#d5a33d', '#445a48', '#9b7566', '#6e7480', '#d17b53']

const ProductSalesChart = () => {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let isCurrent = true
        axios.get(`${import.meta.env.VITE_API}/admin/product-sales`, { withCredentials: true })
            .then(({ data }) => {
                if (isCurrent) setSales(data.totalPercentage || [])
            })
            .catch(requestError => {
                if (isCurrent) setError(requestError.response?.data?.message || requestError.message || 'Unable to load product sales.')
            })
            .finally(() => {
                if (isCurrent) setLoading(false)
            })
        return () => { isCurrent = false }
    }, [])

    if (loading) return <Box className="admin-chart-state" role="status"><CircularProgress size={26} /></Box>
    if (error) return <Alert severity="error">{error}</Alert>
    if (!sales.length) return <p className="admin-chart-empty">Completed product sales will appear here.</p>

    return (
        <ResponsiveContainer width="100%" height={340}>
            <PieChart>
                <Pie data={sales} dataKey="percent" nameKey="name" innerRadius="48%" outerRadius="72%"
                    paddingAngle={2} isAnimationActive>
                    {sales.map((item, index) => (
                        <Cell key={`${item.name}-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={value => `${Number(value).toFixed(1)}%`} />
                <Legend verticalAlign="bottom" height={36} />
            </PieChart>
        </ResponsiveContainer>
    )
}

export default ProductSalesChart
