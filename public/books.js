const bookForm = document.getElementById("bookForm");

const message = document.getElementById("message");

const bookList = document.getElementById("bookList");


// ADD BOOK

bookForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const title =
        document.getElementById("title").value;

    const author =
        document.getElementById("author").value;

    const category =
        document.getElementById("category").value;

    const copies =
        document.getElementById("copies").value;


    const response = await fetch("/books", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        credentials: "include",

        body: JSON.stringify({

            title: title,

            author: author,

            category: category,

            copies: copies

        })

    });


    const data = await response.json();


    message.textContent = data.message;


    if (response.ok) {

        bookForm.reset();

        loadBooks();

    }

});


// LOAD BOOKS

async function loadBooks() {

    const response = await fetch(
        "/books",
        {
            credentials: "include"
        }
    );

    const books = await response.json();


    if (!response.ok) {

        bookList.innerHTML = `
            <tr>
                <td colspan="5">
                    ${books.message}
                </td>
            </tr>
        `;

        return;

    }


    if (books.length === 0) {

        bookList.innerHTML = `
            <tr>
                <td colspan="5">
                    No books yet.
                </td>
            </tr>
        `;

        return;

    }


    bookList.innerHTML = "";


    books.forEach((book) => {

        const row = document.createElement("tr");


        row.innerHTML = `

            <td>
                ${book.title}
            </td>

            <td>
                ${book.author}
            </td>

            <td>
                ${book.category}
            </td>

            <td>
                ${book.copies}
            </td>

            <td>

                <button
                    onclick="editBook(
                        '${book._id}',
                        '${book.title.replace(/'/g, "\\'")}',
                        '${book.author.replace(/'/g, "\\'")}',
                        '${book.category.replace(/'/g, "\\'")}',
                        '${book.copies}'
                    )"
                >
                    Edit
                </button>


                <button
                    onclick="deleteBook('${book._id}')"
                >
                    Delete
                </button>

            </td>

        `;


        bookList.appendChild(row);

    });

}


// CANCEL ADD BOOK

document.getElementById(
    "cancelAddButton"
).addEventListener(
    "click",
    () => {

        bookForm.reset();

        message.textContent = "";

    }
);


// EDIT BOOK

function editBook(
    id,
    title,
    author,
    category,
    copies
) {

    document.getElementById(
        "editBookBox"
    ).style.display = "block";


    document.getElementById(
        "editBookId"
    ).value = id;


    document.getElementById(
        "editTitle"
    ).value = title;


    document.getElementById(
        "editAuthor"
    ).value = author;


    document.getElementById(
        "editCategory"
    ).value = category;


    document.getElementById(
        "editCopies"
    ).value = copies;


    document.getElementById(
        "editMessage"
    ).textContent = "";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// UPDATE BOOK

const editBookForm =
    document.getElementById("editBookForm");


editBookForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const id =
            document.getElementById("editBookId").value;


        const title =
            document.getElementById("editTitle").value;


        const author =
            document.getElementById("editAuthor").value;


        const category =
            document.getElementById("editCategory").value;


        const copies =
            document.getElementById("editCopies").value;


        const response = await fetch(
            `/books/${id}`,
            {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({

                    title: title,

                    author: author,

                    category: category,

                    copies: copies

                })

            }
        );


        const data = await response.json();


        document.getElementById(
            "editMessage"
        ).textContent = data.message;


        if (response.ok) {

            editBookForm.reset();

            document.getElementById(
                "editBookBox"
            ).style.display = "none";


            loadBooks();

        }

    }
);


// CANCEL EDIT

document.getElementById(
    "cancelEditButton"
).addEventListener(
    "click",
    () => {

        editBookForm.reset();


        document.getElementById(
            "editBookBox"
        ).style.display = "none";


        document.getElementById(
            "editMessage"
        ).textContent = "";

    }
);


// DELETE BOOK

async function deleteBook(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this book?"
        );


    if (!confirmDelete) {

        return;

    }


    const response = await fetch(
        `/books/${id}`,
        {

            method: "DELETE",

            credentials: "include"

        }
    );


    const data = await response.json();


    if (response.ok) {

        alert(data.message);

        loadBooks();

    } else {

        alert(data.message);

    }

}


// START

loadBooks();