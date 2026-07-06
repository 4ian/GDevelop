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
copied and distributed elsewhere. By default the ``.dmg`` is then uploaded to a
GitHub release (``zhouzhipeng/GDevelop`` tag ``latest`` by default) using the
``gh`` CLI. If ``gh`` is missing it is installed automatically with Homebrew
(pass ``--no-auto-install-gh`` to disable). Pass ``--no-upload`` to skip the
upload, ``--upload-only`` to upload an already-built ``.dmg`` without
rebuilding, or ``--release-repo`` / ``--release-tag`` to target a different
release.
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
        "--no-upload",
        dest="upload",
        action="store_false",
        help=(
            "Do not upload the built .dmg to a GitHub release. By default the "
            ".dmg is uploaded to the release given by --release-repo/--release-tag."
        ),
    )
    parser.add_argument(
        "--release-repo",
        default="zhouzhipeng/GDevelop",
        help="GitHub repository (owner/name) whose release receives the .dmg.",
    )
    parser.add_argument(
        "--release-tag",
        default="latest",
        help="Tag of the GitHub release to upload the .dmg to.",
    )
    parser.add_argument(
        "--upload-only",
        action="store_true",
        help=(
            "Skip building/packaging entirely and only upload the .dmg already "
            "present in newIDE/electron-app/dist to the GitHub release. Useful to "
            "retry the upload after a successful build (e.g. once gh is installed)."
        ),
    )
    parser.add_argument(
        "--no-auto-install-gh",
        dest="auto_install_gh",
        action="store_false",
        help=(
            "Do not attempt to auto-install the GitHub CLI (gh) when it is "
            "missing. By default gh is installed via Homebrew if the upload step "
            "cannot find it."
        ),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the planned commands without running them.",
    )
    parser.set_defaults(upload=True, auto_install_gh=True)
    return parser.parse_args()


def step(title: str) -> None:
    print(f"\n==> {title}", flush=True)


def resolve_tool(name: str) -> str:
    resolved = shutil.which(name)
    if resolved:
        return resolved
    raise RuntimeError(f"Could not find required tool on PATH: {name}")


def _find_gh_in_known_locations() -> str | None:
    """Return a path to ``gh`` from PATH or its usual install dirs, else None.

    Homebrew installs ``gh`` to ``/opt/homebrew/bin`` (Apple Silicon) or
    ``/usr/local/bin`` (Intel), which are not always on the PATH of a
    non-interactive/non-login shell. Check those locations too.
    """
    try:
        return resolve_tool("gh")
    except RuntimeError:
        pass

    for candidate in (
        Path("/opt/homebrew/bin/gh"),
        Path("/usr/local/bin/gh"),
        Path("/usr/bin/gh"),
    ):
        if candidate.exists():
            return str(candidate)
    return None


def _auto_install_gh(dry_run: bool) -> bool:
    """Try to install the GitHub CLI with Homebrew.

    Returns True if an installer command ran (or would run in dry-run), False if
    Homebrew is not available. Never raises: a failed installer just returns True
    and the caller re-probes for gh.
    """
    step("Install GitHub CLI (gh)")

    if not shutil.which("brew"):
        print(
            "Homebrew (brew) not found; cannot auto-install gh. Install it from "
            "https://brew.sh/ or https://cli.github.com/.",
            flush=True,
        )
        return False

    command = [resolve_tool("brew"), "install", "gh"]
    print("Found package manager 'brew'; installing gh...", flush=True)
    print(f"[run] {command_line(command)}", flush=True)
    if dry_run:
        return True
    try:
        subprocess.run(command, check=True)
    except (subprocess.CalledProcessError, OSError) as error:
        print(f"WARNING: 'brew' failed to install gh: {error}", flush=True)
    return True


def resolve_gh(*, auto_install: bool = True, dry_run: bool = False) -> str:
    """Locate the GitHub CLI (``gh``), installing it automatically if missing.

    Looks on PATH and in gh's usual install locations first. If still missing and
    ``auto_install`` is set, installs it with Homebrew and probes again.
    """
    found = _find_gh_in_known_locations()
    if found:
        return found

    if auto_install and _auto_install_gh(dry_run):
        if dry_run:
            return "gh"
        found = _find_gh_in_known_locations()
        if found:
            print(f"✅ gh installed: {found}", flush=True)
            return found
        print(
            "WARNING: gh was installed but is not yet visible on PATH. You may "
            "need to open a new terminal.",
            flush=True,
        )

    raise RuntimeError(
        "Could not find or install the GitHub CLI (gh). Install it from "
        "https://cli.github.com/ (on macOS: `brew install gh`) and make sure "
        "`gh auth login` has been run, then retry the upload."
    )


def _gh_is_authenticated(gh: str) -> bool:
    """Whether ``gh`` already has working credentials for github.com."""
    try:
        result = subprocess.run(
            [gh, "auth", "status", "--hostname", "github.com"],
            capture_output=True,
            text=True,
        )
    except OSError:
        return False
    return result.returncode == 0


