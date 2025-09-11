# Creative Currents Invoicer

A simple expense and income tracker with invoice creation. No login required - works immediately!

## Features

- **Expense Tracking**: Add, edit, and delete expenses with categories
- **Income Tracking**: Record income with categories
- **Invoice Creation**: Create professional invoices with line items
- **Dashboard**: View month-to-date and year-to-date financial overview
- **CSV Export**: Export your data for tax preparation
- **Profile Management**: Store your business information

## Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run the development server**:

   ```bash
   npm run dev
   ```

3. **Open your browser** and go to `http://localhost:3000`

That's it! The app works immediately without any setup.

## How It Works

- **Supabase Cloud Storage**: Your data is saved in Supabase cloud database
- **Cross-Device Sync**: Changes sync instantly across all your devices
- **Simple Authentication**: Uses a simple sync key (no complex login)
- **Local Backup**: Data is cached locally for fast access

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com/) and create a new project
2. Copy your **Project URL** and **anon public key** from Settings → API

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_SYNC_KEY=your_simple_sync_password_here
```

### 3. Set Up Database

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Copy and paste the contents of `supabase-setup.sql`
4. Run the SQL script

### 4. Start Using

1. Run `npm run dev`
2. Open the app in your browser
3. Use the same `NEXT_PUBLIC_SYNC_KEY` on all your devices for sync

## File Structure

```
app/
├── page.tsx              # Dashboard
├── expenses/page.tsx     # Expense tracking
├── income/page.tsx       # Income tracking
├── invoices/
│   ├── page.tsx         # Invoice list
│   └── new/page.tsx     # Create invoice
└── profile/page.tsx     # Business profile

lib/
└── storage.ts           # Data storage functions

hooks/
└── use-app-data.ts      # Data management hook
```

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **Local Storage** for data persistence

## Google Sheets Integration

The app includes optional Google Sheets integration for automatic backup of financial records:

- **Automatic Sync**: Income and expense records are automatically written to Google Sheets
- **Real-time Backup**: All financial data is backed up in real-time to your spreadsheet
- **Easy Setup**: Simple service account authentication with detailed setup instructions

See [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) for complete setup instructions.

## Future Enhancements

- PDF invoice generation
- Payment tracking
- Financial reports and charts
- Client management
- Recurring invoices

---

**Note**: This is a simplified version that works immediately. For production use, consider adding proper authentication and cloud storage.
