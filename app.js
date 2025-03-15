const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listings.js")
const path = require("path")
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const WrapAsync = require("./utils/wrapasnyc.js")
const ExpressError = require("./utils/ExpressError.js")

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method')) 
app.use(express.static(path.join(__dirname,"public/css")))

app.engine('ejs',ejsMate)


main()
.then((res)=>console.log("mongodb connected!"))
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/airnbprac');
}
//index route
app.get("/listings",WrapAsync(async(req,res)=>{
     const AllListings = await Listing.find()
     res.render("listings/index.ejs",{AllListings})
}))
//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs")
})
//post route
app.post("/listings",WrapAsync(async(req,res,next)=>{

  const newlisting = new Listing(req.body.listing)
  await newlisting.save()
  res.redirect("/listings")
}))

//show route
app.get("/listings/:id",WrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing =await Listing.findById(id)
    res.render("listings/show.ejs",{listing})
}))

//edit route
app.get("/listings/:id/edit",WrapAsync(async(req,res)=>{
  let {id} = req.params
  const listing = await Listing.findById(id)
  res.render("listings/edit.ejs",{listing})
}))
//patch route
app.put("/listings/:id",WrapAsync(async(req,res)=>{
  let {id} = req.params
  await Listing.findByIdAndUpdate(id,{...req.body.listing})
  res.redirect("/listings")
}))
//delete route
app.delete("/listings/:id",WrapAsync(async(req,res)=>{
  let {id} = req.params
  await Listing.findByIdAndDelete(id)
  res.redirect("/listings")
}))
//home route
app.get("/",(req,res)=>{
    res.send("working!")
})
app.all("*",(req,res,next)=>{
  next(new ExpressError(401,"page not found!"))
})

//error handling
app.use((err,req,res,next)=>{
  let {status=505,message="page not found"} = err
  res.status(status).render("error.ejs",{message})
})
//server
app.listen(8080,()=>{
    console.log("server running!")
})