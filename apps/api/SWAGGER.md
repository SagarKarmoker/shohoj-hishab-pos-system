# Swagger API Documentation

## Access Swagger UI

Once the API server is running, you can access the Swagger documentation at:

```
http://localhost:8080/api
```

## Features

### Interactive API Documentation
- View all available endpoints organized by tags
- See request/response schemas
- Test endpoints directly from the browser
- View example requests and responses

### Authentication
The API uses JWT Bearer authentication. To test protected endpoints:

1. First, authenticate using one of these endpoints:
   - `POST /auth/login` - Login with phone number and password
   - `POST /auth/signup` - Sign up with OTP verification
   - `POST /auth/verify-token` - Verify Firebase OTP token

2. Copy the `token` from the response (note: the response property is `token`, not `accessToken`)

3. Click the **"Authorize"** button at the top right of the Swagger UI

4. Paste the token in the format: `Bearer <your-token-here>`
   - Or just paste the token directly (the "Bearer " prefix is added automatically)

5. Click "Authorize" and then "Close"

6. Now you can test all protected endpoints (marked with a lock icon 🔒)

## API Organization

### Tags
- **Health** - Basic health check endpoint
- **Authentication** - User authentication and authorization
- **Admin** - Admin-only endpoints for:
  - User management
  - Subscription plan management
  - Admin role management
  - Sales person management
  - Analytics and reporting

## Available Endpoints

### Authentication (`/auth`)
- `POST /auth/verify-token` - Verify Firebase token and get JWT
- `POST /auth/login` - Login with phone number and password
- `POST /auth/signup` - Sign up new user with OTP
- `POST /auth/reset-password` - Reset password with OTP
- `POST /auth/check-user` - Check if user exists
- `GET /auth/profile` - Get current user profile (🔒 Protected)

### Admin (`/admin`)
All admin endpoints require JWT authentication (🔒 Protected)

#### User Management
- `GET /admin/users` - Get paginated users list with filters
- `GET /admin/users/:id` - Get user details by ID
- `PATCH /admin/users/:id` - Update user information
- `DELETE /admin/users/:id` - Delete user account

#### Subscription Plans
- `GET /admin/plans` - Get all subscription plans
- `GET /admin/plans/:id` - Get plan details
- `POST /admin/plans` - Create new plan
- `PATCH /admin/plans/:id` - Update plan
- `PATCH /admin/plans/:id/toggle` - Enable/disable plan
- `DELETE /admin/plans/:id` - Delete plan

#### Admin Management (Super Admin Only)
- `GET /admin/admins` - Get all admins
- `POST /admin/admins` - Promote user to admin
- `DELETE /admin/admins/:id` - Remove admin privileges

#### Sales Person Management
- `GET /admin/sales` - Get all sales persons
- `POST /admin/sales` - Add sales person
- `PATCH /admin/sales/:id` - Update sales person
- `DELETE /admin/sales/:id` - Remove sales person

#### Analytics
- `GET /admin/analytics/overview` - Get overview statistics
- `GET /admin/analytics/revenue` - Get revenue statistics

## Tips

1. **Explore Schemas**: Click on "Schemas" at the bottom of the page to see all data models
2. **Try It Out**: Use the "Try it out" button to test endpoints with custom parameters
3. **Copy as cURL**: Right-click on any request to copy it as a cURL command
4. **Response Examples**: Each endpoint shows example responses for different status codes
5. **Validation**: The UI shows which fields are required (marked with *)

## Environment Setup

Make sure your `.env` file has the correct configuration:

```env
PORT=8080
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
FIREBASE_PROJECT_ID="your-project-id"
# ... other Firebase credentials
```

## Start the Server

```bash
# Development mode
pnpm --filter @shohoj-hishab/api dev

# Production mode
pnpm --filter @shohoj-hishab/api build
pnpm --filter @shohoj-hishab/api start:prod
```

## Notes

- All timestamps are in ISO 8601 format
- Phone numbers should include country code (e.g., +8801712345678)
- Pagination uses `page` and `limit` query parameters
- All protected endpoints require valid JWT token
- Some endpoints are restricted to specific roles (ADMIN, SUPER_ADMIN)
