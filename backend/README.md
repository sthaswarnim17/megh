# ProductionCoach AI Backend

This is the backend API for the ProductionCoach AI application, providing business intelligence tools for production businesses.

## Tech Stack

- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Validation**: Express Validator

## Prerequisites

- Node.js 14.x or higher
- PostgreSQL 12.x or higher

## Getting Started

Follow these steps to run the backend API:

1. **Install dependencies**

```bash
cd backend
npm install
```

2. **Set up environment variables**

Create a `.env` file in the backend directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL Configuration
PGUSER=postgres
PGHOST=localhost
PGDATABASE=productioncoach
PGPASSWORD=postgres
PGPORT=5432

# JWT Configuration
JWT_SECRET=productioncoach_secret_key_change_in_production
JWT_EXPIRATION=1d

# Logging
LOG_LEVEL=info
```

3. **Set up the database**

Create a PostgreSQL database named `productioncoach` or update the `.env` file with your database name.

4. **Initialize the database**

```bash
node src/utils/initDb.js
```

5. **Start the server**

```bash
npm run dev
```

The API will be available at http://localhost:5000

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change user password

### Business Data

- `POST /api/business-data` - Create new business data
- `GET /api/business-data` - Get all business data for a user
- `GET /api/business-data/:id` - Get business data by ID
- `GET /api/business-data/type/:dataType` - Get business data by type
- `PUT /api/business-data/:id` - Update business data
- `DELETE /api/business-data/:id` - Delete business data

### Analysis

- `POST /api/analysis` - Create new analysis result
- `GET /api/analysis` - Get all analysis results for a user
- `GET /api/analysis/:id` - Get analysis result by ID
- `GET /api/analysis/type/:analysisType` - Get analysis results by type
- `GET /api/analysis/data/:dataId` - Get analysis results by data ID
- `PUT /api/analysis/:id` - Update analysis result
- `DELETE /api/analysis/:id` - Delete analysis result

### BCG Matrix

- `POST /api/bcg-matrix` - Create new BCG matrix item
- `GET /api/bcg-matrix/analysis/:analysisId` - Get all BCG matrix items for an analysis
- `GET /api/bcg-matrix/:id` - Get BCG matrix item by ID
- `GET /api/bcg-matrix/analysis/:analysisId/category/:category` - Get BCG matrix items by category
- `GET /api/bcg-matrix/summary` - Get BCG matrix summary for a user
- `PUT /api/bcg-matrix/:id` - Update BCG matrix item
- `DELETE /api/bcg-matrix/:id` - Delete BCG matrix item

## Available Scripts

- `npm start` - Run the server in production mode
- `npm run dev` - Run the server in development mode with nodemon
- `npm test` - Run tests 