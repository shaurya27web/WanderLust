const express = require("express");
const router = express.Router({ mergeParams: true }); 
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
// const Listing = require("../models/listing.js");
// const Review = require("../models/review.js");
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

const reviewController=require("../controller/review.js");

// Create review
router.post("/", isLoggedIn,validateReview, wrapAsync(reviewController.postReview));

// Delete review
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.deleteReview));

module.exports = router;
