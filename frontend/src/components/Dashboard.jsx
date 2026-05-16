import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  X,
  Edit2,
  Trash2,
  Search,
  Filter
} from 'lucide-react';

import api from '../api';

export default function Dashboard() {

  const [portfolio, setPortfolio] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  const [type, setType] = useState('BUY');
  const [formError, setFormError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const [editItem, setEditItem] = useState(null);

  // 🔥 NEW STATES
  const [livePrice, setLivePrice] = useState(null);
  const [fetchingPrice, setFetchingPrice] = useState(false);

  // 🔥 FETCH PORTFOLIO + TRANSACTIONS
  const fetchData = async () => {
    try {

      const [portfolioRes, transactionsRes] = await Promise.all([
        api.get('/portfolio'),
        api.get('/portfolio/transactions')
      ]);

      setPortfolio(portfolioRes.data);
      setTransactions(transactionsRes.data);

      setLoading(false);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔥 FETCH LIVE STOCK PRICE
  const fetchLivePrice = async () => {

    if (!symbol) {
      alert("Enter stock symbol first");
      return;
    }

    try {

      setFetchingPrice(true);

      const res = await api.get(`/stocks/price/${symbol.toUpperCase()}`);

      setPrice(res.data.price);
      setLivePrice(res.data.price);

    } catch (err) {

      console.error(err);
      alert("Failed to fetch stock price");

    } finally {

      setFetchingPrice(false);
    }
  };

  // 🔥 BUY / SELL
  const handleSubmit = async (e) => {

    e.preventDefault();

    setFormError('');

    try {

      const endpoint =
        type === 'BUY'
          ? '/portfolio/buy'
          : '/portfolio/sell';

      await api.post(endpoint, {
        symbol: symbol.toUpperCase(),
        quantity: Number(quantity),
        price: Number(price)
      });

      setShowForm(false);

      setSymbol('');
      setQuantity('');
      setPrice('');
      setLivePrice(null);

      fetchData();

    } catch (err) {

      setFormError(
        err.response?.data?.message ||
        'Transaction failed'
      );
    }
  };

  // 🔥 DELETE STOCK
  const handleDelete = async (id) => {

    if (!window.confirm('Delete this stock?')) return;

    try {

      await api.delete(`/portfolio/${id}`);

      fetchData();

    } catch (err) {

      console.error(err);
    }
  };

  // 🔥 EDIT STOCK
  const handleEditSubmit = async (e) => {

    e.preventDefault();

    try {

      await api.put(`/portfolio/${editItem._id}`, {
        quantity: Number(editItem.quantity),
        averagePrice: Number(editItem.averagePrice),
        currentPrice: Number(editItem.currentPrice)
      });

      setEditItem(null);

      fetchData();

    } catch (err) {

      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-brand-primary">
        Loading dashboard...
      </div>
    );
  }

  // 🔥 CALCULATIONS
  let totalInvestment = 0;
  let totalCurrentValue = 0;
  let totalProfit = 0;
  let totalLoss = 0;

  const enrichedPortfolio = portfolio.map(item => {

    const currentPrice =
      item.currentPrice !== undefined
        ? item.currentPrice
        : item.averagePrice;

    const investment =
      item.quantity * item.averagePrice;

    const currentValue =
      item.quantity * currentPrice;

    const profitLoss =
      currentValue - investment;

    const profitLossPercent =
      investment > 0
        ? (profitLoss / investment) * 100
        : 0;

    totalInvestment += investment;
    totalCurrentValue += currentValue;

    if (profitLoss >= 0) {
      totalProfit += profitLoss;
    } else {
      totalLoss += Math.abs(profitLoss);
    }

    return {
      ...item,
      currentPrice,
      investment,
      currentValue,
      profitLoss,
      profitLossPercent
    };
  });

  // 🔥 SEARCH + FILTER
  const filteredPortfolio = enrichedPortfolio.filter(item => {

    const matchesSearch =
      item.symbol
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    let matchesFilter = true;

    if (filterType === 'PROFIT') {
      matchesFilter = item.profitLoss >= 0;
    }

    if (filterType === 'LOSS') {
      matchesFilter = item.profitLoss < 0;
    }

    return matchesSearch && matchesFilter;
  });

  return (

    <div className="space-y-8 animate-fade-in">

      {/* 🔥 OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h3 className="text-dark-muted mb-2">
            Total Value
          </h3>

          <p className="text-3xl font-bold">
            ${totalCurrentValue.toFixed(2)}
          </p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h3 className="text-dark-muted mb-2">
            Total Profit
          </h3>

          <p className="text-3xl font-bold text-green-400">
            +${totalProfit.toFixed(2)}
          </p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h3 className="text-dark-muted mb-2">
            Total Loss
          </h3>

          <p className="text-3xl font-bold text-red-400">
            -${totalLoss.toFixed(2)}
          </p>
        </div>

      </div>

      {/* 🔥 PORTFOLIO */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">

          <h2 className="text-2xl font-bold">
            Your Portfolio
          </h2>

          <div className="flex gap-3 flex-wrap">

            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search stock..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
            />

            {/* FILTER */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
            >
              <option value="ALL">All</option>
              <option value="PROFIT">Profit</option>
              <option value="LOSS">Loss</option>
            </select>

            {/* ADD BTN */}
            <button
              onClick={() => setShowForm(true)}
              className="bg-brand-primary hover:bg-brand-primary/80 px-4 py-2 rounded-lg text-white font-semibold"
            >
              + Add Transaction
            </button>

          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b border-dark-border text-dark-muted text-left">
                <th className="pb-3">Stock</th>
                <th className="pb-3">Qty</th>
                <th className="pb-3">Buy Price</th>
                <th className="pb-3">Current Price</th>
                <th className="pb-3">P/L</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredPortfolio.map(item => {

                const isProfit = item.profitLoss >= 0;

                return (

                  <tr
                    key={item._id}
                    className="border-b border-dark-border"
                  >

                    <td className="py-4 font-bold">
                      {item.symbol}
                    </td>

                    <td>{item.quantity}</td>

                    <td>
                      ${item.averagePrice.toFixed(2)}
                    </td>

                    <td>
                      ${item.currentPrice.toFixed(2)}
                    </td>

                    <td>
                      <div className={isProfit ? 'text-green-400' : 'text-red-400'}>
                        {isProfit ? '+' : ''}
                        ${item.profitLoss.toFixed(2)}
                      </div>

                      <div className="text-xs">
                        {isProfit ? '+' : ''}
                        {item.profitLossPercent.toFixed(2)}%
                      </div>
                    </td>

                    <td className="text-right space-x-2">

                      <button
                        onClick={() => setEditItem(item)}
                        className="p-2 bg-dark-bg rounded-lg"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 bg-dark-bg rounded-lg text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </div>

      {/* 🔥 ADD TRANSACTION MODAL */}
      {showForm && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-md relative">

            {/* CLOSE */}
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-6">
              Add Transaction
            </h2>

            {/* ERROR */}
            {formError && (
              <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* TYPE */}
              <div className="flex gap-4">

                <button
                  type="button"
                  onClick={() => setType('BUY')}
                  className={`flex-1 py-2 rounded-lg ${
                    type === 'BUY'
                      ? 'bg-blue-500 text-white'
                      : 'bg-dark-bg'
                  }`}
                >
                  BUY
                </button>

                <button
                  type="button"
                  onClick={() => setType('SELL')}
                  className={`flex-1 py-2 rounded-lg ${
                    type === 'SELL'
                      ? 'bg-green-500 text-white'
                      : 'bg-dark-bg'
                  }`}
                >
                  SELL
                </button>

              </div>

              {/* SYMBOL */}
              <div>

                <label className="block text-sm mb-1">
                  Stock Symbol
                </label>

                <input
                  type="text"
                  required
                  value={symbol}
                  onChange={(e) =>
                    setSymbol(e.target.value.toUpperCase())
                  }
                  placeholder="AAPL"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white"
                />

                {/* 🔥 FETCH BUTTON */}
                <button
                  type="button"
                  onClick={fetchLivePrice}
                  disabled={fetchingPrice}
                  className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded-lg mt-3 text-white font-semibold"
                >
                  {fetchingPrice
                    ? 'Fetching Live Price...'
                    : 'Fetch Live Price'}
                </button>

                {/* 🔥 LIVE PRICE */}
                {livePrice && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg text-center mt-3">
                    📈 Live Price: $
                    {Number(livePrice).toFixed(2)}
                  </div>
                )}

              </div>

              {/* QTY + PRICE */}
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm mb-1">
                    Quantity
                  </label>

                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">
                    Price
                  </label>

                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white"
                  />
                </div>

              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                className={`w-full py-3 rounded-lg text-white font-bold ${
                  type === 'BUY'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                Confirm {type}
              </button>

            </form>

          </div>

        </div>
      )}
    </div>
  );
}