#!/usr/bin/env python3
"""Build and start the GDevelop Windows Electron app.

This intentionally uses the production Electron path because the development
server path can hang on this Windows checkout and can race with GDJS resource
regeneration.

Missing or out-of-date npm dependencies are installed automatically before the
build: each package dir gets an ``npm install`` when its ``node_modules`` is
absent or its ``package.json``/``package-lock.json`` is newer than the last
install (so a newly-added dependency does not fail the build with a late
"Can't resolve" error).
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

from libgd_build import LIBGD_VARIANTS, build_libgd, npm_install_needed


DEV_PORTS = (3000, 5002)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fully build, sync, and start the GDevelop Windows app."
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="Path to the GDevelop repository root.",
    )
    parser.add_argument(
        "--build",
        dest="build",
        action="store_true",
        default=True,
        help="Run npm run build before launching. This is the default.",
    )
    parser.add_argument(
        "--skip-build",
        dest="build",
        action="store_false",
        help="Launch faster by reusing the existing libGD.js, newIDE/app/build and app/www.",
    )
    parser.add_argument(
        "--libgd-variant",
        choices=LIBGD_VARIANTS,
        help=(
            "Optional GDevelop.js build variant to pass as --variant=<value>. "
            "For development, --libgd-variant dev links faster."
        ),
    )
    parser.add_argument(
        "--libgd-use-mingw",
        action="store_true",
        help="Build GDevelop.js with npm run build-with-MinGW instead of the default Ninja build.",
    )
    parser.add_argument(
        "--no-launch",
        action="store_true",
        help="Build and sync app/www but do not start Electron.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the planned commands without running them.",
    )
    return parser.parse_args()


def step(title: str) -> None:
    print(f"\n==> {title}", flush=True)


def resolve_tool(name: str) -> str:
    candidates = [f"{name}.cmd", name] if os.name == "nt" else [name]
    for candidate in candidates:
        resolved = shutil.which(candidate)
        if resolved:
            return resolved
    raise RuntimeError(f"Could not find required tool on PATH: {name}")


def command_line(command: list[str]) -> str:
    return " ".join(command)


def run_command(
    command: list[str],
    *,
    cwd: Path,
    dry_run: bool,
    env_updates: dict[str, str] | None = None,
) -> None:
    env = os.environ.copy()
    if env_updates:
        env.update(env_updates)

    print(f"[run] {cwd}> {command_line(command)}", flush=True)
    if dry_run:
        return

    subprocess.run(command, cwd=cwd, env=env, check=True)


def run_powershell(script: str, *, cwd: Path, dry_run: bool) -> str:
    powershell = shutil.which("powershell") or shutil.which("pwsh")
    if not powershell:
        raise RuntimeError("Could not find powershell or pwsh on PATH.")

    command = [
        powershell,
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        script,
    ]
    print(f"[run] {cwd}> powershell -NoProfile -Command <script>", flush=True)
    if dry_run:
        print(script.strip(), flush=True)
        return ""

    result = subprocess.run(
        command,
        cwd=cwd,
        text=True,
        encoding="utf-8",
        errors="replace",
        capture_output=True,
    )
    stdout = result.stdout or ""
    stderr = result.stderr or ""
    if stdout.strip():
        print(stdout.rstrip(), flush=True)
    if stderr.strip():
        print(stderr.rstrip(), file=sys.stderr, flush=True)
    if result.returncode != 0:
        raise RuntimeError(f"PowerShell command failed with exit code {result.returncode}.")
    return stdout


def quote_powershell_string(path: Path | str) -> str:
    return "'" + str(path).replace("'", "''") + "'"


def is_running_as_administrator() -> bool:
    """Return True if the current process has an elevated (Administrator) token.

    Only meaningful on Windows; returns False on other platforms.
    """
    if os.name != "nt":
        return False

    try:
        import ctypes

        # IsUserAnAdmin() returns non-zero when the process runs elevated.
        return bool(ctypes.windll.shell32.IsUserAnAdmin())
    except Exception:
        # If we cannot determine the elevation state, do not block the user.
        return False


def ensure_not_running_as_administrator() -> None:
    """Refuse to run elevated: Administrator breaks drag-and-drop on Windows.

    When GDevelop runs as Administrator (High integrity level), Windows' User
    Interface Privilege Isolation (UIPI) silently blocks drag-and-drop coming
    from normal-integrity processes such as Explorer. The result is that
    dragging an image onto the scene canvas shows the "blocked" cursor and does
    nothing. Running GDevelop as a normal user keeps it at the same integrity
    level as Explorer, so drag-and-drop works. GDevelop does not need
    Administrator rights for normal use.
    """
    if not is_running_as_administrator():
        return

    print(
        "\n".join(
            [
                "ERROR: GDevelop must not be started as Administrator on Windows.",
                "",
                "Running elevated breaks drag-and-drop (e.g. dragging an image onto",
                "the scene canvas): Windows blocks drops from normal programs like",
                "Explorer into an Administrator process (UIPI), so you only get the",
                '"blocked" cursor.',
                "",
                "How to fix: close this window and run the script again from a NORMAL",
                "(non-elevated) terminal. Do NOT use 'Run as administrator'. GDevelop",
                "does not need Administrator rights.",
            ]
        ),
        file=sys.stderr,
        flush=True,
    )


def stop_existing_processes(repo_root: Path, electron_exe: Path, dry_run: bool) -> None:
    step("Stop existing GDevelop Electron processes")
    script = f"""
