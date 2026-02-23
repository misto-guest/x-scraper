/**
 * Design System Generator
 * Main generation logic
 */

const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');
const { getFontPairing, getFontImportCSS, getTailwindFontConfig } = require('./fonts');
const { getColorScheme, getTailwindColorConfig, getCSSVariables } = require('./colors');

/**
 * Generate a complete design system
 */
async function generateDesignSystem(themeKey, outputPath) {
  console.log(`\n🎨 Generating design system: ${themeKey}\n`);
  
  // Get theme data
  const fonts = getFontPairing(themeKey);
  const colors = getColorScheme(themeKey);
  
  // Prepare template context
  const context = {
    themeName: themeKey.charAt(0).toUpperCase() + themeKey.slice(1),
    themeDescription: colors.description,
    themeKey: themeKey,
    fontImports: getFontImportCSS(themeKey),
    cssVariables: getCSSVariables(themeKey),
    colors: getTailwindColorConfig(themeKey),
    fonts: getTailwindFontConfig(themeKey),
    themeLabels: getThemeLabels(themeKey)
  };
  
  // Create output directory
  const outputDir = outputPath || path.join(process.cwd(), 'outputs', `${themeKey}-design-system`);
  await fs.mkdir(outputDir, { recursive: true });
  
  // Compile templates
  const templatesDir = path.join(__dirname, '..', 'templates');
  
  // Generate CSS styles
  const stylesTemplate = await fs.readFile(path.join(templatesDir, 'styles.css.hbs'), 'utf8');
  const compiledStyles = Handlebars.compile(stylesTemplate);
  const stylesCSS = compiledStyles(context);
  await fs.writeFile(path.join(outputDir, 'styles.css'), stylesCSS);
  console.log('✅ Generated: styles.css');
  
  // Generate Tailwind config
  const tailwindTemplate = await fs.readFile(path.join(templatesDir, 'tailwind.config.hbs'), 'utf8');
  const compiledTailwind = Handlebars.compile(tailwindTemplate);
  const tailwindConfig = compiledTailwind(context);
  await fs.writeFile(path.join(outputDir, 'tailwind.config.js'), tailwindConfig);
  console.log('✅ Generated: tailwind.config.js');
  
  // Generate components HTML
  const componentsTemplate = await fs.readFile(path.join(templatesDir, 'components.hbs'), 'utf8');
  const compiledComponents = Handlebars.compile(componentsTemplate);
  const componentsHTML = compiledComponents(context);
  await fs.writeFile(path.join(outputDir, 'components.html'), componentsHTML);
  console.log('✅ Generated: components.html');
  
  // Generate preview HTML
  const previewHTML = generatePreviewHTML(context, stylesCSS, componentsHTML);
  await fs.writeFile(path.join(outputDir, 'preview.html'), previewHTML);
  console.log('✅ Generated: preview.html');
  
  // Generate README documentation
  const readme = generateReadme(context);
  await fs.writeFile(path.join(outputDir, 'README.md'), readme);
  console.log('✅ Generated: README.md');
  
  console.log(`\n🎉 Design system "${context.themeName}" generated successfully!`);
  console.log(`📁 Output directory: ${outputDir}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Open ${outputDir}/preview.html to see all components`);
  console.log(`  2. Copy styles.css and tailwind.config.js to your project`);
  console.log(`  3. Import components from components.html as needed\n`);
  
  return {
    themeKey,
    outputDir,
    files: ['styles.css', 'tailwind.config.js', 'components.html', 'preview.html', 'README.md']
  };
}

/**
 * Get theme-specific labels
 */
function getThemeLabels(themeKey) {
  const labels = {
    brutalist: {
      primaryButton: 'SUBMIT',
      secondaryButton: 'CANCEL',
      accentButton: 'URGENT'
    },
    editorial: {
      primaryButton: 'Read More',
      secondaryButton: 'Browse',
      accentButton: 'Subscribe'
    },
    luxury: {
      primaryButton: 'Discover',
      secondaryButton: 'Explore',
      accentButton: 'Exclusive'
    },
    playful: {
      primaryButton: 'Let\'s Go!',
      secondaryButton: 'Maybe Later',
      accentButton: 'Surprise Me'
    },
    'retro-futuristic': {
      primaryButton: 'INITIALIZE',
      secondaryButton: 'ABORT',
      accentButton: 'EXECUTE'
    },
    industrial: {
      primaryButton: 'START',
      secondaryButton: 'STOP',
      accentButton: 'RESET'
    },
    'refined-minimal': {
      primaryButton: 'Continue',
      secondaryButton: 'Back',
      accentButton: 'Learn More'
    }
  };
  
  return labels[themeKey] || {};
}

/**
 * Generate preview HTML file
 */
function generatePreviewHTML(context, stylesCSS, componentsHTML) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${context.themeName} Design System Preview</title>
  <style>
    ${stylesCSS}
    
    .preview-header {
      background: var(--color-primary);
      color: var(--color-background);
      padding: 2rem 0;
      margin-bottom: 3rem;
    }
    
    .preview-header h1 {
      margin: 0;
    }
    
    .preview-section {
      margin-bottom: 4rem;
    }
    
    .preview-section h2 {
      border-bottom: 2px solid var(--color-border);
      padding-bottom: 0.5rem;
      margin-bottom: 2rem;
    }
    
    .component-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .component-showcase {
      padding: 1rem;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
    }
  </style>
