#!/usr/bin/env python3
"""Shared helpers to build GDevelop.js libGD.js from app scripts."""

from __future__ import annotations

import os
import shlex
import shutil
import subprocess
import sys
from pathlib import Path


EMSCRIPTEN_VERSION = "3.1.21"
LIBGD_VARIANTS = ("release", "dev", "debug", "debug-assertions", "debug-sanitizers")

# C++/bindings source trees that libGD.js is compiled from. If any file here is
# newer than the built libGD.js, the existing libGD.js is stale and must NOT be
# reused silently.
LIBGD_SOURCE_DIRS = ("Core", "GDJS", "GDCpp", "Extensions", "GDevelop.js/Bindings")
LIBGD_SOURCE_SUFFIXES = (
    ".cpp",
    ".h",
    ".hpp",
    ".inl",
    ".js",
    ".cmake",
    "CMakeLists.txt",
)
# The built artifact the app actually loads.
LIBGD_OUTPUT_RELATIVE_PATH = Path("newIDE") / "app" / "public" / "libGD.js"


class EmscriptenUnavailableError(RuntimeError):
    """Raised when the Emscripten toolchain cannot be loaded."""


def _newest_source_mtime(repo_root: Path) -> float | None:
    """The most recent modification time across libGD.js C++/bindings sources.

    Returns None if no source directory could be scanned.
    """
    newest: float | None = None
    scanned_any = False
    for relative_dir in LIBGD_SOURCE_DIRS:
        source_dir = repo_root / relative_dir
        if not source_dir.is_dir():
            continue
        scanned_any = True
        for current_root, dir_names, file_names in os.walk(source_dir):
            # Skip generated/build/dependency folders for speed and correctness.
            dir_names[:] = [
                name
                for name in dir_names
                if name
                not in {
                    "node_modules",
                    "build",
                    "Build",
                    ".git",
                    "__pycache__",
                }
            ]
            for file_name in file_names:
                if not file_name.endswith(LIBGD_SOURCE_SUFFIXES):
                    continue
                try:
                    mtime = (Path(current_root) / file_name).stat().st_mtime
                except OSError:
                    continue
                if newest is None or mtime > newest:
                    newest = mtime
    return newest if scanned_any else None


def is_libgd_stale(repo_root: Path) -> tuple[bool, str]:
    """Whether the built libGD.js is missing or older than its C++ sources.

    Returns (stale, reason). When the freshness cannot be determined (e.g. the
    output or sources are unreadable), errs on the side of stale=True so the
    build is not silently skipped.
    """
    output = repo_root / LIBGD_OUTPUT_RELATIVE_PATH
    if not output.exists():
        return True, f"{LIBGD_OUTPUT_RELATIVE_PATH} does not exist yet"

    try:
        output_mtime = output.stat().st_mtime
    except OSError:
        return True, f"could not read {LIBGD_OUTPUT_RELATIVE_PATH}"

    newest_source = _newest_source_mtime(repo_root)
    if newest_source is None:
        # No sources found to compare against — cannot prove freshness.
        return True, "could not scan libGD.js C++ sources to compare timestamps"

    if newest_source > output_mtime:
        return (
            True,
            "C++/bindings sources are newer than the built "
            f"{LIBGD_OUTPUT_RELATIVE_PATH.name}",
        )
    return False, "built libGD.js is up to date with its C++ sources"


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


def safe_console_text(text: str) -> str:
    encoding = sys.stdout.encoding or "utf-8"
    return text.encode(encoding, errors="replace").decode(encoding, errors="replace")


def run_command(command: list[str], *, cwd: Path, dry_run: bool) -> None:
    print(f"[run] {cwd}> {command_line(command)}", flush=True)
    if dry_run:
        return

    subprocess.run(command, cwd=cwd, check=True)


def run_windows_cmd_command(command: str, *, cwd: Path, dry_run: bool) -> None:
    print(f"[run] {cwd}> {command}", flush=True)
    if dry_run:
        return

    subprocess.run(command, cwd=cwd, shell=True, check=True)


