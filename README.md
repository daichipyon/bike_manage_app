# Bike Manage App

## Overview | 概要

The Bike Manage App is a web application designed to manage bicycle parking slots in a condominium. It allows administrators to oversee the usage of bicycle slots, manage resident information, and handle payments efficiently. The application is built using Next.js, TypeScript, and Supabase for backend services.

マンションの自転車駐輪場を管理するためのウェブアプリケーションです。管理者が自転車スロットの利用状況、住民情報、支払い情報を効率的に管理できます。Next.js、TypeScript、Supabaseを使用して構築されています。

## Features | 機能

- **User Authentication**: Secure login for administrators.
- **Dashboard**: A central hub for managing residents, slots, violations, and payments.
- **Residents Management**: Add, edit, and view resident information.
- **Slots Management**: Assign and release bicycle parking slots.
- **Violations Management**: Record and track violations of parking rules.
- **Payments Management**: Manage payment records and export payment data.

## Technologies Used | 使用技術

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, authentication)
- **Styling**: Custom CSS and Tailwind CSS for responsive design

## Database Schema | データベース構造

The application uses Supabase (PostgreSQL) with the following tables:

1. **residents**: Stores information about condominium residents
2. **bicycle_slots**: Tracks all parking slots and their assignments
3. **stickers**: Records registration stickers issued for bicycles
4. **violation_logs**: Logs parking rule violations
5. **payments**: Tracks monthly parking fee payments

## Project Structure | プロジェクト構成

```
bike-manage-app
├── src
│   ├── app                  // Next.js app router components
│   ├── components           // Reusable UI components
│   ├── lib                  // Utilities including Supabase client
│   ├── types                // TypeScript type definitions
│   └── styles               // Global styles and Tailwind config
├── public                   // Static assets
├── supabase                 // Supabase configuration and migrations
│   ├── config.toml          // Supabase configuration
│   ├── migrations           // Database migrations
│   └── seed.sql             // Seed data for development
├── .env.local.example       // Environment variable template
└── ...                      // Other configuration files
```

## Getting Started | 始め方

### Prerequisites | 前提条件

- Node.js 16.x or higher
- npm or yarn
- Supabase account (for production) or Docker (for local development)

### Installation | インストール

1. **Clone the repository | リポジトリのクローン**:
   ```
   git clone <repository-url>
   cd bike-manage-app
   ```

2. **Install dependencies | 依存関係のインストール**:
   ```
   npm install
   ```

3. **Set up Supabase locally | Supabaseのローカル環境設定**:
   
   a. Install Supabase CLI | Supabase CLIのインストール:
   ```
   npm install -g supabase
   ```
   
   b. Start local Supabase | ローカルSupabaseの起動:
   ```
   supabase start
   ```
   This will start a local Supabase instance using Docker with:
   - REST API: http://localhost:54321
   - Database: postgresql://postgres:postgres@localhost:54322/postgres
   - Studio: http://localhost:54323

4. **Set up environment variables | 環境変数の設定**:
   - Copy `.env.local.example` to `.env.local`
   ```
   cp .env.local.example .env.local
   ```
   - The local Supabase credentials are already configured in the example file 
   - For production, update with your Supabase project credentials

5. **Apply migrations | マイグレーションの適用**:
   ```
   supabase db reset
   ```
   This will apply all migrations in the `supabase/migrations` folder and seed data from `seed.sql`.

6. **Run the development server | 開発サーバーの起動**:
   ```
   npm run dev
   ```

7. **Open your browser | ブラウザで開く**:
   Navigate to `http://localhost:3000` to view the application.

## Supabase Integration | Supabase連携

The app integrates with Supabase for:

1. **Authentication**: Administrator login and session management
2. **Database**: PostgreSQL database for storing all application data
3. **Realtime**: Real-time updates for collaborative features
4. **Storage**: File storage for violation photos and other documents

### Database Tables | データベーステーブル

- **residents**: Manages resident information (name, room number, contact info)
- **bicycle_slots**: Tracks parking slots, their location, and assignment status
- **stickers**: Records bicycle registration stickers issued to residents
- **violation_logs**: Documents parking violations with optional photos
- **payments**: Manages monthly parking fee payments from residents

### Development Workflow | 開発ワークフロー

1. Make changes to the database schema in `supabase/migrations/`
2. Apply changes with `supabase db reset` for local development
3. When ready, deploy schema changes to production with `supabase db push`

## Contributing | 貢献

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License | ライセンス

This project is licensed under the MIT License. See the LICENSE file for more details.