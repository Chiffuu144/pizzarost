const Order = require('../models/order');
const Product = require('../models/product');
const mongoose = require('mongoose');
const sendEmail = require('../utils/sendEmail');
const generateReceipt = require('../utils/generateReceipt');
const { createOrderStatusEmail } = require('../utils/emailTemplates');

const roundMoney = amount => Number(amount.toFixed(2));

const changeInventory = async (items, direction) => {
    const changedItems = [];
    try {
        for (const item of items) {
            const update = await Product.updateOne(
                {
                    _id: item.product,
                    ...(direction < 0 ? { stock: { $gte: item.quantity } } : {})
                },
                { $inc: { stock: direction * item.quantity } }
            );
            if (update.matchedCount === 0 && direction > 0) {
                continue;
            }
            if (update.matchedCount !== 1) {
                const error = new Error(`Insufficient stock for ${item.name}`);
                error.statusCode = 409;
                throw error;
            }
            changedItems.push(item);
        }
    } catch (error) {
        const rollbackResults = await Promise.allSettled(
            changedItems.map(item => Product.updateOne(
                { _id: item.product, ...(direction > 0 ? { stock: { $gte: item.quantity } } : {}) },
                { $inc: { stock: -direction * item.quantity } }
            ))
        );
        if (rollbackResults.some(result => result.status === 'rejected' || result.value.matchedCount !== 1)) {
            error.message = `${error.message}; inventory rollback was incomplete and requires reconciliation`;
        }
        throw error;
    }
};

exports.newOrder = async (req, res) => {
    const { orderItems, shippingInfo } = req.body;
    if (!Array.isArray(orderItems) || !orderItems.length || orderItems.length > 50) {
        return res.status(400).json({ success: false, message: 'An order must contain between 1 and 50 items' });
    }
    const requiredShippingFields = ['address', 'city', 'phoneNo', 'postalCode', 'country'];
    if (!shippingInfo || requiredShippingFields.some(field =>
        typeof shippingInfo[field] !== 'string' || !shippingInfo[field].trim() ||
        shippingInfo[field].trim().length > 200
    )) {
        return res.status(400).json({ success: false, message: 'Complete all shipping information fields' });
    }

    const quantities = new Map();
    for (const item of orderItems) {
        const id = item?.product;
        const quantity = Number(item?.quantity);
        if (!mongoose.Types.ObjectId.isValid(id) || !Number.isInteger(quantity) ||
            quantity < 1 || quantity > 50) {
            return res.status(400).json({ success: false, message: 'One or more order items are invalid' });
        }
        quantities.set(id, (quantities.get(id) || 0) + quantity);
    }
    if ([...quantities.values()].some(quantity => quantity > 50)) {
        return res.status(400).json({ success: false, message: 'An item quantity cannot exceed 50' });
    }

    const products = await Product.find({ _id: { $in: [...quantities.keys()] } });
    if (products.length !== quantities.size) {
        return res.status(404).json({ success: false, message: 'One or more products are no longer available' });
    }
    const productById = new Map(products.map(product => [product._id.toString(), product]));
    const unavailable = [...quantities].find(([productId, quantity]) =>
        productById.get(productId).stock < quantity
    );
    if (unavailable) {
        return res.status(409).json({
            success: false,
            message: `${productById.get(unavailable[0]).name} does not have enough stock`
        });
    }
    const normalizedItems = [...quantities].map(([productId, quantity]) => {
        const product = productById.get(productId);
        return {
            product: product._id,
            name: product.name,
            quantity,
            price: product.price,
            image: product.images[0]?.url || ''
        };
    });
    const itemsPrice = roundMoney(normalizedItems.reduce(
        (total, item) => total + item.price * item.quantity, 0
    ));
    const taxPrice = roundMoney(itemsPrice * 0.05);
    const shippingPrice = itemsPrice > 200 ? 0 : 25;
    const totalPrice = roundMoney(itemsPrice + taxPrice + shippingPrice);
    const order = await Order.create({
        orderItems: normalizedItems,
        shippingInfo: Object.fromEntries(requiredShippingFields.map(field =>
            [field, shippingInfo[field].trim()]
        )),
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        inventoryAdjusted: false,
        orderStatus: 'Pending',
        user: req.user._id
    });
    return res.status(201).json({ success: true, order });
}

