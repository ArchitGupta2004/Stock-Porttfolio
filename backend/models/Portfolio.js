const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true, uppercase: true },
    quantity: { type: Number, required: true, min: 0 },
    averagePrice: { type: Number, required: true },
    currentPrice: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
