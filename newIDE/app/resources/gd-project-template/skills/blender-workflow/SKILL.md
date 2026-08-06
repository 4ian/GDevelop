---
name: blender-workflow
description: Create, inspect, prepare, optimize, animate, convert, merge, export, and verify Blender 3D assets for GDevelop through Blender Foundation's official Blender MCP server. Use for Blender-to-GDevelop workflows, `.blend` scene work, glTF/GLB export, `.fbx`-to-`.glb` or `.gltf`-to-`.glb` conversion, same-rig GLB animation merging, material or transform cleanup, collision preparation, and diagnosing imported 3D assets in GDevelop.
---

# Blender Workflow

## Require Blender's official MCP

Use Blender Foundation's official [Blender MCP server](https://www.blender.org/lab/mcp-server/) for every Blender inspection or mutation. Do not substitute a third-party Blender MCP, UI automation, a direct `blender` shell command, or system Python calling `bpy`.

Before doing any Blender work:

1. Confirm that the official MCP tool surface is available. It includes tools such as `get_blendfile_summary_path_info`, `get_objects_summary`, `get_python_api_docs`, `execute_blender_code`, and `execute_blender_code_for_cli`.
2. Call a non-mutating summary tool against the intended open scene or `.blend` file to prove that the server can reach Blender.
3. Continue only after that call succeeds.

If the official tools are not exposed, stop and show this error:

> ERROR: Blender Workflow requires Blender Foundation's official Blender MCP server, but its tools are not installed or available. Install and configure Blender 5.1 or newer, the official Blender MCP add-on, and the official MCP server from https://www.blender.org/lab/mcp-server/, then retry.

If the tools are exposed but the connectivity check fails, stop and show this error:

> ERROR: Blender Foundation's official MCP tools are installed but cannot reach Blender. Open Blender 5.1 or newer, enable and start the official Blender MCP add-on, and retry.

Do not continue with a fallback after either error. The official integration executes LLM-generated Blender code without data guards; inspect paths, avoid sensitive workspaces, preserve the source `.blend`, and use task-owned copies or temporary outputs for destructive operations.

## Coordinate the two skills

Read [references/blender-to-gdevelop.md](references/blender-to-gdevelop.md) in full before preparing, exporting, importing, or debugging a Blender asset for GDevelop. Follow it for asset boundaries, axes, scale, transforms, origins, materials, animation, optimization, GLB export, GDevelop setup, collision, preview checks, updates, and troubleshooting.

When the task also changes GDevelop project sources, read [the GDevelop project-files skill](../gdevelop-project-files/SKILL.md) in full. Let this skill govern Blender and GLB work; let that skill govern GDevelop source authoring, validation, Git commit, reload, and preview-verification gates.

## Work through the MCP

1. Inspect the current file, objects, linked data, missing files, and target asset before changing anything. Use bounded summary tools instead of dumping the entire scene.
2. Query `get_python_api_docs` before using an unfamiliar `bpy` API.
3. Use `execute_blender_code` for deliberate changes to the connected Blender session. Return a JSON-serializable `result` dictionary containing changed data-blocks, output paths, warnings, and verification facts.
4. Use absolute, task-owned paths. Save the `.blend` source or a safe copy before destructive changes. Never overwrite an existing GLB unless the user requested replacement and the exact target was verified.
5. Inspect the result again through official MCP summaries, object details, screenshots, or a bounded Blender Python check. Do not infer success from a tool call that returned no error.
6. Export binary `.glb`, keep stable data-block and animation names, and verify output existence, non-zero size, intended object/action counts, and absence of missing external resources.
7. If the GLB is a GDevelop resource, keep it inside the project and continue with the GDevelop skill's project validation and fresh-preview workflow.

## Use the bundled workflow scripts

Use the bundled scripts directly for supported jobs; do not rewrite their logic in an ad hoc script.

