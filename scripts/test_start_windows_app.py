import subprocess
import sys
import unittest
from importlib import util
from pathlib import Path
from types import SimpleNamespace
from unittest import mock


ROOT_DIR = Path(__file__).resolve().parents[1]
SCRIPT = ROOT_DIR / "scripts" / "start-windows-app.py"


def load_script_module():
    spec = util.spec_from_file_location("start_windows_app", SCRIPT)
    module = util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class StartWindowsAppScriptTest(unittest.TestCase):
    def test_dry_run_lists_full_startup_flow(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPT), "--dry-run", "--no-launch"],
            cwd=ROOT_DIR,
            capture_output=True,
            text=True,
        )

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("DRY RUN", result.stdout)
        self.assertIn("Stop existing GDevelop Electron processes", result.stdout)
        self.assertIn("Stop stale dev servers on ports 3000 and 5002", result.stdout)
        self.assertIn("Ensure Electron dependencies", result.stdout)
        self.assertIn("Build React app", result.stdout)
        self.assertIn("Sync Electron app/www", result.stdout)
        self.assertIn("run build", result.stdout)
        self.assertIn("app-build -- --skip-app-build", result.stdout)
        self.assertNotIn("Fast launch: reusing existing", result.stdout)
        self.assertIn("Skipping launch because --no-launch was set", result.stdout)
        self.assertIn("Verify startup inputs", result.stdout)

    def test_skip_build_keeps_fast_launch_available(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPT), "--dry-run", "--no-launch", "--skip-build"],
            cwd=ROOT_DIR,
            capture_output=True,
            text=True,
        )

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Fast launch: reusing existing newIDE/app/build", result.stdout)
        self.assertIn("Fast launch: reusing existing app/www", result.stdout)
        self.assertNotIn("run build", result.stdout)
        self.assertNotIn("app-build -- --skip-app-build", result.stdout)

    def test_powershell_runner_handles_empty_captured_output(self):
        module = load_script_module()

        completed = SimpleNamespace(stdout=None, stderr=None, returncode=0)
        with mock.patch.object(module.shutil, "which", return_value="powershell"):
            with mock.patch.object(module.subprocess, "run", return_value=completed) as run:
                output = module.run_powershell(
                    "Write-Output 'hello'",
                    cwd=ROOT_DIR,
                    dry_run=False,
                )

        self.assertEqual(output, "")
        self.assertEqual(run.call_args.kwargs["encoding"], "utf-8")
        self.assertEqual(run.call_args.kwargs["errors"], "replace")

    def test_refuses_to_run_as_administrator(self):
        module = load_script_module()

        with mock.patch.object(sys, "argv", [str(SCRIPT), "--dry-run", "--no-launch"]):
            with mock.patch.object(
                module, "is_running_as_administrator", return_value=True
            ):
                with mock.patch.object(module, "stop_existing_processes") as stop:
                    exit_code = module.main()

        # Must exit with an error and must NOT start doing any work.
        self.assertEqual(exit_code, 1)
        stop.assert_not_called()

    def test_admin_error_message_is_actionable(self):
        module = load_script_module()

        with mock.patch.object(
            module, "is_running_as_administrator", return_value=True
        ):
            with mock.patch("builtins.print") as printed:
                module.ensure_not_running_as_administrator()

        printed_text = "\n".join(
            str(call.args[0]) for call in printed.call_args_list if call.args
        )
        self.assertIn("must not be started as Administrator", printed_text)
        self.assertIn("drag-and-drop", printed_text)
        self.assertIn("non-elevated", printed_text)

    def test_normal_user_is_not_blocked(self):
        module = load_script_module()

        # A non-elevated run should pass the guard (returns None, no output).
        with mock.patch.object(
            module, "is_running_as_administrator", return_value=False
        ):
            with mock.patch("builtins.print") as printed:
                result = module.ensure_not_running_as_administrator()

        self.assertIsNone(result)
        printed.assert_not_called()

    def test_stop_process_scripts_are_best_effort(self):
        module = load_script_module()
        electron_exe = (
            ROOT_DIR
            / "newIDE"
            / "electron-app"
            / "node_modules"
            / "electron"
            / "dist"
            / "electron.exe"
        )

        with mock.patch.object(module, "run_powershell") as run_powershell:
            module.stop_existing_processes(ROOT_DIR, electron_exe, dry_run=False)

        electron_stop_script = run_powershell.call_args_list[0].args[0]
        port_stop_script = run_powershell.call_args_list[1].args[0]
        self.assertIn("try {", electron_stop_script)
        self.assertIn("Write-Warning", electron_stop_script)
        self.assertIn("exit 0", electron_stop_script)
        self.assertIn("try {", port_stop_script)
        self.assertIn("Write-Warning", port_stop_script)
        self.assertIn("exit 0", port_stop_script)


if __name__ == "__main__":
    unittest.main()
