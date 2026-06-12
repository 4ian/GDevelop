// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import ObjectPropertiesEditor from './ObjectPropertiesEditor';
import { type EditorProps } from './EditorProps.flow';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import Checkbox from '../../UI/Checkbox';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import Text from '../../UI/Text';
import AlertMessage from '../../UI/AlertMessage';
import { Tabs } from '../../UI/Tabs';
import ColorPicker, { type ColorResult } from '../../UI/ColorField/ColorPicker';
import { Line, Column } from '../../UI/Grid';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { type RGBColor } from '../../Utils/ColorTransformer';
import ResourcesLoader from '../../ResourcesLoader';

const gd: libGDevelop = global.gd;

const EDITOR_RUNTIME_BASE_URL =
  'http://127.0.0.1:5002/Runtime/Extensions/Spine43Object/';
const DEFAULT_RUNTIME_SCRIPT_PATH = 'Extensions/Spine43Object/spine-pixi-v7.js';

const styles = {
  buttonsLine: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    paddingTop: 12,
    paddingBottom: 8,
  },
  dialogBody: {
    display: 'grid',
    gridTemplateColumns: 'minmax(560px, 1fr) 390px',
    gap: 12,
    width: '100%',
    flex: 1,
    minHeight: 0,
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    height: 'min(860px, calc(100vh - 170px))',
    minHeight: 620,
  },
  tabsContainer: {
    paddingBottom: 10,
  },
  previewColumn: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  previewToolbar: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: '0 0 8px 0',
  },
  previewToolbarColor: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  previewToolbarColorSwatch: {
    width: 32,
    height: 22,
  },
  preview: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    backgroundColor: '#20242b',
    backgroundImage:
      'linear-gradient(45deg, rgba(255,255,255,.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,.05) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,.05) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,.05) 75%)',
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
    border: '1px solid rgba(255,255,255,.18)',
    overflow: 'hidden',
  },
  previewStatus: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    pointerEvents: 'none',
  },
  side: {
    overflowY: 'auto',
    paddingRight: 4,
    minHeight: 0,
  },
  panel: {
    border: '1px solid rgba(255,255,255,.13)',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 78px 78px',
    gap: 6,
    alignItems: 'end',
  },
  smallRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 6,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  listItem: {
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 4,
    padding: 8,
    cursor: 'pointer',
  },
  selectedListItem: {
    border: '1px solid #9b7cff',
    backgroundColor: 'rgba(155,124,255,.16)',
  },
  swatch: {
    width: 28,
    height: 28,
    border: '1px solid rgba(255,255,255,.35)',
    borderRadius: 4,
    marginTop: 18,
  },
  colorPickerLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  colorPickerSwatch: {
    width: 54,
    height: 34,
  },
  panelActions: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    paddingTop: 8,
  },
};

type InspectorMode = 'bones' | 'mesh' | 'slots' | 'animation';
type AnyObject = { [string]: any, ... };
type Spine43Content = AnyObject;
type PreviewColor = {|
  r: number,
  g: number,
  b: number,
  a: number,
|};
type InspectorOverrides = {|
  bones: AnyObject,
  constraints: AnyObject,
  slots: AnyObject,
|};
type RuntimeResetRequest = {|
  id: number,
  type: 'all' | 'bone',
  boneName: string,
|};
type BoneOverrideOptions = {|
  recordUndo?: boolean,
  immediate?: boolean,
|};
type TimelineEntry = {|
  name: string,
  path: string,
  value: any,
|};

const emptyInspectorOverrides = (): InspectorOverrides => ({
  bones: {},
  constraints: {},
  slots: {},
});

const clone = (value: any): any => JSON.parse(JSON.stringify(value || {}));

const DEFAULT_MESH_PREVIEW_COLOR = {
  r: 77,
  g: 220,
  b: 255,
  a: 1,
};

const toNumber = (value: any, fallback: number): number => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const clampColorComponent = (value: any, fallback: number): number =>
  Math.max(0, Math.min(255, Math.round(toNumber(value, fallback))));

const normalizePreviewColor = (color: any): PreviewColor => ({
  r: clampColorComponent(color && color.r, DEFAULT_MESH_PREVIEW_COLOR.r),
  g: clampColorComponent(color && color.g, DEFAULT_MESH_PREVIEW_COLOR.g),
  b: clampColorComponent(color && color.b, DEFAULT_MESH_PREVIEW_COLOR.b),
  a: Math.max(
    0,
    Math.min(1, toNumber(color && color.a, DEFAULT_MESH_PREVIEW_COLOR.a))
  ),
});

const colorToPixiNumber = (color: any): number => {
  const normalized = normalizePreviewColor(color);
  return (normalized.r << 16) + (normalized.g << 8) + normalized.b;
};

const getMeshPreviewColor = (content: any): PreviewColor =>
  normalizePreviewColor(
    content && content.meshPreview ? content.meshPreview.color : null
  );

const getNodeRequire = (): any => {
  if (typeof global !== 'undefined' && typeof global.require === 'function') {
    return global.require;
  }
  if (typeof window !== 'undefined' && typeof window.require === 'function') {
    return window.require;
  }
  return null;
};

const toFileUrl = (absolutePath: string): string => {
  const nodeRequire = getNodeRequire();
  if (nodeRequire) {
    try {
      const nodeUrl = nodeRequire('url');
      if (nodeUrl && nodeUrl.pathToFileURL) {
        return nodeUrl.pathToFileURL(absolutePath).toString();
      }
    } catch (error) {
      // Fallback below.
    }
  }
  return 'file:///' + String(absolutePath || '').replace(/\\/g, '/');
};

const fileUrlToPath = (fileUrl: string): string => {
  const nodeRequire = getNodeRequire();
  if (nodeRequire) {
    try {
      const nodeUrl = nodeRequire('url');
      if (nodeUrl && nodeUrl.fileURLToPath)
        return nodeUrl.fileURLToPath(fileUrl);
    } catch (error) {
      // Fallback below.
    }
  }
  return decodeURIComponent(String(fileUrl).replace(/^file:\/\/\/?/i, ''));
};

const getContent = (
  objectConfiguration: gdObjectConfiguration
): Spine43Content => {
  try {
    const jsImplementation = (gd.asObjectJsImplementation(
      objectConfiguration
    ): any);
    return jsImplementation.content || {};
  } catch (error) {
    return {};
  }
};

const resolveResourceUrl = (
  project: ?gdProject,
  resourceNameOrFile: ?string
): string => {
  const value = String(resourceNameOrFile || '').trim();
  if (!project || !value) return '';

  let file = value;
  let isProjectResource = false;
  const projectAsAny = (project: any);
  const resourcesManager = project.getResourcesManager();
  if (resourcesManager && resourcesManager.hasResource(value)) {
    isProjectResource = true;
    const resource = resourcesManager.getResource(value);
    const resourceAsAny = (resource: any);
    if (resourceAsAny && typeof resourceAsAny.getFile === 'function') {
      file = resourceAsAny.getFile() || value;
    }
  }

  if (/^(?:https?:|file:|data:|blob:)/i.test(file)) return file;

  const nodeRequire = getNodeRequire();
  const getProjectFile = projectAsAny.getProjectFile;
  const projectFile =
    typeof getProjectFile === 'function' ? getProjectFile.call(project) : '';
  if (nodeRequire && projectFile) {
    try {
      const nodePath = nodeRequire('path');
      return toFileUrl(nodePath.resolve(nodePath.dirname(projectFile), file));
    } catch (error) {
      return file;
    }
  }

  if (/^[a-zA-Z]:[\\/]/.test(file)) return toFileUrl(file);

  if (isProjectResource) {
    return ResourcesLoader.getResourceFullUrl(project, value, {
      isResourceForPixi: false,
    });
  }

  return file;
};

