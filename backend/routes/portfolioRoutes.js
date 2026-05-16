const express = require('express');
const auth = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const portfolio = await Portfolio.find({ userId: req.user.id });
        res.json(portfolio);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/buy', auth, async (req, res) => {
    const { symbol, quantity, price } = req.body;
    try {
        let item = await Portfolio.findOne({ userId: req.user.id, symbol });
        if (item) {
            const totalCost = (item.quantity * item.averagePrice) + (quantity * price);
            item.quantity += quantity;
            item.averagePrice = totalCost / item.quantity;
            item.currentPrice = price;
            await item.save();
        } else {
            item = new Portfolio({ userId: req.user.id, symbol, quantity, averagePrice: price, currentPrice: price });
            await item.save();
        }

        const transaction = new Transaction({ userId: req.user.id, symbol, type: 'BUY', quantity, price });
        await transaction.save();

        res.json(item);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/sell', auth, async (req, res) => {
    const { symbol, quantity, price } = req.body;
    try {
        let item = await Portfolio.findOne({ userId: req.user.id, symbol });
        if (!item || item.quantity < quantity) {
            return res.status(400).json({ message: 'Insufficient quantity' });
        }

        const realizedProfit = (price - item.averagePrice) * quantity;

        item.quantity -= quantity;
        if (item.quantity === 0) {
            await Portfolio.deleteOne({ _id: item._id });
        } else {
            await item.save();
        }

        const transaction = new Transaction({ userId: req.user.id, symbol, type: 'SELL', quantity, price, realizedProfit });
        await transaction.save();

        res.json({ message: 'Stock sold successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/transactions', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id', auth, async (req, res) => {
    const { quantity, averagePrice, currentPrice } = req.body;
    try {
        let item = await Portfolio.findOne({ _id: req.params.id, userId: req.user.id });
        if (!item) return res.status(404).json({ message: 'Stock not found in portfolio' });

        item.quantity = quantity;
        item.averagePrice = averagePrice;
        if (currentPrice !== undefined) {
            item.currentPrice = currentPrice;
        }
        await item.save();

        res.json(item);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const item = await Portfolio.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!item) return res.status(404).json({ message: 'Stock not found' });

        res.json({ message: 'Stock removed from portfolio' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
