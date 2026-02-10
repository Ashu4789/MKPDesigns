const PDFDocument = require('pdfkit');

const generateInvoicePDF = (transaction, user) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // --- Header ---
            doc
                .fillColor('#444444')
                .fontSize(20)
                .text('MKP Designs', 110, 57)
                .fontSize(10)
                .text('MKP Designs', 200, 50, { align: 'right' })
                .text('Sambalpur', 200, 65, { align: 'right' })
                .text('Odisha, India', 200, 80, { align: 'right' })
                .moveDown();

            // --- Invoice Details ---
            doc
                .fillColor('#000000')
                .fontSize(20)
                .text('INVOICE', 50, 160);

            generateHr(doc, 185);

            const customerInformationTop = 200;

            doc
                .fontSize(10)
                .text('Invoice Number:', 50, customerInformationTop)
                .font('Helvetica-Bold')
                .text(transaction._id.toString().slice(-6).toUpperCase(), 150, customerInformationTop)
                .font('Helvetica')
                .text('Invoice Date:', 50, customerInformationTop + 15)
                .text(new Date(transaction.createdAt).toDateString(), 150, customerInformationTop + 15)
                .text('Transaction ID:', 50, customerInformationTop + 30)
                .text(transaction.razorpayPaymentId || 'N/A', 150, customerInformationTop + 30)

                .font('Helvetica-Bold')
                .text(user.name, 300, customerInformationTop)
                .font('Helvetica')
                .text(user.email, 300, customerInformationTop + 15)
                .moveDown();

            generateHr(doc, 252);

            // --- Table Header ---
            const invoiceTableTop = 330;

            doc.font('Helvetica-Bold');
            generateTableRow(
                doc,
                invoiceTableTop,
                'Item',
                'Description',
                'Unit Cost',
                'Quantity',
                'Line Total'
            );
            generateHr(doc, invoiceTableTop + 20);
            doc.font('Helvetica');

            // --- Table Items ---
            const itemCode = transaction.designTitle;
            const description = "Architectural Design License";
            const amount = transaction.amount;

            generateTableRow(
                doc,
                invoiceTableTop + 30,
                itemCode,
                description,
                formatCurrency(amount),
                1,
                formatCurrency(amount)
            );

            generateHr(doc, invoiceTableTop + 60);

            // --- Total ---
            const subtotalPosition = invoiceTableTop + 80;
            generateTableRow(
                doc,
                subtotalPosition,
                '',
                '',
                'Subtotal',
                '',
                formatCurrency(amount)
            );

            const paidToDatePosition = subtotalPosition + 20;
            generateTableRow(
                doc,
                paidToDatePosition,
                '',
                '',
                'Total Paid',
                '',
                formatCurrency(amount)
            );

            // --- Footer ---
            doc
                .fontSize(10)
                .text(
                    'Thank you for your business. For any queries, contact support@mkpdesigns.com',
                    50,
                    780,
                    { align: 'center', width: 500 }
                );

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

function generateHr(doc, y) {
    doc
        .strokeColor('#aaaaaa')
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();
}

function formatCurrency(amount) {
    return "INR " + parseFloat(amount).toFixed(2);
}

function generateTableRow(
    doc,
    y,
    item,
    description,
    unitCost,
    quantity,
    lineTotal
) {
    doc
        .fontSize(10)
        .text(item, 50, y)
        .text(description, 150, y)
        .text(unitCost, 280, y, { width: 90, align: 'right' })
        .text(quantity, 370, y, { width: 90, align: 'right' })
        .text(lineTotal, 0, y, { align: 'right' });
}

module.exports = { generateInvoicePDF };
