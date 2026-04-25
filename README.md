# Jharkhand Tourism - Full Stack Web Application

A complete tourism management system for Jharkhand with dynamic content, payment integration, and admin dashboard.

## 🚀 Features

- **Dynamic Content**: All destinations, events, and providers loaded from database
- **Authentication**: JWT-based admin authentication system
- **Payment Integration**: Stripe payment processing for services
- **Digital Certification**: Issue and manage digital certificates
- **Admin Dashboard**: Comprehensive analytics and management interface
- **Responsive Design**: Mobile-friendly frontend

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **Sequelize ORM** with SQLite database
- **JWT** for authentication
- **Stripe** for payment processing
- **bcryptjs** for password hashing

### Frontend
- **Vanilla JavaScript** with modern ES6+ features
- **CSS3** with custom properties and responsive design
- **ApexCharts** for data visualization
- **Stripe.js** for payment processing

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Stripe account (for payment processing)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Create a `.env` file in the backend directory:

```env
# Database
DB_PATH=./tourism.db

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Initialize Database

```bash
npm run seed
```

This will create the database tables and populate them with sample data including:
- Admin user (username: `admin`, password: `admin123`)
- Sample destinations, events, providers, and certificates

### 4. Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── models/                 # Database models
│   ├── User.js
│   ├── Provider.js
│   ├── Destination.js
│   ├── Event.js
│   ├── Certificate.js
│   ├── Payment.js
│   └── index.js
├── routes/                 # API routes
│   ├── auth.js
│   ├── destinations.js
│   ├── events.js
│   ├── providers.js
│   ├── certificates.js
│   ├── payments.js
│   └── admin.js
├── middleware/             # Custom middleware
│   └── auth.js
├── scripts/               # Database seeding
│   └── seedDatabase.js
├── server.js              # Main server file
├── config.js              # Configuration
└── package.json

dummy.sih/                 # Frontend files
├── js/
│   └── api.js             # API helper
├── main.html              # Homepage
├── destination.html       # Destinations page
├── cultural_events.html   # Events page
├── digital_certification.html # Admin login & certification
├── dashboard.html         # Admin dashboard
└── ...                    # Other static files
```

## 🔌 API Endpoints

### Public Endpoints
- `GET /api/destinations` - Get all destinations
- `GET /api/events` - Get all events
- `GET /api/providers` - Get all providers
- `GET /api/certificates/:id` - Get certificate by ID

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user info

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Stripe webhook handler

### Admin (Protected)
- `GET /api/admin/dashboard-stats` - Get dashboard statistics
- `GET /api/admin/payments` - Get all payments
- `POST /api/certificates/issue` - Issue new certificate

## 💳 Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe dashboard
3. Update the `.env` file with your Stripe keys
4. For webhook testing, use Stripe CLI or ngrok

### Webhook Configuration
Set up a webhook endpoint in your Stripe dashboard:
- URL: `https://yourdomain.com/api/payments/webhook`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

## 🎯 Usage

### For Visitors
1. Visit `http://localhost:3000` to see the homepage
2. Browse destinations and events
3. View provider information
4. Access cultural events calendar

### For Administrators
1. Go to `http://localhost:3000/digital_certification.html`
2. Login with admin credentials (admin/admin123)
3. Issue digital certificates
4. Process payments through Stripe
5. Access dashboard at `http://localhost:3000/dashboard.html`

## 🔧 Development

### Database Management
- The database is automatically created on first run
- Use `npm run seed` to reset and populate with sample data
- Database file: `tourism.db` (SQLite)

### Adding New Features
1. Create new models in `models/` directory
2. Add routes in `routes/` directory
3. Update frontend API calls in `js/api.js`
4. Test with the provided sample data

### Frontend Development
- All frontend files are served statically from the `dummy.sih` directory
- API calls are handled by `js/api.js`
- No build process required - just edit HTML/CSS/JS files

## 🚨 Security Notes

- Change default JWT secret in production
- Use environment variables for sensitive data
- Implement rate limiting for production
- Use HTTPS in production
- Validate all user inputs

## 📊 Sample Data

The seeding script creates:
- 1 admin user
- 6 destinations
- 4 cultural events
- 4 service providers
- 2 sample certificates

## 🐛 Troubleshooting

### Common Issues

1. **Database not found**: Run `npm run seed` to initialize
2. **Payment not working**: Check Stripe keys in `.env`
3. **Authentication failed**: Verify JWT secret is set
4. **CORS errors**: Check CORS configuration in `server.js`

### Logs
- Server logs are displayed in the console
- Database queries are logged in development mode
- Check browser console for frontend errors

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support or questions, please contact the development team or create an issue in the repository.
