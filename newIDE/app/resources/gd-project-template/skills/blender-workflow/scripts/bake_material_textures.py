#!/usr/bin/env python3
"""Bake reusable, glTF-friendly material textures inside Blender.

This utility reproduces the image-space material preparation workflow used for
game-ready character materials:

* deterministic RGB/HSV color adjustment with optional color mixing;
* alpha preservation (or explicit opaque/luminance alpha generation);
* tangent-style normal-map generation from a height image;
* PNG encoding that is independent of Blender's stale packed-image cache;
* round-trip pixel verification after every written PNG; and
* optional wiring into a Principled BSDF material for glTF/GLB export.

It does not perform a geometry/cage bake, ambient-occlusion bake, or projection
between high- and low-poly meshes. Use Blender's render bake workflow for those
jobs. This script is for deterministic texture conversion and PBR material
preparation.

Run it through Blender Foundation's official Blender MCP server. Load this file
with ``runpy`` and call ``run_with_arguments`` from ``execute_blender_code`` or
``execute_blender_code_for_cli``.

Recipe example (paths may be absolute or relative to the recipe file):

.. code-block:: json

    {
      "version": 1,
      "jobs": [
        {
          "name": "Hair",
          "base_color": {
            "source": "textures/hair_alpha.png",
            "output": "baked/hair_base.png",
            "hue_shift": 0.0,
            "saturation": 1.0,
            "value": 1.0,
            "rgb_scale": [1.1, 1.2, 1.3],
            "rgb_offset": [0.0, 0.0, 0.0],
            "mix_color": [1.0, 1.0, 1.0],
            "mix_factor": 0.0,
            "alpha": "preserve"
          },
          "normal": {
            "height_source": "textures/hair_height.png",
            "output": "baked/hair_normal.png",
            "channel": "luminance",
            "strength": 5.0,
            "invert_height": false,
            "flip_y": false
          },
          "material": {
            "name": "Hair",
            "create_if_missing": false,
            "replace_surface": true,
            "metallic": 0.03,
            "roughness": 0.42,
            "normal_strength": 0.35,
            "use_alpha": true,
            "double_sided": true
          }
        }
      ]
    }
"""

from __future__ import annotations

import argparse
import binascii
import hashlib
import json
import struct
import sys
import zlib
from pathlib import Path
from typing import Any, Iterable

import bpy
import numpy as np


PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
RECIPE_VERSION = 1
PIXEL_TOLERANCE = (1.5 / 255.0) + 1e-6


class MaterialBakeError(RuntimeError):
    """A user-facing material bake failure."""


def log(message: str) -> None:
    print(f"[material-bake] {message}", flush=True)


def blender_cli_arguments() -> list[str]:
    if "--" not in sys.argv:
        return []
    return sys.argv[sys.argv.index("--") + 1 :]


def parse_arguments(arguments: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Bake color-adjusted base textures and height-derived normal maps, "
            "then optionally wire them into glTF-compatible Principled materials."
        )
    )
    parser.add_argument("--recipe", required=True, help="Versioned JSON bake recipe")
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Allow replacing texture outputs that already exist",
    )
    parser.add_argument(
        "--apply-materials",
        action="store_true",
        help="Apply each job's optional material block to the open .blend",
    )
    parser.add_argument(
        "--pack-images",
        action="store_true",
        help="Pack generated images after applying them to materials",
    )
    parser.add_argument(
        "--save-blend",
        help="Save the modified scene to this new .blend path",
    )
    parser.add_argument(
        "--overwrite-blend",
        action="store_true",
        help="Allow --save-blend to replace an existing file",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate the recipe and report planned outputs without writing",
    )
    return parser.parse_args(blender_cli_arguments() if arguments is None else arguments)


def resolved_path(path_text: str, base_directory: Path) -> Path:
    path = Path(path_text).expanduser()
    if not path.is_absolute():
        path = base_directory / path
    return path.resolve()


