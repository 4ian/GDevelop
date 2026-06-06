# Local Image Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `Local tools` option under the Resources editor image tool selector for local crop and one-sided canvas expansion, saving transformed images as new PNG files in the project `generated` folder.

**Architecture:** Add a focused `LocalImageTools.js` helper for testable image geometry and canvas drawing rules. Extend `ToolsPanel.js` to persist the new image tool choice, render the local image workflow, and save results using the existing generated-folder and unique-output helpers. Keep Nano Banana and ElevenLabs behavior unchanged.

**Tech Stack:** Flow, React 18, Material UI wrappers, browser `Image`/`canvas`, Electron renderer filesystem access through existing `optionalRequire('fs')`, Jest via `react-app-rewired test --env=node`.

---

## File Structure

- Create `newIDE/app/src/ResourcesEditor/LocalImageTools.js`
  Owns pure local image operation types, crop clamping, expand geometry, output base-name generation, apply-button state, and a testable canvas drawing function.
- Create `newIDE/app/src/ResourcesEditor/LocalImageTools.spec.js`
  Covers geometry, validation, output naming, disabled state, and canvas draw calls.
- Modify `newIDE/app/src/MainFrame/Preferences/PreferencesContext.js`
  Extends `ResourcesToolsSettings.selectedImageTool` to include `'local-tools'`.
- Modify `newIDE/app/src/ResourcesEditor/ToolsPanel.js`
  Adds the dropdown option, preserves settings, renders the local workflow, loads image dimensions, applies operations, and writes output files.
- Modify `newIDE/app/src/ResourcesEditor/ToolsPanel.spec.js`
  Covers persisted settings for `selectedImageTool: 'local-tools'`.
- Modify `newIDE/app/src/ResourcesEditor/ToolsPanelSource.spec.js`
  Adds source-policy checks that the local tool is offered and saves generated files without resource auto-registration or source overwrite.

Before each implementation task, run `git status --short` and avoid reverting unrelated existing changes in `ProjectFilesPanel.js`, `ProjectFilesPanel.spec.js`, `WorkingDesk.js`, and `WorkingDesk.spec.js`.

---

### Task 1: Local Image Geometry Helpers

**Files:**
- Create: `newIDE/app/src/ResourcesEditor/LocalImageTools.spec.js`
- Create: `newIDE/app/src/ResourcesEditor/LocalImageTools.js`

- [ ] **Step 1: Write the failing helper tests**

Create `newIDE/app/src/ResourcesEditor/LocalImageTools.spec.js` with:

