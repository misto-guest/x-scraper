/**
 * Color Scheme Generator
 * Themed palettes with dominant colors + sharp accents
 */

const colorSchemes = {
  brutalist: {
    primary: "#1a1a1a",
    secondary: "#f5f5f5",
    accent: "#ff3333",
    accentHover: "#cc0000",
    background: "#ffffff",
    surface: "#e5e5e5",
    text: "#1a1a1a",
    textMuted: "#666666",
    border: "#1a1a1a",
    success: "#00aa00",
    warning: "#ffaa00",
    error: "#ff0000",
    info: "#0066ff",
    description: "High contrast black and white with bold red accents",
    palette: {
      50: "#ffffff",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#cccccc",
      400: "#999999",
      500: "#666666",
      600: "#333333",
      700: "#1a1a1a",
      800: "#0d0d0d",
      900: "#000000",
      accent: "#ff3333",
      accent2: "#ffcc00"
    }
  },
  
  editorial: {
    primary: "#2c1810",
    secondary: "#8b7355",
    accent: "#c4a35a",
    accentHover: "#a68b4b",
    background: "#faf9f7",
    surface: "#f5f3ef",
    text: "#1a1512",
    textMuted: "#6b5d52",
    border: "#d4c4b0",
    success: "#2d5a27",
    warning: "#b8860b",
    error: "#c43737",
    info: "#2c5282",
    description: "Warm editorial tones with sophisticated gold accents",
    palette: {
      50: "#faf9f7",
      100: "#f5f3ef",
      200: "#e8e4dc",
      300: "#d4c4b0",
      400: "#b8a67a",
      500: "#8b7355",
      600: "#6b5d52",
      700: "#4a4038",
      800: "#2c1810",
      900: "#1a1512",
      accent: "#c4a35a",
      accent2: "#8b2635"
    }
  },
  
  luxury: {
    primary: "#1a1a2e",
    secondary: "#4a4e69",
    accent: "#c9a227",
    accentHover: "#a88a1f",
    background: "#faf8f5",
    surface: "#f5f0e8",
    text: "#0f0f1a",
    textMuted: "#4a4e69",
    border: "#d4cfc0",
    success: "#225c3d",
    warning: "#c49000",
    error: "#b84c4c",
    info: "#2c5282",
    description: "Deep navy with luxurious gold accents and cream backgrounds",
    palette: {
      50: "#faf8f5",
      100: "#f5f0e8",
      200: "#e8e0d0",
      300: "#d4cfc0",
      400: "#c4b49e",
      500: "#4a4e69",
      600: "#3a3e55",
      700: "#2a2e41",
      800: "#1a1a2e",
      900: "#0f0f1a",
      accent: "#c9a227",
      accent2: "#9b7b1c"
    }
  },
  
  playful: {
    primary: "#7c3aed",
    secondary: "#f472b6",
    accent: "#fbbf24",
    accentHover: "#f59e0b",
    background: "#fefce8",
    surface: "#fef3c7",
    text: "#1f2937",
    textMuted: "#6b7280",
    border: "#fde68a",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
    description: "Vibrant purple and pink with sunny yellow accents",
    palette: {
      50: "#fefce8",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f472b6",
      600: "#ec4899",
      700: "#7c3aed",
      800: "#5b21b6",
      900: "#1f2937",
      accent: "#fbbf24",
      accent2: "#06b6d4"
    }
  },
  
  "retro-futuristic": {
    primary: "#0d9488",
    secondary: "#7c3aed",
    accent: "#22d3ee",
    accentHover: "#06b6d4",
    background: "#0c0c0c",
    surface: "#1a1a1a",
    text: "#e5e5e5",
    textMuted: "#a3a3a3",
    border: "#262626",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
    description: "Cyberpunk teal and purple with neon cyan accents on dark",
    palette: {
      50: "#f5fdfa",
      100: "#e0fcf7",
      200: "#99f6e4",
      300: "#5eead4",
      400: "#22d3ee",
      500: "#0d9488",
      600: "#0f766e",
      700: "#7c3aed",
      800: "#1a1a1a",
      900: "#0c0c0c",
      accent: "#22d3ee",
      accent2: "#f472b6"
    }
  },
  
  industrial: {
    primary: "#f97316",
    secondary: "#ea580c",
    accent: "#fbbf24",
    accentHover: "#f59e0b",
    background: "#18181b",
    surface: "#27272a",
    text: "#fafafa",
    textMuted: "#a1a1aa",
    border: "#3f3f46",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
    description: "Safety orange with warm neutrals on dark industrial gray",
    palette: {
      50: "#fafafa",
      100: "#f4f4f5",
      200: "#e4e4e7",
      300: "#d4d4d8",
      400: "#a1a1aa",
      500: "#71717a",
      600: "#52525b",
      700: "#3f3f46",
      800: "#27272a",
      900: "#18181b",
      accent: "#f97316",
      accent2: "#fbbf24"
    }
  },
  
  "refined-minimal": {
    primary: "#27272a",
    secondary: "#71717a",
    accent: "#6366f1",
    accentHover: "#4f46e5",
    background: "#ffffff",
    surface: "#fafafa",
    text: "#18181b",
    textMuted: "#71717a",
    border: "#e4e4e7",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
    description: "Clean neutral grays with subtle indigo accents",
    palette: {
      50: "#ffffff",
      100: "#fafafa",
      200: "#f4f4f5",
      300: "#e4e4e7",
      400: "#d4d4d8",
      500: "#a1a1aa",
      600: "#71717a",
      700: "#52525b",
      800: "#3f3f46",
      900: "#27272a",
      accent: "#6366f1",
      accent2: "#8b5cf6"
    }
  },
  
  // Custom theme defaults
  custom: {
    primary: "#374151",
    secondary: "#6b7280",
    accent: "#3b82f6",
    accentHover: "#2563eb",
    background: "#ffffff",
    surface: "#f9fafb",
    text: "#111827",
    textMuted: "#6b7280",
    border: "#e5e7eb",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
    description: "Clean professional defaults for custom themes",
    palette: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
      accent: "#3b82f6",
      accent2: "#8b5cf6"
    }
  }
};

