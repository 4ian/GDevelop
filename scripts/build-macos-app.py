#!/usr/bin/env python3
"""Build a distributable GDevelop macOS app (.dmg) and print its path.

Dedicated packaging counterpart to ``start-macos-app.py`` (which only launches
the app for development). This builds the React app, syncs it into the Electron
``app/www`` folder, and packages a distributable ``.dmg`` with electron-builder.

macOS code signing and notarization are disabled (``GD_PORTABLE_BUILD=true``) so
the build works without Apple Developer certificates. The resulting ``.dmg`` is
therefore unsigned: on first launch other machines may need to right-click the
app and choose "Open", or run
``xattr -dr com.apple.quarantine "/Applications/GDevelop 6.app"``.

The absolute path to the produced ``.dmg`` is printed at the end so it can be
copied and distributed elsewhere.
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path

from libgd_build import LIBGD_VARIANTS, build_libgd


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build a distributable GDevelop macOS .dmg and print its path."
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
        help="Reuse existing libGD.js and newIDE/app/build instead of running npm builds.",
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
        "--sign",
        action="store_true",
        help=(
            "Enable macOS signing/notarization (requires Apple Developer "
            "certificates). By default GD_PORTABLE_BUILD=true is used to produce "
            "an unsigned, distributable build without certificates."
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


def package_app(electron_app_dir: Path, sign: bool, dry_run: bool) -> None:
    step("Package distributable macOS app (.dmg)")
    env_updates: dict[str, str] = {}
    if sign:
        print(
            "Signing/notarization enabled (--sign): Apple Developer certificates required.",
            flush=True,
        )
    else:
        env_updates["GD_PORTABLE_BUILD"] = "true"
        print(
            "Building unsigned portable .dmg (GD_PORTABLE_BUILD=true). Pass --sign to "
            "produce a signed/notarized build.",
            flush=True,
        )

    # `npm run build` runs `app-build` (sync app/www) then electron-builder
    # with electron-builder-config.js, whose mac target "default" emits a .dmg.
    run_command(
        [resolve_tool("npm"), "run", "build", "--", "--mac"],
        cwd=electron_app_dir,
        dry_run=dry_run,
        env_updates=env_updates,
    )


def find_latest_dmg(dist_dir: Path) -> Path | None:
    if not dist_dir.exists():
        return None
    dmgs = sorted(
        dist_dir.glob("*.dmg"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    return dmgs[0] if dmgs else None


def report_artifact(dist_dir: Path, dry_run: bool) -> None:
    step("Locate distributable")
    if dry_run:
        print(f"[dry-run] would search for *.dmg in {dist_dir}", flush=True)
        return

    dmg = find_latest_dmg(dist_dir)
    if dmg is None:
        raise RuntimeError(
            f"No .dmg was produced in {dist_dir}. Check the electron-builder output above."
        )

    size_mb = dmg.stat().st_size / (1024 * 1024)
    print("\n" + "=" * 70, flush=True)
    print("Distributable built successfully.", flush=True)
    print(f"   File: {dmg.name}", flush=True)
    print(f"   Size: {size_mb:.1f} MB", flush=True)
    print("\nExecutable file path (copy this to distribute):", flush=True)
    print(f"\n  {dmg.resolve()}\n", flush=True)
    print("=" * 70, flush=True)


def main() -> int:
    args = parse_args()
    repo_root = args.repo_root.resolve()
    app_dir = repo_root / "newIDE" / "app"
    electron_app_dir = repo_root / "newIDE" / "electron-app"
    dist_dir = electron_app_dir / "dist"
    electron_builder = electron_app_dir / "node_modules" / ".bin" / "electron-builder"

    if args.dry_run:
        print("DRY RUN: no commands will be executed.", flush=True)

    try:
        ensure_electron_dependencies(electron_app_dir, electron_builder, args.dry_run)
        ensure_react_app_dependencies(app_dir, args.dry_run)
        build_libgd(
            repo_root,
            skip_build=args.skip_build,
            variant=args.libgd_variant,
            dry_run=args.dry_run,
        )
        build_react_app(app_dir, args.skip_build, args.dry_run)
        package_app(electron_app_dir, args.sign, args.dry_run)
        report_artifact(dist_dir, args.dry_run)
    except (RuntimeError, subprocess.CalledProcessError) as error:
        print(f"ERROR: {error}", file=sys.stderr, flush=True)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
