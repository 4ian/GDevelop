#!/usr/bin/env python3
"""Template for reusable end-to-end GDevelop MCP gameplay tests.

Copy this file to a descriptive name in the project's ``tests`` directory,
then customize ``build_scenario``. Keep the MCP transport, fresh-preview
lifecycle, bounded runtime inspection, JSON report, and non-zero failure exits.

The template uses only Python's standard library. GDevelop must be open with
its local MCP server enabled.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass, field
import json
import math
import os
from pathlib import Path
import sys
import time
from typing import Any
import urllib.error
import urllib.request


DEFAULT_MCP_URL = "http://127.0.0.1:32110/mcp"
PROTOCOL_VERSION = "2025-06-18"
PLACEHOLDER_PREFIX = "REPLACE_WITH_"


class ScenarioFailure(RuntimeError):
    """The preview ran, but the gameplay assertions failed."""


class McpError(RuntimeError):
    """The MCP connection or JSON-RPC request failed."""


@dataclass
class Scenario:
    """Declarative inputs and common assertions for one gameplay scenario."""

    scene_name: str
    objects: list[str]
    expected_project: str | None = None
    startup_frames: int = 3
    frame_delta_ms: float = 16.6667
    test_frames: int = 1
    inputs: list[dict[str, Any]] = field(default_factory=list)
    runtime_operations: list[dict[str, Any]] = field(default_factory=list)
    include: list[str] = field(
        default_factory=lambda: ["position", "variables", "behaviors"]
    )
    pointer_lock_click: tuple[float, float] | None = None
    pointer_lock_wait_seconds: float = 0.25
    expected_counts: dict[str, int] = field(default_factory=dict)
    count_deltas: dict[str, int] = field(default_factory=dict)
    expected_scene_variables: dict[str, Any] = field(default_factory=dict)
    scene_variable_deltas: dict[str, float] = field(default_factory=dict)
    finite_position_objects: list[str] = field(default_factory=list)
    expected_runtime_error_count: int = 0
    expected_failed_texture_count: int | None = 0
    expected_rejected_3d_object_count: int | None = 0
    screenshot_path: str = ".gdevelop/mcp-test.png"
    screenshot_width: int = 1280
    screenshot_height: int = 720


def build_scenario() -> Scenario:
    """Customize this function after copying the template.

    Common runtime operation examples:

    ``{"type": "setVariable", "scope": "scene", "name": "Score", "value": 0}``
    ``{"type": "moveInstance", "objectName": "Player", "index": 0,
       "x": 100, "y": 200}``
    ``{"type": "deleteAllInstances", "objectName": "Enemy"}``

    Common input examples:

    ``{"type": "keyPressed", "key": "Space"}``
    ``{"type": "mouseButtonPressed", "button": "Left", "x": 640, "y": 360}``
    ``{"type": "clickAndHold", "button": "Left", "x": 640, "y": 360,
       "frames": 2}``
    """

    return Scenario(
        expected_project=None,
        scene_name="REPLACE_WITH_SCENE_NAME",
        objects=["REPLACE_WITH_OBJECT_NAME"],
        runtime_operations=[],
        inputs=[],
        test_frames=1,
        # Prefer exact end-state assertions when possible.
        expected_counts={"REPLACE_WITH_OBJECT_NAME": 1},
        # Or assert changes relative to the arranged pre-action snapshot.
        count_deltas={},
        expected_scene_variables={},
        scene_variable_deltas={},
        finite_position_objects=[],
        # Set to (x, y) only when the scenario must acquire pointer lock.
        pointer_lock_click=None,
        screenshot_path=".gdevelop/replace-with-test-name.png",
    )


class McpHttpClient:
    """Minimal Streamable HTTP MCP client with no third-party dependencies."""

    def __init__(self, url: str, timeout_seconds: float) -> None:
        self.url = url
        self.timeout_seconds = timeout_seconds
        self.protocol_version = PROTOCOL_VERSION
        self.session_id: str | None = None
        self.request_id = 0

    def initialize(self) -> dict[str, Any]:
        response = self._request(
            "initialize",
            {
                "protocolVersion": PROTOCOL_VERSION,
                "capabilities": {},
                "clientInfo": {
                    "name": "gdevelop-mcp-gameplay-test",
                    "version": "1.0.0",
                },
            },
        )
        result = self._rpc_result(response)
        self.protocol_version = str(
            result.get("protocolVersion", PROTOCOL_VERSION)
        )
        self._notify("notifications/initialized", {})
        return result

    def call_tool(
        self, name: str, arguments: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        response = self._request(
            "tools/call",
            {"name": name, "arguments": arguments or {}},
        )
        result = self._rpc_result(response)
        if result.get("isError"):
            raise McpError(f"{name} returned isError: {result!r}")
        return self._extract_tool_payload(name, result)

    def _request(self, method: str, params: dict[str, Any]) -> dict[str, Any]:
        self.request_id += 1
        response = self._post(
            {
                "jsonrpc": "2.0",
                "id": self.request_id,
                "method": method,
                "params": params,
            }
        )
        if response is None:
            raise McpError(f"{method} returned an empty response")
        return response

    def _notify(self, method: str, params: dict[str, Any]) -> None:
        self._post({"jsonrpc": "2.0", "method": method, "params": params})

    def _post(self, payload: dict[str, Any]) -> dict[str, Any] | None:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "MCP-Protocol-Version": self.protocol_version,
        }
        if self.session_id:
            headers["Mcp-Session-Id"] = self.session_id

        request = urllib.request.Request(
            self.url,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST",
        )
        try:
            with urllib.request.urlopen(
                request, timeout=self.timeout_seconds
            ) as response:
                session_id = response.headers.get("Mcp-Session-Id")
                if session_id:
                    self.session_id = session_id
                content_type = response.headers.get("Content-Type", "")
                body = response.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as error:
            body = error.read().decode("utf-8", "replace")
            raise McpError(
                f"MCP HTTP {error.code} for {payload['method']}: {body}"
            ) from error
        except urllib.error.URLError as error:
            raise McpError(
                f"Cannot reach GDevelop MCP at {self.url}: {error}"
            ) from error

        if not body.strip():
            return None
        if "text/event-stream" in content_type:
            return self._parse_sse(body)
        try:
            parsed = json.loads(body)
        except json.JSONDecodeError as error:
            raise McpError(f"Invalid MCP JSON response: {body[:500]}") from error
        if not isinstance(parsed, dict):
            raise McpError(f"Unexpected MCP response: {parsed!r}")
        return parsed

    @staticmethod
    def _parse_sse(body: str) -> dict[str, Any]:
        events: list[dict[str, Any]] = []
        data_lines: list[str] = []
        for line in body.splitlines() + [""]:
            if line.startswith("data:"):
                data_lines.append(line[5:].lstrip())
            elif not line and data_lines:
                raw = "\n".join(data_lines)
                data_lines = []
                try:
                    event = json.loads(raw)
                except json.JSONDecodeError:
                    continue
                if isinstance(event, dict):
                    events.append(event)
        if not events:
            raise McpError(f"No JSON-RPC event found in SSE response: {body[:500]}")
        return events[-1]

    @staticmethod
    def _rpc_result(response: dict[str, Any]) -> dict[str, Any]:
        if "error" in response:
            raise McpError(f"JSON-RPC error: {response['error']!r}")
        result = response.get("result")
        if not isinstance(result, dict):
            raise McpError(f"Missing JSON-RPC result: {response!r}")
        return result

    @staticmethod
    def _extract_tool_payload(
        tool_name: str, result: dict[str, Any]
    ) -> dict[str, Any]:
        structured = result.get("structuredContent")
        if isinstance(structured, dict):
            return structured
        for item in result.get("content", []):
            if not isinstance(item, dict) or item.get("type") != "text":
                continue
            text = item.get("text")
            if not isinstance(text, str):
                continue
            try:
                parsed = json.loads(text)
            except json.JSONDecodeError:
                continue
            if isinstance(parsed, dict):
                return parsed
        raise McpError(f"{tool_name} returned no structured JSON payload")


def log_step(message: str) -> None:
    print(f"[gdevelop-mcp-test] {message}", file=sys.stderr, flush=True)


def require_success(tool_name: str, payload: dict[str, Any]) -> None:
    if payload.get("success") is not True:
        raise ScenarioFailure(f"{tool_name} failed: {payload!r}")


def runtime_scene(payload: dict[str, Any], scene_name: str) -> dict[str, Any]:
    runtime = payload.get("runtime")
    if not isinstance(runtime, dict) or runtime.get("available") is not True:
        raise ScenarioFailure("Runtime state is unavailable")
    for scene in runtime.get("scenes", []):
        if isinstance(scene, dict) and scene.get("name") == scene_name:
            return scene
    raise ScenarioFailure(f"Runtime scene {scene_name!r} was not found")


def object_count(scene: dict[str, Any], object_name: str) -> int:
    value = scene.get("objectInstanceCounts", {}).get(object_name)
    if not isinstance(value, int):
        raise ScenarioFailure(f"No runtime count for object {object_name!r}")
    return value


def scene_variable(scene: dict[str, Any], variable_name: str) -> Any:
    variables = scene.get("sceneVariables", {})
    if variable_name not in variables:
        raise ScenarioFailure(f"No scene variable {variable_name!r}")
    return variables[variable_name]


def first_instance_position(
    scene: dict[str, Any], object_name: str
) -> dict[str, float]:
    states = scene.get("instanceStates", {}).get(object_name, [])
    if not states:
        raise ScenarioFailure(f"No inspected instance for {object_name!r}")
    position = states[0].get("position")
    if not isinstance(position, dict):
        raise ScenarioFailure(f"No position for {object_name!r} instance 0")
    xyz = {axis: position.get(axis) for axis in ("x", "y", "z")}
    if not all(
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and math.isfinite(float(value))
        for value in xyz.values()
    ):
        raise ScenarioFailure(f"Non-finite position for {object_name!r}: {xyz!r}")
    return {axis: float(value) for axis, value in xyz.items()}


def base_renderer_diagnostics(payload: dict[str, Any]) -> dict[str, Any] | None:
    diagnostics = payload.get("rendererDiagnostics")
    if not isinstance(diagnostics, dict) or diagnostics.get("available") is not True:
        return None
    for scene in diagnostics.get("scenes", []):
        if not isinstance(scene, dict):
            continue
        for layer in scene.get("layers", []):
            if isinstance(layer, dict) and layer.get("layerName") == "":
                return layer
    return None


def validate_scenario(scenario: Scenario) -> None:
    values: list[str] = [scenario.scene_name, *scenario.objects]
    values.extend(scenario.expected_counts)
    values.extend(scenario.count_deltas)
    values.extend(scenario.finite_position_objects)
    placeholders = [
        value
        for value in values
        if isinstance(value, str) and value.startswith(PLACEHOLDER_PREFIX)
    ]
    if placeholders:
        raise ValueError(
            "Copy and customize build_scenario before running this template; "
            f"unresolved placeholders: {sorted(set(placeholders))!r}"
        )
    if not scenario.objects:
        raise ValueError("Scenario.objects must contain bounded inspection targets")
    if scenario.startup_frames < 1 or scenario.test_frames < 1:
        raise ValueError("Frame counts must be positive")


def acquire_pointer_lock(
    client: McpHttpClient,
    debugger_id: str,
    click: tuple[float, float],
    wait_seconds: float,
) -> None:
    """Acquire pointer lock before returning to deterministic paused stepping."""

    x, y = click
    play = client.call_tool(
        "control_preview",
        {
            "debugger_id": debugger_id,
            "action": "play",
            "timeout_ms": 5_000,
        },
    )
    require_success("control_preview(play)", play)
    click_result = client.call_tool(
        "simulate_preview_input",
        {
            "debugger_id": debugger_id,
            "inputs": [
                {"type": "mouseMove", "x": x, "y": y},
                {
                    "type": "mouseButtonPressed",
                    "button": "Left",
                    "x": x,
                    "y": y,
                },
                {
                    "type": "mouseButtonReleased",
                    "button": "Left",
                    "x": x,
                    "y": y,
                },
            ],
            "confirm": True,
        },
    )
    require_success("simulate_preview_input(pointer lock)", click_result)
    time.sleep(wait_seconds)
    pause = client.call_tool(
        "control_preview",
        {
            "debugger_id": debugger_id,
            "action": "pause",
            "timeout_ms": 5_000,
        },
    )
    require_success("control_preview(pause)", pause)


def arrange_scenario(
    client: McpHttpClient, debugger_id: str, scenario: Scenario
) -> None:
    """Apply optional test-only state operations while the preview is paused."""

    if not scenario.runtime_operations:
        return
    result = client.call_tool(
        "set_runtime_state",
        {
            "debugger_id": debugger_id,
            "operations": scenario.runtime_operations,
        },
    )
    require_success("set_runtime_state", result)


def act_scenario(
    client: McpHttpClient, debugger_id: str, scenario: Scenario
) -> dict[str, Any]:
    """Inject the configured inputs and advance deterministic test frames."""

    if scenario.pointer_lock_click is not None:
        acquire_pointer_lock(
            client,
            debugger_id,
            scenario.pointer_lock_click,
            scenario.pointer_lock_wait_seconds,
        )
    result = client.call_tool(
        "run_frames",
        {
            "debugger_id": debugger_id,
            "frames": scenario.test_frames,
            "frame_delta_ms": scenario.frame_delta_ms,
            "inputs": scenario.inputs,
            "objects": scenario.objects,
            "include": scenario.include,
            "auto_release": True,
        },
    )
    require_success("run_frames(action)", result)
    return result


def assert_scenario(
    before_payload: dict[str, Any],
    after_payload: dict[str, Any],
    scenario: Scenario,
) -> dict[str, Any]:
    """Evaluate common assertions; add scenario-specific assertions here."""

    before = runtime_scene(before_payload, scenario.scene_name)
    after = runtime_scene(after_payload, scenario.scene_name)

    for object_name, expected in scenario.expected_counts.items():
        actual = object_count(after, object_name)
        if actual != expected:
            raise ScenarioFailure(
                f"{object_name} count: expected {expected}, got {actual}"
            )

    for object_name, expected_delta in scenario.count_deltas.items():
        actual_delta = object_count(after, object_name) - object_count(
            before, object_name
        )
        if actual_delta != expected_delta:
            raise ScenarioFailure(
                f"{object_name} count delta: expected {expected_delta}, "
                f"got {actual_delta}"
            )

    for variable_name, expected in scenario.expected_scene_variables.items():
        actual = scene_variable(after, variable_name)
        if actual != expected:
            raise ScenarioFailure(
                f"Scene variable {variable_name}: expected {expected!r}, "
                f"got {actual!r}"
            )

    for variable_name, expected_delta in scenario.scene_variable_deltas.items():
        before_value = scene_variable(before, variable_name)
        after_value = scene_variable(after, variable_name)
        if not isinstance(before_value, (int, float)) or not isinstance(
            after_value, (int, float)
        ):
            raise ScenarioFailure(
                f"Scene variable {variable_name!r} is not numeric"
            )
        actual_delta = float(after_value) - float(before_value)
        if not math.isclose(actual_delta, expected_delta, abs_tol=1e-9):
            raise ScenarioFailure(
                f"Scene variable {variable_name} delta: "
                f"expected {expected_delta}, got {actual_delta}"
            )

    finite_positions = {
        object_name: first_instance_position(after, object_name)
        for object_name in scenario.finite_position_objects
    }

    errors = after_payload.get("errors", [])
    if len(errors) != scenario.expected_runtime_error_count:
        raise ScenarioFailure(
            f"Runtime error count: expected "
            f"{scenario.expected_runtime_error_count}, got {len(errors)}; "
            f"errors={errors!r}"
        )

    renderer = base_renderer_diagnostics(after_payload)
    if renderer is not None:
        if (
            scenario.expected_failed_texture_count is not None
            and renderer.get("failedTextureCount")
            != scenario.expected_failed_texture_count
        ):
            raise ScenarioFailure(
                f"Failed texture count: expected "
                f"{scenario.expected_failed_texture_count}, got "
                f"{renderer.get('failedTextureCount')}"
            )
        if (
            scenario.expected_rejected_3d_object_count is not None
            and renderer.get("rejected3DRendererObjectCount")
            != scenario.expected_rejected_3d_object_count
        ):
            raise ScenarioFailure(
                f"Rejected 3D object count: expected "
                f"{scenario.expected_rejected_3d_object_count}, got "
                f"{renderer.get('rejected3DRendererObjectCount')}"
            )

    # Add narrow, scenario-specific assertions above this return when the
    # declarative count/variable/position checks are not sufficient.
    return {
        "objectCounts": {
            object_name: object_count(after, object_name)
            for object_name in scenario.objects
        },
        "finitePositions": finite_positions,
        "runtimeErrorCount": len(errors),
        "rendererFailedTextureCount": (
            renderer.get("failedTextureCount") if renderer else None
        ),
        "rendererRejected3DObjectCount": (
            renderer.get("rejected3DRendererObjectCount") if renderer else None
        ),
    }


def run_scenario(args: argparse.Namespace) -> dict[str, Any]:
    scenario = build_scenario()
    validate_scenario(scenario)

    client = McpHttpClient(args.url, args.http_timeout)
    debugger_id: str | None = None
    try:
        log_step("Initialize MCP and verify the open project")
        server = client.initialize()
        editor = client.call_tool("gdevelop_get_editor_state")
        if editor.get("hasProject") is not True:
            raise ScenarioFailure("No project is open in GDevelop")
        if (
            scenario.expected_project is not None
            and editor.get("projectName") != scenario.expected_project
        ):
            raise ScenarioFailure(
                f"Expected project {scenario.expected_project!r}, "
                f"but {editor.get('projectName')!r} is open"
            )
        if scenario.scene_name not in editor.get("sceneNames", []):
            raise ScenarioFailure(
                f"Scene {scenario.scene_name!r} is not in the open project"
            )

        log_step("Close stale previews and launch a fresh paused preview")
        client.call_tool(
            "control_preview",
            {"action": "close", "close_all": True, "timeout_ms": 5_000},
        )
        launch = client.call_tool(
            "launch_preview",
            {
                "scene_name": scenario.scene_name,
                "start_paused": True,
                "force_new": True,
                "timeout_ms": 30_000,
            },
        )
        require_success("launch_preview", launch)
        debugger_id = launch.get("debuggerId")
        if not isinstance(debugger_id, str) or not debugger_id:
            raise ScenarioFailure("launch_preview returned no debugger id")
        if launch.get("actualScene") != scenario.scene_name:
            raise ScenarioFailure(f"Preview scene mismatch: {launch!r}")

        log_step("Advance startup frames and arrange the test state")
        startup = client.call_tool(
            "run_frames",
            {
                "debugger_id": debugger_id,
                "frames": scenario.startup_frames,
                "frame_delta_ms": scenario.frame_delta_ms,
                "objects": scenario.objects,
                "include": scenario.include,
                "auto_release": True,
            },
        )
        require_success("run_frames(startup)", startup)
        arrange_scenario(client, debugger_id, scenario)

        before = client.call_tool(
            "run_frames",
            {
                "debugger_id": debugger_id,
                "frames": 1,
                "frame_delta_ms": scenario.frame_delta_ms,
                "objects": scenario.objects,
                "include": scenario.include,
                "auto_release": True,
            },
        )
        require_success("run_frames(before)", before)

        log_step("Apply scenario inputs and deterministic frames")
        act_scenario(client, debugger_id, scenario)

        log_step("Inspect and assert final runtime state")
        after = client.call_tool(
            "gdevelop_inspect_running_preview",
            {
                "debugger_id": debugger_id,
                "objects": scenario.objects,
                "include": scenario.include,
                "timeout_ms": 5_000,
            },
        )
        require_success("gdevelop_inspect_running_preview", after)
        assertions = assert_scenario(before, after, scenario)

        screenshot: dict[str, Any] | None = None
        screenshot_path: Path | None = None
        if not args.no_screenshot:
            screenshot_path = Path(scenario.screenshot_path).expanduser().resolve()
            log_step(f"Capture screenshot at {screenshot_path}")
            screenshot = client.call_tool(
                "capture_preview_screenshot",
                {
                    "debugger_id": debugger_id,
                    "capture_mode": "canvas",
                    "canvas_only": True,
                    "exact_game_resolution": True,
                    "target_width": scenario.screenshot_width,
                    "target_height": scenario.screenshot_height,
                    "file_path": str(screenshot_path),
                    "retry_count": 3,
                },
            )
            require_success("capture_preview_screenshot", screenshot)

        return {
            "passed": True,
            "project": editor.get("projectName"),
            "scene": scenario.scene_name,
            "debuggerId": debugger_id,
            "mcpServer": server.get("serverInfo"),
            "assertions": assertions,
            "screenshot": (
                {
                    "path": str(screenshot_path),
                    "pixelHash": screenshot.get("quality", {}).get("pixelHash"),
                }
                if screenshot and screenshot_path
                else None
            ),
        }
    finally:
        if debugger_id and not args.keep_preview_open:
            log_step("Close the test preview")
            try:
                client.call_tool(
                    "control_preview",
                    {
                        "debugger_id": debugger_id,
                        "action": "close",
                        "close_all": True,
                        "timeout_ms": 5_000,
                    },
                )
            except Exception as error:
                log_step(f"Preview cleanup warning: {error}")


def run_self_test() -> dict[str, Any]:
    """Exercise transport parsers and runtime helpers without GDevelop."""

    sse = (
        "event: message\n"
        'data: {"jsonrpc":"2.0","id":1,"result":{"ok":true}}\n\n'
    )
    parsed_sse = McpHttpClient._parse_sse(sse)
    assert parsed_sse["result"]["ok"] is True

    structured = McpHttpClient._extract_tool_payload(
        "self-test",
        {"structuredContent": {"success": True}},
    )
    assert structured == {"success": True}

    text_payload = McpHttpClient._extract_tool_payload(
        "self-test",
        {
            "content": [
                {"type": "text", "text": '{"success":true,"value":3}'}
            ]
        },
    )
    assert text_payload["value"] == 3

    synthetic = {
        "runtime": {
            "available": True,
            "scenes": [
                {
                    "name": "SelfTest",
                    "objectInstanceCounts": {"Object": 1},
                    "sceneVariables": {"Score": 2},
                    "instanceStates": {
                        "Object": [
                            {"position": {"x": 1, "y": 2, "z": 3}}
                        ]
                    },
                }
            ],
        }
    }
    scene = runtime_scene(synthetic, "SelfTest")
    assert object_count(scene, "Object") == 1
    assert scene_variable(scene, "Score") == 2
    assert first_instance_position(scene, "Object") == {
        "x": 1.0,
        "y": 2.0,
        "z": 3.0,
    }
    return {"passed": True, "selfTest": "transport and runtime helpers"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--url",
        default=os.environ.get("GDEVELOP_MCP_URL", DEFAULT_MCP_URL),
        help="GDevelop Streamable HTTP MCP endpoint",
    )
    parser.add_argument("--http-timeout", type=float, default=35.0)
    parser.add_argument("--no-screenshot", action="store_true")
    parser.add_argument("--keep-preview-open", action="store_true")
    parser.add_argument(
        "--self-test",
        action="store_true",
        help="Test template helpers without connecting to GDevelop",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        report = run_self_test() if args.self_test else run_scenario(args)
    except ScenarioFailure as error:
        print(
            json.dumps(
                {"passed": False, "failureType": "assertion", "error": str(error)},
                indent=2,
            )
        )
        return 1
    except (McpError, OSError, ValueError, AssertionError) as error:
        print(
            json.dumps(
                {
                    "passed": False,
                    "failureType": "infrastructure",
                    "error": str(error),
                },
                indent=2,
            )
        )
        return 2
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
