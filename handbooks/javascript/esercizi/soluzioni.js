'use strict';
// ESEMPI DI SOLUZIONE — prova prima a farli senza guardare!
const assert = require('node:assert/strict');
function describeValue(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'number' && Number.isNaN(value)) return 'NaN';
  return typeof value;
}
function evenSquares(numbers) { return numbers.filter(n => n % 2 === 0).map(n => n*n); }
function fullName(user) { return `${user?.name ?? 'Sconosciuto'} ${user?.surname ?? ''}`.trim(); }
function makeCounter(initial = 0) {
  let n = initial;
  return { inc: () => ++n, dec: () => --n, value: () => n };
}
function sumNested(array) { return array.reduce((s, item) =>
  s + (Array.isArray(item) ? sumNested(item) : item), 0); }
function wordFrequency(words) {
  const freq = new Map();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  return freq;
}
function sameInstant(a, b) { return a.getTime() === b.getTime(); }
class BankAccount {
  #balance;
  constructor(initial = 0) {
    if (!Number.isFinite(initial) || initial < 0) throw new RangeError('saldo');
    this.#balance = initial;
  }
  get balance() { return this.#balance; }
  deposit(n) { if (!Number.isFinite(n) || n <= 0) throw new RangeError('importo'); this.#balance += n; }
  withdraw(n) { if (!Number.isFinite(n) || n <= 0 || n > this.#balance) throw new RangeError('importo'); this.#balance -= n; }
}
function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function loadJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
function hashtags(text) { return [...text.matchAll(/#([\p{L}\p{N}_]+)/gu)].map(m => m[1]); }

assert.equal(describeValue(null), 'null');
assert.equal(describeValue(NaN), 'NaN');
assert.deepEqual(evenSquares([1,2,3,4]), [4,16]);
assert.equal(fullName({ name: 'Ada', surname: 'Lovelace' }), 'Ada Lovelace');
const c = makeCounter(3); assert.equal(c.inc(), 4); assert.equal(c.dec(), 3);
assert.equal(sumNested([1, [2, [3]]]), 6);
assert.equal(wordFrequency(['a','b','a']).get('a'), 2);
assert.equal(sameInstant(new Date(0), new Date(0)), true);
const b = new BankAccount(10); b.deposit(5); b.withdraw(3); assert.equal(b.balance, 12);
assert.deepEqual(hashtags('hey #js #coding'), ['js','coding']);
assert.equal(typeof wait, 'function');
assert.equal(typeof loadJSON, 'function');
console.log('Esercizi testati: OK.');