```javascript
// @flow
import {
  drawLocalImageOperationToCanvas,
  getExpandedCanvasGeometry,
  getLocalImageOutputBaseName,
  isValidLocalImageCrop,
  normalizeLocalImageCrop,
  shouldDisableLocalImageApplyButton,
} from './LocalImageTools';

describe('LocalImageTools', () => {
  const imageAttachment = {
    absolutePath: 'D:\\Project\\assets\\coin.png',
    name: 'coin.png',
    extension: '.png',
  };
  const sourceSize = { width: 100, height: 80 };

  it('clamps crop rectangles to the source image bounds', () => {
    expect(
      normalizeLocalImageCrop({
        sourceSize,
        crop: { x: -10, y: 70, width: 30, height: 20 },
      })
    ).toEqual({ x: 0, y: 70, width: 20, height: 10 });
  });

  it('detects invalid crop rectangles after clamping', () => {
    expect(
      isValidLocalImageCrop(
        normalizeLocalImageCrop({
          sourceSize,
          crop: { x: 100, y: 20, width: 20, height: 20 },
        })
      )
    ).toBe(false);
  });

  it('computes expanded canvas geometry for every direction', () => {
    expect(
      getExpandedCanvasGeometry({
        sourceSize,
        direction: 'left',
        amount: 16,
      })
    ).toEqual({ width: 116, height: 80, sourceX: 16, sourceY: 0 });
    expect(
      getExpandedCanvasGeometry({
        sourceSize,
        direction: 'right',
        amount: 16,
      })
    ).toEqual({ width: 116, height: 80, sourceX: 0, sourceY: 0 });
    expect(
      getExpandedCanvasGeometry({
        sourceSize,
        direction: 'top',
        amount: 16,
      })
    ).toEqual({ width: 100, height: 96, sourceX: 0, sourceY: 16 });
    expect(
      getExpandedCanvasGeometry({
        sourceSize,
        direction: 'bottom',
        amount: 16,
      })
    ).toEqual({ width: 100, height: 96, sourceX: 0, sourceY: 0 });
  });

  it('builds output base names from the source image and operation', () => {
    expect(
      getLocalImageOutputBaseName({
        sourceName: 'coin.png',
        operation: 'crop',
      })
    ).toBe('coin-crop');
    expect(
      getLocalImageOutputBaseName({
        sourceName: 'coin.png',
        operation: 'expand-canvas',
        expandDirection: 'right',
      })
    ).toBe('coin-expand-right');
  });

  it('disables apply until inputs are usable', () => {
    expect(
      shouldDisableLocalImageApplyButton({
        imageAttachment: null,
        isProcessing: false,
        sourceSize,
        operation: 'crop',
        crop: { x: 0, y: 0, width: 10, height: 10 },
        expandAmount: 16,
      })
    ).toBe(true);
    expect(
      shouldDisableLocalImageApplyButton({
        imageAttachment,
        isProcessing: false,
        sourceSize: null,
        operation: 'crop',
        crop: { x: 0, y: 0, width: 10, height: 10 },
        expandAmount: 16,
      })
    ).toBe(true);
    expect(
      shouldDisableLocalImageApplyButton({
        imageAttachment,
        isProcessing: false,
        sourceSize,
        operation: 'crop',
        crop: { x: 100, y: 0, width: 10, height: 10 },
        expandAmount: 16,
      })
    ).toBe(true);
    expect(
      shouldDisableLocalImageApplyButton({
        imageAttachment,
        isProcessing: false,
        sourceSize,
        operation: 'expand-canvas',
        crop: { x: 0, y: 0, width: 10, height: 10 },
        expandAmount: 0,
      })
    ).toBe(true);
    expect(
      shouldDisableLocalImageApplyButton({
        imageAttachment,
        isProcessing: false,
        sourceSize,
        operation: 'expand-canvas',
        crop: { x: 0, y: 0, width: 10, height: 10 },
        expandAmount: 16,
      })
    ).toBe(false);
  });

  it('draws crop and expansion operations to a canvas', () => {
    const context = {
      clearRect: jest.fn(),
      drawImage: jest.fn(),
    };
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => context,
    };
    const image = { id: 'image' };

    drawLocalImageOperationToCanvas({
      canvas,
      image,
      sourceSize,
      operation: 'crop',
      crop: { x: -10, y: 70, width: 30, height: 20 },
      expandDirection: 'right',
      expandAmount: 16,
    });

    expect(canvas.width).toBe(20);
    expect(canvas.height).toBe(10);
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 20, 10);
    expect(context.drawImage).toHaveBeenCalledWith(
      image,
      0,
      70,
      20,
      10,
      0,
      0,
      20,
      10
    );

    context.clearRect.mockClear();
    context.drawImage.mockClear();

    drawLocalImageOperationToCanvas({
      canvas,
      image,
      sourceSize,
      operation: 'expand-canvas',
      crop: { x: 0, y: 0, width: 10, height: 10 },
      expandDirection: 'left',
      expandAmount: 16,
    });

    expect(canvas.width).toBe(116);
    expect(canvas.height).toBe(80);
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 116, 80);
    expect(context.drawImage).toHaveBeenCalledWith(image, 16, 0);
  });
});
```

- [ ] **Step 2: Run the helper tests and verify RED**

Run:

```bash
cd newIDE/app
npm test -- --runTestsByPath src/ResourcesEditor/LocalImageTools.spec.js --watchAll=false
```

Expected: fail because `./LocalImageTools` does not exist.

- [ ] **Step 3: Implement the helper module**

Create `newIDE/app/src/ResourcesEditor/LocalImageTools.js` with:

