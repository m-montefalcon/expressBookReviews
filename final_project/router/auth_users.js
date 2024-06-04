const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if the username exists in the users array
    return users.some(user => user.username === username);
  };
  
  const authenticatedUser = (username, password) => {
    // Find a user object that matches the provided username
    const userRecord = users.find(user => user.username === username);
  
    // If no user is found, return false
    if (!userRecord) return false;
  
    // Compare the provided password with the stored password
    return userRecord.password === password;
  };
  

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    // Validate if username and password are provided
    if (!username ||!password) {
        return res.status(400).json({ error: 'Username and password must be provided.' });
      }
    
  
    // Authenticate the user
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
  
    // Generate JWT
    const token = jwt.sign({ username }, 'secret', { expiresIn: '1h' });
  
    // Set JWT as a cookie
    res.cookie('token', token, { httpOnly: true, secure: false }); 
    req.session.user = {username: username };
    // Respond with success message and token
    return res.status(200).json({ message: 'Login successful.', token , username});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const user= req.session.user.username; // Retrieve the username from the session
    const { review } = req.query; // Extract the review from the query parameters
  
    if (!review) {
      return res.status(400).json({ message: "Review is required." });
    }
  
    const isbn = parseInt(req.params.isbn); // Convert the ISBN to a number
  
    // Check if the book exists in the books database
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found." });
    }
  
    // Check if the user already has a review for this book
    if (books[isbn].reviews.hasOwnProperty(user)) {
      // If the user already has a review for this book, update it
      books[isbn].reviews[user] = review;
      // Return the entire book object with the updated review
      return res.status(200).json({ 
        message: "Review updated successfully.", 
        book: books[isbn], 
        user 
      });
    } else {
      // If the user doesn't have a review for this book, add a new one
      books[isbn].reviews[user] = review;
      // Return the entire book object with the newly added review
      return res.status(201).json({ 
        message: "Review added successfully.", 
        book: books[isbn], 
        user 
      });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const user = req.session.user.username; // Retrieve the username from the session
    const isbn = parseInt(req.params.isbn); // Convert the ISBN to a number

    // Check if the book exists in the books database
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Check if the user has a review for this book
    if (!books[isbn].reviews.hasOwnProperty(user)) {
        return res.status(404).json({ message: "Review not found for this user and book." });
    }

    // Delete the review for this user and book
    delete books[isbn].reviews[user];

    // Return success message
    return res.status(200).json({ message: "Review deleted successfully." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
