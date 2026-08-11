#!/usr/bin/env python3
"""Build and run the GDevelop web editor in the foreground.

This is the browser counterpart of ``start-windows-app.py``. It prepares the
same local libGD.js and React dependencies, then starts the existing
``newIDE/app`` web workflow:

* the React editor on http://127.0.0.1:3000;
* the watched GDJS runtime on http://127.0.0.1:5002.

The editor and runtime servers run in the foreground so their logs stay visible.
Press Ctrl+C to stop the complete process tree. Use ``--skip-build`` to reuse
the existing libGD.js for a faster launch.
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from libgd_build import LIBGD_VARIANTS, build_libgd, npm_install_needed


EDITOR_PORT = 3000
RUNTIME_PORT = 5002
DEFAULT_HOST = "127.0.0.1"
SERVER_START_TIMEOUT_SECONDS = 180


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build and start the GDevelop web editor locally."
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
        help="Build libGD.js before starting. This is the default.",
    )
    parser.add_argument(
        "--skip-build",
        dest="build",
        action="store_false",
        help="Start faster by reusing the existing libGD.js.",
    )
    parser.add_argument(
        "--libgd-variant",
        choices=LIBGD_VARIANTS,
        help="Optional GDevelop.js build variant to pass as --variant=<value>.",
    )
    parser.add_argument(
        "--libgd-use-mingw",
        action="store_true",
        help="Build GDevelop.js with npm run build-with-MinGW.",
    )
    parser.add_argument(
        "--host",
        default=DEFAULT_HOST,
        help=f"Host used by the React development server. Defaults to {DEFAULT_HOST}.",
    )
    parser.add_argument(
        "--no-launch",
        action="store_true",
        help="Prepare dependencies/libGD.js but do not start the web servers.",
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


def run_command(command: list[str], *, cwd: Path, dry_run: bool) -> None:
    print(f"[run] {cwd}> {command_line(command)}", flush=True)
    if dry_run:
        return
    subprocess.run(command, cwd=cwd, check=True)


def quote_powershell_string(value: Path | str) -> str:
    return "'" + str(value).replace("'", "''") + "'"


def run_powershell(script: str, *, cwd: Path, dry_run: bool) -> None:
    powershell = shutil.which("powershell") or shutil.which("pwsh")
    if not powershell:
        raise RuntimeError("Could not find powershell or pwsh on PATH.")

    print(f"[run] {cwd}> powershell -NoProfile -Command <script>", flush=True)
    if dry_run:
        print(script.strip(), flush=True)
        return

    result = subprocess.run(
        [
            powershell,
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-Command",
            script,
        ],
        cwd=cwd,
        text=True,
        encoding="utf-8",
        errors="replace",
        capture_output=True,
    )
    if result.stdout and result.stdout.strip():
        print(result.stdout.rstrip(), flush=True)
    if result.stderr and result.stderr.strip():
        print(result.stderr.rstrip(), file=sys.stderr, flush=True)
    if result.returncode != 0:
        raise RuntimeError(
            f"PowerShell command failed with exit code {result.returncode}."
        )


def stop_existing_web_servers(repo_root: Path, dry_run: bool) -> None:
    step("Stop stale GDevelop web servers on ports 3000 and 5002")
    ports_pattern = "|".join(
        f":{port}.*LISTENING" for port in (EDITOR_PORT, RUNTIME_PORT)
    )
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
      Write-Warning "Could not stop process ${{owner}}: $($_.Exception.Message)"
    }}
  }}
}}
exit 0
"""
    run_powershell(script, cwd=repo_root, dry_run=dry_run)


def ensure_react_app_dependencies(app_dir: Path, dry_run: bool) -> None:
    step("Ensure React app dependencies")
    needed, reason = npm_install_needed(app_dir)
    if not needed:
        print(f"React app dependencies present: {app_dir / 'node_modules'}")
        return

    print(
        f"React app dependencies out of date ({reason}); running npm install.",
        flush=True,
    )
    run_command([resolve_tool("npm"), "install"], cwd=app_dir, dry_run=dry_run)

    if not dry_run and not (app_dir / "node_modules").is_dir():
        raise RuntimeError("React app node_modules is still missing after npm install.")


