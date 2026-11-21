'use strict';

/**
 * Standalone Node tests for the pure assertClose helpers.
 * Run with: Tests/run_assert_close_tests.sh
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const helperPath = path.join(
  __dirname,
  '..',
  'GDJS',
  'Runtime',
  'gameplay-tests',
  'assert-close.js'
);

const {
  numbersAreClose,
  isValidAssertCloseTolerance,
  formatAssertCloseMessage,
  formatInvalidAssertCloseToleranceMessage,
  evaluateAssertClose,
} = require(helperPath);

test('numbersAreClose: equal values are within a zero tolerance', () => {
  assert.equal(numbersAreClose(10, 10, 0), true);
});

test('numbersAreClose: passes at the exact tolerance boundary', () => {
  assert.equal(numbersAreClose(10.5, 10, 0.5), true);
  assert.equal(numbersAreClose(10, 10.5, 0.5), true);
  assert.equal(numbersAreClose(-2, -2.25, 0.25), true);
});

test('numbersAreClose: fails just outside the tolerance', () => {
  assert.equal(numbersAreClose(10.5000001, 10, 0.5), false);
  assert.equal(numbersAreClose(1, 2, 0.5), false);
});

test('numbersAreClose: NaN is never close to anything, including NaN', () => {
  assert.equal(numbersAreClose(NaN, NaN, 0), false);
  assert.equal(numbersAreClose(NaN, 0, 1), false);
  assert.equal(numbersAreClose(0, NaN, 1), false);
});

test('numbersAreClose: Infinity and -Infinity are not close, even to themselves', () => {
  assert.equal(numbersAreClose(Infinity, Infinity, 0), false);
  assert.equal(numbersAreClose(-Infinity, -Infinity, 1), false);
  assert.equal(numbersAreClose(Infinity, -Infinity, Infinity), false);
  assert.equal(numbersAreClose(0, Infinity, Infinity), false);
});

test('isValidAssertCloseTolerance: rejects negative and non-finite tolerances', () => {
  assert.equal(isValidAssertCloseTolerance(0), true);
  assert.equal(isValidAssertCloseTolerance(0.5), true);
  assert.equal(isValidAssertCloseTolerance(-0.1), false);
  assert.equal(isValidAssertCloseTolerance(NaN), false);
  assert.equal(isValidAssertCloseTolerance(Infinity), false);
  assert.equal(isValidAssertCloseTolerance(-Infinity), false);
});

test('formatAssertCloseMessage includes the author message and the three values', () => {
  assert.equal(
    formatAssertCloseMessage('Player X', 10.5, 10, 0.25),
    'Player X (actual: 10.5, expected: 10, tolerance: 0.25)'
  );
});

test('evaluateAssertClose: pass records the author message only', () => {
  const verdict = evaluateAssertClose(100, 100.4, 0.5, 'Near the spawn');
  assert.equal(verdict.kind, 'pass');
  assert.equal(verdict.passed, true);
  assert.equal(verdict.message, 'Near the spawn');
});

test('evaluateAssertClose: fail includes actual, expected and tolerance', () => {
  const verdict = evaluateAssertClose(12, 10, 0.5, 'Player X');
  assert.equal(verdict.kind, 'fail');
  assert.equal(verdict.passed, false);
  assert.equal(
    verdict.message,
    'Player X (actual: 12, expected: 10, tolerance: 0.5)'
  );
});

test('evaluateAssertClose: NaN is a failed comparison, not an invalid tolerance', () => {
  const verdict = evaluateAssertClose(NaN, NaN, 0, 'Timer');
  assert.equal(verdict.kind, 'fail');
  assert.equal(verdict.passed, false);
  assert.match(verdict.message, /Timer/);
  assert.match(verdict.message, /NaN/);
});

test('evaluateAssertClose: negative or non-finite tolerance is invalid', () => {
  const negative = evaluateAssertClose(1, 1, -1, 'Speed');
  assert.equal(negative.kind, 'invalid-tolerance');
  assert.equal(negative.passed, false);
  assert.match(negative.message, /Speed/);
  assert.match(negative.message, /-1/);

  const infinite = evaluateAssertClose(1, 1, Infinity, 'Speed');
  assert.equal(infinite.kind, 'invalid-tolerance');
  assert.equal(infinite.passed, false);

  const nanTolerance = evaluateAssertClose(1, 1, NaN, 'Speed');
  assert.equal(nanTolerance.kind, 'invalid-tolerance');
  assert.equal(nanTolerance.passed, false);
  assert.equal(
    nanTolerance.message,
    formatInvalidAssertCloseToleranceMessage('Speed', NaN)
  );
});
