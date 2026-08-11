import json
import os
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
IMPORT_LIBGD_SCRIPT = ROOT_DIR / "newIDE" / "app" / "scripts" / "import-libGD.js"


class ImportLibGdScriptTest(unittest.TestCase):
    def test_reuses_complete_cache_without_trying_to_download(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            fake_root = Path(temporary_directory)
            fake_app = fake_root / "newIDE" / "app"
            fake_scripts = fake_app / "scripts"
            fake_public = fake_app / "public"
            fake_test_module = fake_app / "node_modules" / "libGD.js-for-tests-only"

            fake_scripts.mkdir(parents=True)
            fake_public.mkdir(parents=True)
            fake_test_module.mkdir(parents=True)

            (fake_public / "libGD.js").write_text("// cached libGD.js")
            (fake_public / "libGD.wasm").write_bytes(b"cached wasm")
            (fake_test_module / "index.js").write_text("// cached test module")
            (fake_test_module / "libGD.wasm").write_bytes(b"cached test wasm")

            node_harness = r"""
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const fakeScriptsDir = process.env.FAKE_SCRIPTS_DIR;
process.chdir(fakeScriptsDir);

const logs = [];
const downloads = [];
const execs = [];

const resolveFromCwd = filePath => path.resolve(process.cwd(), filePath);
const shell = {
  test(flag, filePath) {
    if (flag !== '-f') throw new Error(`Unexpected shell.test flag: ${flag}`);
    return fs.existsSync(resolveFromCwd(filePath));
  },
  mkdir(...args) {
    const filePath = args[args.length - 1];
    fs.mkdirSync(resolveFromCwd(filePath), { recursive: true });
    return { stderr: '' };
  },
  echo(message) {
    logs.push(String(message));
  },
  exec(command) {
    execs.push(command);
    return { stdout: '', stderr: '', code: 1 };
  },
  cp(source, destination) {
    fs.copyFileSync(resolveFromCwd(source), resolveFromCwd(destination));
    return { stderr: '' };
  },
  exit(code) {
    throw new Error(`Unexpected shell.exit(${code})`);
  },
};

const downloadLocalFile = (...args) => {
  downloads.push(args);
  throw new Error('downloadLocalFile should not be called when libGD.js cache is complete');
};

const context = {
  console,
  process,
  __dirname: fakeScriptsDir,
  require(moduleName) {
    if (moduleName === 'shelljs') return shell;
    if (moduleName === './lib/DownloadLocalFile') return { downloadLocalFile };
    return require(moduleName);
  },
};

const source = fs.readFileSync(process.env.IMPORT_LIBGD_SCRIPT, 'utf8');
vm.runInNewContext(source, context, { filename: process.env.IMPORT_LIBGD_SCRIPT });

setImmediate(() => {
  console.log(JSON.stringify({ logs, downloads, execs }));
});
"""

            env = os.environ.copy()
            env["FAKE_SCRIPTS_DIR"] = str(fake_scripts)
            env["IMPORT_LIBGD_SCRIPT"] = str(IMPORT_LIBGD_SCRIPT)
            env.pop("APPVEYOR", None)
            env.pop("REQUIRES_EXACT_LIBGD_JS_VERSION", None)

            result = subprocess.run(
                ["node", "-e", node_harness],
                cwd=ROOT_DIR,
                env=env,
                capture_output=True,
                text=True,
            )

        self.assertEqual(result.returncode, 0, result.stderr)
        output = json.loads(result.stdout)
        self.assertEqual(output["downloads"], [])
        self.assertEqual(output["execs"], [])
        self.assertFalse(
            any("Downloading pre-built libGD.js" in message for message in output["logs"])
        )
        self.assertTrue(
            any("Reusing existing libGD.js" in message for message in output["logs"])
        )


if __name__ == "__main__":
    unittest.main()
