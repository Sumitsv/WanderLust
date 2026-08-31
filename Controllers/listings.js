const Listing = require("../models/listing.js");
const cloudinary = require("../cloudConfig.js");
const ExpressError = require("../utils/ExpressError.js");

const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

function uploadImage(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "wanderlust_DEV" },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(file.buffer);
  });
}

function isValidImageBuffer(file) {
  if (!file || !file.buffer || file.buffer.length < 12) return false;
  const header = file.buffer.subarray(0, 12);
  const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  const isPng = header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isGif = header.subarray(0, 6).toString("ascii") === "GIF87a" || header.subarray(0, 6).toString("ascii") === "GIF89a";
  const isWebp = header.subarray(0, 4).toString("ascii") === "RIFF" && header.subarray(8, 12).toString("ascii") === "WEBP";
  return isJpeg || isPng || isGif || isWebp;
}

function isCloudinaryImage(image) {
  return Boolean(image?.filename && image?.url?.includes("res.cloudinary.com"));
}

function getSiteUrl(req) {
  // FIX: build canonical and structured-data URLs from configured deployment URL, not an old hard-coded domain.
  return (process.env.SITE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
}

module.exports.index = async (req, res) => {
  const searchQuery = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const dbQuery = searchQuery
    ? {
        $or: [
          { title: { $regex: searchQuery, $options: "i" } },
          { location: { $regex: searchQuery, $options: "i" } },
          { country: { $regex: searchQuery, $options: "i" } },
          { description: { $regex: searchQuery, $options: "i" } },
        ],
      }
    : {};

  const allListings = await Listing.find(dbQuery);
  const siteUrl = getSiteUrl(req);

  const itemListJsonLd = `<script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Vacation Rentals on Wanderlust",
        "description": "Browse unique vacation homes, beach houses, mountain retreats and more.",
        "numberOfItems": ${allListings.length},
        "itemListElement": ${JSON.stringify(
          allListings.slice(0, 10).map((l, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: l.title,
            url: `${siteUrl}/listings/${l._id}`,
          })),
        )}
    }
    </script>`;

  res.render("listings/index", {
    allListings,
    searchQuery,
    pageTitle: `Vacation Rentals & Holiday Homes | PrestigeStay — ${allListings.length} Stays`,
    pageDescription: `Browse ${allListings.length} unique vacation rentals on PrestigeStay. Beach houses, mountain retreats, castles, farm stays and more. Best prices guaranteed.`,
    // FIX: use one consistent brand and valid Unicode text in page metadata.
    pageTitle: `Vacation Rentals & Holiday Homes | Wanderlust — ${allListings.length} Stays`,
    pageDescription: `Browse ${allListings.length} unique vacation rentals on Wanderlust. Beach houses, mountain retreats, castles, farm stays and more.`,
    canonicalPath: "/listings",
    jsonLd: itemListJsonLd,
  });
};
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const data = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!data) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  // FIX: skip orphaned reviews so a deleted user cannot crash the listing page.
  data.reviews = data.reviews.filter((review) => review.author);

  // FIX: structured-data links use the current deployment URL rather than an old hard-coded domain.
  const siteUrl = getSiteUrl(req);

  // ✅ SEO: LodgingBusiness structured data for each listing
  const avgRating = data.reviews.length
    ? (
        data.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        data.reviews.length
      ).toFixed(1)
    : null;

  const listingJsonLd = `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      "name": ${JSON.stringify(data.title)},
      "description": ${JSON.stringify(data.description)},
      "image": ${JSON.stringify(data.image.url)},
      "url": "${siteUrl}/listings/${data._id}",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": ${JSON.stringify(data.location)},
        "addressCountry": ${JSON.stringify(data.country)}
      },
      "priceRange": "₹${data.price ? data.price.toLocaleString("en-IN") : "0"} per night"
      ${
        avgRating
          ? `,"aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "${avgRating}",
        "reviewCount": "${data.reviews.length}",
        "bestRating": "5",
        "worstRating": "1"
      }`
          : ""
      }
    }
    <\/script>`;

  // FIX: normalize legacy mojibake in structured-data currency text before it reaches search engines.
  const cleanListingJsonLd = listingJsonLd.replace(
    String.fromCharCode(0xe2, 0x201a, 0xb9),
    "₹",
  );

  res.render("listings/show", {
    listing: data,
    pageTitle: `${data.title} in ${data.location}, ${data.country} | PrestigeStay`,
    pageDescription: `Book ${data.title} in ${data.location}, ${data.country}. ₹${data.price ? data.price.toLocaleString("en-IN") : "0"} per night. ${data.description.substring(0, 120)}...`,
    // FIX: use one consistent brand and valid Unicode text in page metadata.
    pageTitle: `${data.title} in ${data.location}, ${data.country} | Wanderlust`,
    pageDescription: `Book ${data.title} in ${data.location}, ${data.country}. ₹${data.price ? data.price.toLocaleString("en-IN") : "0"} per night. ${data.description.substring(0, 120)}...`,
    canonicalPath: `/listings/${data._id}`,
    ogImage: data.image.url,
    ogType: "product",
    jsonLd: cleanListingJsonLd,
  });
};
// res.render("listings/show", {
//     listing: data,
//     pageTitle: `${data.title} in ${data.location}, ${data.country} | PrestigeStay`,
//     pageDescription: `Book ${data.title} in ${data.location}, ${data.country}. ₹${data.price ? data.price.toLocaleString("en-IN") : "0"} per night. ${data.description.substring(0, 120)}...`,
//     canonicalPath: `/listings/${data._id}`,
//     ogImage: data.image.url,
//     ogType: "product",
//     jsonLd: listingJsonLd,
// });

