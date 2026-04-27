import React, { useState, useEffect, useCallback } from 'react';
import { getExpenses, deleteExpense, formatCurrency, formatDate, CATEGORIES, CATEGORY_COLORS } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ExpenseModal from '../components/ExpenseModal';
import toast from 'react-hot-toast';

const Expenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [filters, setFilters] = useState({ category: '', type: '', startDate: '', endDate: '' });
  const [page, setPage] = useState(1);
  const LIMIT = 15;
  const fmt = (n) => formatCurrency(n, user?.currency || 'USD');

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getExpenses({ ...filters, limit: LIMIT, page, sort: '-date' });
      setExpenses(data.expenses);
      setTotal(data.total);
    } catch { toast.error('Failed to load expenses'); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try { await deleteExpense(id); toast.success('Deleted!'); fetchExpenses(); }
    catch { toast.error('Failed'); }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const filterStyle = { background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 13 };

  return (
    <div className="page-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Transactions</h1>
          <p style={{ color: 'var(--text2)' }}>{total} total records</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditExpense(null); setShowModal(true); }}>
          + Add Transaction
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', padding: 16 }}>
        <select value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))} style={{ ...filterStyle, minWidth: 120 }}>
          <option value="">All Types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <select value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))} style={{ ...filterStyle, minWidth: 160 }}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <input type="date" value={filters.startDate} onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))} style={filterStyle} />
        <input type="date" value={filters.endDate} onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))} style={filterStyle} />
        <button className="btn btn-ghost" style={{ fontSize: 13 }}
          onClick={() => setFilters({ category: '', type: '', startDate: '', endDate: '' })}>Clear</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>Loading...</div>
        ) : expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text3)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>◈</div>
            No transactions found
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text3)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {['Title', 'Category', 'Amount', 'Date', 'Method', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: h === 'Amount' || h === 'Actions' ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, i) => (
                  <tr key={exp._id} style={{ borderBottom: i < expenses.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[exp.category] || '#888', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 500 }}>{exp.title}</div>
                          {exp.notes && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{exp.notes.substring(0, 30)}{exp.notes.length > 30 ? '...' : ''}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: 'var(--bg2)', color: 'var(--text2)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>
                        {exp.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: exp.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                      {exp.type === 'income' ? '+' : '-'}{fmt(exp.amount)}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text2)', fontSize: 13 }}>{formatDate(exp.date)}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text3)', fontSize: 13 }}>{exp.paymentMethod}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                          onClick={() => { setEditExpense(exp); setShowModal(true); }}>Edit</button>
                        <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }}
                          onClick={() => handleDelete(exp._id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16, borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 12px', fontSize: 13 }}>← Prev</button>
                <span style={{ padding: '6px 12px', color: 'var(--text2)', fontSize: 13 }}>Page {page} of {totalPages}</span>
                <button className="btn btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px', fontSize: 13 }}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <ExpenseModal expense={editExpense} onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchExpenses(); }} />
      )}
    </div>
  );
};

export default Expenses;