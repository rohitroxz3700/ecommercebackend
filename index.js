require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const productRoutes = require("./routes/productRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb+srv://rohit:123@cluster0.yylyg3m.mongodb.net/productsDB?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch((error) => console.log("DB Connection Error:", error));

// Routes
app.use("/products", productRoutes);


// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));