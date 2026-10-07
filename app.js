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

app.get("/", (req, res) => {
    res.render("home.ejs");
});

//Index Route
app.get("/listings", (req, res) => {
    res.render("listings/index.ejs", { allListing: listings });
}); 

//show route
app.get("/listings/:id", (req, res) => {
    const listing = listings.find((item) => item._id === req.params.id);
    if (!listing) return res.status(404).send("Listing not found");
    res.render("listings/show.ejs", { listing });
});

if (require.main === module) {
    const port = process.env.PORT || 8080;
    app.listen(port, () => {
        console.log(`server is listening to port ${port}`);
    });
}

module.exports = app;
