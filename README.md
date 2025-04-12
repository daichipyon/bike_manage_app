# Bike Manage App

## Overview

The Bike Manage App is a web application designed to manage bicycle parking slots in a condominium. It allows administrators to oversee the usage of bicycle slots, manage resident information, and handle payments efficiently. The application is built using Next.js, TypeScript, and Supabase for backend services.

## Features

- **User Authentication**: Secure login for administrators.
- **Dashboard**: A central hub for managing residents, slots, violations, and payments.
- **Residents Management**: Add, edit, and view resident information.
- **Slots Management**: Assign and release bicycle parking slots.
- **Violations Management**: Record and track violations of parking rules.
- **Payments Management**: Manage payment records and export payment data.

## Technologies Used

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, authentication)
- **Styling**: Custom CSS and Tailwind CSS for responsive design

## Project Structure

```
bike-manage-app
├── src
│   ├── app
│   ├── components
│   ├── lib
│   ├── types
│   └── styles
├── public
├── supabase
├── .env.local.example
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── package.json
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

## Getting Started

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd bike-manage-app
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.local.example` to `.env.local` and configure your Supabase credentials.

4. **Run the development server**:
   ```
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000` to view the application.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.