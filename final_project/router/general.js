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

/* ===========================================================================
 * Retrieving books from the API using Axios with Promise callbacks / async-await
 * Each function below implements one of the required retrieval operations:
 *   1. Get all books
 *   2. Get book details based on ISBN
 *   3. Get book details based on author
 *   4. Get book details based on title
 * =========================================================================== */

const BASE_URL = 'http://localhost:5000';

// 1. Get the list of ALL books — async/await with Axios
async function getAllBooks() {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log("All books:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching all books:', error.message);
  }
}

// 2. Get book details based on ISBN — async/await with Axios
async function getBookByISBN(isbn) {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    console.log(`Book with ISBN ${isbn}:`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching book by ISBN:', error.message);
  }
}

// 3. Get book details based on AUTHOR — Promise callbacks with Axios
function getBookByAuthor(author) {
  return axios
    .get(`${BASE_URL}/author/${author}`)
    .then((response) => {
      console.log(`Books by author ${author}:`, response.data);
      return response.data;
    })
    .catch((error) => console.error('Error fetching books by author:', error.message));
}

// 4. Get book details based on TITLE — Promise callbacks with Axios
function getBookByTitle(title) {
  return axios
    .get(`${BASE_URL}/title/${title}`)
    .then((response) => {
      console.log(`Books with title ${title}:`, response.data);
      return response.data;
    })
    .catch((error) => console.error('Error fetching books by title:', error.message));
}

// Demonstration of the four retrieval functions
async function demonstrateBookRetrieval() {
  await getAllBooks();
  await getBookByISBN(1);
  await getBookByAuthor("Jane Austen");
  await getBookByTitle("Things Fall Apart");
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBookByAuthor = getBookByAuthor;
module.exports.getBookByTitle = getBookByTitle;
module.exports.demonstrateBookRetrieval = demonstrateBookRetrieval;
