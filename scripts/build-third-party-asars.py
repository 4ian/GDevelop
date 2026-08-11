#!/usr/bin/env python3
"""Build Electron ASAR artifacts for bundled third-party tools.

The script builds the ASAR files used by the GDevelop Electron Resource Working
Desk from the git submodules under ThirdParties:

- newIDE/electron-app/app/external/image-extender.asar
- newIDE/electron-app/app/external/ai-game-workbench.storage-open.asar
- newIDE/electron-app/app/external/gorest-spritesheet.asar
- newIDE/electron-app/app/external/advanced-tween-editor.asar

It stages compiled runtime files in the system temp directory. It does not start
a localhost server or copy expanded upstream source into the Electron app.
"""

from __future__ import annotations

import argparse
import os
import shutil
import signal
import subprocess
import sys
import tempfile
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
ELECTRON_APP_DIR = REPO_ROOT / "newIDE" / "electron-app"
EXTERNAL_DIR = ELECTRON_APP_DIR / "app" / "external"
IS_WINDOWS = os.name == "nt"


def executable_name(name: str) -> str:
    return f"{name}.cmd" if IS_WINDOWS else name


def ffmpeg_binary_name() -> str:
    return "ffmpeg.exe" if IS_WINDOWS else "ffmpeg"


def npm_command() -> str:
    command = shutil.which(executable_name("npm")) or shutil.which("npm")
    if not command:
        raise RuntimeError("npm was not found on PATH.")
    return command


def electron_bin(name: str) -> Path:
    return ELECTRON_APP_DIR / "node_modules" / ".bin" / executable_name(name)


def log(message: str) -> None:
    print(f"\n==> {message}", flush=True)


def run(
    args: list[str | Path],
    cwd: Path,
    env: dict[str, str] | None = None,
) -> None:
    printable = " ".join(str(arg) for arg in args)
    print(printable, flush=True)
    subprocess.run(
        [str(arg) for arg in args],
        cwd=str(cwd),
        env=env,
        check=True,
    )


def assert_exists(path: Path, kind: str) -> None:
    if kind == "file" and not path.is_file():
        raise FileNotFoundError(f"Required file does not exist: {path}")
    if kind == "directory" and not path.is_dir():
        raise FileNotFoundError(f"Required directory does not exist: {path}")


def assert_under(path: Path, allowed_root: Path) -> None:
    resolved_path = path.resolve()
    resolved_root = allowed_root.resolve()

    if resolved_path == resolved_root:
        raise RuntimeError(f"Refusing to remove root path: {resolved_path}")

    try:
        resolved_path.relative_to(resolved_root)
    except ValueError as error:
        raise RuntimeError(
            f"Refusing to touch path outside {resolved_root}: {resolved_path}"
        ) from error


def remove_safe(path: Path, allowed_root: Path) -> None:
    if not path.exists():
        return

    assert_under(path, allowed_root)

    if path.is_dir() and not path.is_symlink():
        shutil.rmtree(path)
    else:
        path.unlink()


