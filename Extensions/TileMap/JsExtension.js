//@ts-check
/// <reference path="../JsExtensionTypes.d.ts" />
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

/**
 * @param {gd.PlatformExtension} extension
 * @param {(translationSource: string) => string} _
 * @param {GDNamespace} gd
 */
const defineTileMap = function (extension, _, gd) {
  var objectTileMap = new gd.ObjectJsImplementation();
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
    if (propertyName === 'levelIndex') {
      objectContent.levelIndex = parseFloat(newValue);
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
  objectTileMap.getProperties = function (objectContent) {
    var objectProperties = new gd.MapStringPropertyDescriptor();

    objectProperties.set(
      'tilemapJsonFile',
      new gd.PropertyDescriptor(objectContent.tilemapJsonFile)
        .setType('resource')
        .addExtraInfo('tilemap')
        .addExtraInfo('json')
        .setLabel(_('Tilemap file (Tiled or LDtk)'))
        .setDescription(
          _('This is the file that was saved or exported from Tiled or LDtk.')
        )
        .setGroup(_('LDtk or Tiled'))
    );
    objectProperties.set(
      'tilesetJsonFile',
      new gd.PropertyDescriptor(objectContent.tilesetJsonFile || '')
        .setType('resource')
        .addExtraInfo('tileset')
        .addExtraInfo('json')
        .setLabel(_('Tileset JSON file (optional)'))
        .setDescription(
          _(
            "Optional: specify this if you've saved the tileset in a different file as the Tiled tilemap."
          )
        )
        .setGroup(_('Tiled only'))
    );
    objectProperties.set(
      'tilemapAtlasImage',
      new gd.PropertyDescriptor(objectContent.tilemapAtlasImage)
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Atlas image'))
        .setDescription(_('The Atlas image containing the tileset.'))
        .setGroup(_('Tiled only'))
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
      'levelIndex',
      new gd.PropertyDescriptor((objectContent.levelIndex || 0).toString())
        .setType('number')
        .setLabel(_('Level index to display'))
        .setDescription(_('Select which level to render via its index (LDtk)'))
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
      levelIndex: 0,
      animationSpeedScale: 1,
      animationFps: 4,
    })
  );

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
        'Displays a tiled-based map, made with the Tiled editor (https://www.mapeditor.org/) or the LDtk editor (https://ldtk.io/).'
      ),
      'JsPlatform/Extensions/tile_map.svg',
      objectTileMap
    )
    .setCategoryFullName(_('Advanced'))
    .addDefaultBehavior('EffectCapability::EffectBehavior')
    .addDefaultBehavior('ResizableCapability::ResizableBehavior')
    .addDefaultBehavior('ScalableCapability::ScalableBehavior')
    .addDefaultBehavior('OpacityCapability::OpacityBehavior')
    .setIncludeFile('Extensions/TileMap/tilemapruntimeobject.js')
    .addIncludeFile('Extensions/TileMap/TileMapRuntimeManager.js')
    .addIncludeFile('Extensions/TileMap/tilemapruntimeobject-pixi-renderer.js')
    .addIncludeFile('Extensions/TileMap/pixi-tilemap/dist/pixi-tilemap.umd.js')
    .addIncludeFile('Extensions/TileMap/pako/dist/pako.min.js')
    .addIncludeFile('Extensions/TileMap/helper/TileMapHelper.js');

  object
    .addCondition(
      'TilemapJsonFile',
      _('Tilemap file (Tiled or LDtk)'),
      _('Check the tilemap file (Tiled or LDtk) being used.'),
      _('The tilemap file of _PARAM0_ is _PARAM1_'),
      '',
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', _('Tile map'), 'TileMap', false)
    .addParameter(
      'tilemapResource',
      _('Tilemap file (Tiled or LDtk)'),
      '',
      false
    )
    .getCodeExtraInformation()
    .setFunctionName('isTilemapJsonFile');

  object
    .addAction(
      'SetTilemapJsonFile',
      _('Tilemap file (Tiled or LDtk)'),
      _(
        'Set the Tiled or LDtk file containing the Tilemap data to display. This is usually the main file exported from Tiled/LDtk.'
      ),
      _('Set the tilemap file of _PARAM0_ to _PARAM1_'),
      '',
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', _('Tile map'), 'TileMap', false)
    .addParameter(
      'tilemapResource',
      _('Tilemap file (Tiled or LDtk)'),
      '',
      false
    )
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
    .addParameter('object', _('Tile map'), 'TileMap', false)
    .addParameter('tilesetResource', _('Tileset JSON file'), '', false)
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
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', _('Tile map'), 'TileMap', false)
    .addParameter('tilesetResource', _('Tileset JSON file'), '', false)
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
    .addParameter('object', _('Tile map'), 'TileMap', false)
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
    .addParameter('object', _('Tile map'), 'TileMap', false)
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
    .addParameter('object', _('Tile map'), 'TileMap', false)
    .useStandardRelationalOperatorParameters(
      'number',
      gd.ParameterOptions.makeNewOptions()
    )
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
    .addParameter('object', _('Tile map'), 'TileMap', false)
    .useStandardOperatorParameters(
      'number',
      gd.ParameterOptions.makeNewOptions()
    )
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
    .addParameter('object', _('Tile map'), 'TileMap', false)
    .getCodeExtraInformation()
    .setFunctionName('getLayerIndex');

  object
    .addExpressionAndCondition(
      'number',
      'LevelIndex',
      _('Level index'),
      _('the level index being displayed.'),
      _('the level index'),
      '',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', _('Tile map'), 'TileMap', false)
    .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
    .setFunctionName('getLevelIndex');

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
    .addParameter('object', _('Tile map'), 'TileMap', false)
    .useStandardRelationalOperatorParameters(
      'number',
      gd.ParameterOptions.makeNewOptions().setDescription(
        _('Speed scale to compare to (1 by default)')
      )
    )
    .getCodeExtraInformation()
    .setFunctionName('getAnimationSpeedScale');

  object
    .addAction(
      'SetAnimationSpeedScale',
      _('Animation speed scale'),
      _('Set the animation speed scale of the Tilemap.'),
      _('the animation speed scale'),
      '',
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', _('Tile map'), 'TileMap', false)
    .useStandardOperatorParameters(
      'number',
      gd.ParameterOptions.makeNewOptions().setDescription(
        _('Speed scale (1 by default)')
      )
    )
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
    .addParameter('object', _('Tile map'), 'TileMap', false)
    .getCodeExtraInformation()
    .setFunctionName('getAnimationSpeedScale');

  object
    .addCondition(
      'AnimationFps',
      _('Animation speed (FPS)'),
      _('Compare the animation speed.'),
      _('the animation speed (FPS)'),
      '',
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', _('Tile map'), 'TileMap', false)
    .useStandardRelationalOperatorParameters(
      'number',
      gd.ParameterOptions.makeNewOptions().setDescription(
        _('Animation speed to compare to (in frames per second)')
      )
    )
    .getCodeExtraInformation()
    .setFunctionName('getAnimationFps');

  object
    .addAction(
      'SetAnimationFps',
      _('Animation speed (FPS)'),
      _('Set the animation speed of the Tilemap.'),
      _('the animation speed (FPS)'),
      '',
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', _('Tile map'), 'TileMap', false)
    .useStandardOperatorParameters(
      'number',
      gd.ParameterOptions.makeNewOptions().setDescription(
        _('Animation speed (in frames per second)')
      )
    )
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
    .addParameter('object', _('Tile map'), 'TileMap', false)
    .getCodeExtraInformation()
    .setFunctionName('getAnimationFps');

  // Deprecated
  object
    .addAction(
      'Scale',
      _('Scale'),
      _('Modify the scale of the specified object.'),
      _('the scale'),
      _('Size'),
      'res/actions/scale24_black.png',
      'res/actions/scale_black.png'
    )
    .addParameter('object', _('Tile map'), 'TileMap', false)
    .useStandardOperatorParameters(
      'number',
      gd.ParameterOptions.makeNewOptions().setDescription(
        _('Scale (1 by default)')
      )
    )
    .markAsAdvanced()
    .setHidden()
    .getCodeExtraInformation()
    .setFunctionName('setScale')
    .setGetter('getScale');

  // Deprecated
  object
    .addExpressionAndConditionAndAction(
      'number',
      'ScaleX',
      _('Scale on X axis'),
      _("the width's scale of an object"),
      _("the width's scale"),
      _('Size'),
      'res/actions/scaleWidth24_black.png'
    )
    .addParameter('object', _('Tile map'), 'TileMap', false)
    .useStandardParameters(
      'number',
      gd.ParameterOptions.makeNewOptions().setDescription(
        _('Scale (1 by default)')
      )
    )
    .markAsAdvanced()
    .setHidden()
    .setFunctionName('setScaleX')
    .setGetter('getScaleX');

  // Deprecated
  object
    .addExpressionAndConditionAndAction(
      'number',
      'ScaleY',
      _('Scale on Y axis'),
      _("the height's scale of an object"),
      _("the height's scale"),
      _('Size'),
      'res/actions/scaleHeight24_black.png'
    )
    .addParameter('object', _('Tile map'), 'TileMap', false)
    .useStandardParameters(
      'number',
      gd.ParameterOptions.makeNewOptions().setDescription(
        _('Scale (1 by default)')
      )
    )
    .markAsAdvanced()
    .setHidden()
    .setFunctionName('setScaleY')
    .setGetter('getScaleY');

  // Deprecated
  object
    .addAction(
      'Width',
      _('Width'),
      _('Change the width of an object.'),
      _('the width'),
      _('Size'),
      'res/actions/scaleWidth24_black.png',
      'res/actions/scaleWidth_black.png'
    )
    .addParameter('object', _('Tile map'), 'TileMap', false)
    .useStandardOperatorParameters(
      'number',
      gd.ParameterOptions.makeNewOptions()
    )
    .markAsAdvanced()
    .setHidden()
    .getCodeExtraInformation()
    .setFunctionName('setWidth');

  // Deprecated
  object
    .addAction(
      'Height',
      _('Height'),
      _('Change the height of an object.'),
      _('the height'),
      _('Size'),
      'res/actions/scaleHeight24_black.png',
      'res/actions/scaleHeight_black.png'
    )
    .addParameter('object', _('Tile map'), 'TileMap', false)
    .useStandardOperatorParameters(
      'number',
      gd.ParameterOptions.makeNewOptions()
    )
    .markAsAdvanced()
    .setHidden()
    .getCodeExtraInformation()
    .setFunctionName('setHeight');
};

/**
 * @param {gd.PlatformExtension} extension
 * @param {(translationSource: string) => string} _
 * @param {GDNamespace} gd
 */
const defineCollisionMask = function (extension, _, gd) {
  var collisionMaskObject = new gd.ObjectJsImplementation();
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
  collisionMaskObject.getProperties = function (objectContent) {
    var objectProperties = new gd.MapStringPropertyDescriptor();

    objectProperties.set(
      'tilemapJsonFile',
      new gd.PropertyDescriptor(objectContent.tilemapJsonFile)
        .setType('resource')
        .addExtraInfo('tilemap')
        .addExtraInfo('json')
        .setLabel(_('Tilemap JSON file'))
        .setDescription(
          _(
            'This is the JSON file that was saved or exported from Tiled. LDtk is not supported yet for collisions.'
          )
        )
    );
    objectProperties.set(
      'tilesetJsonFile',
      new gd.PropertyDescriptor(objectContent.tilesetJsonFile || '')
        .setType('resource')
        .addExtraInfo('tileset')
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
          _('When activated, it displays the hitboxes in the given color.')
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
      new gd.PropertyDescriptor(
        objectContent.outlineOpacity === undefined
          ? '64'
          : objectContent.outlineOpacity.toString()
      )
        .setType('number')
        .setLabel(_('Outline opacity (0-255)'))
    );
    objectProperties.set(
      'outlineSize',
      new gd.PropertyDescriptor(
        objectContent.outlineSize === undefined
          ? '1'
          : objectContent.outlineSize.toString()
      )
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
      new gd.PropertyDescriptor(
        objectContent.fillOpacity === undefined
          ? '32'
          : objectContent.fillOpacity.toString()
      )
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
      _('Tilemap collision mask'),
      _('Invisible object handling collisions with parts of a tilemap.'),
      'JsPlatform/Extensions/tile_map_collision_mask32.svg',
      collisionMaskObject
    )
    .setCategoryFullName(_('Advanced'))
    .addDefaultBehavior('EffectCapability::EffectBehavior')
    .addDefaultBehavior('ResizableCapability::ResizableBehavior')
    .addDefaultBehavior('ScalableCapability::ScalableBehavior')
    .setIncludeFile('Extensions/TileMap/tilemapcollisionmaskruntimeobject.js')
    .addIncludeFile('Extensions/TileMap/TileMapRuntimeManager.js')
    .addIncludeFile('Extensions/TileMap/pako/dist/pako.min.js')
    .addIncludeFile('Extensions/TileMap/helper/TileMapHelper.js')
    .addIncludeFile('Extensions/TileMap/collision/TransformedTileMap.js')
    .addIncludeFile(
      'Extensions/TileMap/collision/TileMapCollisionMaskRenderer.js'
    );

  object
    .addScopedCondition(
      'TilemapJsonFile',
      _('Tilemap JSON file'),
      _('Check the Tilemap JSON file being used.'),
      _('The Tilemap JSON file of _PARAM0_ is _PARAM1_'),
      '',
      'JsPlatform/Extensions/tile_map_collision_mask24.svg',
      'JsPlatform/Extensions/tile_map_collision_mask32.svg'
    )
    .addParameter(
      'object',
      _('Tile map collision mask'),
      'CollisionMask',
      false
    )
    .addParameter('jsonResource', _('Tilemap JSON file'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('isTilemapJsonFile');

  object
    .addScopedAction(
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
    .addParameter(
      'object',
      _('Tile map collision mask'),
      'CollisionMask',
      false
    )
    .addParameter('jsonResource', _('Tilemap JSON file'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('setTilemapJsonFile');

  object
    .addScopedCondition(
      'TilesetJsonFile',
      _('Tileset JSON file'),
      _('Check the tileset JSON file being used.'),
      _('The tileset JSON file of _PARAM0_ is _PARAM1_'),
      '',
      'JsPlatform/Extensions/tile_map_collision_mask24.svg',
      'JsPlatform/Extensions/tile_map_collision_mask32.svg'
    )
    .addParameter(
      'object',
      _('Tile map collision mask'),
      'CollisionMask',
      false
    )
    .addParameter('jsonResource', _('Tileset JSON file'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('isTilesetJsonFile');

  object
    .addScopedAction(
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
    .addParameter(
      'object',
      _('Tile map collision mask'),
      'CollisionMask',
      false
    )
    .addParameter('jsonResource', _('Tileset JSON file'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('setTilesetJsonFile');

  // Deprecated
  object
    .addScopedAction(
      'Scale',
      _('Scale'),
      _('Modify the scale of the specified object.'),
      _('the scale'),
      _('Size'),
      'res/actions/scale24_black.png',
      'res/actions/scale_black.png'
    )
    .addParameter(
      'object',
      _('Tile map collision mask'),
      'CollisionMask',
      false
    )
    .useStandardOperatorParameters(
      'number',
      gd.ParameterOptions.makeNewOptions().setDescription(
        _('Scale (1 by default)')
      )
    )
    .markAsAdvanced()
    .setHidden()
    .getCodeExtraInformation()
    .setFunctionName('setScale')
    .setGetter('getScale');

  // Deprecated
  object
    .addExpressionAndConditionAndAction(
      'number',
      'ScaleX',
      _('Scale on X axis'),
      _("the width's scale of an object"),
      _("the width's scale"),
      _('Size'),
      'res/actions/scaleWidth24_black.png'
    )
    .addParameter(
      'object',
      _('Tile map collision mask'),
      'CollisionMask',
      false
    )
    .useStandardParameters(
      'number',
      gd.ParameterOptions.makeNewOptions().setDescription(
        _('Scale (1 by default)')
      )
    )
    .markAsAdvanced()
    .setHidden()
    .setFunctionName('setScaleX')
    .setGetter('getScaleX');

  // Deprecated
  object
    .addExpressionAndConditionAndAction(
      'number',
      'ScaleY',
      _('Scale on Y axis'),
      _("the height's scale of an object"),
      _("the height's scale"),
      _('Size'),
      'res/actions/scaleHeight24_black.png'
    )
    .addParameter(
      'object',
      _('Tile map collision mask'),
      'CollisionMask',
      false
    )
    .useStandardParameters(
      'number',
      gd.ParameterOptions.makeNewOptions().setDescription(
        _('Scale (1 by default)')
      )
    )
    .markAsAdvanced()
    .setHidden()
    .setFunctionName('setScaleY')
    .setGetter('getScaleY');

  // Deprecated
  object
    .addScopedAction(
      'Width',
      _('Width'),
      _('Change the width of an object.'),
      _('the width'),
      _('Size'),
      'res/actions/scaleWidth24_black.png',
      'res/actions/scaleWidth_black.png'
    )
    .addParameter(
      'object',
      _('Tile map collision mask'),
      'CollisionMask',
      false
    )
    .useStandardOperatorParameters(
      'number',
      gd.ParameterOptions.makeNewOptions()
    )
    .markAsAdvanced()
    .setHidden()
    .getCodeExtraInformation()
    .setFunctionName('setWidth');

  // Deprecated
  object
    .addScopedAction(
      'Height',
      _('Height'),
      _('Change the height of an object.'),
      _('the height'),
      _('Size'),
      'res/actions/scaleHeight24_black.png',
      'res/actions/scaleHeight_black.png'
    )
    .addParameter(
      'object',
      _('Tile map collision mask'),
      'CollisionMask',
      false
    )
    .useStandardOperatorParameters(
      'number',
      gd.ParameterOptions.makeNewOptions()
    )
    .markAsAdvanced()
    .setHidden()
    .getCodeExtraInformation()
    .setFunctionName('setHeight');
};

/** @type {ExtensionModule} */
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
        _(
          "The Tilemap object can be used to display tile-based objects. It's a good way to create maps for RPG, strategy games or create objects by assembling tiles, useful for platformer, retro-looking games, etc..."
        ),
        'Todor Imreorov',
        'Open source (MIT License)'
      )
      .setCategory('Advanced')
      .setExtensionHelpPath('/objects/tilemap');

    extension
      .addInstructionOrExpressionGroupMetadata(_('Tilemap'))
      .setIcon('JsPlatform/Extensions/tile_map.svg');

    defineTileMap(extension, _, gd);
    defineCollisionMask(extension, _, gd);

    return extension;
  },

  registerClearCache: function (
    objectsRenderingService /*: ObjectsRenderingService */
  ) {
    const TilemapHelper = objectsRenderingService.requireModule(
      __dirname,
      'helper/TileMapHelper'
    );

    const clearCaches = (
      project /* InstanceHolder - gdProject in the editor */
    ) => {
      /** @type {TileMapHelper.TileMapManager} */
      const manager = TilemapHelper.TileMapManager.getManager(project);
      manager.clearCaches();
    };

    objectsRenderingService.registerClearCache(clearCaches);
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
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
  /**
   * Register editors for objects.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerEditorConfigurations: function (objectsEditorService) {
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
  registerInstanceRenderers: function (objectsRenderingService) {
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

    // When on the webapp, and using webpack, the extension does not seem to
    // be able to register itself properly. So we do it manually.
    // (This should be done here https://github.com/pixijs/tilemap/blob/master/src/index.ts#L43-L47)
    PIXI.extensions.add({
      name: 'tilemap',
      type: PIXI.ExtensionType.RendererPlugin,
      ref: Tilemap.TileRenderer,
    });

    /**
     * Renderer for instances of TileMap inside the IDE.
     */
    class RenderedTileMapInstance extends RenderedInstance {
      constructor(
        project,
        layout,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        pixiResourcesLoader
      ) {
        super(
          project,
          layout,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          pixiResourcesLoader
        );

        // This setting allows tile maps with more than 16K tiles.
        Tilemap.settings.use32bitIndex = true;

        this.tileMapPixiObject = new Tilemap.CompositeTilemap();
        this._pixiObject = this.tileMapPixiObject;

        // Implement `containsPoint` so that we can set `interactive` to true and
        // the Tilemap will properly emit events when hovered/clicked.
        // By default, this is not implemented in pixi-tilemap.
        this._pixiObject.containsPoint = (position) => {
          // Turns the world position to the local object coordinates
          const localPosition = new PIXI.Point();
          this._pixiObject.worldTransform.applyInverse(position, localPosition);

          return (
            localPosition.x >= 0 &&
            localPosition.x < this.width &&
            localPosition.y >= 0 &&
            localPosition.y < this.height
          );
        };
        this._pixiContainer.addChild(this._pixiObject);
        this.width = 48;
        this.height = 48;
        this.update();
        this.updateTileMap();
      }

      onRemovedFromScene() {
        super.onRemovedFromScene();
        // Keep textures because they are shared by all tile maps.
        this._pixiObject.destroy(false);
      }

      onLoadingError() {
        this.errorPixiObject =
          this.errorPixiObject ||
          new PIXI.Sprite(this._pixiResourcesLoader.getInvalidPIXITexture());
        this._pixiContainer.addChild(this.errorPixiObject);
        this._pixiObject = this.errorPixiObject;
      }

      onLoadingSuccess() {
        if (this.errorPixiObject) {
          this._pixiContainer.removeChild(this.errorPixiObject);
          this.errorPixiObject = null;
          this._pixiObject = this.tileMapPixiObject;
        }
      }

      /**
       * Return the path to the thumbnail of the specified object.
       */
      static getThumbnail(project, resourcesLoader, objectConfiguration) {
        return 'JsPlatform/Extensions/tile_map.svg';
      }

      /**
       * This is used to reload the Tilemap
       */
      updateTileMap() {
        // Get the tileset resource to use
        const tilemapAtlasImage = this._associatedObjectConfiguration
          .getProperties()
          .get('tilemapAtlasImage')
          .getValue();
        const tilemapJsonFile = this._associatedObjectConfiguration
          .getProperties()
          .get('tilemapJsonFile')
          .getValue();
        const tilesetJsonFile = this._associatedObjectConfiguration
          .getProperties()
          .get('tilesetJsonFile')
          .getValue();
        const layerIndex = parseInt(
          this._associatedObjectConfiguration
            .getProperties()
            .get('layerIndex')
            .getValue(),
          10
        );
        const levelIndex = parseInt(
          this._associatedObjectConfiguration
            .getProperties()
            .get('levelIndex')
            .getValue(),
          10
        );
        const displayMode = this._associatedObjectConfiguration
          .getProperties()
          .get('displayMode')
          .getValue();

        const tilemapResource = this._project
          .getResourcesManager()
          .getResource(tilemapJsonFile);

        let metadata = {};
        try {
          const tilemapMetadataAsString = tilemapResource.getMetadata();
          if (tilemapMetadataAsString)
            metadata = JSON.parse(tilemapMetadataAsString);
        } catch (error) {
          console.warn('Malformed metadata in a tilemap object:', error);
        }
        const mapping = metadata.embeddedResourcesMapping || {};

        const atlasTexture = this._pixiResourcesLoader.getPIXITexture(
          this._project,
          tilemapAtlasImage
        );

        const loadTileMap = () => {
          /** @type {TileMapHelper.TileMapManager} */
          const manager = TilemapHelper.TileMapManager.getManager(
            this._project
          );
          manager.getOrLoadTileMap(
            this._loadTileMapWithCallback.bind(this),
            tilemapJsonFile,
            tilesetJsonFile,
            levelIndex,
            pako,
            (tileMap) => {
              if (!tileMap) {
                this.onLoadingError();
                // _loadTileMapWithCallback already log errors
                return;
              }

              /** @type {TileMapHelper.TileTextureCache} */
              manager.getOrLoadTextureCache(
                this._loadTileMapWithCallback.bind(this),
                (textureName) =>
                  this._pixiResourcesLoader.getPIXITexture(
                    this._project,
                    mapping[textureName] || textureName
                  ),
                tilemapAtlasImage,
                tilemapJsonFile,
                tilesetJsonFile,
                levelIndex,
                (textureCache) => {
                  if (!textureCache) {
                    this.onLoadingError();
                    // getOrLoadTextureCache already log warns and errors.
                    return;
                  }
                  this.onLoadingSuccess();

                  this.width = tileMap.getWidth();
                  this.height = tileMap.getHeight();
                  TilemapHelper.PixiTileMapHelper.updatePixiTileMap(
                    this.tileMapPixiObject,
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

        if (atlasTexture.valid) {
          loadTileMap();
        } else {
          // Wait for the atlas image to load.
          atlasTexture.once('update', () => {
            loadTileMap();
          });
        }
      }

      // GDJS doesn't use Promise to avoid allocation.
      _loadTileMapWithCallback(tilemapJsonFile, tilesetJsonFile, callback) {
        this._loadTileMap(tilemapJsonFile, tilesetJsonFile).then(callback);
      }

      async _loadTileMap(tilemapJsonFile, tilesetJsonFile) {
        try {
          const tileMapJsonData = await this._pixiResourcesLoader.getResourceJsonData(
            this._project,
            tilemapJsonFile
          );

          const tileMap = TilemapHelper.TileMapManager.identify(
            tileMapJsonData
          );

          if (tileMap.kind === 'tiled') {
            const tilesetJsonData = tilesetJsonFile
              ? await this._pixiResourcesLoader.getResourceJsonData(
                  this._project,
                  tilesetJsonFile
                )
              : null;

            if (tilesetJsonData) {
              tileMapJsonData.tilesets = [tilesetJsonData];
            }
          }

          return tileMap;
        } catch (err) {
          console.error('Unable to load a Tilemap JSON data: ', err);
        }
        return null;
      }

      /**
       * This is called to update the PIXI object on the scene editor
       */
      update() {
        if (this._instance.hasCustomSize()) {
          this._pixiObject.scale.x = this.getCustomWidth() / this.width;
          this._pixiObject.scale.y = this.getCustomHeight() / this.height;
        } else {
          this._pixiObject.scale.x = 1;
          this._pixiObject.scale.y = 1;
        }

        // Place the center of rotation in the center of the object. Because pivot position in Pixi
        // is in the **local coordinates of the object**, we need to find back the original width
        // and height of the object before scaling (then divide by 2 to find the center)
        const originalWidth = this.width;
        const originalHeight = this.height;
        this._pixiObject.pivot.x = originalWidth / 2;
        this._pixiObject.pivot.y = originalHeight / 2;

        // Modifying the pivot position also has an impact on the transform. The instance (X,Y) position
        // of this object refers to the top-left point, but now in Pixi, as we changed the pivot, the Pixi
        // object (X,Y) position refers to the center. So we add an offset to convert from top-left to center.
        this._pixiObject.x =
          this._instance.getX() +
          this._pixiObject.pivot.x * this._pixiObject.scale.x;
        this._pixiObject.y =
          this._instance.getY() +
          this._pixiObject.pivot.y * this._pixiObject.scale.y;

        // Rotation works as intended because we put the pivot in the center
        this._pixiObject.rotation = RenderedInstance.toRad(
          this._instance.getAngle()
        );
      }

      /**
       * Return the width of the instance, when it's not resized.
       */
      getDefaultWidth() {
        return this.width;
      }

      /**
       * Return the height of the instance, when it's not resized.
       */
      getDefaultHeight() {
        return this.height;
      }
    }

    objectsRenderingService.registerInstanceRenderer(
      'TileMap::TileMap',
      RenderedTileMapInstance
    );

    /**
     * Renderer for instances of TileMap inside the IDE.
     */
    class RenderedCollisionMaskInstance extends RenderedInstance {
      constructor(
        project,
        layout,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        pixiResourcesLoader
      ) {
        super(
          project,
          layout,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          pixiResourcesLoader
        );

        this.tileMapPixiObject = new PIXI.Graphics();
        this._pixiObject = this.tileMapPixiObject;

        // Implement `containsPoint` so that we can set `interactive` to true and
        // the Tilemap will properly emit events when hovered/clicked.
        // By default, this is not implemented in pixi-tilemap.
        this._pixiObject.containsPoint = (position) => {
          // Turns the world position to the local object coordinates
          const localPosition = new PIXI.Point();
          this._pixiObject.worldTransform.applyInverse(position, localPosition);

          // Check if the point is inside the object bounds
          return (
            localPosition.x >= 0 &&
            localPosition.x < this.width &&
            localPosition.y >= 0 &&
            localPosition.y < this.height
          );
        };
        this._pixiContainer.addChild(this._pixiObject);
        this.width = 48;
        this.height = 48;
        this.update();
        this.updateTileMap();
      }

      onRemovedFromScene() {
        super.onRemovedFromScene();
        this._pixiObject.destroy();
      }

      onLoadingError() {
        this.errorPixiObject =
          this.errorPixiObject ||
          new PIXI.Sprite(this._pixiResourcesLoader.getInvalidPIXITexture());
        this._pixiContainer.addChild(this.errorPixiObject);
        this._pixiObject = this.errorPixiObject;
      }

      onLoadingSuccess() {
        if (this.errorPixiObject) {
          this._pixiContainer.removeChild(this.errorPixiObject);
          this.errorPixiObject = null;
          this._pixiObject = this.tileMapPixiObject;
        }
      }

      /**
       * Return the path to the thumbnail of the specified object.
       */
      static getThumbnail(project, resourcesLoader, objectConfiguration) {
        return 'JsPlatform/Extensions/tile_map_collision_mask24.svg';
      }

      /**
       * This is used to reload the Tilemap
       */
      updateTileMap() {
        // This might become useful in the future
        /*
        const tilemapAtlasImage = this._associatedObjectConfiguration
          .getProperties(this.project)
          .get('tilemapAtlasImage')
          .getValue();
        */
        const tilemapJsonFile = this._associatedObjectConfiguration
          .getProperties()
          .get('tilemapJsonFile')
          .getValue();
        const tilesetJsonFile = this._associatedObjectConfiguration
          .getProperties()
          .get('tilesetJsonFile')
          .getValue();
        const collisionMaskTag = this._associatedObjectConfiguration
          .getProperties()
          .get('collisionMaskTag')
          .getValue();
        const outlineColor = objectsRenderingService.rgbOrHexToHexNumber(
          this._associatedObjectConfiguration
            .getProperties()
            .get('outlineColor')
            .getValue()
        );
        const fillColor = objectsRenderingService.rgbOrHexToHexNumber(
          this._associatedObjectConfiguration
            .getProperties()
            .get('fillColor')
            .getValue()
        );
        const outlineOpacity =
          +this._associatedObjectConfiguration
            .getProperties()
            .get('outlineOpacity')
            .getValue() / 255;
        const fillOpacity =
          +this._associatedObjectConfiguration
            .getProperties()
            .get('fillOpacity')
            .getValue() / 255;
        const outlineSize = 1;

        /** @type {TileMapHelper.TileMapManager} */
        const manager = TilemapHelper.TileMapManager.getManager(this._project);
        manager.getOrLoadTileMap(
          this._loadTiledMapWithCallback.bind(this),
          tilemapJsonFile,
          tilesetJsonFile,
          0, // levelIndex
          pako,
          (tileMap) => {
            if (!tileMap) {
              this.onLoadingError();
              // _loadTiledMapWithCallback already log errors
              return;
            }
            this.onLoadingSuccess();

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
          }
        );
      }

      // GDJS doesn't use Promise to avoid allocation.
      _loadTiledMapWithCallback(tilemapJsonFile, tilesetJsonFile, callback) {
        this._loadTileMap(tilemapJsonFile, tilesetJsonFile).then(callback);
      }

      async _loadTileMap(tilemapJsonFile, tilesetJsonFile) {
        try {
          const tileMapJsonData = await this._pixiResourcesLoader.getResourceJsonData(
            this._project,
            tilemapJsonFile
          );

          const tileMap = TilemapHelper.TileMapManager.identify(
            tileMapJsonData
          );

          if (tileMap.kind === 'tiled') {
            const tilesetJsonData = tilesetJsonFile
              ? await this._pixiResourcesLoader.getResourceJsonData(
                  this._project,
                  tilesetJsonFile
                )
              : null;

            if (tilesetJsonData) {
              tileMapJsonData.tilesets = [tilesetJsonData];
            }
          }
          return tileMap;
        } catch (err) {
          console.error('Unable to load a Tilemap JSON data: ', err);
        }
        return null;
      }

      /**
       * This is called to update the PIXI object on the scene editor
       */
      update() {
        if (this._instance.hasCustomSize()) {
          this._pixiObject.scale.x = this.getCustomWidth() / this.width;
          this._pixiObject.scale.y = this.getCustomHeight() / this.height;
        } else {
          this._pixiObject.scale.x = 1;
          this._pixiObject.scale.y = 1;
        }

        // Place the center of rotation in the center of the object. Because pivot position in Pixi
        // is in the **local coordinates of the object**, we need to find back the original width
        // and height of the object before scaling (then divide by 2 to find the center)
        const originalWidth = this.width;
        const originalHeight = this.height;
        this._pixiObject.pivot.x = originalWidth / 2;
        this._pixiObject.pivot.y = originalHeight / 2;

        // Modifying the pivot position also has an impact on the transform. The instance (X,Y) position
        // of this object refers to the top-left point, but now in Pixi, as we changed the pivot, the Pixi
        // object (X,Y) position refers to the center. So we add an offset to convert from top-left to center.
        this._pixiObject.x =
          this._instance.getX() +
          this._pixiObject.pivot.x * this._pixiObject.scale.x;
        this._pixiObject.y =
          this._instance.getY() +
          this._pixiObject.pivot.y * this._pixiObject.scale.y;

        // Rotation works as intended because we put the pivot in the center
        this._pixiObject.rotation = RenderedInstance.toRad(
          this._instance.getAngle()
        );
      }

      /**
       * Return the width of the instance, when it's not resized.
       */
      getDefaultWidth() {
        return this.width;
      }

      /**
       * Return the height of the instance, when it's not resized.
       */
      getDefaultHeight() {
        return this.height;
      }
    }

    objectsRenderingService.registerInstanceRenderer(
      'TileMap::CollisionMask',
      RenderedCollisionMaskInstance
    );
  },
};
