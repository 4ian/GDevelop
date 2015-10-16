module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],

    files: [
      'node_modules/phantomjs-polyfill/bind-polyfill.js',
      'node_modules/expect.js/index.js',

      //GDJS game engine files: (Order is important)
      '../Runtime/libs/pixi.js',
      '../Runtime/libs/jshashtable.js',
      '../Runtime/libs/howler.min.js',
      '../Runtime/gd.js',
      '../Runtime/libs/hshg.js',
      '../Runtime/commontools.js',
      '../Runtime/timemanager.js',
      '../Runtime/runtimeobject.js',
      '../Runtime/runtimescene.js',
      '../Runtime/scenestack.js',
      '../Runtime/polygon.js',
      '../Runtime/force.js',
      '../Runtime/layer.js',
      '../Runtime/timer.js',
      '../Runtime/imagemanager.js',
      '../Runtime/inputmanager.js',
      '../Runtime/runtimegame.js',
      '../Runtime/variable.js',
      '../Runtime/variablescontainer.js',
      '../Runtime/eventscontext.js',
      '../Runtime/runtimescene.js',
      '../Runtime/runtimebehavior.js',
      '../Runtime/runtimeobject.js',
      '../Runtime/spriteruntimeobject.js',
      '../Runtime/soundmanager.js',
      '../Runtime/runtimescenetools.js',
      '../Runtime/inputtools.js',
      '../Runtime/objecttools.js',
      '../Runtime/cameratools.js',
      '../Runtime/soundtools.js',
      '../Runtime/storagetools.js',
      '../Runtime/stringtools.js',
      '../Runtime/windowtools.js',

      //Extensions:
      '../../Extensions/DraggableBehavior/draggableruntimebehavior.js',
      '../../Extensions/PlatformBehavior/platformerobjectruntimebehavior.js',
      '../../Extensions/PlatformBehavior/platformruntimebehavior.js',
      '../../Extensions/LinkedObjects/linkedobjects.js',

      //All tests files:
      '../../Extensions/**/tests/**.spec.js',
      'tests/**/*.js'
    ]
  });
};
