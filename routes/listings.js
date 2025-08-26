const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const {isLoggedIn,isOwner}=require("../middleware.js");

// Middleware for validating listings
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

// Index route
router.get("/", wrapAsync(async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
}));

// New form 
router.get("/new",isLoggedIn, (req, res) => {
 
  res.render("listings/new.ejs", { listing: { image: { url: "" } } });
});

// Create new listing
router.post("/",isLoggedIn ,validateListing, wrapAsync(async (req, res) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner=req.user._id;
  await newListing.save();
  req.flash("success","New Listing created"); 
  res.redirect(`/listings/${newListing._id}`);
}));

// Show listing
router.get("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
  .populate({
    path:"reviews",
    populate:{
      path:"author",
    },
  })
  .populate("owner");
  if (!listing) 
   {   req.flash("error","Listing does not exist");
    res.redirect("/listings");
   }
      res.render("listings/show.ejs", { listing });
    }));

// Edit form
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError(404, "Listing not found");
  res.render("listings/edit.ejs", { listing });
}));

// Update listing
router.put("/:id", isLoggedIn,validateListing,isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const { listing } = req.body;
  const updatedListing = await Listing.findByIdAndUpdate(id, { $set: listing }, { new: true });
  if (!updatedListing) throw new ExpressError(404, "Listing not found");
  res.redirect(`/listings/${updatedListing._id}`);
}));

// Delete listing
router.delete("/:id",isLoggedIn,isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));

module.exports = router;
