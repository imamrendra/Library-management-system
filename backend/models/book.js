const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  bookID: String,
  title: String,
  authors: String,
  average_rating: String,
  isbn: String,
  isbn13: String,
  language_code: String,
  num_pages: String,
  ratings_count: String,
  text_reviews_count: String,
  publication_date: String,
  publisher: String,
 
  available: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model("Book", bookSchema);
