import React, { Component } from 'react';
import gesture from 'pixi-simple-gesture';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
import SimpleDropTarget from '../Utils/DragDropHelpers/SimpleDropTarget';
import InstancesRenderer from './InstancesRenderer';
import ViewPosition from './ViewPosition';
import SelectedInstances from './SelectedInstances';
import HighlightedInstance from './HighlightedInstance';
import SelectionRectangle from './SelectionRectangle';
import InstancesResizer from './InstancesResizer';
import InstancesMover from './InstancesMover';
import Grid from './Grid';
import WindowBorder from './WindowBorder';
import WindowMask from './WindowMask';
import DropHandler from './DropHandler';
import BackgroundColor from './BackgroundColor';
import PIXI from 'pixi.js';
import FpsLimiter from './FpsLimiter';

export default class InstancesEditorContainer extends Component {
  constructor() {
    super();

    this.lastContextMenuX = 0;
    this.lastContextMenuY = 0;
    this.lastCursorX = 0;
    this.lastCursorY = 0;

    this.fpsLimiter = new FpsLimiter(28);
  }

  componentDidMount() {
    this.pixiRenderer = PIXI.autoDetectRenderer(
      this.props.width,
      this.props.height
    );
    this.canvasArea.appendChild(this.pixiRenderer.view);
    this.pixiRenderer.view.addEventListener('contextmenu', e => {
      e.preventDefault();

      this.lastContextMenuX = e.offsetX;
      this.lastContextMenuY = e.offsetY;
      if (this.props.onContextMenu)
        this.props.onContextMenu(e.clientX, e.clientY);

      return false;
    });
    this.pixiRenderer.view.addEventListener('click', e => {
      this._onClick(e.offsetX, e.offsetY);
    });
    this.pixiRenderer.view.onmousewheel = event => {
      if (this.keyboardShortcuts.shouldZoom()) {
        this.zoomBy(event.wheelDelta / 5000);
      } else if (this.keyboardShortcuts.shouldScrollHorizontally()) {
        this.viewPosition.scrollBy(-event.wheelDelta / 20, 0);
      } else {
        this.viewPosition.scrollBy(0, -event.wheelDelta / 20);
      }

      if (this.props.onViewPositionChanged) {
        this.props.onViewPositionChanged(this.viewPosition);
      }
      event.preventDefault();
    };
    this.pixiRenderer.view.setAttribute('tabIndex', -1);
    this.pixiRenderer.view.addEventListener('focus', e => {
      this.keyboardShortcuts.focus();
    });
    this.pixiRenderer.view.addEventListener('blur', e => {
      this.keyboardShortcuts.blur();
    });

    this.pixiContainer = new PIXI.Container();

    this.backgroundArea = new PIXI.Container();
    this.backgroundArea.hitArea = new PIXI.Rectangle(
      0,
      0,
      this.props.width,
      this.props.height
    );
    gesture.panable(this.backgroundArea);
    this.backgroundArea.on('mousedown', event =>
      this._onBackgroundClicked(event.data.global.x, event.data.global.y)
    );
    this.backgroundArea.on('touchstart', event =>
      this._onBackgroundClicked(event.data.global.x, event.data.global.y)
    );
    this.backgroundArea.on('mousemove', event =>
      this._onMouseMove(event.data.global.x, event.data.global.y)
    );
    this.backgroundArea.on('panmove', event =>
      this._onPanMove(
        event.deltaX,
        event.deltaY,
        event.data.global.x,
        event.data.global.y
      )
    );
    this.backgroundArea.on('panend', event => this._onEndSelectionRectangle());
    this.pixiContainer.addChild(this.backgroundArea);

    this.viewPosition = new ViewPosition({
      width: this.props.width,
      height: this.props.height,
      options: this.props.options,
    });
    this.pixiContainer.addChild(this.viewPosition.getPixiContainer());

    this.grid = new Grid({
      viewPosition: this.viewPosition,
      options: this.props.options,
    });
    this.pixiContainer.addChild(this.grid.getPixiObject());

    // TODO: This should probably be moved up in the InstancesFullEditor component.
    this.keyboardShortcuts = new KeyboardShortcuts({
      onDelete: this.props.onDeleteSelection,
      onMove: this.moveSelection,
      onCopy: this.props.onCopy,
      onCut: this.props.onCut,
      onPaste: this.props.onPaste,
      onUndo: this.props.onUndo,
      onRedo: this.props.onRedo,
      onZoomOut: this.props.onZoomOut,
      onZoomIn: this.props.onZoomIn,
    });

    this.dropHandler = new DropHandler({
      canvas: this.canvasArea,
      onDrop: this._onDrop,
    });

    this._mountEditorComponents(this.props);
    this._renderScene();
  }