const readText = async (url: string): Promise<string> => {
  if (/^file:/i.test(url)) {
    const nodeRequire = getNodeRequire();
    if (nodeRequire) {
      const nodeFs = nodeRequire('fs');
      return nodeFs.readFileSync(fileUrlToPath(url), 'utf8');
    }
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to read ${url}`);
  return response.text();
};

const getBones = (skeletonJson: any): Array<any> =>
  Array.isArray(skeletonJson && skeletonJson.bones) ? skeletonJson.bones : [];

const getSlots = (skeletonJson: any): Array<any> =>
  Array.isArray(skeletonJson && skeletonJson.slots) ? skeletonJson.slots : [];

const getConstraints = (skeletonJson: any): Array<any> =>
  Array.isArray(skeletonJson && skeletonJson.constraints)
    ? skeletonJson.constraints
    : ([]: Array<any>)
        .concat(
          Array.isArray(skeletonJson && skeletonJson.ik) ? skeletonJson.ik : []
        )
        .concat(
          Array.isArray(skeletonJson && skeletonJson.transform)
            ? skeletonJson.transform
            : []
        )
        .concat(
          Array.isArray(skeletonJson && skeletonJson.path)
            ? skeletonJson.path
            : []
        );

const getAnimationNames = (skeletonJson: any): Array<string> => {
  const animations = skeletonJson && skeletonJson.animations;
  if (Array.isArray(animations))
    return animations.map(animation =>
      String((animation && animation.name) || '')
    );
  return animations && typeof animations === 'object'
    ? Object.keys(animations).map(name => String(name))
    : [];
};

const getSkins = (skeletonJson: any): Array<any> => {
  const skins = skeletonJson && skeletonJson.skins;
  if (Array.isArray(skins)) return skins;
  if (skins && typeof skins === 'object') {
    return Object.keys(skins).map(name => ({
      name,
      attachments: skins[name],
    }));
  }
  return [];
};

const getSlotAttachments = (
  skeletonJson: any,
  slotName: string
): Array<any> => {
  const attachments: Array<any> = [];
  getSkins(skeletonJson).forEach(skin => {
    const skinAttachments = skin && (skin.attachments || skin);
    const slotAttachments = skinAttachments && skinAttachments[slotName];
    if (!slotAttachments) return;
    Object.keys(slotAttachments).forEach(attachmentName => {
      attachments.push({
        skinName: skin.name || 'default',
        slotName,
        name: attachmentName,
        attachment: slotAttachments[attachmentName],
      });
    });
  });
  return attachments;
};

const getAllAttachments = (skeletonJson: any): Array<any> =>
  getSlots(skeletonJson).reduce(
    (all: Array<any>, slot: any) =>
      all.concat(getSlotAttachments(skeletonJson, slot.name)),
    ([]: Array<any>)
  );

const parseColorString = (color: any): PreviewColor => {
  const value = String(color || 'ffffffff');
  const normalized = value.length === 6 ? `${value}ff` : value;
  const parse = (index: number): number =>
    parseInt(normalized.substr(index, 2), 16);
  return {
    r: Number.isFinite(parse(0)) ? parse(0) : 255,
    g: Number.isFinite(parse(2)) ? parse(2) : 255,
    b: Number.isFinite(parse(4)) ? parse(4) : 255,
    a: Number.isFinite(parse(6)) ? parse(6) / 255 : 1,
  };
};

const colorToCss = (color: PreviewColor): string =>
  `rgba(${Math.round(toNumber(color.r, 255))}, ${Math.round(
    toNumber(color.g, 255)
  )}, ${Math.round(toNumber(color.b, 255))}, ${Math.max(
    0,
    Math.min(1, toNumber(color.a, 1))
  )})`;

const dialogRuntimeScriptPromises: { [string]: Promise<void>, ... } = {};

const getSpine43Adapter = (): any =>
  typeof window !== 'undefined' ? (window: any).GDSpine43Adapter || null : null;

const getPixi = (): any =>
  typeof window !== 'undefined' ? (window: any).PIXI || null : null;

const ensurePixi = (): any => {
  const existingPixi = getPixi();
  if (existingPixi) return existingPixi;

  const nodeRequire = getNodeRequire();
  if (!nodeRequire || typeof window === 'undefined') return null;

  try {
    const pixi = nodeRequire('pixi.js-legacy');
    if (pixi && pixi.Application) {
      (window: any).PIXI = pixi;
      return pixi;
    }
  } catch (error) {
    // Try the non-legacy package below.
  }

  try {
    const pixi = nodeRequire('pixi.js');
    if (pixi && pixi.Application) {
      (window: any).PIXI = pixi;
      return pixi;
    }
  } catch (error) {
    // The preview will show a clear loading error.
  }

  return null;
};

const loadDialogRuntimeScript = (filename: string): Promise<void> => {
  const url = EDITOR_RUNTIME_BASE_URL + filename;
  if (dialogRuntimeScriptPromises[url]) return dialogRuntimeScriptPromises[url];

  dialogRuntimeScriptPromises[url] = new Promise<void>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('Editor document is not available.'));
      return;
    }

    const existing = document.querySelector(
      'script[data-gd-spine43-dialog="' + url + '"]'
    );
    if (existing) {
      if (existing.getAttribute('data-loaded') === '1') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Failed to load ' + url)),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = url;
    script.setAttribute('data-gd-spine43-dialog', url);
    script.addEventListener(
      'load',
      () => {
        script.setAttribute('data-loaded', '1');
        resolve();
      },
      { once: true }
    );
    script.addEventListener(
      'error',
      () => reject(new Error('Failed to load ' + url)),
      { once: true }
    );
    const documentHead = document.head;
    if (!documentHead) {
      reject(new Error('Unable to load ' + url + ': missing document head.'));
      return;
    }
    documentHead.appendChild(script);
  });

  return dialogRuntimeScriptPromises[url];
};

const ensureDialogRuntime = async (): Promise<void> => {
  ensurePixi();
  if (!getSpine43Adapter()) {
    await loadDialogRuntimeScript('spine43-gdevelop-runtime.js');
  }
  if (!getSpine43Adapter()) {
    throw new Error('Spine 4.3 editor runtime is not available.');
  }
  if (!ensurePixi()) {
    throw new Error('PIXI is not available in the editor window.');
  }
};

const getRuntimeSlotAttachment = (slot: any): any => {
  if (!slot) return null;
  if (slot.currentMesh && slot.currentMesh.attachment) {
    return slot.currentMesh.attachment;
  }
  if (typeof slot.getPose === 'function') {
    try {
      const pose = slot.getPose();
      if (pose && typeof pose.getAttachment === 'function') {
        const attachment = pose.getAttachment();
        if (attachment) return attachment;
      }
      if (pose && pose.attachment) return pose.attachment;
    } catch (error) {
      // Keep trying the other runtime shapes.
    }
  }
  if (typeof slot.getAttachment === 'function') {
    try {
      const attachment = slot.getAttachment();
      if (attachment) return attachment;
    } catch (error) {
      // Keep trying the other runtime shapes.
    }
  }
  return slot.attachment || null;
};

const computeRuntimeWorldVertices = (
  attachment: any,
  slot: any,
  skeleton: any
): Array<number> => {
  if (
    !attachment ||
    !slot ||
    typeof attachment.computeWorldVertices !== 'function'
  ) {
    return [];
  }

  const slotPose =
    slot.appliedPose ||
    (typeof slot.getAppliedPose === 'function'
      ? slot.getAppliedPose()
      : null) ||
    slot.pose ||
    null;
  let regionOffsets = null;
  if (typeof attachment.getOffsets === 'function') {
    try {
      const offsets = attachment.getOffsets(slotPose);
      if (offsets && typeof offsets.length === 'number') {
        regionOffsets = offsets;
      }
    } catch (error) {
      // Region offsets are optional.
    }
  }

  const vertexLength =
    Math.max(
      0,
      regionOffsets && typeof regionOffsets.length === 'number'
        ? regionOffsets.length
        : 0,
      Number(attachment.worldVerticesLength) || 0,
      attachment.offset && typeof attachment.offset.length === 'number'
        ? attachment.offset.length
        : 0,
      attachment.vertices && typeof attachment.vertices.length === 'number'
        ? attachment.vertices.length
        : 0,
      attachment.regionUVs && typeof attachment.regionUVs.length === 'number'
        ? attachment.regionUVs.length
        : 0,
      attachment.uvs && typeof attachment.uvs.length === 'number'
        ? attachment.uvs.length
        : 0
    ) || 8;
  const output = new Float32Array(vertexLength);
  const invocations: Array<() => any> = [];

  if (regionOffsets) {
    invocations.push(() =>
      attachment.computeWorldVertices(slot, regionOffsets, output, 0, 2)
    );
  }
  if (skeleton) {
    invocations.push(() =>
      attachment.computeWorldVertices(
        skeleton,
        slot,
        0,
        vertexLength,
        output,
        0,
        2
      )
    );
  }
  invocations.push(
    () => attachment.computeWorldVertices(slot, 0, vertexLength, output, 0, 2),
    () => attachment.computeWorldVertices(slot, output, 0, 2),
    () => attachment.computeWorldVertices(slot.bone || slot, output, 0, 2),
    () => attachment.computeWorldVertices(slot, output),
    () => attachment.computeWorldVertices(slot.bone || slot, output)
  );

  for (const invoke of invocations) {
    try {
      invoke();
      return Array.from(output);
    } catch (error) {
      // Spine 4.x runtimes changed this signature a few times.
    }
  }
  return [];
};

const getRuntimeTriangleIndices = (
  attachment: any,
  vertices: Array<number>
): Array<number> => {
  if (!attachment) return [];
  if (attachment.triangles && typeof attachment.triangles.length === 'number') {
    return Array.from(attachment.triangles);
  }
  const vertexCount = Math.floor(
    (vertices && vertices.length ? vertices.length : 0) / 2
  );
  if (vertexCount < 3) return [];
  if (vertexCount === 4) return [0, 1, 2, 2, 3, 0];
  const indices: Array<number> = [];
  for (let index = 1; index < vertexCount - 1; index++) {
    indices.push(0, index, index + 1);
  }
  return indices;
};

const getBoneName = (bone: any): string =>
  String(
    bone && bone.data && bone.data.name ? bone.data.name : bone && bone.name
  );

const getBonePose = (bone: any): any => {
  if (!bone) return null;
  return bone.appliedPose || bone.pose || bone;
};

const getBoneWorldPoint = (
  bone: any
): ?{| x: number, y: number, a: number, b: number, c: number, d: number |} => {
  const pose = getBonePose(bone);
  if (!pose) return null;
  return {
    x: toNumber(pose.worldX, toNumber(pose.x, 0)),
    y: toNumber(pose.worldY, toNumber(pose.y, 0)),
    a: toNumber(pose.a, Math.cos((toNumber(pose.rotation, 0) * Math.PI) / 180)),
    b: toNumber(pose.b, 0),
    c: toNumber(pose.c, Math.sin((toNumber(pose.rotation, 0) * Math.PI) / 180)),
    d: toNumber(pose.d, 1),
  };
};

const findRuntimeBone = (skeleton: any, name: ?string): any => {
  const boneName = String(name || '');
  if (!skeleton || !boneName) return null;
  if (typeof skeleton.findBone === 'function') {
    const bone = skeleton.findBone(boneName);
    if (bone) return bone;
  }
  return Array.isArray(skeleton.bones)
    ? skeleton.bones.find(bone => getBoneName(bone) === boneName) || null
    : null;
};

const getRuntimeBoneParent = (skeleton: any, bone: any): any => {
  if (!bone) return null;
  if (bone.parent) return bone.parent;
  const parentName =
    bone.data && bone.data.parent && bone.data.parent.name
      ? bone.data.parent.name
      : bone.parentName || '';
  return parentName ? findRuntimeBone(skeleton, parentName) : null;
};

const worldDeltaToBoneLocal = (
  parentBone: any,
  dx: number,
  dy: number
): {| x: number, y: number |} => {
  const parentPoint = getBoneWorldPoint(parentBone);
  if (!parentPoint) return { x: dx, y: dy };
  const a = parentPoint.a;
  const b = parentPoint.b;
  const c = parentPoint.c;
  const d = parentPoint.d;
  const determinant = a * d - b * c;
  if (!Number.isFinite(determinant) || Math.abs(determinant) < 0.00001) {
    return { x: dx, y: dy };
  }
  return {
    x: (dx * d - dy * b) / determinant,
    y: (dy * a - dx * c) / determinant,
  };
};

const getRuntimeBoneSegment = (
  bone: any
): ?{|
  name: string,
  x: number,
  y: number,
  tipX: number,
  tipY: number,
  length: number,
|} => {
  const point = getBoneWorldPoint(bone);
  if (!point) return null;
  const length =
    bone && bone.data && Number.isFinite(Number(bone.data.length))
      ? Number(bone.data.length)
      : 24;
  return {
    name: getBoneName(bone),
    x: point.x,
    y: point.y,
    tipX: point.x + point.a * length,
    tipY: point.y + point.c * length,
    length,
  };
};

const getPointToSegmentDistance = (
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): number => {
  const abX = bx - ax;
  const abY = by - ay;
  const lengthSquared = abX * abX + abY * abY;
  if (lengthSquared <= 0.00001) {
    const dx = px - ax;
    const dy = py - ay;
    return Math.sqrt(dx * dx + dy * dy);
  }
  const t = Math.max(
    0,
    Math.min(1, ((px - ax) * abX + (py - ay) * abY) / lengthSquared)
  );
  const projectedX = ax + abX * t;
  const projectedY = ay + abY * t;
  const dx = px - projectedX;
  const dy = py - projectedY;
  return Math.sqrt(dx * dx + dy * dy);
};

const findRuntimeBoneAtPoint = (
  skeleton: any,
  x: number,
  y: number,
  threshold: number
): any => {
  const bones = skeleton && Array.isArray(skeleton.bones) ? skeleton.bones : [];
  let best: any = null;
  let bestDistance = threshold;
  bones.forEach(bone => {
    const segment = getRuntimeBoneSegment(bone);
    if (!segment || !segment.name) return;
    const distance = getPointToSegmentDistance(
      x,
      y,
      segment.x,
      segment.y,
      segment.tipX,
      segment.tipY
    );
    if (distance <= bestDistance) {
      bestDistance = distance;
      best = bone;
    }
  });
  return best;
};

const drawRuntimeMeshes = (
  graphics: any,
  skeleton: any,
  selectedSlotName: string,
  showAllSlots: boolean,
  color: any
): void => {
  const meshColor = normalizePreviewColor(color);
  const meshColorNumber = colorToPixiNumber(meshColor);
  const meshAlpha = Math.max(0, Math.min(1, toNumber(meshColor.a, 1)));
  const slots =
    skeleton && Array.isArray(skeleton.drawOrder) && skeleton.drawOrder.length
      ? skeleton.drawOrder
      : skeleton && Array.isArray(skeleton.slots)
      ? skeleton.slots
      : [];
  slots.forEach(slot => {
    const slotName =
      slot && slot.data && slot.data.name ? slot.data.name : slot && slot.name;
    if (!showAllSlots && selectedSlotName && slotName !== selectedSlotName)
      return;

    const attachment = getRuntimeSlotAttachment(slot);
    const vertices = computeRuntimeWorldVertices(attachment, slot, skeleton);
    const indices = getRuntimeTriangleIndices(attachment, vertices);
    if (!vertices.length || !indices.length) return;

    graphics.lineStyle(1.5, meshColorNumber, meshAlpha * 0.95);
    graphics.beginFill(meshColorNumber, meshAlpha * 0.2);
    for (let index = 0; index + 2 < indices.length; index += 3) {
      const ia = Number(indices[index]) * 2;
      const ib = Number(indices[index + 1]) * 2;
      const ic = Number(indices[index + 2]) * 2;
      if (
        ia + 1 >= vertices.length ||
        ib + 1 >= vertices.length ||
        ic + 1 >= vertices.length
      ) {
        continue;
      }
      graphics.moveTo(vertices[ia], vertices[ia + 1]);
      graphics.lineTo(vertices[ib], vertices[ib + 1]);
      graphics.lineTo(vertices[ic], vertices[ic + 1]);
      graphics.lineTo(vertices[ia], vertices[ia + 1]);
    }
    graphics.endFill();
  });
};

const drawRuntimeBones = (
  graphics: any,
  skeleton: any,
  selectedBoneName: string,
  hoveredBoneName: string
): void => {
  const bones = skeleton && Array.isArray(skeleton.bones) ? skeleton.bones : [];
  bones.forEach(bone => {
    const segment = getRuntimeBoneSegment(bone);
    if (!segment) return;
    const isHovered = segment.name === hoveredBoneName;
    const isSelected = segment.name === selectedBoneName;
    if (isHovered || isSelected) {
      graphics.lineStyle(isHovered ? 8 : 6, 0x9b7cff, isHovered ? 0.8 : 0.55);
      graphics.moveTo(segment.x, segment.y);
      graphics.lineTo(segment.tipX, segment.tipY);
      graphics.drawCircle(segment.x, segment.y, isHovered ? 13 : 11);
    }
    graphics.lineStyle(2.5, 0xd7df28, 0.95);
    graphics.moveTo(segment.x, segment.y);
    graphics.lineTo(segment.tipX, segment.tipY);
    graphics.beginFill(0x20242b, 0.95);
    graphics.lineStyle(1.5, 0xd7df28, 1);
    graphics.drawCircle(segment.x, segment.y, 5);
    graphics.endFill();
  });
};

const drawRuntimeConstraints = (graphics: any, skeleton: any): void => {
  const constraints =
    skeleton && Array.isArray(skeleton.constraints) ? skeleton.constraints : [];
  constraints.forEach(constraint => {
    const data = constraint && constraint.data ? constraint.data : {};
    const targetName =
      data.target && data.target.name
        ? data.target.name
        : data.bone && data.bone.name
        ? data.bone.name
        : '';
    const bone = findRuntimeBone(skeleton, targetName);
    const point = getBoneWorldPoint(bone);
    if (!point) return;
    graphics.lineStyle(2, 0x9b7cff, 0.9);
    graphics.drawCircle(point.x, point.y, 10);
    graphics.moveTo(point.x - 14, point.y);
    graphics.lineTo(point.x + 14, point.y);
    graphics.moveTo(point.x, point.y - 14);
    graphics.lineTo(point.x, point.y + 14);
  });
};

const fitRuntimePreview = (
  app: any,
  contentLayer: any,
  spineContainer: any
): boolean => {
  if (
    !app ||
    !contentLayer ||
    !spineContainer ||
    !spineContainer.getLocalBounds
  ) {
    return false;
  }
  const width =
    app.screen && Number.isFinite(app.screen.width) ? app.screen.width : 1;
  const height =
    app.screen && Number.isFinite(app.screen.height) ? app.screen.height : 1;
  const bounds = spineContainer.getLocalBounds();
  if (
    !bounds ||
    !Number.isFinite(bounds.width) ||
    !Number.isFinite(bounds.height) ||
    bounds.width <= 0 ||
    bounds.height <= 0
  ) {
    contentLayer.position.set(width / 2, height / 2);
    contentLayer.scale.set(1);
    return false;
  }
  const padding = 72;
  const scale = Math.min(
    (width - padding) / bounds.width,
    (height - padding) / bounds.height,
    4
  );
  const safeScale = Math.max(0.05, Number.isFinite(scale) ? scale : 1);
  contentLayer.scale.set(safeScale);
  contentLayer.position.set(
    width / 2 - (bounds.x + bounds.width / 2) * safeScale,
    height / 2 - (bounds.y + bounds.height / 2) * safeScale
  );
  return true;
};

type PreviewOptions = {|
  showImage: boolean,
  showBones: boolean,
  showConstraints: boolean,
  showMesh: boolean,
|};

const PreviewToolbar = ({
  options,
  onChange,
  meshColor,
  onMeshColorChange,
}: {|
  options: PreviewOptions,
  onChange: PreviewOptions => void,
  meshColor: any,
  onMeshColorChange: ColorResult => void,
|}) => (
  <div style={styles.previewToolbar}>
    <Checkbox
      checked={options.showImage}
      label="显示图像"
      onCheck={(event, checked) => onChange({ ...options, showImage: checked })}
    />
    <Checkbox
      checked={options.showBones}
      label="显示骨骼"
      onCheck={(event, checked) => onChange({ ...options, showBones: checked })}
    />
    <Checkbox
      checked={options.showConstraints}
      label="显示约束"
      onCheck={(event, checked) =>
        onChange({ ...options, showConstraints: checked })
      }
    />
    <Checkbox
      checked={options.showMesh}
      label="显示网格"
      onCheck={(event, checked) => onChange({ ...options, showMesh: checked })}
    />
    <div style={styles.previewToolbarColor}>
      <Text noMargin size="body-small">
        网格颜色
      </Text>
      <ColorPicker
        disableAlpha
        color={meshColor}
        onChange={onMeshColorChange}
        onChangeComplete={onMeshColorChange}
        style={styles.previewToolbarColorSwatch}
      />
    </div>
  </div>
);

const Preview = ({
  project,
  content,
  selectedSlotName,
  previewOptions,
  selectedBoneName,
  onSelectedBoneNameChange,
  onBoneOverrideChange,
  onBoneDragStart,
  onBoneDragEnd,
  runtimeResetRequest,
}: {|
  project: ?gdProject,
  content: Spine43Content,
  selectedSlotName: string,
  previewOptions: PreviewOptions,
  selectedBoneName: string,
  onSelectedBoneNameChange: string => void,
  onBoneOverrideChange: (string, AnyObject, BoneOverrideOptions) => void,
  onBoneDragStart: () => void,
  onBoneDragEnd: () => void,
  runtimeResetRequest: ?RuntimeResetRequest,
|}) => {
  const viewportRef = React.useRef<?HTMLDivElement>(null);
  const latestRef = React.useRef({
    content,
    selectedSlotName,
    previewOptions,
    selectedBoneName,
    onSelectedBoneNameChange,
    onBoneOverrideChange,
    onBoneDragStart,
    onBoneDragEnd,
    runtimeResetRequest,
  });
  const [status, setStatus] = React.useState<?string>('正在加载 Spine 预览...');

  latestRef.current = {
    content,
    selectedSlotName,
    previewOptions,
    selectedBoneName,
    onSelectedBoneNameChange,
    onBoneOverrideChange,
    onBoneDragStart,
    onBoneDragEnd,
    runtimeResetRequest,
  };

  const skeletonFile = resolveResourceUrl(project, content.skeletonResource);
  const atlasFile = resolveResourceUrl(project, content.atlasResource);

  React.useEffect(
    () => {
      let cancelled = false;
      let app: any = null;
      let handle: any = null;
      let resizeObserver: any = null;
      let contentLayer: any = null;
      let overlayGraphics: any = null;
      let lastAnimationKey = '';
      let lastSkinName = '';
      let lastMixDuration: ?number = null;
      let lastRuntimeResetRequestId = 0;
      let hoveredBoneName = '';
      let draggingBone: any = null;
      let panningView: any = null;
      let hasManualViewTransform = false;
      let previewReady = false;
      let previewCanvas: any = null;

      const cleanup = () => {
        if (resizeObserver) resizeObserver.disconnect();
        if (previewCanvas) {
          previewCanvas.removeEventListener('pointermove', onPointerMove);
          previewCanvas.removeEventListener('pointerdown', onPointerDown);
          previewCanvas.removeEventListener('pointerleave', onPointerLeave);
          previewCanvas.removeEventListener('wheel', onWheel);
          previewCanvas.removeEventListener('auxclick', onAuxClick);
        }
        if (typeof window !== 'undefined') {
          window.removeEventListener('pointerup', onPointerUp);
        }
        const adapter = getSpine43Adapter();
        if (adapter && handle && adapter.destroyInstance) {
          adapter.destroyInstance(handle);
        }
        if (app) {
          try {
            app.destroy(true, {
              children: true,
              texture: false,
              baseTexture: false,
            });
          } catch (error) {
            app.destroy(true);
          }
        }
      };

      const resetPreviewPhysicsInheritance = () => {
        if (!handle) return;
        const adapter = getSpine43Adapter();
        if (adapter && adapter.setPhysicsTransformInheritance) {
          adapter.setPhysicsTransformInheritance(handle, 0, 0, 0);
        } else if (
          handle.container &&
          typeof handle.container.resetPhysicsTransform === 'function'
        ) {
          handle.container.resetPhysicsTransform();
        }
      };

      const resize = () => {
        if (!app || !viewportRef.current) return false;
        const rect = viewportRef.current.getBoundingClientRect();
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));
        if (app.renderer && app.renderer.resize) {
          app.renderer.resize(width, height);
        }
        if (
          !hasManualViewTransform &&
          contentLayer &&
          handle &&
          handle.container
        ) {
          const fitted = fitRuntimePreview(app, contentLayer, handle.container);
          resetPreviewPhysicsInheritance();
          return fitted;
        }
        return false;
      };

      const preparePreviewFrame = () => {
        if (!handle) return false;
        const adapter = getSpine43Adapter();
        if (adapter && adapter.updateInstance) {
          adapter.updateInstance(handle, 0);
        }
        const fitted = resize();
        drawOverlay();
        if (fitted && !previewReady) {
          previewReady = true;
          setStatus(null);
        }
        return fitted;
      };

      const scheduleInitialFit = () => {
        let frame = 0;
        const run = () => {
          if (cancelled || !app || !viewportRef.current) return;
          const fitted = preparePreviewFrame();
          frame++;
          if (
            (!fitted || frame < 12) &&
            frame < 24 &&
            typeof window !== 'undefined'
          ) {
            window.requestAnimationFrame(run);
          }
        };
        if (typeof window !== 'undefined') {
          window.requestAnimationFrame(run);
        } else {
          preparePreviewFrame();
        }
      };

      const waitForUsablePreviewRect = (): Promise<any> =>
        new Promise<any>(resolve => {
          let attempts = 0;
          const read = (): void => {
            const rect = viewportRef.current
              ? viewportRef.current.getBoundingClientRect()
              : null;
            if (
              cancelled ||
              !rect ||
              (rect.width >= 80 && rect.height >= 80) ||
              attempts > 30
            ) {
              resolve(rect || { width: 1, height: 1 });
              return;
            }
            attempts++;
            if (typeof window !== 'undefined') {
              window.requestAnimationFrame(read);
            } else {
              setTimeout(read, 16);
            }
          };
          read();
        });

      const drawOverlay = () => {
        if (!overlayGraphics || !handle || !handle.container) return;
        overlayGraphics.clear();
        const latest = latestRef.current;
        const adapter = getSpine43Adapter();
        if (adapter && adapter.ensureWorldTransforms) {
          adapter.ensureWorldTransforms(handle);
        }
        const skeleton =
          handle.container && handle.container.skeleton
            ? handle.container.skeleton
            : null;
        if (!skeleton) return;

        if (latest.previewOptions.showMesh) {
          const meshPreview = latest.content.meshPreview || {};
          drawRuntimeMeshes(
            overlayGraphics,
            skeleton,
            latest.selectedSlotName,
            meshPreview.showAllSlots !== false,
            getMeshPreviewColor(latest.content)
          );
        }
        if (latest.previewOptions.showConstraints) {
          drawRuntimeConstraints(overlayGraphics, skeleton);
        }
        if (latest.previewOptions.showBones) {
          drawRuntimeBones(
            overlayGraphics,
            skeleton,
            latest.selectedBoneName,
            hoveredBoneName
          );
        }
      };

      const getPointerStagePoint = (event: any): any => {
        if (!app || !previewCanvas) return null;
        const PIXI = getPixi();
        if (!PIXI || !PIXI.Point) return null;
        const rect = previewCanvas.getBoundingClientRect();
        const screenWidth =
          app.screen && Number.isFinite(app.screen.width)
            ? app.screen.width
            : rect.width;
        const screenHeight =
          app.screen && Number.isFinite(app.screen.height)
            ? app.screen.height
            : rect.height;
        const stageX = ((event.clientX - rect.left) / rect.width) * screenWidth;
        const stageY =
          ((event.clientY - rect.top) / rect.height) * screenHeight;
        return new PIXI.Point(stageX, stageY);
      };

      const getPointerLocalPoint = (event: any): any => {
        if (!contentLayer) return null;
        const stagePoint = getPointerStagePoint(event);
        if (!stagePoint) return null;
        return contentLayer.toLocal(stagePoint);
      };

      const getSkeleton = () =>
        handle && handle.container && handle.container.skeleton
          ? handle.container.skeleton
          : null;

      const getBonePickThreshold = () => {
        const scale =
          contentLayer && contentLayer.scale && contentLayer.scale.x
            ? Math.abs(contentLayer.scale.x)
            : 1;
        return 14 / Math.max(0.05, scale);
      };

      const updateHoveredBone = (boneName: string): void => {
        if (hoveredBoneName === boneName) return;
        hoveredBoneName = boneName;
        if (previewCanvas) {
          previewCanvas.style.cursor = draggingBone
            ? 'grabbing'
            : panningView
            ? 'move'
            : hoveredBoneName
            ? 'grab'
            : 'default';
        }
        drawOverlay();
      };

      const onPointerMove = (event: any): void => {
        const skeleton = getSkeleton();
        const point = getPointerLocalPoint(event);
        if (!skeleton || !point) return;

        if (panningView && contentLayer) {
          event.preventDefault();
          const stagePoint = getPointerStagePoint(event);
          if (!stagePoint) return;
          contentLayer.position.set(
            panningView.startPosition.x +
              stagePoint.x -
              panningView.startPointer.x,
            panningView.startPosition.y +
              stagePoint.y -
              panningView.startPointer.y
          );
          resetPreviewPhysicsInheritance();
          return;
        }

        if (draggingBone) {
          event.preventDefault();
          const deltaX = point.x - draggingBone.startPointer.x;
          const deltaY = point.y - draggingBone.startPointer.y;
          const localDelta = worldDeltaToBoneLocal(
            draggingBone.parentBone,
            deltaX,
            deltaY
          );
          latestRef.current.onBoneOverrideChange(
            draggingBone.name,
            {
              x: draggingBone.startX + localDelta.x,
              y: draggingBone.startY + localDelta.y,
            },
            { recordUndo: false }
          );
          return;
        }

        const bone = findRuntimeBoneAtPoint(
          skeleton,
          point.x,
          point.y,
          getBonePickThreshold()
        );
        updateHoveredBone(bone ? getBoneName(bone) : '');
      };

      const onPointerDown = (event: any): void => {
        if (event.button === 1) {
          const stagePoint = getPointerStagePoint(event);
          if (!stagePoint || !contentLayer) return;
          event.preventDefault();
          hasManualViewTransform = true;
          panningView = {
            startPointer: { x: stagePoint.x, y: stagePoint.y },
            startPosition: {
              x: contentLayer.position.x,
              y: contentLayer.position.y,
            },
          };
          if (previewCanvas) previewCanvas.style.cursor = 'move';
          return;
        }
        if (event.button !== 0) return;
        const skeleton = getSkeleton();
        const point = getPointerLocalPoint(event);
        if (!skeleton || !point || !hoveredBoneName) return;
        const bone = findRuntimeBone(skeleton, hoveredBoneName);
        const pose = getBonePose(bone);
        if (!bone || !pose) return;
        event.preventDefault();
        latestRef.current.onSelectedBoneNameChange(hoveredBoneName);
        latestRef.current.onBoneDragStart();
        const boneOverride =
          latestRef.current.content.inspectorOverrides &&
          latestRef.current.content.inspectorOverrides.bones &&
          latestRef.current.content.inspectorOverrides.bones[hoveredBoneName]
            ? latestRef.current.content.inspectorOverrides.bones[
                hoveredBoneName
              ]
            : {};
        draggingBone = {
          name: hoveredBoneName,
          startPointer: { x: point.x, y: point.y },
          startX: toNumber(boneOverride.x, toNumber(pose.x, 0)),
          startY: toNumber(boneOverride.y, toNumber(pose.y, 0)),
          parentBone: getRuntimeBoneParent(skeleton, bone),
        };
        if (previewCanvas) previewCanvas.style.cursor = 'grabbing';
      };

      const onPointerUp = () => {
        if (draggingBone) {
          latestRef.current.onBoneDragEnd();
        }
        draggingBone = null;
        panningView = null;
        if (previewCanvas) {
          previewCanvas.style.cursor = hoveredBoneName ? 'grab' : 'default';
        }
      };

      const onPointerLeave = () => {
        if (draggingBone || panningView) return;
        updateHoveredBone('');
      };

      const onWheel = (event: any): void => {
        if (!contentLayer) return;
        const stagePoint = getPointerStagePoint(event);
        if (!stagePoint) return;
        event.preventDefault();
        hasManualViewTransform = true;
        const localPoint = contentLayer.toLocal(stagePoint);
        const currentScale =
          contentLayer.scale && Number.isFinite(contentLayer.scale.x)
            ? contentLayer.scale.x
            : 1;
        const zoomFactor = Math.exp(-event.deltaY * 0.0012);
        const nextScale = Math.max(
          0.05,
          Math.min(12, currentScale * zoomFactor)
        );
        contentLayer.scale.set(nextScale);
        contentLayer.position.set(
          stagePoint.x - localPoint.x * nextScale,
          stagePoint.y - localPoint.y * nextScale
        );
        resetPreviewPhysicsInheritance();
      };

      const onAuxClick = (event: any): void => {
        if (event.button === 1) event.preventDefault();
      };

      const start = async () => {
        if (!viewportRef.current) return;
        setStatus('正在加载 Spine 预览...');
        if (!skeletonFile || !atlasFile) {
          setStatus('请选择 Spine skeleton 和 atlas 资源。');
          return;
        }

        await ensureDialogRuntime();
        const viewport = viewportRef.current;
        if (cancelled || !viewport) return;

        const PIXI = getPixi();
        const adapter = getSpine43Adapter();
        if (!PIXI || !adapter)
          throw new Error('Spine preview runtime is missing.');

        const rect = await waitForUsablePreviewRect();
        if (cancelled || !viewportRef.current) return;
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));
        app = new PIXI.Application({
          width,
          height,
          backgroundAlpha: 0,
          antialias: true,
          resolution:
            typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
          autoDensity: true,
        });
        const canvas = app.view || app.canvas;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.touchAction = 'none';
        previewCanvas = canvas;
        viewport.appendChild(canvas);

        contentLayer = new PIXI.Container();
        overlayGraphics = new PIXI.Graphics();
        app.stage.addChild(contentLayer);

        const latestContent = latestRef.current.content;
        handle = await adapter.createInstance({
          runtimeScriptPath:
            latestContent.runtimeScriptPath || DEFAULT_RUNTIME_SCRIPT_PATH,
          skeletonFile,
          atlasFile,
          binaryData: !!latestContent.binaryData,
          importScale: Number(latestContent.importScale) || 1,
          skinName: latestContent.skinName || '',
          animationName: latestContent.animationName || '',
          loop: latestContent.loop !== false,
          mixDuration: Number(latestContent.mixDuration) || 0,
          inspectorOverrides: latestContent.inspectorOverrides || {},
        });
        if (cancelled) {
          adapter.destroyInstance(handle);
          handle = null;
          return;
        }

        contentLayer.addChild(handle.container);
        contentLayer.addChild(overlayGraphics);
        const fitted = fitRuntimePreview(app, contentLayer, handle.container);
        resetPreviewPhysicsInheritance();
        if (fitted) {
          previewReady = true;
          setStatus(null);
        }
        scheduleInitialFit();
        drawOverlay();

        const ResizeObserverClass =
          typeof window !== 'undefined'
            ? (window: any).ResizeObserver || null
            : null;
        if (ResizeObserverClass) {
          resizeObserver = new ResizeObserverClass(resize);
          resizeObserver.observe(viewportRef.current);
        }
        previewCanvas.addEventListener('pointermove', onPointerMove);
        previewCanvas.addEventListener('pointerdown', onPointerDown);
        previewCanvas.addEventListener('pointerleave', onPointerLeave);
        previewCanvas.addEventListener('wheel', onWheel, { passive: false });
        previewCanvas.addEventListener('auxclick', onAuxClick);
        if (typeof window !== 'undefined') {
          window.addEventListener('pointerup', onPointerUp);
        }

        app.ticker.add((deltaFrames: number) => {
          if (!handle) return;
          const latest = latestRef.current;
          const adapter = getSpine43Adapter();
          if (!adapter) return;
          const animationPreview = latest.content.editorAnimationPreview || {};
          const animationName = latest.content.animationName || '';
          const loop = latest.content.loop !== false;
          const animationKey = animationName + ':' + loop;
          if (animationName && animationKey !== lastAnimationKey) {
            adapter.setAnimation(handle, animationName, loop);
            lastAnimationKey = animationKey;
          }

          const skinName = latest.content.skinName || '';
          if (skinName !== lastSkinName && adapter.setSkin) {
            adapter.setSkin(handle, skinName);
            lastSkinName = skinName;
          }

          const mixDuration = Number(latest.content.mixDuration) || 0;
          if (mixDuration !== lastMixDuration && adapter.setMix) {
            adapter.setMix(handle, mixDuration);
            lastMixDuration = mixDuration;
          }

          if (adapter.setInspectorOverrides) {
            adapter.setInspectorOverrides(
              handle,
              latest.content.inspectorOverrides || {}
            );
          }
          const resetRequest = latest.runtimeResetRequest;
          if (resetRequest && resetRequest.id !== lastRuntimeResetRequestId) {
            lastRuntimeResetRequestId = resetRequest.id;
            if (resetRequest.type === 'all' && adapter.resetAllBones) {
              adapter.resetAllBones(handle);
            } else if (
              resetRequest.type === 'bone' &&
              resetRequest.boneName &&
              adapter.resetBone
            ) {
              adapter.resetBone(handle, resetRequest.boneName);
            }
            if (adapter.setInspectorOverrides) {
              adapter.setInspectorOverrides(
                handle,
                latest.content.inspectorOverrides || {}
              );
            }
            if (
              handle.container &&
              typeof handle.container.resetPhysicsTransform === 'function'
            ) {
              handle.container.resetPhysicsTransform();
            }
          }
          if (adapter.setVisible) {
            adapter.setVisible(handle, latest.previewOptions.showImage);
          } else if (handle.container) {
            handle.container.visible = latest.previewOptions.showImage;
          }

          const deltaSeconds =
            animationPreview.playing === false
              ? 0
              : (deltaFrames / 60) * (Number(latest.content.timeScale) || 1);
          adapter.updateInstance(handle, deltaSeconds);
          if (!previewReady && !hasManualViewTransform) {
            const fitted = resize();
            if (fitted) {
              previewReady = true;
              setStatus(null);
            }
          }
          if (animationPreview.lockProgress && adapter.setAnimationProgress) {
            adapter.setAnimationProgress(
              handle,
              0,
              Number(animationPreview.progress) || 0
            );
          }
          drawOverlay();
        });
      };

      start().catch(error => {
        if (!cancelled) {
          setStatus(
            `无法加载 Spine 预览：${
              error && error.message ? error.message : String(error || '')
            }`
          );
          console.error('Unable to load Spine 4.3 inspector preview:', error);
        }
      });

      return () => {
        cancelled = true;
        cleanup();
      };
    },
    [atlasFile, content.binaryData, content.importScale, skeletonFile]
  );

  return (
    <div style={styles.preview} ref={viewportRef}>
      {status ? (
        <div style={styles.previewStatus}>
          <AlertMessage kind="info">{status}</AlertMessage>
        </div>
      ) : null}
    </div>
  );
};

const NumberField = ({
  label,
  value,
  onChange,
}: {|
  label: string,
  value: number,
  onChange: number => void,
|}) => (
  <SemiControlledTextField
    commitOnBlur
    fullWidth
    floatingLabelText={label}
    value={String(value)}
    onChange={newValue => onChange(toNumber(newValue, 0))}
  />
);

const getBoneValue = (
  bone: any,
  override: any,
  field: string,
  fallback: number
): number =>
  override && override[field] !== undefined
    ? override[field]
    : bone[field] !== undefined
    ? bone[field]
    : fallback;

const BonesPanel = ({
  skeletonJson,
  draft,
  onDraftChange,
  selectedBoneName,
  setSelectedBoneName,
  onBoneChange,
  onResetSelectedBone,
  onResetAllBones,
}: {|
  skeletonJson: any,
  draft: Spine43Content,
  onDraftChange: Spine43Content => void,
  selectedBoneName: string,
  setSelectedBoneName: string => void,
  onBoneChange: (string, AnyObject) => void,
  onResetSelectedBone: string => void,
  onResetAllBones: () => void,
|}) => {
  const bones = getBones(skeletonJson);
  const constraints = getConstraints(skeletonJson);
  const overrides = draft.inspectorOverrides || emptyInspectorOverrides();
  const [selectedConstraintName, setSelectedConstraintName] = React.useState(
    constraints[0] ? constraints[0].name : ''
  );
  const selectedBone = bones.find(bone => bone.name === selectedBoneName);
  const selectedConstraint = constraints.find(
    constraint => constraint.name === selectedConstraintName
  );

  const updateBone = (field: string, value: number): void => {
    if (!selectedBone) return;
    onBoneChange(selectedBone.name, { [field]: value });
  };

  const resetSelectedBone = () => {
    if (!selectedBone) return;
    onResetSelectedBone(selectedBone.name);
  };

  const resetAllBones = () => {
    onResetAllBones();
  };

  const updateConstraint = (field: string, value: number): void => {
    if (!selectedConstraint) return;
    const next = clone(draft);
    next.inspectorOverrides =
      next.inspectorOverrides || emptyInspectorOverrides();
    next.inspectorOverrides.constraints =
      next.inspectorOverrides.constraints || {};
    next.inspectorOverrides.constraints[selectedConstraint.name] = {
      ...(next.inspectorOverrides.constraints[selectedConstraint.name] || {}),
      [field]: value,
    };
    onDraftChange(next);
  };

  const boneOverride =
    selectedBone && overrides.bones && overrides.bones[selectedBone.name]
      ? overrides.bones[selectedBone.name]
      : {};
  const constraintOverride =
    selectedConstraint &&
    overrides.constraints &&
    overrides.constraints[selectedConstraint.name]
      ? overrides.constraints[selectedConstraint.name]
      : {};

  return (
    <div style={styles.side}>
      <div style={styles.panel}>
        <Text size="block-title">骨骼</Text>
        <SelectField
          fullWidth
          value={selectedBoneName}
          onChange={event => setSelectedBoneName(event.target.value)}
          floatingLabelText="骨骼"
        >
          {bones.map(bone => (
            <SelectOption key={bone.name} value={bone.name} label={bone.name} />
          ))}
        </SelectField>
        {selectedBone ? (
          <ColumnStackLayout noMargin>
            <ResponsiveLineStackLayout noMargin>
              <NumberField
                label="X"
                value={getBoneValue(selectedBone, boneOverride, 'x', 0)}
                onChange={value => updateBone('x', value)}
              />
              <NumberField
                label="Y"
                value={getBoneValue(selectedBone, boneOverride, 'y', 0)}
                onChange={value => updateBone('y', value)}
              />
            </ResponsiveLineStackLayout>
            <ResponsiveLineStackLayout noMargin>
              <NumberField
                label="旋转"
                value={getBoneValue(selectedBone, boneOverride, 'rotation', 0)}
                onChange={value => updateBone('rotation', value)}
              />
              <NumberField
                label="长度"
                value={getBoneValue(selectedBone, boneOverride, 'length', 0)}
                onChange={value => updateBone('length', value)}
              />
            </ResponsiveLineStackLayout>
            <ResponsiveLineStackLayout noMargin>
              <NumberField
                label="缩放 X"
                value={getBoneValue(selectedBone, boneOverride, 'scaleX', 1)}
                onChange={value => updateBone('scaleX', value)}
              />
              <NumberField
                label="缩放 Y"
                value={getBoneValue(selectedBone, boneOverride, 'scaleY', 1)}
                onChange={value => updateBone('scaleY', value)}
              />
            </ResponsiveLineStackLayout>
            <div style={styles.panelActions}>
              <FlatButton label="还原当前骨骼" onClick={resetSelectedBone} />
              <FlatButton label="还原全部骨骼" onClick={resetAllBones} />
            </div>
          </ColumnStackLayout>
        ) : null}
      </div>

      <div style={styles.panel}>
        <Text size="block-title">约束</Text>
        <SelectField
          fullWidth
          value={selectedConstraintName}
          onChange={event => setSelectedConstraintName(event.target.value)}
          floatingLabelText="约束"
        >
          {constraints.map(constraint => (
            <SelectOption
              key={constraint.name}
              value={constraint.name}
              label={`${constraint.name} (${constraint.type || 'constraint'})`}
            />
          ))}
        </SelectField>
        {selectedConstraint ? (
          <ColumnStackLayout noMargin>
            <Text>
              类型：{selectedConstraint.type || 'constraint'}，目标骨骼：
              {selectedConstraint.bone || selectedConstraint.target || '-'}
            </Text>
            <ResponsiveLineStackLayout noMargin>
              <NumberField
                label="Mix"
                value={getBoneValue(
                  selectedConstraint,
                  constraintOverride,
                  'mix',
                  1
                )}
                onChange={value => updateConstraint('mix', value)}
              />
              <NumberField
                label="惯性"
                value={getBoneValue(
                  selectedConstraint,
                  constraintOverride,
                  'inertia',
                  0
                )}
                onChange={value => updateConstraint('inertia', value)}
              />
            </ResponsiveLineStackLayout>
            <ResponsiveLineStackLayout noMargin>
              <NumberField
                label="强度"
                value={getBoneValue(
                  selectedConstraint,
                  constraintOverride,
                  'strength',
                  0
                )}
                onChange={value => updateConstraint('strength', value)}
              />
              <NumberField
                label="阻尼"
                value={getBoneValue(
                  selectedConstraint,
                  constraintOverride,
                  'damping',
                  0
                )}
                onChange={value => updateConstraint('damping', value)}
              />
            </ResponsiveLineStackLayout>
            <ResponsiveLineStackLayout noMargin>
              <NumberField
                label="质量"
                value={getBoneValue(
                  selectedConstraint,
                  constraintOverride,
                  'mass',
                  1
                )}
                onChange={value => updateConstraint('mass', value)}
              />
              <NumberField
                label="重力"
                value={getBoneValue(
                  selectedConstraint,
                  constraintOverride,
                  'gravity',
                  0
                )}
                onChange={value => updateConstraint('gravity', value)}
              />
            </ResponsiveLineStackLayout>
          </ColumnStackLayout>
        ) : (
          <Text>这个 skeleton 没有约束。</Text>
        )}
      </div>
    </div>
  );
};

const MeshPanel = ({
  skeletonJson,
  draft,
  onDraftChange,
  selectedSlotName,
  setSelectedSlotName,
}: {|
  skeletonJson: any,
  draft: Spine43Content,
  onDraftChange: Spine43Content => void,
  selectedSlotName: string,
  setSelectedSlotName: string => void,
|}) => {
  const slots = getSlots(skeletonJson);
  const showAllSlots =
    !draft.meshPreview || draft.meshPreview.showAllSlots !== false;
  const attachments = showAllSlots
    ? getAllAttachments(skeletonJson)
    : getSlotAttachments(skeletonJson, selectedSlotName);

  const updateMeshPreview = (changes: AnyObject): void => {
    const next = clone(draft);
    next.meshPreview = {
      ...(next.meshPreview || {}),
      ...changes,
    };
    onDraftChange(next);
  };

  return (
    <div style={styles.side}>
      <div style={styles.panel}>
        <Text size="block-title">网格查看</Text>
        <Checkbox
          checked={showAllSlots}
          label="查看全部插槽的网格"
          onCheck={(event, checked) =>
            updateMeshPreview({ showAllSlots: checked })
          }
        />
        {!showAllSlots ? (
          <SelectField
            fullWidth
            value={selectedSlotName}
            onChange={event => {
              setSelectedSlotName(event.target.value);
              updateMeshPreview({ slotName: event.target.value });
            }}
            floatingLabelText="插槽"
          >
            {slots.map(slot => (
              <SelectOption
                key={slot.name}
                value={slot.name}
                label={slot.name}
              />
            ))}
          </SelectField>
        ) : null}
      </div>
      <div style={styles.panel}>
        <Text size="block-title">附件/网格</Text>
        <div style={styles.list}>
          {attachments.map(info => {
            const attachment = info.attachment || {};
            const vertexCount = Array.isArray(attachment.vertices)
              ? Math.floor(attachment.vertices.length / 2)
              : 4;
            const triangleCount = Array.isArray(attachment.triangles)
              ? Math.floor(attachment.triangles.length / 3)
              : 2;
            return (
              <div
                key={`${info.skinName}:${info.slotName}:${info.name}`}
                style={styles.listItem}
              >
                <Text noMargin>
                  {info.slotName} / {info.name}
                </Text>
                <Text size="body-small">
                  类型：{attachment.type || 'region'}，顶点：{vertexCount}
                  ，三角形：
                  {triangleCount}
                </Text>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SlotsPanel = ({
  skeletonJson,
  draft,
  onDraftChange,
}: {|
  skeletonJson: any,
  draft: Spine43Content,
  onDraftChange: Spine43Content => void,
|}) => {
  const slots = getSlots(skeletonJson);
  const overrides = draft.inspectorOverrides || emptyInspectorOverrides();
  const [selectedSlotName, setSelectedSlotName] = React.useState(
    slots[0] ? slots[0].name : ''
  );
  const selectedSlot = slots.find(slot => slot.name === selectedSlotName);
  const defaultColor = parseColorString(selectedSlot && selectedSlot.color);
  const colorOverride =
    selectedSlot && overrides.slots && overrides.slots[selectedSlot.name]
      ? overrides.slots[selectedSlot.name]
      : {};
  const color: PreviewColor = {
    r: getBoneValue(defaultColor, colorOverride, 'r', 255),
    g: getBoneValue(defaultColor, colorOverride, 'g', 255),
    b: getBoneValue(defaultColor, colorOverride, 'b', 255),
    a: getBoneValue(defaultColor, colorOverride, 'a', 1),
  };

  const updateColor = (field: string, value: number): void => {
    if (!selectedSlot) return;
    const next = clone(draft);
    next.inspectorOverrides =
      next.inspectorOverrides || emptyInspectorOverrides();
    next.inspectorOverrides.slots = next.inspectorOverrides.slots || {};
    next.inspectorOverrides.slots[selectedSlot.name] = {
      ...(next.inspectorOverrides.slots[selectedSlot.name] || {}),
      [field]: value,
    };
    onDraftChange(next);
  };

  const updateColorFromPicker = (colorResult: ColorResult) => {
    if (!selectedSlot) return;
    const nextColor = colorResult.rgb || {};
    const next = clone(draft);
    next.inspectorOverrides =
      next.inspectorOverrides || emptyInspectorOverrides();
    next.inspectorOverrides.slots = next.inspectorOverrides.slots || {};
    next.inspectorOverrides.slots[selectedSlot.name] = {
      ...(next.inspectorOverrides.slots[selectedSlot.name] || {}),
      r: toNumber(nextColor.r, color.r),
      g: toNumber(nextColor.g, color.g),
      b: toNumber(nextColor.b, color.b),
      a:
        nextColor.a !== undefined
          ? Math.max(0, Math.min(1, toNumber(nextColor.a, color.a)))
          : color.a,
    };
    onDraftChange(next);
  };

  return (
    <div style={styles.side}>
      <div style={styles.panel}>
        <Text size="block-title">插槽颜色</Text>
        <SelectField
          fullWidth
          value={selectedSlotName}
          onChange={event => setSelectedSlotName(event.target.value)}
          floatingLabelText="插槽"
        >
          {slots.map(slot => (
            <SelectOption key={slot.name} value={slot.name} label={slot.name} />
          ))}
        </SelectField>
        <div style={styles.colorPickerLine}>
          <ColorPicker
            color={((color: any): RGBColor)}
            onChangeComplete={updateColorFromPicker}
            style={styles.colorPickerSwatch}
          />
          <Text noMargin>{colorToCss(color)}</Text>
        </div>
        <div style={styles.smallRow}>
          <NumberField
            label="R 0-255"
            value={color.r}
            onChange={value => updateColor('r', value)}
          />
          <NumberField
            label="G 0-255"
            value={color.g}
            onChange={value => updateColor('g', value)}
          />
          <NumberField
            label="B 0-255"
            value={color.b}
            onChange={value => updateColor('b', value)}
          />
          <NumberField
            label="A 0-1"
            value={color.a}
            onChange={value => updateColor('a', value)}
          />
        </div>
      </div>
      <div style={styles.panel}>
        <Text size="block-title">插槽附件</Text>
        {selectedSlot
          ? getSlotAttachments(skeletonJson, selectedSlot.name).map(info => (
              <Text key={`${info.skinName}:${info.name}`}>
                {info.skinName} / {info.name}
              </Text>
            ))
          : null}
      </div>
    </div>
  );
};

const describeTimeline = (timeline: any): string => {
  if (!timeline || typeof timeline !== 'object') return '空轨道';
  if (Array.isArray(timeline)) {
    const frameKeys: { [string]: boolean, ... } = {};
    let firstTime = Infinity;
    let lastTime = -Infinity;
    let hasTime = false;
    timeline.forEach(frame => {
      if (!frame || typeof frame !== 'object') return;
      Object.keys(frame).forEach(key => {
        if (key !== 'time' && key !== 'curve') frameKeys[key] = true;
      });
      const time = Number(frame.time);
      if (Number.isFinite(time)) {
        hasTime = true;
        if (time < firstTime) firstTime = time;
        if (time > lastTime) lastTime = time;
      }
    });
    const fields = Object.keys(frameKeys);
    const details: Array<string> = [];
    if (fields.length) details.push(`属性：${fields.join(', ')}`);
    if (hasTime) {
      details.push(`时间：${String(firstTime)} - ${String(lastTime)}s`);
    }
    return `${timeline.length} 个关键帧${
      details.length ? `；${details.join('；')}` : ''
    }`;
  }
  const keys = Object.keys(timeline);
  return keys.length ? keys.join(', ') : '空轨道';
};

const timelineTypeLabels: { [string]: string, ... } = {
  bones: '骨骼',
  slots: '插槽',
  ik: 'IK 约束',
  transform: '变换约束',
  path: '路径约束',
  physics: '物理约束',
  sliders: '滑杆',
  deform: '网格变形',
  drawOrder: '绘制顺序',
  drawOrderFolder: '绘制顺序文件夹',
  events: '事件',
  attachment: '附件',
  sequence: '序列',
  rgba: 'RGBA 颜色',
  rgb: 'RGB 颜色',
  rgba2: 'RGBA 双颜色',
  rgb2: 'RGB 双颜色',
  alpha: '透明度',
  rotate: '旋转',
  translate: '位移',
  translatex: '位移 X',
  translatey: '位移 Y',
  scale: '缩放',
  scalex: '缩放 X',
  scaley: '缩放 Y',
  shear: '倾斜',
  shearx: '倾斜 X',
  sheary: '倾斜 Y',
  inherit: '继承',
  color: '颜色',
  position: '位置',
  spacing: '间距',
  mix: '混合',
  reset: '重置',
  inertia: '惯性',
  strength: '强度',
  damping: '阻尼',
  mass: '质量',
  wind: '风力',
  gravity: '重力',
};

const formatTimelineSegment = (segment: any): string => {
  const key = String(segment || '');
  return (
    timelineTypeLabels[key] || timelineTypeLabels[key.toLowerCase()] || key
  );
};

const formatTimelinePath = (path: Array<string>): string =>
  path.length ? path.map(formatTimelineSegment).join(' / ') : 'Timeline';

const collectTimelineEntries = (
  value: any,
  path: Array<string> = []
): Array<TimelineEntry> => {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) {
    return [
      {
        name: formatTimelinePath(path),
        path: path.join('/'),
        value,
      },
    ];
  }

  const keys = Object.keys(value);
  if (!keys.length) return [];

  const entries: Array<TimelineEntry> = [];
  keys.forEach(key => {
    entries.push(...collectTimelineEntries(value[key], path.concat(key)));
  });

  if (!entries.length && path.length) {
    entries.push({
      name: formatTimelinePath(path),
      path: path.join('/'),
      value,
    });
  }
  return entries;
};

const getAnimationData = (skeletonJson: any, animationName: string): any => {
  const animations = skeletonJson.animations || {};
  if (Array.isArray(animations)) {
    return (
      animations.find(
        animation => animation && animation.name === animationName
      ) || {}
    );
  }
  return animations[animationName] || {};
};

const AnimationPanel = ({
  skeletonJson,
  draft,
  onDraftChange,
}: {|
  skeletonJson: any,
  draft: Spine43Content,
  onDraftChange: Spine43Content => void,
|}) => {
  const animationNames = getAnimationNames(skeletonJson);
  const selectedAnimationName = draft.animationName || animationNames[0] || '';
  const selectedAnimation = getAnimationData(
    skeletonJson,
    selectedAnimationName
  );
  const preview = draft.editorAnimationPreview || {
    playing: true,
    progress: 0,
    lockProgress: false,
  };

  const updateDraft = (changes: AnyObject): void => {
    onDraftChange({
      ...draft,
      ...changes,
    });
  };

  const updatePreview = (changes: AnyObject): void => {
    updateDraft({
      editorAnimationPreview: {
        ...preview,
        ...changes,
      },
    });
  };

  const timelineGroups = collectTimelineEntries(selectedAnimation);

  return (
    <div style={styles.side}>
      <div style={styles.panel}>
        <Text size="block-title">动画播放</Text>
        <SelectField
          fullWidth
          value={selectedAnimationName}
          onChange={event => updateDraft({ animationName: event.target.value })}
          floatingLabelText="动画"
        >
          {animationNames.map(name => (
            <SelectOption key={name} value={name} label={name} />
          ))}
        </SelectField>
        <Checkbox
          checked={preview.playing !== false}
          label="播放"
          onCheck={(event, checked) => updatePreview({ playing: checked })}
        />
        <Checkbox
          checked={draft.loop !== false}
          label="循环"
          onCheck={(event, checked) => updateDraft({ loop: checked })}
        />
        <ResponsiveLineStackLayout noMargin>
          <NumberField
            label="动画速度"
            value={toNumber(draft.timeScale, 1)}
            onChange={value => updateDraft({ timeScale: value })}
          />
          <NumberField
            label="默认混合时长"
            value={toNumber(draft.mixDuration, 0)}
            onChange={value => updateDraft({ mixDuration: value })}
          />
        </ResponsiveLineStackLayout>
        <Checkbox
          checked={preview.lockProgress === true}
          label="锁定进度"
          onCheck={(event, checked) => updatePreview({ lockProgress: checked })}
        />
        <NumberField
          label="进度 0-1"
          value={toNumber(preview.progress, 0)}
          onChange={value =>
            updatePreview({ progress: Math.max(0, Math.min(1, value)) })
          }
        />
      </div>

      <div style={styles.panel}>
        <Text size="block-title">曲线和关键帧</Text>
        {timelineGroups.length ? (
          timelineGroups.map((group, index) => (
            <div
              key={`${group.path || group.name}:${index}`}
              style={styles.listItem}
            >
              <Text noMargin>{group.name}</Text>
              <Text size="body-small">{describeTimeline(group.value)}</Text>
            </div>
          ))
        ) : (
          <Text>这个动画没有显式关键帧。</Text>
        )}
      </div>
    </div>
  );
};

const modeTitle = {
  bones: '编辑骨骼和约束',
  mesh: '编辑网格',
  slots: '编辑插槽',
  animation: '查看动画',
};

const modeOptions = [
  { label: modeTitle.bones, value: 'bones' },
  { label: modeTitle.mesh, value: 'mesh' },
  { label: modeTitle.slots, value: 'slots' },
  { label: modeTitle.animation, value: 'animation' },
];

const createDefaultPreviewOptions = (mode: InspectorMode): PreviewOptions => ({
  showImage: true,
  showBones: mode === 'bones',
  showConstraints: mode === 'bones',
  showMesh: mode === 'mesh',
});

const getBoneOverridesSnapshot = (content: Spine43Content): AnyObject =>
  clone(
    content && content.inspectorOverrides && content.inspectorOverrides.bones
      ? content.inspectorOverrides.bones
      : {}
  );

const applyBoneOverrides = (
  content: Spine43Content,
  boneOverrides: AnyObject
): Spine43Content => {
  const next = clone(content);
  next.inspectorOverrides = {
    ...emptyInspectorOverrides(),
    ...(next.inspectorOverrides || {}),
    bones: clone(boneOverrides || {}),
  };
  return next;
};

const Spine43InspectorDialog = ({
  mode,
  project,
  objectConfiguration,
  skeletonJson,
  onApply,
  onCancel,
  onModeChange,
}: {|
  mode: InspectorMode,
  project: gdProject,
  objectConfiguration: gdObjectConfiguration,
  skeletonJson: Object,
  onApply: Object => void,
  onCancel: () => void,
  onModeChange: InspectorMode => void,
|}) => {
  const originalContent = getContent(objectConfiguration);
  const [draft, setDraft] = React.useState(() => ({
    ...clone(originalContent),
    inspectorOverrides: {
      ...emptyInspectorOverrides(),
      ...(clone(originalContent.inspectorOverrides) || {}),
    },
    editorAnimationPreview: {
      playing: true,
      progress: 0,
      lockProgress: false,
      ...(clone(originalContent.editorAnimationPreview) || {}),
    },
    meshPreview: {
      showAllSlots: true,
      slotName: '',
      ...(clone(originalContent.meshPreview) || {}),
    },
  }));
  const [selectedSlotName, setSelectedSlotName] = React.useState(
    (draft.meshPreview && draft.meshPreview.slotName) ||
      (getSlots(skeletonJson)[0] ? getSlots(skeletonJson)[0].name : '')
  );
  const [selectedBoneName, setSelectedBoneName] = React.useState(
    getBones(skeletonJson)[0] ? getBones(skeletonJson)[0].name : ''
  );
  const [previewOptions, setPreviewOptions] = React.useState(() =>
    createDefaultPreviewOptions(mode)
  );
  const [
    runtimeResetRequest,
    setRuntimeResetRequest,
  ] = React.useState<?RuntimeResetRequest>(null);
  const draftRef = React.useRef(draft);
  const boneUndoStackRef = React.useRef<Array<AnyObject>>([]);
  const pendingBoneChangesRef = React.useRef<AnyObject>({});
  const pendingAnimationFrameRef = React.useRef<?number>(null);
  const isDraggingBoneRef = React.useRef(false);
  draftRef.current = draft;

  const cancelPendingBoneFlush = React.useCallback(() => {
    if (pendingAnimationFrameRef.current !== null) {
      if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
        window.cancelAnimationFrame(pendingAnimationFrameRef.current);
      }
      pendingAnimationFrameRef.current = null;
    }
  }, []);

  const getBoneOverridesWithPending = React.useCallback(() => {
    const currentBones = getBoneOverridesSnapshot(draftRef.current);
    const pending = pendingBoneChangesRef.current || {};
    Object.keys(pending).forEach(boneName => {
      currentBones[boneName] = {
        ...(currentBones[boneName] || {}),
        ...pending[boneName],
      };
    });
    return currentBones;
  }, []);

  const consumeBoneOverridesWithPending = React.useCallback(
    () => {
      const currentBones = getBoneOverridesWithPending();
      pendingBoneChangesRef.current = {};
      cancelPendingBoneFlush();
      return currentBones;
    },
    [cancelPendingBoneFlush, getBoneOverridesWithPending]
  );

  const requestRuntimeReset = React.useCallback(
    (type: 'all' | 'bone', boneName?: string) => {
      setRuntimeResetRequest(currentRequest => ({
        id: currentRequest ? currentRequest.id + 1 : 1,
        type,
        boneName: boneName || '',
      }));
    },
    []
  );

  const pushBoneUndoSnapshot = React.useCallback(
    (snapshotOverride?: AnyObject) => {
      const snapshot = clone(
        snapshotOverride || getBoneOverridesSnapshot(draftRef.current)
      );
      const stack = boneUndoStackRef.current;
      const previous = stack[stack.length - 1];
      if (previous && JSON.stringify(previous) === JSON.stringify(snapshot)) {
        return;
      }
      stack.push(snapshot);
      if (stack.length > 80) stack.shift();
    },
    []
  );

  const setBoneOverrides = React.useCallback((boneOverrides: AnyObject) => {
    setDraft(currentDraft => {
      const next = applyBoneOverrides(currentDraft, boneOverrides);
      draftRef.current = next;
      return next;
    });
  }, []);

  const flushPendingBoneChanges = React.useCallback(
    () => {
      cancelPendingBoneFlush();
      const pending = pendingBoneChangesRef.current;
      pendingBoneChangesRef.current = {};
      const boneNames = Object.keys(pending);
      if (!boneNames.length) return;

      setDraft(currentDraft => {
        const next = clone(currentDraft);
        next.inspectorOverrides = {
          ...emptyInspectorOverrides(),
          ...(next.inspectorOverrides || {}),
        };
        next.inspectorOverrides.bones = {
          ...(next.inspectorOverrides.bones || {}),
        };
        boneNames.forEach(boneName => {
          next.inspectorOverrides.bones[boneName] = {
            ...(next.inspectorOverrides.bones[boneName] || {}),
            ...pending[boneName],
          };
        });
        draftRef.current = next;
        return next;
      });
    },
    [cancelPendingBoneFlush]
  );

  const schedulePendingBoneFlush = React.useCallback(
    () => {
      if (pendingAnimationFrameRef.current !== null) return;
      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        pendingAnimationFrameRef.current = window.requestAnimationFrame(() => {
          pendingAnimationFrameRef.current = null;
          flushPendingBoneChanges();
        });
      } else {
        flushPendingBoneChanges();
      }
    },
    [flushPendingBoneChanges]
  );

  React.useEffect(
    () => () => {
      if (
        pendingAnimationFrameRef.current !== null &&
        typeof window !== 'undefined' &&
        window.cancelAnimationFrame
      ) {
        window.cancelAnimationFrame(pendingAnimationFrameRef.current);
      }
    },
    []
  );

  const apply = () => {
    const boneOverrides = consumeBoneOverridesWithPending();
    const latestDraft = applyBoneOverrides(draftRef.current, boneOverrides);
    draftRef.current = latestDraft;
    onApply(latestDraft);
  };
  const changeMode = (nextMode: InspectorMode): void => {
    onModeChange(nextMode);
    setPreviewOptions(current => ({
      ...current,
      showBones: nextMode === 'bones',
      showConstraints: nextMode === 'bones',
      showMesh: nextMode === 'mesh',
    }));
  };
  const updateMeshPreviewColor = React.useCallback(
    (colorResult: ColorResult) => {
      const nextRgb = colorResult && colorResult.rgb ? colorResult.rgb : {};
      setDraft(currentDraft => {
        const currentColor = getMeshPreviewColor(currentDraft);
        const next = clone(currentDraft);
        next.meshPreview = {
          ...(next.meshPreview || {}),
          color: normalizePreviewColor({
            ...currentColor,
            r: nextRgb.r,
            g: nextRgb.g,
            b: nextRgb.b,
          }),
        };
        draftRef.current = next;
        return next;
      });
    },
    []
  );
  const updateBoneOverride = (
    boneName: string,
    changes: AnyObject,
    options?: BoneOverrideOptions
  ): void => {
    if (!boneName) return;
    const shouldRecordUndo = !options || options.recordUndo !== false;
    if (shouldRecordUndo) pushBoneUndoSnapshot();

    pendingBoneChangesRef.current = {
      ...pendingBoneChangesRef.current,
      [boneName]: {
        ...(pendingBoneChangesRef.current[boneName] || {}),
        ...changes,
      },
    };
    if (options && options.immediate) flushPendingBoneChanges();
    else schedulePendingBoneFlush();
  };

  const beginBoneDrag = () => {
    if (isDraggingBoneRef.current) return;
    isDraggingBoneRef.current = true;
    pushBoneUndoSnapshot();
  };

  const endBoneDrag = () => {
    if (!isDraggingBoneRef.current) return;
    isDraggingBoneRef.current = false;
    flushPendingBoneChanges();
  };

  const resetSelectedBone = (boneName: string): void => {
    if (!boneName) return;
    const currentBones = consumeBoneOverridesWithPending();
    const hadOverride = !!currentBones[boneName];
    if (hadOverride) {
      pushBoneUndoSnapshot(currentBones);
      delete currentBones[boneName];
      setBoneOverrides(currentBones);
    }
    requestRuntimeReset('bone', boneName);
  };

  const resetAllBones = () => {
    const currentBones = consumeBoneOverridesWithPending();
    if (Object.keys(currentBones).length) {
      pushBoneUndoSnapshot(currentBones);
      setBoneOverrides({});
    }
    requestRuntimeReset('all');
  };

  const undoBoneOperation = React.useCallback(
    () => {
      flushPendingBoneChanges();
      const previous = boneUndoStackRef.current.pop();
      if (!previous) return false;
      setBoneOverrides(previous);
      return true;
    },
    [flushPendingBoneChanges, setBoneOverrides]
  );

  React.useEffect(
    () => {
      const onKeyDown = (event: any): void => {
        if (
          !(event.ctrlKey || event.metaKey) ||
          String(event.key || '').toLowerCase() !== 'z'
        ) {
          return;
        }
        const target = event.target;
        const tagName =
          target && target.tagName ? String(target.tagName).toLowerCase() : '';
        if (
          tagName === 'input' ||
          tagName === 'textarea' ||
          (target && target.isContentEditable)
        ) {
          return;
        }
        if (undoBoneOperation()) {
          event.preventDefault();
          event.stopPropagation();
        }
      };
      if (typeof window !== 'undefined') {
        window.addEventListener('keydown', onKeyDown);
      }
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('keydown', onKeyDown);
        }
      };
    },
    [undoBoneOperation]
  );

  let sidePanel = null;
  if (mode === 'bones') {
    sidePanel = (
      <BonesPanel
        skeletonJson={skeletonJson}
        draft={draft}
        onDraftChange={setDraft}
        selectedBoneName={selectedBoneName}
        setSelectedBoneName={setSelectedBoneName}
        onBoneChange={(boneName, changes) =>
          updateBoneOverride(boneName, changes, { immediate: true })
        }
        onResetSelectedBone={resetSelectedBone}
        onResetAllBones={resetAllBones}
      />
    );
  } else if (mode === 'mesh') {
    sidePanel = (
      <MeshPanel
        skeletonJson={skeletonJson}
        draft={draft}
        onDraftChange={setDraft}
        selectedSlotName={selectedSlotName}
        setSelectedSlotName={setSelectedSlotName}
      />
    );
  } else if (mode === 'slots') {
    sidePanel = (
      <SlotsPanel
        skeletonJson={skeletonJson}
        draft={draft}
        onDraftChange={setDraft}
      />
    );
  } else {
    sidePanel = (
      <AnimationPanel
        skeletonJson={skeletonJson}
        draft={draft}
        onDraftChange={setDraft}
      />
    );
  }

  return (
    <Dialog
      title="Spine 4.3 编辑器"
      id={`spine43-${mode}-editor`}
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={onCancel}
        />,
        <DialogPrimaryButton
          key="apply"
          label={<Trans>Apply</Trans>}
          primary
          onClick={apply}
        />,
      ]}
      onRequestClose={onCancel}
      onApply={apply}
      open
      maxWidth="lg"
      fullHeight
      transitionDuration={0}
      flexBody
      exceptionallyStillAllowRenderingInstancesEditors
    >
      <div style={styles.dialogContent}>
        <div style={styles.tabsContainer}>
          <Tabs
            value={mode}
            // $FlowFixMe[incompatible-type]
            onChange={changeMode}
            // $FlowFixMe[incompatible-type]
            options={modeOptions}
          />
        </div>
        <div style={styles.dialogBody}>
          <div style={styles.previewColumn}>
            <PreviewToolbar
              options={previewOptions}
              onChange={setPreviewOptions}
              meshColor={getMeshPreviewColor(draft)}
              onMeshColorChange={updateMeshPreviewColor}
            />
            <Preview
              project={project}
              content={draft}
              selectedSlotName={selectedSlotName}
              previewOptions={previewOptions}
              selectedBoneName={selectedBoneName}
              onSelectedBoneNameChange={setSelectedBoneName}
              onBoneOverrideChange={updateBoneOverride}
              onBoneDragStart={beginBoneDrag}
              onBoneDragEnd={endBoneDrag}
              runtimeResetRequest={runtimeResetRequest}
            />
          </div>
          {sidePanel}
        </div>
      </div>
    </Dialog>
  );
};

const Spine43Editor = (props: EditorProps): React.Node => {
  const { objectConfiguration, project, onObjectUpdated } = props;
  const forceUpdate = useForceUpdate();
  const [mode, setMode] = React.useState<?InspectorMode>(null);
  const [skeletonJson, setSkeletonJson] = React.useState<?Object>(null);
  const [loadingError, setLoadingError] = React.useState<?string>(null);
  const content = getContent(objectConfiguration);

  React.useEffect(
    () => {
      let cancelled = false;
      setSkeletonJson(null);
      setLoadingError(null);

      if (content.binaryData) {
        setLoadingError('二进制 .skel 暂时不能在编辑器中解析结构。');
        return;
      }

      const url = resolveResourceUrl(project, content.skeletonResource);
      if (!url) {
        setLoadingError('请选择 Spine skeleton JSON 资源。');
        return;
      }

      (async () => {
        try {
          const json = JSON.parse(await readText(url));
          if (!cancelled) setSkeletonJson(json);
        } catch (error) {
          if (!cancelled) {
            setLoadingError(
              error && error.message ? error.message : String(error || '')
            );
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    },
    [project, content.binaryData, content.skeletonResource]
  );

  const applyDraft = (draft: Spine43Content): void => {
    const targetContent = getContent(objectConfiguration);
    Object.keys(draft).forEach(key => {
      targetContent[key] = clone(draft[key]);
    });
    if (onObjectUpdated) onObjectUpdated();
    forceUpdate();
    setMode(null);
  };

  const openEditor = () => {
    setMode('bones');
  };

  return (
    <ColumnStackLayout noMargin>
      <ObjectPropertiesEditor {...props} />
      <Line noMargin>
        <Column expand noMargin>
          {loadingError ? (
            <AlertMessage kind="warning">{loadingError}</AlertMessage>
          ) : null}
          <div style={styles.buttonsLine}>
            <RaisedButton
              label="打开 Spine 4.3 编辑器"
              onClick={openEditor}
              disabled={!skeletonJson}
            />
          </div>
        </Column>
      </Line>
      {mode && skeletonJson ? (
        <Spine43InspectorDialog
          mode={mode}
          project={project}
          objectConfiguration={objectConfiguration}
          skeletonJson={skeletonJson}
          onApply={applyDraft}
          onCancel={() => setMode(null)}
          onModeChange={setMode}
        />
      ) : null}
    </ColumnStackLayout>
  );
};

export default Spine43Editor;
