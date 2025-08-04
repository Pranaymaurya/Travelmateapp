# TravelMate User Management System

## Overview

The TravelMate app implements a comprehensive user management system with three distinct user roles and proper authorization controls. This document outlines the user roles, permissions, and management features.

## User Roles

### 1. Regular User
- **Default role** for all new registrations
- Can browse trips, activities, restaurants, stays, and rentals
- Can make bookings and leave reviews
- Can request to become a Store Admin
- Limited access to admin features

### 2. Store Admin
- **Approved by main admin** after application review
- Can create and manage their own listings (rentals, restaurants, stays, activities)
- Can set pricing, availability, and manage bookings for their listings
- Can view and manage their own content only
- Cannot access main admin features

### 3. Main Admin
- **Superuser role** with full system access
- Can manage all users, content, and system settings
- Can approve/reject Store Admin requests
- Can view system statistics and analytics
- Can delete or modify any content

## User Management Features

### Authentication Flow

1. **Phone Number Verification**
   - User enters phone number
   - OTP is sent (simulated in development)
   - OTP verification required for login

2. **User Registration**
   - Complete profile with personal information
   - Email, password, and additional details required
   - Automatic assignment of Regular User role

3. **Login System**
   - JWT-based authentication
   - Token stored in AsyncStorage
   - Automatic role-based access control

### Store Admin Application Process

1. **Request Submission**
   - Regular users can request Store Admin status
   - Request stored with "pending" status
   - User notified of submission

2. **Admin Review**
   - Main admin reviews pending requests
   - Can approve or reject applications
   - User notified of decision

3. **Status Updates**
   - Approved users gain Store Admin privileges
   - Rejected users can reapply
   - Status visible in user profile

## Admin Dashboard Features

### Main Admin Capabilities

#### User Management
- View all registered users
- See user roles and status
- Approve/reject Store Admin requests
- Edit user information (planned)
- Delete users (planned)

#### Content Management
- Manage all trips, activities, restaurants, stays, and rentals
- Create, edit, and delete any content
- View content ownership and statistics
- Monitor system activity

#### System Analytics
- User registration statistics
- Booking and revenue data
- Popular destinations and content
- Monthly trends and reports

### Store Admin Capabilities

#### Content Management
- Create and manage own listings
- Set pricing and availability
- Upload images and descriptions
- Manage booking requests

#### Limited Access
- Can only manage own content
- Cannot access other users' data
- Cannot approve other Store Admin requests

## Security Features

### Authorization Middleware
- JWT token verification
- Role-based access control
- Protected API endpoints
- Session management

### Data Protection
- Password hashing with bcrypt
- Secure token storage
- Input validation and sanitization
- Rate limiting (planned)

## API Endpoints

### Authentication
```
POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
POST /api/auth/request-store-admin
```

### Admin Only
```
GET /api/auth/users
GET /api/auth/admin-requests
PUT /api/auth/approve-store-admin/:userId
PUT /api/auth/reject-store-admin/:userId
GET /api/auth/admin/stats
PUT /api/auth/users/:id
DELETE /api/auth/users/:id
```

### Content Management
```
GET /api/rentals, /api/restaurants, /api/stays, /api/activities, /api/trips
POST /api/rentals, /api/restaurants, /api/stays, /api/activities, /api/trips
PUT /api/rentals/:id, /api/restaurants/:id, /api/stays/:id, /api/activities/:id, /api/trips/:id
DELETE /api/rentals/:id, /api/restaurants/:id, /api/stays/:id, /api/activities/:id, /api/trips/:id
```

## User Interface Features

### Profile Screen
- User information display
- Role and status badges
- Store Admin request button
- Account statistics
- Settings and preferences

### Admin Dashboard
- Tabbed interface (Entities, Users, Requests)
- User management interface
- Store Admin request approval
- Content management tools
- Real-time statistics

### Navigation
- Role-based tab visibility
- Conditional menu items
- Admin tab for authorized users
- Proper access controls

## Database Schema

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  phoneNumber: String (unique, required),
  password: String (hashed),
  age: Number,
  location: {
    city: String,
    region: String,
    country: String,
    coords: { latitude: Number, longitude: Number }
  },
  isAdmin: Boolean (default: false),
  storeAdminRequest: String (enum: "none", "pending", "approved", "rejected"),
  createdAt: Date,
  totalTrips: Number,
  totalSpent: Number
}
```

## Best Practices

### Security
- Always verify user permissions before operations
- Use proper authentication middleware
- Validate and sanitize all inputs
- Implement proper error handling

### User Experience
- Clear role indicators
- Intuitive navigation
- Helpful error messages
- Responsive design

### Performance
- Efficient database queries
- Proper indexing
- Caching strategies
- Optimized API responses

## Future Enhancements

### Planned Features
- User profile editing
- Advanced analytics dashboard
- Email notifications
- Two-factor authentication
- User activity logging
- Content moderation tools
- Revenue tracking for Store Admins
- Advanced search and filtering

### Scalability
- Database optimization
- API rate limiting
- Caching implementation
- Load balancing
- Microservices architecture

## Troubleshooting

### Common Issues
1. **Authentication Errors**: Check JWT token validity
2. **Permission Denied**: Verify user role and permissions
3. **API Errors**: Check request format and authentication headers
4. **Data Sync Issues**: Refresh user data after role changes

### Debug Tools
- Console logging for development
- API response monitoring
- User session tracking
- Error reporting system

## Support

For technical support or questions about the user management system, contact the development team or refer to the API documentation. 