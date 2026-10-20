# propertiesCMS

A white-label real-estate CMS: property listings with search and filters, property pages with enquiry forms, and an admin panel for listings, enquiries and branding (name, logo, colours, contact details, currency).

## Quick start
```bash
npm install
ADMIN_PASSWORD=choose-one SESSION_SECRET=long-random-string npm start
```
Open http://localhost:3000 and log in at `/admin/login` as `admin` (default password `admin123` if `ADMIN_PASSWORD` isn't set — change it in Settings).

Data is stored in `data/db.json` and uploaded images in `public/uploads/`. On first run, the store is filled with fictional demo listings.

## Environment variables
| Variable | Default | Purpose |
|---|---|---|
| `PORT` | 3000 | HTTP port |
| `ADMIN_PASSWORD` | admin123 | Initial admin password (first run only) |
| `SESSION_SECRET` | change-me | Session signing secret |
| `DATA_DIR` | ./data | Where the JSON database lives |
