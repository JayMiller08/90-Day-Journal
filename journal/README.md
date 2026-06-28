# 90-Day Journal

A comprehensive, socially-driven 90-day journaling application built to help users set visions, track daily progress, review milestones, and connect with friends for accountability.

## Features

- **Authentication & Onboarding**: Secure user sign-up and login, along with a guided onboarding process.
- **Vision Setting**: Establish long-term goals and visions for the 90-day journey.
- **Daily Logging**: Track daily progress, thoughts, and achievements.
- **Milestone Reviews**: Periodic reviews to reflect on progress at key intervals.
- **Social & Networking**: 
  - Connect with friends and view their progress.
  - Activity feed to stay updated on network updates.
  - View friends' daily logs and dashboards.
- **Notifications**: Stay up to date with a built-in notification system.
- **Profile Management**: Customize and manage your user profile.

## Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend/BaaS**: [Supabase](https://supabase.com/)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd journal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Development Scripts

- `npm run dev`: Starts the development server using Vite.
- `npm run build`: Compiles TypeScript and builds the application for production.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Runs ESLint to check for code quality and style issues.

## Project Structure

- `/src/components`: Reusable UI components (e.g., Navigation, NotificationBell).
- `/src/context`: React context providers for global state (AuthContext, JournalContext).
- `/src/pages`: Top-level page components for routing.
- `/supabase`: Supabase related configurations or database types.

## License

This project is private and proprietary.
