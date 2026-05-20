import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatMinorToDisplay,
  formatMinorForLocale,
  parseDecimalStringToMinor,
  minorExponentFor,
} from './money.mjs';

test('minorExponentFor known currencies', () => {
  assert.equal(minorExponentFor('usd'), 2);
  assert.equal(minorExponentFor('JPY'), 0);
});

test('parseDecimalStringToMinor USD happy path', () => {
  assert.equal(parseDecimalStringToMinor('12.34', 'USD'), 1234n);
  assert.equal(parseDecimalStringToMinor('0.01', 'USD'), 1n);
  assert.equal(parseDecimalStringToMinor('100', 'USD'), 10000n);
});

test('parseDecimalStringToMinor rejects invalid', () => {
  assert.throws(() => parseDecimalStringToMinor('', 'USD'));
  assert.throws(() => parseDecimalStringToMinor('0', 'USD'));
  assert.throws(() => parseDecimalStringToMinor('1e3', 'USD'));
  assert.throws(() => parseDecimalStringToMinor('12.345', 'USD'));
});

test('formatMinorToDisplay round trip', () => {
  const m = parseDecimalStringToMinor('0.99', 'USD');
  assert.equal(formatMinorToDisplay(m, 'USD'), '0.99');
});

test('formatMinorForLocale USD', () => {
  assert.match(formatMinorForLocale(1234n, 'USD'), /\$12\.34/);
});
