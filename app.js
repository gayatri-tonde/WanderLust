const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
const Listing = require("./models/listing.js");
const path = require("path");
const method_override = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressError.js");
const { listingSchema } = require("./schema.js");
const Reviews = require("./models/reviews.js");

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.use(method_override("_method"));

main()
  .then((res) => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, error);
  } else {
    next();
  }
};

// NEW ROUTE
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// CREATE ROUTE
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  }),
);

// SHOW ALL LISTING ROUTE
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
  }),
);

// EDIT ROUTE
app.get(
  "/listings/:id/edit",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  }),
);

//SHOW ROUTE
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
  }),
);

//REVIEWS ROUTE
app.post(
  "/listings/:id/reviews",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    let newReview = new Reviews(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.render("listings/show.ejs", { listing });
  }),
);

//UPDATE ROUTE
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, {
      ...req.body.listing,
    });
    res.render("listings/show.ejs", { listing });
  }),
);

// DELETE ROUTE
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  }),
);

app.get("/", () => {
  console.log("server working");
});

// IF NOT ANY ROUTE MATCHES THEN
app.all("/*splat", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong!" } = err;
  res.status(status).render("error.ejs", { status, message });
});

app.listen(port, () => {
  console.log("listening on port 8080");
});
