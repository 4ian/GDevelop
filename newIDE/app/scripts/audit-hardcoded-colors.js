#!/usr/bin/env node
/**
 * audit-hardcoded-colors.js
 *
 * Scans GDevelop UI source files for hardcoded hex color values that should
 * instead use a design system token from the theme variables.
 *
 * Usage:
 *   node scripts/audit-hardcoded-colors.js
 *   node scripts/audit-hardcoded-colors.js --path src/UI
 *
 * Exits with code 1 if violations are found (CI-ready).
 */

const fs = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────

const SRC_ROOT = path.join(__dirname, '../src');

// Folders to skip entirely — SVG icons and theme files are legitimately hardcoded
const EXCLUDED_PATH_FRAGMENTS = [
  '/CustomSvgIcons/',
  '/Icons/',
  '/UI/Theme/',
  '/Credits/Icons/',
  '/MarketingPlans/Icons/',
  '/Profile/Subscription/Icons/',
  '/HotMessage/', // DiscountFlame.js is a decorative SVG
  'node_modules',
];

// File name patterns to skip
const EXCLUDED_FILE_PATTERNS = [/Icon\.js$/, /\.svg$/];

// Files where hardcoded hex values are legitimate (e.g. used only in comments/docs)
const WHITELISTED_FILES = [
  'Utils/ColorTransformer.js', // #112244 is a JSDoc example, not a painted color
];

// Theme variable files (both modes)
const DARK_THEME = path.join(
  __dirname,
  '../src/UI/Theme/DefaultDarkTheme/DefaultDarkThemeVariables.json'
);
const LIGHT_THEME = path.join(
  __dirname,
  '../src/UI/Theme/DefaultLightTheme/DefaultLightThemeVariables.json'
);

// ─── Build reverse lookup: hex → token names ─────────────────────────────────

function normalizeHex(hex) {
  // Lowercase, expand 3-char shorthand (#FFF → #ffffff)
  hex = hex.toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(hex)) {
    hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  return hex;
}

function buildTokenMap(filePath, mode) {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const map = {};
  for (const [token, value] of Object.entries(raw)) {
    if (typeof value === 'string' && value.startsWith('#')) {
      const hex = normalizeHex(value);
      if (!map[hex]) map[hex] = [];
      map[hex].push(`${token} (${mode})`);
    }
  }
  return map;
}

function mergeTokenMaps(...maps) {
  const merged = {};
  for (const map of maps) {
    for (const [hex, tokens] of Object.entries(map)) {
      if (!merged[hex]) merged[hex] = [];
      merged[hex].push(...tokens);
    }
  }
  return merged;
}

const darkMap = buildTokenMap(DARK_THEME, 'dark');
const lightMap = buildTokenMap(LIGHT_THEME, 'light');
const TOKEN_MAP = mergeTokenMaps(darkMap, lightMap);

// ─── File walker ─────────────────────────────────────────────────────────────

function shouldSkip(filePath) {
  for (const fragment of EXCLUDED_PATH_FRAGMENTS) {
    if (filePath.includes(fragment)) return true;
  }
  for (const pattern of EXCLUDED_FILE_PATTERNS) {
    if (pattern.test(filePath)) return true;
  }
  const relative = path.relative(SRC_ROOT, filePath).replace(/\\/g, '/');
  for (const whitelisted of WHITELISTED_FILES) {
    if (relative === whitelisted) return true;
  }
  return false;
}

function walkDir(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(full, results);
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

// ─── Scanner ─────────────────────────────────────────────────────────────────

// Matches hex colors in JS strings: '#FFF', '#1D1D26', '#aabbcc', '#AABBCCDD' (with alpha)
const HEX_PATTERN = /"(#[0-9a-fA-F]{3,8})"/g;

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations = [];

  lines.forEach((line, idx) => {
    let match;
    HEX_PATTERN.lastIndex = 0;
    while ((match = HEX_PATTERN.exec(line)) !== null) {
      const raw = match[1];
      const hex = normalizeHex(raw);
      const suggestions = TOKEN_MAP[hex] || [];
      violations.push({
        line: idx + 1,
        value: raw,
        suggestions,
      });
    }
  });

  return violations;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const targetArg = process.argv[2] === '--path' ? process.argv[3] : null;
const scanRoot = targetArg ? path.join(SRC_ROOT, targetArg) : SRC_ROOT;

const files = walkDir(scanRoot).filter(f => !shouldSkip(f));

let totalViolations = 0;
const report = [];

for (const file of files) {
  const violations = scanFile(file);
  if (violations.length > 0) {
    totalViolations += violations.length;
    report.push({ file: path.relative(SRC_ROOT, file), violations });
  }
}

// ─── Output ──────────────────────────────────────────────────────────────────

if (report.length === 0) {
  console.log('✅ No hardcoded colors found.');
  process.exit(0);
}

console.log(`\n❌ Found ${totalViolations} hardcoded color(s) in ${report.length} file(s):\n`);

for (const { file, violations } of report) {
  console.log(`  📄 ${file}`);
  for (const { line, value, suggestions } of violations) {
    const hint =
      suggestions.length > 0
        ? `→ use: ${[...new Set(suggestions)].join(', ')}`
        : '→ no matching token found — check if this is a new color';
    console.log(`     Line ${line}: ${value}  ${hint}`);
  }
  console.log('');
}

console.log(`Run this script regularly to catch drift early.`);
process.exit(1);
