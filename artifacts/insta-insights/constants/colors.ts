/**
 * Semantic design tokens for Insta Insights.
 * Dark-only analytics theme: near-black surfaces, magenta/purple accent gradient.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#ffffff',
    tint: '#FF2D78',

    // Core surfaces
    background: '#000000',
    foreground: '#ffffff',

    // Cards / elevated surfaces
    card: '#161618',
    cardForeground: '#ffffff',

    // Primary action color (buttons, links, active states) — Instagram-insights magenta
    primary: '#FF2D78',
    primaryForeground: '#ffffff',

    // Secondary accent — electric purple, used for audience / non-follower series
    secondary: '#7C4DFF',
    secondaryForeground: '#ffffff',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#1f1f22',
    mutedForeground: '#8e8e93',

    // Accent highlights (badges, selected pills, focus rings)
    accent: '#26262a',
    accentForeground: '#ffffff',

    // Destructive actions (delete, error states)
    destructive: '#FF453A',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#2c2c2e',
    input: '#1f1f22',

    // Chart-specific tokens
    chartLine: '#FF2D78',
    chartLineAlt: '#7C4DFF',
    track: '#2c2c2e',
  },

  // Border radius (in px) applied to cards, buttons, inputs, and modals.
  radius: 16,
};

export default colors;
