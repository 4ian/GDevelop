
    console.log("bootstrap");
(function () {
    console.log("bootstrap");
  //Initialization
  var game = new gdjs.RuntimeGame(
    gdjs.projectData,
    {} /*GDJS_ADDITIONAL_SPEC*/
  );

  //Create a renderer
  game.getRenderer().createStandardCanvas(document.body);

  //Bind keyboards/mouse/touch events
  game
    .getRenderer()
    .bindStandardEvents(game.getInputManager(), window, document);

  //Load all assets and start the game
  game.loadAllAssets(function () {
    game.startGameLoop();
  });
})();
