const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const listings = require("./init/data.js").data.map((listing, index) => ({
    ...listing,
    _id: String(index + 1),
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

let nextListingId = listings.length + 1;

function getListing(id) {
    return listings.find((item) => item._id === id);
}

function listingFromForm(body) {
    return {
        title: body.title.trim(),
        description: body.description.trim(),
        image: { filename: "listingimage", url: body.image.trim() },
        price: Number(body.price),
        location: body.location.trim(),
        country: body.country.trim(),
    };
}

app.get("/", (req, res) => {
    res.render("home.ejs");
});

//Index Route
app.get("/listings", (req, res) => {
    res.render("listings/index.ejs", { allListing: listings });
}); 

app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

app.post("/listings", (req, res) => {
    const listing = listingFromForm(req.body);
    listing._id = String(nextListingId++);
    listings.push(listing);
    res.redirect(`/listings/${listing._id}`);
});

//show route
app.get("/listings/:id", (req, res) => {
    const listing = getListing(req.params.id);
    if (!listing) return res.status(404).send("Listing not found");
    res.render("listings/show.ejs", { listing });
});

app.get("/listings/:id/edit", (req, res) => {
    const listing = getListing(req.params.id);
    if (!listing) return res.status(404).send("Listing not found");
    res.render("listings/edit.ejs", { listing });
});

app.post("/listings/:id", (req, res) => {
    const listing = getListing(req.params.id);
    if (!listing) return res.status(404).send("Listing not found");
    Object.assign(listing, listingFromForm(req.body));
    res.redirect(`/listings/${listing._id}`);
});

app.post("/listings/:id/delete", (req, res) => {
    const index = listings.findIndex((item) => item._id === req.params.id);
    if (index === -1) return res.status(404).send("Listing not found");
    listings.splice(index, 1);
    res.redirect("/listings");
});

if (require.main === module) {
    const port = process.env.PORT || 8080;
    app.listen(port, () => {
        console.log(`server is listening to port ${port}`);
    });
}

module.exports = app;
