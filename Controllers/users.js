const User = require("../models/user.js");

module.exports.renderRegister = (req, res) => {
  res.render("users/signup");
};

module.exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("/signup");
      }
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (err) {
    // FIX: show a clear message when the unique email constraint is violated.
    req.flash(
      "error",
      err.code === 11000 ? "An account with this email already exists." : err.message,
    );
    res.redirect("/signup");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.loginUser = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = res.locals.redirectUrl || "/listings";
  delete req.session.redirectUrl;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/listings");
  });
};