def find_windows_processes_locking_path(path: Path) -> list[int]:
    import ctypes
    from ctypes import wintypes
    from uuid import uuid4

    ERROR_MORE_DATA = 234
    ERROR_SUCCESS = 0
    CCH_RM_MAX_APP_NAME = 255
    CCH_RM_MAX_SVC_NAME = 63

    class RM_UNIQUE_PROCESS(ctypes.Structure):
        _fields_ = [
            ("dwProcessId", wintypes.DWORD),
            ("ProcessStartTime", wintypes.FILETIME),
        ]

    class RM_PROCESS_INFO(ctypes.Structure):
        _fields_ = [
            ("Process", RM_UNIQUE_PROCESS),
            ("strAppName", wintypes.WCHAR * (CCH_RM_MAX_APP_NAME + 1)),
            ("strServiceShortName", wintypes.WCHAR * (CCH_RM_MAX_SVC_NAME + 1)),
            ("ApplicationType", wintypes.DWORD),
            ("AppStatus", wintypes.ULONG),
            ("TSSessionId", wintypes.DWORD),
            ("bRestartable", wintypes.BOOL),
        ]

    rstrtmgr = ctypes.WinDLL("rstrtmgr")
    session_handle = wintypes.DWORD()
    session_key = ctypes.create_unicode_buffer(uuid4().hex)
    result = rstrtmgr.RmStartSession(
        ctypes.byref(session_handle),
        0,
        session_key,
    )
    if result != ERROR_SUCCESS:
        return []

    try:
        resource = ctypes.c_wchar_p(str(path.resolve()))
        result = rstrtmgr.RmRegisterResources(
            session_handle,
            1,
            ctypes.byref(resource),
            0,
            None,
            0,
            None,
        )
        if result != ERROR_SUCCESS:
            return []

        proc_info_needed = wintypes.UINT(0)
        proc_info_count = wintypes.UINT(0)
        reboot_reasons = wintypes.DWORD(0)
        result = rstrtmgr.RmGetList(
            session_handle,
            ctypes.byref(proc_info_needed),
            ctypes.byref(proc_info_count),
            None,
            ctypes.byref(reboot_reasons),
        )
        if result == ERROR_SUCCESS:
            return []
        if result != ERROR_MORE_DATA:
            return []

        process_info = (RM_PROCESS_INFO * proc_info_needed.value)()
        proc_info_count = wintypes.UINT(proc_info_needed.value)
        result = rstrtmgr.RmGetList(
            session_handle,
            ctypes.byref(proc_info_needed),
            ctypes.byref(proc_info_count),
            process_info,
            ctypes.byref(reboot_reasons),
        )
        if result != ERROR_SUCCESS:
            return []

        return [
            int(process_info[index].Process.dwProcessId)
            for index in range(proc_info_count.value)
            if int(process_info[index].Process.dwProcessId) != os.getpid()
        ]
    finally:
        rstrtmgr.RmEndSession(session_handle)


def find_processes_locking_path(path: Path) -> list[int]:
    if IS_WINDOWS:
        return find_windows_processes_locking_path(path)

    lsof = shutil.which("lsof")
    if not lsof:
        return []

    result = subprocess.run(
        [lsof, "-t", str(path.resolve())],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    process_ids: list[int] = []
    for line in result.stdout.splitlines():
        try:
            process_id = int(line.strip())
        except ValueError:
            continue
        if process_id != os.getpid():
            process_ids.append(process_id)
    return process_ids


def get_parent_process_id(process_id: int) -> int | None:
    if IS_WINDOWS:
        powershell = shutil.which("powershell") or shutil.which("pwsh")
        if not powershell:
            return None

        result = subprocess.run(
            [
                powershell,
                "-NoProfile",
                "-Command",
                (
                    "try { "
                    f"(Get-CimInstance Win32_Process -Filter \"ProcessId={process_id}\").ParentProcessId "
                    "} catch { '' }"
                ),
            ],
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            check=False,
        )
    else:
        ps = shutil.which("ps")
        if not ps:
            return None

        result = subprocess.run(
            [ps, "-o", "ppid=", "-p", str(process_id)],
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            check=False,
        )

    value = result.stdout.strip()
    if not value:
        return None

    try:
        parent_process_id = int(value.splitlines()[0].strip())
    except ValueError:
        return None

    return parent_process_id if parent_process_id > 0 else None


def get_current_process_family_ids() -> set[int]:
    process_ids = {os.getpid()}
    current_process_id = os.getpid()

    for _ in range(32):
        parent_process_id = get_parent_process_id(current_process_id)
        if parent_process_id is None or parent_process_id in process_ids:
            break
        process_ids.add(parent_process_id)
        current_process_id = parent_process_id

    return process_ids


def kill_processes(process_ids: list[int], reason: str) -> None:
    protected_process_ids = get_current_process_family_ids()
    skipped_process_ids = sorted(set(process_ids) & protected_process_ids)
    unique_process_ids = sorted(set(process_ids) - protected_process_ids)

    if skipped_process_ids:
        log(
            "Skipping current Codex process family while unlocking "
            f"{reason}: {', '.join(map(str, skipped_process_ids))}"
        )

    if not unique_process_ids:
        if skipped_process_ids:
            raise RuntimeError(
                f"{reason} is locked by the current Codex process family "
                f"({', '.join(map(str, skipped_process_ids))}). Close the "
                "Codex in-app preview or restart Codex, then rerun the build. "
                "The builder will not terminate Codex itself."
            )
        raise RuntimeError(f"Could not identify the process locking {reason}.")

    log(
        f"Terminating processes locking {reason}: "
        f"{', '.join(map(str, unique_process_ids))}"
    )
    for process_id in unique_process_ids:
        if IS_WINDOWS:
            subprocess.run(
                ["taskkill", "/PID", str(process_id), "/T", "/F"],
                check=False,
            )
        else:
            try:
                os.kill(process_id, signal.SIGKILL)
            except ProcessLookupError:
                pass


def remove_safe_with_lock_kill(path: Path, allowed_root: Path) -> None:
    try:
        remove_safe(path, allowed_root)
        return
    except PermissionError:
        process_ids = find_processes_locking_path(path)
        kill_processes(process_ids, str(path))
        remove_safe(path, allowed_root)


def copy_file(source: Path, destination: Path) -> None:
    assert_exists(source, "file")
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)


