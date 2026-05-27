const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require("multer");
const passport = require("passport");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
let upload = multer({ storage: storage });
router.get("/dashboard", async (req, res) => {
  try {
    const dbProduct = await Product.find();

    let stats = { instock: 0 };
    const instockAgg = await Product.aggregate([
      { $group: { _id: null, grandProducts: { $sum: "$quantity" } } },
    ]);
    stats.instock = instockAgg.length > 0 ? instockAgg[0].grandProducts : 0;

    // 1. Existing logic for Product Addition (Green Banner)
    const successMessage = req.query.productSuccess
      ? "Product has been added successfully!"
      : null;

    // 2. New logic for Login Success (The Modal)
    const showLoginModal = req.query.loginSuccess === "true";

    res.render("dashboard", {
      dbProduct,
      stats,
      successMessage,
      showLoginModal, // Pass this to the pug file
    });
  } catch (error) {
    console.error("Product route error:", error.message);
    res.status(500).send("Unable to pick products from the data base");
  }
});

router.post("/dashboard", upload.single("itemImage"), async (req, res) => {
  try {
    const { productName, price, quantity, color, category } = req.body;

    // 1. Create the new product object
    const newProduct = new Product({
      productName,
      price,
      quantity,
      color,
      category,
      itemImage: req.file ? req.file.path : null,
    });

    // 2. Save the new product
    await newProduct.save();

    // 3. Re-fetch everything to keep the page consistent
    // (Keeping your original requirement)
    const dbProduct = await Product.find();

    // 4. --- KEEPING YOUR ORIGINAL STATS LOGIC EXACTLY AS IT WAS ---
    let stats = {
      instock: 0,
    };
    const instockAgg = await Product.aggregate([
      { $group: { _id: null, grandProducts: { $sum: "$quantity" } } },
    ]);
    stats.instock = instockAgg.length > 0 ? instockAgg[0].grandProducts : 0;

    // 5. REDIRECT to stop the resubmission error
    // We redirect to the dashboard with ?success=true so the GET route
    // knows to show the success message.
    return res.redirect("/dashboard?productsuccess=true");
  } catch (error) {
    console.error("Product add error", error.message);
    // Redirect on error as well to clear the form submission state
    return res.redirect("/dashboard?error=true");
  }
});

module.exports = router;
