# Anabel Web Backend

This is the backend of the Anabel Web project, built with Node.js, Express, and MySQL.

It provides authentication, protected routes, subscription checks, simulated payment processing, and admin CRUD operations for premium content.

# Project Overview

The backend is connected to a MySQL database and supports the frontend application with:

# Authentication

* User registration
* User login
* JWT-based authentication
* Protected profile route

# Subscription Logic

* Subscription status lookup
* Access control for premium content
* Active subscription validation
* Subscription activation through a simulated checkout flow

# Premium Content

* Public logic restricted to subscribed users
* Premium content list
* Premium content detail by slug

# Admin Features

* Admin-only premium content list
* Create premium content
* Edit premium content
* Delete premium content
* Get premium content by ID for editing

# Payment Simulation

This project uses a simulated payment flow for educational purposes.

The backend does not connect to a real bank, card processor, or payment gateway.

When a user completes the checkout flow, the application will create payment and subscription records in the database to simulate a successful premium subscription purchase.

# Tech Stack

* Node.js
* Express
* MySQL
* mysql2
* dotenv
* cors
* bcrypt
* jsonwebtoken

# Port

The backend runs on:

PORT=3000

# Project Structure

database/
schema.sql
seed.sql

src/
app.js
config/
db.js
middleware/
authMiddleware.js

.env
.gitignore
package.json

# Installation

# 1. Clone the repository

git clone https://github.com/anabelreyesweb-boop/anabelweb-backend
cd anabelweb-backend

# 2. Install dependencies

npm install

# 3. Create the environment file

Create a `.env` file in the root of the backend project and add:

PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=anabel
DB_PASSWORD=Anabel123*
DB_NAME=anabelweb_db
JWT_SECRET=my_super_secret_key

# 4. Start the server

node src/app.js

The backend will run at:

http://localhost:3000

# Database

This project uses MySQL with the following database name:

anabelweb_db

# Main tables

* users
* subscriptions
* payments
* premium_content

# Removed table

* portfolio_projects

The portfolio section was removed from the project and is no longer part of the backend or database model.

# Main Endpoints

# General

* GET `/`
* GET `/db-test`

# Authentication

* POST `/auth/register`
* POST `/auth/login`

# User

* GET `/profile`
* GET `/my-subscription`

# Premium Content

* GET `/premium-content`
* GET `/premium-content/:slug`

# Admin Premium Content

* GET `/admin/premium-content`
* GET `/admin/premium-content/:id`
* POST `/premium-content`
* PUT `/premium-content/:id`
* DELETE `/premium-content/:id`

# Authentication and Authorization

The backend uses JWT for protected routes.

# Middleware

* `authMiddleware`
* `requireActiveSubscription`
* `requireAdmin`

# Access rules

* Authenticated users can access `/profile`
* Authenticated users can access `/my-subscription`
* Only users with an active subscription can access premium content
* Only admin users can manage premium content

# Test Users

# Subscriber user

* Name: Ana
* Email: [ana@example.com](mailto:ana@example.com)
* Password: 123456

# Admin user

* Name: Anabel
* Email: [anabel@example.com](mailto:anabel@example.com)
* Password: 123456
* Role: admin

# Notes

* Passwords are hashed with bcrypt
* Tokens are generated with jsonwebtoken
* Environment variables are managed with dotenv
* CORS is enabled for frontend-backend communication
* Payment processing is simulated as part of the academic scope of the project

# Current Status

The backend currently supports:

* working database connection test
* user registration
* user login
* JWT protection
* subscription validation
* premium content access restriction
* full admin CRUD for premium content

# Future Improvements

Some tasks are still pending, such as:

* refactoring `app.js` into controllers, routes, and models
* profile photo update
* password change feature
* improved project documentation
* final presentation materials

# Author

Developed as part of a full-stack web project by Anabel Reyes.
