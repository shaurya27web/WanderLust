const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
// const ExpressError = require("./utils/ExpressError.js");
// const { reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req,res,next) => {
  if(!req.isAuthenticated()){
    req.session.redirectUrl = req.originalUrl;
    req.flash("success","You must be logged in!");
    return res.redirect("/login");
  }
  next();
}

module.exports.saveRedirectUrl = (req,res,next) => {
  if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
}

module.exports.isOwner = async (req,res,next) => {
  let {id} = req.params;
  let listing = await Listing.findById(id);
  if(!listing.owner.equals(req.user._id)){
    req.flash("success","You don't have the permission to edit/delete");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req,res,next) => {
  let {id,reviewId} = req.params;
  let review = await Review.findById(reviewId);
  if(!review.author.equals(res.locals.currUser._id)){
    req.flash("success","You don't have the permission to delete the review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
