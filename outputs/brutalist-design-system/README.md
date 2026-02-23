# Brutalist Design System

> High contrast black and white with bold red accents

## 🎨 Theme Overview

This design system was generated for the **Brutalist** aesthetic. It includes a complete set of components, colors, and typography tailored to this style.

## 📦 What's Included

- **styles.css** - Complete component styles with CSS custom properties
- **tailwind.config.js** - Tailwind CSS configuration for this theme
- **components.html** - HTML markup for all components
- **preview.html** - Visual preview of all components

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #1a1a1a | Main brand color, CTAs |
| Secondary | #f5f5f5 | Supporting elements |
| Accent | #ff3333 | Highlights, links |
| Background | #ffffff | Page background |
| Surface | #e5e5e5 | Card backgrounds |
| Text | #1a1a1a | Body text |
| Border | #1a1a1a | Dividers, outlines |

## ✏️ Typography

### Font Families

- **Headings:** 'Space Grotesk', 700, 500
- **Body:** 'IBM Plex Mono', 400, 300
- **Accent:** 'Syne', 800

### Type Scale

- **H1:** 3rem (48px) - Page titles
- **H2:** 2.25rem (36px) - Section headers
- **H3:** 1.75rem (28px) - Component titles
- **H4:** 1.25rem (20px) - Card titles
- **Body:** 1rem (16px) - Default text
- **Small:** 0.875rem (14px) - Meta text

## 🧩 Components

### Buttons

Available variants:
- `btn-primary` - Main actions
- `btn-secondary` - Secondary actions
- `btn-accent` - Accent/highlight actions
- `btn-outline` - Outlined style
- `btn-ghost` - Minimal style

Sizes:
- `btn-sm` - Small
- `btn-lg` - Large

### Cards

- `card` - Base card
- `card-header` - Card with header
- `card-interactive` - Hover effects
- `card-image` - With image placeholder

### Sections

- `section-hero` - Hero sections
- `section-features` - Feature grids
- `section-content` - Content layouts
- `section-cta` - Call-to-action

### Form Elements

- `form-input` - Text inputs
- `form-textarea` - Multi-line text
- `form-select` - Dropdowns
- `form-checkbox` - Checkboxes

### Other Components

- `badge` - Status badges (multiple colors)
- `alert` - Alert messages (success, info, warning, error)

## 🚀 Usage

### 1. Copy Files to Your Project

```bash
# Copy to your project
cp styles.css path/to/your/project/
cp tailwind.config.js path/to/your/project/
```

### 2. Import Styles

```html
<link rel="stylesheet" href="styles.css">
```

### 3. Use Components

```html
<!-- Button -->
<button class="btn btn-primary">Click Me</button>

<!-- Card -->
<div class="card">
  <div class="card-body">
    <h3 class="card-title">Title</h3>
    <p class="card-text">Content here</p>
  </div>
</div>
```

### 4. With Tailwind CSS

```bash
npm install -D tailwindcss
```

The included `tailwind.config.js` is pre-configured with your theme colors and fonts.

## 📱 Responsive

All components are fully responsive. The grid system adapts to mobile, tablet, and desktop screens.

## 🎯 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

Generated with ❤️ by Design System Generator
