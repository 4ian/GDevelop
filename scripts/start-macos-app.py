#!/usr/bin/env python3
"""Build and start the GDevelop macOS Electron app.

This is the macOS counterpart to ``start-windows-app.py``. It intentionally uses
the production Electron path because the development server path can hang on
this checkout and can race with GDJS resource regeneration.
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

from libgd_build import LIBGD_VARIANTS, build_libgd, is_libgd_stale, npm_install_needed


DEV_PORTS = (3000, 5002)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fully build, sync, and start the GDevelop macOS app."
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
    resolved = shutil.which(name)
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


def run_shell(
    command: list[str],
    *,
    cwd: Path,
    dry_run: bool,
    check: bool = True,
) -> subprocess.CompletedProcess[str]:
    print(f"[run] {cwd}> {command_line(command)}", flush=True)
    if dry_run:
        return subprocess.CompletedProcess(command, 0, "", "")

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
    if check and result.returncode != 0:
        raise RuntimeError(
            f"Command {command_line(command)} failed with exit code {result.returncode}."
        )
    return result


def stop_existing_processes(repo_root: Path, electron_exe: Path, dry_run: bool) -> None:
    step("Stop existing GDevelop Electron processes")
    if dry_run:
        print(
            f"[dry-run] would pkill Electron processes whose path matches {electron_exe}",
            flush=True,
        )
    else:
        try:
            result = subprocess.run(
                ["pgrep", "-f", str(electron_exe)],
                capture_output=True,
                text=True,
            )
        except FileNotFoundError as error:
            raise RuntimeError("Could not find pgrep on PATH.") from error

        pids = [pid for pid in result.stdout.split() if pid.strip()]
        if not pids:
            print("No matching Electron processes were running.", flush=True)
        else:
            print(f"Stopping Electron PIDs: {', '.join(pids)}", flush=True)
            subprocess.run(["kill", "-TERM", *pids], check=False)
            time.sleep(1)
            subprocess.run(["kill", "-KILL", *pids], check=False)

    step("Stop stale dev servers on ports 3000 and 5002")
    if dry_run:
        ports = ",".join(str(p) for p in DEV_PORTS)
        print(
            f"[dry-run] would lsof -nP -iTCP:{ports} -sTCP:LISTEN and kill the owners",
            flush=True,
        )
        return

    pids: set[str] = set()
    for port in DEV_PORTS:
        result = subprocess.run(
            ["lsof", "-nP", "-tiTCP:" + str(port), "-sTCP:LISTEN"],
            capture_output=True,
            text=True,
        )
        for pid in result.stdout.split():
            if pid.strip():
                pids.add(pid.strip())

    if not pids:
        print("No stale dev server listeners on ports 3000/5002.", flush=True)
        return

    print(f"Stopping dev server PIDs: {', '.join(sorted(pids))}", flush=True)
    subprocess.run(["kill", "-TERM", *pids], check=False)
    time.sleep(1)
    subprocess.run(["kill", "-KILL", *pids], check=False)


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


def ensure_packaged_electron_runtime_dependencies(
    electron_runtime_dir: Path, dry_run: bool
) -> None:
    step("Ensure packaged Electron runtime dependencies")
    node_modules = electron_runtime_dir / "node_modules"
    needed, reason = npm_install_needed(
        electron_runtime_dir, required_dependencies=("typescript",)
    )
    if not needed:
        print(
            f"Packaged runtime dependencies present: {node_modules}",
            flush=True,
        )
        return

    print(
        "Packaged Electron runtime dependencies out of date "
        f"({reason}); running npm install in newIDE/electron-app/app.",
        flush=True,
    )
    run_command(
        [resolve_tool("npm"), "install"],
        cwd=electron_runtime_dir,
        dry_run=dry_run,
    )

    if not dry_run:
        still_needed, still_needed_reason = npm_install_needed(
            electron_runtime_dir, required_dependencies=("typescript",)
        )
        if still_needed:
            raise RuntimeError(
                "Packaged Electron runtime dependencies are still invalid after "
                f"npm install: {still_needed_reason}"
            )


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


def ensure_dock_icon(electron_app_dir: Path, dry_run: bool) -> None:
    """Generate the macOS dock icon (PNG) from the committed icon.icns.

    The dock icon of the generic Electron.app is the default Electron atom; the
    main process sets app.dock.setIcon() from build/icon.png at runtime. That PNG
    is not committed (only icon.icns/icon.ico are), so derive it here with the
    native `sips` tool to match the Windows taskbar icon.
    """
    step("Ensure macOS dock icon")
    build_dir = electron_app_dir / "build"
    icns_path = build_dir / "icon.icns"
    png_path = build_dir / "icon.png"

    if png_path.exists():
        print(f"Dock icon already present: {png_path}", flush=True)
        return
    if not icns_path.exists():
        print(
            f"Source icon missing ({icns_path}); skipping dock icon generation.",
            flush=True,
        )
        return

    run_command(
        ["sips", "-s", "format", "png", str(icns_path), "--out", str(png_path)],
        cwd=electron_app_dir,
        dry_run=dry_run,
    )
    if not dry_run and not png_path.exists():
        print(
            f"WARNING: dock icon was not created at {png_path}; "
            "the default Electron icon may be shown.",
            flush=True,
        )


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


def launch_electron(electron_app_dir: Path, electron_exe: Path, dry_run: bool) -> int | None:
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
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
    )
    print(f"Started Electron process PID: {process.pid}", flush=True)
    return process.pid


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

    leftover: list[str] = []
    for port in DEV_PORTS:
        result = subprocess.run(
            ["lsof", "-nP", "-iTCP:" + str(port), "-sTCP:LISTEN"],
            capture_output=True,
            text=True,
        )
        if result.stdout.strip():
            leftover.append(result.stdout.rstrip())

    if leftover:
        for line in leftover:
            print(line, file=sys.stderr, flush=True)
        raise RuntimeError("Unexpected dev server port listener found.")


def verify_electron_started(repo_root: Path, electron_exe: Path, dry_run: bool) -> None:
    step("Verify Electron window")
    if dry_run:
        print("Dry run: not checking live Electron processes.", flush=True)
        return

    time.sleep(5)
    result = subprocess.run(
        ["pgrep", "-lf", str(electron_exe)],
        capture_output=True,
        text=True,
    )
    if not result.stdout.strip():
        raise RuntimeError("Could not find a running GDevelop Electron process.")
    print(result.stdout.rstrip(), flush=True)


def main() -> int:
    args = parse_args()
    repo_root = args.repo_root.resolve()
    app_dir = repo_root / "newIDE" / "app"
    electron_app_dir = repo_root / "newIDE" / "electron-app"
    electron_runtime_dir = electron_app_dir / "app"
    electron_exe = (
        electron_app_dir
        / "node_modules"
        / "electron"
        / "dist"
        / "Electron.app"
        / "Contents"
        / "MacOS"
        / "Electron"
    )

    if args.dry_run:
        print("DRY RUN: no commands will be executed.", flush=True)

    build = args.build

    try:
        ensure_electron_dependencies(repo_root, electron_app_dir, electron_exe, args.dry_run)
        ensure_packaged_electron_runtime_dependencies(
            electron_runtime_dir, args.dry_run
        )
        ensure_react_app_dependencies(app_dir, args.dry_run)
        ensure_dock_icon(electron_app_dir, args.dry_run)
        # Only allow reusing the existing libGD.js when it is actually up to date
        # with the C++/bindings sources. If it is stale (or missing), the build is
        # REQUIRED: we must not silently launch with an out-of-date engine, so we
        # also try to auto-install Emscripten and let a failure stop startup.
        libgd_stale, libgd_reason = is_libgd_stale(repo_root)
        if build and libgd_stale:
            print(
                f"libGD.js needs rebuilding ({libgd_reason}); "
                "it will be rebuilt before launch.",
                flush=True,
            )
        elif build:
            print(
                f"libGD.js is up to date ({libgd_reason}).",
                flush=True,
            )
        build_libgd(
            repo_root,
            skip_build=not build,
            variant=args.libgd_variant,
            dry_run=args.dry_run,
            # A stale/missing libGD.js makes the build mandatory; a fresh one may
            # be reused even if Emscripten is unavailable.
            required=libgd_stale,
            auto_install_emscripten=libgd_stale,
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
            launch_electron(electron_app_dir, electron_exe, args.dry_run)
            verify_electron_started(repo_root, electron_exe, args.dry_run)
    except (RuntimeError, subprocess.CalledProcessError) as error:
        print(f"ERROR: {error}", file=sys.stderr, flush=True)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
