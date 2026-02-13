const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// GET all customers
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch customers', details: err.message });
    }
});

// GET single customer
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findOne({ id: req.params.id });
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch customer', details: err.message });
    }
});

// POST create customer
router.post('/', async (req, res) => {
    try {
        // Auto-Generate ID: VKC0001, VKC0002, ...
        const lastCustomer = await Customer.findOne().sort({ id: -1 });
        let newId = 'VKC0001';

        if (lastCustomer && lastCustomer.id && lastCustomer.id.startsWith('VKC')) {
            const lastNum = parseInt(lastCustomer.id.replace('VKC', ''), 10);
            if (!isNaN(lastNum)) {
                newId = `VKC${(lastNum + 1).toString().padStart(4, '0')}`;
            }
        }

        const customerData = { ...req.body };
        delete customerData.id;
        delete customerData._id;

        const customer = await Customer.create({
            ...customerData,
            id: newId
        });
        res.status(201).json(customer);
    } catch (err) {
        res.status(400).json({ error: 'Failed to create customer', details: err.message });
    }
});

// PUT update customer
router.put('/:id', async (req, res) => {
    try {
        const customer = await Customer.findOneAndUpdate(
            { id: req.params.id },
            { ...req.body, updatedAt: new Date().toISOString().split('T')[0] },
            { new: true }
        );
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        res.json(customer);
    } catch (err) {
        res.status(400).json({ error: 'Failed to update customer', details: err.message });
    }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
    try {
        const customer = await Customer.findOneAndDelete({ id: req.params.id });
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        res.json({ message: 'Customer deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete customer', details: err.message });
    }
});

module.exports = router;
