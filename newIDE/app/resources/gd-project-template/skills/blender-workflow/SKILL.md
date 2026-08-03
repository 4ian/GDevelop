---
name: blender-workflow
description: Create, inspect, prepare, optimize, animate, convert, merge, export, and verify Blender 3D assets for GDevelop through Blender Foundation's official Blender MCP server. Use for Blender-to-GDevelop workflows, `.blend` scene work, glTF/GLB export, `.gltf`-to-`.glb` conversion, same-rig GLB animation merging, material or transform cleanup, collision preparation, and diagnosing imported 3D assets in GDevelop.
---

# Blender Workflow

## Use Blender MCP

Use Blender Foundation's official [Blender MCP server](https://www.blender.org/lab/mcp-server/) to inspect and operate Blender. Its tools include `get_blendfile_summary_path_info`, `get_objects_summary`, `get_python_api_docs`, and `execute_blender_code`.

The integration executes LLM-generated Blender code without data guards, so inspect paths, avoid sensitive workspaces, preserve the source `.blend`, and use task-owned copies or temporary outputs for destructive operations.

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

## Use the bundled conversion scripts

Use the bundled scripts directly for supported jobs; do not rewrite their logic in an ad hoc script.

- Use [scripts/convert_gltf_to_glb.py](scripts/convert_gltf_to_glb.py) for one-file or batch `.gltf` to `.glb` conversion. Pass `input` with `output` for one file, or `output_dir` for a directory; set `recursive` for nested inputs and `overwrite` only for an approved replacement. Require the returned summary to report `success: true` and zero failures.
- Use [scripts/combine_same_rig_glb_animations.py](scripts/combine_same_rig_glb_animations.py) to embed animations from a GLB into a character GLB that uses the same skeleton. Pass `character`, `animations`, and `output`; use the `actions` list to select clips. Keep strict compatibility checking unless the user explicitly accepts a weaker check. This performs direct action reuse, not retargeting; stop and use a real retargeting workflow when rigs differ.

Run either payload through the official MCP's `execute_blender_code` tool in the already connected Blender session. The payloads do not discover, configure, or launch a local Blender executable. Use a dedicated blank Blender session and save any open work first because the payloads clear task data-blocks while processing. They do not reset Blender or unload the MCP add-on.

Send code shaped like this to `execute_blender_code`, using the selected script's absolute path and an MCP options mapping:

```python
import runpy

payload = runpy.run_path(r"ABSOLUTE_PATH_TO_SCRIPT")
result = payload["run_mcp"]({
    "input": r"ABSOLUTE_INPUT_PATH",
    "output": r"ABSOLUTE_OUTPUT_PATH",
})
```

Generate a temporary output first and inspect it through the official MCP before replacing an existing project asset.

## Verify completion

Before finishing:

- Confirm the source `.blend` or its safe copy is preserved.
- Confirm transforms, origin, normals, materials, actions, export selection, and GLB settings against the detailed workflow.
- Confirm every expected output exists and has non-zero size.
- Confirm MCP inspection matches the intended exported objects, materials, armature, and actions.
- Confirm no task-unrelated Blender data or existing output was overwritten.
- When GDevelop sources changed, report the GDevelop skill's validation, commit, reload, and fresh-preview evidence too.
