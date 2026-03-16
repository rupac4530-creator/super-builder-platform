const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'platform', 'src', 'app', 'page.tsx');
let s = fs.readFileSync(filePath, 'utf8');

// Replace: heart (U+2764) + optional variation selector (U+FE0F) + single stray char + space
// with: heart + space
const heart = '\u2764';
const vs = '\uFE0F';
const rtl = '\u200F';

// Pattern: heart + optional vs + single stray char + space; replace with heart + space
const repl1 = s.replace(
  /(\u2764\uFE0F?).( <span id="lives">3<\/span><\/div>)/g,
  heart + ' $2'
);
const repl2 = repl1.replace(
  /(\u2764\uFE0F?).( <span id="hp">100<\/span><\/div>)/g,
  heart + ' $2'
);

if (repl2 !== s) {
  fs.writeFileSync(filePath, repl2);
  console.log('Fixed both HUD lines');
} else {
  // Try simpler: just remove U+200F anywhere in file
  const noRtl = s.split(rtl).join('');
  if (noRtl.length < s.length) {
    fs.writeFileSync(filePath, noRtl);
    console.log('Removed U+200F RTL characters from file');
  } else {
    console.log('No RTL char found');
  }
}
