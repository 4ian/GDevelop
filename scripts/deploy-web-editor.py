#!/usr/bin/env python3
"""Build and deploy the GDevelop web editor to a remote Linux server.

The script uploads the static React build over SSH, installs/configures Nginx
when requested, and switches the remote web root atomically through a
``current`` symlink.
"""

from __future__ import annotations

import argparse
import os
import pathlib
import posixpath
import re
import shlex
import subprocess
import sys
import tarfile
import tempfile
import time
from typing import Optional

try:
    import paramiko
except ImportError:  # pragma: no cover - depends on local environment.
    paramiko = None


REPO_ROOT = pathlib.Path(__file__).resolve().parents[1]
DEFAULT_BUILD_DIR = REPO_ROOT / "newIDE" / "app" / "build"
DEFAULT_APP_DIR = REPO_ROOT / "newIDE" / "app"


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(line_buffering=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build and deploy the GDevelop web editor to a remote server.",
        epilog='Usage: python scripts\\deploy-web-editor.py --host 8.153.146.11 --user root --password "<password>"',
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument("--host", required=True, help="Remote server host or IP.")
    parser.add_argument("--user", required=True, help="SSH user.")
    parser.add_argument("--port", type=int, default=22, help="SSH port. Defaults to 22.")
    parser.add_argument(
        "--password",
        required=True,
        help="SSH password.",
    )
    parser.add_argument(
        "--remote-path",
        default="/var/www/gdevelop-editor",
        help="Remote deployment directory. Defaults to /var/www/gdevelop-editor.",
    )
    parser.add_argument(
        "--build-dir",
        default=str(DEFAULT_BUILD_DIR),
        help="Local build directory to upload. Defaults to newIDE/app/build.",
    )
    parser.add_argument(
        "--app-dir",
        default=str(DEFAULT_APP_DIR),
        help="Local app directory used for npm build. Defaults to newIDE/app.",
    )
    parser.add_argument(
        "--build-command",
        default="npm run build",
        help="Build command executed in --app-dir. Defaults to 'npm run build'.",
    )
    parser.add_argument(
        "--no-nginx",
        action="store_true",
        help="Do not install or configure Nginx.",
    )
    parser.add_argument(
        "--site-name",
        default="gdevelop-editor",
        help="Nginx site/config name. Defaults to gdevelop-editor.",
    )
    parser.add_argument(
        "--server-name",
        help="Nginx server_name value. Defaults to '<host> _'.",
    )
    parser.add_argument(
        "--nginx-port",
        type=int,
        default=80,
        help="Nginx listen port. Defaults to 80.",
    )
    parser.add_argument(
        "--keep-releases",
        type=int,
        default=3,
        help="Number of old releases to keep on the server. Defaults to 3.",
    )
    return parser.parse_args()


def require_paramiko() -> None:
    if paramiko is None:
        raise SystemExit(
            "paramiko is required for password-based SSH. Install it with "
            "'python -m pip install paramiko' or use an environment that already "
            "provides it."
        )


def validate_args(args: argparse.Namespace) -> None:
    if not re.fullmatch(r"[A-Za-z0-9_.-]+", args.site_name):
        raise SystemExit("--site-name can only contain letters, numbers, dots, dashes, and underscores.")
    if args.nginx_port < 1 or args.nginx_port > 65535:
        raise SystemExit("--nginx-port must be between 1 and 65535.")
    if args.keep_releases < 1:
        raise SystemExit("--keep-releases must be at least 1.")
    if not args.remote_path.startswith("/"):
        raise SystemExit("--remote-path must be an absolute Linux path.")


def run_local_build(args: argparse.Namespace) -> float:
    app_dir = pathlib.Path(args.app_dir).resolve()
    if not app_dir.exists():
        raise SystemExit(f"App directory does not exist: {app_dir}")

    env = os.environ.copy()
    env.setdefault("CI", "false")
    build_started_at = time.time()
    print(f"Building web editor with '{args.build_command}' in {app_dir}...")
    result = subprocess.run(args.build_command, cwd=str(app_dir), env=env, shell=True)
    if result.returncode != 0:
        raise SystemExit(f"Build failed with exit code {result.returncode}.")
    print("Local web editor build completed.")
    return build_started_at


def assert_build_dir(build_dir: pathlib.Path, build_started_at: float) -> None:
    required_files = ["index.html", "asset-manifest.json", "libGD.js", "libGD.wasm"]
    missing = [name for name in required_files if not (build_dir / name).exists()]
    if missing:
        raise SystemExit(
            f"Build directory is missing required file(s): {', '.join(missing)}. "
            "The deployment was stopped before upload."
        )
    index_html_mtime = (build_dir / "index.html").stat().st_mtime
    if index_html_mtime + 2 < build_started_at:
        raise SystemExit(
            "Build output does not look freshly generated. "
            "The deployment was stopped before upload."
        )


def create_archive(build_dir: pathlib.Path, build_started_at: float) -> pathlib.Path:
    assert_build_dir(build_dir, build_started_at)
    archive_path = pathlib.Path(tempfile.gettempdir()) / (
        f"gdevelop-editor-{int(time.time())}.tar.gz"
    )
    print(f"Packaging {build_dir} into {archive_path}...")
    with tarfile.open(archive_path, "w:gz") as tar:
        for item in build_dir.rglob("*"):
            tar.add(item, arcname=item.relative_to(build_dir))
    return archive_path


def connect(args: argparse.Namespace):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"Connecting to {args.user}@{args.host}:{args.port}...")
    client.connect(
        args.host,
        port=args.port,
        username=args.user,
        password=args.password,
        look_for_keys=False,
        allow_agent=False,
        timeout=30,
        banner_timeout=30,
        auth_timeout=30,
    )
    return client


