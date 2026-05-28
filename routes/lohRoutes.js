const express = require("express");
const router = express.Router();
const passport = require("passport");
const Registration = require("../models/Registration");

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", async (req, res) => {
  try {
    let { fullname, email, phone, password, confirmpassword } = req.body;
    email = email.toLowerCase().trim();
    if (!fullname || !email || !phone || !password || !confirmpassword) {
      return res.status(400).send("All fields are required");
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send("Invalid email format");
    }
    const phoneRegex = /^\+2567\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).send("Invalid phone number");
    }
    // Change from strict equality (=== 11) to a range check
    if (password.length < 8 || password.length > 11) {
      return res
        .status(400)
        .send("Password must be between 8 and 11 characters");
    }

    // 5. Confirm password match
    if (password !== confirmpassword) {
      return res.status(400).send("Passwords do not match");
    }
    let existingUser = await Registration.findOne({ email: email });
    if (existingUser) {
      return res.render("signup", {
        error: "A user with this email already exists.",
      });
    }
    const newuser = new Registration({
      fullname,
      email,
      phone, // Model regex handles the 07... or +256... check
    });
    // 5. Register with Passport
    // We use the promise-based version (await) instead of a callback for cleaner code
    await Registration.register(newuser, password);
    req.flash("success_msg", "Account created successfully! - Login");
    res.redirect("signup");
  } catch (error) {
    console.error("Registration error", error);
    res.status(400).send("Registration failed", +error.message);
  }
});
router.get("/login", (req, res) => {
  res.render("login");
});
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    // This tells Passport where to go on success
    // We add ?success=true so the dashboard knows to show your modal
    successRedirect: "/dashboard?success=true",

    // This tells Passport where to go if they type the wrong password
    failureRedirect: "/login",

    // This allows you to show an error message (like "Invalid login")
    failureFlash: true,
  })(req, res, next);
});

module.exports = router;
