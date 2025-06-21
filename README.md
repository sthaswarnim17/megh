# ProductionCoach AI

A Next.js application providing AI-powered business intelligence for production businesses, with features like BCG Matrix analysis, market research, product prototyping, and niche marketing strategies.

## Tech Stack

### Frontend
- **Framework**: Next.js 15
- **UI Components**: Shadcn UI (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Form Handling**: React Hook Form + Zod validation

### Backend
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Validation**: Express Validator

## Prerequisites

- Node.js 18.x or higher
- PostgreSQL 12.x or higher (download from https://www.postgresql.org/download/)
- pnpm (recommended) or npm

## Detailed Setup Instructions

### PostgreSQL Database Setup

1. **Install PostgreSQL**
   - Download and install PostgreSQL from https://www.postgresql.org/download/
   - During installation, set a password for the default 'postgres' user
   - Keep note of the port number (default is 5432)

2. **Create Database**
   - Open pgAdmin (installed with PostgreSQL) or use the PostgreSQL command line
   - Create a new database called 'productioncoach':
     - Using pgAdmin: Right-click on Databases > Create > Database... > Enter 'productioncoach'
     - Using command line: 
       ```
       psql -U postgres
       CREATE DATABASE productioncoach;
       \q
       ```

### Backend Setup

1. **Install dependencies**

```bash
cd hackathon2/backend
npm install
```

2. **Create environment variables file**

Create a new file named `.env` in the backend directory (hackathon2/backend/.env) with the following content:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL Configuration
PGUSER=postgres
PGHOST=localhost
PGDATABASE=productioncoach
PGPASSWORD=your_postgres_password_here
PGPORT=5432

# JWT Configuration
JWT_SECRET=productioncoach_secret_key_change_in_production
JWT_EXPIRATION=1d

# Logging
LOG_LEVEL=info
```

Be sure to replace `your_postgres_password_here` with the password you set during PostgreSQL installation.

3. **Initialize the database**

```bash
node initDb.js
```

This will create the necessary tables in your PostgreSQL database.

4. **Start the backend server**

```bash
npm run dev
```

The API will be available at http://localhost:5000.
You can test it by visiting http://localhost:5000 in your browser, which should display a JSON message: `{"message":"ProductionCoach API is running..."}`.

### Frontend Setup

1. **Install dependencies**

```bash
# Navigate to the project root
cd hackathon2

# Using pnpm (recommended)
pnpm install --no-strict-peer-dependencies

# Or using npm
npm install --legacy-peer-deps
```

The flags are necessary to resolve dependency conflicts with the date-fns package.

2. **Create environment variables file (optional)**

For frontend development, we can create a `.env.local` file in the project root with the following content:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

This will allow the frontend to communicate with the backend API.

3. **Run the development server**

```bash
# Using pnpm
pnpm dev

# Or using npm
npm run dev
```

4. **Access the application**

Navigate to [http://localhost:3000](http://localhost:3000) in your browser to see the frontend application running.

## API Testing

Once the backend is running, you can test the API endpoints using tools like Postman or curl:

### Register a new user
```
POST http://localhost:5000/api/users/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### Login
```
POST http://localhost:5000/api/users/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

The login will return a JWT token that can be used to authenticate subsequent requests.

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running using pgAdmin or the system services
- Check that the credentials in the `.env` file match your PostgreSQL setup
- Ensure there are no firewall restrictions blocking access to port 5432

### Frontend Dependency Issues
- If you encounter dependency conflicts, try using the `--force` flag with npm or the `--no-strict-peer-dependencies` flag with pnpm
- Make sure you're using Node.js version 18 or higher

### API Connection Issues
- Ensure both frontend and backend are running simultaneously
- Check that the backend is running on port 5000 and frontend on port 3000
- Verify there are no CORS issues by checking the browser's developer console

## Project Structure

- **/app**: Next.js app directory containing pages and routes
  - **/dashboard**: Dashboard pages for different features
  - **/login**: Authentication pages
  - **/register**: User registration
- **/components**: Reusable UI components
  - **/ui**: Shadcn UI components
- **/lib**: Utility functions
- **/public**: Static assets
- **/styles**: Global styles
- **/backend**: Backend API
  - **/src**: Source code
    - **/config**: Configuration files
    - **/controllers**: API controllers
    - **/models**: Database models
    - **/routes**: API routes
    - **/middleware**: Express middleware
    - **/utils**: Utility functions
  - **/db**: Database files

## Features

- **Dashboard**: Main interface for accessing all tools
- **BCG Matrix Analysis**: Analyze product performance by market share vs growth
- **Market Research**: Automated primary & secondary research tools
- **Product Prototyping**: AI-generated product concepts and development roadmaps
- **Niche Marketing**: Tools for identifying untapped market segments
- **Marketing Strategies**: Campaign strategy builder based on customer behavior

## Available Scripts

### Frontend
- `pnpm dev`: Run development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Run linter

### Backend
- `npm start`: Run the server in production mode
- `npm run dev`: Run the server in development mode with nodemon
- `npm test`: Run tests

## Notes

- The frontend is configured to run on port 3000 by default
- The backend API is configured to run on port 5000 by default
- The project uses Next.js App Router for routing
- UI components are from Shadcn UI library, which is built on top of Radix UI and Tailwind CSS
