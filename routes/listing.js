const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingsController = require("../Controllers/listings.js");

// ===================== LISTINGS COLLECTION =====================
router
  .route("/")
  .get(wrapAsync(listingsController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingsController.createListing),
  );

// ===================== SHOW NEW LISTING FORM =====================
router.get("/new", isLoggedIn, listingsController.renderNewForm);

// ===================== INDIVIDUAL LISTING =====================
router
  .route("/:id")
  .get(wrapAsync(listingsController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingsController.updateListing),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingsController.deleteListing));

// ===================== SHOW EDIT FORM =====================
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingsController.renderEditForm),
);

module.exports = router;