def require_mapping(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise MaterialBakeError(f"{label} must be a JSON object")
    return value


def require_number(value: Any, label: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise MaterialBakeError(f"{label} must be a number")
    number = float(value)
    if not np.isfinite(number):
        raise MaterialBakeError(f"{label} must be finite")
    return number


def number_in_range(value: Any, label: str, minimum: float, maximum: float) -> float:
    number = require_number(value, label)
    if number < minimum or number > maximum:
        raise MaterialBakeError(
            f"{label} must be between {minimum:g} and {maximum:g}; found {number:g}"
        )
    return number


def vector3(
    value: Any,
    label: str,
    *,
    default: Iterable[float],
    minimum: float | None = None,
    maximum: float | None = None,
) -> np.ndarray:
    source = list(default) if value is None else value
    if not isinstance(source, (list, tuple)) or len(source) != 3:
        raise MaterialBakeError(f"{label} must contain exactly three numbers")
    result = np.array(
        [require_number(component, f"{label}[{index}]") for index, component in enumerate(source)],
        dtype=np.float32,
    )
    if minimum is not None and bool(np.any(result < minimum)):
        raise MaterialBakeError(f"Every {label} component must be >= {minimum:g}")
    if maximum is not None and bool(np.any(result > maximum)):
        raise MaterialBakeError(f"Every {label} component must be <= {maximum:g}")
    return result


def load_recipe(path_text: str) -> tuple[Path, list[dict[str, Any]]]:
    path = Path(path_text).expanduser().resolve()
    if not path.is_file():
        raise MaterialBakeError(f"Recipe does not exist: {path}")
    try:
        with path.open("r", encoding="utf-8-sig") as file:
            data = json.load(file)
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise MaterialBakeError(f"Cannot read recipe {path}: {error}") from error
    root = require_mapping(data, "Recipe root")
    if root.get("version") != RECIPE_VERSION:
        raise MaterialBakeError(
            f"Recipe version must be {RECIPE_VERSION}; found {root.get('version')!r}"
        )
    jobs = root.get("jobs")
    if not isinstance(jobs, list) or not jobs:
        raise MaterialBakeError("Recipe jobs must be a non-empty array")
    normalized = [require_mapping(job, f"jobs[{index}]") for index, job in enumerate(jobs)]
    return path, normalized


def source_path(config: dict[str, Any], key: str, base: Path, label: str) -> Path:
    value = config.get(key)
    if not isinstance(value, str) or not value.strip():
        raise MaterialBakeError(f"{label}.{key} must be a non-empty path")
    path = resolved_path(value, base)
    if not path.is_file():
        raise MaterialBakeError(f"{label}.{key} does not exist: {path}")
    return path


def output_path(config: dict[str, Any], key: str, base: Path, label: str) -> Path:
    value = config.get(key)
    if not isinstance(value, str) or not value.strip():
        raise MaterialBakeError(f"{label}.{key} must be a non-empty path")
    path = resolved_path(value, base)
    if path.suffix.lower() != ".png":
        raise MaterialBakeError(f"{label}.{key} must use the .png extension: {path}")
    return path


def job_name(job: dict[str, Any], index: int) -> str:
    name = job.get("name")
    if not isinstance(name, str) or not name.strip():
        raise MaterialBakeError(f"jobs[{index}].name must be a non-empty string")
    return name.strip()


def build_plan(
    recipe_path: Path,
    jobs: list[dict[str, Any]],
    *,
    overwrite: bool,
    apply_materials: bool,
) -> list[dict[str, Any]]:
    base = recipe_path.parent
    planned: list[dict[str, Any]] = []
    seen_names: set[str] = set()
    seen_outputs: set[Path] = set()
    all_sources: set[Path] = set()

    for index, job in enumerate(jobs):
        name = job_name(job, index)
        if name in seen_names:
            raise MaterialBakeError(f"Duplicate job name: {name!r}")
        seen_names.add(name)

        base_config = job.get("base_color")
        normal_config = job.get("normal")
        if base_config is None and normal_config is None:
            raise MaterialBakeError(
                f"Job {name!r} must define base_color, normal, or both"
            )

        record: dict[str, Any] = {"name": name, "recipe": job}
        if base_config is not None:
            base_map = require_mapping(base_config, f"{name}.base_color")
            base_source = source_path(base_map, "source", base, f"{name}.base_color")
            base_output = output_path(base_map, "output", base, f"{name}.base_color")
            record["base_source"] = base_source
            record["base_output"] = base_output
            all_sources.add(base_source)
            seen_outputs.add(base_output)
        if normal_config is not None:
            normal_map = require_mapping(normal_config, f"{name}.normal")
            height_source = source_path(
                normal_map, "height_source", base, f"{name}.normal"
            )
            normal_output = output_path(normal_map, "output", base, f"{name}.normal")
            record["height_source"] = height_source
            record["normal_output"] = normal_output
            all_sources.add(height_source)
            if normal_output in seen_outputs:
                raise MaterialBakeError(f"Several jobs write the same output: {normal_output}")
            seen_outputs.add(normal_output)

        material = job.get("material")
        if material is not None:
            material_map = require_mapping(material, f"{name}.material")
            material_name = material_map.get("name")
            if not isinstance(material_name, str) or not material_name.strip():
                raise MaterialBakeError(f"{name}.material.name must be non-empty")
            record["material_name"] = material_name.strip()
            if apply_materials:
                create = bool(material_map.get("create_if_missing", False))
                if bpy.data.materials.get(record["material_name"]) is None and not create:
                    raise MaterialBakeError(
                        f"Material {record['material_name']!r} does not exist for job "
                        f"{name!r}; set create_if_missing to true to create it"
                    )
        elif apply_materials:
            log(f"Job {name!r} has no material block; textures only")

        planned.append(record)

    output_list = [
        path
        for record in planned
        for key, path in record.items()
        if key in {"base_output", "normal_output"}
    ]
    if len(set(output_list)) != len(output_list):
        raise MaterialBakeError("Several jobs write the same output path")
    for path in output_list:
        if path in all_sources:
            raise MaterialBakeError(f"An output cannot overwrite a recipe source: {path}")
        if path.exists() and not overwrite:
            raise MaterialBakeError(
                f"Output already exists; pass --overwrite to replace it: {path}"
            )
    return planned


def image_pixels(path: Path, *, non_color: bool = False) -> tuple[np.ndarray, bpy.types.Image]:
    try:
        image = bpy.data.images.load(str(path), check_existing=False)
    except RuntimeError as error:
        raise MaterialBakeError(f"Blender cannot load image {path}: {error}") from error
    if non_color:
        try:
            image.colorspace_settings.name = "Non-Color"
        except TypeError:
            pass
    width, height = image.size
    if width <= 0 or height <= 0:
        bpy.data.images.remove(image)
        raise MaterialBakeError(f"Image has invalid dimensions: {path}")
    values = np.empty(len(image.pixels), dtype=np.float32)
    image.pixels.foreach_get(values)
    pixels = values.reshape((height, width, 4))
    if not bool(np.all(np.isfinite(pixels))):
        bpy.data.images.remove(image)
        raise MaterialBakeError(f"Image contains non-finite pixels: {path}")
    return pixels, image


def rgb_to_hsv(rgb: np.ndarray) -> np.ndarray:
    maximum = np.max(rgb, axis=2)
    minimum = np.min(rgb, axis=2)
    delta = maximum - minimum
    saturation = np.zeros_like(maximum)
    nonzero_value = maximum > 1e-8
    saturation[nonzero_value] = delta[nonzero_value] / maximum[nonzero_value]
    hue = np.zeros_like(maximum)
    chromatic = delta > 1e-8
    red = chromatic & (maximum == rgb[:, :, 0])
    green = chromatic & (maximum == rgb[:, :, 1])
    blue = chromatic & (maximum == rgb[:, :, 2])
    hue[red] = ((rgb[:, :, 1][red] - rgb[:, :, 2][red]) / delta[red]) % 6.0
    hue[green] = (
        (rgb[:, :, 2][green] - rgb[:, :, 0][green]) / delta[green] + 2.0
    )
    hue[blue] = (
        (rgb[:, :, 0][blue] - rgb[:, :, 1][blue]) / delta[blue] + 4.0
    )
    hue /= 6.0
    return np.stack((hue, saturation, maximum), axis=2)


def hsv_to_rgb(hsv: np.ndarray) -> np.ndarray:
    hue = (hsv[:, :, 0] % 1.0) * 6.0
    saturation = np.clip(hsv[:, :, 1], 0.0, 1.0)
    value = np.clip(hsv[:, :, 2], 0.0, 1.0)
    sector = np.floor(hue).astype(np.int32) % 6
    fraction = hue - np.floor(hue)
    p = value * (1.0 - saturation)
    q = value * (1.0 - fraction * saturation)
    t = value * (1.0 - (1.0 - fraction) * saturation)
    choices = np.stack(
        (
            np.stack((value, t, p), axis=2),
            np.stack((q, value, p), axis=2),
            np.stack((p, value, t), axis=2),
            np.stack((p, q, value), axis=2),
            np.stack((t, p, value), axis=2),
            np.stack((value, p, q), axis=2),
        ),
        axis=0,
    )
    row_indices, column_indices = np.indices(sector.shape)
    return choices[sector, row_indices, column_indices]


def bake_base_color(pixels: np.ndarray, config: dict[str, Any], label: str) -> np.ndarray:
    output = pixels.copy()
    hsv = rgb_to_hsv(np.clip(output[:, :, :3], 0.0, 1.0))
    hue_shift = require_number(config.get("hue_shift", 0.0), f"{label}.hue_shift")
    saturation = require_number(config.get("saturation", 1.0), f"{label}.saturation")
    value = require_number(config.get("value", 1.0), f"{label}.value")
    if saturation < 0 or value < 0:
        raise MaterialBakeError(f"{label}.saturation and value cannot be negative")
    hsv[:, :, 0] = (hsv[:, :, 0] + hue_shift) % 1.0
    hsv[:, :, 1] = np.clip(hsv[:, :, 1] * saturation, 0.0, 1.0)
    hsv[:, :, 2] = np.clip(hsv[:, :, 2] * value, 0.0, 1.0)
    rgb = hsv_to_rgb(hsv)
    scale = vector3(
        config.get("rgb_scale"),
        f"{label}.rgb_scale",
        default=(1.0, 1.0, 1.0),
        minimum=0.0,
    )
    offset = vector3(
        config.get("rgb_offset"),
        f"{label}.rgb_offset",
        default=(0.0, 0.0, 0.0),
    )
    rgb = np.clip(rgb * scale + offset, 0.0, 1.0)
    mix_factor = number_in_range(
        config.get("mix_factor", 0.0), f"{label}.mix_factor", 0.0, 1.0
    )
    mix_color = vector3(
        config.get("mix_color"),
        f"{label}.mix_color",
        default=(1.0, 1.0, 1.0),
        minimum=0.0,
        maximum=1.0,
    )
    if mix_factor:
        rgb = rgb * (1.0 - mix_factor) + mix_color * mix_factor
    output[:, :, :3] = np.clip(rgb, 0.0, 1.0)

    alpha_mode = config.get("alpha", "preserve")
    if alpha_mode == "preserve":
        pass
    elif alpha_mode == "opaque":
        output[:, :, 3] = 1.0
    elif alpha_mode == "luminance":
        output[:, :, 3] = np.sum(
            output[:, :, :3] * np.array([0.2126, 0.7152, 0.0722], dtype=np.float32),
            axis=2,
        )
    else:
        raise MaterialBakeError(
            f"{label}.alpha must be preserve, opaque, or luminance"
        )
    return np.clip(output, 0.0, 1.0)


def height_channel(pixels: np.ndarray, channel: str, label: str) -> np.ndarray:
    if channel == "r":
        return pixels[:, :, 0]
    if channel == "g":
        return pixels[:, :, 1]
    if channel == "b":
        return pixels[:, :, 2]
    if channel == "a":
        return pixels[:, :, 3]
    if channel == "luminance":
        return np.sum(
            pixels[:, :, :3]
            * np.array([0.2126, 0.7152, 0.0722], dtype=np.float32),
            axis=2,
        )
    raise MaterialBakeError(
        f"{label}.channel must be r, g, b, a, or luminance"
    )


def bake_normal(pixels: np.ndarray, config: dict[str, Any], label: str) -> np.ndarray:
    channel = config.get("channel", "luminance")
    if not isinstance(channel, str):
        raise MaterialBakeError(f"{label}.channel must be a string")
    height = height_channel(np.clip(pixels, 0.0, 1.0), channel, label)
    if bool(config.get("invert_height", False)):
        height = 1.0 - height
    strength = require_number(config.get("strength", 1.0), f"{label}.strength")
    if strength < 0:
        raise MaterialBakeError(f"{label}.strength cannot be negative")
    gradient_y, gradient_x = np.gradient(height.astype(np.float32))
    normal_x = -gradient_x * strength
    normal_y = -gradient_y * strength
    if bool(config.get("flip_y", False)):
        normal_y *= -1.0
    normal_z = np.ones_like(normal_x)
    length = np.sqrt(normal_x * normal_x + normal_y * normal_y + normal_z)
    normal = np.stack(
        (normal_x / length, normal_y / length, normal_z / length), axis=2
    )
    output = np.ones((*height.shape, 4), dtype=np.float32)
    output[:, :, :3] = normal * 0.5 + 0.5
    return np.clip(output, 0.0, 1.0)


def png_chunk(kind: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + kind
        + data
        + struct.pack(">I", binascii.crc32(kind + data) & 0xFFFFFFFF)
    )


def write_png(path: Path, pixels: np.ndarray) -> dict[str, Any]:
    if pixels.ndim != 3 or pixels.shape[2] != 4:
        raise MaterialBakeError("PNG pixels must have shape (height, width, 4)")
    height, width, _channels = pixels.shape
    # Blender image buffers are bottom-up; PNG scanlines are top-down.
    rgba = np.clip(pixels * 255.0 + 0.5, 0.0, 255.0).astype(np.uint8)[::-1]
    scanlines = b"".join(b"\x00" + rgba[row].tobytes() for row in range(height))
    payload = (
        PNG_SIGNATURE
        + png_chunk(
            b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
        )
        + png_chunk(b"IDAT", zlib.compress(scanlines, 9))
        + png_chunk(b"IEND", b"")
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("wb") as file:
        file.write(payload)
    return {
        "path": str(path),
        "bytes": len(payload),
        "sha256": hashlib.sha256(payload).hexdigest(),
        "width": width,
        "height": height,
    }


def alpha_weighted_rgb_mean(pixels: np.ndarray) -> list[float]:
    mask = pixels[:, :, 3] > 0.2
    source = pixels[:, :, :3][mask] if bool(np.any(mask)) else pixels[:, :, :3].reshape((-1, 3))
    return [round(float(value), 6) for value in np.mean(source, axis=0)]


def verify_png(path: Path, expected: np.ndarray, *, non_color: bool) -> dict[str, Any]:
    actual, image = image_pixels(path, non_color=non_color)
    try:
        if actual.shape != expected.shape:
            raise MaterialBakeError(
                f"PNG dimensions changed during round trip: expected {expected.shape}, "
                f"found {actual.shape}: {path}"
            )
        quantized = np.round(np.clip(expected, 0.0, 1.0) * 255.0) / 255.0
        maximum_error = float(np.max(np.abs(actual - quantized)))
        if maximum_error > PIXEL_TOLERANCE:
            raise MaterialBakeError(
                f"PNG pixel verification failed (max error {maximum_error:.8g}): {path}"
            )
        return {
            "verified": True,
            "maximumPixelError": maximum_error,
            "meanRgb": alpha_weighted_rgb_mean(actual),
            "meanAlpha": round(float(np.mean(actual[:, :, 3])), 6),
        }
    finally:
        bpy.data.images.remove(image)


def find_or_create_node(
    material: bpy.types.Material, node_type: str, node_name: str
) -> bpy.types.Node:
    node = material.node_tree.nodes.get(node_name)
    if node is not None and node.bl_idname != node_type:
        material.node_tree.nodes.remove(node)
        node = None
    if node is None:
        node = material.node_tree.nodes.new(node_type)
        node.name = node_name
    node.label = node_name
    return node


def material_output(material: bpy.types.Material) -> bpy.types.Node:
    outputs = [node for node in material.node_tree.nodes if node.type == "OUTPUT_MATERIAL"]
    active = next((node for node in outputs if getattr(node, "is_active_output", False)), None)
    if active is not None:
        return active
    if outputs:
        return outputs[0]
    return find_or_create_node(material, "ShaderNodeOutputMaterial", "Material Output")


def principled_shader(
    material: bpy.types.Material, *, replace_surface: bool
) -> bpy.types.Node:
    output = material_output(material)
    surface = output.inputs.get("Surface")
    if surface is None:
        raise MaterialBakeError(f"Material {material.name!r} has no Surface output")
    if surface.is_linked:
        source = surface.links[0].from_node
        if source.type == "BSDF_PRINCIPLED":
            return source
        if not replace_surface:
            raise MaterialBakeError(
                f"Material {material.name!r} uses {source.bl_idname}, not Principled BSDF; "
                "set replace_surface to true to replace its surface connection"
            )
        for link in list(surface.links):
            material.node_tree.links.remove(link)
    existing = next(
        (node for node in material.node_tree.nodes if node.type == "BSDF_PRINCIPLED"),
        None,
    )
    shader = existing or find_or_create_node(
        material, "ShaderNodeBsdfPrincipled", "Baked Principled BSDF"
    )
    material.node_tree.links.new(shader.outputs["BSDF"], surface)
    return shader


def replace_input_link(
    material: bpy.types.Material,
    output_socket: bpy.types.NodeSocket,
    input_socket: bpy.types.NodeSocket,
) -> None:
    for link in list(input_socket.links):
        material.node_tree.links.remove(link)
    material.node_tree.links.new(output_socket, input_socket)


def load_material_image(
    path: Path, name: str, *, colorspace: str, pack: bool
) -> bpy.types.Image:
    image = bpy.data.images.load(str(path), check_existing=False)
    image.name = name
    try:
        image.colorspace_settings.name = colorspace
    except TypeError:
        log(f"Image {image.name!r} does not expose color space {colorspace!r}")
    if pack:
        image.pack()
    return image


def set_alpha_rendering(material: bpy.types.Material) -> str | None:
    if hasattr(material, "surface_render_method"):
        prop = material.bl_rna.properties.get("surface_render_method")
        allowed = {item.identifier for item in prop.enum_items} if prop else set()
        for candidate in ("DITHERED", "BLENDED"):
            if candidate in allowed:
                material.surface_render_method = candidate
                return candidate
    if hasattr(material, "blend_method"):
        material.blend_method = "BLEND"
        return "BLEND"
    return None


def apply_material(
    record: dict[str, Any],
    *,
    pack_images: bool,
) -> dict[str, Any] | None:
    job = record["recipe"]
    config_value = job.get("material")
    if config_value is None:
        return None
    config = require_mapping(config_value, f"{record['name']}.material")
    material_name = record["material_name"]
    material = bpy.data.materials.get(material_name)
    created = False
    if material is None:
        material = bpy.data.materials.new(material_name)
        created = True
    material.use_nodes = True
    shader = principled_shader(
        material, replace_surface=bool(config.get("replace_surface", False))
    )
    images: list[str] = []

    base_image: bpy.types.Image | None = None
    if "base_output" in record:
        base_image = load_material_image(
            record["base_output"],
            f"{record['name']} Baked Base Color",
            colorspace="sRGB",
            pack=pack_images,
        )
        images.append(base_image.name)
        base_node = find_or_create_node(
            material,
            "ShaderNodeTexImage",
            f"{record['name']} Baked Base Color",
        )
        base_node.image = base_image
        replace_input_link(material, base_node.outputs["Color"], shader.inputs["Base Color"])

        base_config = require_mapping(job["base_color"], f"{record['name']}.base_color")
        use_alpha = bool(config.get("use_alpha", base_config.get("alpha", "preserve") != "opaque"))
        if use_alpha:
            replace_input_link(material, base_node.outputs["Alpha"], shader.inputs["Alpha"])
            alpha_render_method = set_alpha_rendering(material)
        else:
            alpha_render_method = None
            shader.inputs["Alpha"].default_value = 1.0
    else:
        alpha_render_method = None

    normal_image: bpy.types.Image | None = None
    if "normal_output" in record:
        normal_image = load_material_image(
            record["normal_output"],
            f"{record['name']} Baked Normal",
            colorspace="Non-Color",
            pack=pack_images,
        )
        images.append(normal_image.name)
        normal_texture = find_or_create_node(
            material, "ShaderNodeTexImage", f"{record['name']} Baked Normal"
        )
        normal_texture.image = normal_image
        normal_map = find_or_create_node(
            material, "ShaderNodeNormalMap", f"{record['name']} Normal Map"
        )
        normal_strength = require_number(
            config.get("normal_strength", 1.0),
            f"{record['name']}.material.normal_strength",
        )
        if normal_strength < 0:
            raise MaterialBakeError(
                f"{record['name']}.material.normal_strength cannot be negative"
            )
        normal_map.inputs["Strength"].default_value = normal_strength
        replace_input_link(material, normal_texture.outputs["Color"], normal_map.inputs["Color"])
        replace_input_link(material, normal_map.outputs["Normal"], shader.inputs["Normal"])

    metallic = number_in_range(
        config.get("metallic", shader.inputs["Metallic"].default_value),
        f"{record['name']}.material.metallic",
        0.0,
        1.0,
    )
    roughness = number_in_range(
        config.get("roughness", shader.inputs["Roughness"].default_value),
        f"{record['name']}.material.roughness",
        0.0,
        1.0,
    )
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    double_sided = bool(config.get("double_sided", True))
    if hasattr(material, "use_backface_culling"):
        material.use_backface_culling = not double_sided

    return {
        "name": material.name,
        "created": created,
        "principledNode": shader.name,
        "images": images,
        "packedImages": pack_images,
        "metallic": metallic,
        "roughness": roughness,
        "doubleSided": double_sided,
        "alphaRenderMethod": alpha_render_method,
    }


def process_job(
    record: dict[str, Any], *, apply_materials: bool, pack_images: bool
) -> dict[str, Any]:
    name = record["name"]
    job = record["recipe"]
    report: dict[str, Any] = {"name": name}

    if "base_output" in record:
        pixels, image = image_pixels(record["base_source"])
        try:
            base_config = require_mapping(job["base_color"], f"{name}.base_color")
            baked = bake_base_color(pixels, base_config, f"{name}.base_color")
        finally:
            bpy.data.images.remove(image)
        output_report = write_png(record["base_output"], baked)
        output_report.update(verify_png(record["base_output"], baked, non_color=False))
        output_report["source"] = str(record["base_source"])
        report["baseColor"] = output_report

    if "normal_output" in record:
        pixels, image = image_pixels(record["height_source"], non_color=True)
        try:
            normal_config = require_mapping(job["normal"], f"{name}.normal")
            baked = bake_normal(pixels, normal_config, f"{name}.normal")
        finally:
            bpy.data.images.remove(image)
        output_report = write_png(record["normal_output"], baked)
        output_report.update(
            verify_png(record["normal_output"], baked, non_color=True)
        )
        output_report["heightSource"] = str(record["height_source"])
        report["normal"] = output_report

    if apply_materials:
        material_report = apply_material(record, pack_images=pack_images)
        if material_report is not None:
            report["material"] = material_report
    return report


def validate_save_path(args: argparse.Namespace) -> Path | None:
    if args.save_blend is None:
        if args.overwrite_blend:
            raise MaterialBakeError("--overwrite-blend requires --save-blend")
        return None
    if not args.apply_materials:
        raise MaterialBakeError("--save-blend requires --apply-materials")
    path = Path(args.save_blend).expanduser().resolve()
    if path.suffix.lower() != ".blend":
        raise MaterialBakeError("--save-blend must use the .blend extension")
    current = Path(bpy.data.filepath).resolve() if bpy.data.filepath else None
    if current is not None and path == current and not args.overwrite_blend:
        raise MaterialBakeError(
            "Refusing to overwrite the open .blend; choose a new --save-blend path "
            "or pass --overwrite-blend explicitly"
        )
    if path.exists() and not args.overwrite_blend:
        raise MaterialBakeError(
            f"Blend output exists; pass --overwrite-blend to replace it: {path}"
        )
    return path


def run(args: argparse.Namespace) -> dict[str, Any]:
    if args.pack_images and not args.apply_materials:
        raise MaterialBakeError("--pack-images requires --apply-materials")
    recipe_path, jobs = load_recipe(args.recipe)
    save_path = validate_save_path(args)
    plan = build_plan(
        recipe_path,
        jobs,
        overwrite=args.overwrite,
        apply_materials=args.apply_materials,
    )
    planned_outputs = [
        str(path)
        for record in plan
        for key, path in record.items()
        if key in {"base_output", "normal_output"}
    ]
    log(f"Blender {bpy.app.version_string}")
    log(f"Recipe: {recipe_path}")
    log(f"Jobs: {len(plan)}")

    if args.dry_run:
        summary = {
            "success": True,
            "dryRun": True,
            "recipe": str(recipe_path),
            "jobs": [record["name"] for record in plan],
            "outputs": planned_outputs,
            "applyMaterials": args.apply_materials,
            "saveBlend": str(save_path) if save_path else None,
        }
        log("SUMMARY " + json.dumps(summary, sort_keys=True))
        return summary

    results: list[dict[str, Any]] = []
    for index, record in enumerate(plan, start=1):
        log(f"BAKE [{index}/{len(plan)}] {record['name']}")
        result = process_job(
            record,
            apply_materials=args.apply_materials,
            pack_images=args.pack_images,
        )
        results.append(result)
        log("RESULT " + json.dumps(result, sort_keys=True))

    saved_blend: str | None = None
    if save_path is not None:
        save_path.parent.mkdir(parents=True, exist_ok=True)
        operator_result = bpy.ops.wm.save_as_mainfile(filepath=str(save_path))
        if "FINISHED" not in operator_result or not save_path.is_file():
            raise MaterialBakeError(f"Blender failed to save: {save_path}")
        saved_blend = str(save_path)

    summary = {
        "success": True,
        "recipe": str(recipe_path),
        "jobCount": len(results),
        "jobs": results,
        "outputs": planned_outputs,
        "applyMaterials": args.apply_materials,
        "packedImages": bool(args.apply_materials and args.pack_images),
        "savedBlend": saved_blend,
    }
    log("SUMMARY " + json.dumps(summary, sort_keys=True))
    return summary


def run_with_arguments(arguments: list[str]) -> dict[str, Any]:
    """Run from Blender MCP with an explicit command-line-style argument list."""
    return run(parse_arguments(arguments))


def main() -> None:
    try:
        run(parse_arguments())
    except MaterialBakeError as error:
        print(f"[material-bake] ERROR: {error}", file=sys.stderr, flush=True)
        raise SystemExit(2) from error


if __name__ == "__main__":
    main()
