module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],
    browserNoActivityTimeout: 400000,
    files: [
      'node_modules/expect.js/index.js',

      //GDJS game engine files: (Order is important)
      '../Runtime-bundled/libs/jshashtable.js',
      '../Runtime-bundled/gd.js',
      '../Runtime-bundled/libs/hshg.js',
      '../Runtime-bundled/libs/rbush.js',
      '../Runtime-bundled/cocos-renderers/cocos-director-manager.js',
      '../Runtime-bundled/pixi-renderers/pixi.js',
      '../Runtime-bundled/pixi-renderers/*.js',
      '../Runtime-bundled/howler-sound-manager/howler.min.js',
      '../Runtime-bundled/howler-sound-manager/howler-sound-manager.js',
      '../Runtime-bundled/fontfaceobserver-font-manager/fontfaceobserver.js',
      '../Runtime-bundled/fontfaceobserver-font-manager/fontfaceobserver-font-manager.js',
      '../Runtime-bundled/jsonmanager.js',
      '../Runtime-bundled/timemanager.js',
      '../Runtime-bundled/runtimeobject.js',
      '../Runtime-bundled/runtimescene.js',
      '../Runtime-bundled/scenestack.js',
      '../Runtime-bundled/profiler.js',
      '../Runtime-bundled/polygon.js',
      '../Runtime-bundled/force.js',
      '../Runtime-bundled/layer.js',
      '../Runtime-bundled/timer.js',
      '../Runtime-bundled/inputmanager.js',
      '../Runtime-bundled/runtimegame.js',
      '../Runtime-bundled/variable.js',
      '../Runtime-bundled/variablescontainer.js',
      '../Runtime-bundled/oncetriggers.js',
      '../Runtime-bundled/runtimebehavior.js',
      '../Runtime-bundled/spriteruntimeobject.js',
      '../Runtime-bundled/events-tools/commontools.js',
      '../Runtime-bundled/events-tools/runtimescenetools.js',
      '../Runtime-bundled/events-tools/inputtools.js',
      '../Runtime-bundled/events-tools/networktools.js',
      '../Runtime-bundled/events-tools/objecttools.js',
      '../Runtime-bundled/events-tools/cameratools.js',
      '../Runtime-bundled/events-tools/soundtools.js',
      '../Runtime-bundled/events-tools/storagetools.js',
      '../Runtime-bundled/events-tools/stringtools.js',
      '../Runtime-bundled/events-tools/windowtools.js',
      '../Runtime-bundled/websocket-debugger-client/hot-reloader.js',

      //Extensions:
      '../Runtime-bundled/Extensions/DraggableBehavior/draggableruntimebehavior.js',
      '../Runtime-bundled/Extensions/PlatformBehavior/platformerobjectruntimebehavior.js',
      '../Runtime-bundled/Extensions/PlatformBehavior/platformruntimebehavior.js',
      '../Runtime-bundled/Extensions/LinkedObjects/linkedobjects.js',
      '../Runtime-bundled/Extensions/Inventory/inventory.js',
      '../Runtime-bundled/Extensions/Inventory/inventorytools.js',
      '../Runtime-bundled/Extensions/Lighting/lightruntimeobject.js',
      '../Runtime-bundled/Extensions/Lighting/lightruntimeobject-pixi-renderer.js',
      '../Runtime-bundled/Extensions/Lighting/lightobstacleruntimebehavior.js',

      // Test extensions:
      './tests/Extensions/**.js',

      //All tests files:
      './tests-utils/init.pixiruntimegamewithassets.js',
      '../../Extensions/**/tests/**.spec.js',
      './tests/**/*.js',

      //All benchmark files:
      './benchmarks/init.js',
      './benchmarks/**/*.js',

      // Assets
      {pattern: './tests-utils/assets/*.jpg', watched: false, included: false, served: true, nocache: false}
    ]
  });
};
