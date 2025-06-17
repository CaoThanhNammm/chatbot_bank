# VietBank AI - Vietnamese Banking Chatbot

A modern, responsive AI chatbot interface specifically designed for Vietnamese banking services, built with Vite + React + TailwindCSS.

## 🌟 Features

### 🏦 Banking-Specific Functionality
- **Account Management**: Check balance, transaction history, account details
- **Financial Services**: Savings accounts, loans, credit cards, transfers
- **AI Assistant**: Intelligent responses to banking queries in Vietnamese
- **Customer Support**: 24/7 automated assistance with banking operations

### 🎨 Modern UI/UX Design
- **European Minimalist Style**: Clean, professional banking interface
- **Custom Color Palette**: Sage green and ocean blue with neutral tones
- **Typography**: Playfair Display for headings, Inter for body text
- **Smooth Animations**: CSS transitions and micro-interactions
- **Mobile-First**: Responsive design optimized for all devices

### 🔐 Authentication System
- **Secure Login**: Email/password authentication with validation
- **User Registration**: Complete signup flow with form validation
- **Protected Routes**: Authenticated access to banking features
- **User Profile**: Comprehensive profile management with editable fields

### 💬 Chat Interface
- **Real-time Chat**: Instant messaging with typing indicators
- **Banking Context**: AI responses tailored for Vietnamese banking
- **Quick Prompts**: Pre-defined banking queries for faster assistance
- **Message History**: Persistent chat sessions with timestamps

### ♿ Accessibility & Performance
- **WCAG Compliant**: Keyboard navigation, screen reader support
- **Fast Loading**: Optimized with Vite for quick startup times
- **Cross-browser**: Compatible with modern browsers
- **SEO Optimized**: Proper meta tags and semantic HTML

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite 6
- **Styling**: TailwindCSS 3 + Custom Design System
- **Routing**: React Router DOM v6
- **Icons**: React Icons (Feather Icons)
- **Build Tool**: Vite with PostCSS
- **Package Manager**: npm

## 📱 Pages & Components

### Pages
- **HomePage**: Landing page with banking services overview
- **LoginPage**: Secure authentication with demo credentials
- **RegisterPage**: User registration with validation
- **ChatPage**: Main AI chatbot interface
- **ProfilePage**: User profile and account management

### Core Components
- **Chat System**: ChatWindow, ChatInput, MessageBubble, TypingIndicator
- **UI Library**: Button, Input, Modal, Spinner, AuthLayout
- **Navigation**: Header with profile access and logout
- **Responsive**: Mobile-friendly sidebar and collapsible navigation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ChatBotUI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:5173`

### Demo Credentials
- **Email**: `demo@vietbank.com`
- **Password**: `demo123`

## 🎯 Usage Guide

### 🏠 Getting Started
1. Visit the homepage to learn about VietBank AI
2. Click "Bắt đầu ngay" to register or "Đăng nhập" if you have an account
3. Use demo credentials for quick access

### 💬 Using the Chat
1. After login, you'll access the main chat interface
2. Try banking-specific queries like:
   - "Kiểm tra số dư tài khoản"
   - "Lãi suất tiết kiệm hiện tại"
   - "Hướng dẫn chuyển tiền"
   - "Thông tin vay mua nhà"

### 👤 Profile Management
1. Click the profile icon in the header
2. View and edit personal information
3. Check account details and balance
4. Access quick banking actions

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Chat/           # Chat-specific components
│   └── ...             # Button, Input, Modal, etc.
├── pages/              # Main application pages
├── routes/             # Route protection and navigation
├── data/               # Mock data and banking scenarios
└── styles/             # Global styles and Tailwind config
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using modern web technologies for an exceptional user experience.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
