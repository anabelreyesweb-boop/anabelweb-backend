# AURUMPILL Backend

This is the backend of **AURUMPILL**, a full-stack web application built with **Node.js**, **Express**, **MySQL**, and **JWT authentication**.

The backend provides the REST API used by the frontend to manage authentication, subscriptions, profile data, premium content, and admin features.

## Version

1.0.0

## Project Overview

The backend is responsible for:

* User authentication
* Profile management
* Password change
* Profile photo storage
* Subscription management
* Payment simulation
* Premium content access
* Admin CRUD for premium content
* Route protection with JWT
* Role-based access control for admin users

The backend is connected to a **MySQL** database and communicates with the frontend through HTTP requests.

## Tech Stack

* Node.js
* Express
* MySQL
* JWT
* bcrypt
* dotenv
* cors

## Backend Port

The backend runs on:

PORT=3000

## Environment Variables

Create a `.env` file in the root of the backend project and configure it with your local database credentials:

PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret

## Getting Started

### 1. Clone the repository

git clone https://github.com/anabelreyesweb-boop/anabelweb-backend.git
cd anabelweb-backend

### 2. Install dependencies

npm install

### 3. Create the MySQL database

Before running the backend, create the MySQL database manually.

Example:

CREATE DATABASE aurumpill_db;

You can use any database name you want, but it must match the value used in your `.env` file under `DB_NAME`.

### 4. Create or use a MySQL user

You must also use a MySQL user with permission to access that database.

Example:

CREATE USER 'aurumpill_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON aurumpill_db.* TO 'aurumpill_user'@'localhost';
FLUSH PRIVILEGES;

If you already have a valid MySQL user, you can use that one instead.

### 5. Configure the `.env` file

Example configuration:

PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=aurumpill_user
DB_PASSWORD=your_password
DB_NAME=aurumpill_db
JWT_SECRET=your_jwt_secret

### 6. Import the SQL files

Once the database has been created, import the SQL files in this order:

1. `schema.sql`
2. `seed.sql`

Example:

mysql -u aurumpill_user -p aurumpill_db < database/schema.sql
mysql -u aurumpill_user -p aurumpill_db < database/seed.sql

### 7. Start the development server

npm start

The API will run at:

http://localhost:3000

## Database

The backend uses a **MySQL** database.

Main tables used in the project:

* users
* subscriptions
* payments
* premium_content

The `users` table also stores:

* password hash
* profile photo
* role

## Seed Access Data

The seed file includes example users for testing.

### Admin user

* Email: [anabel@example.com](mailto:anabel@example.com)
* Password: 123456

### Subscriber users

* Email: [laura@example.com](mailto:laura@example.com)

* Password: 123456

* Email: [ana@example.com](mailto:ana@example.com)

* Password: 123456

## Authentication and Security

The backend uses **JWT** tokens for protected routes.

Main security features:

* Login with email and password
* Password hashing with bcrypt
* Token verification through middleware
* Role-based admin access
* Protected subscription routes
* Admin access to subscriber-only content

## Main API Endpoints

### Public Endpoints

* `GET /`
* `GET /db-test`
* `POST /subscribe`
* `POST /auth/login`
* `POST /auth/forgot-password`

### Authenticated User Endpoints

* `GET /profile`
* `PUT /profile/photo`
* `POST /auth/change-password`
* `GET /my-subscription`

### Premium Content Endpoints

* `GET /premium-content`
* `GET /premium-content/:slug`

### Admin Endpoints

* `GET /admin/premium-content`
* `GET /admin/premium-content/:id`
* `POST /premium-content`
* `PUT /premium-content/:id`
* `DELETE /premium-content/:id`

## Main Features

### Authentication

* User login
* JWT generation
* Protected routes
* Admin role verification
* Forgot password flow

### Subscription Flow

The backend handles a subscription system with one premium plan:

* €10 per month
* Active subscription required for premium access
* Admin can also access protected premium routes

When a user subscribes:

1. The user account is created
2. The password is hashed
3. A subscription is created
4. A payment record is created
5. The frontend receives the data required to continue the flow

### Profile Features

* Profile data retrieval
* Real password change
* Real profile photo storage in database

### Premium Content

* Premium content list for subscribed users
* Premium detail by slug
* Admin CRUD for premium content

## Project Structure

src/
  config/
    db.js
  middleware/
    authMiddleware.js
  app.js
database/
  schema.sql
  seed.sql

## Available Scripts

### npm start

Runs the backend server in development mode.

## Notes

* Payment processing is simulated for academic purposes
* Confirmation flows are simulated
* Profile photo is stored in the database
* Passwords are stored as hashes
* Admin users have access to premium content and admin endpoints

## License

This project is licensed under the MIT License.

## Author

Anabel Reyes
GitHub: https://github.com/anabelreyesweb-boop