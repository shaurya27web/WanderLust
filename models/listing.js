const mongoose=require("mongoose");
const schema=mongoose.Schema;

const imageSchema = new mongoose.Schema({
  filename: String,
  url: String,
});


const listingSchema=new mongoose.Schema({
    title:{
       type: String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
     price:{
        type:String,
        required:true
     },
    location:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
   
    // image:imageSchema,
});
const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;