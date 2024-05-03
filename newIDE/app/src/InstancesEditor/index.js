// @flow
import React, { Component } from 'react';
import panable, { type PanMoveEvent } from '../Utils/PixiSimpleGesture/pan';
import KeyboardShortcuts, { MID_MOUSE_BUTTON } from '../UI/KeyboardShortcuts';
import InstancesRenderer from './InstancesRenderer';
import ViewPosition from './ViewPosition';
import SelectedInstances from './SelectedInstances';
import HighlightedInstance from './HighlightedInstance';
import SelectionRectangle from './SelectionRectangle';
import InstancesResizer, {
  type ResizeGrabbingLocation,
  canMoveOnX,
  canMoveOnY,
} from './InstancesResizer';
import InstancesRotator from './InstancesRotator';
import InstancesMover from './InstancesMover';
import Grid from './Grid';
import WindowBorder from './WindowBorder';
import WindowMask from './WindowMask';
import * as PIXI from 'pixi.js-legacy';
import * as THREE from 'three';
import FpsLimiter from './FpsLimiter';
import { startPIXITicker, stopPIXITicker } from '../Utils/PIXITicker';
import StatusBar from './StatusBar';
import CanvasCursor from './CanvasCursor';
import InstancesAdder from './InstancesAdder';
import { makeDropTarget } from '../UI/DragAndDrop/DropTarget';
import { objectWithContextReactDndType } from '../ObjectsList';
import PinchHandler, { shouldBeHandledByPinch } from './PinchHandler';
import { type ScreenType } from '../UI/Responsive/ScreenTypeMeasurer';
import InstancesSelection from './InstancesSelection';
import LongTouchHandler from './LongTouchHandler';
import {
  getRecommendedInitialZoomFactor,
  type InstancesEditorSettings,
} from './InstancesEditorSettings';
import Rectangle from '../Utils/Rectangle';
import { shouldPreventRenderingInstanceEditors } from '../UI/MaterialUISpecificUtil';
import {
  clampInstancesEditorZoom,
  getWheelStepZoomFactor,
} from '../Utils/ZoomUtils';
const gd: libGDevelop = global.gd;

export const instancesEditorId = 'instances-editor-canvas';
const styles = {
  canvasArea: { flex: 1, position: 'absolute', overflow: 'hidden' },
  dropCursor: { cursor: 'copy' },
};

const DropTarget = makeDropTarget<{||}>(objectWithContextReactDndType);

export type InstancesEditorShortcutsCallbacks = {|
  onDelete: () => void,
  onCopy: () => void,
  onCut: () => void,
  onPaste: () => void,
  onDuplicate: () => void,
  onUndo: () => void,
  onRedo: () => void,
  onZoomOut: () => void,
  onZoomIn: () => void,
  onShift1: () => void,
  onShift2: () => void,
  onShift3: () => void,
|};

export type InstancesEditorPropsWithoutSizeAndScroll = {|
  project: gdProject,
  layout: gdLayout,
  selectedLayer: string,
  initialInstances: gdInitialInstancesContainer,
  instancesEditorSettings: InstancesEditorSettings,
  isInstanceOf3DObject: gdInitialInstance => boolean,
  onInstancesEditorSettingsMutated: (
    instancesEditorSettings: InstancesEditorSettings
  ) => void,
  instancesSelection: InstancesSelection,
  onInstancesAdded: (instances: Array<gdInitialInstance>) => void,
  onInstancesSelected: (instances: Array<gdInitialInstance>) => void,
  onInstanceDoubleClicked: (instance: gdInitialInstance) => void,
  onInstancesMoved: (instances: Array<gdInitialInstance>) => void,
  onInstancesResized: (instances: Array<gdInitialInstance>) => void,
  onInstancesRotated: (instances: Array<gdInitialInstance>) => void,
  selectedObjectNames: Array<string>,
  onContextMenu: (
    x: number,
    y: number,
    ignoreSelectedObjectNamesForContextMenu?: boolean
  ) => void,
  pauseRendering: boolean,
  instancesEditorShortcutsCallbacks: InstancesEditorShortcutsCallbacks,
|};

type Props = {|
  ...InstancesEditorPropsWithoutSizeAndScroll,
  width: number,
  height: number,
  onViewPositionChanged?: ViewPosition => void,
  onMouseMove?: MouseEvent => void,
  onMouseLeave?: MouseEvent => void,
  screenType: ScreenType,
  showObjectInstancesIn3D: boolean,
|};

export default class InstancesEditor extends Component<Props> {
  lastContextMenuX = 0;
  lastContextMenuY = 0;
  lastCursorX = 0;
  lastCursorY = 0;
  fpsLimiter = new FpsLimiter({ maxFps: 60, idleFps: 10 });
  canvasArea: ?HTMLDivElement;
  pixiRenderer: PIXI.Renderer;
  threeRenderer: THREE.WebGLRenderer | null = null;
  keyboardShortcuts: KeyboardShortcuts;
  pinchHandler: PinchHandler;
  canvasCursor: CanvasCursor;
  _instancesAdder: InstancesAdder;
  selectionRectangle: SelectionRectangle;
  selectedInstances: SelectedInstances;
  highlightedInstance: HighlightedInstance;
  instancesResizer: InstancesResizer;
  instancesRotator: InstancesRotator;
  instancesMover: InstancesMover;
  windowBorder: WindowBorder;
  windowMask: WindowMask;
  statusBar: StatusBar;
  pixiContainer: PIXI.Container;
  backgroundArea: PIXI.Container;
  instancesRenderer: InstancesRenderer;
  viewPosition: ViewPosition;
  longTouchHandler: LongTouchHandler;
  grid: Grid;
  _unmounted = false;
  _renderingPaused = false;
  nextFrame: AnimationFrameID;
  contextMenuLongTouchTimeoutID: TimeoutID;
  hasCursorMovedSinceItIsDown = false;
  _showObjectInstancesIn3D: boolean = false;