EMSDK_REPOSITORY_URL = "https://github.com/emscripten-core/emsdk.git"


def find_emsdk_env_script(repo_root: Path) -> Path | None:
    candidates: list[Path] = []
    if os.environ.get("EMSDK"):
        candidates.append(Path(os.environ["EMSDK"]))
    candidates.extend([repo_root / "emsdk", repo_root.parent / "emsdk", Path.home() / "emsdk"])
    if os.name == "nt":
        candidates.extend([Path("D:/emsdk"), Path("C:/emsdk")])

    script_name = "emsdk_env.bat" if os.name == "nt" else "emsdk_env.sh"
    for candidate in candidates:
        script = candidate / script_name
        if script.exists():
            return script
    return None


def clone_emsdk(repo_root: Path, dry_run: bool) -> Path:
    """Clone the emsdk repository to a default location and return its env script.

    Used when no emsdk checkout exists anywhere this script looks. The clone goes
    to ``~/emsdk`` (the location documented by Emscripten and already probed by
    ``find_emsdk_env_script``). Raises ``EmscriptenUnavailableError`` on failure.
    """
    target_dir = Path.home() / "emsdk"
    print(
        f"No emsdk found; cloning Emscripten SDK into {target_dir} ...",
        flush=True,
    )
    if dry_run:
        return target_dir / ("emsdk_env.bat" if os.name == "nt" else "emsdk_env.sh")

    if not target_dir.exists():
        try:
            run_command(
                [resolve_tool("git"), "clone", EMSDK_REPOSITORY_URL, str(target_dir)],
                cwd=repo_root,
                dry_run=dry_run,
            )
        except (subprocess.CalledProcessError, RuntimeError) as error:
            raise EmscriptenUnavailableError(
                f"Failed to clone emsdk from {EMSDK_REPOSITORY_URL} into {target_dir}: "
                f"{error}. Install Emscripten manually, then rerun."
            ) from error

    script_name = "emsdk_env.bat" if os.name == "nt" else "emsdk_env.sh"
    script = target_dir / script_name
    if not script.exists():
        raise EmscriptenUnavailableError(
            f"Cloned emsdk but {script} was not found. The clone may be incomplete; "
            f"remove {target_dir} and rerun, or install Emscripten manually."
        )
    return script


def ensure_python_shim(dry_run: bool) -> Path | None:
    """Ensure a `python` executable is on PATH (mapping to `python3`).

    Returns a directory to prepend to PATH that contains a `python` shim, or None
    when `python` is already available (or cannot be shimmed). The GDevelop.js
    build's WebIDL binder calls `python`, which modern macOS no longer provides.
    """
    if os.name == "nt":
        return None
    if shutil.which("python"):
        return None

    python3 = shutil.which("python3")
    if not python3:
        # Nothing we can do; let the build fail with its own error.
        return None

    shim_dir = Path(repo_root_shim_dir())
    if dry_run:
        return shim_dir

    shim_dir.mkdir(parents=True, exist_ok=True)
    shim = shim_dir / "python"
    # Use an exec WRAPPER, not a symlink: macOS's /usr/bin/python3 is an argv0-
    # sensitive stub that re-triggers the Command Line Tools install prompt when
    # invoked as `python`. The wrapper execs it as `python3`, avoiding that.
    if shim.exists() or shim.is_symlink():
        shim.unlink()
    shim.write_text(f'#!/bin/sh\nexec {shlex.quote(python3)} "$@"\n')
    shim.chmod(0o755)
    return shim_dir


def repo_root_shim_dir() -> str:
    """A stable, writable directory to hold build shims (e.g. the python shim)."""
    return str(Path.home() / ".cache" / "gdevelop-build-shims")


def quote_windows_cmd_arg(argument: str) -> str:
    return '"' + argument.replace('"', '\\"') + '"'


