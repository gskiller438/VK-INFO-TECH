const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, default: '' },
    email: { type: String, default: '' },
    gstin: { type: String, default: '' },
    customerType: { type: String, enum: ['Retail', 'Wholesale'], default: 'Retail' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    totalPurchases: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    lastPurchaseDate: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
    updatedAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
    branch: { type: String, required: true, default: 'Main' },
    createdBy: { type: String, default: 'System' }
});

module.exports = mongoose.model('Customer', customerSchema);