  componentDidMount() {
    // Initialize the PIXI renderer, if possible
    if (this.canvasArea && !this.pixiRenderer) {
      this._initializeCanvasAndRenderer();
    }
  }

  componentDidUpdate() {
    // Initialize the PIXI renderer, if not already done.
    // This can happen if canvasArea was not rendered
    // just after the mount (depends on react-dnd versions?).
    if (this.canvasArea && !this.pixiRenderer) {
      this._initializeCanvasAndRenderer();
    }
  }

  _initializeCanvasAndRenderer() {
    const { canvasArea } = this;
    if (!canvasArea) return;

    // project can be used here for initializing stuff, but don't keep references to it.
    // Instead, create editors in _mountEditorComponents (as they will be destroyed/recreated
    // if the project changes).
    const { project, onMouseMove, onMouseLeave } = this.props;

    this.keyboardShortcuts = new KeyboardShortcuts({
      shortcutCallbacks: {
        onMove: this.moveSelection,
        ...this.props.instancesEditorShortcutsCallbacks,
      },
    });

    let gameCanvas: HTMLCanvasElement;
    this._showObjectInstancesIn3D = this.props.showObjectInstancesIn3D;
    // TODO (3D): Should it handle preference changes without needing to reopen tabs?
    if (this._showObjectInstancesIn3D) {
      gameCanvas = document.createElement('canvas');
      const threeRenderer = new THREE.WebGLRenderer({
        canvas: gameCanvas,
      });
      threeRenderer.useLegacyLights = true;
      threeRenderer.autoClear = false;
      threeRenderer.setSize(this.props.width, this.props.height);

      // Create a PixiJS renderer that use the same GL context as Three.js
      // so that both can render to the canvas and even have PixiJS rendering
      // reused in Three.js (by using a RenderTexture and the same internal WebGL texture).
      this.pixiRenderer = new PIXI.Renderer({
        width: this.props.width,
        height: this.props.height,
        view: gameCanvas,
        context: threeRenderer.getContext(),
        clearBeforeRender: false,
        preserveDrawingBuffer: true,
        antialias: false,
        backgroundAlpha: 0,
        // It's the default value, but it's better to make it explicit.
        // It allows instances composed of several pixi objects to detect hovering.
        eventMode: 'auto',
        // TODO (3D): add a setting for pixel ratio (`resolution: window.devicePixelRatio`)
      });

      this.threeRenderer = threeRenderer;
    } else {
      // Create the renderer and setup the rendering area for scene editor.
      this.pixiRenderer = PIXI.autoDetectRenderer({
        width: this.props.width,
        height: this.props.height,
        // "preserveDrawingBuffer: true" is needed to avoid flickering and background issues on some mobile phones (see #585 #572 #566 #463)
        preserveDrawingBuffer: true,
        // Disable anti-aliasing (default) to avoid rendering issue (1px width line of extra pixels) when rendering pixel perfect tiled sprites.
        antialias: false,
        clearBeforeRender: false,
        backgroundAlpha: 0,
      });

      gameCanvas = this.pixiRenderer.view;
    }

    // Deactivating accessibility support in PixiJS renderer, as we want to be in control of this.
    // See https://github.com/pixijs/pixijs/issues/5111#issuecomment-420047824
    this.pixiRenderer.plugins.accessibility.destroy();
    delete this.pixiRenderer.plugins.accessibility;

    // Add the renderer view element to the DOM
    canvasArea.appendChild(gameCanvas);

    this.pixiRenderer.view.style.outline = 'none';

    this.longTouchHandler = new LongTouchHandler({
      canvas: this.pixiRenderer.view,
      onLongTouch: event =>
        this.props.onContextMenu(event.clientX, event.clientY),
    });

    this.pixiRenderer.view.onwheel = (event: WheelEvent) => {
      this.fpsLimiter.notifyInteractionHappened();
      const zoomFactor = this.getZoomFactor();
      if (this.keyboardShortcuts.shouldZoom(event)) {
        this.zoomOnCursorBy(getWheelStepZoomFactor(-event.deltaY));
      } else if (this.keyboardShortcuts.shouldScrollHorizontally()) {
        const deltaX = event.deltaY / (5 * zoomFactor);
        this.scrollBy(-deltaX, 0);
      } else {
        const deltaX = event.deltaX / (5 * zoomFactor);
        const deltaY = event.deltaY / (5 * zoomFactor);
        this.scrollBy(deltaX, deltaY);
      }

      event.preventDefault();
    };
    this.pixiRenderer.view.setAttribute('tabIndex', -1);
    this.pixiRenderer.view.addEventListener(
      'keydown',
      this.keyboardShortcuts.onKeyDown
    );
    this.pixiRenderer.view.addEventListener(
      'keyup',
      this.keyboardShortcuts.onKeyUp
    );
    this.pixiRenderer.view.addEventListener(
      'mousedown',
      this.keyboardShortcuts.onMouseDown
    );
    this.pixiRenderer.view.addEventListener(
      'mouseup',
      this.keyboardShortcuts.onMouseUp
    );
    if (onMouseMove)
      this.pixiRenderer.view.addEventListener('mousemove', event => {
        onMouseMove(event);
      });
    if (onMouseLeave)
      this.pixiRenderer.view.addEventListener('mouseout', event => {
        onMouseLeave(event);
      });
    this.pixiRenderer.view.addEventListener('focusout', event => {
      if (this.keyboardShortcuts) {
        this.keyboardShortcuts.resetModifiers();
      }
    });

    this.pixiContainer = new PIXI.Container(); // TODO (3D): rename this container.

    this.backgroundArea = new PIXI.Container();
    this.backgroundArea.hitArea = new PIXI.Rectangle(
      0,
      0,
      this.props.width,
      this.props.height
    );
    panable(this.backgroundArea);
    this.backgroundArea.addEventListener('mousedown', event =>
      this._onDownBackground(event.data.global.x, event.data.global.y, event)
    );
    this.backgroundArea.addEventListener('mouseup', event =>
      this._onUpBackground(event.data.global.x, event.data.global.y, event)
    );
    this.backgroundArea.addEventListener(
      'rightclick',
      (interactionEvent: PIXI.InteractionEvent) => {
        const {
          data: { originalEvent: event },
        } = interactionEvent;
        this._onRightClicked({
          offsetX: event.offsetX,
          offsetY: event.offsetY,
          x: event.clientX,
          y: event.clientY,
          ignoreSelectedObjectNamesForContextMenu: true,
        });

        return false;
      }
    );
    this.backgroundArea.addEventListener('touchstart', event => {
      if (shouldBeHandledByPinch(event.data && event.data.originalEvent)) {
        return;
      }

      this._onDownBackground(event.data.global.x, event.data.global.y);
    });
    this.backgroundArea.addEventListener('touchend', event => {
      if (shouldBeHandledByPinch(event.data && event.data.originalEvent)) {
        return;
      }

      this._onUpBackground(event.data.global.x, event.data.global.y);
    });
    this.backgroundArea.addEventListener('globalmousemove', event => {
      const cursorX = event.data.global.x || 0;
      const cursorY = event.data.global.y || 0;
      this._onMouseMove(cursorX, cursorY);
    });
    this.backgroundArea.addEventListener('panmove', (event: PanMoveEvent) =>
      this._onPanMove(
        event.deltaX,
        event.deltaY,
        event.data.global.x,
        event.data.global.y
      )
    );
    this.backgroundArea.addEventListener('panend', event => this._onPanEnd());
    this.pixiContainer.addChild(this.backgroundArea);

    this.viewPosition = new ViewPosition({
      initialViewX: project ? project.getGameResolutionWidth() / 2 : 0,
      initialViewY: project ? project.getGameResolutionHeight() / 2 : 0,
      width: this.props.width,
      height: this.props.height,
      instancesEditorSettings: this.props.instancesEditorSettings,
    });

    this.grid = new Grid({
      viewPosition: this.viewPosition,
      instancesEditorSettings: this.props.instancesEditorSettings,
    });
    this.pixiContainer.addChild(this.grid.getPixiObject());

    this.pinchHandler = new PinchHandler({
      canvas: this.pixiRenderer.view,
      setZoomFactor: this.setZoomFactor,
      getZoomFactor: this.getZoomFactor,
      viewPosition: this.viewPosition,
    });

    this.canvasCursor = new CanvasCursor({
      canvas: canvasArea,
      shouldMoveView: () => this.keyboardShortcuts.shouldMoveView(),
    });

    this._instancesAdder = new InstancesAdder({
      instances: this.props.initialInstances,
      instancesEditorSettings: this.props.instancesEditorSettings,
    });

    this._mountEditorComponents(this.props);
    this._renderScene();
    if (this.props.onViewPositionChanged) {
      // Call it at the end, so that the top component knows the view position
      // is initialized.
      this.props.onViewPositionChanged(this.viewPosition);
    }
  }

