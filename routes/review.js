// const express = require("express");
// const router = express.Router({ mergeParams: true });
// const Review = require("../models/review.js");
// const wrapAsync = require("../utils/wrapAsync.js");
// const ExpressError = require("../utils/ExpressError.js");
// const Listing = require("../models/listing.js");

// const {
//   validateReview,
//   isLoggedIn,
//   isReviewAuthor,
// } = require("../middleware.js");
// const { createReview, deleteReview } = require("../Controllers/reviews.js");

// // const reviewController = "../Controllers/reviews.js";

// //reviews
// //post route

// router.post(
//   "/",
//   isLoggedIn,
//   validateReview,
//   wrapAsync(reviewController.createReview),
// );

// // delete review route

// // Delete Review Route
// router.delete(
//   "/:reviewId",
//   isLoggedIn,
//   isReviewAuthor,
//   wrapAsync(reviewController.deleteReview),
// );

// module.exports = router;

const express = require("express");

const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");

const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware.js");

const { createReview, deleteReview } = require("../Controllers/reviews.js");

// POST Review
router.post("/", isLoggedIn, validateReview, wrapAsync(createReview));

// DELETE Review
router.delete(
  "/:reviewId",
  isLoggedIn,
  wrapAsync(isReviewAuthor),
  wrapAsync(deleteReview),
);

module.exports = router;
