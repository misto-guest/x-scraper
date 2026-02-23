# Design System Generator 🎨

A powerful CLI tool that automatically generates themed component libraries with Tailwind config, typography, color palettes, and base components.

## Features

✨ **7 Pre-built Themes**
- Brutalist - High contrast black and white with bold red accents
- Editorial - Warm editorial tones with sophisticated gold accents
- Luxury - Deep navy with luxurious gold accents
- Playful - Vibrant purple and pink with sunny yellow accents
- Retro-futuristic - Cyberpunk teal and purple with neon cyan
- Industrial - Safety orange with warm neutrals on dark gray
- Refined Minimal - Clean neutral grays with subtle indigo

🎨 **Complete Design System Output**
- Full Tailwind CSS configuration
- Distinctive font pairings (avoids Inter/Roboto/Ariel)
- Themed color schemes with dominant colors + sharp accents
- Base component library (buttons, cards, sections, forms)
- Responsive grid system
- Preview HTML file showing all components
- Comprehensive documentation

🚀 **Interactive Mode**
- Build custom themes interactively
- Choose color palettes, moods, and typography
- Generate ready-to-use design systems

## Installation

### Local Installation

```bash
cd design-system-generator
npm install
```

### Global Installation (Run from anywhere)

```bash
npm install -g .
```

Now you can run:
```bash
design-system generate brutalist
# or
dsg generate brutalist
```

## Usage

### Generate a Pre-built Theme

```bash
node bin/cli.js generate <theme>
```

Example:
```bash
node bin/cli.js generate brutalist
node bin/cli.js generate luxury
```

### List All Available Themes

```bash
node bin/cli.js list
```

### Interactive Mode

```bash
node bin/cli.js interactive
```

### Output Files

Each generated design system includes:
- **styles.css** - Complete component styles with CSS custom properties
- **tailwind.config.js** - Tailwind CSS configuration for this theme
- **components.html** - HTML markup for all components
- **preview.html** - Visual preview of all components in browser
- **README.md** - Theme documentation and usage guide

## Project Structure

```
design-system-generator/
├── bin/
│   └── cli.js              # CLI entry point
├── src/
│   ├── fonts.js            # Font pairings cache
│   ├── colors.js           # Color scheme definitions
│   ├── generator.js        # Main generation logic
│   └── index.js            # Module exports
├── templates/
│   ├── styles.css.hbs      # CSS styles template
│   ├── tailwind.config.hbs # Tailwind config template
│   └── components.hbs      # Component HTML template
├── outputs/                # Generated design systems
└── package.json
```

## Generated Components

Each design system includes:

### Buttons
- Primary, Secondary, Accent
- Outline, Ghost variants
- Small, Large sizes

### Cards
- Basic card
- Card with header
- Card with image
- Interactive hover effects

### Sections
- Hero section
- Feature grids
- Content layouts
- CTA sections

### Form Elements
- Text inputs
- Textareas
- Select dropdowns
- Checkboxes

### Other
- Badges (all color variants)
- Alerts (success, info, warning, error)

## Typography

Each theme uses distinctive font pairings:

| Theme | Heading | Body | Accent |
|-------|---------|------|--------|
| Brutalist | Space Grotesk | IBM Plex Mono | Syne |
| Editorial | Playfair Display | Source Serif 4 | Cormorant Garamond |
| Luxury | Cormorant | Crimson Pro | Bodoni Moda |
| Playful | Fredoka One | Quicksand | Patrick Hand |
| Retro-futuristic | Orbitron | Rajdhani | Audiowide |
| Industrial | Oswald | Libre Franklin | Teko |
| Refined Minimal | DM Sans | Literata | Eczar |

## Development

### Adding New Themes

1. Edit `src/fonts.js` to add font pairings
2. Edit `src/colors.js` to add color schemes
3. Update AVAILABLE_THEMES in both files

### Modifying Templates

Edit files in `templates/` directory:
- `styles.css.hbs` - Component styles
- `tailwind.config.hbs` - Tailwind config
- `components.hbs` - Component HTML

## Tech Stack

- **Node.js** - Runtime
- **Commander.js** - CLI framework
- **Inquirer** - Interactive prompts
- **Handlebars** - Template engine
- **Chalk** - Terminal colors

## License

MIT

## Credits

Built with ❤️ by OpenClaw

---

**Happy Designing!** 🎨✨
