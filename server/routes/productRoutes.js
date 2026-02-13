const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products', details: err.message });
    }
});

// GET single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch product', details: err.message });
    }
});

// POST create product
router.post('/', async (req, res) => {
    try {
        // Auto-Generate ID: VKP0001, VKP0002, ...
        const lastProduct = await Product.findOne().sort({ id: -1 });
        let newId = 'VKP0001';

        if (lastProduct && lastProduct.id && lastProduct.id.startsWith('VKP')) {
            const lastNum = parseInt(lastProduct.id.replace('VKP', ''), 10);
            if (!isNaN(lastNum)) {
                newId = `VKP${(lastNum + 1).toString().padStart(4, '0')}`;
            }
        }

        const productData = { ...req.body };
        delete productData.id;
        delete productData._id;

        const product = await Product.create({
            ...productData,
            id: newId
        });
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: 'Failed to create product', details: err.message });
    }
});

// PUT update product
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { id: req.params.id },
            { ...req.body, updatedAt: new Date().toISOString().split('T')[0] },
            { new: true }
        );
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: 'Failed to update product', details: err.message });
    }
});

// DELETE product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ id: req.params.id });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete product', details: err.message });
    }
});

// PATCH update stock only
router.patch('/:id/stock', async (req, res) => {
    try {
        const { stock } = req.body;
        const product = await Product.findOneAndUpdate(
            { id: req.params.id },
            { stock, updatedAt: new Date().toISOString().split('T')[0] },
            { new: true }
        );
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: 'Failed to update stock', details: err.message });
    }
});

module.exports = router;