```javascript
// @flow

export type LocalImageOperation = 'crop' | 'expand-canvas';
export type LocalImageExpandDirection = 'left' | 'right' | 'top' | 'bottom';
export type LocalImageSize = {| width: number, height: number |};
export type LocalImageAttachment = {|
  absolutePath: string,
  name: string,
  extension: string,
|};
export type LocalImageCrop = {|
  x: number,
  y: number,
  width: number,
  height: number,
|};
export type LocalImageExpandGeometry = {|
  width: number,
  height: number,
  sourceX: number,
  sourceY: number,
|};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const toPixelInteger = (value: number): number =>
  Number.isFinite(value) ? Math.floor(value) : 0;

const getSourceWidth = (sourceSize: LocalImageSize): number =>
  Math.max(0, toPixelInteger(sourceSize.width));

const getSourceHeight = (sourceSize: LocalImageSize): number =>
  Math.max(0, toPixelInteger(sourceSize.height));

export const normalizeLocalImageCrop = ({
  sourceSize,
  crop,
}: {|
  sourceSize: LocalImageSize,
  crop: LocalImageCrop,
|}): LocalImageCrop => {
  const sourceWidth = getSourceWidth(sourceSize);
  const sourceHeight = getSourceHeight(sourceSize);
  const left = clamp(toPixelInteger(crop.x), 0, sourceWidth);
  const top = clamp(toPixelInteger(crop.y), 0, sourceHeight);
  const right = clamp(
    toPixelInteger(crop.x + crop.width),
    left,
    sourceWidth
  );
  const bottom = clamp(
    toPixelInteger(crop.y + crop.height),
    top,
    sourceHeight
  );

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

export const isValidLocalImageCrop = (crop: LocalImageCrop): boolean =>
  crop.width > 0 && crop.height > 0;

export const getExpandedCanvasGeometry = ({
  sourceSize,
  direction,
  amount,
}: {|
  sourceSize: LocalImageSize,
  direction: LocalImageExpandDirection,
  amount: number,
|}): LocalImageExpandGeometry => {
  const sourceWidth = getSourceWidth(sourceSize);
  const sourceHeight = getSourceHeight(sourceSize);
  const expansionAmount = Math.max(0, toPixelInteger(amount));

  return {
    width:
      direction === 'left' || direction === 'right'
        ? sourceWidth + expansionAmount
        : sourceWidth,
    height:
      direction === 'top' || direction === 'bottom'
        ? sourceHeight + expansionAmount
        : sourceHeight,
    sourceX: direction === 'left' ? expansionAmount : 0,
    sourceY: direction === 'top' ? expansionAmount : 0,
  };
};

export const getLocalImageOutputBaseName = ({
  sourceName,
  operation,
  expandDirection,
}: {|
  sourceName: string,
  operation: LocalImageOperation,
  expandDirection?: LocalImageExpandDirection,
|}): string => {
  const sourceBaseName = sourceName.replace(/\.[^/.]+$/, '') || 'image';
  if (operation === 'crop') return `${sourceBaseName}-crop`;
  return `${sourceBaseName}-expand-${expandDirection || 'right'}`;
};

export const shouldDisableLocalImageApplyButton = ({
  imageAttachment,
  isProcessing,
  sourceSize,
  operation,
  crop,
  expandAmount,
}: {|
  imageAttachment: ?LocalImageAttachment,
  isProcessing: boolean,
  sourceSize: ?LocalImageSize,
  operation: LocalImageOperation,
  crop: LocalImageCrop,
  expandAmount: number,
|}): boolean => {
  if (!imageAttachment || isProcessing || !sourceSize) return true;
  if (operation === 'crop') {
    return !isValidLocalImageCrop(
      normalizeLocalImageCrop({ sourceSize, crop })
    );
  }
  return toPixelInteger(expandAmount) <= 0;
};

export const drawLocalImageOperationToCanvas = ({
  canvas,
  image,
  sourceSize,
  operation,
  crop,
  expandDirection,
  expandAmount,
}: {|
  canvas: any,
  image: any,
  sourceSize: LocalImageSize,
  operation: LocalImageOperation,
  crop: LocalImageCrop,
  expandDirection: LocalImageExpandDirection,
  expandAmount: number,
|}) => {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create an image canvas.');

  if (operation === 'crop') {
    const normalizedCrop = normalizeLocalImageCrop({ sourceSize, crop });
    if (!isValidLocalImageCrop(normalizedCrop)) {
      throw new Error('Choose a crop area inside the image.');
    }

    canvas.width = normalizedCrop.width;
    canvas.height = normalizedCrop.height;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      image,
      normalizedCrop.x,
      normalizedCrop.y,
      normalizedCrop.width,
      normalizedCrop.height,
      0,
      0,
      normalizedCrop.width,
      normalizedCrop.height
    );
    return;
  }

  const geometry = getExpandedCanvasGeometry({
    sourceSize,
    direction: expandDirection,
    amount: expandAmount,
  });
  canvas.width = geometry.width;
  canvas.height = geometry.height;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, geometry.sourceX, geometry.sourceY);
};
```

- [ ] **Step 4: Run the helper tests and verify GREEN**

Run:

```bash
cd newIDE/app
npm test -- --runTestsByPath src/ResourcesEditor/LocalImageTools.spec.js --watchAll=false
```

