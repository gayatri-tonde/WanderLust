const express = require("express");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const router = express.Router();

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// NEW ROUTE
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

// CREATE ROUTE
router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  }),
);

// SHOW ALL LISTING ROUTE
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
  }),
);

// EDIT ROUTE
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing does not exist!!");
      res.redirect("/listings");
    } else {
      res.render("listings/edit.ejs", { listing });
    }
  }),
);

//SHOW ROUTE
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
      req.flash("error", "Listing does not exist!!");
      res.redirect("/listings");
    } else {
      res.render("listings/show.ejs", { listing });
    }
  }),
);

//UPDATE ROUTE
router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, {
      ...req.body.listing,
    });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  }),
);

// DELETE ROUTE
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  }),
);

module.exports = router;