def remote_quote(value: str) -> str:
    return shlex.quote(value)


def run_remote(client, command: str, *, label: Optional[str] = None) -> None:
    if label:
        print(label)

    wrapped = f"bash -lc {remote_quote(command)}"
    transport = client.get_transport()
    if transport is None:
        raise RuntimeError("SSH transport is not connected.")

    channel = transport.open_session()
    channel.exec_command(wrapped)
    stdout = bytearray()
    stderr = bytearray()

    while True:
        if channel.recv_ready():
            chunk = channel.recv(4096)
            stdout.extend(chunk)
            sys.stdout.write(chunk.decode("utf-8", errors="replace"))
            sys.stdout.flush()
        if channel.recv_stderr_ready():
            chunk = channel.recv_stderr(4096)
            stderr.extend(chunk)
            sys.stderr.write(chunk.decode("utf-8", errors="replace"))
            sys.stderr.flush()
        if channel.exit_status_ready():
            while channel.recv_ready():
                chunk = channel.recv(4096)
                stdout.extend(chunk)
                sys.stdout.write(chunk.decode("utf-8", errors="replace"))
                sys.stdout.flush()
            while channel.recv_stderr_ready():
                chunk = channel.recv_stderr(4096)
                stderr.extend(chunk)
                sys.stderr.write(chunk.decode("utf-8", errors="replace"))
                sys.stderr.flush()
            break
        time.sleep(0.1)

    exit_code = channel.recv_exit_status()
    if exit_code != 0:
        raise SystemExit(f"Remote command failed with exit code {exit_code}.")


def sftp_mkdir_p(sftp, path: str) -> None:
    parts = [part for part in path.split("/") if part]
    current = "/"
    for part in parts:
        current = posixpath.join(current, part)
        try:
            sftp.stat(current)
        except IOError:
            sftp.mkdir(current)


def upload_archive(client, archive_path: pathlib.Path, remote_dir: str) -> str:
    remote_archive = posixpath.join(remote_dir, archive_path.name)
    print(f"Uploading archive to {remote_archive}...")
    with client.open_sftp() as sftp:
        sftp_mkdir_p(sftp, remote_dir)
        sftp.put(str(archive_path), remote_archive)
    return remote_archive


