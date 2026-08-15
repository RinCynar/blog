/**
 * Material You helpers:
 * - theme-color meta from surface token
 * - optional accent from avatar, mapped onto the M3 roles
 */

function ensureMeta() {
  let meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  return meta;
}

function currentMode() {
  const attr = document.documentElement.getAttribute('data-mode');
  if (attr === 'dark' || attr === 'light') return attr;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function hexToHsl(hex) {
  const raw = hex.replace('#', '').trim();
  if (raw.length !== 6) return null;
  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function paletteFromSeed(hex, mode) {
  const hsl = hexToHsl(hex);
  if (!hsl) return null;
  const { h } = hsl;
  const s = Math.min(Math.max(hsl.s, 28), 62);
  const dark = mode === 'dark';

  return {
    '--md-primary': dark ? hslToHex(h, s, 80) : hslToHex(h, s, 38),
    '--md-on-primary': dark ? hslToHex(h, 70, 16) : '#ffffff',
    '--md-primary-container': dark ? hslToHex(h, 40, 28) : hslToHex(h, 80, 92),
    '--md-on-primary-container': dark
      ? hslToHex(h, 70, 92)
      : hslToHex(h, 70, 16),
    '--md-secondary': dark ? hslToHex(h + 18, 18, 80) : hslToHex(h + 18, 16, 38),
    '--md-secondary-container': dark
      ? hslToHex(h + 18, 16, 28)
      : hslToHex(h + 18, 40, 92),
    '--md-on-secondary-container': dark
      ? hslToHex(h + 18, 20, 92)
      : hslToHex(h + 18, 20, 16)
  };
}

function applyPalette(hex) {
  const tokens = paletteFromSeed(hex, currentMode());
  if (!tokens) return;
  const root = document.documentElement;
  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  updateThemeColor();
}

function updateThemeColor() {
  const meta = ensureMeta();
  const style = getComputedStyle(document.documentElement);
  const surface = style.getPropertyValue('--md-surface').trim();
  if (surface) meta.setAttribute('content', surface);
}

function rgbToHex(r, g, b) {
  const toHex = (n) => `0${Math.round(n).toString(16)}`.slice(-2);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function sampleImage(image) {
  try {
    const canvas = document.createElement('canvas');
    const size = 32;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 125) continue;
      const rr = data[i];
      const gg = data[i + 1];
      const bb = data[i + 2];
      const luminance = 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
      if (luminance > 240 || luminance < 10) continue;
      r += rr;
      g += gg;
      b += bb;
      count += 1;
    }
    if (count === 0) return null;
    return rgbToHex(r / count, g / count, b / count);
  } catch (e) {
    return null;
  }
}

async function extractAccentFromImage(imgEl) {
  if (!imgEl) return null;
  const src = imgEl.currentSrc || imgEl.src;
  if (!src) return null;

  try {
    const testImg = new Image();
    testImg.crossOrigin = 'Anonymous';
    const loaded = await new Promise((resolve) => {
      testImg.onload = () => resolve(testImg);
      testImg.onerror = () => resolve(null);
      testImg.src = src;
    });
    if (loaded) {
      const color = sampleImage(loaded);
      if (color) return color;
    }
  } catch (e) {
    /* ignore */
  }

  try {
    if (imgEl.complete && imgEl.naturalWidth) {
      return sampleImage(imgEl);
    }
  } catch (e) {
    /* canvas tainted */
  }

  return null;
}

let seedHex = null;

function bindAccent() {
  const avatarImg =
    document.querySelector('#avatar-img') ||
    document.querySelector('#avatar img');
  if (!avatarImg) return;

  const applyFromImg = async () => {
    const hex = await extractAccentFromImage(avatarImg);
    if (!hex) return;
    seedHex = hex;
    applyPalette(hex);
  };

  if (avatarImg.complete) {
    applyFromImg();
  } else {
    avatarImg.addEventListener('load', applyFromImg, { once: true });
  }
}

function watchMode() {
  const refresh = () => {
    if (seedHex) applyPalette(seedHex);
    updateThemeColor();
  };

  window.addEventListener('message', (event) => {
    if (event.data?.direction === 'mode-toggle') refresh();
  });

  new MutationObserver(refresh).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-mode', 'style']
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateThemeColor();
  bindAccent();
  watchMode();
  window.MaterialYou = {
    setAccentColor: (hex) => {
      seedHex = hex;
      applyPalette(hex);
    }
  };
});
