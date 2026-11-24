// @ts-check

const fs = require('fs');
const path = require('path');
const { knownIssues } = require('./KnownIssues');

const escapeXml = text =>
  String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Collects everything the run says: on the console, in a log file stored with
 * the screenshots, and optionally as a JUnit file (which the CI uses to show
 * the results and to balance the tests across the parallel containers).
 */
const makeReporter = ({
  artifactsDirectory,
  logFileName,
  junitPath,
  suiteName,
}) => {
  const lines = [];
  const results = [];
  let lastResultAt = Date.now();

  fs.mkdirSync(artifactsDirectory, { recursive: true });

  const log = message => {
    const line = `${new Date().toISOString().slice(11, 19)}  ${message}`;
    console.log(line);
    lines.push(line);
  };

  const addResult = ({ name, failures, performed, skipped, knownIssues }) => {
    results.push({
      name,
      // The name of the test, without the seed of the random session: this is
      // what the CI splits the tests by, and what it records durations for.
      testName: name.replace(/ \(seed \d+\)$/, ''),
      failures,
      performed,
      skipped,
      knownIssues: knownIssues || [],
      durationInSeconds: (Date.now() - lastResultAt) / 1000,
    });
    lastResultAt = Date.now();
    log(
      `   ${performed} manipulations performed, ${skipped} skipped, ` +
        (failures.length
          ? `❌ ${failures.length} problem(s)`
          : (knownIssues || []).length
          ? '⚠️ stopped by a known issue'
          : '✅ no crash, and the editor stayed consistent')
    );
  };

  const writeJunit = () => {
    if (!junitPath) return;
    const testCases = results
      .map(result => {
        const attributes =
          `classname="${escapeXml(suiteName)}" ` +
          `name="${escapeXml(result.name)}" ` +
          `file="${escapeXml(result.testName)}" ` +
          `time="${result.durationInSeconds.toFixed(1)}"`;
        if (result.failures.length)
          return (
            `    <testcase ${attributes}>\n` +
            `      <failure message="${escapeXml(result.failures[0])}">` +
            `${escapeXml(result.failures.join('\n'))}</failure>\n` +
            `    </testcase>`
          );
        if (result.knownIssues.length)
          return (
            `    <testcase ${attributes}>\n` +
            `      <skipped message="${escapeXml(result.knownIssues[0])}"/>\n` +
            `    </testcase>`
          );
        return `    <testcase ${attributes}/>`;
      })
      .join('\n');
    const failuresCount = results.filter(result => result.failures.length)
      .length;
    fs.mkdirSync(path.dirname(junitPath), { recursive: true });
    fs.writeFileSync(
      junitPath,
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<testsuites>\n` +
        `  <testsuite name="${escapeXml(suiteName)}" tests="${
          results.length
        }" failures="${failuresCount}">\n${testCases}\n  </testsuite>\n` +
        `</testsuites>\n`
    );
  };

  const writeSummary = () => {
    const failed = results.filter(result => result.failures.length);
    const withKnownIssues = results.filter(
      result => !result.failures.length && result.knownIssues.length
    );
    const performed = results.reduce(
      (total, result) => total + result.performed,
      0
    );
    log('');
    log(
      '================================ SUMMARY ================================'
    );
    results.forEach(result =>
      log(
        `${
          result.failures.length
            ? '❌'
            : result.knownIssues.length
            ? '⚠️'
            : '✅'
        } ${result.name}: ${result.performed} manipulations` +
          (result.failures.length ? ` - ${result.failures[0]}` : '') +
          (!result.failures.length && result.knownIssues.length
            ? ` - ${result.knownIssues[0]}`
            : '')
      )
    );
    log(
      `${results.length - failed.length - withKnownIssues.length}/${
        results.length
      } passed, ${performed} manipulations performed in total.`
    );
    if (withKnownIssues.length) {
      log('');
      log(
        `${
          withKnownIssues.length
        } test(s) were stopped by a known issue (see ` +
          'lib/KnownIssues.js), which does not fail the run:'
      );
      knownIssues.forEach(issue =>
        log(`- ${issue.name}: ${issue.explanation}`)
      );
    }

    fs.writeFileSync(
      path.join(artifactsDirectory, logFileName),
      lines.join('\n') + '\n'
    );
    fs.writeFileSync(
      path.join(artifactsDirectory, logFileName.replace(/\.log$/, '.json')),
      JSON.stringify({ results }, null, 2)
    );
    writeJunit();
    return failed.length === 0;
  };

  const getScreenshotPath = name =>
    path.join(artifactsDirectory, `${name.replace(/[^a-z0-9]+/gi, '-')}.png`);

  return {
    log,
    addResult,
    writeSummary,
    getScreenshotPath,
  };
};

module.exports = { makeReporter };
