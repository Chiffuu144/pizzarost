const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
})[character]);

const currency = amount => new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
}).format(amount);

const emailShell = ({ preheader, title, content, actionLabel, actionUrl }) => `
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e9;color:#252329;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f0e9;">
        <tr>
            <td align="center" style="padding:32px 16px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;">
                    <tr>
                        <td style="padding:20px 28px;background-color:#211f20;border-top:4px solid #b91c1c;">
                            <span style="color:#fff8f0;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:bold;letter-spacing:-1px;">Pizzaro</span>
                            <span style="display:block;margin-top:5px;color:#e8c778;font-size:12px;line-height:18px;">Freshly baked. Shared with love.</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px 28px 28px;background-color:#ffffff;">
                            <h1 style="margin:0 0 18px;color:#252329;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;">${escapeHtml(title)}</h1>
                            ${content}
                            ${actionLabel && actionUrl ? `
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;">
                                <tr>
                                    <td align="center" bgcolor="#b91c1c" style="border-radius:6px;">
                                        <a href="${escapeHtml(actionUrl)}" style="display:inline-block;padding:14px 22px;border:1px solid #b91c1c;border-radius:6px;color:#ffffff;font-size:15px;font-weight:bold;line-height:20px;text-decoration:none;">${escapeHtml(actionLabel)}</a>
                                    </td>
                                </tr>
                            </table>` : ''}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 28px;background-color:#211f20;color:#ddd6d1;font-size:12px;line-height:19px;">
                            <strong style="color:#fff8f0;">Pizzaro</strong><br>
                            This is an automated message about your Pizzaro account or order.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

const createPasswordResetEmail = ({ name, resetUrl }) => ({
    subject: 'Reset your Pizzaro password',
    message: `Hello ${name},\n\nUse this link to reset your Pizzaro password. This link expires in 30 minutes:\n${resetUrl}\n\nIf you did not request a password reset, you can ignore this email.`,
    html: emailShell({
        preheader: 'A secure link to reset your Pizzaro password.',
        title: 'Reset your password',
        content: `
            <p style="margin:0 0 16px;color:#403b38;font-size:16px;line-height:25px;">Hello ${escapeHtml(name)},</p>
            <p style="margin:0;color:#403b38;font-size:16px;line-height:25px;">We received a request to reset the password for your Pizzaro account. Use the button below to choose a new password.</p>
            <p style="margin:20px 0 0;padding:14px 16px;background-color:#fff8f0;color:#625c58;font-size:14px;line-height:22px;">For your security, this link expires in <strong style="color:#252329;">30 minutes</strong>. If you did not request this change, you can safely ignore this email.</p>`,
        actionLabel: 'Reset password',
        actionUrl: resetUrl
    })
});

const createOrderStatusEmail = order => {
    const itemRows = order.orderItems.map(item => `
        <tr>
            <td style="padding:12px 8px;border-bottom:1px solid #eee7e1;color:#403b38;font-size:14px;line-height:20px;">${escapeHtml(item.name)}</td>
            <td align="right" style="padding:12px 8px;border-bottom:1px solid #eee7e1;color:#403b38;font-size:14px;line-height:20px;">${escapeHtml(item.quantity)}</td>
            <td align="right" style="padding:12px 8px;border-bottom:1px solid #eee7e1;color:#403b38;font-size:14px;line-height:20px;">${currency(item.price)}</td>
            <td align="right" style="padding:12px 8px;border-bottom:1px solid #eee7e1;color:#252329;font-size:14px;font-weight:bold;line-height:20px;">${currency(item.price * item.quantity)}</td>
        </tr>`).join('');

    return {
        subject: `Pizzaro order ${order._id}: ${order.orderStatus}`,
        message: `Hello ${order.user.name},\n\nYour Pizzaro order ${order._id} is now ${order.orderStatus}.\n\nSubtotal: ${currency(order.itemsPrice)}\nTax: ${currency(order.taxPrice)}\nShipping: ${currency(order.shippingPrice)}\nGrand total: ${currency(order.totalPrice)}\n\nYour itemized order receipt is attached.`,
        html: emailShell({
            preheader: `Order ${order._id} is now ${order.orderStatus}.`,
            title: 'Your order has an update',
            content: `
                <p style="margin:0 0 16px;color:#403b38;font-size:16px;line-height:25px;">Hello ${escapeHtml(order.user.name)},</p>
                <p style="margin:0 0 18px;color:#403b38;font-size:16px;line-height:25px;">The status of your order has changed.</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 22px;background-color:#fff8f0;">
                    <tr>
                        <td style="padding:14px 16px;color:#625c58;font-size:13px;line-height:20px;">ORDER</td>
                        <td align="right" style="padding:14px 16px;color:#252329;font-size:13px;font-weight:bold;line-height:20px;">#${escapeHtml(order._id)}</td>
                    </tr>
                    <tr>
                        <td style="padding:0 16px 14px;color:#625c58;font-size:13px;line-height:20px;">STATUS</td>
                        <td align="right" style="padding:0 16px 14px;color:#b91c1c;font-size:14px;font-weight:bold;line-height:20px;">${escapeHtml(order.orderStatus)}</td>
                    </tr>
                </table>
                <h2 style="margin:0 0 10px;color:#252329;font-family:Georgia,'Times New Roman',serif;font-size:21px;line-height:27px;">Your order</h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                    <thead>
                        <tr>
                            <th align="left" style="padding:8px;color:#625c58;font-size:12px;">Item</th>
                            <th align="right" style="padding:8px;color:#625c58;font-size:12px;">Qty</th>
                            <th align="right" style="padding:8px;color:#625c58;font-size:12px;">Price</th>
                            <th align="right" style="padding:8px;color:#625c58;font-size:12px;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>${itemRows}</tbody>
                </table>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px;">
                    <tr><td style="padding:5px 0;color:#625c58;font-size:14px;line-height:20px;">Subtotal</td><td align="right" style="padding:5px 0;color:#403b38;font-size:14px;line-height:20px;">${currency(order.itemsPrice)}</td></tr>
                    <tr><td style="padding:5px 0;color:#625c58;font-size:14px;line-height:20px;">Tax</td><td align="right" style="padding:5px 0;color:#403b38;font-size:14px;line-height:20px;">${currency(order.taxPrice)}</td></tr>
                    <tr><td style="padding:5px 0;color:#625c58;font-size:14px;line-height:20px;">Shipping</td><td align="right" style="padding:5px 0;color:#403b38;font-size:14px;line-height:20px;">${currency(order.shippingPrice)}</td></tr>
                    <tr><td style="padding:12px 0;border-top:1px solid #ded6d1;color:#252329;font-size:16px;font-weight:bold;line-height:22px;">Total</td><td align="right" style="padding:12px 0;border-top:1px solid #ded6d1;color:#252329;font-size:16px;font-weight:bold;line-height:22px;">${currency(order.totalPrice)}</td></tr>
                </table>
                <p style="margin:20px 0 0;color:#625c58;font-size:13px;line-height:21px;">Your itemized receipt is attached as a PDF.</p>`,
            actionLabel: 'View my orders',
            actionUrl: `${(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '')}/orders/me`
        })
    };
};

module.exports = { createOrderStatusEmail, createPasswordResetEmail };
