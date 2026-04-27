const mongoose = require('mongoose');

const CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Bills & Utilities', 'Healthcare', 'Education', 'Travel',
  'Personal Care', 'Investments', 'Gifts', 'Other'
];

const ExpenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 100 },
  amount: { type: Number, required: [true, 'Amount is required'], min: [0.01, 'Amount must be positive'] },
  category: { type: String, required: [true, 'Category is required'], enum: CATEGORIES },
  type: { type: String, enum: ['expense', 'income'], default: 'expense' },
  date: { type: Date, required: [true, 'Date is required'], default: Date.now },
  notes: { type: String, trim: true, maxlength: 500 },
  tags: [{ type: String, trim: true }],
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'UPI', 'Other'],
    default: 'Cash'
  },
}, { timestamps: true });

ExpenseSchema.index({ user: 1, date: -1 });
ExpenseSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
module.exports.CATEGORIES = CATEGORIES;