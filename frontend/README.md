# Personal Finance Tracker

A modern, student-friendly personal finance tracking application built with React and Tailwind CSS.

## Features

### 🔐 Authentication
- **Login Page** - Email and password authentication
- **Signup Page** - User registration with name, email, password, and confirmation
- Dummy validation (ready for backend integration)

### 🏠 Dashboard
- **Total Income** - View total income for selected month
- **Total Expense** - View total expenses for selected month
- **Balance** - Calculate and display balance (Income - Expense)
- **Month Selector** - Filter transactions by month
- **Add Transaction** - Quick access to add new transactions

### ➕ Add Transaction
- Transaction type (Income/Expense)
- Category selection (dynamic based on type)
- Amount input
- Date picker
- Description field
- Modal-based UI for easy access

### 📄 Transaction History
- **Full CRUD Operations**
  - View all transactions
  - Edit existing transactions
  - Delete transactions
- **Advanced Filtering**
  - Filter by type (Income/Expense)
  - Filter by category
  - Filter by date range (From/To)
- **Transaction Table** - Clean, sortable table view

### 📊 Reports Page
- **Monthly Summary Cards** - Income, Expense, and Balance
- **Income vs Expense Bar Chart** - Visual comparison
- **Category-wise Expense Pie Chart** - Expense breakdown
- **Category Breakdown Table** - Detailed expense analysis with percentages
- Month selector for historical data

### ⚙️ Profile Page
- User information display
- Change password form (UI only)
- Logout functionality

## Tech Stack

- **React 18** - UI library
- **React Router DOM** - Navigation and routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Chart library for data visualization
- **Vite** - Build tool and dev server

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # Main layout with navigation
│   └── AddTransactionModal.jsx  # Transaction form modal
├── pages/
│   ├── Login.jsx            # Login page
│   ├── Signup.jsx           # Signup page
│   ├── Dashboard.jsx        # Main dashboard
│   ├── TransactionHistory.jsx  # Transaction list with CRUD
│   ├── Reports.jsx          # Reports and charts
│   └── Profile.jsx          # User profile page
├── App.jsx                  # Main app component with routing
├── main.jsx                 # Entry point
└── index.css                # Global styles with Tailwind
```

## Data Storage

Currently, the app uses **localStorage** for data persistence:
- User authentication state
- User information (name, email)
- All transactions

This makes it easy to integrate with a backend API later.

## Features in Detail

### Dummy Data
The app comes with sample transactions to help you get started quickly.

### Responsive Design
All pages are fully responsive and work great on mobile, tablet, and desktop devices.

### Modern UI
Beautiful gradient designs, smooth animations, and a clean, modern interface.

## Future Enhancements

- Backend API integration
- User authentication with JWT
- Database storage
- Export to CSV/PDF
- Budget planning features
- Recurring transactions
- Multi-currency support

## License

MIT License - feel free to use this project for learning and portfolio purposes!
