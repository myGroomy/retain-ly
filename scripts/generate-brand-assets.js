const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'brand-assets');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Refined "Storefront Retensi" Icon Geometry
function getStorefrontRetensiMark(accentColor = '#2f6cff', markColor = '#FFFFFF', strokeWidth = 26) {
  return `
    <!-- Top Arc Orbit Accent -->
    <path d="M192 142C212 130 234 124 256 124C322 124 376 172 384 234" 
          stroke="${markColor}" stroke-width="${strokeWidth * 0.7}" stroke-linecap="round" fill="none" opacity="0.9" />

    <!-- Storefront Canopy Awning -->
    <!-- Awning Base & Scallops -->
    <path d="M168 224C168 224 182 248 212 248C236 248 244 234 256 234C268 234 276 248 300 248C330 248 344 224 344 224L328 174C324 164 314 158 304 158H208C198 158 188 164 184 174L168 224Z" 
          fill="${markColor}" />
    
    <!-- Canopy Inner Flutes / Negative Space Ribs -->
    <path d="M224 158L220 240M288 158L292 240" 
          stroke="${accentColor}" stroke-width="6" stroke-linecap="round" />

    <!-- Storefront Base Frame -->
    <path d="M196 248V312M316 248V312" 
          stroke="${markColor}" stroke-width="${strokeWidth * 0.7}" stroke-linecap="round" />

    <!-- Circular Retention Return Loop -->
    <path d="M188 296C174 322 176 352 198 374C230 406 282 406 314 374C344 344 348 300 326 266" 
          stroke="${markColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    
    <!-- Retention Return Arrowhead (pointing dynamically back up) -->
    <path d="M304 290L332 254L358 288" 
          stroke="${markColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none" />

    <!-- Customer Heartbeat Dot inside the Store -->
    <circle cx="256" cy="308" r="14" fill="${markColor}" />
  `;
}

// 1. logo-icon.svg (Primary Gradient Squircle)
const logoIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="retainly-brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2f6cff" />
      <stop offset="100%" stop-color="#1e4fd6" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="122" fill="url(#retainly-brand-gradient)" />
  ${getStorefrontRetensiMark('#2f6cff', '#FFFFFF', 26)}
</svg>`;

// 2. logo-icon-mono.svg (Monochrome Dark)
const logoIconMonoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%" fill="none">
  <rect width="512" height="512" rx="122" fill="#0F172A" />
  ${getStorefrontRetensiMark('#0F172A', '#FFFFFF', 26)}
</svg>`;

// 3. logo-icon-transparent.svg (Standalone transparent vector mark)
const logoIconTransparentSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="140 100 260 320" width="100%" height="100%" fill="none">
  ${getStorefrontRetensiMark('#FFFFFF', '#2F6CFF', 26)}
</svg>`;

// 4. favicon.svg (Solid #2f6cff, high clarity at small sizes)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%" fill="none">
  <rect width="128" height="128" rx="30" fill="#2F6CFF" />
  <g transform="scale(0.25) translate(0, 0)">
    ${getStorefrontRetensiMark('#2f6cff', '#FFFFFF', 28)}
  </g>
</svg>`;

// 5. logo-full-horizontal.svg (Primary Horizontal Brand Logo)
const logoFullHorizontalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 140" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="retainly-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2f6cff" />
      <stop offset="100%" stop-color="#1e4fd6" />
    </linearGradient>
  </defs>

  <!-- Left Icon Mark -->
  <g transform="translate(16, 16) scale(0.2109)">
    <rect width="512" height="512" rx="122" fill="url(#retainly-logo-grad)" />
    ${getStorefrontRetensiMark('#2f6cff', '#FFFFFF', 26)}
  </g>

  <!-- Typography Wordmark: "Retain-ly" -->
  <g transform="translate(150, 88)">
    <text font-family="system-ui, -apple-system, 'Geist Sans', 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="700" letter-spacing="-0.035em">
      <tspan fill="#0F172A">Retain</tspan>
      <tspan fill="#2F6CFF">-ly</tspan>
    </text>
  </g>
