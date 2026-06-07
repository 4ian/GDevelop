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


class EmscriptenUnavailableError(RuntimeError):
    """Raised when the Emscripten toolchain cannot be loaded."""


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
    if not emsdk_env_script:
        example = "D:\\emsdk" if os.name == "nt" else "~/emsdk"
        raise EmscriptenUnavailableError(
            "Could not find Emscripten. Install and activate emsdk, or put emsdk "
            f"where this script can find it (for example {example})."
        )

    print(f"Using Emscripten environment: {emsdk_env_script}", flush=True)
    if dry_run:
        return emsdk_env_script

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
        command_text = (
            f". {shlex.quote(str(emsdk_env_script))} >/dev/null && "
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
