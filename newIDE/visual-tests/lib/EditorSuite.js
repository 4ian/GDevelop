// @ts-check

const path = require("path");
const { installSpriteEditorHelpers } = require("./SpriteEditorPageHelpers");
const {
  getPortableBuild,
  getExampleProject,
  launchEditor
} = require("./RealEditor");
const { wait } = require("./SpriteEditorActions");

const DEBUGGING_PORT = 9333;

/**
 * Run the tests using a real, packaged version of the editor: these are smoke
 * tests, only there to catch something badly broken in the real app.
 */
const runEditorSuite = async ({ tests, options, reporter }) => {
  const { binaryPath, version } = await getPortableBuild({
    zipPath: options.gdevelopZipPath,
    branch: options.gdevelopBranch,
    workDirectory: options.workDirectory,
    log: reporter.log
  });

  for (const test of tests) {
    reporter.log("");
    reporter.log(`TEST ${test.name}`);
    if (test.description) reporter.log(`   ${test.description}`);

    const projectPath = test.example
      ? getExampleProject({
          slug: test.example,
          workDirectory: options.workDirectory,
          log: reporter.log
        })
      : null;

    const pageErrors = [];
    let editor = null;
    let result = { failures: [], performed: 0, skipped: 0 };
    try {
      editor = await launchEditor({
        binaryPath,
        projectPath,
        debuggingPort: DEBUGGING_PORT,
        log: reporter.log,
        onPageError: error => {
          const message = error.message || String(error);
          pageErrors.push(
            message +
              (error.stack
                ? "\n" +
                  error.stack
                    .split("\n")
                    .slice(0, 8)
                    .join("\n")
                : "")
          );
        }
      });

      // The helpers are installed in the already loaded page (they can't be
      // installed before, the editor window is opened by the app itself).
      await editor.page.evaluate(
        `(${installSpriteEditorHelpers.toString()})()`
      );

      result = await test.run({
        page: editor.page,
        pageErrors,
        reporter,
        version,
        projectPath,
        options,
        screenshot: async name => {
          await editor.page.screenshot({
            path: path.join(
              reporter.getArtifactsDirectory(),
              `${test.name.replace(/[^a-z0-9]+/gi, "-")}-${name}.png`
            )
          });
        }
      });
    } catch (error) {
      reporter.log(`   ❌ ${error.message || String(error)}`);
      result.failures = [...result.failures, error.message || String(error)];
      if (editor) {
        try {
          await editor.page.screenshot({
            path: path.join(
              reporter.getArtifactsDirectory(),
              `${test.name.replace(/[^a-z0-9]+/gi, "-")}-failure.png`
            )
          });
        } catch (screenshotError) {
          // Ignore: the window may be gone.
        }
      }
    } finally {
      if (editor) {
        await wait(500);
        await editor.stop();
        await wait(1000);
      }
    }

    if (pageErrors.length && !result.failures.length) {
      result.failures.push(`the editor threw: ${pageErrors[0].split("\n")[0]}`);
      reporter.log(`   💥 the editor threw: ${pageErrors[0].split("\n")[0]}`);
    }
    reporter.addResult({ name: test.name, ...result });
  }
};

module.exports = { runEditorSuite };