</svg>`;

// 6. logo-full-horizontal-dark.svg (Dark Mode Horizontal Logo)
const logoFullHorizontalDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 140" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="retainly-logo-grad-dark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2f6cff" />
      <stop offset="100%" stop-color="#1e4fd6" />
    </linearGradient>
  </defs>

  <!-- Left Icon Mark -->
  <g transform="translate(16, 16) scale(0.2109)">
    <rect width="512" height="512" rx="122" fill="url(#retainly-logo-grad-dark)" />
    ${getStorefrontRetensiMark('#2f6cff', '#FFFFFF', 26)}
  </g>

  <!-- Typography Wordmark for dark mode -->
  <g transform="translate(150, 88)">
    <text font-family="system-ui, -apple-system, 'Geist Sans', 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="700" letter-spacing="-0.035em">
      <tspan fill="#FFFFFF">Retain</tspan>
      <tspan fill="#5B8BFF">-ly</tspan>
    </text>
  </g>
</svg>`;

// 7. logo-full-vertical.svg (Stacked centered logo)
const logoFullVerticalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 360" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="retainly-logo-grad-v" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2f6cff" />
      <stop offset="100%" stop-color="#1e4fd6" />
    </linearGradient>
  </defs>

  <!-- Centered Top Icon -->
  <g transform="translate(120, 28) scale(0.3125)">
    <rect width="512" height="512" rx="122" fill="url(#retainly-logo-grad-v)" />
    ${getStorefrontRetensiMark('#2f6cff', '#FFFFFF', 26)}
  </g>

  <!-- Centered Wordmark -->
  <g transform="translate(200, 260)">
    <text text-anchor="middle" font-family="system-ui, -apple-system, 'Geist Sans', 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="700" letter-spacing="-0.035em">
      <tspan fill="#0F172A">Retain</tspan>
      <tspan fill="#2F6CFF">-ly</tspan>
    </text>
    <text y="38" text-anchor="middle" font-family="system-ui, -apple-system, 'Geist Sans', 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#64748B" letter-spacing="0.02em">
      PELACAK RETENSI BISNIS F&amp;B
    </text>
  </g>
</svg>`;

// 8. logo-wordmark.svg
const logoWordmarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 100" width="100%" height="100%" fill="none">
  <g transform="translate(10, 72)">
    <text font-family="system-ui, -apple-system, 'Geist Sans', 'Segoe UI', Roboto, sans-serif" font-size="72" font-weight="700" letter-spacing="-0.04em">
      <tspan fill="#0F172A">Retain</tspan>
      <tspan fill="#2F6CFF">-ly</tspan>
    </text>
  </g>
</svg>`;

// 9. logo-wordmark-white.svg
const logoWordmarkWhiteSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 100" width="100%" height="100%" fill="none">
  <g transform="translate(10, 72)">
    <text font-family="system-ui, -apple-system, 'Geist Sans', 'Segoe UI', Roboto, sans-serif" font-size="72" font-weight="700" letter-spacing="-0.04em">
      <tspan fill="#FFFFFF">Retain</tspan>
      <tspan fill="#5B8BFF">-ly</tspan>
    </text>
  </g>
</svg>`;

// 10. logo-mono.svg
const logoMonoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 140" width="100%" height="100%" fill="none">
  <g transform="translate(16, 16) scale(0.2109)">
    <rect width="512" height="512" rx="122" fill="#0F172A" />
    ${getStorefrontRetensiMark('#0F172A', '#FFFFFF', 26)}
  </g>
  <g transform="translate(150, 88)">
    <text font-family="system-ui, -apple-system, 'Geist Sans', 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="700" letter-spacing="-0.035em" fill="#0F172A">
      Retain-ly
    </text>
  </g>
</svg>`;

// Write all files
const filesToWrite = [
  { name: 'logo-icon.svg', content: logoIconSvg },
  { name: 'logo-icon-mono.svg', content: logoIconMonoSvg },
  { name: 'logo-icon-transparent.svg', content: logoIconTransparentSvg },
  { name: 'favicon.svg', content: faviconSvg },
  { name: 'logo-full-horizontal.svg', content: logoFullHorizontalSvg },
  { name: 'logo-full-horizontal-dark.svg', content: logoFullHorizontalDarkSvg },
  { name: 'logo-full-vertical.svg', content: logoFullVerticalSvg },
  { name: 'logo-wordmark.svg', content: logoWordmarkSvg },
  { name: 'logo-wordmark-white.svg', content: logoWordmarkWhiteSvg },
  { name: 'logo-mono.svg', content: logoMonoSvg }
];

filesToWrite.forEach(file => {
  const filePath = path.join(targetDir, file.name);
  fs.writeFileSync(filePath, file.content, 'utf8');
  console.log(`Updated: brand-assets/${file.name}`);
});

// Also update public/favicon.svg
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), faviconSvg, 'utf8');
console.log('Updated: public/favicon.svg');
console.log('Done!');
