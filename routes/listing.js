const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require("multer");
const ExpressError = require("../utils/ExpressError.js");
const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    // FIX: reject unsupported uploads with a user-visible error instead of silently ignoring them.
    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      return callback(new ExpressError(400, "Only JPG, PNG, WEBP, and GIF images are allowed."));
    }
    callback(null, true);
  },
});

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
    wrapAsync(isOwner),
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingsController.updateListing),
  )
  .delete(
    isLoggedIn,
    wrapAsync(isOwner),
    wrapAsync(listingsController.deleteListing),
  );

// ===================== SHOW EDIT FORM =====================
router.get(
  "/:id/edit",
  isLoggedIn,
  wrapAsync(isOwner),
  wrapAsync(listingsController.renderEditForm),
);

module.exports = router;