Expected: all tests pass.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add newIDE/app/src/ResourcesEditor/LocalImageTools.js newIDE/app/src/ResourcesEditor/LocalImageTools.spec.js
git commit -m "feat: add local image tool helpers"
```

---

### Task 2: Persist The New Image Tool Choice

**Files:**
- Modify: `newIDE/app/src/ResourcesEditor/ToolsPanel.spec.js`
- Modify: `newIDE/app/src/MainFrame/Preferences/PreferencesContext.js`
- Modify: `newIDE/app/src/ResourcesEditor/ToolsPanel.js`

- [ ] **Step 1: Write failing persisted-settings tests**

In `newIDE/app/src/ResourcesEditor/ToolsPanel.spec.js`, add these cases before the existing incomplete-preferences test:

```javascript
  it('persists the Local tools image tool selection', () => {
    expect(
      buildResourcesToolsSettings({
        activeToolCategory: 'image',
        selectedImageTool: 'local-tools',
        selectedSoundTool: 'elevenlabs',
        geminiApiKey: 'gemini-key',
        nanoBananaModel: 'gemini-image',
        nanoBananaPrompt: 'make a coin',
        imageAttachment: null,
        elevenLabsApiKey: 'eleven-key',
        elevenLabsMode: 'sound-effect',
        elevenLabsText: 'laser',
        elevenLabsVoiceId: 'voice',
        elevenLabsModel: 'speech-model',
        elevenLabsSoundModel: 'sound-model',
        elevenLabsOutputFormat: 'mp3_44100_128',
        elevenLabsDuration: '2.5',
      }).selectedImageTool
    ).toBe('local-tools');
  });

  it('normalizes persisted Local tools settings', () => {
    expect(
      getResourcesToolsSettingsWithDefaults({
        selectedImageTool: 'local-tools',
      }).selectedImageTool
    ).toBe('local-tools');
  });
```

- [ ] **Step 2: Run the settings tests and verify RED**

Run:

```bash
cd newIDE/app
npm test -- --runTestsByPath src/ResourcesEditor/ToolsPanel.spec.js --watchAll=false
```

Expected: fail because `selectedImageTool` still normalizes to `nano-banana`, and Flow may reject the new literal until types are updated.

- [ ] **Step 3: Update preference and ToolsPanel types**

In `newIDE/app/src/MainFrame/Preferences/PreferencesContext.js`, change:

```javascript
  selectedImageTool: 'nano-banana',
```

to:

```javascript
  selectedImageTool: 'nano-banana' | 'local-tools',
```

In `newIDE/app/src/ResourcesEditor/ToolsPanel.js`, change:

```javascript
type ImageTool = 'nano-banana';
```

to:

```javascript
type ImageTool = 'nano-banana' | 'local-tools';
```

Update `getResourcesToolsSettingsWithDefaults` so `selectedImageTool` preserves the new value:

```javascript
  selectedImageTool:
    settings && settings.selectedImageTool === 'local-tools'
      ? 'local-tools'
      : defaultResourcesToolsSettings.selectedImageTool,
```

- [ ] **Step 4: Run the settings tests and verify GREEN**

Run:

```bash
cd newIDE/app
npm test -- --runTestsByPath src/ResourcesEditor/ToolsPanel.spec.js --watchAll=false
```

Expected: all `ToolsPanel.spec.js` tests pass.

- [ ] **Step 5: Commit Task 2**

Run:

```bash
git add newIDE/app/src/MainFrame/Preferences/PreferencesContext.js newIDE/app/src/ResourcesEditor/ToolsPanel.js newIDE/app/src/ResourcesEditor/ToolsPanel.spec.js
git commit -m "feat: persist local image tool selection"
```

---

### Task 3: Render Local Tools And Save New PNG Outputs

**Files:**
- Modify: `newIDE/app/src/ResourcesEditor/ToolsPanelSource.spec.js`
- Modify: `newIDE/app/src/ResourcesEditor/ToolsPanel.js`

- [ ] **Step 1: Write failing source-policy tests**

In `newIDE/app/src/ResourcesEditor/ToolsPanelSource.spec.js`, add:

```javascript
  it('offers Local tools in the image tool selector', () => {
    const source = getSource();

    expect(source).toContain('value="local-tools"');
    expect(source).toContain('Local tools');
  });

  it('saves Local tools output as a new generated file', () => {
    const source = getSource();
    const runLocalImageToolStart = source.indexOf('const runLocalImageTool');
    const renderLocalImageToolsStart = source.indexOf(
      'const renderLocalImageTools ='
    );
    const runLocalImageToolSection = source.slice(
      runLocalImageToolStart,
      renderLocalImageToolsStart
    );

    expect(runLocalImageToolSection).toContain(
      'getImageGenerationOutputFolderPath'
    );
    expect(runLocalImageToolSection).toContain('getUniqueOutputPath');
    expect(runLocalImageToolSection).toContain('fs.promises.writeFile');
    expect(runLocalImageToolSection).not.toContain('addResourceForFile');
    expect(runLocalImageToolSection).not.toContain(
      'fs.promises.writeFile(imageAttachment.absolutePath'
    );
  });