module.exports.createListing = async (req, res) => {
  // FIX: verify file signatures as well as MIME type to reduce spoofed image uploads.
  if (req.file && !isValidImageBuffer(req.file)) {
    throw new ExpressError(400, "The uploaded file is not a valid image.");
  }
  const uploadedImage = req.file
    ? await uploadImage(req.file)
    : { filename: "default-image", url: DEFAULT_IMAGE_URL };

  const listing = new Listing({
    ...req.body.listing,
    image: {
      filename: uploadedImage.public_id || uploadedImage.filename,
      url: uploadedImage.secure_url || uploadedImage.url,
    },
    owner: req.user._id,
  });

  await listing.save();
  req.flash("success", "New listing added successfully");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const post = await Listing.findById(id);
  if (!post) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }
  let originalImage = post.image.url;
  originalImage = originalImage.replace(
    "/uploads",
    "/uploads/w_350,h_100,c_limit",
  );
  res.render("listings/edit", { listing: post, originalImage });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const existingListing = await Listing.findById(id);

  if (!existingListing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  // FIX: verify file signatures as well as MIME type to reduce spoofed image uploads.
  if (req.file && !isValidImageBuffer(req.file)) {
    throw new ExpressError(400, "The uploaded file is not a valid image.");
  }
  const uploadedImage = req.file ? await uploadImage(req.file) : null;
  const image = uploadedImage
    ? { filename: uploadedImage.public_id, url: uploadedImage.secure_url }
    : existingListing.image;

  await Listing.findByIdAndUpdate(id, {
    ...req.body.listing,
    image,
  });
  // FIX: remove the replaced Cloudinary asset after the database points to the new one.
  if (uploadedImage && isCloudinaryImage(existingListing.image)) {
    await cloudinary.uploader.destroy(existingListing.image.filename);
  }
  req.flash("success", "Listing updated successfully");
  res.redirect("/listings");
};

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }
  await Listing.findByIdAndDelete(id);
  // FIX: remove the Cloudinary asset when its listing is deleted.
  if (isCloudinaryImage(listing.image)) {
    await cloudinary.uploader.destroy(listing.image.filename);
  }
  req.flash("success", "Listing deleted successfully");
  res.redirect("/listings");
};
