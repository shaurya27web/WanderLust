const Review=require("../models/review");
const Listing=require("../models/listing");

module.exports.postReview=async (req, res) => {
 
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
};

module.exports.deleteReview=async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
   req.flash("delete","Review Deleted Succesfully");
  res.redirect(`/listings/${id}`);
 
};