def copy_directory(source: Path, destination: Path) -> None:
    assert_exists(source, "directory")
    if destination.exists():
        shutil.rmtree(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source, destination)


def copy_directory_contents(source: Path, destination: Path) -> None:
    assert_exists(source, "directory")
    destination.mkdir(parents=True, exist_ok=True)
    for child in source.iterdir():
        target = destination / child.name
        if child.is_dir():
            copy_directory(child, target)
        else:
            copy_file(child, target)


def ensure_submodule(relative_path: str, pull: bool) -> Path:
    log(f"Initializing {relative_path}")
    run(
        ["git", "submodule", "update", "--init", "--recursive", relative_path],
        cwd=REPO_ROOT,
    )

    submodule_path = REPO_ROOT / relative_path
    assert_exists(submodule_path, "directory")

    if pull:
        log(f"Pulling {relative_path}")
        run(["git", "-C", submodule_path, "pull", "--ff-only"], cwd=REPO_ROOT)

    run(["git", "-C", submodule_path, "log", "-1", "--oneline"], cwd=REPO_ROOT)
    return submodule_path.resolve()


def ensure_npm_install(directory: Path, skip_install: bool) -> None:
    if skip_install:
        assert_exists(directory / "node_modules", "directory")
        return

    log(f"Installing npm dependencies in {directory}")
    run([npm_command(), "install"], cwd=directory)


def ensure_electron_packaging_dependencies(skip_install: bool) -> None:
    asar_path = electron_bin("asar")
    electron_path = electron_bin("electron")

    if asar_path.is_file() and electron_path.is_file():
        return

    if skip_install:
        raise RuntimeError(
            "Electron packaging dependencies are missing. Run npm install in "
            "newIDE/electron-app or omit --skip-install."
        )

    log("Installing Electron packaging dependencies")
    run([npm_command(), "install"], cwd=ELECTRON_APP_DIR)


def ensure_next_standalone_output(upstream_path: Path) -> None:
    config_path = upstream_path / "next.config.js"
    assert_exists(config_path, "file")

    config = config_path.read_text(encoding="utf-8")
    if "output: 'standalone'" in config or 'output: "standalone"' in config:
        return

    needle = "reactStrictMode: true,"
    if needle not in config:
        raise RuntimeError(
            f"Could not add Next standalone output to {config_path}. Add "
            "output: 'standalone' manually."
        )

    log(f"Adding output: 'standalone' to {config_path}")
    config_path.write_text(
        config.replace(needle, f"{needle}\n  output: 'standalone',"),
        encoding="utf-8",
    )


