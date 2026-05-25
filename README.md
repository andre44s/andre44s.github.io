# personal_website

Single-page personal homepage — academic-style dark layout, mobile-responsive, no JS.

## Files

- `index.html` — all content (bio, news, experience, education, "open for collaboration")
- `styles.css` — all styling
- `photo.jpg` — profile photo (drop in to replace the placeholder)
- `cv.pdf` — downloadable CV (drop in to make the `[CV]` link work)

## Hosting

Pure static site. Works on:
- GitHub Pages — push to a repo, enable Pages from the main branch
- Netlify / Cloudflare Pages / Vercel — drag-and-drop or git-connect
- Any nginx / caddy / S3 static site

The CV link uses a relative path (`cv.pdf`), so just place the PDF next to `index.html` and it's reachable at `yoursite.com/cv.pdf`.

## Editing

- News: edit the `<ul class="news">` block in `index.html` (latest first)
- Experience / Education: edit the `<article class="job">` / `<article class="edu">` blocks
- Colors: change `:root` variables at the top of `styles.css`
