#!/usr/bin/env python3
"""Build a distributable GDevelop Windows app (installer .exe) and print its path.

Dedicated packaging counterpart to ``start-windows-app.py`` (which only launches
the app for development). This builds the React app, syncs it into the Electron
``app/www`` folder, and packages a Windows NSIS installer
(``GDevelop 5 Setup <version>.exe``) with electron-builder.

Windows Authenticode signing is disabled by default (``GD_PORTABLE_BUILD=true``)
so the build works without a code-signing certificate. The resulting installer
is therefore unsigned and SmartScreen may warn on first run.

Windows symlink note: electron-builder downloads a ``winCodeSign`` cache that
contains macOS ``.dylib`` symlinks. Extracting symlinks on Windows requires
Administrator rights or Developer Mode, so a normal user account fails with
"Cannot create symbolic link : the client does not have the required
privilege". Those symlinks are only used for macOS cross-signing and are
irrelevant to an unsigned Windows build, so this script pre-extracts that cache
with ``7za -snld`` (skip symlinks) before invoking electron-builder. If that
still fails, run this script from an Administrator terminal or enable Windows
Developer Mode.

The absolute path to the produced installer ``.exe`` is printed at the end so it
can be copied and distributed elsewhere.
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build a distributable GDevelop Windows installer .exe and print its path."
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="Path to the GDevelop repository root.",
    )
    parser.add_argument(
        "--skip-build",
        action="store_true",
        help="Reuse newIDE/app/build instead of running npm run build.",
    )
    parser.add_argument(
        "--sign",
        action="store_true",
        help=(
            "Enable Windows Authenticode signing (requires a code-signing "
            "certificate configured via GD_SIGNTOOL_SUBJECT_NAME / "
            "GD_SIGNTOOL_THUMBPRINT / SIGNTOOL_PATH). By default "
            "GD_PORTABLE_BUILD=true is used to produce an unsigned installer."
        ),
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

    env_prefix = ""
    if env_updates:
        env_prefix = " ".join(f"{k}={v}" for k, v in env_updates.items()) + " "
    print(f"[run] {cwd}> {env_prefix}{command_line(command)}", flush=True)
    if dry_run:
        return

    subprocess.run(command, cwd=cwd, env=env, check=True)


def ensure_electron_dependencies(
    electron_app_dir: Path,
    electron_builder: Path,
    dry_run: bool,
) -> None:
    step("Ensure Electron dependencies")
    if electron_builder.exists():
        print(f"electron-builder present: {electron_builder}", flush=True)
        return

    print(
        "electron-builder is missing; installing electron-app dependencies.",
        flush=True,
    )
    run_command([resolve_tool("npm"), "install"], cwd=electron_app_dir, dry_run=dry_run)

    if not dry_run and not electron_builder.exists():
        raise RuntimeError(
            f"electron-builder still missing after npm install: {electron_builder}"
        )


def ensure_react_app_dependencies(app_dir: Path, dry_run: bool) -> None:
    step("Ensure React app dependencies")
    node_modules = app_dir / "node_modules"
    if node_modules.exists():
        print(f"React app dependencies present: {node_modules}", flush=True)
        return

    print("React app node_modules missing; running npm install in newIDE/app.", flush=True)
    run_command([resolve_tool("npm"), "install"], cwd=app_dir, dry_run=dry_run)

    if not dry_run and not node_modules.exists():
        raise RuntimeError(f"React app node_modules still missing after npm install: {node_modules}")


def build_react_app(app_dir: Path, skip_build: bool, dry_run: bool) -> None:
    step("Build React app")
    if skip_build:
        print("Skipping build because --skip-build was set.", flush=True)
        return

    run_command([resolve_tool("npm"), "run", "build"], cwd=app_dir, dry_run=dry_run)


def find_seven_zip(electron_app_dir: Path) -> Path | None:
    """Locate the 7za executable bundled with electron-builder (7zip-bin)."""
    candidates = [
        electron_app_dir / "node_modules" / "7zip-bin" / "win" / "x64" / "7za.exe",
        electron_app_dir / "node_modules" / "7zip-bin" / "win" / "ia32" / "7za.exe",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    found = shutil.which("7za") or shutil.which("7z")
    return Path(found) if found else None


def wincodesign_cache_dir() -> Path:
    base = os.environ.get("LOCALAPPDATA")
    if base:
        return Path(base) / "electron-builder" / "Cache" / "winCodeSign"
    return Path.home() / "AppData" / "Local" / "electron-builder" / "Cache" / "winCodeSign"


def prepare_wincodesign_cache(electron_app_dir: Path, dry_run: bool) -> None:
    """Re-extract the winCodeSign cache without symlinks.

    electron-builder downloads winCodeSign-*.7z (used even for unsigned builds)
    and extracts it into a hash-named folder next to the .7z. That archive holds
    macOS .dylib symlinks; extracting symlinks on Windows needs Administrator
    rights or Developer Mode, otherwise extraction fails with "Cannot create
    symbolic link". Those symlinks are irrelevant to an unsigned Windows build,
    so we pre-extract each cached .7z with `7za -snld` (skip symlinks) into the
    folder electron-builder expects, so its own extraction step is a no-op.
    """
    if os.name != "nt":
        return

    step("Prepare winCodeSign cache (skip symlinks)")
    cache_dir = wincodesign_cache_dir()
    print(f"winCodeSign cache dir: {cache_dir}", flush=True)

    if not cache_dir.exists():
        print(
            "winCodeSign cache not present yet; electron-builder will download it. "
            "If extraction then fails on symlinks, re-run this script (the .7z will "
            "be cached) or run from an Administrator terminal / enable Developer Mode.",
            flush=True,
        )
        return

    archives = sorted(cache_dir.glob("*.7z"))
    if not archives:
        print(
            "No cached winCodeSign .7z found; nothing to pre-extract.",
            flush=True,
        )
        return

    seven_zip = find_seven_zip(electron_app_dir)
    if seven_zip is None:
        raise RuntimeError(
            "Could not find 7za (looked in node_modules/7zip-bin and PATH). "
            "Run npm install in newIDE/electron-app first."
        )

    for archive in archives:
        target = archive.with_suffix("")  # e.g. 804803399.7z -> 804803399
        marker = target / "darwin" / "10.12" / "lib" / "libcrypto.dylib"
        # If a previous run already extracted the regular files, re-extracting is
        # cheap and idempotent; we always (re)extract to overwrite a partial dir.
        print(f"Re-extracting {archive.name} without symlinks -> {target}", flush=True)
        if dry_run:
            print(
                f"[dry-run] would: rmtree {target} && "
                f"{seven_zip} x -snld -y -o{target} {archive}",
                flush=True,
            )
            continue

        if target.exists():
            shutil.rmtree(target, ignore_errors=True)
        target.mkdir(parents=True, exist_ok=True)

        result = subprocess.run(
            [str(seven_zip), "x", "-snld", "-y", f"-o{target}", str(archive)],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        if result.stdout.strip():
            print(result.stdout.rstrip(), flush=True)
        if result.returncode != 0:
            if result.stderr.strip():
                print(result.stderr.rstrip(), file=sys.stderr, flush=True)
            raise RuntimeError(
                f"Failed to pre-extract {archive.name} (exit {result.returncode}). "
                "Try running this script from an Administrator terminal or enable "
                "Windows Developer Mode."
            )
        # The skipped symlinks point at sibling files that DO get extracted, so
        # the missing links are harmless for an unsigned Windows build.
        _ = marker


def package_app(electron_app_dir: Path, sign: bool, dry_run: bool) -> None:
    step("Package distributable Windows installer (.exe)")
    env_updates: dict[str, str] = {}
    if sign:
        print(
            "Signing enabled (--sign): expecting GD_SIGNTOOL_SUBJECT_NAME / "
            "GD_SIGNTOOL_THUMBPRINT / SIGNTOOL_PATH to be set in the environment.",
            flush=True,
        )
    else:
        env_updates["GD_PORTABLE_BUILD"] = "true"
        print(
            "Building unsigned portable installer (GD_PORTABLE_BUILD=true). Pass "
            "--sign to produce an Authenticode-signed installer.",
            flush=True,
        )

    # `npm run build` runs `app-build` (sync app/www) then electron-builder
    # with electron-builder-config.js, whose win target "nsis" emits an
    # installer .exe.
    run_command(
        [resolve_tool("npm"), "run", "build", "--", "--win"],
        cwd=electron_app_dir,
        dry_run=dry_run,
        env_updates=env_updates,
    )


def find_latest_installer(dist_dir: Path) -> Path | None:
    if not dist_dir.exists():
        return None
    # Prefer the NSIS installer ("... Setup ....exe") and otherwise fall back to
    # any .exe. The blockmap/helper files are not .exe so they are naturally
    # excluded.
    exes = sorted(
        dist_dir.glob("*.exe"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    if not exes:
        return None
    setups = [p for p in exes if "Setup" in p.name]
    return (setups or exes)[0]


def report_artifact(dist_dir: Path, dry_run: bool) -> None:
    step("Locate distributable")
    if dry_run:
        print(f"[dry-run] would search for *.exe in {dist_dir}", flush=True)
        return

    installer = find_latest_installer(dist_dir)
    if installer is None:
        raise RuntimeError(
            f"No installer .exe was produced in {dist_dir}. Check the electron-builder output above."
        )

    size_mb = installer.stat().st_size / (1024 * 1024)
    print("\n" + "=" * 70, flush=True)
    print("Distributable built successfully.", flush=True)
    print(f"   File: {installer.name}", flush=True)
    print(f"   Size: {size_mb:.1f} MB", flush=True)
    print("\nExecutable file path (copy this to distribute):", flush=True)
    print(f"\n  {installer.resolve()}\n", flush=True)
    print("=" * 70, flush=True)


def main() -> int:
    args = parse_args()
    repo_root = args.repo_root.resolve()
    app_dir = repo_root / "newIDE" / "app"
    electron_app_dir = repo_root / "newIDE" / "electron-app"
    dist_dir = electron_app_dir / "dist"
    electron_builder = (
        electron_app_dir / "node_modules" / ".bin" / "electron-builder.cmd"
        if os.name == "nt"
        else electron_app_dir / "node_modules" / ".bin" / "electron-builder"
    )

    if args.dry_run:
        print("DRY RUN: no commands will be executed.", flush=True)

    try:
        ensure_electron_dependencies(electron_app_dir, electron_builder, args.dry_run)
        ensure_react_app_dependencies(app_dir, args.dry_run)
        build_react_app(app_dir, args.skip_build, args.dry_run)
        prepare_wincodesign_cache(electron_app_dir, args.dry_run)
        package_app(electron_app_dir, args.sign, args.dry_run)
        report_artifact(dist_dir, args.dry_run)
    except (RuntimeError, subprocess.CalledProcessError) as error:
        print(f"ERROR: {error}", file=sys.stderr, flush=True)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
