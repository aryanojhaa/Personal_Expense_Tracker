import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getAnalytics, formatCurrency, CATEGORY_COLORS } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Analytics = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const fmt = (n) => formatCurrency(n, user?.currency || 'USD');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await getAnalytics({ year });
        setData(res.data.data);
      } catch { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    };
    fetchAnalytics();
  }, [year]);

  const monthlyData = MONTHS.map((month, i) => {
    const mNum = i + 1;
    const expEntry = data?.monthlyTrend?.find(t => t._id.month === mNum && t._id.type === 'expense');
    const incEntry = data?.monthlyTrend?.find(t => t._id.month === mNum && t._id.type === 'income');
    return { month, expense: expEntry?.total || 0, income: incEntry?.total || 0 };
  });

  const pieData = (data?.categoryBreakdown || []).map(c => ({
    name: c._id, value: c.total, color: CATEGORY_COLORS[c._id] || '#888'
  }));

  const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
        {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</div>)}
      </div>
    );
  };

  return (
    <div className="page-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Analytics</h1>
          <p style={{ color: 'var(--text2)' }}>Visual insights into your spending habits</p>
        </div>
        <select value={year} onChange={e => setYear(Number(e.target.value))}
          style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 16px', color: 'var(--text)', fontSize: 14 }}>
          {[2023, 2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>Loading analytics...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Expenses', value: fmt(data?.totalExpenses || 0), color: 'var(--red)' },
              { label: 'Total Income', value: fmt(data?.totalIncome || 0), color: 'var(--green)' },
              { label: 'Net Balance', value: fmt(data?.balance || 0), color: (data?.balance || 0) >= 0 ? 'var(--green)' : 'var(--red)' },
            ].map(s => (
              <div key={s.label} className="card">
                <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Syne, sans-serif', color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 20 }}>Monthly Income vs Expenses — {year}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}`} />
                <Tooltip content={customTooltip} />
                <Legend wrapperStyle={{ fontSize: 13, color: 'var(--text2)' }} />
                <Bar dataKey="income" name="Income" fill="var(--green)" radius={[4,4,0,0]} fillOpacity={0.85} />
                <Bar dataKey="expense" name="Expense" fill="var(--red)" radius={[4,4,0,0]} fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 20 }}>Spending by Category</h3>
              {pieData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No expense data</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                      outerRadius={100} innerRadius={50} paddingAngle={2}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.9} />)}
                    </Pie>
                    <Tooltip content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div style={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
                          <div style={{ fontWeight: 600 }}>{payload[0].name}</div>
                          <div style={{ color: payload[0].payload.color }}>{fmt(payload[0].value)}</div>
                        </div>
                      ) : null
                    } />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="card" style={{ overflowY: 'auto', maxHeight: 340 }}>
              <h3 style={{ fontSize: 16, marginBottom: 16 }}>Top Categories</h3>
              {(data?.categoryBreakdown || []).length === 0 ? (
                <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 20 }}>No data</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(data?.categoryBreakdown || []).map((cat, i) => (
                    <div key={cat._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, color: 'var(--text3)', width: 20 }}>#{i + 1}</span>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: CATEGORY_COLORS[cat._id] || '#888' }} />
                        <span style={{ fontSize: 14 }}>{cat._id}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{fmt(cat.total)}</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)' }}>{cat.count} txns</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 20 }}>Balance Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}`} />
                <Tooltip content={customTooltip} />
                <Line type="monotone" dataKey="income" name="Income" stroke="var(--green)" strokeWidth={2} dot={{ r: 3, fill: 'var(--green)' }} />
                <Line type="monotone" dataKey="expense" name="Expense" stroke="var(--red)" strokeWidth={2} dot={{ r: 3, fill: 'var(--red)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;