- Use [scripts/convert_fbx_to_glb.py](scripts/convert_fbx_to_glb.py) for one-file or batch `.fbx` to `.glb` conversion. FBX animation import and GLB action export are enabled by default, and the script verifies the GLB container plus animation count before replacing the destination. Use `--input` with `--output` for one file, or `--input` with `--output-dir` for a directory; add `--recursive` for nested inputs, `--require-animations` when an animation-less result must fail, and `--overwrite` only for an approved replacement. Bone-orientation flags change the imported skeleton and must be used only when the source rig requires them. Require the returned summary to report `success: true` and zero failures.
- Use [scripts/convert_gltf_to_glb.py](scripts/convert_gltf_to_glb.py) for one-file or batch `.gltf` to `.glb` conversion. Use `--input` with `--output` for one file, or `--output-dir` for a directory; add `--recursive` for nested inputs and `--overwrite` only for an approved replacement. Require the returned summary to report `success: true` and zero failures.
- Use [scripts/combine_same_rig_glb_animations.py](scripts/combine_same_rig_glb_animations.py) to embed animations from a GLB into a character GLB that uses the same skeleton. Supply `--character`, `--animations`, and `--output`; repeat `--action` to select clips. Keep strict compatibility checking unless the user explicitly accepts a weaker check. This performs direct action reuse, not retargeting; stop and use a real retargeting workflow when rigs differ.
- Use [scripts/bake_material_textures.py](scripts/bake_material_textures.py) for repeatable image-space material preparation. Supply a version-1 JSON recipe containing one or more jobs. Each job may color-adjust a base texture while preserving alpha, derive a normal map from height, and optionally wire the verified outputs into a glTF-compatible Principled material. Use `--apply-materials` only on a task-owned `.blend`; add `--pack-images` when the generated images must travel with it, and use `--save-blend` to persist to a new path. The script deliberately does not perform geometry/cage, ambient-occlusion, or high-to-low projection bakes.

Run the conversion and animation-combination scripts only through the official MCP's `execute_blender_code_for_cli` tool so they execute in a background Blender process. Pass a disposable or task-owned `.blend` file as `blend_file`; if necessary, first create a temporary copy through `execute_blender_code`. Never run them against the user's live unsaved scene because conversion resets Blender to factory state while processing.

Prefer the same background-MCP workflow for material recipes that apply materials or save a `.blend`. A texture-only `bake_material_textures.py` recipe may run through live `execute_blender_code` when the scene was preserved first, because texture-only mode does not reset or rewire the scene.

Send code shaped like this to `execute_blender_code_for_cli`, using the selected script's absolute path and arguments:

```python
import runpy

tool = runpy.run_path(r"ABSOLUTE_PATH_TO_SCRIPTS\convert_fbx_to_glb.py")
result = tool["run_with_arguments"]([
    "--input", r"ABSOLUTE_INPUT_PATH\character.fbx",
    "--output", r"ABSOLUTE_TASK_OWNED_OUTPUT\character.glb",
    "--require-animations",
])
```

For a recursive FBX batch, replace `--output` with `--output-dir` and add
`--recursive`. Animations remain enabled unless `--no-animations` is passed
explicitly.

Generate a temporary output first and inspect it through the official MCP before replacing an existing project asset.

Material-bake invocation uses the same `runpy` pattern with recipe arguments:

```python
import runpy

tool = runpy.run_path(r"ABSOLUTE_PATH_TO_SCRIPTS\bake_material_textures.py")
result = tool["run_with_arguments"]([
    "--recipe", r"ABSOLUTE_PATH_TO_RECIPE\materials.json",
    "--apply-materials",
    "--pack-images",
    "--save-blend", r"ABSOLUTE_TASK_OWNED_OUTPUT\materials_baked.blend",
])
```

## Verify completion

Before finishing:

- Confirm the official Blender MCP preflight succeeded.
- Confirm the source `.blend` or its safe copy is preserved.
- Confirm transforms, origin, normals, materials, actions, export selection, and GLB settings against the detailed workflow.
- Confirm every expected output exists and has non-zero size.
- Confirm MCP inspection matches the intended exported objects, materials, armature, and actions.
- Confirm no task-unrelated Blender data or existing output was overwritten.
- When GDevelop sources changed, report the GDevelop skill's validation, commit, reload, and fresh-preview evidence too.
