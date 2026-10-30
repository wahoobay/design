// WCAG 2.x contrast ratio between two #RRGGBB colours.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(hexA, hexB) {
  const [hi, lo] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

// Every text-on-background pair that must reach 4.5 (colour token suffixes).
export const pairs = [
  ['ink', 'bg'], ['ink', 'panel'],
  ['ink-2', 'bg'], ['ink-2', 'panel'],
  ['ink-3', 'bg'], ['ink-3', 'panel'],
  ['action', 'bg'], ['action', 'panel'],
  ['on-action', 'action'],
  ['accent-text', 'bg'], ['accent-text', 'accent-tint'],
  ['on-accent', 'accent'],
];
