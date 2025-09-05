const Listing=require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_BOX;
const geocodingClient = mbxGeocoding({ accessToken:mapToken });


module.exports.index=async(req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
};

module.exports.renderNew=(req, res) => {
  res.render("listings/new.ejs", { listing: { image: { url: "" } } });
};

module.exports.showListing=async (req, res) => {
  const { id } = req.params;
  let listing = await Listing.findById(id)
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
    };


module.exports.createListing=async (req, res) => {

  let response = await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 2
})
  .send()
console.log(response);
  let url=req.file.path;
  let filename=req.file.filename;

  console.log(url,"...",filename);
  const newListing = new Listing(req.body.listing);
  newListing.owner=req.user._id;
  newListing.image={ url,filename};
  newListing.geometry=response.body.features[0].geometry;
let savedListing=  await newListing.save();
console.log(savedListing);
  req.flash("success","New Listing created"); 
  // res.redirect(`/listings/${newListing._id}`);
  res.redirect("/listings");
};

module.exports.editForm=async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) throw new ExpressError(404, "Listing not found");

  let originalImageUrl=listing.image.url;
  originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
  res.render("listings/edit.ejs", { listing,originalImageUrl });
};

module.exports.updateForm=async (req, res) => {
  let { id } = req.params;
  // const { listing } = req.body;
 let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  
  if (typeof req.file !== "undefined"){
let url=req.file.path;
  let filename=req.file.filename;
  listing.image={url,filename};
  await listing.save();
  }
  req.flash("success","Listing Updated!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteForm=async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
};