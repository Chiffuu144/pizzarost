const PDFDocument = require('pdfkit');

const currency = amount => new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
}).format(amount);

const generateReceipt = order => new Promise((resolve, reject) => {
    const document = new PDFDocument({ size: 'A4', margin: 48 });
    const chunks = [];
    document.on('data', chunk => chunks.push(chunk));
    document.on('error', reject);
    document.on('end', () => resolve(Buffer.concat(chunks)));

    document.fontSize(22).text('Pizzaro');
    document.fontSize(10).text('OFFICIAL ORDER RECEIPT', { align: 'right' });
    document.moveDown();
    document.fontSize(11).text(`Order: ${order._id}`);
    document.text(`Date: ${new Date(order.createdAt).toLocaleString('en-PH')}`);
    document.text(`Status: ${order.orderStatus}`);
    document.text(`Customer: ${order.user.name}`);
    document.text(`Email: ${order.user.email}`);
    document.moveDown();

    const columns = { item: 48, quantity: 330, unit: 390, subtotal: 475 };
    const writeHeader = () => {
        const headerY = document.y;
        document.font('Helvetica-Bold').fontSize(10);
        document.text('Item', columns.item, headerY, { width: 270 });
        document.text('Qty', columns.quantity, headerY, { width: 45, align: 'right' });
        document.text('Unit price', columns.unit, headerY, { width: 75, align: 'right' });
        document.text('Subtotal', columns.subtotal, headerY, { width: 75, align: 'right' });
        document.moveDown(0.6);
        document.font('Helvetica');
    };
    writeHeader();

    for (const item of order.orderItems) {
        if (document.y > 700) {
            document.addPage();
            writeHeader();
        }
        const rowY = document.y;
        const rowHeight = Math.max(12, document.heightOfString(item.name, { width: 270 }));
        document.fontSize(9).text(item.name, columns.item, rowY, { width: 270 });
        document.text(String(item.quantity), columns.quantity, rowY, { width: 45, align: 'right' });
        document.text(currency(item.price), columns.unit, rowY, { width: 75, align: 'right' });
        document.text(currency(item.price * item.quantity), columns.subtotal, rowY, { width: 75, align: 'right' });
        document.y = rowY + rowHeight + 8;
    }

    document.moveDown();
    document.fontSize(10).text(`Subtotal: ${currency(order.itemsPrice)}`, { align: 'right' });
    document.text(`Tax: ${currency(order.taxPrice)}`, { align: 'right' });
    document.text(`Shipping: ${currency(order.shippingPrice)}`, { align: 'right' });
    document.font('Helvetica-Bold').text(`Grand total: ${currency(order.totalPrice)}`, { align: 'right' });
    document.end();
});

module.exports = generateReceipt;
