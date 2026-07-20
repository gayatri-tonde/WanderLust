const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const router = express.Router({ mergeParams: true });
const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, error);
  } else {
    next();
  }
};

//REVIEWS ROUTE
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log(listing);
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${id}`);
  }),
);

//DELETE REVIEW ROUTE
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
  }),
);

module.exports = router;
