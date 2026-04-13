# PropMgmt — Property Management Frontend

A full-featured property management portal built with **React + Vite**.

## ✨ Features

### 🏠 Renter Portal (`/renter`)
- **Dashboard** — Overview of rent status, maintenance requests, and payment history
- **Maintenance Requests** — Submit and track maintenance requests with priority levels; optional Google Calendar scheduling link per request
- **Pay Rent** — Submit rent payments via Bank Transfer, ACH, Credit Card, or Debit Card; full payment history table
- **Receipts** — Download or print HTML payment receipts for every paid period

### ⚙️ Admin Portal (`/admin`)
- **Dashboard** — Portfolio-wide stats: total properties, open maintenance, YTD revenue, pending payments
- **Properties** — View all properties with occupancy, rent, tenant, and owner details
- **Maintenance Management** — View and update all maintenance requests (status, priority, schedule, notes); Google Calendar "Add to Calendar" links for each scheduled job
- **Rent Payments** — Full ledger of all rent payments across all tenants with filter by status
- **Tax Forms** — Generate and download per-owner rental income statements and a business annual tax summary as printable HTML files
- **Google Calendar Integration** — Create Maintenance, Realtor Meeting, and Owner Meeting events with one click; generates a Google Calendar quick-add URL that opens pre-filled
- **GitHub Projects Integration** — Create templated GitHub issues (Feature, Bug, Enhancement, Maintenance, Documentation) with acceptance criteria, priority labels, and structured body directly in a repository of your choice

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Renter | `renter@demo.com` | `demo123` |
| Admin | `admin@demo.com` | `demo123` |

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill in your API keys to enable Google Calendar OAuth and pre-fill GitHub settings:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_API_KEY=your-google-api-key
VITE_GITHUB_TOKEN=ghp_your_token
VITE_GITHUB_OWNER=your-org
VITE_GITHUB_REPO=your-repo
```

## 🛠 Tech Stack

- **React 19** with React Router v7
- **Vite 8** for fast builds
- **CSS Modules** for scoped styling
- **Mock API service** (swap `src/services/api.js` base URL for a real backend)
- **Google Calendar API** (URL-based quick-add, no OAuth required for basic use)
- **GitHub REST API** (issue creation with personal access token)

## 📁 Project Structure

```
src/
  components/common/     # Shared UI components (Button, Card, Badge, Modal, FormField, Sidebar, Layout, StatCard)
  context/               # AuthContext (login/logout, localStorage persistence)
  pages/
    Login.jsx            # Dual-role login with demo account shortcuts
    renter/              # Renter portal pages
    admin/               # Admin portal pages
  services/
    api.js               # Mock data layer (maintenance, payments, properties, tax)
    googleCalendar.js    # Google Calendar URL builder & OAuth helpers
    githubProjects.js    # GitHub Issues API + templated issue body builder
```