def emsdk_setup_command(emsdk_env_script: Path) -> str:
    emsdk_dir = emsdk_env_script.parent
    if os.name == "nt":
        return (
            f"cd /d {quote_windows_cmd_arg(str(emsdk_dir))} && "
            f"emsdk.bat install {EMSCRIPTEN_VERSION} && "
            f"emsdk.bat activate {EMSCRIPTEN_VERSION}"
        )
    return (
        f"cd {shlex.quote(str(emsdk_dir))} && "
        f"./emsdk install {EMSCRIPTEN_VERSION} && "
        f"./emsdk activate {EMSCRIPTEN_VERSION}"
    )


def run_emsdk_setup(emsdk_env_script: Path, dry_run: bool) -> None:
    setup_command = emsdk_setup_command(emsdk_env_script)
    print(
        f"Emscripten {EMSCRIPTEN_VERSION} is missing or not activated; "
        "installing/activating it with emsdk.",
        flush=True,
    )
    if os.name == "nt":
        run_windows_cmd_command(
            setup_command, cwd=emsdk_env_script.parent, dry_run=dry_run
        )
    else:
        run_command(
            [resolve_tool("bash"), "-lc", setup_command],
            cwd=emsdk_env_script.parent,
            dry_run=dry_run,
        )


def probe_emscripten_tools(
    repo_root: Path, emsdk_env_script: Path
) -> subprocess.CompletedProcess[str]:
    if os.name == "nt":
        probe_command = (
            f"call {quote_windows_cmd_arg(str(emsdk_env_script))} >nul && "
            "where emcmake >nul && where emmake >nul && emcc --version >nul"
        )
        return subprocess.run(
            probe_command,
            cwd=repo_root,
            shell=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            capture_output=True,
        )

    probe_command = (
        f". {shlex.quote(str(emsdk_env_script))} >/dev/null && "
        "command -v emcmake >/dev/null && command -v emmake >/dev/null && "
        "emcc --version >/dev/null"
    )
    return subprocess.run(
        [resolve_tool("bash"), "-lc", probe_command],
        cwd=repo_root,
        text=True,
        encoding="utf-8",
        errors="replace",
        capture_output=True,
    )


def ensure_emscripten_available(
    repo_root: Path, dry_run: bool, *, auto_install: bool
) -> Path | None:
    if shutil.which("emcmake") and shutil.which("emmake"):
        return None

    emsdk_env_script = find_emsdk_env_script(repo_root)
    needs_setup = False
    if not emsdk_env_script:
        if not auto_install:
            example = "D:\\emsdk" if os.name == "nt" else "~/emsdk"
            raise EmscriptenUnavailableError(
                "Could not find Emscripten. Install and activate emsdk, or put emsdk "
                f"where this script can find it (for example {example})."
            )
        # No emsdk anywhere: clone it automatically, then it will need install+activate.
        emsdk_env_script = clone_emsdk(repo_root, dry_run)
        needs_setup = True

    print(f"Using Emscripten environment: {emsdk_env_script}", flush=True)
    if dry_run:
        return emsdk_env_script

    # A freshly cloned emsdk has no installed/activated toolchain yet, so set it
    # up before probing (avoids a guaranteed-failing probe).
    if needs_setup and auto_install:
        run_emsdk_setup(emsdk_env_script, dry_run)

    result = probe_emscripten_tools(repo_root, emsdk_env_script)
    if result.returncode != 0:
        if auto_install:
            run_emsdk_setup(emsdk_env_script, dry_run)
            result = probe_emscripten_tools(repo_root, emsdk_env_script)
        else:
            details = (result.stderr or result.stdout).strip()
            if details:
                details = f"\nProbe output:\n{details}"
            raise EmscriptenUnavailableError(
                "Found emsdk, but emcmake/emmake are not available after loading "
                f"{emsdk_env_script.name}. Install and activate Emscripten "
                f"{EMSCRIPTEN_VERSION}:\n  {emsdk_setup_command(emsdk_env_script)}"
                f"{details}"
            )

    if result.returncode != 0:
        details = (result.stderr or result.stdout).strip()
        if details:
            details = f"\nProbe output:\n{details}"
        raise EmscriptenUnavailableError(
            "Found emsdk, but emcmake/emmake are not available after loading "
            f"{emsdk_env_script.name}. Install and activate Emscripten "
            f"{EMSCRIPTEN_VERSION}:\n  {emsdk_setup_command(emsdk_env_script)}\n"
            "Then rerun this script. Use --skip-build only when intentionally "
            f"reusing an existing libGD.js.{details}"
        )

    return emsdk_env_script


