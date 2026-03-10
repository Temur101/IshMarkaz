# BANDLIK - Trust Through Action

A modern job platform where trust is built through real work, not resumes.

## Features

- **Multi-language Support**: English, Russian, Uzbek.
- **No Resumes**: Focus on completed tasks and trial weeks.
- **Task-Based Hiring**: Employers publish small, paid tasks to vet candidates.
- **Trial Weeks**: One-week paid collaborations to ensure fit.
- **Modern UI**: Dark mode, clean typography, and orange accents.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Lucide React (Icons)
- React Router DOM
- Custom i18n solution (Context based)

## Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    # Ensure correct tailwind version
    npm install -D tailwindcss@3.4.17 postcss autoprefixer
    ```

2.  **Run Development Server**
    ```bash
    npm run dev
    ```

3.  **Build for Production**
    ```bash
    npm run build
    ```

## Project Structure

- `src/translations`: Translation files (en, ru, uz). (New!)
- `src/context`: Language context provider. (New!)
- `src/components/ui`: Reusable UI components (Button, Card, Input, Badge, LanguageSwitcher).
- `src/components/layout`: Layout components (Navbar, Sidebar).
- `src/pages`: Main application pages (Landing, Dashboard, TaskDetail, Profile, Chat).
- `src/data`: Mock data for the application.

## Design

The design follows a "Modern SaaS Dashboard" aesthetic with:
- **Colors**: Black (`#0A0A0A`), Dark Gray (`#1A1A1A`), Vibrant Orange (`#FF5E00`).
- **Typography**: Inter font, large headings, clean hierarchy.
- **Shapes**: Rounded corners (`rounded-xl`, `rounded-2xl`).
