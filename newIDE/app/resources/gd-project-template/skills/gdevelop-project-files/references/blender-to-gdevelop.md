# Standard Blender-to-GDevelop 3D Workflow

This guide describes a reusable workflow for creating 3D assets in Blender and using them in GDevelop. It does not depend on a particular scene, model, scale, camera angle, or project structure.

## Pipeline overview

```text
Plan asset
  → Model and organize in Blender
  → Set origin, orientation, and scale
  → Apply compatible materials and animations
  → Validate and optimize
  → Export one binary GLB
  → Import as a GDevelop 3D Model resource
  → Configure the 3D layer, camera, and lighting
  → Add simplified collision/gameplay objects
  → Preview and verify
  → Re-export to the same resource when updating
```

## 1. Decide the asset boundary

Before modeling, decide what one GLB represents.

Typical choices are:

- One character with its armature and animations.
- One prop, building, vehicle, or pickup.
- One modular environment kit.
- One complete static environment.

Prefer separate GLBs when parts need independent movement, collision, visibility, animation, or replacement in GDevelop. A complete static environment can be one GLB, but interactive doors, elevators, enemies, and pickups are usually easier to manage as separate objects.

Use clear, stable names for objects, meshes, materials, bones, and animation actions. Stable names make later exports and debugging easier.

## 2. Set Blender units and axes

Blender uses a Z-up workspace. glTF uses a Y-up interchange convention, and Blender's glTF exporter performs the coordinate conversion during export.

Standard practice:

1. Model upright in Blender using Blender's normal axes.
2. Use a consistent scale across the whole project.
3. A practical convention is one Blender unit equals one meter, but consistency matters more than the exact unit.
4. Do not rotate the entire asset merely to make the Blender file “look like glTF.” Let the exporter perform the format conversion.
5. Do not apply the same axis correction in both Blender and GDevelop.

If an imported asset is sideways, first determine whether its original orientation was wrong or whether an extra correction was applied. Fix the cause once. Avoid stacking rotations until the asset happens to look correct.

## 3. Build clean transforms and origins

### Transform checklist

Before export, inspect the Transform panel for every export root and important child object.

- Use uniform scale whenever possible.
- Avoid negative scale. Apply it and recalculate normals if mirroring created flipped faces.
- Apply rotation and scale to ordinary static meshes when appropriate: select the object in Object Mode and use `Ctrl+A` → **Rotation & Scale**.
- Do not apply location unless moving the mesh data relative to its origin is intentional.
- Apply transforms before rigging whenever possible. Applying transforms after animation, constraints, or skinning can change the result.

Applying a transform transfers it into the object data while keeping the visible object in place. See the Blender Manual's [Apply transforms](https://docs.blender.org/manual/en/latest/scene_layout/object/editing/apply.html) page.

### Origin rules

Choose an origin that matches how GDevelop will position and rotate the object.

- Characters: ground contact point, commonly centered between the feet.
- Doors: hinge location.
- Wheels or turrets: rotation center.
- Props: bottom center or logical placement point.
- Complete environments: a documented world origin, often near the playable area's center.

Place ground-contact geometry on Blender's ground plane when practical. This makes placement and collision easier to reason about after import.

## 4. Organize the Blender scene

Keep exportable content separate from reference and presentation content.

A useful structure is:

```text
AssetRoot
├── Render meshes
├── Armature (when animated)
├── Optional attachment points
└── Optional collision-reference meshes

NonExport
├── Reference images
├── Modeling helpers
├── Blender cameras
└── Blender lights
```

Use a dedicated collection for each exportable asset or environment. This makes **Selected Objects**, **Visible Objects**, or **Active Collection** export predictable.

Remove or exclude:

- Default cameras and lights that are not part of the runtime asset.
- Hidden duplicates and unused test meshes.
- Reference images and modeling guides.
- High-resolution source geometry when a game-ready version exists.

## 5. Create glTF-compatible materials

The safest material workflow uses Principled BSDF and image textures.

