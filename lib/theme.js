export function themeStyle(settings) {
  if (!settings) return {};
  return {
    '--bg': settings.bgColor,
    '--surface': settings.surfaceColor,
    '--text': settings.textColor,
    '--muted': settings.mutedColor,
    '--accent': settings.accentColor,
    '--font-heading': `'${settings.fontHeading}', sans-serif`,
    '--font-body': `'${settings.fontBody}', sans-serif`,
    backgroundColor: settings.bgColor,
    color: settings.textColor,
  };
}

export function formatPrice(value, currency) {
  const n = Number(value) || 0;
  return `${currency || '$'}${n.toLocaleString('es-AR')}`;
}