def run_libgd_build_command(
    command: list[str],
    *,
    cwd: Path,
    repo_root: Path,
    dry_run: bool,
    auto_install_emscripten: bool,
) -> None:
    emsdk_env_script = ensure_emscripten_available(
        repo_root, dry_run, auto_install=auto_install_emscripten
    )
    if not emsdk_env_script:
        run_command(command, cwd=cwd, dry_run=dry_run)
        return

    if os.name == "nt":
        command_text = (
            f"call {quote_windows_cmd_arg(str(emsdk_env_script))} >nul && "
            + " ".join(quote_windows_cmd_arg(argument) for argument in command)
        )
        run_windows_cmd_command(command_text, cwd=cwd, dry_run=dry_run)
    else:
        # GDevelop.js's WebIDL binder invokes `python` (the Python 2 era name),
        # but modern macOS ships only `python3`. Ensure a `python` is on PATH for
        # the build subprocess by prepending a tiny shim dir if needed.
        path_prefix = ""
        python_shim_dir = ensure_python_shim(dry_run)
        if python_shim_dir:
            path_prefix = f"export PATH={shlex.quote(str(python_shim_dir))}:$PATH && "
        command_text = (
            f". {shlex.quote(str(emsdk_env_script))} >/dev/null && "
            + path_prefix
            + " ".join(shlex.quote(argument) for argument in command)
        )
        run_command([resolve_tool("bash"), "-lc", command_text], cwd=cwd, dry_run=dry_run)


def build_libgd(
    repo_root: Path,
    *,
    skip_build: bool,
    variant: str | None,
    dry_run: bool,
    use_mingw: bool = False,
    required: bool = True,
    auto_install_emscripten: bool = True,
    skip_message: str | None = None,
) -> None:
    step("Build GDevelop.js libGD.js")
    if skip_build:
        print(
            skip_message or "Skipping libGD.js build because --skip-build was set.",
            flush=True,
        )
        return

    gdevelop_js_dir = repo_root / "GDevelop.js"
    node_modules = gdevelop_js_dir / "node_modules"
    if not node_modules.exists():
        print(
            "GDevelop.js node_modules missing; running npm install in GDevelop.js.",
            flush=True,
        )
        run_command([resolve_tool("npm"), "install"], cwd=gdevelop_js_dir, dry_run=dry_run)

        if not dry_run and not node_modules.exists():
            raise RuntimeError(
                f"GDevelop.js node_modules still missing after npm install: {node_modules}"
            )

    npm_script = "build-with-MinGW" if use_mingw else "build"
    command = [resolve_tool("npm"), "run", npm_script]
    if variant:
        command.extend(["--", f"--variant={variant}"])

    try:
        run_libgd_build_command(
            command,
            cwd=gdevelop_js_dir,
            repo_root=repo_root,
            dry_run=dry_run,
            auto_install_emscripten=auto_install_emscripten,
        )
    except EmscriptenUnavailableError as error:
        if required:
            raise

        print(
            "WARNING: Skipping local libGD.js source build because Emscripten is not ready.",
            flush=True,
        )
        print(safe_console_text(str(error)), flush=True)
        print(
            "Continuing startup; the app build will reuse or download newIDE/app/public/libGD.js. "
            "Local C++ engine changes will not be reflected until libGD.js is rebuilt.",
            flush=True,
        )
        return

    if dry_run:
        return

    libgd_dir = repo_root / "Binaries" / "embuild" / "GDevelop.js"
    libgd_js = libgd_dir / "libGD.js"
    libgd_wasm = libgd_dir / "libGD.wasm"
    if not libgd_js.exists() or not libgd_wasm.exists():
        raise RuntimeError(
            "GDevelop.js build completed but libGD.js/libGD.wasm were not found "
            f"in {libgd_dir}."
        )
    print(f"Built libGD.js: {libgd_js}", flush=True)
