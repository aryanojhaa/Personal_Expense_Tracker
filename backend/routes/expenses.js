const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { category, type, startDate, endDate, limit = 50, page = 1, sort = '-date' } = req.query;
    const query = { user: req.user._id };

    if (category) query.category = category;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ success: true, count: expenses.length, total, page: Number(page), expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', [
  body('title').notEmpty().trim().withMessage('Title required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount required'),
  body('category').notEmpty().withMessage('Category required'),
  body('date').isISO8601().withMessage('Valid date required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const expense = await Expense.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/analytics/summary', async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month } = req.query;
    const matchQuery = { user: req.user._id };

    if (month) {
      matchQuery.date = {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0, 23, 59, 59)
      };
    } else {
      matchQuery.date = {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31, 23, 59, 59)
      };
    }

    const categoryBreakdown = await Expense.aggregate([
      { $match: { ...matchQuery, type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    const monthlyTrend = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) } } },
      {
        $group: {
          _id: { month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    const totals = await Expense.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    const totalExpenses = totals.find(t => t._id === 'expense')?.total || 0;
    const totalIncome = totals.find(t => t._id === 'income')?.total || 0;

    res.json({
      success: true,
      data: { totalExpenses, totalIncome, balance: totalIncome - totalExpenses, categoryBreakdown, monthlyTrend }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;