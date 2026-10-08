const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const ejsMate = require("ejs-mate");
const listingsFile = path.join(__dirname, "init", "listings.json");
const seedListings = require("./init/data.js").data.map((listing, index) => ({
    ...listing,
    _id: String(index + 1),
}));
let listings = seedListings;
try {
    if (fs.existsSync(listingsFile)) {
        const savedListings = JSON.parse(fs.readFileSync(listingsFile, "utf8"));
        if (Array.isArray(savedListings)) listings = savedListings;
    }
} catch (error) {
    console.error("Could not load saved listings:", error.message);
}

function saveListings() {
    fs.writeFileSync(listingsFile, JSON.stringify(listings, null, 2));
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

let nextListingId = listings.reduce((highest, listing) => Math.max(highest, Number(listing._id) || 0), 0) + 1;

const defaultImages = {
    beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=80",
    mountain: "https://images.unsplash.com/photo-1464822759023-fed622ff3b7e?w=1000&q=80",
    city: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1000&q=80",
    cabin: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1000&q=80",
    countryside: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&q=80",
    other: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1000&q=80",
};

const categories = Object.keys(defaultImages);

function inferCategory(listing) {
    const text = `${listing.title || ""} ${listing.description || ""}`.toLowerCase();
    if (/beach|coast|island|ocean|sea|bali|cancun|malibu/.test(text)) return "beach";
    if (/mountain|ski|alps|banff|aspen/.test(text)) return "mountain";
    if (/city|urban|loft|penthouse|apartment|brownstone|miami|boston/.test(text)) return "city";
    if (/cabin|cottage|treehouse|chalet|lodge/.test(text)) return "cabin";
    if (/villa|countryside|tuscany|cotswolds|farm|rural/.test(text)) return "countryside";
    return "other";
}

function getListing(id) {
    return listings.find((item) => item._id === id);
}

function listingFromForm(body) {
    const title = (body.title || "").trim();
    const description = (body.description || "").trim();
    const location = (body.location || "").trim();
    const country = (body.country || "").trim();
    const category = categories.includes(body.category) ? body.category : inferCategory({ title, description });
    const imageUrl = (body.image || "").trim();
    const price = Number(body.price);
    const errors = [];

    if (!title) errors.push("Add a listing title.");
    if (!description) errors.push("Add a description.");
    if (!location) errors.push("Add a place or city.");
    if (!country) errors.push("Add a country.");
    if (body.price === undefined || body.price === "" || !Number.isFinite(price) || price < 0) errors.push("Enter a valid price.");
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) errors.push("Photo URL must start with http:// or https://.");

    if (errors.length) return { errors };
    return {
        listing: {
            title,
            description,
            category,
            image: { filename: "listingimage", url: imageUrl || defaultImages[category] },
            price,
            location,
            country,
        },
    };
}

function renderFormError(res, view, listing, errors, status = 400) {
    return res.status(status).render(view, { listing, errors, categories });
}

app.get("/", (req, res) => {
    res.render("home.ejs");
});

// Give the create page its own route so it cannot be mistaken for a listing ID.
app.get("/new-listing", (req, res) => {
    res.render("listings/new.ejs", { categories, errors: [], listing: {} });
});

// Keep the old URL working for bookmarks.
app.get("/listings/new", (req, res) => res.redirect("/new-listing"));

//Index Route
app.get("/listings", (req, res) => {
    res.render("listings/index.ejs", { allListing: listings });
}); 

app.post("/listings", (req, res) => {
    const result = listingFromForm(req.body);
    if (result.errors) return renderFormError(res, "listings/new.ejs", req.body, result.errors);
    const listing = result.listing;
    listing._id = String(nextListingId++);
    listings.push(listing);
    saveListings();
    // Render the created listing in this response; this also avoids a second
    // request losing in-memory state on hosts that restart between requests.
    res.status(201).render("listings/show.ejs", { listing });
});

//show route
app.get("/listings/:id", (req, res) => {
    // Preserve compatibility if /listings/new reaches the ID route.
    if (req.params.id === "new") {
        return res.redirect("/new-listing");
    }
    const listing = getListing(req.params.id);
    if (!listing) return res.status(404).send("Listing not found");
    res.render("listings/show.ejs", { listing });
});

app.get("/listings/:id/edit", (req, res) => {
    const listing = getListing(req.params.id);
    if (!listing) return res.status(404).send("Listing not found");
    res.render("listings/edit.ejs", { listing: { ...listing, category: listing.category || inferCategory(listing) }, errors: [], categories });
});

app.post("/listings/:id", (req, res) => {
    const listing = getListing(req.params.id);
    if (!listing) return res.status(404).send("Listing not found");
    const result = listingFromForm(req.body);
    if (result.errors) return renderFormError(res, "listings/edit.ejs", { ...listing, ...req.body, image: { url: req.body.image || "" }, category: req.body.category || inferCategory(listing) }, result.errors);
    Object.assign(listing, result.listing);
    saveListings();
    res.redirect(`/listings/${listing._id}`);
});

app.post("/listings/:id/delete", (req, res) => {
    const index = listings.findIndex((item) => item._id === req.params.id);
    if (index === -1) return res.status(404).send("Listing not found");
    listings.splice(index, 1);
    saveListings();
    res.redirect("/listings");
});

if (require.main === module) {
    const port = process.env.PORT || 8080;
    app.listen(port, () => {
        console.log(`server is listening to port ${port}`);
    });
}

module.exports = app;