def ensure_ai_game_workbench_electron_compatibility(upstream_path: Path) -> None:
    client_path = upstream_path / "apps" / "web" / "src" / "api" / "client.ts"
    config_path = upstream_path / "apps" / "server" / "src" / "config.ts"
    assert_exists(client_path, "file")
    assert_exists(config_path, "file")

    client = client_path.read_text(encoding="utf-8")
    old_api_base = (
        'export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '
        '"http://127.0.0.1:8787";'
    )
    if old_api_base in client:
        log(f"Patching API_BASE for Electron custom protocol in {client_path}")
        client_path.write_text(
            client.replace(
                old_api_base,
                'export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";',
            ),
            encoding="utf-8",
        )

    config = config_path.read_text(encoding="utf-8")
    if (
        'import ffmpegStaticPath from "ffmpeg-static";' in config
        or 'return ffmpegStaticPath ?? "ffmpeg";' in config
    ):
        log(f"Patching default ffmpeg resolution for Electron in {config_path}")
        config_path.write_text(
            config.replace('import ffmpegStaticPath from "ffmpeg-static";', "")
            .replace('return ffmpegStaticPath ?? "ffmpeg";', 'return "ffmpeg";'),
            encoding="utf-8",
        )


def find_ffmpeg_static_binary(upstream_path: Path) -> Path:
    ffmpeg_static_dir = upstream_path / "node_modules" / "ffmpeg-static"
    candidates = [
        ffmpeg_static_dir / ffmpeg_binary_name(),
        ffmpeg_static_dir / "ffmpeg.exe",
        ffmpeg_static_dir / "ffmpeg",
    ]

    for candidate in candidates:
        if candidate.is_file():
            return candidate

    raise FileNotFoundError(
        "Could not find ffmpeg-static binary. Checked: "
        + ", ".join(str(candidate) for candidate in candidates)
    )


def smoke_test_image_extender(electron_path: Path) -> None:
    log("Smoke testing image-extender.asar")
    script = r"""
const path = require('path');
const route = require(path.resolve('newIDE/electron-app/app/external/image-extender.asar/.next/server/app/api/extend/route.js'));
const post = route.routeModule && route.routeModule.userland && route.routeModule.userland.POST;
if (typeof post !== 'function') {
  throw new Error('Image Extender POST route was not found in the ASAR.');
}
console.log('image-extender.asar smoke:', typeof post);
"""
    env = os.environ.copy()
    env["ELECTRON_RUN_AS_NODE"] = "1"
    run([electron_path, "-e", script], cwd=REPO_ROOT, env=env)


def smoke_test_ai_game_workbench(electron_path: Path) -> None:
    log("Smoke testing ai-game-workbench.storage-open.asar")
    script = r"""
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  const bundle = path.resolve('newIDE/electron-app/app/external/ai-game-workbench.storage-open.asar');
  const mod = await import(pathToFileURL(path.join(bundle, 'server', 'app.js')).href);
  const storageDir = path.join(process.env.TEMP || process.env.TMPDIR, 'ai-game-workbench-asar-smoke-storage');
  const app = mod.createApp({
    storageDir,
    presetsDir: path.join(bundle, 'server', 'presets'),
    ffmpegPath: path.resolve('newIDE/electron-app/app/external/ai-game-workbench.storage-open.asar.unpacked/bin/' + (process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg')),
    module01CharacterExportDir: path.join(storageDir, 'exports', 'Character_2D'),
    port: 0
  });
  await app.ready();
  const res = await app.inject({ method: 'GET', url: '/api/health' });
  const body = res.json();
  console.log('ai-game-workbench.storage-open.asar smoke:', res.statusCode, body.ok);
  if (res.statusCode !== 200 || body.ok !== true) {
    throw new Error('AI Game Workbench health check failed.');
  }
  await app.close();
})().catch(error => {
  console.error(error);
  process.exit(1);
});
"""
    env = os.environ.copy()
    env["ELECTRON_RUN_AS_NODE"] = "1"
    run([electron_path, "-e", script], cwd=REPO_ROOT, env=env)


