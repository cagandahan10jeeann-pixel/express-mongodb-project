const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const bcrypt = require("bcrypt");

const { connectDB, getDB } = require("./config/database");
const auth = require("./middleware/auth");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(express.json());

app.use(express.static("public"));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);


// Home
app.get("/", (req, res) => {
    res.json({
        message: "Express MongoDB Project API is running"
    });
});


// LOGIN
app.post("/login", async (req, res) => {

    const { email, password } = req.body;

    const db = getDB();

    const user = await db.collection("users").findOne({
        email: email
    });

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatch) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    res.json({
        message: "Login successful",
        user: req.session.user
    });

});


// PROTECTED TEST ROUTE
app.get("/protected", auth, (req, res) => {

    res.json({
        message: "You can access this protected route",
        user: req.session.user
    });

});


// LOGOUT
app.get("/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {
            return res.status(500).json({
                message: "Logout failed"
            });
        }

        res.json({
            message: "Logout successful"
        });

    });

});


// BOOKS
// Get all books
app.get("/books", auth, async (req, res) => {

    const db = getDB();

    const books = await db
        .collection("books")
        .find()
        .toArray();

    res.json(books);

});


// Add a book
app.post("/books", auth, async (req, res) => {

    const {
        title,
        author,
        category,
        copies
    } = req.body;

    const db = getDB();

    const result = await db.collection("books").insertOne({

        title: title,

        author: author,

        category: category,

        copies: Number(copies)

    });

    res.json({

        message: "Book added successfully",

        id: result.insertedId

    });

});


// Edit a book
app.put("/books/:id", auth, async (req, res) => {

    const {
        title,
        author,
        category,
        copies
    } = req.body;

    const db = getDB();

    const { ObjectId } = require("mongodb");

    const result = await db.collection("books").updateOne(

        {
            _id: new ObjectId(req.params.id)
        },

        {
            $set: {

                title: title,

                author: author,

                category: category,

                copies: Number(copies)

            }
        }

    );

    if (result.matchedCount === 0) {

        return res.status(404).json({

            message: "Book not found"

        });

    }

    res.json({

        message: "Book updated successfully"

    });

});


// Delete a book
app.delete("/books/:id", auth, async (req, res) => {

    try {

        const { ObjectId } = require("mongodb");

        const db = getDB();

        const bookId = new ObjectId(req.params.id);


        // Check if the book has an active borrowing
        const activeBorrowing =
            await db.collection("borrowings").findOne({

                bookId: req.params.id,

                status: "Borrowed"

            });


        if (activeBorrowing) {

            return res.status(400).json({

                message:
                    "Cannot delete this book because it is currently borrowed."

            });

        }


        // Delete the book
        const result =
            await db.collection("books").deleteOne({

                _id: bookId

            });


        if (result.deletedCount === 0) {

            return res.status(404).json({

                message: "Book not found"

            });

        }


        res.json({

            message: "Book deleted successfully"

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to delete book"

        });

    }

});


// BORROWING RECORDS
// Get all borrowing records
app.get("/borrowings", auth, async (req, res) => {

    const db = getDB();

    const borrowings = await db
        .collection("borrowings")
        .find()
        .toArray();

    res.json(borrowings);

});


// Add a borrowing record
app.post("/borrowings", auth, async (req, res) => {

    const {
        borrowerName,
        bookId
    } = req.body;

    const db = getDB();

    const { ObjectId } = require("mongodb");


    // Find the book
    const book = await db.collection("books").findOne({

        _id: new ObjectId(bookId)

    });


    // Check if book exists
    if (!book) {

        return res.status(404).json({

            message: "Book not found"

        });

    }


    // Check available copies
    if (book.copies <= 0) {

        return res.status(400).json({

            message: "No copies available"

        });

    }


    // Create borrowing record
    const result = await db.collection("borrowings").insertOne({

        borrowerName: borrowerName,

        bookId: bookId,

        bookTitle: book.title,

        borrowDate: new Date(),

        status: "Borrowed"

    });


    // Decrease book copies
    await db.collection("books").updateOne(

        {
            _id: new ObjectId(bookId)
        },

        {
            $inc: {

                copies: -1

            }
        }

    );


    res.json({

        message: "Borrowing recorded successfully",

        id: result.insertedId

    });

});


// Return a borrowed book
app.put(
    "/borrowings/:id/return",
    auth,
    async (req, res) => {

        const db = getDB();

        const { ObjectId } = require("mongodb");


        // Find borrowing record
        const borrowing =
            await db.collection("borrowings").findOne({

                _id: new ObjectId(req.params.id)

            });


        // Check borrowing record
        if (!borrowing) {

            return res.status(404).json({

                message: "Borrowing record not found"

            });

        }


        // Prevent returning twice
        if (borrowing.status === "Returned") {

            return res.status(400).json({

                message: "Book has already been returned"

            });

        }


        // Update borrowing record
        await db.collection("borrowings").updateOne(

            {
                _id: new ObjectId(req.params.id)
            },

            {
                $set: {

                    status: "Returned",

                    returnDate: new Date()

                }
            }

        );


        // Find the book
        const book =
            await db.collection("books").findOne({

                _id: new ObjectId(borrowing.bookId)

            });


        // Check if book exists
        if (!book) {

            return res.status(404).json({

                message: "Book not found"

            });

        }


        // Add one copy back
        const bookResult =
            await db.collection("books").updateOne(

                {
                    _id: new ObjectId(borrowing.bookId)
                },

                {
                    $inc: {

                        copies: 1

                    }
                }

            );


        console.log(
            "Book copies updated:",
            bookResult.modifiedCount
        );


        res.json({

            message: "Book returned successfully"

        });

    }
);


// START SERVER
async function startServer() {

    await connectDB();

    app.listen(PORT, () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

    });

}

startServer();