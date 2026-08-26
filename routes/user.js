const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const usersController = require("../Controllers/users.js");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
// show signup page
// signup routes
router
  .route("/signup")
  .get(usersController.renderRegister)
  .post(usersController.createUser);

// login routes
router
  .route("/login")
  .get(usersController.renderLogin)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    usersController.loginUser,
  );

// logout
router.get("/logout", isLoggedIn, usersController.logout);

module.exports = router;
