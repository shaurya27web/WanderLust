const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
const ejsMate=require("ejs-mate");

app.use(express.urlencoded({extended:true}));//for parsing the data
app.engine("ejs",ejsMate);
//for using the static file
app.use(express.static(path.join(__dirname,"/public")));



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
//sample data
// app.get("/testsampling",async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"My Villa",
//         description:"By the Beach",
//         price: 1200,
//         location:"Goa",
//         country:"India",
//         contact:"89324455",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("Succesfull testing");
// })

//listing request(Index Route)
app.get("/listings",async(req,res)=>{
    const allListing=await Listing.find({});
    res.render("./listings/index.ejs",{allListing});
});


//New Route for list creation
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs")
});

//Post Route for adding new list
app.post("/listings",async(req,res)=>{
    const newListing=new Listing(req.body.listing);
    console.log(newListing);
    await newListing.save();
    res.redirect("/listings");

});

//Edit Route
app.get("/listings/:id/edit",async (req,res)=>{
 let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});

//Update Route
app.put("/listings/:id",async(req,res)=>{
     let {id}=req.params;
    const listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings");
})

//Deletion of listing
app.delete("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    const deletedListing=await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});

//Show Route
app.get("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
})

//creation of Route
app.listen(8080,()=>{
    console.log("Server is listening to port 8080");
});

//EJS templating
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
