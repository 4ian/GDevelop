import React, { Component } from 'react';

import RaisedButton from 'material-ui/RaisedButton';

import SceneRenderer from './SceneRenderer';
import ViewPosition from './ViewPosition';
import InstancesSelection from './InstancesSelection';
import KeyboardShortcuts from './KeyboardShortcuts';
import HighlightedInstance from './HighlightedInstance';
const gd = global.gd;
const PIXI = global.PIXI;

import gameData from '../fixtures/game.json';

/**
 * Convert a rgb color value to a hex value.
 * @note No "#" or "0x" are added.
 * @static
 */
const rgbToHex = (r, g, b) => "" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

export default class SceneEditorContainer extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this.pixiRenderer = PIXI.autoDetectRenderer(500, 500);
    this.refs.canvasArea.appendChild(this.pixiRenderer.view);
    this.pixiRenderer.view.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    this.pixiContainer = new PIXI.Container();
    this.viewPosition = new ViewPosition({
      onPanMoveView: this._onPanMoveView,
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
    this.instancesSelection = new InstancesSelection({
      getInstanceWidth: this.sceneRenderer.getInstanceWidth,
      getInstanceHeight: this.sceneRenderer.getInstanceHeight,
    });
    this.highlightedInstance = new HighlightedInstance({
      getInstanceWidth: this.sceneRenderer.getInstanceWidth,
      getInstanceHeight: this.sceneRenderer.getInstanceHeight,
    });
    this.keyboardShortcuts = new KeyboardShortcuts();

    this.pixiContainer.addChild(this.viewPosition.getPixiContainer());
    this.viewPosition.getPixiContainer().addChild(this.sceneRenderer.getPixiContainer());
    this.viewPosition.getPixiContainer().addChild(this.highlightedInstance.getPixiObject());
    this.viewPosition.getPixiContainer().addChild(this.instancesSelection.getPixiContainer());

    this.renderScene();
  }

  componentWillUnmount() {
    this.keyboardShortcuts.unmount();
    if (this.nextFrame) cancelAnimationFrame(this.nextFrame);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.layout !== nextProps.layout ||
      this.props.initialInstances !== nextProps.initialInstances ||
      this.props.project !== nextProps.project)
      throw new Error("Changing project/layout/initialInstances is not supported yet")
  }

  _onInstanceClicked = (instance) => {
    if (!this.keyboardShortcuts.shouldMultiSelect())
      this.instancesSelection.clearSelection();
    this.instancesSelection.selectInstance(instance);
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
    this.pixiRenderer.render(this.pixiContainer);
    this.nextFrame = requestAnimationFrame(this.renderScene);
  }

  render() {
    const {project, layout, initialInstances} = this.props;
    if (!project) return null;

    return (
      <div>
        <RaisedButton label="Delete selection" onClick={this.deleteSelection} />
        <div ref="canvasArea" />
      </div>
    )
  }
}
