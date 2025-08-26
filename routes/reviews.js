const express = require("express");
const router = express.Router({ mergeParams: true }); 
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { reviewSchema } = require("../schema.js");
const {isLoggedIn, isReviewAuthor } = require("../middleware.js");

// Middleware for validating reviews
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};


// Create review
router.post("/", isLoggedIn,validateReview, wrapAsync(async (req, res) => {
 
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ExpressError(404, "Listing not found");
  let newReview = new Review(req.body.review);
  newReview.author=req.user._id;
  await newReview.save();
  listing.reviews.push(newReview);
console.log(newReview);
  await newReview.save();
  await listing.save();

  req.flash("success","Review Added Succesfully");
  res.redirect(`/listings/${listing._id}`);
}));

// Delete review
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,
   wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
   req.flash("delete","Review Deleted Succesfully");
  res.redirect(`/listings/${id}`);
 
}));

module.exports = router;
