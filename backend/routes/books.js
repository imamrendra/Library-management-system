const express = require("express");
const axios = require("axios");
const Book = require("../models/book"); 
const router = express.Router();




router.get("/fetch-and-store", async (req, res) => {
  try {
    const { title, page, quantity } = req.query;
    let apiUrl = "https://frappe.io/api/method/frappe-library";

    // Add query parameters based on input
    const queryParams = {};

    
    if (title) {
      queryParams.title = title;
      if (quantity) {
        queryParams.quantity = quantity;
      }
    }

    if (page) {
      queryParams.page = page;
    }

    const response = await axios.get(apiUrl, {
      params: queryParams
    });

    const books = response.data.message.map((bookData) => ({
      bookID: bookData.bookID,
      title: bookData.title,
      authors: bookData.authors,
      average_rating: bookData.average_rating,
      isbn: bookData.isbn,
      isbn13: bookData.isbn13,
      language_code: bookData.language_code,
      num_pages: bookData.num_pages,
      ratings_count: bookData.ratings_count,
      text_reviews_count: bookData.text_reviews_count,
      publication_date: bookData.publication_date,
      publisher: bookData.publisher,
      available: 1,
    }));

    await Book.insertMany(books); // Store data in MongoDB using the Book model

    res.json({ message: "Data fetched and stored successfully." });
  } catch (error) {
    console.error("Error fetching and storing data:", error);
    res.status(500).json({ error: "Error fetching and storing data." });
  }
});
router.get("/search", async (req, res) => {
  const { title } = req.query;

  try {
    const books = await Book.find({ title: { $regex: title, $options: "i" } });
    res.json(books);
  } catch (error) {
    console.error("Error searching for books:", error);
    res.status(500).json({ error: "Error searching for books." });
  }
});

// Fetch data from MongoDB
router.get("/fetch-from-mongo", async (req, res) => {
  try {
    const books = await Book.find(); 
    res.json(books);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Error fetching data from MongoDB." });
  }
});



router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(book);
  } catch (error) {
    console.error("Error fetching book details:", error);
    res.status(500).json({ error: "Error fetching book details." });
  }
});




// Add a new book or update quantity if the book already exists
router.post("/add", async (req, res) => {
  const { title, quantity } = req.body;

  try {
    let existingBook = await Book.findOne({ title: { $regex: `.*${title}.*`, $options: 'i' } });

    if (existingBook) {
      existingBook.quantity += parseInt(quantity);
      existingBook.available += parseInt(quantity);
      await existingBook.save();
      res.status(200).json(existingBook);
    } else {
      const newBook = new Book({
        title,
        quantity,
        available: parseInt(quantity),
      });
      const savedBook = await newBook.save();
      res.status(201).json(savedBook);
    }
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ error: "Error adding book." });
  }
});

router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const updatedBookData = req.body;
  console.log("Type of id:", typeof id);
  console.log("Received request to update book with ID:", id);
  console.log("Updated book data:", updatedBookData);

  try {
    const updatedBook = await Book.findByIdAndUpdate(id, updatedBookData, { new: true });
    console.log("Updated book:", updatedBook);
    res.json(updatedBook);
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ error: "Error updating book." });
  }
});



// Update the quantity of an existing book based on title
router.put("/:id", async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ error: "Error updating book quantity." });
  }
});






router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ error: "Error deleting book." });
  }
});




module.exports = router;
