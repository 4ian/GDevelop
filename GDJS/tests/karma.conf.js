module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],

    files: [
      'node_modules/expect.js/index.js',

      //GDJS game engine files: (Order is important)
      '../Runtime/libs/jshashtable.js',
      '../Runtime/gd.js',
      '../Runtime/libs/hshg.js',
      '../Runtime/libs/rbush.js',
      '../Runtime/cocos-renderers/cocos-director-manager.js',
      '../Runtime/pixi-renderers/pixi.js',
      '../Runtime/pixi-renderers/*.js',
      '../Runtime/howler-sound-manager/howler.min.js',
      '../Runtime/howler-sound-manager/howler-sound-manager.js',
      '../Runtime/fontfaceobserver-font-manager/fontfaceobserver.js',
      '../Runtime/fontfaceobserver-font-manager/fontfaceobserver-font-manager.js',
      '../Runtime/jsonmanager.js',
      '../Runtime/bitmapfontmanager.js',
      '../Runtime/timemanager.js',
      '../Runtime/runtimeobject.js',
      '../Runtime/runtimescene.js',
      '../Runtime/scenestack.js',
      '../Runtime/profiler.js',
      '../Runtime/polygon.js',
      '../Runtime/force.js',
      '../Runtime/layer.js',
      '../Runtime/timer.js',
      '../Runtime/inputmanager.js',
      '../Runtime/runtimegame.js',
      '../Runtime/variable.js',
      '../Runtime/variablescontainer.js',
      '../Runtime/oncetriggers.js',
      '../Runtime/runtimebehavior.js',
      '../Runtime/spriteruntimeobject.js',
      '../Runtime/events-tools/commontools.js',
      '../Runtime/events-tools/runtimescenetools.js',
      '../Runtime/events-tools/inputtools.js',
      '../Runtime/events-tools/networktools.js',
      '../Runtime/events-tools/objecttools.js',
      '../Runtime/events-tools/cameratools.js',
      '../Runtime/events-tools/soundtools.js',
      '../Runtime/events-tools/storagetools.js',
      '../Runtime/events-tools/stringtools.js',
      '../Runtime/events-tools/windowtools.js',
      '../Runtime/websocket-debugger-client/hot-reloader.js',

      //Extensions:
      '../../Extensions/DraggableBehavior/draggableruntimebehavior.js',
      '../../Extensions/PlatformBehavior/platformerobjectruntimebehavior.js',
      '../../Extensions/PlatformBehavior/platformruntimebehavior.js',
      '../../Extensions/LinkedObjects/linkedobjects.js',
      '../../Extensions/Inventory/inventory.js',
      '../../Extensions/Inventory/inventorytools.js',
      '../../Extensions/Lighting/lightruntimeobject.js',
      '../../Extensions/Lighting/lightruntimeobject-pixi-renderer.js',
      '../../Extensions/Lighting/lightobstacleruntimebehavior.js',

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
