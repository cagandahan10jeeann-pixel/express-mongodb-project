# 📚 Book Borrowing System

A simple web-based Book Borrowing System built using Node.js, Express.js, and MongoDB.

The system is designed for a librarian to manage books and record borrowing and returning transactions.

## Features

* Librarian Login
* Session-based authentication
* Protected pages
* Dashboard
* Add, view, edit, and delete books
* Record book borrowing
* Return borrowed books
* Automatically update available book copies
* Prevent deletion of currently borrowed books
* View borrowing history
* Librarian profile
* Logout

## Technologies Used

* Node.js
* Express.js
* MongoDB
* MongoDB Compass
* HTML
* CSS
* JavaScript
* express-session
* bcrypt
* dotenv
* Nodemon

## MongoDB Database

Database name:

```text
express_project
```

Collections:

```text
users
books
borrowings
```

### users

Stores librarian account information.

Example fields:

```text
name
email
password
role
```

Passwords are stored using bcrypt hashing.

### books

Stores information about the books available in the library.

Example fields:

```text
title
author
category
copies
```

### borrowings

Stores book borrowing and returning records.

Example fields:

```text
borrowerName
bookId
bookTitle
borrowDate
status
returnDate
```

MongoDB Compass is used to view and manage the database during development and demonstration.

## Why MongoDB

MongoDB is appropriate for this project because it stores data as flexible documents.

The system has different types of data such as users, books, and borrowing records, which can be stored and managed as documents in separate collections.

MongoDB also allows the data to persist even after the application is stopped.

## Express.js and MongoDB Connection

The Express.js server communicates with MongoDB using the official MongoDB Node.js driver.

The database connection is handled in:

```text
config/database.js
```

Express routes use the database connection to create, read, update, and delete documents from the MongoDB collections.

The basic flow is:

```text
Browser
   ↓
Express.js
   ↓
MongoDB
   ↓
Express.js
   ↓
Browser
```

## CRUD Operations

The system demonstrates CRUD operations for books.

* **Create** — Add a new book
* **Read** — View the list of books
* **Update** — Edit book information
* **Delete** — Delete a book

The system also checks whether a book is currently borrowed before allowing it to be deleted.

## Middleware

The project uses Express middleware for different purposes.

### Express JSON Middleware

```js
app.use(express.json());
```

This middleware allows the server to receive JSON data from requests.

For example, when the frontend sends book information to the Express server, `express.json()` allows the server to read the data from `req.body`.

### Static File Middleware

```js
app.use(express.static("public"));
```

This middleware allows Express to serve the HTML, CSS, and JavaScript files stored inside the `public` folder.

### Session Middleware

```js
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);
```

This middleware creates and maintains login sessions.

The session allows the server to remember whether the librarian is currently logged in.

### Authentication Middleware

The project has a custom authentication middleware:

```text
middleware/auth.js
```

It checks whether a user is logged in before allowing access to protected routes.

The middleware receives:

```text
req
res
next
```

It checks:

```js
req.session.user
```

If the user is not logged in, the middleware stops the request and returns:

```text
Login required
```

If the user is logged in, the middleware calls:

```js
next();
```

The `next()` function passes control to the next middleware or route handler.

The authentication middleware is used by protected routes such as:

```text
/protected
/books
/borrowings
```

The basic flow is:

```text
Request
   ↓
Authentication Middleware
   ↓
Is the user logged in?
   ↓
   ├── No → Stop request
   │
   └── Yes → next()
                ↓
           Route Handler
```

## Session Management

The system uses `express-session` for authentication.

After a successful login, the user's information is stored in the session.

The application stores basic user information such as:

```text
id
name
email
role
```

Protected features check the session before allowing access.

The basic flow is:

```text
Login
   ↓
Session Created
   ↓
Access Protected Pages
   ↓
Use Book and Borrowing Features
   ↓
Logout
   ↓
Session Destroyed
```

The system does not expose passwords or session secrets.

## Book Borrowing Process

The librarian enters the borrower's name and selects a book.

When a book is borrowed:

1. The system checks if the book exists.
2. The system checks if copies are available.
3. A borrowing record is saved in MongoDB.
4. The available copies are decreased.

When the book is returned:

1. The borrowing status is changed to `Returned`.
2. The return date is recorded.
3. The book's available copies are increased.

A currently borrowed book cannot be deleted.

## Project Structure

```text
express-mongodb-project/

│
├── config/
│   └── database.js
│
├── middleware/
│   └── auth.js
│
├── public/
│   ├── index.html
│   ├── dashboard.html
│   ├── books.html
│   ├── books.js
│   ├── borrowings.html
│   ├── borrowings.js
│   ├── profile.html
│   ├── script.js
│   └── style.css
│
├── .gitignore
├── main.js
├── package.json
├── package-lock.json
└── README.md
```

> The `.env` file is used locally but is excluded from Git using `.gitignore`.

## Installation

Clone or download the project.

Install the required dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=3000

MONGODB_URI=mongodb://127.0.0.1:27017

DB_NAME=express_project

SESSION_SECRET=your_secret_key_here
```

Do not upload the `.env` file to GitHub.

## Running the Project

Start the server normally:

```bash
npm start
```

For development with Nodemon:

```bash
npm run dev
```

Open the application in a browser:

```text
http://localhost:3000
```

## MongoDB Compass

Make sure MongoDB is running locally.

Open MongoDB Compass and connect to:

```text
mongodb://127.0.0.1:27017
```

Then open:

```text
express_project
```

The database contains:

```text
users
books
borrowings
```

MongoDB Compass can be used to view the stored documents and demonstrate that the application data persists in the database.

## Security

* Passwords are hashed using bcrypt.
* Database configuration and session secrets are stored in `.env`.
* `.env` is excluded from Git using `.gitignore`.
* Protected routes require an authenticated session.
* Passwords and session secrets should not be shown in demonstrations or uploaded to GitHub.

## Author

Developed as a course project using Node.js, Express.js, and MongoDB.