```

- [ ] **Step 2: Run source-policy tests and verify RED**

Run:

```bash
cd newIDE/app
npm test -- --runTestsByPath src/ResourcesEditor/ToolsPanelSource.spec.js --watchAll=false
```

Expected: fail because `local-tools`, `runLocalImageTool`, and `renderLocalImageTools` do not exist yet.

- [ ] **Step 3: Add imports, styles, state, and browser helpers**

In `newIDE/app/src/ResourcesEditor/ToolsPanel.js`, add imports:

```javascript
import RectangleIcon from '../UI/CustomSvgIcons/Rectangle';
import HorizontalSizeIcon from '../UI/CustomSvgIcons/HorizontalSize';
import {
  drawLocalImageOperationToCanvas,
  getLocalImageOutputBaseName,
  shouldDisableLocalImageApplyButton,
  type LocalImageCrop,
  type LocalImageExpandDirection,
  type LocalImageOperation,
  type LocalImageSize,
} from './LocalImageTools';
```

Add styles to `styles`:

```javascript
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 8,
  },
  resultPreview: {
    maxWidth: '100%',
    maxHeight: 260,
    objectFit: 'contain',
  },
```

Add helper functions near `getImageGenerationOutputFolderPath`:

```javascript
const loadImageFromUrl = (imageUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load the image.'));
    image.src = imageUrl;
  });

const canvasToPngBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Unable to encode the image as PNG.'));
    }, 'image/png');
  });

const blobToBuffer = async (blob: Blob): Promise<any> => {
  if (!buffer) throw new Error('Binary buffers are not supported.');
  const arrayBuffer = await blob.arrayBuffer();
  return buffer.Buffer.from(arrayBuffer);
};

const parsePixelField = (value: string): number => {
  const parsedValue = parseInt(value, 10);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};
```

Add component state after existing image generation state:

```javascript
  const [localImageOperation, setLocalImageOperation] = React.useState<LocalImageOperation>(
    'crop'
  );
  const [localCropX, setLocalCropX] = React.useState('0');
  const [localCropY, setLocalCropY] = React.useState('0');
  const [localCropWidth, setLocalCropWidth] = React.useState('0');
  const [localCropHeight, setLocalCropHeight] = React.useState('0');
  const [localExpandDirection, setLocalExpandDirection] = React.useState<LocalImageExpandDirection>(
    'right'
  );
  const [localExpandAmount, setLocalExpandAmount] = React.useState('32');
  const [localImageSize, setLocalImageSize] = React.useState<?LocalImageSize>(
    null
  );
  const [isProcessingLocalImage, setIsProcessingLocalImage] = React.useState(
    false
  );
  const [localImageStatus, setLocalImageStatus] = React.useState<?string>(null);
  const [localImageError, setLocalImageError] = React.useState<?string>(null);
  const [localImageResultUrl, setLocalImageResultUrl] = React.useState<?string>(
    null
  );
  const [localImageResultPath, setLocalImageResultPath] = React.useState<?string>(
    null
  );
```

- [ ] **Step 4: Add image-selection effects and selector rendering**

In `ToolsPanel.js`, add an effect that adopts the selected project image while Local tools is active:

```javascript
  React.useEffect(
    () => {
      if (selectedImageTool !== 'local-tools' || !selectedNode) return;
      if (selectedNode.type !== 'file') return;
      const selectedImageAttachment = createImageAttachmentFromFilePath(
        selectedNode.absolutePath
      );
      if (selectedImageAttachment) {
        setImageAttachment(selectedImageAttachment);
      }
    },
    [selectedImageTool, selectedNode]
  );
