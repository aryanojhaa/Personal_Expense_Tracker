# Budgetly — Personal Expense Tracker

A full-stack application for tracking personal finances with analytics.

## Tech Stack
- **Frontend**: React 18, React Router v6, Recharts, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + bcryptjs

## Project Structure
```
expense-tracker/
├── backend/
│   ├── models/          # Mongoose schemas (User, Expense)
│   ├── routes/          # Express routes (auth, expenses)
│   ├── middleware/       # JWT auth middleware
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    └── src/
        ├── components/  # Sidebar, ExpenseModal
        ├── context/     # AuthContext (global state)
        ├── pages/       # Dashboard, Expenses, Analytics
        ├── utils/       # api.js (axios calls, helpers)
        ├── App.js
        └── index.css
```

## Features
- JWT Authentication (register/login/logout)
- CRUD for expenses and income
- Category filtering, date range filtering, pagination
- Category-wise analytics (pie chart)
- Monthly income vs expense bar chart
- Balance trend line chart
- Monthly budget tracking with progress bar
- Responsive dark UI

## API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |
| GET | /api/expenses | Get all expenses (with filters) |
| POST | /api/expenses | Create expense |
| PUT | /api/expenses/:id | Update expense |
| DELETE | /api/expenses/:id | Delete expense |
| GET | /api/expenses/analytics/summary | Get analytics data |