exports.myOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    return res.status(200).json({ success: true, orders });
}

exports.getSingleOrder = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You cannot access this order' });
    }
    return res.status(200).json({ success: true, order });
}

exports.allOrders = async (req, res) => {
    const orders = await Order.find().populate('user', 'name email');
    const totalAmount = orders.reduce((total, order) => total + order.totalPrice, 0);
    return res.status(200).json({ success: true, totalAmount, orders });
}

exports.deleteOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.inventoryAdjusted && !['Completed', 'Cancelled'].includes(order.orderStatus)) {
        return res.status(409).json({
            success: false,
            message: 'Cancel this order before deleting it so reserved stock can be restored'
        });
    }
    await order.deleteOne();
    return res.status(200).json({ success: true });
}

exports.updateOrder = async (req, res) => {
    const allowedStatuses = ['Pending', 'Processing', 'Completed', 'Shipped', 'Cancelled'];
    const nextStatus = req.body.status;
    if (!allowedStatuses.includes(nextStatus)) {
        return res.status(400).json({
            success: false,
            message: `Status must be one of: ${allowedStatuses.join(', ')}`
        });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.orderStatus === nextStatus &&
        order.lastNotificationStatus === nextStatus) {
        return res.status(200).json({ success: true, notificationSent: true, order });
    }

    const currentStatus = order.orderStatus;
    const wasInventoryAdjusted = Boolean(order.inventoryAdjusted) ||
        ['Completed', 'Shipped', 'Delivered'].includes(currentStatus);
    let inventoryChanged = false;
    let inventoryAdjusted = Boolean(wasInventoryAdjusted);
    if (['Completed', 'Shipped', 'Delivered'].includes(nextStatus) && !inventoryAdjusted) {
        await changeInventory(order.orderItems, -1);
        inventoryChanged = true;
        inventoryAdjusted = true;
    } else if (nextStatus === 'Cancelled' && inventoryAdjusted) {
        await changeInventory(order.orderItems, 1);
        inventoryChanged = true;
        inventoryAdjusted = false;
    }

    let updatedOrder = order;
    if (currentStatus !== nextStatus ||
        order.inventoryAdjusted !== inventoryAdjusted) {
        updatedOrder = await Order.findOneAndUpdate(
            {
                _id: order._id,
                orderStatus: currentStatus,
                inventoryAdjusted: order.inventoryAdjusted
                    ? true
                    : { $ne: true }
            },
            {
                $set: {
                    orderStatus: nextStatus,
                    inventoryAdjusted,
                    ...(nextStatus === 'Completed' ? { completedAt: new Date() } : {}),
                    ...(nextStatus === 'Delivered' ? { deliveredAt: new Date() } : {})
                },
                ...(currentStatus === 'Completed' && nextStatus !== 'Completed'
                    ? { $unset: { completedAt: 1 } }
                    : {})
            },
            { new: true, runValidators: true }
        ).populate('user', 'name email');

        if (!updatedOrder) {
            if (inventoryChanged) {
                await changeInventory(order.orderItems, inventoryAdjusted ? 1 : -1);
            }
            return res.status(409).json({
                success: false,
                message: 'The order changed while you were updating it. Reload and try again.'
            });
        }
    }

    if (updatedOrder.lastNotificationStatus === nextStatus) {
        return res.status(200).json({ success: true, notificationSent: true, order: updatedOrder });
    }

    try {
        const receipt = await generateReceipt(updatedOrder);
        const statusEmail = createOrderStatusEmail(updatedOrder);
        await sendEmail({
            email: updatedOrder.user.email,
            ...statusEmail,
            attachments: [{
                filename: `Pizzaro-receipt-${updatedOrder._id}.pdf`,
                content: receipt,
                contentType: 'application/pdf'
            }]
        });
        updatedOrder.lastNotificationStatus = nextStatus;
        await updatedOrder.save();
        return res.status(200).json({ success: true, notificationSent: true, order: updatedOrder });
    } catch (error) {
        console.error(`Order ${updatedOrder._id} status updated, but customer notification failed:`, error);
        return res.status(502).json({
            success: false,
            statusUpdated: true,
            notificationSent: false,
            message: 'The order status was updated, but the email could not be sent. Retry the same status to resend it.'
        });
    }
}

