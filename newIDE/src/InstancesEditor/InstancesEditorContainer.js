import React, { Component } from 'react';
import gesture from 'pixi-simple-gesture';
import SceneRenderer from './SceneRenderer';
import ViewPosition from './ViewPosition';
import InstancesSelection from './InstancesSelection';
import KeyboardShortcuts from './KeyboardShortcuts';
import HighlightedInstance from './HighlightedInstance';
import SelectionRectangle from './SelectionRectangle';
const gd = global.gd;
const PIXI = global.PIXI;

import gameData from '../fixtures/game.json';

/**
 * Convert a rgb color value to a hex value.
 * @note No "#" or "0x" are added.
 * @static
 */
const rgbToHex = (r, g, b) => "" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

export default class InstancesEditorContainer extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this.zOrderFinder = new gd.HighestZOrderFinder();
    this.pixiRenderer = PIXI.autoDetectRenderer(this.props.width, this.props.height);
    this.refs.canvasArea.appendChild(this.pixiRenderer.view);
    this.pixiRenderer.view.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
    this.pixiRenderer.view.addEventListener('click', (e) => {
      this._onClick(e.offsetX, e.offsetY);
    });

    this.backgroundArea = new PIXI.Container();
    this.backgroundArea.hitArea = new PIXI.Rectangle(0, 0, this.props.width, this.props.height);
    gesture.panable(this.backgroundArea);
    this.backgroundArea.on('mousedown', this._onBackgroundClicked);
    this.backgroundArea.on('panmove', (event) => this._onMakeSelectionRectangle(event.data.global.x, event.data.global.y));
    this.backgroundArea.on('panend', (event) => this._onEndSelectionRectangle());

    this.pixiRenderer.view.onmousewheel = (event) => {
      if (this.keyboardShortcuts.shouldZoom()) {
        this.viewPosition.zoomBy(event.wheelDelta / 5000);
      } else if (this.keyboardShortcuts.shouldScrollHorizontally()) {
        this.viewPosition.scrollBy(-event.wheelDelta / 20, 0);
      } else {
        this.viewPosition.scrollBy(0, -event.wheelDelta / 20);
      }
      event.preventDefault();
    };

    this.pixiContainer = new PIXI.Container();
    this.viewPosition = new ViewPosition({
      width: this.props.width,
      height: this.props.height
    });
    this.sceneRenderer = new SceneRenderer({
      project: this.props.project,
      layout: this.props.layout,
      instances: this.props.initialInstances,
      onOverInstance: this._onOverInstance,
      onMoveInstance: this._onMoveInstance,
      onDownInstance: this._onDownInstance,
      onOutInstance: this._onOutInstance,
      onInstanceClicked: this._onInstanceClicked,
    });
    this.selectionRectangle = new SelectionRectangle({
      instances: this.props.initialInstances,
      getInstanceWidth: this.sceneRenderer.getInstanceWidth,
      getInstanceHeight: this.sceneRenderer.getInstanceHeight,
      toSceneCoordinates: this.viewPosition.toSceneCoordinates,
    });
    this.instancesSelection = new InstancesSelection({
      getInstanceWidth: this.sceneRenderer.getInstanceWidth,
      getInstanceHeight: this.sceneRenderer.getInstanceHeight,
      onResize: this._onResize,
      toCanvasCoordinates: this.viewPosition.toCanvasCoordinates,
    });
    this.highlightedInstance = new HighlightedInstance({
      getInstanceWidth: this.sceneRenderer.getInstanceWidth,
      getInstanceHeight: this.sceneRenderer.getInstanceHeight,
      toCanvasCoordinates: this.viewPosition.toCanvasCoordinates,
    });
    this.keyboardShortcuts = new KeyboardShortcuts();

    this.pixiContainer.addChild(this.backgroundArea);
    this.pixiContainer.addChild(this.viewPosition.getPixiContainer());
    this.pixiContainer.addChild(this.selectionRectangle.getPixiObject());
    this.viewPosition.getPixiContainer().addChild(this.sceneRenderer.getPixiContainer());
    this.pixiContainer.addChild(this.highlightedInstance.getPixiObject());
    this.pixiContainer.addChild(this.instancesSelection.getPixiContainer());

    this.renderScene();
  }

  componentWillUnmount() {
    this.keyboardShortcuts.unmount();
    this.zOrderFinder.delete();
    if (this.nextFrame) cancelAnimationFrame(this.nextFrame);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.width !== this.props.width || nextProps.height !== this.props.height) {
      this.pixiRenderer.resize(nextProps.width, nextProps.height);
      this.viewPosition.resize(nextProps.width, nextProps.height);
      this.backgroundArea.hitArea = new PIXI.Rectangle(0, 0, nextProps.width, nextProps.height);
    }

    if (this.props.layout !== nextProps.layout ||
      this.props.initialInstances !== nextProps.initialInstances ||
      this.props.project !== nextProps.project)
      throw new Error("Changing project/layout/initialInstances is not supported yet")
  }

  _onBackgroundClicked = () => {
    console.log("Background clicked");
    if (!this.keyboardShortcuts.shouldMultiSelect())
      this.instancesSelection.clearSelection();
  }

  _onMakeSelectionRectangle = (x, y) => {
    this.selectionRectangle.makeSelectionRectangle(x, y);
  }

  _onEndSelectionRectangle = () => {
    const instancesSelected = this.selectionRectangle.endSelectionRectangle();
    instancesSelected.forEach(instance => this.instancesSelection.selectInstance(instance));
  }

  _onInstanceClicked = (instance) => {
    if (!this.keyboardShortcuts.shouldMultiSelect())
      this.instancesSelection.clearSelection();
    this.instancesSelection.selectInstance(instance);

    if (this.props.onInstancesSelected) {
      this.props.onInstancesSelected(this.instancesSelection.getSelectedInstances());
    }
  }

  _onOverInstance = (instance) => {
    this.highlightedInstance.setInstance(instance);
  }

  _onDownInstance = (instance) => {
    if (this.keyboardShortcuts.shouldCloneInstances()) {
      const selectedInstances = this.instancesSelection.getSelectedInstances();
      for (var i = 0;i < selectedInstances.length;i++) {
        const instance = selectedInstances[i];
        this.props.initialInstances.insertInitialInstance(instance);
      }
    }
  }

  _onOutInstance = (instance) => {
    if (instance === this.highlightedInstance.getInstance())
      this.highlightedInstance.setInstance(null);
  }

  _onMoveInstance = (instance, deltaX, deltaY) => {
    if (!this.instancesSelection.isInstanceSelected(instance)) {
      this._onInstanceClicked(instance);
    }

    const selectedInstances = this.instancesSelection.getSelectedInstances();
    for (var i = 0;i < selectedInstances.length;i++) {
      const selectedInstance = selectedInstances[i];

      selectedInstance.setX(selectedInstance.getX() + deltaX);
      selectedInstance.setY(selectedInstance.getY() + deltaY);
    }
  }

  _onPanMoveView = (deltaX, deltaY) => {
    if (this.highlightedInstance.getInstance() === null)
      this.viewPosition.scrollBy(-deltaX, -deltaY);
  }

  _onResize = (deltaX, deltaY) => {
    const selectedInstances = this.instancesSelection.getSelectedInstances();
    for (var i = 0;i < selectedInstances.length;i++) {
      const selectedInstance = selectedInstances[i];

      if (!selectedInstance.hasCustomSize()) {
        selectedInstance.setCustomWidth(this.sceneRenderer.getInstanceWidth(selectedInstance));
        selectedInstance.setCustomHeight(this.sceneRenderer.getInstanceHeight(selectedInstance));
      }

      selectedInstance.setHasCustomSize(true);
      selectedInstance.setCustomWidth(selectedInstance.getCustomWidth() + deltaX);
      selectedInstance.setCustomHeight(selectedInstance.getCustomHeight() + deltaY);
    }
  }

  _onClick = (x, y) => {
    if (!this.props.selectedObjectName) return;

    const instance = this.props.initialInstances.insertNewInitialInstance();
    instance.setObjectName(this.props.selectedObjectName);

    const newPos = this.viewPosition.toSceneCoordinates(x, y);
    instance.setX(newPos[0]);
    instance.setY(newPos[1]);

    this.props.initialInstances.iterateOverInstances(this.zOrderFinder);
    instance.setZOrder(this.zOrderFinder.getHighestZOrder() + 1);

    this.props.onNewInstanceAdded && this.props.onNewInstanceAdded(instance);
  }

  deleteSelection = () => {
    const selectedInstances = this.instancesSelection.getSelectedInstances();
    for (var i in selectedInstances) {
        this.props.initialInstances.removeInstance(selectedInstances[i]);
    }
    this.instancesSelection.clearSelection();
  }

  renderScene = () => {
    const { layout } = this.props;
    this.pixiRenderer.backgroundColor = parseInt(parseInt(rgbToHex(
        layout.getBackgroundColorRed(),
        layout.getBackgroundColorGreen(),
        layout.getBackgroundColorBlue()), 16), 10);

    this.viewPosition.render();
    this.sceneRenderer.render();
    this.highlightedInstance.render();
    this.instancesSelection.render();
    this.selectionRectangle.render();
    this.pixiRenderer.render(this.pixiContainer);
    this.nextFrame = requestAnimationFrame(this.renderScene);
  }

  render() {
    const { project } = this.props;
    if (!project) return null;

    // <RaisedButton label="Delete selection" onClick={this.deleteSelection} />
    // <RaisedButton label="Move" onClick={() => this.viewPosition.scrollBy(50, 40)} />

    return (
      <div style={{flex: 1, display: 'flex', overflow: 'hidden'}}>
        <div ref="canvasArea" style={{flex: 1, display: 'flex', overflow: 'hidden'}} />
      </div>
    )
  }
}
