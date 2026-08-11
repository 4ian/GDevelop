import subprocess
import sys
import tempfile
import unittest
from importlib import util
from pathlib import Path
from unittest import mock


ROOT_DIR = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = ROOT_DIR / "scripts"
MACOS_SCRIPTS = (
    SCRIPTS_DIR / "build-macos-app.py",
    SCRIPTS_DIR / "start-macos-app.py",
)


def load_script_module(script: Path):
    module_name = script.stem.replace("-", "_") + "_test_module"
    spec = util.spec_from_file_location(module_name, script)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {script}")
    module = util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class MacosAppDependencyScriptTest(unittest.TestCase):
    def test_dry_runs_include_packaged_runtime_dependency_check(self):
        commands = (
            [
                sys.executable,
                str(SCRIPTS_DIR / "build-macos-app.py"),
                "--dry-run",
                "--no-upload",
                "--skip-build",
            ],
            [
                sys.executable,
                str(SCRIPTS_DIR / "start-macos-app.py"),
                "--dry-run",
                "--no-launch",
                "--skip-build",
            ],
        )
        for command in commands:
            with self.subTest(script=Path(command[1]).name):
                result = subprocess.run(
                    command,
                    cwd=ROOT_DIR,
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                    errors="replace",
                )
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertIn(
                    "Ensure packaged Electron runtime dependencies", result.stdout
                )

    def test_both_scripts_install_when_packaged_typescript_is_missing(self):
        for script in MACOS_SCRIPTS:
            with self.subTest(script=script.name):
                module = load_script_module(script)
                with tempfile.TemporaryDirectory() as temporary_directory:
                    runtime_dir = Path(temporary_directory)
                    node_modules = runtime_dir / "node_modules"
                    node_modules.mkdir()
                    (runtime_dir / "package.json").write_text(
                        '{"dependencies":{"typescript":"4.9.5"}}',
                        encoding="utf-8",
                    )
                    (runtime_dir / "package-lock.json").write_text(
                        "{}", encoding="utf-8"
                    )
                    (node_modules / ".package-lock.json").write_text(
                        "{}", encoding="utf-8"
                    )

                    with mock.patch.object(module, "resolve_tool", return_value="npm"):
                        with mock.patch.object(module, "run_command") as run_command:
                            module.ensure_packaged_electron_runtime_dependencies(
                                runtime_dir, dry_run=True
                            )

                run_command.assert_called_once_with(
                    ["npm", "install"], cwd=runtime_dir, dry_run=True
                )


if __name__ == "__main__":
    unittest.main()
