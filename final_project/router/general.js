const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    // Validate if username and password are provided
    if (!username ||!password) {
      return res.status(400).json({ error: 'Username and password must be provided.' });
    }
  
    // Check if the username already exists
    if (users.some(user => user.username === username)) {
      return res.status(409).json({ error: 'User with this username already exists.' });
    }
  
    // Create a new user object
    const newUser = {
      username,
      password 
    };
  
    // Push the new user into the users array
    users.push(newUser);
  
    // Respond with success message
    return res.status(201).json({ message: 'Registration successful.' });
}); 

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        const getBookList = () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(books);
                }, 1000); // Simulating delay of 1 second
            });
        };

        const bookList = await getBookList();
        return res.status(200).json({ books: bookList });
    } catch (error) {
        return res.status(500).json({ error: 'Unable to fetch book list.' });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const isbnNumber = parseInt(req.params.isbn);
    const book = books[isbnNumber];

    return new Promise((resolve, reject) => {
        if (book) {
            resolve(res.status(200).json({ book }));
        } else {
            reject(res.status(404).json({ error: 'Book not found' }));
        }
    }).catch(error => {
        return res.status(500).json({ error: 'Internal server error' });
    });
});



public_users.get('/author/:author', (req, res) => {
    const author = req.params.author.toLowerCase(); 

    return new Promise((resolve, reject) => {
        const book = Object.values(books).find(bookObj => bookObj.author.toLowerCase() === author);

        if (book) {
            resolve(res.status(200).json({ book }));
        } else {
            reject(res.status(404).json({ error: 'Book not found' }));
        }
    }).catch(error => {
        return res.status(500).json({ error: 'Internal server error' });
    });
});

// Route to handle the request for getting the book details based on title
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title.toLowerCase();

    return new Promise((resolve, reject) => {
        const book = Object.values(books).find(bookObj => bookObj.title.toLowerCase() === title);

        if (book) {
            resolve(res.status(200).json({ book }));
        } else {
            reject(res.status(404).json({ error: 'Book not found' }));
        }
    }).catch(error => {
        return res.status(500).json({ error: 'Internal server error' });
    });
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbnNumber = parseInt(req.params.isbn); 
    const book = Object.values(books).find(bookObj => bookObj.isbn === isbnNumber);
  
    if (book && book.reviews) {
      // If the book is found and has reviews, return the reviews
      return res.status(200).json({ reviews: book.reviews });
    } else {
      // If the book is not found or does not have reviews, return an error
      return res.status(404).json({ error: 'Book not found or no reviews available' });
    }
  });
module.exports.general = public_users;
