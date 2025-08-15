const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride = require('method-override');
const ejsMate=require("ejs-mate");

const Listing=require("./models/listing.js");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");

app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));//for parsing the data
//for using the static file
app.use(express.static(path.join(__dirname,"/public")));
app.use(methodOverride('_method'));


//Mongo DB connectivity
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust"
async function main(){
    await mongoose.connect(MONGO_URL);
}

main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{
    console.log(err)
});


//API creation
app.get("/",(req,res)=>{
    res.send("Hi I am root");
});

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};


//listing request(Index Route)
app.get("/listings",wrapAsync(async(req,res)=>{
    const allListing=await Listing.find({});
    res.render("./listings/index.ejs",{allListing});
}));


//New Route for list creation
app.get("/listings/new",wrapAsync(async(req,res)=>{
    res.render("listings/new.ejs", { listing: { image: { url: "" } } });
}));


//Post Route for adding new list
app.post("/listings",validateListing
    ,wrapAsync(async(req,res,next)=>{
 const newListing=new Listing(req.body.listing);
    console.log(newListing);
    await newListing.save();
    res.redirect("/listings");

}))
;

//Edit Route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
 let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//Update Route
app.put("/listings/:id",validateListing,
    wrapAsync(async(req, res) => {
  const { id } = req.params;
  const { listing } = req.body;

  await Listing.findByIdAndUpdate(id, {
    $set: {
      title: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
      country: listing.country,
      "image.url": listing.image.url,
    }
  });

  res.redirect("/listings");
}));


//Deletion of listing
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const deletedListing=await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

//Show Route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}));

// //all errors
// app.all("*",(req,res,next) => {
//     next(new ExpressError(404,"Page not found"));
// });


//Error handelling middleware
app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went Wrong!"}=err;
    res.status(statusCode).render("listings/error.ejs",{message});

});


//creation of Route
app.listen(8080,()=>{
    console.log("Server is listening to port 8080");
});

