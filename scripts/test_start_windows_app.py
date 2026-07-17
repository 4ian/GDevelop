import subprocess
import sys
import tempfile
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
    def test_dry_run_lists_no_launch_build_flow(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPT), "--dry-run", "--no-launch"],
            cwd=ROOT_DIR,
            capture_output=True,
            text=True,
        )

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("DRY RUN", result.stdout)
        self.assertNotIn("Stop existing GDevelop Electron processes", result.stdout)
        self.assertNotIn("Stop stale dev servers on ports 3000 and 5002", result.stdout)
        self.assertIn("Ensure Electron dependencies", result.stdout)
        self.assertIn("Ensure packaged Electron runtime dependencies", result.stdout)
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

    def test_packaged_runtime_installs_when_typescript_is_missing(self):
        module = load_script_module()

        with tempfile.TemporaryDirectory() as temporary_directory:
            runtime_dir = Path(temporary_directory)
            node_modules = runtime_dir / "node_modules"
            node_modules.mkdir()
            (runtime_dir / "package.json").write_text(
                '{"dependencies":{"typescript":"4.9.5"}}', encoding="utf-8"
            )
            (runtime_dir / "package-lock.json").write_text("{}", encoding="utf-8")
            (node_modules / ".package-lock.json").write_text("{}", encoding="utf-8")

            with mock.patch.object(module, "resolve_tool", return_value="npm"):
                with mock.patch.object(module, "run_command") as run_command:
                    module.ensure_packaged_electron_runtime_dependencies(
                        runtime_dir, dry_run=True
                    )

        run_command.assert_called_once_with(
            ["npm", "install"], cwd=runtime_dir, dry_run=True
        )

    def test_packaged_runtime_installs_when_typescript_version_is_wrong(self):
        module = load_script_module()

        with tempfile.TemporaryDirectory() as temporary_directory:
            runtime_dir = Path(temporary_directory)
            typescript_dir = runtime_dir / "node_modules" / "typescript"
            typescript_dir.mkdir(parents=True)
            (runtime_dir / "package.json").write_text(
                '{"dependencies":{"typescript":"4.9.5"}}', encoding="utf-8"
            )
            (runtime_dir / "package-lock.json").write_text("{}", encoding="utf-8")
            (typescript_dir / "package.json").write_text(
                '{"version":"5.9.3"}', encoding="utf-8"
            )
            (runtime_dir / "node_modules" / ".package-lock.json").write_text(
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

    def test_electron_runs_detached_without_inherited_console(self):
        module = load_script_module()
        electron_app_dir = ROOT_DIR / "newIDE" / "electron-app"
        electron_exe = (
            electron_app_dir
            / "node_modules"
            / "electron"
            / "dist"
            / "electron.exe"
        )
        process = mock.Mock(pid=1234)

        with mock.patch.object(module.subprocess, "Popen", return_value=process) as popen:
            launched_process = module.launch_electron(
                electron_app_dir, electron_exe, dry_run=False
            )

        self.assertEqual(launched_process, process.pid)
        self.assertEqual(popen.call_args.args[0], [str(electron_exe), "app"])
        self.assertEqual(popen.call_args.kwargs["cwd"], electron_app_dir)
        self.assertEqual(popen.call_args.kwargs["env"]["ELECTRON_IS_DEV"], "0")
        self.assertIs(popen.call_args.kwargs["stdin"], subprocess.DEVNULL)
        self.assertIs(popen.call_args.kwargs["stdout"], subprocess.DEVNULL)
        self.assertIs(popen.call_args.kwargs["stderr"], subprocess.DEVNULL)
        self.assertEqual(
            popen.call_args.kwargs["creationflags"],
            subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP,
        )


if __name__ == "__main__":
    unittest.main()