$electronPath = {quote_powershell_string(electron_exe)}
$processes = Get-Process electron -ErrorAction SilentlyContinue |
  Where-Object {{ $_.Path -eq $electronPath }}

foreach ($process in $processes) {{
  try {{
    Stop-Process -Id $process.Id -Force -ErrorAction Stop
  }} catch {{
    Write-Warning "Could not stop Electron process $($process.Id): $($_.Exception.Message)"
  }}
}}
exit 0
"""
    run_powershell(script, cwd=repo_root, dry_run=dry_run)

    step("Stop stale dev servers on ports 3000 and 5002")
    ports_pattern = "|".join(f":{port}.*LISTENING" for port in DEV_PORTS)
    script = f"""
$owners = netstat -ano |
  Select-String {quote_powershell_string(ports_pattern)} |
  ForEach-Object {{ ($_ -split '\\s+')[-1] }} |
  Sort-Object -Unique

foreach ($owner in $owners) {{
  if ($owner -match '^\\d+$') {{
    try {{
      Stop-Process -Id ([int]$owner) -Force -ErrorAction Stop
    }} catch {{
      Write-Warning "Could not stop process $owner for dev server port cleanup: $($_.Exception.Message)"
    }}
  }}
}}
exit 0
"""
    run_powershell(script, cwd=repo_root, dry_run=dry_run)


def ensure_electron_dependencies(
    repo_root: Path,
    electron_app_dir: Path,
    electron_exe: Path,
    dry_run: bool,
) -> None:
    step("Ensure Electron dependencies")
    needed, reason = npm_install_needed(electron_app_dir)
    if electron_exe.exists() and not needed:
        print(f"Electron executable exists: {electron_exe}", flush=True)
        return

    if not electron_exe.exists():
        reason = "Electron executable is missing"
    print(
        f"electron-app dependencies out of date ({reason}); installing.",
        flush=True,
    )
    run_command([resolve_tool("npm"), "install"], cwd=electron_app_dir, dry_run=dry_run)

    if not dry_run and not electron_exe.exists():
        raise RuntimeError(f"Electron executable still missing after npm install: {electron_exe}")


def ensure_react_app_dependencies(app_dir: Path, dry_run: bool) -> None:
    step("Ensure React app dependencies")
    node_modules = app_dir / "node_modules"
    needed, reason = npm_install_needed(app_dir)
    if not needed:
        print(f"React app dependencies present: {node_modules}", flush=True)
        return

    print(
        f"React app dependencies out of date ({reason}); running npm install in newIDE/app.",
        flush=True,
    )
    run_command([resolve_tool("npm"), "install"], cwd=app_dir, dry_run=dry_run)

    if not dry_run and not node_modules.exists():
        raise RuntimeError(f"React app node_modules still missing after npm install: {node_modules}")


def build_react_app(app_dir: Path, build: bool, dry_run: bool) -> None:
    step("Build React app")
    if not build:
        print(
            "Fast launch: reusing existing newIDE/app/build because --skip-build was set.",
            flush=True,
        )
        return

    run_command([resolve_tool("npm"), "run", "build"], cwd=app_dir, dry_run=dry_run)


def sync_electron_www(electron_app_dir: Path, build: bool, dry_run: bool) -> None:
    step("Sync Electron app/www")
    if not build:
        print(
            "Fast launch: reusing existing app/www because --skip-build was set.",
            flush=True,
        )
        return

    run_command(
        [
            resolve_tool("npm"),
            "run",
            "app-build",
            "--",
            "--skip-app-build",
            "--allow-development-libgd",
        ],
        cwd=electron_app_dir,
        dry_run=dry_run,
    )


def launch_electron(
    electron_app_dir: Path, electron_exe: Path, dry_run: bool
) -> subprocess.Popen[bytes] | None:
    step("Launch Electron")
    command = [str(electron_exe), "app"]
    print(
        f"[run] {electron_app_dir}> ELECTRON_IS_DEV=0 {command_line(command)}",
        flush=True,
    )
    if dry_run:
        return None

    env = os.environ.copy()
    env["ELECTRON_IS_DEV"] = "0"
    process = subprocess.Popen(
        command,
        cwd=electron_app_dir,
        env=env,
    )
    print(f"Started Electron process PID: {process.pid}", flush=True)
    print("Electron console logs will stream below.", flush=True)
    return process


def wait_for_electron(process: subprocess.Popen[bytes]) -> None:
    step("Run Electron in foreground")
    print("Waiting for Electron to exit. Press Ctrl+C to stop it.", flush=True)
    return_code = process.wait()
    if return_code != 0:
        raise RuntimeError(f"Electron exited with code {return_code}.")


def verify_inputs(
    repo_root: Path,
    electron_app_dir: Path,
    electron_exe: Path,
    dry_run: bool,
    check_dev_ports: bool = True,
) -> None:
    step("Verify startup inputs")
    www_index = electron_app_dir / "app" / "www" / "index.html"
    print(f"Electron executable: {electron_exe}", flush=True)
    print(f"Electron app index: {www_index}", flush=True)
    if dry_run:
        return

    if not electron_exe.exists():
        raise RuntimeError(f"Electron executable missing: {electron_exe}")
    if not www_index.exists():
        raise RuntimeError(f"Electron app index missing: {www_index}")

    if not check_dev_ports:
        return

    ports_pattern = "|".join(f":{port}.*LISTENING" for port in DEV_PORTS)
    script = f"""
