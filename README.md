# StaybNb

StaybNb is a simple accommodation listing app built with Node.js, Express, EJS, and MongoDB. Browse listings, view their details, add new stays, edit existing listings, or delete them.

## Features

- Browse all available listings
- View a listing's description, image, price, and location
- Create, edit, and delete listings
- Seed the database with sample listings

## Requirements

- Node.js and npm
- MongoDB running locally on its default port (`27017`)

The app connects to the `staybNb` database at `mongodb://127.0.0.1:27017/staybNb`.
Set `MONGODB_URI` to use a different MongoDB connection string, such as a hosted MongoDB database.

## Getting started

Clone the repository and install dependencies:

```sh
git clone https://github.com/senvaishnavi741-hash/StaybNb.git
cd StaybNb
npm install
```

Start MongoDB, then start the web server:

```sh
node app.js
```

Open [http://localhost:8080](http://localhost:8080). Visit `/listings` to browse listings or `/listings/new` to add one.

## Sample data

To load the sample listings, run:

```sh
node init/index.js
```

**This script deletes all existing listings in the `staybNb` database before inserting the sample data.** Back up any listings you want to keep before running it.

## Deploying to Vercel

Import the Git repository into Vercel and set the `MONGODB_URI` environment variable in the project settings to a reachable hosted MongoDB connection string. A local MongoDB address such as `127.0.0.1` is only available for local development and cannot be reached by a Vercel deployment. Redeploy after adding or changing the environment variable.

## Project structure

```text
.
├── app.js                 # Express app and listing routes
├── Models/listing.js      # Mongoose listing schema
├── init/                  # Sample data and database seeding script
├── public/style.css       # Application styles
└── views/                 # EJS pages and shared layout/partials
```

## Listing fields

Listings include a title, description, image URL, price per night, location, and country. The title is required; an image URL defaults to a sample image when one is not provided.
