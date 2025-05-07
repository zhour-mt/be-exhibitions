
# CurationStudio: An Exhibition Curation Platform – Backend 🖌️

This is the backend repository for Curation Studio, built with Express.js and PostgreSQL. It provides routes for user authentication, saving artworks, managing exhibitions, and retrieving artwork data.



## ✨ Features

- User registration and login (with JWT)
- Save artworks to exhibitions (users and guests)
- Remove artworks from exhibitions (users and guests)
- Manage exhibitions (create, delete, retrieve)

## 🔗 Frontend
You can find the frontend of this project [here](https://github.com/your-username/fe-exhibitions)

## 🛠️ Tech Stack

- Node.js
- Express.js
- PostgreSQL
- pg & pg-format
- bcrypt
- JWT (jsonwebtoken)
- Supabase (optional for deployment)

## 🚀 Running Locally

### 1. Clone the repository
```bash
git clone https://github.com/[your-username]/be-exhibitions.git
cd exhibition-curation-backend
```
### 2. Install dependencies
```bash
npm install
```

### 3. Set up your PostgreSQL databases
Run the following command to create your development and test databases:
```bash
psql root -f db/setup.sql
```

Set up three .env files with the following names and environment variables:
- .env.test ( used for running the test environment)

```bash
PGDATABASE=[test-database-name]
JWT_SECRET=[test-secret-key-for-user-authentication]
```
- .env.development (used for running the development environment)
```bash
PGDATABASE=[development-database-name]
JWT_SECRET=[development-secret-key-for-user-authentication]
```
- .env.production (used for the running the production environment)
```bash
PGDATABASE=[production-database-name or Supabase URL]
JWT_SECRET=[production-secret-key-for-user-authentication]
```

### 4. Seed the data
- For the test environment, run the following command:
```bash
npm test
```
- For the development environment, run the following command:
```bash
npm run seed
```
- For the production environment, run the following command:
```bash
npm run seed-prod
```
This will drop, create, and populate the database with data.

### 5. Start the server
For the development environment, enter the following command:
``` bash
npm run dev
```
The API will run on http://localhost:9000 and can be accessed via Insomnia.


## 📁 API Routes
### 🌐 Live API Access
Requests to the deployed API can be made at:
https://be-exhibitions.onrender.com



### 🧑‍💼 Auth
- `POST /api/register` – Register a new user
- `POST /api/login` – Log in an existing user

### 💾 Saved Artworks
- `GET /api/user/exhibitions/artworks` – Get all saved artworks
- `POST /api/user/exhibitions/artworks` – Save an artwork
- `DELETE /api/user/exhibitions/artworks/:artwork_id` – Remove saved artwork

### 👤 Guest Artworks
- `GET /api/exhibitions/guest-artworks` – View guest-saved artworks
- `POST /api/exhibitions/guest-artworks` – Save artwork as guest
- `DELETE /api/exhibitions/guest-artworks/:artwork_id` – Delete guest-saved artwork

### 🖼️ Exhibitions
- `GET /api/user/exhibitions` – Retrieve all exhibitions for a user
- `POST /api/user/exhibitions` – Create a new exhibition
- `DELETE /api/user/exhibitions/:id` – Delete an exhibition by ID
- `GET /api/user/exhibitions/:id/artworks` – Get artworks for an exhibition



## 📦 Deployment
You can deploy this on Render or any other platform that supports Node.js.