```

Add an effect that loads dimensions and initializes crop fields:

```javascript
  React.useEffect(
    () => {
      let isMounted = true;
      setLocalImageSize(null);
      setLocalImageResultUrl(null);
      setLocalImageResultPath(null);
      setLocalImageStatus(null);
      setLocalImageError(null);

      const imageUrl = getImageAttachmentPreviewUrl(imageAttachment);
      if (!imageUrl) return;

      loadImageFromUrl(imageUrl)
        .then(image => {
          if (!isMounted) return;
          const sourceSize = {
            width: image.naturalWidth || image.width,
            height: image.naturalHeight || image.height,
          };
          setLocalImageSize(sourceSize);
          setLocalCropX('0');
          setLocalCropY('0');
          setLocalCropWidth(String(sourceSize.width));
          setLocalCropHeight(String(sourceSize.height));
        })
        .catch(error => {
          if (!isMounted) return;
          setLocalImageError(error && error.message ? error.message : String(error));
        });

      return () => {
        isMounted = false;
      };
    },
    [imageAttachment]
  );
```

Extract an image tool selector helper and use it in both image tools:

```javascript
  const renderImageToolSelector = () => (
    <div style={styles.toolSelector}>
      <SelectField
        floatingLabelText={<Trans>Image tool</Trans>}
        value={selectedImageTool}
        onChange={(event, index, value: string) => {
          if (value === 'nano-banana' || value === 'local-tools') {
            setSelectedImageTool(value);
          }
        }}
        fullWidth
      >
        <SelectOption value="nano-banana" label={t`Nano Banana`} />
        <SelectOption value="local-tools" label={t`Local tools`} />
      </SelectField>
    </div>
  );
```

Replace the duplicated selector at the top of `renderNanoBanana` with `{renderImageToolSelector()}`.

- [ ] **Step 5: Add the local image apply callback**

In `ToolsPanel.js`, add this callback before `renderLocalImageTools`:

```javascript
  const runLocalImageTool = React.useCallback(
    async () => {
      if (!fs || !path) {
        setLocalImageError('Filesystem paths are not supported.');
        return;
      }
      if (!imageAttachment) {
        setLocalImageError('Choose a supported image file.');
        return;
      }

      const imageUrl = getImageAttachmentPreviewUrl(imageAttachment);
      if (!imageUrl) {
        setLocalImageError('Unable to read the selected image.');
        return;
      }

      const crop: LocalImageCrop = {
        x: parsePixelField(localCropX),
        y: parsePixelField(localCropY),
        width: parsePixelField(localCropWidth),
        height: parsePixelField(localCropHeight),
      };
      const expandAmount = parsePixelField(localExpandAmount);

      setIsProcessingLocalImage(true);
      setLocalImageError(null);
      setLocalImageStatus('Processing image...');
      setLocalImageResultUrl(null);
      setLocalImageResultPath(null);

      try {
        const sourceImage = await loadImageFromUrl(imageUrl);
        const sourceSize = {
          width: sourceImage.naturalWidth || sourceImage.width,
          height: sourceImage.naturalHeight || sourceImage.height,
        };
        const canvas = document.createElement('canvas');
        drawLocalImageOperationToCanvas({
          canvas,
          image: sourceImage,
          sourceSize,
          operation: localImageOperation,
          crop,
          expandDirection: localExpandDirection,
          expandAmount,
        });
        const outputBlob = await canvasToPngBlob(canvas);
        const outputFolderPath = await getImageGenerationOutputFolderPath({
          project,
        });
        const outputPath = await getUniqueOutputPath({
          folderPath: outputFolderPath,
          baseName: getLocalImageOutputBaseName({
            sourceName: imageAttachment.name,
            operation: localImageOperation,
            expandDirection: localExpandDirection,
          }),
          extension: '.png',
        });

        await fs.promises.writeFile(outputPath, await blobToBuffer(outputBlob));
        setLocalImageStatus(`Saved ${normalizeSlashes(outputPath)}`);
        setLocalImageResultPath(normalizeSlashes(outputPath));
        setLocalImageResultUrl(getFileUrl(outputPath));
        await onProjectFilesChanged();
      } catch (error) {
        setLocalImageError(error && error.message ? error.message : String(error));
        setLocalImageStatus(null);
      } finally {
        setIsProcessingLocalImage(false);
      }
    },
    [
      imageAttachment,
      localCropHeight,
      localCropWidth,
      localCropX,
      localCropY,
      localExpandAmount,
      localExpandDirection,
      localImageOperation,
      onProjectFilesChanged,
      project,
    ]
  );
