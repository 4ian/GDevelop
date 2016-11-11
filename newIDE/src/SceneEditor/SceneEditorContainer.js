import React, { Component } from 'react';
const gd = global.gd;
const gdjs = global.gdjs;

import gameData from '../fixtures/game.json';

export default class SceneEditorContainer extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    gdjs.registerObjects();
    gdjs.registerBehaviors();
    gdjs.registerGlobalCallbacks();

    var game = new gdjs.RuntimeGame(gameData, {}/*GDJS_ADDITIONAL_SPEC*/);

    //Create a renderer
    game.getRenderer().createStandardCanvas(this.refs.canvasArea);

    //Bind keyboards/mouse/touch events
    game.getRenderer().bindStandardEvents(game.getInputManager(), window, document);

    //Load all assets and start the game
    game.loadAllAssets(() => {
        //game.startGameLoop(); Nope

        //Instead, "start Editor Loop":
        game._sceneStack.push(this.props.layout.getName());
        game._sceneStack.renderWithoutStep();
    });
  }

  render() {
    const {project, layout, initialInstances} = this.props;
    if (!project) return null;

    return (
      <div>
        Hello
        <div ref="canvasArea" />
      </div>
    )
  }
}
