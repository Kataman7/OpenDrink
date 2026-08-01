import initSqlJs from 'sql.js';
import fs from 'fs';

const SQL = await initSqlJs();
const buffer = fs.readFileSync('public/questions.sqlite');
const db = new SQL.Database(buffer);

// 1. Dormelles with 2+ distinct non-toz tokens
const r = db.exec("SELECT sentence FROM dormelles_questions WHERE lang='fr'");
console.log("=== Dormelles with 2+ distinct player tokens ===");
let multi = 0;
for (const [s] of r[0].values) {
  const tokens = (s.match(/\$\{[^}]+\}/g) || []).filter(t => t !== '${toz}');
  const unique = [...new Set(tokens)];
  if (unique.length >= 2) {
    multi++;
    if (multi <= 3) console.log("  " + unique.join(", ") + " | " + s.substring(0, 70));
  }
}
console.log("  Total: " + multi + " questions");

// 2. Questions (qpr) with 2+ %s
const r2 = db.exec("SELECT sentence FROM questions WHERE lang='fr' AND game_key='qpr' AND INSTR(sentence, '%s') > 0");
console.log("\n=== Who Could with %s ===");
let multi2 = 0;
for (const [s] of r2[0].values) {
  const count = (s.match(/%s/g) || []).length;
  if (count >= 2) multi2++;
}
console.log("  Total: " + multi2 + " questions with 2+ %s (out of " + r2[0].values.length + ")");

// 3. jnj with 2+ %s
const r3 = db.exec("SELECT sentence FROM questions WHERE lang='fr' AND game_key='jnj' AND INSTR(sentence, '%s') > 0");
console.log("\n=== Never Have I Ever with %s ===");
let multi3 = 0;
for (const [s] of r3[0].values) {
  const count = (s.match(/%s/g) || []).length;
  if (count >= 2) multi3++;
}
console.log("  Total: " + multi3 + " questions with 2+ %s (out of " + r3[0].values.length + ")");

// 4. jnj with 2+ %s examples
const r4 = db.exec("SELECT sentence FROM questions WHERE lang='fr' AND game_key='jnj' LIMIT 500");
console.log("\n=== jnj 2+ %s examples ===");
let ex = 0;
for (const [s] of r4[0].values) {
  const count = (s.match(/%s/g) || []).length;
  if (count >= 2 && ex < 5) { ex++; console.log("  " + count + " %s: " + s.substring(0, 80)); }
}

// 5. Dormelles tokens: j1, j2, j3 - what's the max?
const r5 = db.exec("SELECT sentence FROM dormelles_questions WHERE lang='fr'");
console.log("\n=== Dormelles token overview ===");
let seen = new Set();
for (const [s] of r5[0].values) {
  const tokens = [...new Set((s.match(/\$\{[^}]+\}/g) || []).filter(t => t !== '${toz}'))];
  tokens.forEach(t => seen.add(t));
}
console.log("  Distinct player tokens: " + [...seen].sort().join(", "));

// 6. Questions (qpr) with ${j1} tokens
const r6 = db.exec("SELECT sentence FROM questions WHERE lang='fr' AND game_key='qpr' AND INSTR(sentence, '${j1}') > 0 LIMIT 5");
console.log("\n=== Who Could with ${j1} ===");
if (r6.length) r6[0].values.forEach(v => console.log("  " + v[0].substring(0, 80)));