</head>
<body>
  <div class="preview-header">
    <div class="container">
      <h1>${context.themeName} Design System</h1>
      <p class="section-subtitle" style="color: var(--color-background);">${context.themeDescription}</p>
    </div>
  </div>
  
  <div class="container">
    <div class="preview-section">
      <h2>Buttons</h2>
      <div class="component-showcase">
        ${extractComponents(componentsHTML, 'BUTTONS')}
      </div>
    </div>
    
    <div class="preview-section">
      <h2>Cards</h2>
      <div class="component-grid">
        ${extractComponents(componentsHTML, 'CARDS')}
      </div>
    </div>
    
    <div class="preview-section">
      <h2>Sections</h2>
      ${extractComponents(componentsHTML, 'SECTIONS')}
    </div>
    
    <div class="preview-section">
      <h2>Form Elements</h2>
      <div class="component-showcase" style="max-width: 500px;">
        ${extractComponents(componentsHTML, 'FORM ELEMENTS')}
      </div>
    </div>
    
    <div class="preview-section">
      <h2>Badges & Tags</h2>
      <div class="component-showcase">
        ${extractComponents(componentsHTML, 'BADGES')}
      </div>
    </div>
    
    <div class="preview-section">
      <h2>Alerts</h2>
      <div class="component-showcase">
        ${extractComponents(componentsHTML, 'ALERTS')}
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Extract component sections from HTML
 */
function extractComponents(html, sectionName) {
  const regex = new RegExp(`<!-- ======================================== -->\\s*<!-- ${sectionName} -->\\s*<!-- ======================================== -->([\\s\\S]*?)(?=<!-- ======================================== -->|$)`, 'i');
  const match = html.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Generate README documentation
 */
function generateReadme(context) {
  return `# ${context.themeName} Design System

> ${context.themeDescription}

## 🎨 Theme Overview

This design system was generated for the **${context.themeName}** aesthetic. It includes a complete set of components, colors, and typography tailored to this style.

## 📦 What's Included

- **styles.css** - Complete component styles with CSS custom properties
- **tailwind.config.js** - Tailwind CSS configuration for this theme
- **components.html** - HTML markup for all components
- **preview.html** - Visual preview of all components

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | ${context.colors.primary} | Main brand color, CTAs |
| Secondary | ${context.colors.secondary} | Supporting elements |
| Accent | ${context.colors.accent} | Highlights, links |
| Background | ${context.colors.background} | Page background |
| Surface | ${context.colors.surface} | Card backgrounds |
| Text | ${context.colors.text} | Body text |
| Border | ${context.colors.border} | Dividers, outlines |

## ✏️ Typography

### Font Families

- **Headings:** ${context.fonts.heading}
- **Body:** ${context.fonts.body}
- **Accent:** ${context.fonts.accent}

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
- \`btn-primary\` - Main actions
- \`btn-secondary\` - Secondary actions
- \`btn-accent\` - Accent/highlight actions
- \`btn-outline\` - Outlined style
- \`btn-ghost\` - Minimal style

Sizes:
- \`btn-sm\` - Small
- \`btn-lg\` - Large

### Cards

- \`card\` - Base card
- \`card-header\` - Card with header
- \`card-interactive\` - Hover effects
- \`card-image\` - With image placeholder

### Sections

- \`section-hero\` - Hero sections
- \`section-features\` - Feature grids
- \`section-content\` - Content layouts
- \`section-cta\` - Call-to-action

### Form Elements

- \`form-input\` - Text inputs
- \`form-textarea\` - Multi-line text
- \`form-select\` - Dropdowns
- \`form-checkbox\` - Checkboxes

### Other Components

- \`badge\` - Status badges (multiple colors)
- \`alert\` - Alert messages (success, info, warning, error)

## 🚀 Usage

### 1. Copy Files to Your Project

\`\`\`bash
# Copy to your project
cp styles.css path/to/your/project/
cp tailwind.config.js path/to/your/project/
\`\`\`

### 2. Import Styles

\`\`\`html
<link rel="stylesheet" href="styles.css">
\`\`\`

### 3. Use Components

\`\`\`html
<!-- Button -->
<button class="btn btn-primary">Click Me</button>

<!-- Card -->
<div class="card">
  <div class="card-body">
    <h3 class="card-title">Title</h3>
    <p class="card-text">Content here</p>
  </div>
</div>
\`\`\`

### 4. With Tailwind CSS

\`\`\`bash
npm install -D tailwindcss
\`\`\`

The included \`tailwind.config.js\` is pre-configured with your theme colors and fonts.

## 📱 Responsive

All components are fully responsive. The grid system adapts to mobile, tablet, and desktop screens.

## 🎯 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

Generated with ❤️ by Design System Generator
`;
}

module.exports = {
  generateDesignSystem
};