def smoke_test_gorest_spritesheet(electron_path: Path) -> None:
    log("Smoke testing gorest-spritesheet.asar")
    script = r"""
const fs = require('fs');
const path = require('path');
const bundle = path.resolve('newIDE/electron-app/app/external/gorest-spritesheet.asar');
const indexPath = path.join(bundle, 'web', 'index.html');
if (!fs.existsSync(indexPath)) {
  throw new Error('gorest-spritesheet.asar web/index.html was not found.');
}
console.log('gorest-spritesheet.asar smoke:', indexPath);
"""
    env = os.environ.copy()
    env["ELECTRON_RUN_AS_NODE"] = "1"
    run([electron_path, "-e", script], cwd=REPO_ROOT, env=env)


def smoke_test_advanced_tween_editor(electron_path: Path) -> None:
    log("Smoke testing advanced-tween-editor.asar")
    script = r"""
const fs = require('fs');
const path = require('path');
const bundle = path.resolve('newIDE/electron-app/app/external/advanced-tween-editor.asar');
const indexPath = path.join(bundle, 'web', 'index.html');
if (!fs.existsSync(indexPath)) {
  throw new Error('advanced-tween-editor.asar web/index.html was not found.');
}
console.log('advanced-tween-editor.asar smoke:', indexPath);
"""
    env = os.environ.copy()
    env["ELECTRON_RUN_AS_NODE"] = "1"
    run([electron_path, "-e", script], cwd=REPO_ROOT, env=env)


def build_image_extender(args: argparse.Namespace) -> None:
    upstream = ensure_submodule("ThirdParties/image-extender", args.pull)
    ensure_next_standalone_output(upstream)
    ensure_npm_install(upstream, args.skip_install)

    if not args.skip_build:
        log("Building image-extender")
        run([npm_command(), "run", "build"], cwd=upstream)

    standalone_dir = upstream / ".next" / "standalone"
    assert_exists(standalone_dir, "directory")

    staging = Path(tempfile.gettempdir()) / "gdevelop-image-extender-electron"
    log(f"Staging image-extender runtime in {staging}")
    remove_safe(staging, Path(tempfile.gettempdir()))
    staging.mkdir(parents=True, exist_ok=True)

    copy_file(standalone_dir / "package.json", staging / "package.json")
    copy_directory(standalone_dir / "node_modules", staging / "node_modules")
    copy_directory(standalone_dir / ".next", staging / ".next")
    copy_directory(upstream / ".next" / "static", staging / ".next" / "static")
    copy_file(upstream / "LICENSE", staging / "LICENSE")
    copy_file(upstream / "README.md", staging / "README.md")
    remove_safe(staging / "server.js", staging)

    ensure_electron_packaging_dependencies(args.skip_install)
    EXTERNAL_DIR.mkdir(parents=True, exist_ok=True)
    asar_path = EXTERNAL_DIR / "image-extender.asar"

    log(f"Packing {asar_path}")
    remove_safe(asar_path, EXTERNAL_DIR)
    run([electron_bin("asar"), "pack", staging, asar_path], cwd=REPO_ROOT)

    if not args.skip_smoke_test:
        smoke_test_image_extender(electron_bin("electron"))


