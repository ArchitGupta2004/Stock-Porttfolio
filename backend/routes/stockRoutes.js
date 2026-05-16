const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/price/:symbol', async (req, res) => {
    try {
        const symbol = req.params.symbol;

        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;

        const response = await axios.get(url);

        const data = response.data["Global Quote"];

        if (!data || !data["05. price"]) {
            return res.status(404).json({ message: "Stock not found" });
        }

        res.json({
            symbol: data["01. symbol"],
            price: data["05. price"]
        });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;