```

- [ ] **Step 6: Add the local image tool UI and render branch**

In `ToolsPanel.js`, add:

```javascript
  const localCrop: LocalImageCrop = {
    x: parsePixelField(localCropX),
    y: parsePixelField(localCropY),
    width: parsePixelField(localCropWidth),
    height: parsePixelField(localCropHeight),
  };

  const localExpandDirectionOptions: Array<{|
    value: LocalImageExpandDirection,
    label: React.Node,
  |}> = [
    { value: 'left', label: <Trans>Left</Trans> },
    { value: 'right', label: <Trans>Right</Trans> },
    { value: 'top', label: <Trans>Top</Trans> },
    { value: 'bottom', label: <Trans>Bottom</Trans> },
  ];

  const renderLocalImageTools = () => (
    <div style={styles.section}>
      {renderImageToolSelector()}
      <MiniToolbar noPadding>
        <RectangleIcon />
        <MiniToolbarText>
          <Trans>Local tools</Trans>
        </MiniToolbarText>
      </MiniToolbar>
      <div
        style={{
          ...styles.attachmentField,
          ...(isImageAttachmentDragOver
            ? styles.attachmentFieldDropTarget
            : undefined),
        }}
        onDragOver={handleImageAttachmentDragOver}
        onDragLeave={handleImageAttachmentDragLeave}
        onDrop={handleImageAttachmentDrop}
      >
        <div style={styles.attachmentInfo}>
          <MiniToolbar noPadding>
            <PictureIcon />
            <MiniToolbarText>
              <Trans>Source image</Trans>
            </MiniToolbarText>
          </MiniToolbar>
          {imageAttachment ? (
            <div style={styles.attachmentSummary}>
              <Text noMargin allowBrowserAutoTranslate={false}>
                {imageAttachment.name}
              </Text>
              <Text
                noMargin
                size="body-small"
                color="secondary"
                allowBrowserAutoTranslate={false}
                style={{ overflow: 'hidden', overflowWrap: 'anywhere' }}
              >
                {normalizeSlashes(
                  getRelativeProjectFilePath(
                    project,
                    imageAttachment.absolutePath
                  ) || imageAttachment.absolutePath
                )}
              </Text>
              {!!localImageSize && (
                <Text noMargin size="body-small" color="secondary">
                  {localImageSize.width} x {localImageSize.height}
                </Text>
              )}
            </div>
          ) : (
            <Text noMargin color="secondary">
              <Trans>No image selected.</Trans>
            </Text>
          )}
          <MiniToolbar noPadding>
            <RaisedButton
              label={imageAttachment ? <Trans>Change image</Trans> : <Trans>Choose image</Trans>}
              icon={<PictureIcon />}
              onClick={selectImageAttachment}
            />
            {shouldShowClearImageAttachmentButton(imageAttachment) && (
              <FlatButton
                label={<Trans>Clear</Trans>}
                leftIcon={<CrossIcon />}
                onClick={clearImageAttachment}
              />
            )}
          </MiniToolbar>
        </div>
        {imageAttachment && (
          <div style={styles.attachmentPreview}>
            <img
              src={getImageAttachmentPreviewUrl(imageAttachment) || undefined}
              alt={imageAttachment.name}
              style={styles.attachmentPreviewImage}
              draggable="false"
            />
          </div>
        )}
      </div>
      <div style={styles.segmentedRow}>
        <FlatButton
          label={<Trans>Crop</Trans>}
          onClick={() => setLocalImageOperation('crop')}
          primary={localImageOperation === 'crop'}
        />
        <FlatButton
          label={<Trans>Expand canvas</Trans>}
          onClick={() => setLocalImageOperation('expand-canvas')}
          primary={localImageOperation === 'expand-canvas'}
        />
      </div>
      {localImageOperation === 'crop' ? (
        <div style={styles.fieldGrid}>
          <TextField type="number" value={localCropX} onChange={(event, value) => setLocalCropX(value)} floatingLabelText={<Trans>X</Trans>} min={0} fullWidth />
          <TextField type="number" value={localCropY} onChange={(event, value) => setLocalCropY(value)} floatingLabelText={<Trans>Y</Trans>} min={0} fullWidth />
          <TextField type="number" value={localCropWidth} onChange={(event, value) => setLocalCropWidth(value)} floatingLabelText={<Trans>Width</Trans>} min={1} fullWidth />
          <TextField type="number" value={localCropHeight} onChange={(event, value) => setLocalCropHeight(value)} floatingLabelText={<Trans>Height</Trans>} min={1} fullWidth />
        </div>
      ) : (
        <>
          <div style={styles.segmentedRow}>
            {localExpandDirectionOptions.map(({ value, label }) => (
              <FlatButton
                key={value}
                label={label}
                onClick={() => setLocalExpandDirection(value)}
                primary={localExpandDirection === value}
              />
            ))}
          </div>
          <TextField
            type="number"
            value={localExpandAmount}
            onChange={(event, value) => setLocalExpandAmount(value)}
            floatingLabelText={<Trans>Pixels to add</Trans>}
            min={1}
            fullWidth
          />
        </>
      )}
      <MiniToolbar noPadding>
        <RaisedButton
          label={<Trans>Apply</Trans>}
          icon={<HorizontalSizeIcon />}
          onClick={runLocalImageTool}
          disabled={shouldDisableLocalImageApplyButton({
            imageAttachment,
            isProcessing: isProcessingLocalImage,
            sourceSize: localImageSize,
            operation: localImageOperation,
            crop: localCrop,
            expandAmount: parsePixelField(localExpandAmount),
          })}
        />
      </MiniToolbar>
      {!!localImageError && <Text color="error">{localImageError}</Text>}
      {!!localImageStatus && <Text>{localImageStatus}</Text>}
      {!!localImageResultPath && (
        <Text noMargin color="secondary" allowBrowserAutoTranslate={false}>
          {localImageResultPath}
        </Text>
      )}
      {!!localImageResultUrl && (
        <img
          src={localImageResultUrl}
          alt="Local image tool result"
          style={styles.resultPreview}
          draggable="false"
        />
      )}
    </div>
  );
