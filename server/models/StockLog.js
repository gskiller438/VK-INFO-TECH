const mongoose = require('mongoose');

const stockLogSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    productId: { type: String, required: true },
    productName: { type: String, default: '' },
    oldStock: { type: Number, default: 0 },
    newStock: { type: Number, default: 0 },
    changeType: { type: String, enum: ['IN', 'OUT'], required: true },
    quantity: { type: Number, required: true },
    reason: { type: String, default: '' },
    remarks: { type: String, default: '' },
    updatedBy: { type: String, default: '' },
    dateTime: { type: String, default: () => new Date().toISOString() },
    branch: { type: String, required: true, default: 'Main' }
});

module.exports = mongoose.model('StockLog', stockLogSchema);
