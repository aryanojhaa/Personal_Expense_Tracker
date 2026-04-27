import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getExpenses, getAnalytics, deleteExpense, formatCurrency, formatDate, CATEGORY_COLORS } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ExpenseModal from '../components/ExpenseModal';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, sub, color = 'var(--text)' }) => (
  <div className="card">
    <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Syne, sans-serif', color, marginBottom: 4 }}>{value}</div>
    {sub && <div style={{ fontSize: 13, color: 'var(--text2)' }}>{sub}</div>}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [expRes, anaRes] = await Promise.all([
        getExpenses({ limit: 6, sort: '-date' }),
        getAnalytics({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 })
      ]);
      setExpenses(expRes.data.expenses);
      setAnalytics(anaRes.data.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try { await deleteExpense(id); toast.success('Deleted!'); fetchData(); }
    catch { toast.error('Failed to delete'); }
  };

  const fmt = (n) => formatCurrency(n, user?.currency || 'USD');
  const budgetUsed = user?.monthlyBudget ? ((analytics?.totalExpenses || 0) / user.monthlyBudget) * 100 : 0;

  if (loading) return <div className="page-fade" style={{ color: 'var(--text2)', paddingTop: 40, textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="page-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            Good {new Date().getHours() < 12 ? 'morning' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text2)' }}>Here's your financial overview for {new Date().toLocaleString('default', { month: 'long' })}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditExpense(null); setShowModal(true); }}>
          + Add Transaction
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Expenses" value={fmt(analytics?.totalExpenses || 0)} sub="This month" color="var(--red)" />
        <StatCard label="Total Income" value={fmt(analytics?.totalIncome || 0)} sub="This month" color="var(--green)" />
        <StatCard label="Balance" value={fmt(analytics?.balance || 0)} sub="Income - Expenses"
          color={(analytics?.balance || 0) >= 0 ? 'var(--green)' : 'var(--red)'} />
      </div>

      {user?.monthlyBudget > 0 && (
        <div className="card" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Monthly Budget</span>
            <span style={{ fontSize: 14, color: 'var(--text2)' }}>{fmt(analytics?.totalExpenses || 0)} / {fmt(user.monthlyBudget)}</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg2)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4, transition: 'width 0.5s',
              width: `${Math.min(budgetUsed, 100)}%`,
              background: budgetUsed > 90 ? 'var(--red)' : budgetUsed > 70 ? 'var(--yellow)' : 'var(--accent)'
            }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>{budgetUsed.toFixed(1)}% used</div>
        </div>
      )}

      {analytics?.categoryBreakdown?.length > 0 && (
        <div className="card" style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Category Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {analytics.categoryBreakdown.slice(0, 5).map(cat => {
              const pct = ((cat.total / analytics.totalExpenses) * 100).toFixed(1);
              return (
                <div key={cat._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 14 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[cat._id] || '#888', display: 'inline-block' }} />
                      {cat._id}
                    </span>
                    <span style={{ color: 'var(--text2)' }}>{fmt(cat.total)} <span style={{ color: 'var(--text3)', fontSize: 12 }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg2)', borderRadius: 2 }}>
                    <div style={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: CATEGORY_COLORS[cat._id] || '#888' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16 }}>Recent Transactions</h3>
          <Link to="/expenses" style={{ fontSize: 13, color: 'var(--accent2)' }}>View all →</Link>
        </div>
        {expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text3)' }}>
            No transactions yet.
            <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ fontSize: 13, padding: '6px 14px', marginLeft: 8 }}>Add one</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {expenses.map(exp => (
              <div key={exp._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 10, background: 'var(--bg2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: CATEGORY_COLORS[exp.category] || '#888' }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{exp.category} · {formatDate(exp.date)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span style={{ fontWeight: 600, color: exp.type === 'income' ? 'var(--green)' : 'var(--red)', fontSize: 15 }}>
                    {exp.type === 'income' ? '+' : '-'}{fmt(exp.amount)}
                  </span>
                  <button onClick={() => { setEditExpense(exp); setShowModal(true); }} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 12 }}>Edit</button>
                  <button onClick={() => handleDelete(exp._id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12 }}>Del</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ExpenseModal expense={editExpense} onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchData(); }} />
      )}
    </div>
  );
};

export default Dashboard;