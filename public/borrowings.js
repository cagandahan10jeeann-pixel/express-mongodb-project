const borrowingForm =
    document.getElementById("borrowingForm");

const borrowerNameInput =
    document.getElementById("borrowerName");

const bookSelect =
    document.getElementById("book");

const message =
    document.getElementById("message");

const borrowingList =
    document.getElementById("borrowingList");


// LOAD BOOKS INTO DROPDOWN

async function loadBooks() {

    const response = await fetch(
        "/books",
        {
            credentials: "include"
        }
    );

    const books = await response.json();


    if (!response.ok) {

        return;

    }


    bookSelect.innerHTML = `
        <option value="">
            Select Book
        </option>
    `;


    books.forEach((book) => {

        const option =
            document.createElement("option");


        option.value =
            book._id;


        option.textContent =
            `${book.title} (${book.copies} available)`;


        if (book.copies <= 0) {

            option.disabled = true;

        }


        bookSelect.appendChild(option);

    });

}


// RECORD BORROWING

borrowingForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const borrowerName =
            borrowerNameInput.value.trim();


        const bookId =
            bookSelect.value;


        const response = await fetch(
            "/borrowings",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({

                    borrowerName: borrowerName,

                    bookId: bookId

                })

            }
        );


        const data =
            await response.json();


        message.textContent =
            data.message;


        if (response.ok) {

            borrowingForm.reset();

            await loadBooks();

            await loadBorrowings();

        }

    }
);


// LOAD BORROWING RECORDS

async function loadBorrowings() {

    const response = await fetch(
        "/borrowings",
        {
            credentials: "include"
        }
    );


    const borrowings =
        await response.json();


    if (!response.ok) {

        borrowingList.innerHTML = `
            <tr>
                <td colspan="5">
                    ${borrowings.message}
                </td>
            </tr>
        `;

        return;

    }


    if (borrowings.length === 0) {

        borrowingList.innerHTML = `
            <tr>
                <td colspan="5">
                    No borrowing records yet.
                </td>
            </tr>
        `;

        return;

    }


    borrowingList.innerHTML = "";


    borrowings.forEach((borrowing) => {

        const row =
            document.createElement("tr");


        const date =
            new Date(
                borrowing.borrowDate
            ).toLocaleDateString();


        let action = "";


        if (borrowing.status === "Borrowed") {

            action = `
                <button
                    onclick="returnBook('${borrowing._id}')"
                >
                    Return Book
                </button>
            `;

        } else {

            action = "-";

        }


        row.innerHTML = `

            <td>
                ${borrowing.borrowerName}
            </td>

            <td>
                ${borrowing.bookTitle}
            </td>

            <td>
                ${date}
            </td>

            <td>
                ${borrowing.status}
            </td>

            <td>
                ${action}
            </td>

        `;


        borrowingList.appendChild(row);

    });

}


// RETURN BOOK

async function returnBook(id) {

    const response = await fetch(
        `/borrowings/${id}/return`,
        {

            method: "PUT",

            credentials: "include"

        }
    );


    const data =
        await response.json();


    message.textContent =
        data.message;


    if (response.ok) {

        await loadBooks();

        await loadBorrowings();

    }

}


// START PAGE

loadBooks();

loadBorrowings();