const express = require("express")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary")
const multer = require("multer")
const Product = require("../models/productModel")

const router = express.Router()

// Cloudinary Storage for Multer
const storageAirConditioners = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products", // Folder where files will be stored in Cloudinary
    format: async (req, file) => "jpeg", // Convert files to JPEG
    public_id: (req, file) => file.originalname.split(".")[0], // Filename without extension
  },
});

const uploadAc = multer({ storage: storageAirConditioners });

// 🟢 Add a Product with Cloudinary Image Upload
router.post("/addProducts", uploadAc.array("images", 8), async (req, res) => {
  try {
    console.log("Uploaded Files:", req.files)
    console.log("Products:", req.body.products)

    const products = JSON.parse(req.body.products)
    const imageUrls = req.files.map(file => file.path)

    console.log("Mapped Image URLs:", imageUrls)
    if (products.length !== imageUrls.length) {
      return res.status(400).json({ error: "Mismatch between products and images" })
    }

    const category = req.body.category; // Get the category from the request (e.g., "Fridge")

    const productEntries = products.map((product, index) => ({
      name: product.name,
      description: product.description,
      price: product.price,
      rating: product.rating || 0,
      image: imageUrls[index],
      category: category, // Attach the category to the product
    }));

    await Product.insertMany(productEntries);
    res.status(201).json({ message: "Products added successfully!", products: productEntries });
  } catch (error) {
    console.error("Error:", error.message)
    res.status(500).json({ error: error.message })
  }
});

router.post("/addSingleProduct", uploadAc.single("image"), async (req, res) => {
  try {
    console.log("Uploaded File:", req.file);
    console.log("Product:", req.body.product);

    const product = JSON.parse(req.body.product);
    const imageUrl = req.file.path;

    const category = req.body.category; // Get the category from the request

    const productEntry = {
      name: product.name,
      description: product.description,
      price: product.price,
      rating: product.rating || 0,
      image: imageUrl,
      category: category, // Attach the category to the product
    };

    await Product.create(productEntry);
    res.status(201).json({ message: "Product added successfully!", product: productEntry });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get("/getProductsByCategory", async (req, res) => {
  try {
    const { category } = req.query; // Pass category as a query param
    const products = await Product.find({ category })
    console.log(products)
    res.status(200).json({
      message: `${category} products retrieved successfully!`,
      products,
    });
  } catch (error) {
    console.error("Error:", error.message)
    res.status(500).json({ error: error.message })
  }
});

const mongoose = require("mongoose");

router.get("/getProductById/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get ID from URL parameters

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Product ID format" });
    }

    console.log("Extracted ID:", id);
    console.log("Is ID Valid?", mongoose.Types.ObjectId.isValid(id));
    
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ message: "Product retrieved successfully", product });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get("/searchProducts", async (req, res) => {
  try {
      const { name } = req.query;
      if (!name) return res.status(400).json({ message: "Search term is required" });

      // Find products where `name` contains the search term (case-insensitive)
      const products = await Product.find({ name: { $regex: name, $options: "i" } });

      if (products.length > 0) {
          res.status(200).json({ message: "Products found!", products });
      } else {
          res.status(404).json({ message: "No matching products found." });
      }
  } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ error: error.message });
  }
});

module.exports = router