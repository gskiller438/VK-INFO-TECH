const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    invoiceNumber: { type: String, required: true },
    customerId: { type: String, default: '' },
    customerName: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    customerAddress: { type: String, default: '' },
    date: { type: String, required: true },
    time: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    paymentMode: { type: String, default: 'Cash' },
    dueDate: { type: String, default: '' },
    products: { type: Array, default: [] },
    branch: { type: String, required: true, default: 'Main' },
    createdBy: { type: String, default: 'System' }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
