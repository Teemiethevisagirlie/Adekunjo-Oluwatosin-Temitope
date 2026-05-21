# Teemie The Visa Girlie — Website Package

Complete production website in **two files**. Zero npm dependencies. Pure Node.js.

## Files

| File | Purpose |
|---|---|
| `server.js` | All 7 pages + admin dashboard (1,350 lines) |
| `Dockerfile` | Production container with persistent storage |

## Pages

| URL | Page |
|---|---|
| `/` | Home |
| `/services` | Services |
| `/about` | About |
| `/blog` | Blog |
| `/testimonials` | Reviews |
| `/faq` | FAQ |
| `/contact` | Contact + form |
| `/admin` | Admin dashboard |

## Run Without Docker

```bash
node server.js
# Site: http://localhost:3000
# Admin: http://localhost:3000/admin  (password: teemie2026)
```

## Run With Docker

```bash
# Build
docker build -t teemie-site .

# Production run (persistent edits + secure password)
docker run -d \
  -p 3000:3000 \
  -e ADMIN_PASSWORD=YourSecurePassword \
  -v teemie-data:/data \
  --name teemie \
  --restart unless-stopped \
  teemie-site
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port |
| `ADMIN_PASSWORD` | `teemie2026` | Admin password — **change this** |
| `DATA_FILE` | `./content.json` | Where edits are saved |

## Admin Dashboard Sections

Hero · Services · About · Testimonials · Blog · FAQ · Contact Info · Quote · Marquee · **Enquiries** (contact form submissions)

## Production Checklist

- [ ] Change ADMIN_PASSWORD before deploying
- [ ] Mount Docker volume for /data persistence  
- [ ] Put behind nginx/Caddy for HTTPS
- [ ] Update contact links in Admin → Contact Info
