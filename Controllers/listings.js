const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});

  const itemListJsonLd = `<script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Vacation Rentals on PrestigeStay",
        "description": "Browse unique vacation homes, beach houses, mountain retreats and more.",
        "numberOfItems": ${allListings.length},
        "itemListElement": ${JSON.stringify(
          allListings.slice(0, 10).map((l, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: l.title,
            url: `https://prestigestay.onrender.com/listings/${l._id}`,
          })),
        )}
    }
    </script>`;

  res.render("listings/index", {
    allListings,
    pageTitle: `Vacation Rentals & Holiday Homes | PrestigeStay — ${allListings.length} Stays`,
    pageDescription: `Browse ${allListings.length} unique vacation rentals on PrestigeStay. Beach houses, mountain retreats, castles, farm stays and more. Best prices guaranteed.`,
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
      "url": "https://prestigestay.onrender.com/listings/${data._id}",
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

  res.render("listings/show", {
    data,
    pageTitle: `${data.title} in ${data.location}, ${data.country} | PrestigeStay`,
    pageDescription: `Book ${data.title} in ${data.location}, ${data.country}. ₹${data.price ? data.price.toLocaleString("en-IN") : "0"} per night. ${data.description.substring(0, 120)}...`,
    canonicalPath: `/listings/${data._id}`,
    ogImage: data.image.url,
    ogType: "product",
    jsonLd: listingJsonLd,
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
  console.log(req.file);
  const { title, description, price, country, location, image } = req.body;

  const uploadedImage = req.file
    ? {
        filename: req.file.filename,
        url: req.file.path || req.file.secure_url || req.file.url || "",
      }
    : image
      ? {
          filename: image.filename || "default-image",
          url: image.path || image.url || image,
        }
      : {
          filename: "default-image",
          url: "",
        };

  const sample = new Listing({
    title,
    description,
    image: uploadedImage,
    price,
    location,
    country,
    owner: req.user._id,
  });

  await sample.save();
  req.flash("success", "New post added successfully");
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
  res.render("listings/edit", { post, originalImage });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, country, location, image } = req.body;
  const existingListing = await Listing.findById(id);

  if (!existingListing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  const imageData = req.file
    ? {
        filename: req.file.filename,
        url: req.file.path || req.file.secure_url || req.file.url,
      }
    : image
      ? {
          filename: existingListing.image?.filename || "default-image",
          url: image,
        }
      : existingListing.image;

  await Listing.findByIdAndUpdate(id, {
    title,
    description,
    image: imageData,
    price,
    country,
    location,
  });
  req.flash("success", "Post updated successfully");
  res.redirect("/listings");
};

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("Delet", "Post Deleted sucessfully");
  res.redirect("/listings");
};