Recommended texture inputs:

- Base Color
- Roughness
- Metallic
- Normal map
- Emission when needed
- Alpha when transparency is required

Use UV maps for image textures. Pack or save all source textures before export. GLB embeds supported texture data into the single output file.

Complex procedural nodes, Blender-only shaders, geometry-node-only appearances, and unsupported render features may not reproduce in GDevelop. Bake complex procedural results into textures when necessary.

Use sensible texture sizes. Large numbers of high-resolution textures increase download size, loading time, memory usage, and GPU cost.

The Blender glTF exporter supports the core metal/rough PBR material model. See [Blender's glTF 2.0 documentation](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html).

## 6. Prepare animation

For animated assets:

1. Use one armature as the asset's skeleton.
2. Apply object transforms before final rigging whenever possible.
3. Give each Blender Action a stable gameplay name such as `Idle`, `Walk`, `Run`, `Attack`, or `Jump`.
4. Keep only intended actions available for export.
5. Check animation start/end frames and whether the clip should loop.
6. Avoid animating unsupported Blender-only properties.
7. Test deformation at extreme poses and inspect normals and weights.

glTF supports object transforms, bone animation, and shape keys. GDevelop can expose embedded GLB clips as animations on the 3D Model object. Its official [3D Model documentation](https://wiki.gdevelop.io/gdevelop5/objects/3d-model/#animations) describes animation mapping and playback.

## 7. Optimize before export

Optimize for the target device, not only for the development computer.

Check:

- Triangle count.
- Number of separate mesh objects.
- Number of materials and texture images.
- Texture resolution and compression.
- Number of bones and animation keyframes.
- Transparency and overdraw.
- Number of shadow-casting objects.

Apply modifiers that must affect runtime geometry. Remove unseen internal faces where safe. Join static meshes when that reduces draw overhead without making materials, culling, or editing harder.

Keep collision geometry simpler than render geometry. A detailed visible mesh is rarely an efficient physics collider.

## 8. Validate inside Blender

Before export:

1. Inspect the asset from front, side, top, and perspective views.
2. Turn on face-orientation display and fix reversed normals.
3. Confirm no required object is hidden from export.
4. Confirm the origin and ground contact.
5. Confirm the asset has no accidental non-uniform or negative scale.
6. Test every animation.
7. Save the `.blend` source.

Optionally export a test GLB and import it into a new empty Blender scene. This round trip reveals missing objects, broken materials, incorrect animation names, and orientation mistakes before GDevelop is involved.

## 9. Export a binary GLB

In Blender, choose **File → Export → glTF 2.0 (.glb/.gltf)**.

Recommended baseline settings:

| Setting | Recommended value |
|---|---|
| Format | glTF Binary (`.glb`) |
| Include | Selected Objects, Visible Objects, or Active Collection—choose one intentionally |
| Cameras | Off unless the game explicitly needs an exported camera |
| Punctual Lights | Off when lighting will be created in GDevelop |
| Apply Modifiers | On when modifiers define the final mesh |
| Materials | Export |
| Animations | On only for animated assets |
| Shape Keys | On only when required |

Use `.glb`, not a separate `.gltf` plus `.bin` and texture files. GDevelop supports binary GLB resources, and GLB is easier to move and update as one asset. See GDevelop's [3D Model file-format documentation](https://wiki.gdevelop.io/gdevelop5/objects/3d-model/#file-format).

### Optional Blender Python export

For repeatable exports, run a script in Blender's Scripting workspace or through Blender MCP:

```python
import bpy

bpy.ops.export_scene.gltf(
    filepath=r"ABSOLUTE_PATH_TO_PROJECT\assets\models\my_asset.glb",
    export_format="GLB",
    use_selection=True,
    export_cameras=False,
    export_lights=False,
    export_apply=True,
)
```

Change `use_selection` to `False` only when the complete Blender scene is deliberately export-ready. `export_apply=True` is essential when the runtime shape depends on modifiers such as Bevel, Solidify, Mirror, or Subdivision; otherwise the GLB can contain only the unmodified base mesh.

## 10. Import the GLB into GDevelop

1. Copy or export the GLB into the GDevelop project folder.
2. Create a **3D Model** object.
3. Choose the GLB as the model resource.
4. Put the object on a 3D-rendered layer.
5. Keep aspect ratio enabled during initial setup.
6. Choose the origin and center behavior appropriate for the object.
7. Choose the material mode:
   - **Keep original** for authored GLB PBR materials.
   - **Standard without metalness** when a simpler lit result is preferable.
   - **Basic** only when lighting and shadows should not affect the object.
8. Enable shadow casting and receiving only when needed.
9. Map embedded animations to useful GDevelop animation names when the model is animated.

GDevelop's [3D Model object guide](https://wiki.gdevelop.io/gdevelop5/objects/3d-model/) documents materials, shadows, origin/center choices, animation, and GLB support.

## 11. Configure the 3D layer and camera

Create or select a layer and enable 3D rendering. Keep 2D interface objects on a separate 2D layer when possible.

Choose the camera projection according to the game:

- **Perspective** for first-person, third-person, racing, platforming, and scenes where depth perspective matters.
- **Orthographic** for map-like, tactical, construction, or stylized views without perspective convergence.

Set the camera intentionally at scene start or through a camera behavior. A reliable setup defines:

- Camera X/Y position.
- Camera Z height/depth.
- Camera X and Y rotation, or a target position/object to look at.
- Perspective field of view or orthographic size.
- Near and far clipping planes.

For top-down games, place the camera above the gameplay plane and point it toward the play area. For an angled top-down view, offset the camera and look toward the player or a target point. Do not rotate or flatten the environment merely to imitate a camera angle.

GDevelop exposes camera rotation, Z position, clipping planes, field of view, and look-at actions in the official [3D reference](https://wiki.gdevelop.io/gdevelop5/all-features/scene3d/reference/#actions). General layer setup is documented under [Layers and cameras](https://wiki.gdevelop.io/gdevelop5/interface/scene-editor/layers-and-cameras/).

## 12. Add lighting in GDevelop

A common baseline uses:

- Ambient or hemisphere light for general visibility.
- Directional light for sunlight and shadows.
- Point or spot lights only where they add gameplay or visual value.

If the model should cast and receive shadows:

1. Use a lit material mode rather than Basic.
2. Enable casting/receiving on the model.
3. Add a directional light effect or suitable 3D lights.
4. Tune shadow quality, range, and bias.

Do not automatically export Blender lights and recreate the same lights in GDevelop. Pick one runtime lighting system. GDevelop layer lights are usually easier to control from events.

## 13. Add collision and physics separately

A visible 3D model is not automatically a good gameplay collider.

Standard approaches:

- Use invisible 3D boxes for floors, walls, stairs, and blockers.
- Use simple convex collision meshes for irregular props.
- Split large environments into logical collision regions.
- Use ramps instead of individual stair-step colliders when smooth movement is desired.
- Add 3D Physics behavior only to objects that need physics interaction.

Keep render and collision responsibilities separate. This improves stability, performance, and control over walkable areas.

## 14. Verify in preview

Test the imported asset in a real GDevelop preview.

Verify:

- Orientation is correct.
- Width, height, and depth proportions match Blender.
- The asset sits on the intended ground plane.
- The origin produces correct movement and rotation.
- Materials and transparency render correctly.
- Lights and shadows behave as expected.
- Animations have correct names, loops, and transitions.
- Collision matches gameplay, not merely the visible silhouette.
- Near/far clipping does not cut off the asset.
- Performance is acceptable on the target device.

Always test from more than one camera angle when diagnosing scale or axis problems. A single top-down view can hide an incorrect vertical axis.

## 15. Standard update loop

For later edits:

1. Open the original `.blend` source.
2. Make and validate the change.
3. Save the `.blend`.
4. Export over the existing GLB resource.
5. Confirm the file modification time and size changed.
6. Reload the resource or project if GDevelop shows a cached version.
7. Preview and repeat the verification checklist.

Keep the same GLB path when the asset identity has not changed. This preserves object and animation references. Use a new filename only for a genuinely separate asset or intentional versioning strategy.

## 16. Troubleshooting

| Symptom | Likely cause | Corrective action |
|---|---|---|
| Model is sideways | Source orientation is wrong or an extra correction was added | Return to a clean Blender orientation; use only one correction point |
| Model is mirrored | Negative scale or flipped normals | Apply scale and recalculate normals in Blender |
| Model is stretched | Non-uniform scale or GDevelop aspect ratio unlocked | Restore uniform transforms and enable Keep aspect ratio |
| Model is the wrong size | Inconsistent unit convention | Establish one project scale and export a known-size test cube |
| Model floats or sinks | Origin or ground plane is wrong | Put the origin at the intended placement point and align ground contact |
| Material is missing | Unsupported nodes or unsaved textures | Use glTF-compatible Principled materials and image textures |
| Transparency is wrong | Blend mode or alpha setup is incompatible | Simplify the material and test alpha mode in a round-trip GLB |
| Shadows are absent | Basic material, disabled shadow flags, or missing light | Use a lit material, enable shadows, and add GDevelop lighting |
| Animation is missing | Action was not exported or mapped | Check Blender Actions/NLA export and GDevelop animation mapping |
| Animation deforms badly | Transforms or bind pose changed after rigging | Restore the rig's correct applied transforms and bind pose |
| GDevelop shows an old model | Resource caching | Verify the GLB changed, then reload the resource/project or restart preview |
| Physics is unstable | Render mesh used as a complex collider | Replace it with simple collision shapes |
| Performance is poor | Excess geometry, textures, materials, shadows, or bones | Profile and reduce the dominant cost |

## 17. Reusable release checklist

### Blender

- [ ] Asset boundary is clear.
- [ ] Names are stable and descriptive.
- [ ] Orientation is upright in Blender.
- [ ] Scale convention is consistent.
- [ ] No accidental non-uniform or negative scale remains.
- [ ] Origin matches placement and rotation needs.
- [ ] Normals face outward.
- [ ] Materials use supported glTF patterns.
- [ ] Required textures are saved.
- [ ] Animations are named and tested.
- [ ] Unneeded cameras, lights, helpers, and source geometry are excluded.
- [ ] Geometry and textures are appropriate for the target hardware.
- [ ] The `.blend` source is saved.

### Export

- [ ] Format is binary GLB.
- [ ] The intended objects or collection are included.
- [ ] Modifiers are applied by the exporter when required.
- [ ] Cameras and lights are included only intentionally.
- [ ] Animation export is enabled only when needed.
- [ ] The exported GLB passes a round-trip inspection.

### GDevelop

- [ ] GLB is registered as a 3D Model resource.
- [ ] Object is on a 3D layer.
- [ ] Aspect ratio is preserved.
- [ ] Material mode matches the lighting design.
- [ ] Camera position, target, projection, and clipping are intentional.
- [ ] Lighting and shadow settings are intentional.
- [ ] Collision uses simplified gameplay shapes.
- [ ] Animations are mapped and tested.
- [ ] A fresh preview confirms rendering, collision, and performance.

## Official references

- [Blender Manual: glTF 2.0 import/export](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html)
- [Blender Manual: Apply transforms](https://docs.blender.org/manual/en/latest/scene_layout/object/editing/apply.html)
- [GDevelop Documentation: 3D Model object](https://wiki.gdevelop.io/gdevelop5/objects/3d-model/)
- [GDevelop Documentation: Layers and cameras](https://wiki.gdevelop.io/gdevelop5/interface/scene-editor/layers-and-cameras/)
- [GDevelop Documentation: 3D reference](https://wiki.gdevelop.io/gdevelop5/all-features/scene3d/reference/)