```

Update the image render branch:

```javascript
          {activeToolCategory === 'image'
            ? selectedImageTool === 'nano-banana'
              ? renderNanoBanana()
              : selectedImageTool === 'local-tools'
              ? renderLocalImageTools()
              : null
            : selectedSoundTool === 'elevenlabs'
            ? renderElevenLabs()
            : null}
```

- [ ] **Step 7: Run source-policy tests and helper tests**

Run:

```bash
cd newIDE/app
npm test -- --runTestsByPath src/ResourcesEditor/ToolsPanelSource.spec.js src/ResourcesEditor/LocalImageTools.spec.js --watchAll=false
```

Expected: both test files pass.

- [ ] **Step 8: Commit Task 3**

Run:

```bash
git add newIDE/app/src/ResourcesEditor/ToolsPanel.js newIDE/app/src/ResourcesEditor/ToolsPanelSource.spec.js
git commit -m "feat: add local image tools panel"
```

---

### Task 4: Final Verification

**Files:**
- Verify: all files touched in Tasks 1-3

- [ ] **Step 1: Run the focused ResourcesEditor tests**

Run:

```bash
cd newIDE/app
npm test -- --runTestsByPath src/ResourcesEditor/LocalImageTools.spec.js src/ResourcesEditor/ToolsPanel.spec.js src/ResourcesEditor/ToolsPanelSource.spec.js --watchAll=false
```

Expected: all tests pass.

- [ ] **Step 2: Run Flow for the app**

Run:

```bash
cd newIDE/app
npm run flow
```

Expected: Flow completes without new errors.

- [ ] **Step 3: Inspect git diff**

Run:

```bash
git status --short
git diff -- newIDE/app/src/ResourcesEditor/LocalImageTools.js newIDE/app/src/ResourcesEditor/LocalImageTools.spec.js newIDE/app/src/ResourcesEditor/ToolsPanel.js newIDE/app/src/ResourcesEditor/ToolsPanel.spec.js newIDE/app/src/ResourcesEditor/ToolsPanelSource.spec.js newIDE/app/src/MainFrame/Preferences/PreferencesContext.js
```

Expected: only intended local image tool changes appear, plus pre-existing unrelated dirty files remain untouched.

- [ ] **Step 4: Manual desktop smoke test**

Run the app if needed:

```bash
cd newIDE/app
npm start
```

Manual checks:

- Open a saved local project.
- Open Resources editor, Tools, Image, `Local tools`.
- Select an image from project files and confirm it becomes the source image.
- Crop a small region and apply.
- Confirm a new `generated/*-crop.png` file appears and the original image is unchanged.
- Expand the same or another image to the right and apply.
- Confirm a new `generated/*-expand-right.png` file appears.

- [ ] **Step 5: Commit verification fixes if any**

If verification required fixes, commit them:

```bash
git add newIDE/app/src/ResourcesEditor/LocalImageTools.js newIDE/app/src/ResourcesEditor/LocalImageTools.spec.js newIDE/app/src/ResourcesEditor/ToolsPanel.js newIDE/app/src/ResourcesEditor/ToolsPanel.spec.js newIDE/app/src/ResourcesEditor/ToolsPanelSource.spec.js newIDE/app/src/MainFrame/Preferences/PreferencesContext.js
git commit -m "fix: stabilize local image tools"
```

If no fixes were needed, do not create an empty commit.
