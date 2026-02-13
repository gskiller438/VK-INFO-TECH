const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Invoice = require('../models/Invoice');

// GET all invoices
router.get('/', async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ date: -1 });
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch invoices', details: err.message });
    }
});

// GET invoices by customer ID
router.get('/customer/:customerId', async (req, res) => {
    try {
        const invoices = await Invoice.find({ customerId: req.params.customerId }).sort({ date: -1 });
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch customer invoices', details: err.message });
    }
});

// GET single invoice
router.get('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findOne({
            $or: [{ id: req.params.id }, { invoiceNumber: req.params.id }]
        });
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
        res.json(invoice);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch invoice', details: err.message });
    }
});

// POST create invoice
router.post('/', async (req, res) => {
    try {
        const { products, invoiceNumber, branch, createdBy } = req.body;
        const Product = require('../models/Product');
        const StockLog = require('../models/StockLog');

        // 1. Validate Stock Availability
        for (const p of products) {
            const product = await Product.findOne({ name: p.name });
            if (!product) {
                return res.status(400).json({ error: `Product not found: ${p.name}` });
            }
            if (product.stock < p.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${p.name}. Available: ${product.stock}, Requested: ${p.quantity}` });
            }
        }

        // 2. Deduct Stock & Create Logs
        for (const p of products) {
            const product = await Product.findOne({ name: p.name });
            const oldStock = product.stock;
            const newStock = oldStock - p.quantity;

            // Update Product
            await Product.findOneAndUpdate(
                { _id: product._id },
                {
                    $inc: { stock: -p.quantity },
                    updatedAt: new Date().toISOString().split('T')[0]
                }
            );

            // Create Log
            const stockLog = new StockLog({
                id: `L${Date.now()}_${product.id}`,
                productId: product.id,
                productName: product.name,
                oldStock: oldStock,
                newStock: newStock,
                changeType: 'OUT',
                quantity: p.quantity,
                reason: 'Billing',
                remarks: `Sale via Invoice #${invoiceNumber}`,
                branch: branch || 'Main',
                updatedBy: createdBy || 'System',
                dateTime: new Date().toLocaleString('en-IN')
            });
            await stockLog.save();
        }

        // 3. Create Invoice
        const invoice = new Invoice(req.body);
        await invoice.save();

        // 4. Update Customer Statistics
        if (invoice.customerId) {
            const Customer = require('../models/Customer');
            await Customer.findOneAndUpdate(
                { id: invoice.customerId },
                {
                    $inc: { totalPurchases: invoice.grandTotal || invoice.amount || 0, totalOrders: 1 },
                    $set: { lastPurchaseDate: invoice.date, updatedAt: new Date().toISOString().split('T')[0] }
                }
            );
        }

        res.status(201).json(invoice);
    } catch (err) {
        res.status(400).json({ error: 'Failed to create invoice', details: err.message });
    }
});

// PUT update invoice
router.put('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
        res.json(invoice);
    } catch (err) {
        res.status(400).json({ error: 'Failed to update invoice', details: err.message });
    }
});

module.exports = router;
