const express = require('express');
const router = express.Router();
const StockLog = require('../models/StockLog');

// GET all stock logs
router.get('/', async (req, res) => {
    try {
        const logs = await StockLog.find().sort({ dateTime: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stock logs', details: err.message });
    }
});

// GET stock logs by product ID
router.get('/product/:productId', async (req, res) => {
    try {
        const logs = await StockLog.find({ productId: req.params.productId }).sort({ dateTime: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch product stock logs', details: err.message });
    }
});

// POST create stock log
router.post('/', async (req, res) => {
    try {
        const log = new StockLog(req.body);
        await log.save();
        res.status(201).json(log);
    } catch (err) {
        res.status(400).json({ error: 'Failed to create stock log', details: err.message });
    }
});

module.exports = router;
