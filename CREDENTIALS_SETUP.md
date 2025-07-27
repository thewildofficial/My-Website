# Credentials Page Setup

This document outlines the setup and requirements for the credentials page.

## File Structure

### Content
- `content/credentials.md` - Main content file with improved copy and structure

### Styling
- `static/css/credentials.css` - Creative design with Deep Space Blue theme
- CSS includes glassmorphism effects, hover animations, and responsive design

### JavaScript
- `assets/js/credential-viewer.js` - Interactive functionality
- Modal for PDF viewing
- Progress bar animations
- Card entrance animations
- Scroll-based triggers

### Assets Required

#### PDFs (place in `static/credentials/`)
- `waterloo-math-offer.pdf`
- `waterloo-laurier-offer.pdf`
- `carleton-transcript.pdf`
- `scalar-acceptance.pdf`
- `iit-ropar-result.pdf`
- `carleton-scholarship.pdf`
- `clevered-ai-certificate.pdf`
- `bits-pilani-enrollment.pdf`

#### Logos (place in `static/images/logos/`)
- `waterloo_logo.png`
- `waterloo_laurier_logo.png`
- `carleton_logo.png`
- `scalar_logo.png`
- `bits-pilani-logo.png`
- `iitrpr_logo.png`
- `oxford_logo.png`

## Features

### Design Elements
- **Color Scheme**: Deep Space Blue (#0D1B2A), Vibrant Turquoise (#00F5D4), Warm Amber (#FFD166)
- **Typography**: Orbitron for headings, Inter for body text
- **Effects**: Glassmorphism, animated gradients, 3D hover transforms
- **Animations**: Rotating border, text pulsing, card entrance, progress bars

### Interactive Features
- PDF modal viewer
- Hover effects with shimmer
- Progress tracking for ongoing programs
- Geographic journey visualization
- Scroll-triggered animations

### Responsive Design
- Mobile-first approach
- Adaptive font sizes using clamp()
- Flexible grid layout
- Touch-friendly interactions

## URL Handling

All PDF and image links use relative paths starting with `/`, allowing Hugo to:
- Generate correct URLs for any baseURL
- Work in both development and production
- Handle subdirectory deployments automatically

## Dependencies

- Font Awesome 6.4.0 (included via CDN in baseof.html)
- Modern browser with CSS Grid and backdrop-filter support
- JavaScript enabled for interactive features

## Configuration

The page is enabled via `config.toml`:
```toml
customCSS = ["css/credentials.css", ...]
customJS = ["js/credential-viewer.js", ...]

[[menu.main]]
  name = "Credentials"
  url = "/credentials"
  weight = 4
```
