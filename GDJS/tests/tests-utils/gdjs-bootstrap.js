import * as THREE from '../../../newIDE/app/resources/GDJS/Runtime/pixi-renderers/three.js';
window.THREE = THREE;


const scriptPaths = [
  //GDJS game engine files: (Order is important)
  '/base/newIDE/app/resources/GDJS/Runtime/libs/jshashtable.js',
  '/base/newIDE/app/resources/GDJS/Runtime/logger.js',
  '/base/newIDE/app/resources/GDJS/Runtime/gd.js',
  '/base/newIDE/app/resources/GDJS/Runtime/AsyncTasksManager.js',
  '/base/newIDE/app/resources/GDJS/Runtime/libs/rbush.js',
  '/base/newIDE/app/resources/GDJS/Runtime/pixi-renderers/pixi.js',
  '/base/newIDE/app/resources/GDJS/Runtime/pixi-renderers/pixi-filters-tools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/pixi-renderers/runtimegame-pixi-renderer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/pixi-renderers/runtimescene-pixi-renderer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/pixi-renderers/layer-pixi-renderer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/pixi-renderers/pixi-image-manager.js',
  '/base/newIDE/app/resources/GDJS/Runtime/pixi-renderers/pixi-bitmapfont-manager.js',
  '/base/newIDE/app/resources/GDJS/Runtime/pixi-renderers/spriteruntimeobject-pixi-renderer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/pixi-renderers/CustomRuntimeObject2DPixiRenderer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/pixi-renderers/DebuggerPixiRenderer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/pixi-renderers/loadingscreen-pixi-renderer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/pixi-renderers/pixi-effects-manager.js',
  '/base/newIDE/app/resources/GDJS/Runtime/pixi-renderers/ThreeAddons.js',
  '/base/newIDE/app/resources/GDJS/Runtime/howler-sound-manager/howler.min.js',
  '/base/newIDE/app/resources/GDJS/Runtime/howler-sound-manager/howler-sound-manager.js',
  '/base/newIDE/app/resources/GDJS/Runtime/fontfaceobserver-font-manager/fontfaceobserver.js',
  '/base/newIDE/app/resources/GDJS/Runtime/fontfaceobserver-font-manager/fontfaceobserver-font-manager.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Model3DManager.js',
  '/base/newIDE/app/resources/GDJS/Runtime/jsonmanager.js',
  '/base/newIDE/app/resources/GDJS/Runtime/ResourceLoader.js',
  '/base/newIDE/app/resources/GDJS/Runtime/ResourceCache.js',
  '/base/newIDE/app/resources/GDJS/Runtime/timemanager.js',
  '/base/newIDE/app/resources/GDJS/Runtime/polygon.js',
  '/base/newIDE/app/resources/GDJS/Runtime/runtimeobject.js',
  '/base/newIDE/app/resources/GDJS/Runtime/RuntimeInstanceContainer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/runtimescene.js',
  '/base/newIDE/app/resources/GDJS/Runtime/scenestack.js',
  '/base/newIDE/app/resources/GDJS/Runtime/profiler.js',
  '/base/newIDE/app/resources/GDJS/Runtime/force.js',
  '/base/newIDE/app/resources/GDJS/Runtime/RuntimeLayer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/layer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/RuntimeCustomObjectLayer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/timer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/inputmanager.js',
  '/base/newIDE/app/resources/GDJS/Runtime/capturemanager.js',
  '/base/newIDE/app/resources/GDJS/Runtime/runtimegame.js',
  '/base/newIDE/app/resources/GDJS/Runtime/runtimewatermark.js',
  '/base/newIDE/app/resources/GDJS/Runtime/variable.js',
  '/base/newIDE/app/resources/GDJS/Runtime/variablescontainer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/oncetriggers.js',
  '/base/newIDE/app/resources/GDJS/Runtime/runtimebehavior.js',
  '/base/newIDE/app/resources/GDJS/Runtime/SpriteAnimator.js',
  '/base/newIDE/app/resources/GDJS/Runtime/spriteruntimeobject.js',
  '/base/newIDE/app/resources/GDJS/Runtime/CustomRuntimeObject.js',
  '/base/newIDE/app/resources/GDJS/Runtime/CustomRuntimeObject2D.js',
  '/base/newIDE/app/resources/GDJS/Runtime/CustomRuntimeObjectInstanceContainer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/events-tools/commontools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/events-tools/runtimescenetools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/events-tools/inputtools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/events-tools/networktools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/events-tools/objecttools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/events-tools/cameratools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/events-tools/soundtools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/events-tools/storagetools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/events-tools/stringtools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/events-tools/windowtools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/debugger-client/hot-reloader.js',
  '/base/newIDE/app/resources/GDJS/Runtime/affinetransformation.js',

  //Extensions:
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/DraggableBehavior/draggableruntimebehavior.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/AnchorBehavior/anchorruntimebehavior.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/PlatformBehavior/platformerobjectruntimebehavior.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/PlatformBehavior/platformruntimebehavior.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/LinkedObjects/linkedobjects.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Inventory/inventory.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Inventory/inventorytools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Physics2Behavior/Box2D_v2.3.1_min.wasm.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Physics2Behavior/physics2runtimebehavior.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Physics2Behavior/physics2tools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Leaderboards/leaderboardstools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Multiplayer/messageManager.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Multiplayer/multiplayerVariablesManager.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Multiplayer/multiplayertools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Multiplayer/multiplayercomponents.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Multiplayer/multiplayerobjectruntimebehavior.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Lighting/lightruntimeobject.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Lighting/lightruntimeobject-pixi-renderer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Lighting/lightobstacleruntimebehavior.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/PathfindingBehavior/PathTools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/PathfindingBehavior/pathfindingobstacleruntimebehavior.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/PathfindingBehavior/pathfindingruntimebehavior.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/PrimitiveDrawing/shapepainterruntimeobject.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/PrimitiveDrawing/shapepainterruntimeobject-pixi-renderer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/TextInput/textinputruntimeobject.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/TextInput/textinputruntimeobject-pixi-renderer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/TextObject/textruntimeobject.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/TextObject/textruntimeobject-pixi-renderer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/3D/A_RuntimeObject3D.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/3D/A_RuntimeObject3DRenderer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/3D/Cube3DRuntimeObject.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/3D/Cube3DRuntimeObjectPixiRenderer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/TopDownMovementBehavior/topdownmovementruntimebehavior.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/TweenBehavior/TweenManager.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/TweenBehavior/tweentools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/TweenBehavior/tweenruntimebehavior.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/A_firebasejs/A_firebase-base.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/A_firebasejs/B_firebase-analytics.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/A_firebasejs/B_firebase-auth.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/A_firebasejs/B_firebase-database.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/A_firebasejs/B_firebase-firestore.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/A_firebasejs/B_firebase-functions.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/A_firebasejs/B_firebase-messaging.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/A_firebasejs/B_firebase-performance.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/A_firebasejs/B_firebase-remote-config.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/A_firebasejs/B_firebase-storage.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/B_firebasetools/C_firebasetools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/B_firebasetools/D_analyticstools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/B_firebasetools/D_authtools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/B_firebasetools/D_databasetools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/B_firebasetools/D_functionstools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/B_firebasetools/D_performancetools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/B_firebasetools/D_remoteconfigtools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Firebase/B_firebasetools/D_storagetools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/TileMap/tilemapcollisionmaskruntimeobject.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/TileMap/TileMapRuntimeManager.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/TileMap/tilemapruntimeobject-pixi-renderer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/TileMap/tilemapruntimeobject.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/TileMap/collision/TileMapCollisionMaskRenderer.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/TileMap/collision/TransformedTileMap.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/TileMap/helper/TileMapHelper.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/TileMap/pako/dist/pako.min.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/SaveState/SaveStateTools.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/SaveState/SaveConfigurationRuntimeBehavior.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Effects/outline-pixi-filter.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Effects/pixi-filters/filter-outline.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Effects/kawase-blur-pixi-filter.js',
  '/base/newIDE/app/resources/GDJS/Runtime/Extensions/Effects/pixi-filters/filter-kawase-blur.js',

  // Test extensions:
  '/base/GDJS/tests/tests/Extensions/MockedResourceLoader.js',
  '/base/GDJS/tests/tests/Extensions/testruntimebehavior.js',
  '/base/GDJS/tests/tests/Extensions/testruntimeobject.js',
  '/base/GDJS/tests/tests/Extensions/testruntimeobjectwithfakerenderer.js',
  '/base/GDJS/tests/tests/Extensions/TestRuntimeScene.js',
  '/base/GDJS/tests/tests/Extensions/testspriteruntimeobject.js',

  // Other test initialization files:
  './base/GDJS/tests/tests-utils/init.js',
  './base/GDJS/tests/tests-utils/init.pixiruntimegamewithassets.js',
  './base/GDJS/tests/tests-utils/init.pixiruntimegame.js',
  './base/GDJS/tests/tests-utils/MockedCustomObject.js',

  // Test helpers
  './base/Extensions/PlatformBehavior/tests/PlatformerTestHelper.js',
];

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });

for (const scriptPath of scriptPaths) {
console.log("Load script:", scriptPath);
  await loadScript(scriptPath);
}

const TEST_REGEXP = /(spec|test)\.js$/i;

// Get a list of all the test files to include
for (const file of Object.keys(window.__karma__.files)) {
    console.log(file);
  if (TEST_REGEXP.test(file)) {
    await loadScript(file);
  }
}

window.__karma__.loaded();
