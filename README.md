# StaybNb

StaybNb is a frontend showcase for browsing accommodation listings. It uses Express and EJS to render the pages and bundled sample data for listings. It does not require MongoDB or another database; changes made through the site are not persisted.

## Features

- Browse sample stays
- View listing images, descriptions, prices, and locations
- Responsive pages styled with Bootstrap

## Run locally

Install dependencies and start the app:

```sh
npm install
node app.js
```

Open [http://localhost:8080](http://localhost:8080).

## Deploy to Vercel

Import this repository into Vercel and deploy. No database or environment variables are required for the frontend demo.

## Project structure

```text
.
├── app.js                 # Express app and page routes
├── init/data.js           # Sample listing data
├── public/style.css       # Application styles
└── views/                 # EJS pages and shared layout/partials
```
