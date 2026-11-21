/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

/**
 * Pure helpers for `harness.assertClose`. The gameplay test runner uses the
 * same functions (keep this file and `gameplay-test-runner.ts` in sync).
 * Loaded as a CommonJS module by the standalone Node tests.
 *
 * @param {number} actual
 * @param {number} expected
 * @param {number} tolerance
 * @returns {boolean}
 */
function numbersAreClose(actual, expected, tolerance) {
  return (
    typeof actual === 'number' &&
    typeof expected === 'number' &&
    Number.isFinite(actual) &&
    Number.isFinite(expected) &&
    isValidAssertCloseTolerance(tolerance) &&
    Math.abs(actual - expected) <= tolerance
  );
}

/**
 * A usable `assertClose` tolerance: finite and not negative.
 * @param {unknown} tolerance
 * @returns {boolean}
 */
function isValidAssertCloseTolerance(tolerance) {
  return (
    typeof tolerance === 'number' &&
    Number.isFinite(tolerance) &&
    tolerance >= 0
  );
}

/**
 * Failure message for a numeric comparison that was not close enough.
 * @param {string} message
 * @param {number} actual
 * @param {number} expected
 * @param {number} tolerance
 * @returns {string}
 */
function formatAssertCloseMessage(message, actual, expected, tolerance) {
  return (
    message +
    ' (actual: ' +
    actual +
    ', expected: ' +
    expected +
    ', tolerance: ' +
    tolerance +
    ')'
  );
}

/**
 * Message when `tolerance` is negative or not finite.
 * @param {string} message
 * @param {unknown} tolerance
 * @returns {string}
 */
function formatInvalidAssertCloseToleranceMessage(message, tolerance) {
  return (
    message +
    ' (tolerance must be a finite, non-negative number, got ' +
    tolerance +
    ')'
  );
}

/**
 * Decide an `assertClose` verdict without throwing.
 * @param {number} actual
 * @param {number} expected
 * @param {number} tolerance
 * @param {string} message
 * @returns {{kind: 'pass' | 'fail' | 'invalid-tolerance', passed: boolean, message: string}}
 */
function evaluateAssertClose(actual, expected, tolerance, message) {
  if (!isValidAssertCloseTolerance(tolerance)) {
    return {
      kind: 'invalid-tolerance',
      passed: false,
      message: formatInvalidAssertCloseToleranceMessage(message, tolerance),
    };
  }
  if (numbersAreClose(actual, expected, tolerance)) {
    return { kind: 'pass', passed: true, message: message };
  }
  return {
    kind: 'fail',
    passed: false,
    message: formatAssertCloseMessage(message, actual, expected, tolerance),
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    numbersAreClose: numbersAreClose,
    isValidAssertCloseTolerance: isValidAssertCloseTolerance,
    formatAssertCloseMessage: formatAssertCloseMessage,
    formatInvalidAssertCloseToleranceMessage:
      formatInvalidAssertCloseToleranceMessage,
    evaluateAssertClose: evaluateAssertClose,
  };
}