def build_ai_game_workbench(args: argparse.Namespace) -> None:
    upstream = ensure_submodule("ThirdParties/ai_game_workbench", args.pull)
    ensure_ai_game_workbench_electron_compatibility(upstream)
    ensure_npm_install(upstream, args.skip_install)

    if not args.skip_build:
        log("Building ai_game_workbench")
        run([npm_command(), "run", "build"], cwd=upstream)

    staging = Path(tempfile.gettempdir()) / "gdevelop-ai-game-workbench-electron"
    log(f"Staging ai_game_workbench runtime in {staging}")
    remove_safe(staging, Path(tempfile.gettempdir()))
    (staging / "server").mkdir(parents=True, exist_ok=True)
    (staging / "web").mkdir(parents=True, exist_ok=True)
    (staging / "bin").mkdir(parents=True, exist_ok=True)

    copy_directory_contents(upstream / "apps" / "web" / "dist", staging / "web")
    copy_directory(upstream / "presets", staging / "server" / "presets")
    copy_file(upstream / "LICENSE", staging / "LICENSE")
    copy_file(upstream / "README.md", staging / "README.md")
    ffmpeg_binary = find_ffmpeg_static_binary(upstream)
    staged_ffmpeg = staging / "bin" / ffmpeg_binary_name()
    copy_file(ffmpeg_binary, staged_ffmpeg)

    esbuild_path = upstream / "node_modules" / ".bin" / executable_name("esbuild")
    assert_exists(esbuild_path, "file")

    log("Bundling ai_game_workbench server entry")
    run(
        [
            esbuild_path,
            "apps/server/src/app.ts",
            "--bundle",
            "--platform=node",
            "--format=esm",
            "--target=node20",
            "--tsconfig=tsconfig.base.json",
            f"--outfile={staging / 'server' / 'app.js'}",
            "--external:sharp",
            "--banner:js=import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
        ],
        cwd=upstream,
    )

    log("Installing ai_game_workbench staged native runtime dependencies")
    run([npm_command(), "init", "-y"], cwd=staging)
    run(
        [
            npm_command(),
            "pkg",
            "set",
            "type=module",
            "private=true",
            "dependencies.sharp=^0.34.5",
        ],
        cwd=staging,
    )
    run([npm_command(), "install", "--omit=dev", "--no-audit", "--no-fund"], cwd=staging)
    remove_safe(staging / "package-lock.json", staging)

    ensure_electron_packaging_dependencies(args.skip_install)
    EXTERNAL_DIR.mkdir(parents=True, exist_ok=True)
    asar_path = EXTERNAL_DIR / "ai-game-workbench.storage-open.asar"
    unpacked_path = Path(f"{asar_path}.unpacked")

    log(f"Packing {asar_path}")
    remove_safe_with_lock_kill(asar_path, EXTERNAL_DIR)
    remove_safe_with_lock_kill(unpacked_path, EXTERNAL_DIR)

    run(
        [
            electron_bin("asar"),
            "pack",
            "--unpack",
            "**/*.{node,dll,exe}",
            staging,
            asar_path,
        ],
        cwd=REPO_ROOT,
    )

    # The macOS/Linux ffmpeg-static binary has no extension, so it is not
    # matched by the native-module unpack glob above. Keep an explicit sidecar
    # copy for every platform because executable files cannot be launched from
    # inside an ASAR archive.
    copy_file(staged_ffmpeg, unpacked_path / "bin" / ffmpeg_binary_name())

    if not args.skip_smoke_test:
        smoke_test_ai_game_workbench(electron_bin("electron"))


