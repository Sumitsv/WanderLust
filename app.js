if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ quiet: true });
}

// require("dotenv").config();

// DNS resolver fix
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("./utils/flash.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
// const { error } = require("console");

const MONGO_URL =
  process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

// FIX: Never use a predictable fallback secret; session security must depend on an environment value.
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set in the environment.");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("error in mongo session", err);
});

const sessionOption = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  // FIX: Do not create database sessions for visitors who have not used a session yet.
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  // FIX: expose the active site URL so canonical links work without hard-coded deployment domains.
  res.locals.siteUrl = (
    process.env.SITE_URL || `${req.protocol}://${req.get("host")}`
  ).replace(/\/$/, "");
  next();
});

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found! "));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went Wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});

async function startServer() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("connected to DB");

    if (require.main === module) {
      app.listen(process.env.PORT || 8080, () => {
        console.log(`server is listening on port ${process.env.PORT || 8080}`);
      });
    }
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
}

startServer();

module.exports = app;
