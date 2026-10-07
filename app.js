const express = require("express");
const app = express();
const mongoose = require ("mongoose");
const Listing = require("./Models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MONGO_URL = process.env.MONGODB_URI ||
    (process.env.VERCEL ? null : "mongodb://127.0.0.1:27017/staybNb");
let databaseConnection;

async function connectToDatabase() {
    if (mongoose.connection.readyState === 1) return;
    if (!MONGO_URL) {
        throw new Error("MONGODB_URI is not configured for this deployment.");
    }
    if (!databaseConnection) {
        databaseConnection = mongoose.connect(MONGO_URL)
            .then(() => console.log("MongoDB is connected"))
            .catch((err) => {
                databaseConnection = null;
                throw err;
            });
    }
    await databaseConnection;
}
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.use("/listings", async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (err) {
        next(err);
    }
});

//Index Route
app.get("/listings", async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
}); 

//New Route
app.get("/listings/new", (req,res) => {
    res.render("listings/new.ejs");
});

//show route
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
});
 // create route
 app.post("/listings", async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
 });
 
 //Edit route
 app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
 });

//Update route
app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect("/listings");
});

//Delete route
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing)
    res.redirect("/listings");
});

app.use((err, req, res, next) => {
    console.error("Request failed:", err.message);
    res.status(503).send(`
        <!doctype html>
        <html lang="en">
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>StaybNb unavailable</title></head>
        <body style="font-family:system-ui,sans-serif;max-width:680px;margin:4rem auto;padding:0 1rem;color:#222">
            <h1>Listings are temporarily unavailable</h1>
            <p>StaybNb could not connect to its database. Set <code>MONGODB_URI</code> in the Vercel project settings to a hosted MongoDB connection string, and make sure your database allows connections from Vercel.</p>
            <p><a href="/">Return to StaybNb home</a></p>
        </body>
        </html>
    `);
});




//app.get("/testListing", async (req,res) => {
//    let sampleListing = new Listing({
//        title : "My New Villa",
//        description : "This is a beautiful villa",
//        price : 1200,
//        location : "Calangute ,Goa",
//        country : "India",
//    }); 
    
//    await sampleListing.save();
//    console.log("🔥 TEST LISTING ROUTE WAS HIT 🔥");
//    console.log("🔥 SAMPLE WAS SAVED 🔥");
//    res.send("Successful Testing");
//});

if (require.main === module) {
    const port = process.env.PORT || 8080;
    app.listen(port, () => {
        console.log(`server is listening to port ${port}`);
    });
}

module.exports = app;
