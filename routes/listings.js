const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js"); 
const {isLoggedIn,isOwner}=require("../middleware.js");
const multer = require('multer');
const {storage}=require("../cloudConfig.js");
const upload = multer({storage});


const listingController=require("../controller/listings.js");

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

// New form 
router.get("/new",isLoggedIn,validateListing,listingController.renderNew);

router.route("/").
get( wrapAsync(listingController.index)).
post(isLoggedIn,
  upload.single('listing[image]'),
  wrapAsync(listingController.createListing));

router.route("/:id")
.get( wrapAsync(listingController.showListing))
.put( isLoggedIn,
isOwner,
upload.single("listing[image]")
, wrapAsync(listingController.updateForm))
.delete(isLoggedIn,isOwner, wrapAsync(listingController.deleteForm));



// Edit form
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.editForm));

module.exports = router;
