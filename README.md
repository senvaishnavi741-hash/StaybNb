# StaybNb

StaybNb is a small listings app built with Express and EJS. It starts with bundled sample listings and stores create, edit, and delete changes in `init/listings.json` for local development.

## Features

- Browse sample stays
- View listing images, descriptions, prices, and locations
- Create, edit, and delete listings
- Use a category-based default image when no photo URL is supplied
- Responsive pages styled with Bootstrap

## Run locally

Install dependencies and start the app:

```sh
npm install
npm start
```

Open [http://localhost:8080](http://localhost:8080). The add listing page is at `/new-listing`.

## Deploy to Vercel

Import this repository into Vercel and deploy. For durable listing changes in a serverless deployment, configure a database; local JSON file writes are intended for local development.

## Project structure

```text
.
├── app.js                 # Express app and page routes
├── init/data.js           # Sample listing data
├── public/style.css       # Application styles
└── views/                 # EJS pages and shared layout/partials
```
