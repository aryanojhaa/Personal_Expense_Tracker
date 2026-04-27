import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createExpense, updateExpense, CATEGORIES, PAYMENT_METHODS } from '../utils/api';

const ExpenseModal = ({ expense, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: '', amount: '', category: 'Food & Dining', type: 'expense',
    date: new Date().toISOString().split('T')[0],
    notes: '', paymentMethod: 'Cash', tags: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      setForm({
        title: expense.title, amount: expense.amount,
        category: expense.category, type: expense.type,
        date: new Date(expense.date).toISOString().split('T')[0],
        notes: expense.notes || '', paymentMethod: expense.paymentMethod || 'Cash',
        tags: (expense.tags || []).join(', ')
      });
    }
  }, [expense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return toast.error('Title and amount are required');
    setLoading(true);
    try {
      const payload = {
        ...form, amount: parseFloat(form.amount),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : []
      };
      if (expense) {
        await updateExpense(expense._id, payload);
        toast.success('Expense updated!');
      } else {
        await createExpense(payload);
        toast.success('Expense added!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20 }}>{expense ? 'Edit' : 'Add'} Transaction</h3>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px 10px' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Type toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {['expense', 'income'].map(t => (
              <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                style={{
                  padding: '10px', borderRadius: 10, border: '1px solid', fontWeight: 500,
                  fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                  background: form.type === t ? (t === 'expense' ? 'rgba(248,113,113,0.2)' : 'rgba(45,212,191,0.2)') : 'var(--bg2)',
                  color: form.type === t ? (t === 'expense' ? 'var(--red)' : 'var(--green)') : 'var(--text2)',
                  borderColor: form.type === t ? (t === 'expense' ? 'rgba(248,113,113,0.4)' : 'rgba(45,212,191,0.4)') : 'var(--border)',
                }}>
                {t === 'expense' ? '↓ Expense' : '↑ Income'}
              </button>
            ))}
          </div>

          <div className="input-group">
            <label>Title</label>
            <input type="text" placeholder="e.g. Coffee at Starbucks" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group">
              <label>Amount</label>
              <input type="number" placeholder="0.00" step="0.01" min="0" value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Date</label>
              <input type="date" value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
          </div>

          <div className="input-group">
            <label>Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label>Payment Method</label>
            <select value={form.paymentMethod} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))}>
              {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label>Notes (optional)</label>
            <input type="text" placeholder="Any additional details..." value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>

          <div className="input-group">
            <label>Tags (comma separated)</label>
            <input type="text" placeholder="food, work, monthly" value={form.tags}
              onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Saving...' : expense ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;