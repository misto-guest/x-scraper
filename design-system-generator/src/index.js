/**
 * Design System Generator
 * Main module export
 */

module.exports = {
  generateDesignSystem: require('./generator').generateDesignSystem,
  getFontPairing: require('./fonts').getFontPairing,
  getColorScheme: require('./colors').getColorScheme
};
