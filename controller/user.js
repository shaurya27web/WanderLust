const User=require("../models/user");


module.exports.sign=(req,res)=>{
    res.render("user/signup.ejs");
};

module.exports.postSign=async(req,res)=>{
   try{
     let {username,password,email}=req.body;
    const newUser=User({username,email});
    const registeredUser= await User.register(newUser,password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            next(err);
        };
 req.flash("success","Logged in successfully");
    res.redirect("/listings");
    })
   }
   catch(e){
    req.flash("success",e.message);
    res.redirect("/signup");
   }
};

module.exports.login=(req,res)=>{
    res.render("user/login.ejs");
};

module.exports.postLogin=async(req,res)=>{
     req.flash("success","Welcome to Wanderlust!You are logged in");
    //  console.log("DEBUG req.user:", req.user);

     let redirectUrl=res.locals.redirectUrl || "/listings";
     res.redirect(redirectUrl);
};

module.exports.logOut=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","You are logged out!");
        res.redirect("/listings");
    });
};