def launch_web_servers(
    app_dir: Path,
    *,
    host: str,
    dry_run: bool,
) -> subprocess.Popen[bytes] | None:
    step("Launch GDevelop web editor")
    command = [resolve_tool("npm"), "start"]
    print(
        f"[run] {app_dir}> HOST={host} PORT={EDITOR_PORT} "
        f"BROWSER=none {command_line(command)}",
        flush=True,
    )
    if dry_run:
        return None

    env = os.environ.copy()
    env.update(
        {
            "BROWSER": "none",
            "HOST": host,
            "PORT": str(EDITOR_PORT),
        }
    )
    creation_flags = (
        subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0
    )
    process = subprocess.Popen(
        command,
        cwd=app_dir,
        env=env,
        creationflags=creation_flags,
    )
    print(f"Started web server process PID: {process.pid}", flush=True)
    print("Web editor logs will stream below.", flush=True)
    return process


def is_url_ready(url: str) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=2) as response:
            return 200 <= response.status < 500
    except (urllib.error.URLError, TimeoutError, ConnectionError):
        return False


def verify_web_servers_started(
    process: subprocess.Popen[bytes],
    *,
    host: str,
    dry_run: bool,
    timeout_seconds: int = SERVER_START_TIMEOUT_SECONDS,
) -> None:
    step("Verify web editor servers")
    editor_url = f"http://{host}:{EDITOR_PORT}"
    runtime_url = f"http://{host}:{RUNTIME_PORT}"
    print(f"Editor URL: {editor_url}", flush=True)
    print(f"GDJS runtime URL: {runtime_url}", flush=True)
    if dry_run:
        return

    deadline = time.monotonic() + timeout_seconds
    while time.monotonic() < deadline:
        return_code = process.poll()
        if return_code is not None:
            raise RuntimeError(
                f"Web server process exited before becoming ready (code {return_code})."
            )
        if is_url_ready(editor_url) and is_url_ready(runtime_url):
            print("GDevelop web editor and GDJS runtime are ready.", flush=True)
            return
        time.sleep(1)

    raise RuntimeError(
        f"Timed out waiting for {editor_url} and {runtime_url}."
    )


def stop_process_tree(process: subprocess.Popen[bytes]) -> None:
    if process.poll() is not None:
        return

    if os.name == "nt":
        subprocess.run(
            ["taskkill", "/PID", str(process.pid), "/T", "/F"],
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    else:
        process.terminate()


def was_ctrl_c_pressed() -> bool:
    """Consume a literal Ctrl+C key if the Windows terminal provides one."""
    if os.name != "nt" or not sys.stdin.isatty():
        return False

    import msvcrt

    ctrl_c_pressed = False
    while msvcrt.kbhit():
        if msvcrt.getwch() == "\x03":
            ctrl_c_pressed = True
    return ctrl_c_pressed


def wait_for_web_servers(process: subprocess.Popen[bytes]) -> None:
    step("Run web editor in foreground")
    print(
        "GDevelop is running in the foreground. Press Ctrl+C to stop it.",
        flush=True,
    )
    try:
        while True:
            if was_ctrl_c_pressed():
                raise KeyboardInterrupt
            try:
                return_code = process.wait(timeout=0.1)
                break
            except subprocess.TimeoutExpired:
                continue
    except KeyboardInterrupt:
        print("\nStopping GDevelop web editor...", flush=True)
        stop_process_tree(process)
        return

    if return_code != 0:
        raise RuntimeError(f"Web server process exited with code {return_code}.")


def main() -> int:
    args = parse_args()
    repo_root = args.repo_root.resolve()
    app_dir = repo_root / "newIDE" / "app"

    if args.dry_run:
        print("DRY RUN: no commands will be executed.", flush=True)

    try:
        ensure_react_app_dependencies(app_dir, args.dry_run)
        build_libgd(
            repo_root,
            skip_build=not args.build,
            variant=args.libgd_variant,
            use_mingw=args.libgd_use_mingw,
            dry_run=args.dry_run,
            required=False,
            auto_install_emscripten=False,
            skip_message=(
                "Fast launch: reusing existing libGD.js because "
                "--skip-build was set."
            ),
        )

        if args.no_launch:
            step("Launch GDevelop web editor")
            print("Skipping launch because --no-launch was set.", flush=True)
            return 0

        stop_existing_web_servers(repo_root, args.dry_run)
        process = launch_web_servers(
            app_dir,
            host=args.host,
            dry_run=args.dry_run,
        )
        if process is not None:
            verify_web_servers_started(
                process,
                host=args.host,
                dry_run=args.dry_run,
            )
            wait_for_web_servers(process)
    except (RuntimeError, subprocess.CalledProcessError) as error:
        print(f"ERROR: {error}", file=sys.stderr, flush=True)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