exports.totalOrders = async (req, res, next) => {
    const totalOrders = await Order.aggregate([
        {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
    ])
    if (!totalOrders) {
        return res.status(404).json({
            message: 'error total orders',
        })
    }
    res.status(200).json({
        success: true,
        totalOrders
    })

}

exports.totalSales = async (req, res, next) => {
    const totalSales = await Order.aggregate([
        { $match: { orderStatus: { $in: ['Completed', 'Shipped', 'Delivered'] } } },
        {
            $group: {
                _id: null,
                totalSales: { $sum: "$totalPrice" }
            }
        }
    ])
    if (!totalSales) {
        return res.status(404).json({
            message: 'error total sales',
        })
    }
    res.status(200).json({
        success: true,
        totalSales
    })
}

exports.customerSales = async (req, res, next) => {
    const customerSales = await Order.aggregate([
        { $match: { orderStatus: { $in: ['Completed', 'Shipped', 'Delivered'] } } },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userDetails'
            },
        },
        // {
        //     $group: {
        //         _id: "$user",
        //         total: { $sum: "$totalPrice" },
        //     }
        // },

        { $unwind: "$userDetails" },
        {
            $group: {
                _id: "$user",
                total: { $sum: "$totalPrice" },
                doc: { "$first": "$$ROOT" },

            }
        },

        {
            $replaceRoot: {
                newRoot: { $mergeObjects: [{ total: '$total' }, '$doc'] },
            },
        },
        // {
        //     $group: {
        //         _id: "$userDetails.name",
        //         total: { $sum: "$totalPrice" }
        //     }
        // },
        {
            $project: {
                _id: 0,
                "userDetails.name": true,
                total: true,
            }
        },
        { $sort: { total: 1 } },

    ])
    if (!customerSales) {
        return res.status(404).json({
            message: 'error customer sales',
        })


    }
    // return console.log(customerSales)
    res.status(200).json({
        success: true,
        customerSales
    })

}

exports.salesPerMonth = async (req, res, next) => {
    const completionDate = { $ifNull: ['$completedAt', '$createdAt'] };
    const salesPerMonth = await Order.aggregate([
        { $match: { orderStatus: { $in: ['Completed', 'Shipped', 'Delivered'] } } },
        {
            $group: {
                _id: {
                    year: { $year: completionDate },
                    month: { $month: completionDate }
                },
                total: { $sum: "$totalPrice" },
            },
        },

        {
            $addFields: {
                month: {
                    $let: {
                        vars: {
                            monthsInString: [null, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                        },
                        in: {
                            $arrayElemAt: ['$$monthsInString', "$_id.month"]
                        }
                    }
                }
            }
        },
        { $sort: { "_id.month": 1 } },
        {
            $project: {
                _id: 0,
                month: true,
                total: true,
            }
        }

    ])
    if (!salesPerMonth) {
        return res.status(404).json({
            message: 'error sales per month',
        })
    }
    res.status(200).json({
        success: true,
        salesPerMonth
    })
}

exports.salesPerDay = async (req, res) => {
    const { startDate, endDate } = req.query;
    const isValidDate = value => typeof value === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) &&
        new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return res.status(400).json({
            success: false,
            message: 'Provide startDate and endDate in YYYY-MM-DD format'
        });
    }

    const start = new Date(`${startDate}T00:00:00.000Z`);
    const endExclusive = new Date(`${endDate}T00:00:00.000Z`);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
    const rangeDays = (endExclusive - start) / 86400000;
    if (endExclusive <= start || rangeDays > 366) {
        return res.status(400).json({
            success: false,
            message: 'The date range must be valid and no longer than 366 days'
        });
    }

    const salesPerDay = await Order.aggregate([
        {
            $match: {
                orderStatus: { $in: ['Completed', 'Shipped', 'Delivered'] },
                $expr: {
                    $and: [
                        { $gte: [{ $ifNull: ['$completedAt', '$createdAt'] }, start] },
                        { $lt: [{ $ifNull: ['$completedAt', '$createdAt'] }, endExclusive] }
                    ]
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: { $ifNull: ['$completedAt', '$createdAt'] },
                        timezone: 'UTC'
                    }
                },
                total: { $sum: '$totalPrice' }
            }
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', total: 1 } }
    ]);

    return res.status(200).json({ success: true, startDate, endDate, salesPerDay });
}