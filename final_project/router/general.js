const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username, password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user. Username and password are required." });
});

// Get the book list available in the shop (Promise / async-await)
public_users.get('/', async function (req, res) {
  const getBooks = new Promise((resolve) => {
    resolve(books);
  });
  const allBooks = await getBooks;
  return res.status(200).send(JSON.stringify(allBooks, null, 4));
});

// Get book details based on ISBN (Promise / async-await)
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  const getByIsbn = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });
  try {
    const book = await getByIsbn;
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
});

// Get book details based on author (Promise / async-await)
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  const getByAuthor = new Promise((resolve) => {
    const result = [];
    for (const key in books) {
      if (books[key].author === author) {
        result.push({ isbn: key, ...books[key] });
      }
    }
    resolve(result);
  });
  const result = await getByAuthor;
  if (result.length > 0) {
    return res.status(200).json({ booksbyauthor: result });
  }
  return res.status(404).json({ message: `No books found by author ${author}` });
});

// Get all books based on title (Promise / async-await)
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  const getByTitle = new Promise((resolve) => {
    const result = [];
    for (const key in books) {
      if (books[key].title === title) {
        result.push({ isbn: key, ...books[key] });
      }
    }
    resolve(result);
  });
  const result = await getByTitle;
  if (result.length > 0) {
    return res.status(200).json({ booksbytitle: result });
  }
  return res.status(404).json({ message: `No books found with title ${title}` });
});

// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }
  return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

/*
 * The functions below use Axios with async/await (and Promise callbacks)
 * to retrieve books from the API endpoints defined above.
 */

// Task 10: Get all books using async/await with Axios
async function getAllBooks() {
  try {
    const response = await axios.get('http://localhost:5000/');
    return response.data;
  } catch (error) {
    console.error('Error fetching all books:', error.message);
  }
}

// Task 11: Get book details based on ISBN using async/await with Axios
async function getBookByISBN(isbn) {
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching book by ISBN:', error.message);
  }
}

// Task 12: Get book details based on author using Promise callbacks with Axios
function getBookByAuthor(author) {
  return axios
    .get(`http://localhost:5000/author/${author}`)
    .then((response) => response.data)
    .catch((error) => console.error('Error fetching books by author:', error.message));
}

// Task 13: Get all books based on title using async/await with Axios
async function getBookByTitle(title) {
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching books by title:', error.message);
  }
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBookByAuthor = getBookByAuthor;
module.exports.getBookByTitle = getBookByTitle;
