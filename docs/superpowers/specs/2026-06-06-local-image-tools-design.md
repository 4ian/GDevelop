# Local Image Tools Design

## Goal

Add a `Local tools` option to the Resources editor Tools panel image tool selector. The tool should perform common local image operations without network services and save the result as a new project file.

The first version supports:

- Cropping an image by pixel rectangle.
- Expanding the canvas on one side: top, bottom, left, or right.

Outputs are new PNG files saved in the project `generated` folder. The original image is never overwritten.

## Non-Goals

- Do not add a full pixel editor.
- Do not add new native image-processing dependencies.
- Do not support cloud/browser-only projects in this first version.
- Do not auto-register the generated image as a GDevelop resource.
- Do not overwrite the selected source file.

## User Behavior

The Tools panel keeps the existing `Image tool` selector. It gains a new option:

- `Nano Banana`
- `Local tools`

When `Local tools` is selected, the panel shows a local image operation workflow. Users can choose an image from disk or drag an image from the project files list, using the same attachment behavior as Nano Banana. If an image file is selected in the project files panel, the local tool can use it as the current source image.

The panel displays a preview of the selected source image and exposes two operation modes:

- `Crop`: users enter `X`, `Y`, `Width`, and `Height` in pixels.
- `Expand canvas`: users choose one direction and enter how many pixels to add.

Pressing `Apply` renders the transformed image in the browser with a canvas and writes a new PNG into `<project root>/generated`. The file name is derived from the source image name and operation name, for example `coin-crop.png` or `coin-expand-right.png`. If a file already exists, the existing unique-output helper creates `coin-crop-2.png`, `coin-crop-3.png`, and so on.

After saving, the project files list refreshes so the new file appears. The panel shows the saved path and a preview of the result.

## Architecture

Extend `newIDE/app/src/ResourcesEditor/ToolsPanel.js` conservatively:

- Change `ImageTool` from only `'nano-banana'` to `'nano-banana' | 'local-tools'`.
- Update persisted `ResourcesToolsSettings` so `selectedImageTool` can store either value.
- Keep existing Nano Banana behavior unchanged.
- Add a `renderLocalImageTools` branch for the new tool selection.

Add focused pure helpers, either in `ToolsPanel.js` or a small sibling module such as `LocalImageTools.js`, for:

- Supported local image operation types.
- Crop rectangle clamping and validation.
- Canvas expansion geometry.
- Output base-name generation.
- Button disabled state.

Use the browser image pipeline for rendering:

1. Load the source file URL into an `Image`.
2. Draw into an in-memory `canvas`.
3. Use `canvas.toBlob(..., 'image/png')`.
4. Convert the blob to a Node `Buffer`.
5. Write the buffer with `fs.promises.writeFile`.

This avoids new dependencies and follows the existing browser canvas pattern already used by `PlatformSpecificAssetsEditor/ImageResizer.js`.

## Data Flow

### Source Image Selection

The local tool reuses `ImageAttachment`:

1. User chooses an image with the file picker, drops an image from project files, or selects an image file in the project files panel.
2. `createImageAttachmentFromFilePath` validates the extension.
3. The preview uses `getImageAttachmentPreviewUrl`.

### Crop

1. Load the source image to discover natural width and height.
2. Clamp the crop rectangle so it stays inside the source image.
3. Reject zero-width or zero-height rectangles.
4. Create a canvas sized to the clamped crop rectangle.
5. Draw the selected rectangle at canvas origin.
6. Save the new PNG.

### Expand Canvas

1. Load the source image to discover natural width and height.
2. Validate that the expansion amount is greater than zero.
3. Compute the output canvas dimensions and original image offset:
   - Left: new width is `sourceWidth + amount`, source x offset is `amount`.
   - Right: new width is `sourceWidth + amount`, source x offset is `0`.
   - Top: new height is `sourceHeight + amount`, source y offset is `amount`.
   - Bottom: new height is `sourceHeight + amount`, source y offset is `0`.
4. Clear the canvas so the added area stays transparent.
5. Draw the source image at the computed offset.
6. Save the new PNG.

## Error Handling

If filesystem access, `path`, or a local project root is unavailable, the tool shows a user-facing error asking the user to save/open a local project first.

Unsupported files keep the current attachment error behavior: `Choose a supported image file.`

Invalid crop rectangles and zero expansion amounts disable `Apply`. If image loading, canvas encoding, or disk writing fails, the panel shows the error and leaves the original image unchanged.

SVG and animated image sources may load through the browser image element, but output is always a static PNG. This is acceptable for the first version because the tool is a raster operation workflow.

## Testing

Add unit tests around pure helper behavior in `newIDE/app/src/ResourcesEditor/ToolsPanel.spec.js` or a new sibling spec:

- Persisted tools settings preserve `selectedImageTool: 'local-tools'`.
- Older preferences still default to `selectedImageTool: 'nano-banana'`.
- Crop rectangles clamp to the source image bounds.
- Invalid crop rectangles are detected.
- Expanding left, right, top, and bottom computes the expected canvas dimensions and source offsets.
- The local tool apply button is disabled without an image, with invalid parameters, or while processing.
- Output base names use the source name and operation suffix.

Manual verification:

- Open a saved local project.
- Select `Tools > Image > Local tools`.
- Crop a project PNG and confirm a new `generated/*-crop.png` appears.
- Expand a project PNG to the right and confirm a new `generated/*-expand-right.png` appears.
- Confirm the original file is unchanged.
