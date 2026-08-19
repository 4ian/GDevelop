// @ts-check

const fs = require("fs");
const path = require("path");

/**
 * Collects everything the run says, so that it ends up both on the console and
 * in a log file stored with the artifacts (screenshots) of the run.
 */
const makeReporter = ({ artifactsDirectory, logFileName }) => {
  const lines = [];
  const results = [];

  fs.mkdirSync(artifactsDirectory, { recursive: true });

  const log = message => {
    const line = `${new Date().toISOString().slice(11, 19)}  ${message}`;
    console.log(line);
    lines.push(line);
  };

  const addResult = ({ name, failures, performed, skipped }) => {
    results.push({ name, failures, performed, skipped });
    log(
      `   ${performed} manipulations performed, ${skipped} skipped, ` +
        (failures.length
          ? `❌ ${failures.length} problem(s)`
          : "✅ no crash, and the editor stayed consistent")
    );
  };

  const writeSummary = () => {
    const failed = results.filter(result => result.failures.length);
    const performed = results.reduce(
      (total, result) => total + result.performed,
      0
    );
    log("");
    log(
      "================================ SUMMARY ================================"
    );
    results.forEach(result =>
      log(
        `${result.failures.length ? "❌" : "✅"} ${result.name}: ` +
          `${result.performed} manipulations` +
          (result.failures.length ? ` - ${result.failures[0]}` : "")
      )
    );
    log(
      `${results.length - failed.length}/${results.length} passed, ` +
        `${performed} manipulations performed in total.`
    );

    fs.writeFileSync(
      path.join(artifactsDirectory, logFileName),
      lines.join("\n") + "\n"
    );
    fs.writeFileSync(
      path.join(artifactsDirectory, logFileName.replace(/\.log$/, ".json")),
      JSON.stringify({ results }, null, 2)
    );
    return failed.length === 0;
  };

  return {
    log,
    addResult,
    writeSummary,
    getArtifactsDirectory: () => artifactsDirectory
  };
};

module.exports = { makeReporter };
