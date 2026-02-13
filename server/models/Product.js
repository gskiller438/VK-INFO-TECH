const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brand: { type: String, default: '' },
    category: { type: String, default: '' },
    description: { type: String, default: '' },
    price: { type: Number, required: true, default: 0 },
    stock: { type: Number, default: 0 },
    minStock: { type: Number, default: 0 },
    unit: { type: String, default: 'pcs' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    serialNumber: { type: String, default: '' },
    warranty: { type: String, default: '' },
    model: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
    updatedAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
    branch: { type: String, required: true, default: 'Main' },
    createdBy: { type: String, default: 'System' }
});

module.exports = mongoose.model('Product', productSchema);