def nginx_config(args: argparse.Namespace, document_root: str) -> str:
    server_name = args.server_name or f"{args.host} _"
    return f"""server {{
    listen {args.nginx_port};
    listen [::]:{args.nginx_port};
    server_name {server_name};

    root {document_root};
    index index.html;

    location = /service-worker.js {{
        add_header Cache-Control "no-cache";
        try_files $uri =404;
    }}

    location ~* \\.wasm$ {{
        default_type application/wasm;
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }}

    location ~* \\.(?:js|css|png|jpg|jpeg|gif|ico|svg|webp|map|json|woff|woff2)$ {{
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }}

    location / {{
        try_files $uri $uri/ /index.html;
    }}
}}
"""


def configure_nginx(client, args: argparse.Namespace, current_link: str) -> None:
    config = nginx_config(args, current_link)
    site_available = f"/etc/nginx/sites-available/{args.site_name}"
    site_enabled = f"/etc/nginx/sites-enabled/{args.site_name}"
    conf_d = f"/etc/nginx/conf.d/{args.site_name}.conf"

    command = f"""
set -euo pipefail
if ! command -v nginx >/dev/null 2>&1; then
  if command -v apt-get >/dev/null 2>&1; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y nginx
  elif command -v dnf >/dev/null 2>&1; then
    dnf install -y nginx
  elif command -v yum >/dev/null 2>&1; then
    yum install -y nginx
  else
    echo "Nginx is not installed and no supported package manager was found." >&2
    exit 1
  fi
fi

if [ -d /etc/nginx/sites-available ] && [ -d /etc/nginx/sites-enabled ]; then
  cat > {remote_quote(site_available)} <<'NGINX_CONFIG'
{config}
NGINX_CONFIG
  ln -sfn {remote_quote(site_available)} {remote_quote(site_enabled)}
  rm -f /etc/nginx/sites-enabled/default
else
  mkdir -p /etc/nginx/conf.d
  cat > {remote_quote(conf_d)} <<'NGINX_CONFIG'
{config}
NGINX_CONFIG
fi

if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
  ufw allow {args.nginx_port}/tcp
fi

if command -v firewall-cmd >/dev/null 2>&1 && systemctl is-active --quiet firewalld; then
  firewall-cmd --permanent --add-port={args.nginx_port}/tcp
  firewall-cmd --reload
fi

nginx -t
if command -v systemctl >/dev/null 2>&1; then
  systemctl enable --now nginx
  systemctl reload nginx
else
  service nginx restart || nginx -s reload || nginx
fi
"""
    run_remote(client, command, label="Installing/configuring Nginx...")


def deploy_release(client, args: argparse.Namespace, remote_archive: str) -> str:
    release_id = time.strftime("%Y%m%d%H%M%S")
    releases_dir = posixpath.join(args.remote_path, "releases")
    release_dir = posixpath.join(releases_dir, release_id)
    current_link = posixpath.join(args.remote_path, "current")
    command = f"""
set -euo pipefail
mkdir -p {remote_quote(release_dir)}
tar -xzf {remote_quote(remote_archive)} -C {remote_quote(release_dir)}
ln -sfn {remote_quote(release_dir)} {remote_quote(current_link)}
chmod -R a+rX {remote_quote(args.remote_path)}
rm -f {remote_quote(remote_archive)}
if [ -d {remote_quote(releases_dir)} ]; then
  ls -1dt {remote_quote(releases_dir)}/* 2>/dev/null | tail -n +{args.keep_releases + 1} | xargs -r rm -rf --
fi
"""
    run_remote(client, command, label=f"Deploying release {release_id}...")
    return current_link


def main() -> None:
    require_paramiko()
    args = parse_args()
    validate_args(args)

    build_dir = pathlib.Path(args.build_dir).resolve()
    build_started_at = run_local_build(args)
    archive_path = create_archive(build_dir, build_started_at)

    client = connect(args)
    try:
        remote_archive = upload_archive(client, archive_path, args.remote_path)
        current_link = deploy_release(client, args, remote_archive)
        if not args.no_nginx:
            configure_nginx(client, args, current_link)
    finally:
        client.close()
        try:
            archive_path.unlink()
        except OSError:
            pass

    protocol = "http"
    port_suffix = "" if args.nginx_port == 80 else f":{args.nginx_port}"
    print(f"Deployment complete: {protocol}://{args.host}{port_suffix}/")


if __name__ == "__main__":
    main()