def build_gorest_spritesheet(args: argparse.Namespace) -> None:
    upstream = ensure_submodule(
        "ThirdParties/gorest-2d-animation-spritesheet-generator",
        args.pull,
    )
    ensure_npm_install(upstream, args.skip_install)

    if not args.skip_build:
        log("Building gorest-2d-animation-spritesheet-generator")
        run([npm_command(), "run", "build"], cwd=upstream)

    dist_dir = upstream / "dist"
    assert_exists(dist_dir / "index.html", "file")

    staging = Path(tempfile.gettempdir()) / "gdevelop-gorest-spritesheet-electron"
    log(f"Staging gorest spritesheet runtime in {staging}")
    remove_safe(staging, Path(tempfile.gettempdir()))
    (staging / "web").mkdir(parents=True, exist_ok=True)

    copy_directory_contents(dist_dir, staging / "web")
    copy_file(upstream / "LICENSE", staging / "LICENSE")
    copy_file(upstream / "README.md", staging / "README.md")
    copy_file(upstream / "package.json", staging / "package.json")

    ensure_electron_packaging_dependencies(args.skip_install)
    EXTERNAL_DIR.mkdir(parents=True, exist_ok=True)
    asar_path = EXTERNAL_DIR / "gorest-spritesheet.asar"

    log(f"Packing {asar_path}")
    remove_safe_with_lock_kill(asar_path, EXTERNAL_DIR)
    run([electron_bin("asar"), "pack", staging, asar_path], cwd=REPO_ROOT)

    if not args.skip_smoke_test:
        smoke_test_gorest_spritesheet(electron_bin("electron"))


def build_advanced_tween_editor(args: argparse.Namespace) -> None:
    upstream = ensure_submodule("ThirdParties/AdvancedTweenEditor", args.pull)
    assert_exists(upstream / "index.html", "file")

    staging = Path(tempfile.gettempdir()) / "gdevelop-advanced-tween-editor-electron"
    log(f"Staging AdvancedTween Editor runtime in {staging}")
    remove_safe(staging, Path(tempfile.gettempdir()))
    (staging / "web").mkdir(parents=True, exist_ok=True)

    copy_file(upstream / "index.html", staging / "web" / "index.html")
    copy_directory_contents(upstream / "css", staging / "web" / "css")
    copy_directory_contents(upstream / "js", staging / "web" / "js")
    copy_directory_contents(upstream / "vendor", staging / "web" / "vendor")
    copy_file(upstream / "README.md", staging / "README.md")

    ensure_electron_packaging_dependencies(args.skip_install)
    EXTERNAL_DIR.mkdir(parents=True, exist_ok=True)
    asar_path = EXTERNAL_DIR / "advanced-tween-editor.asar"

    log(f"Packing {asar_path}")
    remove_safe_with_lock_kill(asar_path, EXTERNAL_DIR)
    run([electron_bin("asar"), "pack", staging, asar_path], cwd=REPO_ROOT)

    if not args.skip_smoke_test:
        smoke_test_advanced_tween_editor(electron_bin("electron"))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build third-party Electron ASAR artifacts."
    )
    parser.add_argument(
        "--target",
        choices=(
            "all",
            "ai-game-workbench",
            "image-extender",
            "gorest-spritesheet",
            "advanced-tween-editor",
        ),
        default="all",
        help="Build all ASARs, or only one target.",
    )
    parser.add_argument(
        "--pull",
        action="store_true",
        help="Pull latest upstream commits in selected submodules before building.",
    )
    parser.add_argument(
        "--skip-install",
        action="store_true",
        help="Skip npm install steps. Existing node_modules folders must be present.",
    )
    parser.add_argument(
        "--skip-build",
        action="store_true",
        help="Skip upstream build steps and reuse existing build output.",
    )
    parser.add_argument(
        "--skip-smoke-test",
        action="store_true",
        help="Skip Electron-as-Node smoke checks after packing.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    log(f"Building third-party ASAR target: {args.target}")

    try:
        if args.target in ("all", "image-extender"):
            build_image_extender(args)
        if args.target in ("all", "ai-game-workbench"):
            build_ai_game_workbench(args)
        if args.target in ("all", "gorest-spritesheet"):
            build_gorest_spritesheet(args)
        if args.target in ("all", "advanced-tween-editor"):
            build_advanced_tween_editor(args)
    except subprocess.CalledProcessError as error:
        print(f"Command failed with exit code {error.returncode}.", file=sys.stderr)
        return error.returncode

    log("Done")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