  /**
   * Force the internal InstancesRenderer to be destroyed and recreated
   * (as well as other components holding references to instances). Call
   * this when the initial instances were recreated to ensure that there
   * is not mismatch between renderers and the instances that were updated.
   */
  forceRemount = () => {
    this._mountEditorComponents(this.props);
  };

  _mountEditorComponents(props: Props) {
    //Remove and delete any existing editor component
    if (this.highlightedInstance) {
      this.pixiContainer.removeChild(this.highlightedInstance.getPixiObject());
    }
    if (this.selectedInstances) {
      this.pixiContainer.removeChild(this.selectedInstances.getPixiContainer());
    }
    if (this.instancesRenderer) {
      this.pixiContainer.removeChild(this.instancesRenderer.getPixiContainer());
      this.instancesRenderer.delete();
    }
    if (this.selectionRectangle) {
      this.pixiContainer.removeChild(this.selectionRectangle.getPixiObject());
      this.selectionRectangle.delete();
    }
    if (this.windowBorder) {
      this.pixiContainer.removeChild(this.windowBorder.getPixiObject());
    }
    if (this.windowMask) {
      this.pixiContainer.removeChild(this.windowMask.getPixiObject());
    }
    if (this.statusBar) {
      this.pixiContainer.removeChild(this.statusBar.getPixiObject());
    }

    this.instancesRenderer = new InstancesRenderer({
      project: props.project,
      layout: props.layout,
      instances: props.initialInstances,
      viewPosition: this.viewPosition,
      onOverInstance: this._onOverInstance,
      onMoveInstance: this._onMoveInstance,
      onMoveInstanceEnd: this._onMoveInstanceEnd,
      onDownInstance: this._onDownInstance,
      onUpInstance: this._onUpInstance,
      onOutInstance: this._onOutInstance,
      onInstanceClicked: this._onInstanceClicked,
      onInstanceRightClicked: this._onInstanceRightClicked,
      onInstanceDoubleClicked: this._onInstanceDoubleClicked,
      showObjectInstancesIn3D: this._showObjectInstancesIn3D,
    });
    this.selectionRectangle = new SelectionRectangle({
      instances: props.initialInstances,
      instanceMeasurer: this.instancesRenderer.getInstanceMeasurer(),
      toSceneCoordinates: this.viewPosition.toSceneCoordinates,
    });
    this.selectedInstances = new SelectedInstances({
      instancesSelection: this.props.instancesSelection,
      onResize: this._onResize,
      onResizeEnd: this._onResizeEnd,
      onRotate: this._onRotate,
      onRotateEnd: this._onRotateEnd,
      instanceMeasurer: this.instancesRenderer.getInstanceMeasurer(),
      toCanvasCoordinates: this.viewPosition.toCanvasCoordinates,
      screenType: this.props.screenType,
      keyboardShortcuts: this.keyboardShortcuts,
      onPanMove: this._onPanMove,
      onPanEnd: this._onPanEnd,
    });
    this.highlightedInstance = new HighlightedInstance({
      instanceMeasurer: this.instancesRenderer.getInstanceMeasurer(),
      toCanvasCoordinates: this.viewPosition.toCanvasCoordinates,
      isInstanceOf3DObject: this.props.isInstanceOf3DObject,
    });
    this.instancesResizer = new InstancesResizer({
      instanceMeasurer: this.instancesRenderer.getInstanceMeasurer(),
      instancesEditorSettings: this.props.instancesEditorSettings,
    });
    this.instancesRotator = new InstancesRotator(
      this.instancesRenderer.getInstanceMeasurer()
    );
    this.instancesMover = new InstancesMover({
      instanceMeasurer: this.instancesRenderer.getInstanceMeasurer(),
      instancesEditorSettings: this.props.instancesEditorSettings,
    });
    this.windowBorder = new WindowBorder({
      project: props.project,
      layout: props.layout,
      toCanvasCoordinates: this.viewPosition.toCanvasCoordinates,
    });
    this.windowMask = new WindowMask({
      project: props.project,
      viewPosition: this.viewPosition,
      instancesEditorSettings: this.props.instancesEditorSettings,
    });
    this.statusBar = new StatusBar({
      width: this.props.width,
      height: this.props.height,
      getLastCursorSceneCoordinates: this.getLastCursorSceneCoordinates,
    });

    this.pixiContainer.addChild(this.selectionRectangle.getPixiObject());
    this.pixiContainer.addChild(this.instancesRenderer.getPixiContainer());
    this.pixiContainer.addChild(this.windowBorder.getPixiObject());
    this.pixiContainer.addChild(this.windowMask.getPixiObject());
    this.pixiContainer.addChild(this.selectedInstances.getPixiContainer());
    this.pixiContainer.addChild(this.highlightedInstance.getPixiObject());
    this.pixiContainer.addChild(this.statusBar.getPixiObject());
  }