$ports = netstat -ano | Select-String {quote_powershell_string(ports_pattern)}
if ($ports) {{
  $ports
  Write-Error 'Unexpected dev server port listener found.'
  exit 1
}}
"""
    run_powershell(script, cwd=repo_root, dry_run=dry_run)


def verify_electron_started(repo_root: Path, electron_exe: Path, dry_run: bool) -> None:
    step("Verify Electron window")
    if dry_run:
        print("Dry run: not checking live Electron processes.", flush=True)
        return

    time.sleep(5)
    script = f"""
$electronPath = {quote_powershell_string(electron_exe)}
$windows = Get-Process electron -ErrorAction SilentlyContinue |
  Where-Object {{ $_.Path -eq $electronPath -and $_.MainWindowTitle -like 'GDevelop 6*' }}
if (!$windows) {{
  Get-Process electron -ErrorAction SilentlyContinue |
    Where-Object {{ $_.Path -eq $electronPath }} |
    Select-Object Id,MainWindowTitle,StartTime |
    Format-Table -AutoSize
  Write-Error 'Could not find a GDevelop 6 Electron window.'
  exit 1
}}
$windows | Select-Object Id,MainWindowTitle,StartTime | Format-Table -AutoSize
"""
    run_powershell(script, cwd=repo_root, dry_run=dry_run)


def main() -> int:
    args = parse_args()

    # Refuse to run elevated: Administrator breaks drag-and-drop on Windows
    # (see ensure_not_running_as_administrator). Checked before doing any work.
    if is_running_as_administrator():
        ensure_not_running_as_administrator()
        return 1

    repo_root = args.repo_root.resolve()
    app_dir = repo_root / "newIDE" / "app"
    electron_app_dir = repo_root / "newIDE" / "electron-app"
    electron_exe = electron_app_dir / "node_modules" / "electron" / "dist" / "electron.exe"

    if args.dry_run:
        print("DRY RUN: no commands will be executed.", flush=True)

    build = args.build

    try:
        ensure_electron_dependencies(repo_root, electron_app_dir, electron_exe, args.dry_run)
        ensure_react_app_dependencies(app_dir, args.dry_run)
        build_libgd(
            repo_root,
            skip_build=not build,
            variant=args.libgd_variant,
            use_mingw=args.libgd_use_mingw,
            dry_run=args.dry_run,
            required=False,
            auto_install_emscripten=False,
            skip_message="Fast launch: reusing existing libGD.js because --skip-build was set.",
        )
        build_react_app(app_dir, build, args.dry_run)
        sync_electron_www(electron_app_dir, build, args.dry_run)

        if args.no_launch:
            step("Launch Electron")
            print("Skipping launch because --no-launch was set.", flush=True)
            verify_inputs(
                repo_root,
                electron_app_dir,
                electron_exe,
                args.dry_run,
                check_dev_ports=False,
            )
        else:
            # Keep the currently running app open while the build runs. Only
            # stop it after the rebuilt app artifacts are ready to launch.
            verify_inputs(
                repo_root,
                electron_app_dir,
                electron_exe,
                args.dry_run,
                check_dev_ports=False,
            )
            stop_existing_processes(repo_root, electron_exe, args.dry_run)
            verify_inputs(repo_root, electron_app_dir, electron_exe, args.dry_run)
            electron_process = launch_electron(
                electron_app_dir, electron_exe, args.dry_run
            )
            verify_electron_started(repo_root, electron_exe, args.dry_run)
            if electron_process is not None:
                wait_for_electron(electron_process)
    except (RuntimeError, subprocess.CalledProcessError) as error:
        print(f"ERROR: {error}", file=sys.stderr, flush=True)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
