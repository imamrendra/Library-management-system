const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const booksRoute = require("./routes/books"); // Import the books route

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const port = 5000;

app.use(cors());


mongoose.connect("mongodb://127.0.0.1:27017/library", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Connected to MongoDB");
})
.catch((error) => {
  console.error("Error connecting to MongoDB:", error);
});

// Use the booksRoute for the "/api/books" route
app.use("/api/books", booksRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
