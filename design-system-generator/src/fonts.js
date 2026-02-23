/**
 * Distinctive Font Pairings Cache
 * Avoids: Inter, Roboto, Arial
 * Curated pairs for different moods/aesthetics
 */

const fontPairings = {
  brutalist: {
    heading: { family: "Space Grotesk", weights: [700, 500], source: "Google Fonts" },
    body: { family: "IBM Plex Mono", weights: [400, 300], source: "Google Fonts" },
    accent: { family: "Syne", weights: [800], source: "Google Fonts" },
    urls: [
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap",
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400&display=swap",
      "https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap"
    ]
  },
  
  editorial: {
    heading: { family: "Playfair Display", weights: [700, 400, 900], source: "Google Fonts" },
    body: { family: "Source Serif 4", weights: [400, 300, 600], source: "Google Fonts" },
    accent: { family: "Cormorant Garamond", weights: [600, 300], source: "Google Fonts" },
    urls: [
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap",
      "https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,300;8..60,400;8..60,600&display=swap",
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;600&display=swap"
    ]
  },
  
  luxury: {
    heading: { family: "Cormorant", weights: [600, 400, 300], source: "Google Fonts" },
    body: { family: "Crimson Pro", weights: [300, 400, 200], source: "Google Fonts" },
    accent: { family: "Bodoni Moda", weights: [400, 900], source: "Google Fonts" },
    urls: [
      "https://fonts.googleapis.com/css2?family=Cormorant:wght@300;400;600&display=swap",
      "https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@200;300;400&display=swap",
      "https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,900&display=swap"
    ]
  },
  
  playful: {
    heading: { family: "Fredoka One", weights: [400], source: "Google Fonts" },
    body: { family: "Quicksand", weights: [500, 400, 700], source: "Google Fonts" },
    accent: { family: "Patrick Hand", weights: [400], source: "Google Fonts" },
    urls: [
      "https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap",
      "https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap"
    ]
  },
  
  "retro-futuristic": {
    heading: { family: "Orbitron", weights: [700, 500, 400], source: "Google Fonts" },
    body: { family: "Rajdhani", weights: [400, 500, 300], source: "Google Fonts" },
    accent: { family: "Audiowide", weights: [400], source: "Google Fonts" },
    urls: [
      "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500&display=swap",
      "https://fonts.googleapis.com/css2?family=Audiowide&display=swap"
    ]
  },
  
  industrial: {
    heading: { family: "Oswald", weights: [700, 500, 400], source: "Google Fonts" },
    body: { family: "Libre Franklin", weights: [400, 300, 600], source: "Google Fonts" },
    accent: { family: "Teko", weights: [600, 400], source: "Google Fonts" },
    urls: [
      "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;600&display=swap",
      "https://fonts.googleapis.com/css2?family=Teko:wght@400;600&display=swap"
    ]
  },
  
  "refined-minimal": {
    heading: { family: "DM Sans", weights: [700, 500, 400], source: "Google Fonts" },
    body: { family: " Literata", weights: [400, 300, 500], source: "Google Fonts" },
    accent: { family: "Eczar", weights: [500, 600], source: "Google Fonts" },
    urls: [
      "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Literata:wght@300;400;500&display=swap",
      "https://fonts.googleapis.com/css2?family=Eczar:wght@500;600&display=swap"
    ]
  },
  
  // Custom theme fallback
  custom: {
    heading: { family: "Space Grotesk", weights: [700, 500, 400], source: "Google Fonts" },
    body: { family: "Source Sans 3", weights: [400, 300, 600], source: "Google Fonts" },
    accent: { family: "Syncopate", weights: [700], source: "Google Fonts" },
    urls: [
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600&display=swap",
      "https://fonts.googleapis.com/css2?family=Syncopate:wght@700&display=swap"
    ]
  }
};

/**
 * Get font pairing for a theme
 */
function getFontPairing(themeKey) {
  return fontPairings[themeKey] || fontPairings.custom;
}

/**
 * Get all available theme keys
 */
function getAvailableThemes() {
  return Object.keys(fontPairings).filter(k => k !== 'custom');
}

/**
 * Get CSS font import block
 */
function getFontImportCSS(themeKey) {
  const fonts = getFontPairing(themeKey);
  return fonts.urls.map(url => `@import url('${url}');`).join('\n');
}

/**
 * Get Tailwind font family config
 */
function getTailwindFontConfig(themeKey) {
  const fonts = getFontPairing(themeKey);
  return {
    heading: [`'${fonts.heading.family}'`, ...fonts.heading.weights.map(w => `${w}`)].join(', '),
    body: [`'${fonts.body.family}'`, ...fonts.body.weights.map(w => `${w}`)].join(', '),
    accent: [`'${fonts.accent.family}'`, ...fonts.accent.weights.map(w => `${w}`)].join(', ')
  };
}

module.exports = {
  fontPairings,
  getFontPairing,
  getAvailableThemes,
  getFontImportCSS,
  getTailwindFontConfig
};
