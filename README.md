# 🏡 WanderLust

WanderLust is a full-stack web application for exploring and managing accommodation listings. Users can view listings, create new listings, edit or delete listings, and add reviews with ratings.

This project is built using **Node.js, Express.js, MongoDB, Mongoose, EJS, and Bootstrap**.

---

## 🚀 Features

- 🏠 View all accommodation listings
- 🔍 View individual listing details
- ➕ Create new listings
- ✏️ Edit existing listings
- 🗑️ Delete listings
- ⭐ Add reviews and ratings
- 🗑️ Delete reviews
- ✅ Server-side validation using Joi
- ⚠️ Custom error handling
- 🔔 Flash messages for success and error notifications
- 🛣️ Separate Express routers for Listings and Reviews
- 🗄️ MongoDB database integration using Mongoose
- 🔄 PUT and DELETE requests using Method Override
- 📱 Responsive UI using Bootstrap

---

## 🛠️ Tech Stack

### Frontend

- HTML5
- CSS3
- Bootstrap
- EJS
- EJS-Mate

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Other Technologies & Packages

- Joi
- Method-Override
- Express-Session
- Connect-Flash
- Nodemon

---

## 📂 Project Structure

```text
WanderLust/
│
├── models/
│   ├── listing.js
│   └── review.js
│
├── routes/
│   ├── listing.js
│   └── review.js
│
├── views/
│   ├── listings/
│   ├── layouts/
│   └── includes/
│
├── utils/
│   ├── ExpressError.js
│   ├── wrapAsync.js
│   └── flash.js
│
├── public/
│
├── app.js
├── schema.js
├── package.json
├── package-lock.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Sumitsv/WanderLust.git
```

### 2. Navigate to the Project

```bash
cd WanderLust
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

For development:

```bash
nodemon app.js
```

Or:

```bash
node app.js
```

### 5. Open in Browser

```text
http://localhost:8080
```

---

## 🗄️ Database

This project uses **MongoDB** with **Mongoose** for database management.

The application stores accommodation listings and reviews in MongoDB.

Make sure MongoDB is running on your system before starting the application.

Example local MongoDB connection:

```text
mongodb://127.0.0.1:27017/wanderlust
```

---

## 🔄 Application Flow

```text
User
  │
  ▼
Frontend (EJS + Bootstrap)
  │
  ▼
Express.js Server
  │
  ├── Listing Routes
  │      ├── Create
  │      ├── Read
  │      ├── Update
  │      └── Delete
  │
  ├── Review Routes
  │      ├── Create Review
  │      └── Delete Review
  │
  ▼
Mongoose
  │
  ▼
MongoDB
```

---

## 🧩 Architecture

The project follows a modular structure where different responsibilities are separated into different files and folders.

### Models

Models define the structure of data stored in MongoDB.

- `listing.js` — Listing schema and model
- `review.js` — Review schema and model

### Routes

Routes handle different application operations.

- `listing.js` — Listing-related routes
- `review.js` — Review-related routes

### Utils

Utility files contain reusable functionality.

- `ExpressError.js` — Custom error handling
- `wrapAsync.js` — Handles asynchronous errors
- `flash.js` — Flash message functionality

### Views

EJS templates are used to generate dynamic HTML pages.

---

## 🔐 Validation & Error Handling

The application uses **Joi** for server-side validation.

Invalid listing data is validated before being stored in the database.

The project also includes:

- Custom Express error handling
- Async error handling
- Validation middleware
- Flash messages for user feedback

---

## 📚 What I Learned

While building this project, I practiced and learned:

- Node.js fundamentals
- Express.js
- RESTful routing
- CRUD operations
- MVC architecture
- MongoDB
- Mongoose
- Express middleware
- Joi validation
- Error handling
- Async/Await
- Modular routing
- EJS templating
- Bootstrap
- Flash messages
- Git & GitHub
- Project structuring

---

## 🎯 Project Goals

The main goal of this project is to understand how a real-world backend application is structured and how different technologies work together.

It helped me understand the complete flow:

```text
Client
  ↓
Express Route
  ↓
Middleware
  ↓
Controller / Route Logic
  ↓
Mongoose
  ↓
MongoDB
  ↓
Response
  ↓
EJS View
```

---

## 🔮 Future Improvements

The following features can be added in future versions:

- 🔐 User authentication and authorization
- 👤 User profiles
- ❤️ Wishlist / Favorites
- 🔎 Search and filtering
- 🗺️ Map integration
- 📸 Image upload
- ☁️ Cloud image storage
- 🌐 Deployment
- 📱 Improved mobile responsiveness
- 🔒 Better security and authorization

---

## 📌 Future Tech Stack

As the project evolves, additional technologies may be integrated such as:

- Passport.js / modern authentication
- MongoDB Atlas
- Cloudinary
- Map APIs
- Deployment platforms

---

## 👨‍💻 Author

### Sumit Vishwakarma

**B.Tech Computer Science & Engineering Student**

Interested in:

- Full-Stack Development
- MERN Stack
- Data Structures & Algorithms
- Cybersecurity
- Backend Development

---

## ⭐ Acknowledgement

This project was created as a learning project to strengthen my understanding of full-stack web development and backend engineering.

---

## 📄 License

This project is created for educational and learning purposes.
