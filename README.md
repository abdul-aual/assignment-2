# Vehicle Rental System 🚗

[Live Deployment](https://assignment2-seven-livid.vercel.app)

---

## 🎯 Project Overview

A backend API for a vehicle rental management system that handles:

- Vehicles - Manage vehicle inventory with availability tracking  
- Customers - Manage customer accounts and profiles  
- Bookings - Handle vehicle rentals, returns and cost calculation  
- Authentication - Secure role-based access control (Admin and Customer roles)  

---

## 🛠️ Technology Stack

- Node.js + TypeScript  
- Express.js (Web framework)  
- PostgreSQL (Database)  
- bcrypt (Password hashing)  
- jsonwebtoken (JWT authentication)  

---

## 📁 Code Structure

The project follows a **modular pattern** with clear separation of concerns.  
Organized into feature-based modules: `auth`, `users`, `vehicles`, `bookings`.  

Each module has **routes**, **controllers**, and **services** for proper layering.

---

## 📊 Database Tables

### Users
| Field     | Notes |
|-----------|-------|
| id        | Auto-generated |
| name      | Required |
| email     | Required, unique, lowercase |
| password  | Required, min 6 characters |
| phone     | Required |
| role      | `admin` or `customer` |

### Vehicles
| Field                  | Notes |
|------------------------|-------|
| id                     | Auto-generated |
| vehicle_name           | Required |
| type                   | `car`, `bike`, `van` or `SUV` |
| registration_number    | Required, unique |
| daily_rent_price       | Required, positive |
| availability_status    | `available` or `booked` |

### Bookings
| Field            | Notes |
|------------------|-------|
| id               | Auto-generated |
| customer_id      | Links to Users table |
| vehicle_id       | Links to Vehicles table |
| rent_start_date  | Required |
| rent_end_date    | Required, must be after start date |
| total_price      | Required, positive |
| status           | `active`, `cancelled` or `returned` |

---

## 🔐 Authentication & Authorization

- **Admin**: Full access to manage vehicles, users, and bookings  
- **Customer**: Can register, view vehicles, and manage own bookings  

**Flow:**

- Passwords are hashed with `bcrypt`  
- Login via `/api/v1/auth/signin` → receive JWT token  
- Protected endpoints require `Authorization: Bearer <token>`  

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|---------|--------|------------|
| POST   | `/api/v1/auth/signup` | Public | Register new user |
| POST   | `/api/v1/auth/signin` | Public | Login and receive JWT |

### Vehicles
| Method | Endpoint | Access | Description |
|--------|---------|--------|------------|
| POST   | `/api/v1/vehicles` | Admin | Add new vehicle |
| GET    | `/api/v1/vehicles` | Public | Get all vehicles |
| GET    | `/api/v1/vehicles/:vehicleId` | Public | Get vehicle by ID |
| PUT    | `/api/v1/vehicles/:vehicleId` | Admin | Update vehicle |
| DELETE | `/api/v1/vehicles/:vehicleId` | Admin | Delete vehicle (if no active bookings) |

### Users
| Method | Endpoint | Access | Description |
|--------|---------|--------|------------|
| GET    | `/api/v1/users` | Admin | View all users |
| PUT    | `/api/v1/users/:userId` | Admin / Own | Update user |
| DELETE | `/api/v1/users/:userId` | Admin | Delete user (if no active bookings) |

### Bookings
| Method | Endpoint | Access | Description |
|--------|---------|--------|------------|
| POST   | `/api/v1/bookings` | Customer / Admin | Create booking |
| GET    | `/api/v1/bookings` | Role-based | Admin sees all, Customer sees own |
| PUT    | `/api/v1/bookings/:bookingId` | Role-based | Cancel / Return booking |

---

## 📝 Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