  componentWillUnmount() {
    // This is an antipattern and is theoretically not needed, but help
    // to protect against renders after the component is unmounted.
    this._unmounted = true;

    // We've seen all those elements being undefined in some cases, so
    // by security, check that they are defined before deleting them.
    if (this.selectionRectangle) {
      this.selectionRectangle.delete();
    }
    if (this.instancesRenderer) {
      this.instancesRenderer.delete();
    }
    if (this._instancesAdder) {
      this._instancesAdder.unmount();
    }
    if (this.pinchHandler) {
      this.pinchHandler.unmount();
    }
    if (this.longTouchHandler) {
      this.longTouchHandler.unmount();
    }
    if (this.nextFrame) cancelAnimationFrame(this.nextFrame);
    stopPIXITicker();
    if (this.pixiContainer) {
      this.pixiContainer.destroy();
    }
    if (this.pixiRenderer) {
      this.pixiRenderer.destroy();
    }
  }

  // To be updated, see https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops.
  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.width !== this.props.width ||
      nextProps.height !== this.props.height
    ) {
      this.pixiRenderer.resize(nextProps.width, nextProps.height);
      if (this.threeRenderer) {
        this.threeRenderer.setSize(nextProps.width, nextProps.height);
      }
      this.viewPosition.resize(nextProps.width, nextProps.height);
      this.statusBar.resize(nextProps.width, nextProps.height);
      this.backgroundArea.hitArea = new PIXI.Rectangle(
        0,
        0,
        nextProps.width,
        nextProps.height
      );

      // Avoid flickering that could happen while waiting for next animation frame.
      this.fpsLimiter.forceNextUpdate();
      this._renderScene();
    }

    if (
      nextProps.instancesEditorSettings !== this.props.instancesEditorSettings
    ) {
      this.grid.setInstancesEditorSettings(nextProps.instancesEditorSettings);
      this.instancesMover.setInstancesEditorSettings(
        nextProps.instancesEditorSettings
      );
      this.instancesResizer.setInstancesEditorSettings(
        nextProps.instancesEditorSettings
      );
      this.windowMask.setInstancesEditorSettings(
        nextProps.instancesEditorSettings
      );
      this.viewPosition.setInstancesEditorSettings(
        nextProps.instancesEditorSettings
      );
      this._instancesAdder.setInstancesEditorSettings(
        nextProps.instancesEditorSettings
      );
    }

    if (nextProps.screenType !== this.props.screenType) {
      this.selectedInstances.setScreenType(this.props.screenType);
    }

    if (
      this.props.layout !== nextProps.layout ||
      this.props.initialInstances !== nextProps.initialInstances ||
      this.props.project !== nextProps.project
    ) {
      this._mountEditorComponents(nextProps);
    }

    // For avoiding useless renderings, which is costly for CPU/GPU, when the editor
    // is not displayed, `pauseRendering` prop can be set to true.
    if (nextProps.pauseRendering && !this.props.pauseRendering)
      this.pauseSceneRendering();

    if (!nextProps.pauseRendering && this.props.pauseRendering)
      this.restartSceneRendering();
  }

  /**
   * Delete instance renderers of the specified objects, which will then be recreated during
   * the next render. Call this when an object resources may have changed (for example, a modified image),
   * and you want the instances of objects to reflect the changes.
   * See also ResourcesLoader and PixiResourcesLoader.
   * @param {string} objectName The name of the object for which instance must be re-rendered.
   */
  resetInstanceRenderersFor = (objectName: string) => {
    if (this.instancesRenderer)
      this.instancesRenderer.resetInstanceRenderersFor(objectName);
  };

  zoomBy = (value: number) => {
    this.setZoomFactor(this.getZoomFactor() * value);
  };

  /**
   * Zoom and scroll so that the cursor stays on the same position scene-wise.
   */
  zoomOnCursorBy(value: number) {
    const beforeZoomCursorPosition = this.getLastCursorSceneCoordinates();
    this.setZoomFactor(this.getZoomFactor() * value);
    const afterZoomCursorPosition = this.getLastCursorSceneCoordinates();
    // Compensate for the cursor change in position
    this.scrollBy(
      beforeZoomCursorPosition[0] - afterZoomCursorPosition[0],
      beforeZoomCursorPosition[1] - afterZoomCursorPosition[1]
    );
  }

  getZoomFactor = () => {
    return this.props.instancesEditorSettings.zoomFactor;
  };

  setZoomFactor = (zoomFactor: number) => {
    this.props.instancesEditorSettings.zoomFactor = clampInstancesEditorZoom(
      zoomFactor
    );

    this.props.onInstancesEditorSettingsMutated(
      this.props.instancesEditorSettings
    );
  };

  /**
   * Immediately add serialized instances at the given
   * position (in scene coordinates).
   */
  addSerializedInstances = (options: {|
    position: [number, number],
    copyReferential: [number, number],
    serializedInstances: Array<Object>,
    preventSnapToGrid?: boolean,
    addInstancesInTheForeground?: boolean,
  |}): Array<gdInitialInstance> => {
    return this._instancesAdder.addSerializedInstances(options);
  };

  /**
   * Immediately add instances for the specified objects at the given
   * position (in scene coordinates) given their names.
   */
  addInstances = (
    pos: [number, number],
    objectNames: Array<string>,
    layer: string
  ): Array<gdInitialInstance> => {
    return this._instancesAdder.addInstances(pos, objectNames, layer);
  };

  _onMouseMove = (x: number, y: number) => {
    this.lastCursorX = x;
    this.lastCursorY = y;
  };

  _onDownBackground = (x: number, y: number, event?: PointerEvent) => {
    this.lastCursorX = x;
    this.lastCursorY = y;
    this.pixiRenderer.view.focus();

    // KeyboardShortcuts.shouldMoveView cannot be used here because
    // the click event fires first on the background, then on the pixi
    // view which KeyboardShortcuts listens to. So KeyboardShortcuts
    // will always be late.
    const shouldMoveView =
      this.keyboardShortcuts.shouldMoveView() ||
      (event ? event.button === MID_MOUSE_BUTTON : false);

    // Selection rectangle is only drawn in _onPanMove,
    // which can happen a few milliseconds after a background
    // click/touch - enough to have the selection rectangle being
    // offset from the first click - which looks laggy. Set
    // the start position now.
    if (!shouldMoveView) {
      this.selectionRectangle.startSelectionRectangle(x, y);
    }

    if (
      !this.keyboardShortcuts.shouldMultiSelect() &&
      !shouldMoveView &&
      this.props.instancesSelection.hasSelectedInstances()
    ) {
      this.props.instancesSelection.clearSelection();
      this.props.onInstancesSelected([]);
    }
  };

  _onPanMove = (deltaX: number, deltaY: number, x: number, y: number) => {
    this.fpsLimiter.notifyInteractionHappened();
    if (this.keyboardShortcuts.shouldMoveView()) {
      const sceneDeltaX = deltaX / this.getZoomFactor();
      const sceneDeltaY = deltaY / this.getZoomFactor();

      this.scrollBy(-sceneDeltaX, -sceneDeltaY);
      return;
    }

    if (this.selectionRectangle.hasStartedSelectionRectangle()) {
      this.selectionRectangle.updateSelectionRectangle(x, y);
      return;
    }
  };

  _getLayersLocks = () => {
    const { layout } = this.props;
    const layersLocks = {};
    for (let i = 0; i < layout.getLayersCount(); i++) {
      const layer = layout.getLayerAt(i);
      layersLocks[layout.getLayerAt(i).getName()] =
        !layer.getVisibility() || layer.isLocked();
    }
    return layersLocks;
  };

  _onUpBackground = (x: number, y: number, event?: PointerEvent) => {
    if (this.selectionRectangle.hasStartedSelectionRectangle()) {
      this._selectInstanceInsideSelectionRectangle();
    }
  };

  _onPanEnd = () => {
    // When a pan is ended, this can be that either the user was making
    // a selection, or that the user was moving the view.
    if (this.selectionRectangle.hasStartedSelectionRectangle()) {
      this._selectInstanceInsideSelectionRectangle();
    }
  };

  _selectInstanceInsideSelectionRectangle = () => {
    let instancesSelected = this.selectionRectangle.endSelectionRectangle();

    this.props.instancesSelection.selectInstances({
      instances: instancesSelected,
      multiSelect: this.keyboardShortcuts.shouldMultiSelect(),
      layersLocks: this._getLayersLocks(),
    });
    instancesSelected = this.props.instancesSelection.getSelectedInstances();
    this.props.onInstancesSelected(instancesSelected);
  };

  _onInstanceClicked = (instance: gdInitialInstance) => {
    this.fpsLimiter.notifyInteractionHappened();
    this.pixiRenderer.view.focus();
  };

  _onInstanceRightClicked = (coordinates: {|
    offsetX: number,
    offsetY: number,
    x: number,
    y: number,
  |}) => {
    this._onRightClicked({
      ...coordinates,
      ignoreSelectedObjectNamesForContextMenu: false,
    });
  };

  _onRightClicked = ({
    offsetX,
    offsetY,
    x,
    y,
    ignoreSelectedObjectNamesForContextMenu,
  }: {|
    offsetX: number,
    offsetY: number,
    x: number,
    y: number,
    ignoreSelectedObjectNamesForContextMenu?: boolean,
  |}) => {
    this.lastContextMenuX = offsetX;
    this.lastContextMenuY = offsetY;
    if (this.props.onContextMenu) {
      this.props.onContextMenu(x, y, !!ignoreSelectedObjectNamesForContextMenu);
    }
  };

  _onInstanceDoubleClicked = (instance: gdInitialInstance) => {
    if (!this.keyboardShortcuts.shouldIgnoreDoubleClick()) {
      this.props.onInstanceDoubleClicked(instance);
    }
  };

  _onOverInstance = (instance: gdInitialInstance) => {
    if (!this.instancesMover.isMoving())
      this.highlightedInstance.setInstance(instance);
  };

  _onDownInstance = (
    instance: gdInitialInstance,
    sceneX: number,
    sceneY: number
  ) => {
    this.fpsLimiter.notifyInteractionHappened();

    this.hasCursorMovedSinceItIsDown = false;

    if (this.keyboardShortcuts.shouldMoveView()) {
      // If the user wants to move the view, discard the click on an instance:
      // it's just the beginning of the user panning the view.
      return;
    }

    if (
      this.keyboardShortcuts.shouldStartRectangleSelectionInsteadOfSelecting()
    ) {
      const canvasPosition = this.viewPosition.toCanvasCoordinates(
        sceneX,
        sceneY
      );
      this.selectionRectangle.startSelectionRectangle(
        canvasPosition[0],
        canvasPosition[1]
      );
      return;
    }

    // MultiSelect is not done here because it's the same modifier as
    // shouldStartRectangleSelectionInsteadOfSelecting.
    // It's done in _onUpInstance instead.
    this.props.instancesSelection.selectInstance({
      instance,
      multiSelect: this.keyboardShortcuts.shouldMultiSelect(),
      layersLocks: this._getLayersLocks(),
    });
    if (this.props.onInstancesSelected) {
      this.props.onInstancesSelected(
        this.props.instancesSelection.getSelectedInstances()
      );
    }

    this.instancesMover.startMove(sceneX, sceneY);
  };

  _onOutInstance = (instance: gdInitialInstance) => {
    if (instance === this.highlightedInstance.getInstance())
      this.highlightedInstance.setInstance(null);
  };

  _onUpInstance = (
    instance: gdInitialInstance,
    sceneX: number,
    sceneY: number
  ) => {
    // Select instances on a click.
    // - In case of standard selection, it's already done in _onDownInstance
    // but selecting the same instance twice has no side effect on the
    // selection.
    // - For MultiSelect, the selection is not done in _onDownInstance.
    if (!this.hasCursorMovedSinceItIsDown) {
      this.props.instancesSelection.selectInstance({
        instance,
        multiSelect: this.keyboardShortcuts.shouldMultiSelect(),
        layersLocks: this._getLayersLocks(),
      });
      if (this.props.onInstancesSelected) {
        this.props.onInstancesSelected(
          this.props.instancesSelection.getSelectedInstances()
        );
      }

      if (this.selectionRectangle.hasStartedSelectionRectangle()) {
        this._selectInstanceInsideSelectionRectangle();
      }
    }
  };

  _onMoveInstance = (
    instance: gdInitialInstance,
    deltaX: number,
    deltaY: number
  ) => {
    this.fpsLimiter.notifyInteractionHappened();

    const isMovingForTheFirstTimeSinceItIsDown = !this
      .hasCursorMovedSinceItIsDown;
    this.hasCursorMovedSinceItIsDown = true;

    const sceneDeltaX = deltaX / this.getZoomFactor();
    const sceneDeltaY = deltaY / this.getZoomFactor();

    // It is possible for the user to start moving an instance, then press the button
    // to move the view, move it, then unpress it and continue to move the instance.
    // This means that while we're in "_onMoveInstance", we must handle view moving.
    if (this.keyboardShortcuts.shouldMoveView()) {
      this.scrollBy(-sceneDeltaX, -sceneDeltaY);
      return;
    }

    if (
      this.selectionRectangle.hasStartedSelectionRectangle() &&
      this.selectionRectangle.selectionRectangleEnd
    ) {
      this.selectionRectangle.updateSelectionRectangle(
        this.selectionRectangle.selectionRectangleEnd.x + deltaX,
        this.selectionRectangle.selectionRectangleEnd.y + deltaY
      );
      return;
    }

    if (
      this.keyboardShortcuts.shouldCloneInstances() &&
      isMovingForTheFirstTimeSinceItIsDown
    ) {
      const selectedInstances = this.props.instancesSelection.getSelectedInstances();
      for (let i = 0; i < selectedInstances.length; i++) {
        const instance = selectedInstances[i];
        this.props.initialInstances
          .insertInitialInstance(instance)
          .resetPersistentUuid();
      }
    }

    if (!this.props.instancesSelection.isInstanceSelected(instance)) {
      this._onInstanceClicked(instance);
    }

    const selectedInstances = this.props.instancesSelection.getSelectedInstances();
    this.instancesMover.moveBy(
      selectedInstances,
      sceneDeltaX,
      sceneDeltaY,
      this.keyboardShortcuts.shouldFollowAxis(),
      this.keyboardShortcuts.shouldNotSnapToGrid()
    );
  };

  _onMoveInstanceEnd = () => {
    if (!this.hasCursorMovedSinceItIsDown) {
      return;
    }

    if (this.selectionRectangle.hasStartedSelectionRectangle()) {
      this._selectInstanceInsideSelectionRectangle();
      return;
    }

    this.instancesMover.endMove();

    const selectedInstances = this.props.instancesSelection.getSelectedInstances();
    this.props.onInstancesMoved(selectedInstances);
  };

  _onResize = (
    deltaX: number,
    deltaY: number,
    grabbingLocation: ResizeGrabbingLocation
  ) => {
    this.fpsLimiter.notifyInteractionHappened();
    const sceneDeltaX = deltaX / this.getZoomFactor();
    const sceneDeltaY = deltaY / this.getZoomFactor();

    const selectedInstances = this.props.instancesSelection.getSelectedInstances();
    const forceProportional =
      this.props.screenType === 'touch' &&
      canMoveOnX(grabbingLocation) &&
      canMoveOnY(grabbingLocation);
    const proportional =
      forceProportional || this.keyboardShortcuts.shouldResizeProportionally();
    this.instancesResizer.resizeBy(
      selectedInstances,
      sceneDeltaX,
      sceneDeltaY,
      grabbingLocation,
      proportional,
      this.keyboardShortcuts.shouldNotSnapToGrid()
    );
  };

  _onResizeEnd = () => {
    this.instancesResizer.endResize();

    const selectedInstances = this.props.instancesSelection.getSelectedInstances();
    this.props.onInstancesResized(selectedInstances);
  };

  _onRotate = (deltaX: number, deltaY: number) => {
    this.fpsLimiter.notifyInteractionHappened();
    const sceneDeltaX = deltaX / this.getZoomFactor();
    const sceneDeltaY = deltaY / this.getZoomFactor();

    const selectedInstances = this.props.instancesSelection.getSelectedInstances();
    this.instancesRotator.rotateBy(
      selectedInstances,
      sceneDeltaX,
      sceneDeltaY,
      this.keyboardShortcuts.shouldResizeProportionally()
    );
  };

  _onRotateEnd = () => {
    this.instancesRotator.endRotate();

    const selectedInstances = this.props.instancesSelection.getSelectedInstances();
    this.props.onInstancesRotated(selectedInstances);
  };

  clearHighlightedInstance = () => {
    this.highlightedInstance.setInstance(null);
  };

  moveSelection = (x: number, y: number) => {
    this.fpsLimiter.notifyInteractionHappened();
    const selectedInstances = this.props.instancesSelection.getSelectedInstances();
    const unlockedSelectedInstances = selectedInstances.filter(
      instance => !instance.isLocked()
    );
    unlockedSelectedInstances.forEach(instance => {
      instance.setX(instance.getX() + x);
      instance.setY(instance.getY() + y);
    });
    this.props.onInstancesMoved(unlockedSelectedInstances);
  };

  scrollBy(x: number, y: number) {
    this.fpsLimiter.notifyInteractionHappened();
    this.viewPosition.scrollBy(x, y);

    if (this.props.onViewPositionChanged) {
      this.props.onViewPositionChanged(this.viewPosition);
    }
  }

  scrollTo(x: number, y: number) {
    this.fpsLimiter.notifyInteractionHappened();
    this.viewPosition.scrollTo(x, y);
    if (this.props.onViewPositionChanged) {
      this.props.onViewPositionChanged(this.viewPosition);
    }
  }

  fitViewToRectangle(
    rectangle: Rectangle,
    { adaptZoom }: { adaptZoom: boolean }
  ) {
    const idealZoom = this.viewPosition.fitToRectangle(rectangle);
    if (adaptZoom) this.setZoomFactor(idealZoom);
    if (this.props.onViewPositionChanged) {
      this.props.onViewPositionChanged(this.viewPosition);
    }
  }

  getBoundingClientRect() {
    if (!this.canvasArea) return { left: 0, top: 0, right: 0, bottom: 0 };
    return this.canvasArea.getBoundingClientRect();
  }

  zoomToFitContent = () => {
    const { initialInstances } = this.props;
    if (initialInstances.getInstancesCount() === 0) return;

    const instanceMeasurer = this.instancesRenderer.getInstanceMeasurer();
    let contentAABB: ?Rectangle;
    const getInstanceRectangle = new gd.InitialInstanceJSFunctor();
    // $FlowFixMe - invoke is not writable
    getInstanceRectangle.invoke = instancePtr => {
      // $FlowFixMe - wrapPointer is not exposed
      const instance: gdInitialInstance = gd.wrapPointer(
        instancePtr,
        gd.InitialInstance
      );
      if (!contentAABB) {
        contentAABB = instanceMeasurer.getInstanceAABB(
          instance,
          new Rectangle()
        );
      } else {
        contentAABB.union(
          instanceMeasurer.getInstanceAABB(instance, new Rectangle())
        );
      }
    };
    // $FlowFixMe - JSFunctor is incompatible with Functor
    initialInstances.iterateOverInstances(getInstanceRectangle);
    getInstanceRectangle.delete();
    if (contentAABB) this.fitViewToRectangle(contentAABB, { adaptZoom: true });
  };

  zoomToInitialPosition = () => {
    const width = this.props.project.getGameResolutionWidth();
    const height = this.props.project.getGameResolutionHeight();
    const x = width / 2;
    const y = height / 2;
    this.setZoomFactor(
      getRecommendedInitialZoomFactor(Math.max(height, width))
    );
    this.scrollTo(x, y);
  };

  zoomToFitSelection = (instances: Array<gdInitialInstance>) => {
    if (instances.length === 0) return;
    const [firstInstance, ...otherInstances] = instances;
    const instanceMeasurer = this.instancesRenderer.getInstanceMeasurer();
    let selectedInstancesRectangle = instanceMeasurer.getInstanceAABB(
      firstInstance,
      new Rectangle()
    );
    otherInstances.forEach(instance => {
      selectedInstancesRectangle.union(
        instanceMeasurer.getInstanceAABB(instance, new Rectangle())
      );
    });
    this.fitViewToRectangle(selectedInstancesRectangle, { adaptZoom: true });
  };

  centerViewOnLastInstance = (
    instances: Array<gdInitialInstance>,
    offset?: ?[number, number]
  ) => {
    if (instances.length === 0) return;

    const instanceMeasurer = this.instancesRenderer.getInstanceMeasurer();
    let lastInstanceRectangle = instanceMeasurer.getInstanceAABB(
      instances[instances.length - 1],
      new Rectangle()
    );
    this.fitViewToRectangle(lastInstanceRectangle, { adaptZoom: false });
    if (offset) this.scrollBy(offset[0], offset[1]);
  };

  getLastContextMenuSceneCoordinates = () => {
    return this.viewPosition.toSceneCoordinates(
      this.lastContextMenuX,
      this.lastContextMenuY
    );
  };

  getLastCursorSceneCoordinates = () => {
    return this.viewPosition.toSceneCoordinates(
      this.lastCursorX,
      this.lastCursorY
    );
  };

  getViewPosition = (): ?ViewPosition => {
    return this.viewPosition;
  };

  _renderScene = () => {
    // Protect against rendering scheduled after the component is unmounted.
    if (this._unmounted) return;
    if (this._renderingPaused) return;

    // Avoid killing the CPU by limiting the rendering calls.
    if (
      this.fpsLimiter.shouldUpdate() &&
      !shouldPreventRenderingInstanceEditors()
    ) {
      this.canvasCursor.render();
      this.grid.render();
      this.highlightedInstance.render();
      this.selectedInstances.render();
      this.selectionRectangle.render();
      this.windowBorder.render();
      this.windowMask.render();
      this.statusBar.render();

      this.instancesRenderer.render(
        this.pixiRenderer,
        this.threeRenderer,
        this.viewPosition,
        this.pixiContainer
      );
    }
    this.nextFrame = requestAnimationFrame(this._renderScene);
  };

  pauseSceneRendering = () => {
    if (this.nextFrame) cancelAnimationFrame(this.nextFrame);
    this._renderingPaused = true;
    // Deactivate interactions when the scene is paused.
    // Useful when the scene is paused to reload textures. The event system
    // might try to check if pointer is over a PIXI object using the texture
    // of the object. If there is no texture, it will crash.
    // The PIXI.EventSystem is not based on the PIXI.Ticker.
    this.instancesRenderer.getPixiContainer().eventMode = 'none';

    stopPIXITicker();
  };

  restartSceneRendering = () => {
    this._renderingPaused = false;
    this._renderScene();
    this.instancesRenderer.getPixiContainer().eventMode = 'auto';

    startPIXITicker();
  };

  getInstanceSize = (
    initialInstance: gdInitialInstance
  ): [number, number, number] => {
    return this.instancesRenderer
      .getInstanceMeasurer()
      .getUnrotatedInstanceSize(initialInstance);
  };

  render() {
    if (!this.props.project) return null;

    return (
      <DropTarget
        canDrop={() => true}
        hover={monitor => {
          this.fpsLimiter.notifyInteractionHappened();
          const { _instancesAdder, viewPosition, canvasArea } = this;
          if (!_instancesAdder || !canvasArea || !viewPosition) return;

          const { x, y } = monitor.getClientOffset();
          const canvasRect = canvasArea.getBoundingClientRect();
          const pos = viewPosition.toSceneCoordinates(
            x - canvasRect.left,
            y - canvasRect.top
          );
          _instancesAdder.createOrUpdateTemporaryInstancesFromObjectNames(
            pos,
            this.props.selectedObjectNames,
            this.props.selectedLayer
          );
        }}
        drop={monitor => {
          this.fpsLimiter.notifyInteractionHappened();

          const { _instancesAdder, viewPosition, canvasArea } = this;
          if (!_instancesAdder || !canvasArea || !viewPosition) return;

          if (monitor.didDrop()) {
            // Drop was done somewhere else (in a child of the canvas:
            // should not happen, but still handling this case).
            _instancesAdder.deleteTemporaryInstances();
            return;
          }

          const { x, y } = monitor.getClientOffset();
          const canvasRect = canvasArea.getBoundingClientRect();
          const pos = viewPosition.toSceneCoordinates(
            x - canvasRect.left,
            y - canvasRect.top
          );
          const instances = _instancesAdder.updateTemporaryInstancePositions(
            pos
          );
          _instancesAdder.commitTemporaryInstances();
          this.props.onInstancesAdded(instances);
        }}
      >
        {({ connectDropTarget, isOver }) => {
          // The children are re-rendered when isOver change:
          // take this opportunity to delete any temporary instances
          // if the dragging is not done anymore over the canvas.
          if (this._instancesAdder && !isOver) {
            this._instancesAdder.deleteTemporaryInstances();
          }

          return connectDropTarget(
            <div
              ref={canvasArea => (this.canvasArea = canvasArea)}
              style={styles.canvasArea}
              id={instancesEditorId}
            />
          );
        }}
      </DropTarget>
    );
  }
}