  /**
   * Force the internal InstancesRenderer to be destroyed and recreated
   * (as well as other components holding references to instances). Call
   * this when the initial instances were recreated to ensure that there
   * is not mismatch between renderers and the instances that were updated.
   */
  forceRemount() {
    this._mountEditorComponents(this.props);
  }

  _mountEditorComponents(props) {
    //Remove and delete any existing editor component
    if (this.highlightedInstance) {
      this.pixiContainer.removeChild(this.highlightedInstance.getPixiObject());
    }
    if (this.selectedInstances) {
      this.pixiContainer.removeChild(this.selectedInstances.getPixiContainer());
    }
    if (this.instancesRenderer) {
      this.viewPosition
        .getPixiContainer()
        .removeChild(this.instancesRenderer.getPixiContainer());
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

    this.backgroundColor = new BackgroundColor({
      layout: props.layout,
      pixiRenderer: this.pixiRenderer,
    });
    this.instancesRenderer = new InstancesRenderer({
      project: props.project,
      layout: props.layout,
      instances: props.initialInstances,
      viewPosition: this.viewPosition,
      onOverInstance: this._onOverInstance,
      onMoveInstance: this._onMoveInstance,
      onMoveInstanceEnd: this._onMoveInstanceEnd,
      onDownInstance: this._onDownInstance,
      onOutInstance: this._onOutInstance,
      onInstanceClicked: this._onInstanceClicked,
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
      instanceMeasurer: this.instancesRenderer.getInstanceMeasurer(),
      toCanvasCoordinates: this.viewPosition.toCanvasCoordinates,
    });
    this.highlightedInstance = new HighlightedInstance({
      instanceMeasurer: this.instancesRenderer.getInstanceMeasurer(),
      toCanvasCoordinates: this.viewPosition.toCanvasCoordinates,
    });
    this.instancesResizer = new InstancesResizer({
      instanceMeasurer: this.instancesRenderer.getInstanceMeasurer(),
      options: this.props.options,
    });
    this.instancesMover = new InstancesMover({
      instanceMeasurer: this.instancesRenderer.getInstanceMeasurer(),
      options: this.props.options,
    });
    this.windowBorder = new WindowBorder({
      project: props.project,
      toCanvasCoordinates: this.viewPosition.toCanvasCoordinates,
    });
    this.windowMask = new WindowMask({
      project: props.project,
      viewPosition: this.viewPosition,
      options: this.props.options,
    });

    this.pixiContainer.addChild(this.selectionRectangle.getPixiObject());
    this.viewPosition
      .getPixiContainer()
      .addChild(this.instancesRenderer.getPixiContainer());
    this.pixiContainer.addChild(this.windowBorder.getPixiObject());
    this.pixiContainer.addChild(this.windowMask.getPixiObject());
    this.pixiContainer.addChild(this.selectedInstances.getPixiContainer());
    this.pixiContainer.addChild(this.highlightedInstance.getPixiObject());
  }

  componentWillUnmount() {
    // This is an antipattern and is theorically not needed, but help
    // to protect against renders after the component is unmounted.
    this._unmounted = true;

    this.keyboardShortcuts.unmount();
    this.selectionRectangle.delete();
    this.instancesRenderer.delete();
    if (this.nextFrame) cancelAnimationFrame(this.nextFrame);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.width !== this.props.width ||
      nextProps.height !== this.props.height
    ) {
      this.pixiRenderer.resize(nextProps.width, nextProps.height);
      this.viewPosition.resize(nextProps.width, nextProps.height);
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

    if (nextProps.options !== this.props.options) {
      this.grid.setOptions(nextProps.options);
      this.instancesMover.setOptions(nextProps.options);
      this.instancesResizer.setOptions(nextProps.options);
      this.windowMask.setOptions(nextProps.options);
      this.viewPosition.setOptions(nextProps.options);
    }

    if (
      this.props.layout !== nextProps.layout ||
      this.props.initialInstances !== nextProps.initialInstances ||
      this.props.project !== nextProps.project
    ) {
      this._mountEditorComponents(nextProps);
    }
  }

  zoomBy(value) {
    this.setZoomFactor(this.getZoomFactor() + value);
  }

  getZoomFactor() {
    return this.props.options.zoomFactor;
  }

  setZoomFactor(zoomFactor) {
    this.props.onChangeOptions({
      zoomFactor: Math.max(Math.min(zoomFactor, 10), 0.01),
    });
  }

  _onMouseMove = (x, y) => {
    this.lastCursorX = x;
    this.lastCursorY = y;
  };

  _onBackgroundClicked = (x, y) => {
    this.lastCursorX = x;
    this.lastCursorY = y;
    this.pixiRenderer.view.focus();

    if (!this.keyboardShortcuts.shouldMultiSelect()) {
      this.props.instancesSelection.clearSelection();
      this.props.onInstancesSelected([]);
    }
  };

  _onPanMove = (deltaX, deltaY, x, y) => {
    if (this.keyboardShortcuts.shouldMoveView()) {
      const sceneDeltaX = deltaX / this.getZoomFactor();
      const sceneDeltaY = deltaY / this.getZoomFactor();

      this.viewPosition.scrollBy(-sceneDeltaX, -sceneDeltaY);

      if (this.props.onViewPositionChanged) {
        this.props.onViewPositionChanged(this.viewPosition);
      }
    } else {
      this.selectionRectangle.makeSelectionRectangle(x, y);
    }
  };

  _onEndSelectionRectangle = () => {
    const instancesSelected = this.selectionRectangle.endSelectionRectangle();
    this.props.instancesSelection.selectInstances(
      instancesSelected,
      this.keyboardShortcuts.shouldMultiSelect()
    );
    this.props.onInstancesSelected(instancesSelected);
  };

  _onInstanceClicked = instance => {
    this.pixiRenderer.view.focus();
  };

  _onOverInstance = instance => {
    this.highlightedInstance.setInstance(instance);
  };

  _onDownInstance = instance => {
    if (this.keyboardShortcuts.shouldCloneInstances()) {
      const selectedInstances = this.props.instancesSelection.getSelectedInstances();
      for (var i = 0; i < selectedInstances.length; i++) {
        const instance = selectedInstances[i];
        this.props.initialInstances.insertInitialInstance(instance);
      }
    } else {
      this.props.instancesSelection.selectInstance(
        instance,
        this.keyboardShortcuts.shouldMultiSelect()
      );

      if (this.props.onInstancesSelected) {
        this.props.onInstancesSelected(
          this.props.instancesSelection.getSelectedInstances()
        );
      }
    }
  };

  _onOutInstance = instance => {
    if (instance === this.highlightedInstance.getInstance())
      this.highlightedInstance.setInstance(null);
  };

  _onMoveInstance = (instance, deltaX, deltaY) => {
    const sceneDeltaX = deltaX / this.getZoomFactor();
    const sceneDeltaY = deltaY / this.getZoomFactor();

    if (this.keyboardShortcuts.shouldMoveView()) {
      this.viewPosition.scrollBy(-sceneDeltaX, -sceneDeltaY);

      if (this.props.onViewPositionChanged) {
        this.props.onViewPositionChanged(this.viewPosition);
      }
      return;
    }

    if (!this.props.instancesSelection.isInstanceSelected(instance)) {
      this._onInstanceClicked(instance);
    }

    const selectedInstances = this.props.instancesSelection.getSelectedInstances();
    this.instancesMover.moveBy(
      selectedInstances,
      sceneDeltaX,
      sceneDeltaY,
      this.keyboardShortcuts.shouldFollowAxis()
    );
  };

  _onMoveInstanceEnd = () => {
    this.instancesMover.endMove();

    const selectedInstances = this.props.instancesSelection.getSelectedInstances();
    this.props.onInstancesMoved(selectedInstances);
  };

  _onResize = (deltaX, deltaY) => {
    const sceneDeltaX = deltaX / this.getZoomFactor();
    const sceneDeltaY = deltaY / this.getZoomFactor();

    const selectedInstances = this.props.instancesSelection.getSelectedInstances();
    this.instancesResizer.resizeBy(
      selectedInstances,
      sceneDeltaX,
      sceneDeltaY,
      this.keyboardShortcuts.shouldResizeProportionally()
    );
  };

  _onResizeEnd = () => {
    this.instancesResizer.endResize();
  };

  _onClick = (x, y) => {
    const newPos = this.viewPosition.toSceneCoordinates(x, y);
    if (this.props.onAddInstance) {
      this.props.onAddInstance(newPos[0], newPos[1]);
    }
  };

  _onDrop = (x, y, objectName) => {
    const newPos = this.viewPosition.toSceneCoordinates(x, y);
    if (this.props.onAddInstance) {
      this.props.onAddInstance(newPos[0], newPos[1], objectName);
    }
  };

  clearHighlightedInstance = () => {
    this.highlightedInstance.setInstance(null);
  };

  moveSelection = (x, y) => {
    const selectedInstances = this.props.instancesSelection.getSelectedInstances();
    selectedInstances.forEach(instance => {
      instance.setX(instance.getX() + x);
      instance.setY(instance.getY() + y);
    });
    this.props.onInstancesMoved(selectedInstances);
  };

  scrollTo(x, y) {
    this.viewPosition.scrollTo(x, y);
  }

  centerViewOn(instances) {
    if (!instances.length) return;

    this.viewPosition.scrollToInstance(instances[instances.length - 1]);
    if (this.props.onViewPositionChanged) {
      this.props.onViewPositionChanged(this.viewPosition);
    }
  }

  getLastContextMenuPosition = () => {
    return this.viewPosition.toSceneCoordinates(
      this.lastContextMenuX,
      this.lastContextMenuY
    );
  };

  getLastCursorPosition = () => {
    return this.viewPosition.toSceneCoordinates(
      this.lastCursorX,
      this.lastCursorY
    );
  };

  getViewPosition = () => {
    return this.viewPosition;
  };

  _renderScene = () => {
    // Protect against rendering scheduled after the component is unmounted.
    if (this._unmounted) return;

    // Avoid killing the CPU by limiting the rendering calls.
    if (this.fpsLimiter.shouldUpdate()) {
      this.backgroundColor.render();
      this.viewPosition.render();
      this.grid.render();
      this.instancesRenderer.render();
      this.highlightedInstance.render();
      this.selectedInstances.render();
      this.selectionRectangle.render();
      this.windowBorder.render();
      this.windowMask.render();
      this.pixiRenderer.render(this.pixiContainer);
    }
    this.nextFrame = requestAnimationFrame(this._renderScene);
  };

  render() {
    if (!this.props.project) return null;

    return (
      <SimpleDropTarget>
        <div
          ref={canvasArea => (this.canvasArea = canvasArea)}
          style={{ flex: 1, position: 'absolute', overflow: 'hidden' }}
        />
      </SimpleDropTarget>
    );
  }
}
