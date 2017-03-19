import React, { Component } from 'react';
import gesture from 'pixi-simple-gesture';
import InstancesRenderer from './InstancesRenderer';
import ViewPosition from './ViewPosition';
import SelectedInstances from './SelectedInstances';
import KeyboardShortcuts from './KeyboardShortcuts';
import HighlightedInstance from './HighlightedInstance';
import SelectionRectangle from './SelectionRectangle';
import InstancesResizer from './InstancesResizer';
import InstancesMover from './InstancesMover';
import Grid from './Grid';
import ResourcesLoader from '../ObjectsRendering/ResourcesLoader';
const gd = global.gd;
import PIXI from 'pixi.js';

/**
 * Convert a rgb color value to a hex value.
 * @note No "#" or "0x" are added.
 * @static
 */
const rgbToHex = (r, g, b) =>
  '' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

export default class InstancesEditorContainer extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this.zOrderFinder = new gd.HighestZOrderFinder();
    this.pixiRenderer = PIXI.autoDetectRenderer(
      this.props.width,
      this.props.height
    );
    this.refs.canvasArea.appendChild(this.pixiRenderer.view);
    this.pixiRenderer.view.addEventListener('contextmenu', e => {
      e.preventDefault();
    });
    this.pixiRenderer.view.addEventListener('click', e => {
      this._onClick(e.offsetX, e.offsetY);
    });
    this.pixiRenderer.view.onmousewheel = event => {
      if (this.keyboardShortcuts.shouldZoom()) {
        this.viewPosition.zoomBy(event.wheelDelta / 5000);
      } else if (this.keyboardShortcuts.shouldScrollHorizontally()) {
        this.viewPosition.scrollBy((-event.wheelDelta) / 20, 0);
      } else {
        this.viewPosition.scrollBy(0, (-event.wheelDelta) / 20);
      }
      event.preventDefault();
    };
    this.pixiRenderer.view.setAttribute('tabIndex', 1);

    this.pixiContainer = new PIXI.Container();

    this.backgroundArea = new PIXI.Container();
    this.backgroundArea.hitArea = new PIXI.Rectangle(
      0,
      0,
      this.props.width,
      this.props.height
    );
    gesture.panable(this.backgroundArea);
    this.backgroundArea.on('mousedown', this._onBackgroundClicked);
    this.backgroundArea.on('panmove', event =>
      this._onMakeSelectionRectangle(event.data.global.x, event.data.global.y));
    this.backgroundArea.on('panend', event => this._onEndSelectionRectangle());
    this.pixiContainer.addChild(this.backgroundArea);

    this.viewPosition = new ViewPosition({
      width: this.props.width,
      height: this.props.height,
    });
    this.pixiContainer.addChild(this.viewPosition.getPixiContainer());

    this.grid = new Grid({
      viewPosition: this.viewPosition,
      options: this.props.options,
    });
    this.pixiContainer.addChild(this.grid.getPixiObject());

    this.keyboardShortcuts = new KeyboardShortcuts({
      domElement: this.pixiRenderer.view,
      onDelete: this.deleteSelection,
      onMove: this.moveSelection,
    });

    this._mountEditorComponents(this.props);
    this.renderScene();
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

    this.instancesRenderer = new InstancesRenderer({
      project: props.project,
      layout: props.layout,
      instances: props.initialInstances,
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

    this.pixiContainer.addChild(this.selectionRectangle.getPixiObject());
    this.viewPosition
      .getPixiContainer()
      .addChild(this.instancesRenderer.getPixiContainer());
    this.pixiContainer.addChild(this.highlightedInstance.getPixiObject());
    this.pixiContainer.addChild(this.selectedInstances.getPixiContainer());
  }

  componentWillUnmount() {
    this.keyboardShortcuts.unmount();
    this.zOrderFinder.delete();
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
    }

    if (nextProps.options !== this.props.options) {
      this.grid.setOptions(nextProps.options);
      this.instancesMover.setOptions(nextProps.options);
      this.instancesResizer.setOptions(nextProps.options);
    }

    if (
      this.props.layout !== nextProps.layout ||
      this.props.initialInstances !== nextProps.initialInstances ||
      this.props.project !== nextProps.project
    ) {
      this._mountEditorComponents(nextProps);
    }
  }

  _onBackgroundClicked = () => {
    if (!this.keyboardShortcuts.shouldMultiSelect()) {
      this.props.instancesSelection.clearSelection();
      this.props.onInstancesSelected([]);
    }
  };

  _onMakeSelectionRectangle = (x, y) => {
    this.selectionRectangle.makeSelectionRectangle(x, y);
  };

  _onEndSelectionRectangle = () => {
    const instancesSelected = this.selectionRectangle.endSelectionRectangle();
    this.props.instancesSelection.selectInstances(
      instancesSelected,
      this.keyboardShortcuts.shouldMultiSelect()
    );
    this.props.onInstancesSelected(instancesSelected);
  };

  _onInstanceClicked = instance => {};

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
    const sceneDeltaX = deltaX / this.viewPosition.getZoomFactor();
    const sceneDeltaY = deltaY / this.viewPosition.getZoomFactor();

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

  _onPanMoveView = (deltaX, deltaY) => {
    const sceneDeltaX = deltaX / this.viewPosition.getZoomFactor();
    const sceneDeltaY = deltaY / this.viewPosition.getZoomFactor();

    if (this.highlightedInstance.getInstance() === null)
      this.viewPosition.scrollBy(-sceneDeltaX, -sceneDeltaY);
  };

  _onResize = (deltaX, deltaY) => {
    const sceneDeltaX = deltaX / this.viewPosition.getZoomFactor();
    const sceneDeltaY = deltaY / this.viewPosition.getZoomFactor();

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
    if (!this.props.selectedObjectName) return;

    const instance = this.props.initialInstances.insertNewInitialInstance();
    instance.setObjectName(this.props.selectedObjectName);

    const newPos = this.viewPosition.toSceneCoordinates(x, y);
    instance.setX(newPos[0]);
    instance.setY(newPos[1]);

    this.props.initialInstances.iterateOverInstances(this.zOrderFinder);
    instance.setZOrder(this.zOrderFinder.getHighestZOrder() + 1);

    if (this.props.onNewInstanceAdded) this.props.onNewInstanceAdded(instance);
  };

  deleteSelection = () => {
    //TODO: move?
    const selectedInstances = this.props.instancesSelection.getSelectedInstances();
    for (let i = 0; i < selectedInstances.length; i++)
      this.props.initialInstances.removeInstance(selectedInstances[i]);

    this.props.instancesSelection.clearSelection();
    this.highlightedInstance.setInstance(null);
    this.props.onInstancesSelected([]);
  };

  moveSelection = (x, y) => {
    const selectedInstances = this.props.instancesSelection.getSelectedInstances();
    selectedInstances.forEach(instance => {
      instance.setX(instance.getX() + x);
      instance.setY(instance.getY() + y);
    });
    this.props.onInstancesMoved(selectedInstances);
  };

  centerViewOn(instances) {
    if (!instances.length) return;

    this.viewPosition.scrollTo(instances[instances.length - 1]);
  }

  setZoomFactor = zoomFactor => {
    this.viewPosition.setZoomFactor(zoomFactor);
  };

  renderScene = () => {
    const { layout } = this.props;
    this.pixiRenderer.backgroundColor = parseInt(
      parseInt(
        rgbToHex(
          layout.getBackgroundColorRed(),
          layout.getBackgroundColorGreen(),
          layout.getBackgroundColorBlue()
        ),
        16
      ),
      10
    );

    this.viewPosition.render();
    this.grid.render();
    this.instancesRenderer.render();
    this.highlightedInstance.render();
    this.selectedInstances.render();
    this.selectionRectangle.render();
    this.pixiRenderer.render(this.pixiContainer);
    this.nextFrame = requestAnimationFrame(this.renderScene);
  };

  render() {
    if (!this.props.project) return null;

    return (
      <div
        ref="canvasArea"
        style={{ flex: 1, position: 'absolute', overflow: 'hidden' }}
      />
    );
  }
}