def _token_from_git_credential() -> str | None:
    """Fetch a github.com token from the git credential helper, if any.

    Because the repo is pushed over HTTPS, a Personal Access Token (or the token
    minted by the credential helper) for github.com is typically already stored
    in the OS credential store. ``git credential fill`` returns it without any
    prompt when it is present, letting us authenticate gh non-interactively.
    """
    git = shutil.which("git")
    if not git:
        return None
    try:
        result = subprocess.run(
            [git, "credential", "fill"],
            input="protocol=https\nhost=github.com\n\n",
            capture_output=True,
            text=True,
        )
    except OSError:
        return None
    if result.returncode != 0:
        return None
    for line in result.stdout.splitlines():
        if line.startswith("password="):
            token = line[len("password=") :].strip()
            return token or None
    return None


def resolve_gh_token(gh: str) -> str | None:
    """Return a token to authenticate gh, or None if gh is already logged in.

    Order: an explicit GH_TOKEN/GITHUB_TOKEN in the environment (returned so it
    is forwarded to the upload subprocess), then — only if gh is not already
    authenticated — the git credential helper's stored github.com token.
    """
    env_token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if env_token:
        return env_token

    if _gh_is_authenticated(gh):
        return None

    token = _token_from_git_credential()
    if token:
        print(
            "gh is not logged in; reusing the stored github.com git credential "
            "for this upload.",
            flush=True,
        )
        return token

    raise RuntimeError(
        "The GitHub CLI (gh) is installed but not authenticated, and no token "
        "could be found. Run `gh auth login` once, or set the GH_TOKEN "
        "environment variable to a GitHub token with 'repo' scope, then retry "
        "the upload."
    )


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


def report_artifact(dist_dir: Path, dry_run: bool) -> Path | None:
    step("Locate distributable")
    if dry_run:
        print(f"[dry-run] would search for *.dmg in {dist_dir}", flush=True)
        return None

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
    return dmg


def upload_artifact(
    dmg: Path | None,
    dist_dir: Path,
    *,
    release_repo: str,
    release_tag: str,
    dry_run: bool,
    auto_install_gh: bool = True,
) -> None:
    step(f"Upload distributable to GitHub release {release_repo}@{release_tag}")

    if dry_run:
        dmg_display = dmg if dmg is not None else f"<latest *.dmg in {dist_dir}>"
        print(
            "[dry-run] would upload with: "
            + command_line(
                [
                    "gh",
                    "release",
                    "upload",
                    release_tag,
                    str(dmg_display),
                    "--repo",
                    release_repo,
                    "--clobber",
                ]
            ),
            flush=True,
        )
        return

    if dmg is None:
        dmg = find_latest_dmg(dist_dir)
    if dmg is None:
        raise RuntimeError(
            f"No .dmg found to upload in {dist_dir}. Nothing was uploaded."
        )

    # `--clobber` replaces an existing asset of the same name so re-runs update
    # the release in place instead of failing on a duplicate asset.
    upload_arguments = [
        "release",
        "upload",
        release_tag,
        str(dmg.resolve()),
        "--repo",
        release_repo,
        "--clobber",
    ]

    try:
        gh = resolve_gh(auto_install=auto_install_gh, dry_run=dry_run)
        token = resolve_gh_token(gh)
    except RuntimeError as error:
        # The .dmg already exists on disk; don't lose it just because gh is
        # missing or unauthenticated. Explain how to upload it manually and
        # re-raise so the run still reports failure.
        print(f"❌ {error}", flush=True)
        print(
            "\nThe .dmg was built successfully and is still available at:\n"
            f"\n  {dmg.resolve()}\n"
            "\nOnce gh is installed and authenticated, upload it with:\n"
            f'\n  gh {command_line(upload_arguments)}\n',
            flush=True,
        )
        raise

    command = [gh, *upload_arguments]
    # Forward the token via the environment (never on the command line / logs).
    upload_env = os.environ.copy()
    if token:
        upload_env["GH_TOKEN"] = token
    print(f"[run] {dist_dir}> {command_line(command)}", flush=True)
    subprocess.run(command, cwd=dist_dir, check=True, env=upload_env)

    print("\n" + "=" * 70, flush=True)
    print("Uploaded distributable to GitHub release.", flush=True)
    print(f"   Asset:   {dmg.name}", flush=True)
    print(
        f"   Release: https://github.com/{release_repo}/releases/tag/{release_tag}",
        flush=True,
    )
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
        if args.upload_only:
            # Reuse the already-built .dmg from a previous run; skip every
            # build/package step and go straight to uploading.
            print(
                "Upload-only mode: skipping build/package and uploading the "
                "existing .dmg.",
                flush=True,
            )
            dmg = report_artifact(dist_dir, args.dry_run)
            upload_artifact(
                dmg,
                dist_dir,
                release_repo=args.release_repo,
                release_tag=args.release_tag,
                dry_run=args.dry_run,
                auto_install_gh=args.auto_install_gh,
            )
            return 0

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
        dmg = report_artifact(dist_dir, args.dry_run)
        if args.upload:
            upload_artifact(
                dmg,
                dist_dir,
                release_repo=args.release_repo,
                release_tag=args.release_tag,
                dry_run=args.dry_run,
                auto_install_gh=args.auto_install_gh,
            )
        else:
            print(
                "\nSkipping GitHub release upload (--no-upload).",
                flush=True,
            )
    except (RuntimeError, subprocess.CalledProcessError) as error:
        print(f"ERROR: {error}", file=sys.stderr, flush=True)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
