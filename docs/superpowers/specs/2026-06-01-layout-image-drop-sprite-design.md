# Layout Image Drop And Paste Sprite Creation Design

## Goal

The layout canvas should let users create a Sprite object directly from a local image. This includes:

- Dragging image files from the operating system into the layout canvas.
- Pasting an image from the system clipboard while the layout canvas is active.

This feature is limited to projects opened with the `LocalFile` storage provider. Cloud, browser-only, and unsaved projects are out of scope because they do not have a reliable local project folder where new files can be referenced.

Supported image extensions match existing image resources: `png`, `jpg`, `jpeg`, and `webp`.

## User Behavior

When a user drops one or more supported image files on the layout canvas, GDevelop creates one image resource, one Sprite object, and one instance per image. The instance is placed at the drop position in scene coordinates. If several images are dropped at once, instances may be slightly offset so they remain selectable.

When a user presses `Ctrl+V` or `Cmd+V`, existing instance paste behavior remains first priority. If the clipboard does not contain GDevelop instance data, the editor checks the Electron system clipboard for an image. If an image is found, it is saved as a uniquely named PNG file in the project folder, then used to create an image resource, Sprite object, and instance.

The context menu Paste command should follow the same priority: paste instances first, then paste a system clipboard image when available.

## Architecture

Add a focused helper module near the scene or resource editor code, for example `SceneEditor/CreateSpriteFromImage.js`. It owns the transformation from local image input to GDevelop data:

- Validate supported image file paths or clipboard image data.
- Resolve the project directory from `project.getProjectFile()`.
- Create unique local file names when copying or writing files into the project folder.
- Create image resources with `applyResourceDefaults`.
- Create unique Sprite object names from image file names.
- Initialize Sprite animations with one default animation, one direction, and one frame using the new image resource.

`InstancesEditor` stays responsible only for canvas coordinates and native drop event capture. It should expose a callback such as `onImageFilesDropped(filePaths, position)` to `SceneEditor`.

`SceneEditor` coordinates the workflow:

- Gate the feature to `resourceManagementProps.getStorageProvider().internalName === 'LocalFile'`.
- Convert dropped file paths or pasted image data into Sprite objects through the helper.
- Use the existing instance insertion path so history, preview synchronization, selection, object list updates, and unsaved-change tracking stay consistent.

## Data Flow

### Drag And Drop

1. Native `dragover` on the canvas prevents the operating system or browser from opening the image file.
2. Native `drop` extracts `DataTransfer.files`.
3. Only files with supported image extensions and usable local paths are kept.
4. `InstancesEditor` converts the drop point to scene coordinates and calls `SceneEditor`.
5. `SceneEditor` imports the resources according to local project behavior, creates Sprite objects, inserts instances, selects them, updates history, and refreshes resources.

### Clipboard Paste

1. `SceneEditor.paste()` first checks the existing internal GDevelop instance clipboard.
2. If no instance payload exists, it reads `electron.clipboard.readImage()`.
3. If the image is not empty, it writes a unique PNG file into the project folder.
4. The saved file is processed by the same Sprite creation helper.
5. The new instance is placed at the last cursor scene position, or at the current view center when no cursor position is available.

## Error Handling

If the project is not a `LocalFile` project or has no project file path, the operation should stop with a short user-facing message asking the user to save/open a local project first.

Unsupported files are ignored. If all dropped files are unsupported, no project mutation happens.

For mixed drag input, valid images are imported and invalid files are skipped.

If a file copy, clipboard image write, or resource creation fails, the editor should report the error and keep any successfully created images.

## Testing

Add unit tests for the helper module:

- It filters supported image paths and rejects unsupported extensions.
- It creates unique resource and object names.
- It initializes a Sprite object with a default animation frame pointing to the image resource.
- It writes clipboard image data to a unique project-local PNG file path.

Add focused integration-level tests where practical around `SceneEditor` behavior:

- Pasting instances keeps existing behavior and does not try to paste system images.
- Pasting a system image creates a Sprite instance at the chosen scene coordinates.
- Dropping multiple image file paths creates multiple Sprite instances.

Manual verification should cover:

- Drag a PNG/JPG/WebP into a saved local project.
- Paste an image copied from the operating system clipboard.
- Verify Undo removes the newly added instance.
- Verify the created Sprite object opens with the image as its first frame.
