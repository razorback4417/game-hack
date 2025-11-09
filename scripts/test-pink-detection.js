#!/usr/bin/env node

/**
 * Test pink detection logic
 */

// Test color: RGB(252, 93, 141)
const r = 252;
const g = 93;
const b = 141;

const bgR = 255;
const bgG = 0;
const bgB = 255;
const tolerance = 30;

console.log('Testing color detection for RGB(252, 93, 141)');
console.log('Target background: RGB(255, 0, 255)');
console.log('');

// Strategy 1: Pure bright pink
const isPureBrightPink = r >= (255 - tolerance) &&
                         g <= tolerance &&
                         b >= (255 - tolerance);
console.log('Strategy 1 (Pure bright pink):', isPureBrightPink);
console.log(`  r >= ${255 - tolerance}? ${r >= (255 - tolerance)} (${r})`);
console.log(`  g <= ${tolerance}? ${g <= tolerance} (${g})`);
console.log(`  b >= ${255 - tolerance}? ${b >= (255 - tolerance)} (${b})`);

// Strategy 2: Pinkish
const isPinkish = r >= 200 &&
                  g <= 200 &&
                  b >= 100 &&
                  (r + b) > (g * 2.0) &&
                  r > g &&
                  b > g &&
                  (r - b) < 150;

console.log('');
console.log('Strategy 2 (Pinkish):', isPinkish);
console.log(`  r >= 200? ${r >= 200} (${r})`);
console.log(`  g <= 200? ${g <= 200} (${g})`);
console.log(`  b >= 100? ${b >= 100} (${b})`);
console.log(`  (r + b) > (g * 2.0)? ${(r + b)} > ${(g * 2.0)} = ${(r + b) > (g * 2.0)}`);
console.log(`  r > g? ${r > g} (${r} > ${g})`);
console.log(`  b > g? ${b > g} (${b} > ${g})`);
console.log(`  (r - b) < 150? ${(r - b)} < 150 = ${(r - b) < 150} (${r} - ${b} = ${r - b})`);

// Strategy 3: Exact match
const rDiff = Math.abs(r - bgR);
const gDiff = Math.abs(g - bgG);
const bDiff = Math.abs(b - bgB);
const isExactMatch = rDiff <= tolerance && gDiff <= tolerance && bDiff <= tolerance;

console.log('');
console.log('Strategy 3 (Exact match):', isExactMatch);
console.log(`  rDiff: ${rDiff} <= ${tolerance}? ${rDiff <= tolerance}`);
console.log(`  gDiff: ${gDiff} <= ${tolerance}? ${gDiff <= tolerance}`);
console.log(`  bDiff: ${bDiff} <= ${tolerance}? ${bDiff <= tolerance}`);

console.log('');
console.log('Final result:', isPureBrightPink || isPinkish || isExactMatch);

