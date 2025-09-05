if(process.env.NODE_ENV !="production"){
require("dotenv").config();
}
// console.log(process.env);

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride = require('method-override');
const ejsMate=require("ejs-mate");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const cookieParser = require("cookie-parser");

app.use(cookieParser("MySecret")); 

const listingRouter=require("./routes/listings.js");
const reviewRouter=require("./routes/reviews.js");
const userRouter=require("./routes/user.js");

const MONGO_URL=process.env.MONGO_URI;


const store=MongoStore.create({
mongoUrl:MONGO_URL,
crypto:{
    secret:"My Secret"
},
touchAfter:24*3600
});


const sessionOptions={
    store,
    secret:"MySecret",
    resave:false,
    saveUninitialized:false,
    cookie: {
        expires: Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
    }
}

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));//for parsing the data
//for using the static file
app.use(express.static(path.join(__dirname,"/public")));
app.use(methodOverride('_method'));


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.add=req.flash("add");
  res.locals.delete=req.flash("delete");
  res.locals.currUser=req.user;
    next();
});
 

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


//Mongo DB connectivity

async function main(){
    await mongoose.connect(MONGO_URL);
}

main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{
    console.log(err)
});


//creation of Route
const PORT = process.env.PORT || 8080
app.listen(PORT,()=>{
    console.log(`server is listening to ${PORT}`);
});


