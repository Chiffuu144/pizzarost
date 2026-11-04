const revenueStatuses = new Set(['Completed', 'Shipped', 'Delivered'])

export const revenueDate = order => order.completedAt || order.createdAt

export const isRevenueOrder = order =>
    revenueStatuses.has(order.orderStatus) && Boolean(revenueDate(order))