/**
 * Get color scheme for a theme
 */
function getColorScheme(themeKey) {
  return colorSchemes[themeKey] || colorSchemes.custom;
}

/**
 * Generate Tailwind color config from scheme
 */
function getTailwindColorConfig(themeKey) {
  const scheme = getColorScheme(themeKey);
  return {
    primary: scheme.primary,
    secondary: scheme.secondary,
    accent: scheme.accent,
    background: scheme.background,
    surface: scheme.surface,
    text: scheme.text,
    border: scheme.border,
    success: scheme.success,
    warning: scheme.warning,
    error: scheme.error,
    info: scheme.info
  };
}

/**
 * Generate CSS custom properties from scheme
 */
function getCSSVariables(themeKey) {
  const scheme = getColorScheme(themeKey);
  return `:root {
  --color-primary: ${scheme.primary};
  --color-secondary: ${scheme.secondary};
  --color-accent: ${scheme.accent};
  --color-accent-hover: ${scheme.accentHover};
  --color-background: ${scheme.background};
  --color-surface: ${scheme.surface};
  --color-text: ${scheme.text};
  --color-text-muted: ${scheme.textMuted};
  --color-border: ${scheme.border};
  --color-success: ${scheme.success};
  --color-warning: ${scheme.warning};
  --color-error: ${scheme.error};
  --color-info: ${scheme.info};
}`;
}

/**
 * Get all available theme keys
 */
function getAvailableThemes() {
  return Object.keys(colorSchemes).filter(k => k !== 'custom');
}

module.exports = {
  colorSchemes,
  getColorScheme,
  getTailwindColorConfig,
  getCSSVariables,
  getAvailableThemes
};
