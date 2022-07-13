// @flow

/// <reference path="helper/TileMapHelper.d.ts" />

/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change
 * to this extension file or to any other *.js file that you reference inside.
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */

/*::
// Import types to allow Flow to do static type checking on this file.
// Extensions declaration are typed using Flow (like the editor), but the files
// for the game engine are checked with TypeScript annotations.
import { type ObjectsRenderingService, type ObjectsEditorService } from '../JsExtensionTypes.flow.js'
*/

const defineTileMap = function (
  extension,
  _ /*: (string) => string */,
  gd /*: libGDevelop */) {
  
  var objectTileMap = new gd.ObjectJsImplementation();
  // $FlowExpectedError - ignore Flow warning as we're creating an object
  objectTileMap.updateProperty = function (
    objectContent,
    propertyName,
    newValue
  ) {
    if (propertyName === 'tilemapJsonFile') {
      objectContent.tilemapJsonFile = newValue;
      return true;
    }
    if (propertyName === 'tilesetJsonFile') {
      objectContent.tilesetJsonFile = newValue;
      return true;
    }
    if (propertyName === 'tilemapAtlasImage') {
      objectContent.tilemapAtlasImage = newValue;
      return true;
    }
    if (propertyName === 'displayMode') {
      objectContent.displayMode = newValue;
      return true;
    }
    if (propertyName === 'layerIndex') {
      objectContent.layerIndex = parseFloat(newValue);
      return true;
    }
    if (propertyName === 'animationSpeedScale') {
      objectContent.animationSpeedScale = parseFloat(newValue);
      return true;
    }
    if (propertyName === 'animationFps') {
      objectContent.animationFps = parseFloat(newValue);
      return true;
    }

    return false;
  };
  // $FlowExpectedError - ignore Flow warning as we're creating an object
  objectTileMap.getProperties = function (objectContent) {
    var objectProperties = new gd.MapStringPropertyDescriptor();

    objectProperties.set(
      'tilemapJsonFile',
      new gd.PropertyDescriptor(objectContent.tilemapJsonFile)
        .setType('resource')
        .addExtraInfo('json')
        .setLabel(_('Tilemap JSON file'))
        .setDescription(
          _('This is the JSON file that was saved or exported from Tiled.')
        )
        .setGroup(_('Tilemap and tileset'))
    );
    objectProperties.set(
      'tilesetJsonFile',
      new gd.PropertyDescriptor(objectContent.tilesetJsonFile || '')
        .setType('resource')
        .addExtraInfo('json')
        .setLabel(_('Tileset JSON file (optional)'))
        .setDescription(
          _(
            "Optional, don't specify it if you've not saved the tileset in a different file."
          )
        )
        .setGroup(_('Tilemap and tileset'))
    );
    objectProperties.set(
      'tilemapAtlasImage',
      new gd.PropertyDescriptor(objectContent.tilemapAtlasImage)
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Atlas image'))
        .setGroup(_('Tilemap and tileset'))
    );
    objectProperties.set(
      'displayMode',
      new gd.PropertyDescriptor(objectContent.displayMode)
        .setType('choice')
        .addExtraInfo('visible')
        .addExtraInfo('all')
        .addExtraInfo('index')
        .setLabel(_('Display mode'))
        .setGroup(_('Appearance'))
    );
    objectProperties.set(
      'layerIndex',
      new gd.PropertyDescriptor(objectContent.layerIndex.toString())
        .setType('number')
        .setLabel(_('Layer index to display'))
        .setDescription(
          _(
            'If "index" is selected as the display mode, this is the index of the layer to display.'
          )
        )
        .setGroup(_('Appearance'))
    );
    objectProperties.set(
      'animationSpeedScale',
      new gd.PropertyDescriptor(objectContent.animationSpeedScale.toString())
        .setType('number')
        .setLabel(_('Animation speed scale'))
        .setGroup(_('Animation'))
    );
    objectProperties.set(
      'animationFps',
      new gd.PropertyDescriptor(objectContent.animationFps.toString())
        .setType('number')
        .setLabel(_('Animation FPS'))
        .setGroup(_('Animation'))
    );

    return objectProperties;
  };
  objectTileMap.setRawJSONContent(
    JSON.stringify({
      tilemapJsonFile: '',
      tilesetJsonFile: '',
      tilemapAtlasImage: '',
      displayMode: 'visible',
      layerIndex: 0,
      animationSpeedScale: 1,
      animationFps: 4,
    })
  );

  // $FlowExpectedError - ignore Flow warning as we're creating an object
  objectTileMap.updateInitialInstanceProperty = function (
    objectContent,
    instance,
    propertyName,
    newValue,
    project,
    layout
  ) {
    return false;
  };
  // $FlowExpectedError - ignore Flow warning as we're creating an object
  objectTileMap.getInitialInstanceProperties = function (
    content,
    instance,
    project,
    layout
  ) {
    var instanceProperties = new gd.MapStringPropertyDescriptor();
    return instanceProperties;
  };

  const object = extension
    .addObject(
      'TileMap',
      _('Tilemap'),
      _(
        'Displays a tiled-based map, made with the Tiled editor (download it separately on https://www.mapeditor.org/).'
      ),
      'JsPlatform/Extensions/tile_map.svg',
      objectTileMap
    )
    .setCategoryFullName(_('Advanced'))
    .setIncludeFile('Extensions/TileMap/tilemapruntimeobject.js')
    .addIncludeFile('Extensions/TileMap/TileMapRuntimeManager.js')
    .addIncludeFile(
      'Extensions/TileMap/tilemapruntimeobject-pixi-renderer.js'
    )
    .addIncludeFile(
      'Extensions/TileMap/pixi-tilemap/dist/pixi-tilemap.umd.js'
    )
    .addIncludeFile('Extensions/TileMap/pako/dist/pako.min.js')
    .addIncludeFile('Extensions/TileMap/helper/TileMapHelper.js');

  object
    .addCondition(
      'TilemapJsonFile',
      _('Tilemap JSON file'),
      _('Check the Tilemap JSON file being used.'),
      _('The Tilemap JSON file of _PARAM0_ is _PARAM1_'),
      '',
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', 'TileMap', 'TileMap', false)
    .addParameter('jsonResource', _('Tilemap JSON file'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('isTilemapJsonFile');

  object
    .addAction(
      'SetTilemapJsonFile',
      _('Tilemap JSON file'),
      _(
        'Set the JSON file containing the Tilemap data to display. This is usually the JSON file exported from Tiled.'
      ),
      _('Set the Tilemap JSON file of _PARAM0_ to _PARAM1_'),
      '',
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', 'TileMap', 'TileMap', false)
    .addParameter('jsonResource', _('Tilemap JSON file'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('setTilemapJsonFile');

  object
    .addCondition(
      'TilesetJsonFile',
      _('Tileset JSON file'),
      _('Check the tileset JSON file being used.'),
      _('The tileset JSON file of _PARAM0_ is _PARAM1_'),
      '',
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', 'TileMap', 'TileMap', false)
    .addParameter('jsonResource', _('Tileset JSON file'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('isTilesetJsonFile');

  object
    .addAction(
      'SetTilesetJsonFile',
      _('Tileset JSON file'),
      _(
        'Set the JSON file with the tileset data (sometimes that is embeded in the Tilemap, so not needed)'
      ),
      _('Set the tileset JSON file of _PARAM0_ to _PARAM1_'),
      '',
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', 'TileMap', 'TileMap', false)
    .addParameter('jsonResource', _('Tileset JSON file'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('setTilesetJsonFile');

  object
    .addCondition(
      'DisplayMode',
      _('Display mode'),
      _('Compare the value of the display mode.'),
      _('The display mode of _PARAM0_ is _PARAM1_'),
      '',
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', 'TileMap', 'TileMap', false)
    .addParameter(
      'stringWithSelector',
      _('Display mode'),
      '["visible", "all", "index"]',
      false
    )
    .getCodeExtraInformation()
    .setFunctionName('isDisplayMode');

  object
    .addAction(
      'SetDisplayMode',
      _('Display mode'),
      _('Set the display mode'),
      _('Set the display mode of _PARAM0_ to _PARAM1_'),
      '',
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', 'TileMap', 'TileMap', false)
    .addParameter(
      'stringWithSelector',
      _('Display mode'),
      '["visible", "all", "index"]',
      false
    )
    .getCodeExtraInformation()
    .setFunctionName('setDisplayMode');

  object
    .addCondition(
      'LayerIndex',
      _('Layer index'),
      _('Compare the value of the layer index.'),
      _('the layer index'),
      '',
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', 'TileMap', 'TileMap', false)
    .useStandardRelationalOperatorParameters('number')
    .getCodeExtraInformation()
    .setFunctionName('getLayerIndex');

  object
    .addAction(
      'SetLayerIndex',
      _('Layer index'),
      _('Set the layer index of the Tilemap.'),
      _('the layer index'),
      '',
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', 'TileMap', 'TileMap', false)
    .useStandardOperatorParameters('number')
    .getCodeExtraInformation()
    .setFunctionName('setLayerIndex')
    .setGetter('getLayerIndex');

  object
    .addExpression(
      'LayerIndex',
      _('Layer index'),
      _('Get the layer index being displayed'),
      '',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', 'TileMap', 'TileMap', false)
    .getCodeExtraInformation()
    .setFunctionName('getLayerIndex');

  object
    .addCondition(
      'AnimationSpeedScale',
      _('Animation speed scale'),
      _('Compare the animation speed scale.'),
      _('the animation speed scale'),
      '',
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', 'TileMap', 'TileMap', false)
    .useStandardRelationalOperatorParameters('number')
    .getCodeExtraInformation()
    .setFunctionName('getAnimationSpeedScale');

  object
    .addAction(
      'SetAnimationSpeedScale',
      _('Animation speed scale'),
      _('Set the animation speed scale of the Tilemap (1 by default).'),
      _('the animation speed scale'),
      '',
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', 'TileMap', 'TileMap', false)
    .useStandardOperatorParameters('number')
    .getCodeExtraInformation()
    .setFunctionName('setAnimationSpeedScale')
    .setGetter('getAnimationSpeedScale');

  object
    .addExpression(
      'AnimationSpeedScale',
      _('Animation speed scale'),
      _('Get the Animation speed scale'),
      '',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', 'TileMap', 'TileMap', false)
    .getCodeExtraInformation()
    .setFunctionName('getAnimationSpeedScale');

  object
    .addCondition(
      'AnimationFps',
      _('Animation speed (FPS)'),
      _('Compare the animation speed (in frames per second).'),
      _('the animation speed (FPS)'),
      '',
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', 'TileMap', 'TileMap', false)
    .useStandardRelationalOperatorParameters('number')
    .getCodeExtraInformation()
    .setFunctionName('getAnimationFps');

  object
    .addAction(
      'SetAnimationFps',
      _('Animation speed (FPS)'),
      _('Set the animation speed (in frames per second) of the Tilemap.'),
      _('the animation speed (FPS)'),
      '',
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', 'TileMap', 'TileMap', false)
    .useStandardOperatorParameters('number')
    .getCodeExtraInformation()
    .setFunctionName('setAnimationFps')
    .setGetter('getAnimationFps');

  object
    .addExpression(
      'AnimationFps',
      _('Animation speed (FPS)'),
      _('Get the animation speed (in frames per second)'),
      '',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', 'TileMap', 'TileMap', false)
    .getCodeExtraInformation()
    .setFunctionName('getAnimationFps');
};

const defineCollisionMask = function (
  extension,
  _ /*: (string) => string */,
  gd /*: libGDevelop */) {
  
  var collisionMaskObject = new gd.ObjectJsImplementation();
  // $FlowExpectedError - ignore Flow warning as we're creating an object
  collisionMaskObject.updateProperty = function (
    objectContent,
    propertyName,
    newValue
  ) {
    if (propertyName === 'tilemapJsonFile') {
      objectContent.tilemapJsonFile = newValue;
      return true;
    }
    if (propertyName === 'tilesetJsonFile') {
      objectContent.tilesetJsonFile = newValue;
      return true;
    }
    if (propertyName === 'collisionMaskTag') {
      objectContent.collisionMaskTag = newValue;
      return true;
    }
    if (propertyName === 'debugMode') {
      objectContent.debugMode = newValue === '1';
      return true;
    }
    if (propertyName === 'fillColor') {
      objectContent.fillColor = newValue;
      return true;
    }
    if (propertyName === 'outlineColor') {
      objectContent.outlineColor = newValue;
      return true;
    }
    if (propertyName === 'fillOpacity') {
      objectContent.fillOpacity = parseFloat(newValue);
      return true;
    }
    if (propertyName === 'outlineOpacity') {
      objectContent.outlineOpacity = parseFloat(newValue);
      return true;
    }
    if (propertyName === 'outlineSize') {
      objectContent.outlineSize = parseFloat(newValue);
      return true;
    }

    return false;
  };
  // $FlowExpectedError - ignore Flow warning as we're creating an object
  collisionMaskObject.getProperties = function (objectContent) {
    var objectProperties = new gd.MapStringPropertyDescriptor();

    objectProperties.set(
      'tilemapJsonFile',
      new gd.PropertyDescriptor(objectContent.tilemapJsonFile)
        .setType('resource')
        .addExtraInfo('json')
        .setLabel(_('Tilemap JSON file'))
        .setDescription(
          _('This is the JSON file that was saved or exported from Tiled.')
        )
    );
    objectProperties.set(
      'tilesetJsonFile',
      new gd.PropertyDescriptor(objectContent.tilesetJsonFile || '')
        .setType('resource')
        .addExtraInfo('json')
        .setLabel(_('Tileset JSON file (optional)'))
        .setDescription(
          _(
            "Optional, don't specify it if you've not saved the tileset in a different file."
          )
        )
    );
    objectProperties.set(
      'collisionMaskTag',
      new gd.PropertyDescriptor(objectContent.collisionMaskTag)
        .setType('string')
        .setLabel(_('Class filter'))
        .setDescription(
          _(
            'Only the tiles with the given class (set in Tiled 1.9+) will have hitboxes created.'
          )
        )
    );
    objectProperties.set(
      'debugMode',
      new gd.PropertyDescriptor(objectContent.debugMode ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Debug mode'))
        .setDescription(
          _(
            'When activated, it displays the hitboxes in the given color.'
          )
        )
    );
    objectProperties.set(
      'outlineColor',
      new gd.PropertyDescriptor(objectContent.outlineColor)
        .setType('color')
        .setLabel(_('Outline color'))
    );
    objectProperties.set(
      'outlineOpacity',
      new gd.PropertyDescriptor(objectContent.outlineOpacity === undefined ? '64' : objectContent.outlineOpacity.toString())
        .setType('number')
        .setLabel(_('Outline opacity (0-255)'))
    );
    objectProperties.set(
      'outlineSize',
      new gd.PropertyDescriptor(objectContent.outlineSize === undefined ? '1' : objectContent.outlineSize.toString())
        .setType('number')
        .setLabel(_('Outline size (in pixels)'))
    );
    objectProperties.set(
      'fillColor',
      new gd.PropertyDescriptor(objectContent.fillColor)
        .setType('color')
        .setLabel(_('Fill color'))
    );
    objectProperties.set(
      'fillOpacity',
      new gd.PropertyDescriptor(objectContent.fillOpacity === undefined ? '32' : objectContent.fillOpacity.toString())
        .setType('number')
        .setLabel(_('Fill opacity (0-255)'))
    );

    return objectProperties;
  };
  collisionMaskObject.setRawJSONContent(
    JSON.stringify({
      tilemapJsonFile: '',
      tilesetJsonFile: '',
      collisionMaskTag: '',
      debugMode: false,
      fillColor: '255;255;255',
      outlineColor: '255;255;255',
      fillOpacity: 64,
      outlineOpacity: 128,
      outlineSize: 1,
    })
  );

  // $FlowExpectedError - ignore Flow warning as we're creating an object
  collisionMaskObject.updateInitialInstanceProperty = function (
    objectContent,
    instance,
    propertyName,
    newValue,
    project,
    layout
  ) {
    return false;
  };
  // $FlowExpectedError - ignore Flow warning as we're creating an object
  collisionMaskObject.getInitialInstanceProperties = function (
    content,
    instance,
    project,
    layout
  ) {
    var instanceProperties = new gd.MapStringPropertyDescriptor();
    return instanceProperties;
  };

  const object = extension
    .addObject(
      'CollisionMask',
      _('Tilemap collision mask (experimental)'),
      _(
        'Invisible object handling collisions with parts of a tilemap.'
      ),
      'JsPlatform/Extensions/tile_map_collision_mask32.svg',
      collisionMaskObject
    )
    .setCategoryFullName(_('Advanced'))
    .setIncludeFile('Extensions/TileMap/tilemapcollisionmaskruntimeobject.js')
    .addIncludeFile('Extensions/TileMap/TileMapRuntimeManager.js')
    .addIncludeFile('Extensions/TileMap/pako/dist/pako.min.js')
    .addIncludeFile('Extensions/TileMap/helper/TileMapHelper.js')
    .addIncludeFile('Extensions/TileMap/collision/TransformedTileMap.js')
    .addIncludeFile(
      'Extensions/TileMap/collision/TileMapCollisionMaskRenderer.js'
    );

  object
    .addCondition(
      'TilemapJsonFile',
      _('Tilemap JSON file'),
      _('Check the Tilemap JSON file being used.'),
      _('The Tilemap JSON file of _PARAM0_ is _PARAM1_'),
      '',
      'JsPlatform/Extensions/tile_map_collision_mask24.svg',
      'JsPlatform/Extensions/tile_map_collision_mask32.svg'
    )
    .addParameter('object', 'TileMap', 'TileMap', false)
    .addParameter('jsonResource', _('Tilemap JSON file'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('isTilemapJsonFile');

  object
    .addAction(
      'SetTilemapJsonFile',
      _('Tilemap JSON file'),
      _(
        'Set the JSON file containing the Tilemap data to display. This is usually the JSON file exported from Tiled.'
      ),
      _('Set the Tilemap JSON file of _PARAM0_ to _PARAM1_'),
      '',
      'JsPlatform/Extensions/tile_map_collision_mask24.svg',
      'JsPlatform/Extensions/tile_map_collision_mask32.svg'
    )
    .addParameter('object', 'TileMap', 'TileMap', false)
    .addParameter('jsonResource', _('Tilemap JSON file'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('setTilemapJsonFile');

  object
    .addCondition(
      'TilesetJsonFile',
      _('Tileset JSON file'),
      _('Check the tileset JSON file being used.'),
      _('The tileset JSON file of _PARAM0_ is _PARAM1_'),
      '',
      'JsPlatform/Extensions/tile_map_collision_mask24.svg',
      'JsPlatform/Extensions/tile_map_collision_mask32.svg'
    )
    .addParameter('object', 'TileMap', 'TileMap', false)
    .addParameter('jsonResource', _('Tileset JSON file'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('isTilesetJsonFile');

  object
    .addAction(
      'SetTilesetJsonFile',
      _('Tileset JSON file'),
      _(
        'Set the JSON file with the tileset data (sometimes that is embedded in the Tilemap, so not needed)'
      ),
      _('Set the tileset JSON file of _PARAM0_ to _PARAM1_'),
      '',
      'JsPlatform/Extensions/tile_map_collision_mask24.svg',
      'JsPlatform/Extensions/tile_map_collision_mask32.svg'
    )
    .addParameter('object', 'TileMap', 'TileMap', false)
    .addParameter('jsonResource', _('Tileset JSON file'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('setTilesetJsonFile');
};

module.exports = {

  createExtension: function (
    _ /*: (string) => string */,
    gd /*: libGDevelop */
  ) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'TileMap',
        _('Tilemap'),
        "The Tilemap object can be used to display tile-based objects. It's a good way to create maps for RPG, strategy games or create objects by assembling tiles, useful for platformer, retro-looking games, etc...",
        'Todor Imreorov',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/objects/tilemap');
    
      defineTileMap(extension, _, gd);
      defineCollisionMask(extension, _, gd);

    return extension;
  },

  /**
   * You can optionally add sanity tests that will check the basic working
   * of your extension behaviors/objects by instantiating behaviors/objects
   * and setting the property to a given value.
   *
   * If you don't have any tests, you can simply return an empty array like this:
   * `runExtensionSanityTests: function(gd, extension) { return []; }`
   *
   * But it is recommended to create tests for the behaviors/objects properties you created
   * to avoid mistakes.
   */
  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    return [];
  },
  /**
   * Register editors for objects.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerEditorConfigurations: function (
    objectsEditorService /*: ObjectsEditorService */
  ) {
    objectsEditorService.registerEditorConfiguration(
      'TileMap::TileMap',
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/objects/tilemap',
      })
    );
    objectsEditorService.registerEditorConfiguration(
      'TileMap::CollisionMask',
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/objects/tilemap',
      })
    );
  },
  /**
   * Register renderers for instance of objects on the scene editor.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerInstanceRenderers: function (
    objectsRenderingService /*: ObjectsRenderingService */
  ) {
    const RenderedInstance = objectsRenderingService.RenderedInstance;
    const PIXI = objectsRenderingService.PIXI;

    const Tilemap = objectsRenderingService.requireModule(
      __dirname,
      'pixi-tilemap/dist/pixi-tilemap.umd'
    );
    const TilemapHelper = objectsRenderingService.requireModule(
      __dirname,
      'helper/TileMapHelper'
    );
    // required for decoding tiled zlib compressed layer data
    const pako = objectsRenderingService.requireModule(
      __dirname,
      'pako/dist/pako.min'
    );

    /**
     * Renderer for instances of TileMap inside the IDE.
     *
     * @extends RenderedInstance
     * @class RenderedTileMapInstance
     * @constructor
     */
    function RenderedTileMapInstance(
      project,
      layout,
      instance,
      associatedObject,
      pixiContainer,
      pixiResourcesLoader
    ) {
      RenderedInstance.call(
        this,
        project,
        layout,
        instance,
        associatedObject,
        pixiContainer,
        pixiResourcesLoader
      );

      this._pixiObject = new Tilemap.CompositeRectTileLayer(0);

      // Implement `containsPoint` so that we can set `interactive` to true and
      // the Tilemap will properly emit events when hovered/clicked.
      // By default, this is not implemented in pixi-tilemap.
      this._pixiObject.containsPoint = (position) => {
        // Turns the world position to the local object coordinates
        const localPosition = new PIXI.Point();
        this._pixiObject.worldTransform.applyInverse(position, localPosition);

        // Check if the point is inside the object bounds
        const originalWidth = this._pixiObject.width / this._pixiObject.scale.x;
        const originalHeight =
          this._pixiObject.height / this._pixiObject.scale.y;

        return (
          localPosition.x >= 0 &&
          localPosition.x < originalWidth &&
          localPosition.y >= 0 &&
          localPosition.y < originalHeight
        );
      };
      this._pixiContainer.addChild(this._pixiObject);
      this.update();
      this.updateTileMap();
    }

    RenderedTileMapInstance.prototype = Object.create(
      RenderedInstance.prototype
    );

    /**
     * Return the path to the thumbnail of the specified object.
     */
    RenderedTileMapInstance.getThumbnail = function (
      project,
      resourcesLoader,
      object
    ) {
      return 'JsPlatform/Extensions/tile_map.svg';
    };

    /**
     * This is used to reload the Tilemap
     */
    RenderedTileMapInstance.prototype.updateTileMap = function () {
      // Get the tileset resource to use
      const tilemapAtlasImage = this._associatedObject
        .getProperties(this.project)
        .get('tilemapAtlasImage')
        .getValue();
      const tilemapJsonFile = this._associatedObject
        .getProperties(this.project)
        .get('tilemapJsonFile')
        .getValue();
      const tilesetJsonFile = this._associatedObject
        .getProperties(this.project)
        .get('tilesetJsonFile')
        .getValue();
      const layerIndex = parseInt(
        this._associatedObject
          .getProperties(this.project)
          .get('layerIndex')
          .getValue(),
        10
      );
      const displayMode = this._associatedObject
        .getProperties(this.project)
        .get('displayMode')
        .getValue();

      /** @type {TileMapHelper.TileMapManager} */
      const manager = TilemapHelper.TileMapManager.getManager(this._project);
      manager.getOrLoadTileMap(
        this._loadTiledMapWithCallback.bind(this),
        tilemapJsonFile,
        tilesetJsonFile,
        pako,
        (tileMap) => {
          if (!tileMap) {
            // _loadTiledMapWithCallback already log errors
            return;
          }

          /** @type {TileMapHelper.TileTextureCache} */
          const textureCache = manager.getOrLoadTextureCache(
            this._loadTiledMapWithCallback.bind(this),
            (textureName) =>
              this._pixiResourcesLoader.getPIXITexture(this._project, textureName),
            tilemapAtlasImage,
            tilemapJsonFile,
            tilesetJsonFile,
            (textureCache) => {
              if (!textureCache) {
                // getOrLoadTextureCache already log warns and errors.
                return;
              }

              TilemapHelper.PixiTileMapHelper.updatePixiTileMap(
                this._pixiObject,
                tileMap,
                textureCache,
                displayMode,
                layerIndex
              );
            }
          );
        }
      );
    };

    // GDJS doesn't use Promise to avoid allocation.
    RenderedTileMapInstance.prototype._loadTiledMapWithCallback = function (
      tilemapJsonFile,
      tilesetJsonFile,
      callback
    ) {
      this._loadTiledMap(tilemapJsonFile, tilesetJsonFile).then(callback);
    };

    RenderedTileMapInstance.prototype._loadTiledMap = async function (
      tilemapJsonFile,
      tilesetJsonFile) {

        const tileMapJsonData = await this._pixiResourcesLoader.getResourceJsonData(
          this._project,
          tilemapJsonFile
        );

        try {
        const tilesetJsonData = tilesetJsonFile
          ? await this._pixiResourcesLoader.getResourceJsonData(
              this._project,
              tilesetJsonFile
            )
          : null;

        if (tilesetJsonData) {
          tileMapJsonData.tilesets = [tilesetJsonData];
        }
        } catch (err) {
          console.error('Unable to load a Tilemap JSON data: ', err);
        }
        return tileMapJsonData;
    };

    /**
     * This is called to update the PIXI object on the scene editor
     */
    RenderedTileMapInstance.prototype.update = function () {
      if (this._instance.hasCustomSize()) {
        this._pixiObject.width = this._instance.getCustomWidth();
        this._pixiObject.height = this._instance.getCustomHeight();
      } else {
        this._pixiObject.scale.x = 1;
        this._pixiObject.scale.y = 1;
      }

      // Place the center of rotation in the center of the object. Because pivot position in Pixi
      // is in the **local coordinates of the object**, we need to find back the original width
      // and height of the object before scaling (then divide by 2 to find the center)
      const originalWidth = this._pixiObject.width / this._pixiObject.scale.x;
      const originalHeight = this._pixiObject.height / this._pixiObject.scale.y;
      this._pixiObject.pivot.x = originalWidth / 2;
      this._pixiObject.pivot.y = originalHeight / 2;

      // Modifying the pivot position also has an impact on the transform. The instance (X,Y) position
      // of this object refers to the top-left point, but now in Pixi, as we changed the pivot, the Pixi
      // object (X,Y) position refers to the center. So we add an offset to convert from top-left to center.
      this._pixiObject.x = this._instance.getX() + this._pixiObject.width / 2;
      this._pixiObject.y = this._instance.getY() + this._pixiObject.height / 2;

      // Rotation works as intended because we put the pivot in the center
      this._pixiObject.rotation = RenderedInstance.toRad(
        this._instance.getAngle()
      );
    };

    /**
     * Return the width of the instance, when it's not resized.
     */
    RenderedTileMapInstance.prototype.getDefaultWidth = function () {
      return this._pixiObject.width / this._pixiObject.scale.x;
    };

    /**
     * Return the height of the instance, when it's not resized.
     */
    RenderedTileMapInstance.prototype.getDefaultHeight = function () {
      return this._pixiObject.height / this._pixiObject.scale.y;
    };

    objectsRenderingService.registerInstanceRenderer(
      'TileMap::TileMap',
      RenderedTileMapInstance
    );

    /**
     * Renderer for instances of TileMap inside the IDE.
     *
     * @extends RenderedInstance
     * @class RenderedTileMapInstance
     * @constructor
     */
     function RenderedCollisionMaskInstance(
      project,
      layout,
      instance,
      associatedObject,
      pixiContainer,
      pixiResourcesLoader
    ) {
      RenderedInstance.call(
        this,
        project,
        layout,
        instance,
        associatedObject,
        pixiContainer,
        pixiResourcesLoader
      );

      this._pixiObject = new PIXI.Graphics();

      // Implement `containsPoint` so that we can set `interactive` to true and
      // the Tilemap will properly emit events when hovered/clicked.
      // By default, this is not implemented in pixi-tilemap.
      this._pixiObject.containsPoint = (position) => {
        // Turns the world position to the local object coordinates
        const localPosition = new PIXI.Point();
        this._pixiObject.worldTransform.applyInverse(position, localPosition);

        // Check if the point is inside the object bounds
        const originalWidth = this._pixiObject.width / this._pixiObject.scale.x;
        const originalHeight =
          this._pixiObject.height / this._pixiObject.scale.y;

        return (
          localPosition.x >= 0 &&
          localPosition.x < originalWidth &&
          localPosition.y >= 0 &&
          localPosition.y < originalHeight
        );
      };
      this._pixiContainer.addChild(this._pixiObject);
      this.width = 20;
      this.height = 20;
      this.update();
      this.updateTileMap();
    }

    RenderedCollisionMaskInstance.prototype = Object.create(
      RenderedInstance.prototype
    );

    /**
     * Return the path to the thumbnail of the specified object.
     */
     RenderedCollisionMaskInstance.getThumbnail = function (
      project,
      resourcesLoader,
      object
    ) {
      return 'JsPlatform/Extensions/tile_map_collision_mask24.svg';
    };

    /**
     * This is used to reload the Tilemap
     */
     RenderedCollisionMaskInstance.prototype.updateTileMap = function () {
      // Get the tileset resource to use
      const tilemapAtlasImage = this._associatedObject
      .getProperties(this.project)
      .get('tilemapAtlasImage')
      .getValue();
    const tilemapJsonFile = this._associatedObject
      .getProperties(this.project)
      .get('tilemapJsonFile')
      .getValue();
    const tilesetJsonFile = this._associatedObject
      .getProperties(this.project)
      .get('tilesetJsonFile')
      .getValue();
    const collisionMaskTag = this._associatedObject
      .getProperties(this.project)
      .get('collisionMaskTag')
      .getValue();
    const outlineColor = objectsRenderingService.rgbOrHexToHexNumber(
      this._associatedObject
        .getProperties(this.project)
        .get('outlineColor')
        .getValue()
    );
    const fillColor = objectsRenderingService.rgbOrHexToHexNumber(
      this._associatedObject
        .getProperties(this.project)
        .get('fillColor')
        .getValue()
    );
    const outlineOpacity = this._associatedObject
      .getProperties(this.project)
      .get('outlineOpacity')
      .getValue() / 255;
    const fillOpacity = this._associatedObject
      .getProperties(this.project)
      .get('fillOpacity')
      .getValue() / 255;
    const outlineSize = 1;

      /** @type {TileMapHelper.TileMapManager} */
      const manager = TilemapHelper.TileMapManager.getManager(this._project);
      manager.getOrLoadTileMap(
        this._loadTiledMapWithCallback.bind(this),
        tilemapJsonFile,
        tilesetJsonFile,
        pako,
        (tileMap) => {
          if (!tileMap) {
            // _loadTiledMapWithCallback already log errors
            return;
          }

          this.width = tileMap.getWidth();
          this.height = tileMap.getHeight();
          TilemapHelper.PixiTileMapHelper.updatePixiCollisionMask(
            this._pixiObject,
            tileMap,
            collisionMaskTag,
            outlineSize,
            outlineColor,
            outlineOpacity,
            fillColor,
            fillOpacity
          );

          // const textureCache = manager.getOrLoadTextureCache(
          //   this._loadTiledMapWithCallback.bind(this),
          //   (textureName) =>
          //     this._pixiResourcesLoader.getPIXITexture(this._project, textureName),
          //   tilemapAtlasImage,
          //   tilemapJsonFile,
          //   tilesetJsonFile,
          //   (textureCache) => {
          //     if (!textureCache) {
          //       return;
          //     }

          //     let tileId = -1;
          //     for (const definition of tileMap.getTileDefinitions()) {
          //       if (definition.getTag() === collisionMaskTag) {
          //         tileId = definition.getTag();
          //       }
          //     }
          //     if (tileId >= 0) {
          //       const texture = textureCache.findTileTexture(tileId, false, false, false);
          //       // TODO set the thumbnail from this texture
          //     }
          //   }
          // );
        }
      );
    };

    // GDJS doesn't use Promise to avoid allocation.
    RenderedCollisionMaskInstance.prototype._loadTiledMapWithCallback = function (
      tilemapJsonFile,
      tilesetJsonFile,
      callback
    ) {
      this._loadTiledMap(tilemapJsonFile, tilesetJsonFile).then(callback);
    };

    RenderedCollisionMaskInstance.prototype._loadTiledMap = async function (
      tilemapJsonFile,
      tilesetJsonFile) {

        const tileMapJsonData = await this._pixiResourcesLoader.getResourceJsonData(
          this._project,
          tilemapJsonFile
        );

        try {
        const tilesetJsonData = tilesetJsonFile
          ? await this._pixiResourcesLoader.getResourceJsonData(
              this._project,
              tilesetJsonFile
            )
          : null;

        if (tilesetJsonData) {
          tileMapJsonData.tilesets = [tilesetJsonData];
        }
        } catch (err) {
          console.error('Unable to load a Tilemap JSON data: ', err);
        }
        return tileMapJsonData;
    };

    /**
     * This is called to update the PIXI object on the scene editor
     */
     RenderedCollisionMaskInstance.prototype.update = function () {
      if (this._instance.hasCustomSize()) {
        this._pixiObject.scale.x = this._instance.getCustomWidth() / this.width;
        this._pixiObject.scale.y = this._instance.getCustomHeight() / this.height;
      } else {
        this._pixiObject.scale.x = 1;
        this._pixiObject.scale.y = 1;
      }

      // Place the center of rotation in the center of the object. Because pivot position in Pixi
      // is in the **local coordinates of the object**, we need to find back the original width
      // and height of the object before scaling (then divide by 2 to find the center)
      const originalWidth = this.width / this._pixiObject.scale.x;
      const originalHeight = this.height / this._pixiObject.scale.y;
      this._pixiObject.pivot.x = originalWidth / 2;
      this._pixiObject.pivot.y = originalHeight / 2;

      // Modifying the pivot position also has an impact on the transform. The instance (X,Y) position
      // of this object refers to the top-left point, but now in Pixi, as we changed the pivot, the Pixi
      // object (X,Y) position refers to the center. So we add an offset to convert from top-left to center.
      this._pixiObject.x = this._instance.getX() + this.width / 2;
      this._pixiObject.y = this._instance.getY() + this.height / 2;

      // Rotation works as intended because we put the pivot in the center
      this._pixiObject.rotation = RenderedInstance.toRad(
        this._instance.getAngle()
      );
    };

    /**
     * Return the width of the instance, when it's not resized.
     */
     RenderedCollisionMaskInstance.prototype.getDefaultWidth = function () {
      return this.width;
    };

    /**
     * Return the height of the instance, when it's not resized.
     */
     RenderedCollisionMaskInstance.prototype.getDefaultHeight = function () {
      return this.height;
    };

    objectsRenderingService.registerInstanceRenderer(
      'TileMap::CollisionMask',
      RenderedCollisionMaskInstance
    );
  },
};
