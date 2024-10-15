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
  objectTileMap.updateProperty = function (propertyName, newValue) {
    const objectContent = this.content;
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
  objectTileMap.getProperties = function () {
    var objectProperties = new gd.MapStringPropertyDescriptor();
    const objectContent = this.content;

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
  objectTileMap.content = {
    tilemapJsonFile: '',
    tilesetJsonFile: '',
    tilemapAtlasImage: '',
    displayMode: 'visible',
    layerIndex: 0,
    levelIndex: 0,
    animationSpeedScale: 1,
    animationFps: 4,
  };

  objectTileMap.updateInitialInstanceProperty = function (
    instance,
    propertyName,
    newValue
  ) {
    return false;
  };
  objectTileMap.getInitialInstanceProperties = function (instance) {
    const instanceProperties = new gd.MapStringPropertyDescriptor();
    return instanceProperties;
  };

  const object = extension
    .addObject(
      'TileMap',
      _('External Tilemap (Tiled/LDtk)'),
      _(
        'Displays a tiled-based map, made with the Tiled editor (https://www.mapeditor.org/) or the LDtk editor (https://ldtk.io/).'
      ),
      'JsPlatform/Extensions/tile_map.svg',
      objectTileMap
    )
    .setCategoryFullName(_('Advanced'))
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
const defineSimpleTileMap = function (extension, _, gd) {
  var objectSimpleTileMap = new gd.ObjectJsImplementation();
  objectSimpleTileMap.updateProperty = function (propertyName, newValue) {
    const objectContent = this.content;
    if (propertyName === 'atlasImage') {
      objectContent.atlasImage = newValue;
      return true;
    }
    if (propertyName === 'columnCount') {
      objectContent.columnCount = parseFloat(newValue);
      return true;
    }
    if (propertyName === 'rowCount') {
      objectContent.rowCount = parseFloat(newValue);
      return true;
    }
    if (propertyName === 'tileSize') {
      objectContent.tileSize = parseFloat(newValue);
      return true;
    }
    if (propertyName === 'tilesWithHitBox') {
      objectContent.tilesWithHitBox = newValue;
      return true;
    }

    return false;
  };
  objectSimpleTileMap.getProperties = function () {
    var objectProperties = new gd.MapStringPropertyDescriptor();
    const objectContent = this.content;

    objectProperties.set(
      'columnCount',
      new gd.PropertyDescriptor(
        (typeof objectContent.columnCount === 'undefined'
          ? 4
          : objectContent.columnCount
        ).toString()
      )
        .setType('number')
        .setLabel(_('Columns'))
        .setDescription(_('Number of columns.'))
        .setHidden(true)
    );
    objectProperties.set(
      'rowCount',
      new gd.PropertyDescriptor(
        (typeof objectContent.rowCount === 'undefined'
          ? 4
          : objectContent.rowCount
        ).toString()
      )
        .setType('number')
        .setLabel(_('Rows'))
        .setDescription(_('Number of rows.'))
        .setHidden(true)
    );
    objectProperties.set(
      'tileSize',
      new gd.PropertyDescriptor(
        (typeof objectContent.tileSize === 'undefined'
          ? 8
          : objectContent.tileSize
        ).toString()
      )
        .setType('number')
        .setLabel(_('Tile size'))
        .setDescription(_('Tile size in pixels.'))
        .setHidden(true) // Hidden because a full editor is needed to recompute column/row counts
    );
    objectProperties.set(
      'tilesWithHitBox',
      new gd.PropertyDescriptor(objectContent.tilesWithHitBox || '')
        .setType('string')
        .setLabel(_('Tile ids with hit box'))
        .setDescription(
          _('The list of tile ids with a hit box (separated by commas).')
        )
        .setHidden(true)
    );

    objectProperties.set(
      'atlasImage',
      new gd.PropertyDescriptor(objectContent.atlasImage)
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Atlas image'))
        .setDescription(_('The Atlas image containing the tileset.'))
        .setHidden(true) // Hidden because a full editor is needed to recompute column/row counts
    );

    return objectProperties;
  };
  objectSimpleTileMap.content = {
    atlasImage: '',
    rowCount: 1,
    columnCount: 1,
    tileSize: 8,
    tilesWithHitBox: '',
  };

  objectSimpleTileMap.updateInitialInstanceProperty = function (
    instance,
    propertyName,
    newValue
  ) {
    if (propertyName === 'tilemap') {
      instance.setRawStringProperty('tilemap', newValue);
      return true;
    }
    return false;
  };

  objectSimpleTileMap.getInitialInstanceProperties = function (instance) {
    var instanceProperties = new gd.MapStringPropertyDescriptor();

    instanceProperties
      .getOrCreate('tilemap')
      .setValue(instance.getRawStringProperty('tileMap'))
      .setType('string')
      .setLabel('Tilemap')
      .setHidden(true);

    return instanceProperties;
  };

  const object = extension
    .addObject(
      'SimpleTileMap',
      _('Tile map'),
      _('Displays a tiled-based map.'),
      'JsPlatform/Extensions/tile_map.svg',
      objectSimpleTileMap
    )
    .setCategoryFullName(_('General'))
    .setOpenFullEditorLabel(_('Edit tileset and collisions'))
    .addDefaultBehavior('ResizableCapability::ResizableBehavior')
    .addDefaultBehavior('ScalableCapability::ScalableBehavior')
    .addDefaultBehavior('OpacityCapability::OpacityBehavior')
    .setIncludeFile('Extensions/TileMap/simpletilemapruntimeobject.js')
    .addIncludeFile('Extensions/TileMap/TileMapRuntimeManager.js')
    .addIncludeFile('Extensions/TileMap/tilemapruntimeobject-pixi-renderer.js')
    .addIncludeFile('Extensions/TileMap/pixi-tilemap/dist/pixi-tilemap.umd.js')
    .addIncludeFile('Extensions/TileMap/collision/TransformedTileMap.js')
    .addIncludeFile('Extensions/TileMap/pako/dist/pako.min.js')
    .addIncludeFile('Extensions/TileMap/helper/TileMapHelper.js');

  object
    .addExpression(
      'TilesetColumnCount',
      _('Tileset column count'),
      _('Get the number of columns in the tileset.'),
      '',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .setFunctionName('getTilesetColumnCount');

  object
    .addExpression(
      'TilesetRowCount',
      _('Tileset row count'),
      _('Get the number of rows in the tileset.'),
      '',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .setFunctionName('getTilesetRowCount');

  object
    .addExpression(
      'TileCenterX',
      _('Scene X coordinate of tile'),
      _('Get the scene X position of the center of the tile.'),
      '',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .addParameter('number', _('Grid X'), '', false)
    .addParameter('number', _('Grid Y'), '', false)
    .setFunctionName('getSceneXCoordinateOfTileCenter');

  object
    .addExpression(
      'TileCenterY',
      _('Scene Y coordinate of tile'),
      _('Get the scene Y position of the center of the tile.'),
      '',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .addParameter('number', _('Grid X'), '', false)
    .addParameter('number', _('Grid Y'), '', false)
    .setFunctionName('getSceneYCoordinateOfTileCenter');

  object
    .addExpression(
      'GridX',
      _('Tile map grid column coordinate'),
      _(
        'Get the grid column coordinates in the tile map corresponding to the scene coordinates.'
      ),
      '',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .addParameter('number', _('Position X'), '', false)
    .addParameter('number', _('Position Y'), '', false)
    .setFunctionName('getColumnIndexAtPosition');

  object
    .addExpression(
      'GridY',
      _('Tile map grid row coordinate'),
      _(
        'Get the grid row coordinates in the tile map corresponding to the scene coordinates.'
      ),
      '',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .addParameter('number', _('Position X'), '', false)
    .addParameter('number', _('Position Y'), '', false)
    .setFunctionName('getRowIndexAtPosition');

  object
    .addExpressionAndConditionAndAction(
      'number',
      'TileIdAtPosition',
      _('Tile (at position)'),
      _('the id of the tile at the scene coordinates'),
      _('the tile id in _PARAM0_ at scene coordinates _PARAM3_ ; _PARAM4_'),
      '',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
    .addParameter('number', _('Position X'), '', false)
    .addParameter('number', _('Position Y'), '', false)
    .setFunctionName('setTileAtPosition')
    .setGetter('getTileAtPosition');

  object
    .addAction(
      'FlipTileOnYAtPosition',
      _('Flip tile vertically (at position)'),
      _('Flip tile vertically at scene coordinates.'),
      _(
        'Flip tile vertically in _PARAM0_ at scene coordinates _PARAM1_ ; _PARAM2_: _PARAM3_'
      ),
      _('Effects'),
      'res/actions/flipY24.png',
      'res/actions/flipY.png'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .addParameter('number', _('Position X'), '', false)
    .addParameter('number', _('Position Y'), '', false)
    .addParameter('yesorno', _('Flip vertically'), '', false)
    .setDefaultValue('false')
    .setFunctionName('flipTileOnYAtPosition');

  object
    .addAction(
      'FlipTileOnXAtPosition',
      _('Flip tile horizontally (at position)'),
      _('Flip tile horizontally at scene coordinates.'),
      _(
        'Flip tile horizontally in _PARAM0_ at scene coordinates _PARAM1_ ; _PARAM2_: _PARAM3_'
      ),
      _('Effects'),
      'res/actions/flipX24.png',
      'res/actions/flipX.png'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .addParameter('number', _('Position X'), '', false)
    .addParameter('number', _('Position Y'), '', false)
    .addParameter('yesorno', _('Flip horizontally'), '', false)
    .setDefaultValue('false')
    .setFunctionName('flipTileOnXAtPosition');

  object
    .addAction(
      'RemoveTileAtPosition',
      _('Remove tile (at position)'),
      _('Remove the tile at the scene coordinates.'),
      _('Remove tile in _PARAM0_ at scene coordinates _PARAM1_ ; _PARAM2_'),
      '',
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .addParameter('number', _('Position X'), '', false)
    .addParameter('number', _('Position Y'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('removeTileAtPosition');

  object
    .addExpressionAndConditionAndAction(
      'number',
      'TileIdAtGrid',
      _('Tile (on the grid)'),
      _('the id of the tile at the grid coordinates'),
      _('the tile id at grid coordinates _PARAM3_ ; _PARAM4_'),
      '',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
    .addParameter('number', _('Grid X'), '', false)
    .addParameter('number', _('Grid Y'), '', false)
    .setFunctionName('setTileAtGridCoordinates')
    .setGetter('getTileAtGridCoordinates');

  object
    .addAction(
      'FlipTileOnYAtGridCoordinates',
      _('Flip tile vertically (on the grid)'),
      _('Flip tile vertically at grid coordinates.'),
      _(
        'Flip tile vertically in _PARAM0_ at grid coordinates _PARAM1_ ; _PARAM2_: _PARAM3_'
      ),
      _('Effects'),
      'res/actions/flipY24.png',
      'res/actions/flipY.png'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .addParameter('number', _('Grid X'), '', false)
    .addParameter('number', _('Grid Y'), '', false)
    .addParameter('yesorno', _('Flip vertically'), '', false)
    .setDefaultValue('false')
    .setFunctionName('flipTileOnYAtGridCoordinates');

  object
    .addAction(
      'FlipTileOnXAtGridCoordinates',
      _('Flip tile horizontally (on the grid)'),
      _('Flip tile horizontally at grid coordinates.'),
      _(
        'Flip tile horizontally in _PARAM0_ at grid coordinates _PARAM1_ ; _PARAM2_: _PARAM3_'
      ),
      _('Effects'),
      'res/actions/flipX24.png',
      'res/actions/flipX.png'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .addParameter('number', _('Grid X'), '', false)
    .addParameter('number', _('Grid Y'), '', false)
    .addParameter('yesorno', _('Flip horizontally'), '', false)
    .setDefaultValue('false')
    .setFunctionName('flipTileOnXAtGridCoordinates');

  object
    .addAction(
      'RemoveTileAtGridCoordinates',
      _('Remove tile (on the grid)'),
      _('Remove the tile at the grid coordinates.'),
      _('Remove tile in _PARAM0_ at grid coordinates _PARAM1_ ; _PARAM2_'),
      '',
      'JsPlatform/Extensions/tile_map.svg',
      'JsPlatform/Extensions/tile_map.svg'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .addParameter('number', _('Grid X'), '', false)
    .addParameter('number', _('Grid Y'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('removeTileAtGridCoordinates');

  object
    .addCondition(
      'IsTileFlippedOnXAtPosition',
      _('Tile flipped horizontally (at position)'),
      _('Check if tile at scene coordinates is flipped horizontally.'),
      _(
        'The tile in _PARAM0_ at scene coordinates _PARAM1_ ; _PARAM2_ is flipped horizontally'
      ),
      _('Effects'),
      'res/actions/flipX24.png',
      'res/actions/flipX.png'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .addParameter('number', _('Position X'), '', false)
    .addParameter('number', _('Position Y'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('isTileFlippedOnXAtPosition');

  object
    .addCondition(
      'IsTileFlippedOnYAtPosition',
      _('Tile flipped vertically (at position)'),
      _('Check if tile at scene coordinates is flipped vertically.'),
      _(
        'The tile in _PARAM0_ at scene coordinates _PARAM1_ ; _PARAM2_ is flipped vertically'
      ),
      _('Effects'),
      'res/actions/flipY24.png',
      'res/actions/flipY.png'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .addParameter('number', _('Position X'), '', false)
    .addParameter('number', _('Position Y'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('isTileFlippedOnYAtPosition');

  object
    .addCondition(
      'IsTileFlippedOnXAtGridCoordinates',
      _('Tile flipped horizontally (on the grid)'),
      _('Check if tile at grid coordinates is flipped horizontally.'),
      _(
        'The tile in _PARAM0_ at grid coordinates _PARAM1_ ; _PARAM2_ is flipped horizontally'
      ),
      _('Effects'),
      'res/actions/flipX24.png',
      'res/actions/flipX.png'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .addParameter('number', _('Grid X'), '', false)
    .addParameter('number', _('Grid Y'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('isTileFlippedOnXAtGridCoordinates');

  object
    .addCondition(
      'IsTileFlippedOnYAtGridCoordinates',
      _('Tile flipped vertically (on the grid)'),
      _('Check if tile at grid coordinates is flipped vertically.'),
      _(
        'The tile in _PARAM0_ at grid coordinates _PARAM1_ ; _PARAM2_ is flipped vertically'
      ),
      _('Effects'),
      'res/actions/flipY24.png',
      'res/actions/flipY.png'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .addParameter('number', _('Grid X'), '', false)
    .addParameter('number', _('Grid Y'), '', false)
    .getCodeExtraInformation()
    .setFunctionName('isTileFlippedOnYAtGridCoordinates');

  object
    .addExpressionAndConditionAndAction(
      'number',
      'GridRowCount',
      _('Grid row count'),
      _('the grid row count in the tile map'),
      _('the grid row count'),
      _('Size'),
      'res/actions/scaleHeight24_black.png'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
    .setFunctionName('setGridRowCount')
    .setGetter('getGridRowCount');

  object
    .addExpressionAndConditionAndAction(
      'number',
      'GridColumnCount',
      _('Grid column count'),
      _('the grid column count in the tile map'),
      _('the grid column count'),
      _('Size'),
      'res/actions/scaleWidth24_black.png'
    )
    .addParameter('object', _('Tile map'), 'SimpleTileMap', false)
    .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
    .setFunctionName('setGridColumnCount')
    .setGetter('getGridColumnCount');
};

/**
 * @param {gd.PlatformExtension} extension
 * @param {(translationSource: string) => string} _
 * @param {GDNamespace} gd
 */
const defineCollisionMask = function (extension, _, gd) {
  var collisionMaskObject = new gd.ObjectJsImplementation();
  collisionMaskObject.updateProperty = function (propertyName, newValue) {
    const objectContent = this.content;
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
    if (propertyName === 'layerIndex') {
      objectContent.layerIndex = parseFloat(newValue);
      return true;
    }
    if (propertyName === 'useAllLayers') {
      objectContent.useAllLayers = newValue === '1';
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
  collisionMaskObject.getProperties = function () {
    const objectProperties = new gd.MapStringPropertyDescriptor();
    const objectContent = this.content;

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
      'layerIndex',
      new gd.PropertyDescriptor((objectContent.layerIndex || 1).toString())
        .setType('number')
        .setLabel(_('Layer index'))
        .setGroup(_('Layers'))
        .setAdvanced(true)
    );
    objectProperties.set(
      'useAllLayers',
      new gd.PropertyDescriptor(
        objectContent.useAllLayers ||
        objectContent.useAllLayers === undefined ||
        objectContent.useAllLayers === null
          ? 'true'
          : 'false'
      )
        .setType('boolean')
        .setLabel(_('Use all layers'))
        .setGroup(_('Layers'))
        .setAdvanced(true)
    );
    objectProperties.set(
      'debugMode',
      new gd.PropertyDescriptor(objectContent.debugMode ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Debug mode'))
        .setDescription(
          _('When activated, it displays the hitboxes in the given color.')
        )
        .setGroup(_('Appearance'))
    );
    objectProperties.set(
      'outlineColor',
      new gd.PropertyDescriptor(objectContent.outlineColor)
        .setType('color')
        .setLabel(_('Outline color'))
        .setGroup(_('Appearance'))
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
        .setGroup(_('Appearance'))
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
        .setGroup(_('Appearance'))
    );
    objectProperties.set(
      'fillColor',
      new gd.PropertyDescriptor(objectContent.fillColor)
        .setType('color')
        .setLabel(_('Fill color'))
        .setGroup(_('Appearance'))
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
        .setGroup(_('Appearance'))
    );

    return objectProperties;
  };
  collisionMaskObject.content = {
    tilemapJsonFile: '',
    tilesetJsonFile: '',
    collisionMaskTag: '',
    layerIndex: 1,
    useAllLayers: true,
    debugMode: false,
    fillColor: '255;255;255',
    outlineColor: '255;255;255',
    fillOpacity: 64,
    outlineOpacity: 128,
    outlineSize: 1,
  };

  collisionMaskObject.updateInitialInstanceProperty = function (
    instance,
    propertyName,
    newValue
  ) {
    return false;
  };
  collisionMaskObject.getInitialInstanceProperties = function (instance) {
    var instanceProperties = new gd.MapStringPropertyDescriptor();
    return instanceProperties;
  };

  const object = extension
    .addObject(
      'CollisionMask',
      _('External Tilemap (Tiled/LDtk) collision mask'),
      _('Invisible object handling collisions with parts of a tilemap.'),
      'JsPlatform/Extensions/tile_map_collision_mask32.svg',
      collisionMaskObject
    )
    .setCategoryFullName(_('Advanced'))
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
        _('Tile map'),
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
    defineSimpleTileMap(extension, _, gd);
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
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        pixiResourcesLoader
      ) {
        super(
          project,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          pixiResourcesLoader
        );

        // This setting allows tile maps with more than 16K tiles.
        Tilemap.settings.use32bitIndex = true;

        this.tileMapPixiObject = new Tilemap.CompositeTilemap();
        this._pixiObject = this.tileMapPixiObject;
        this._editableTileMap = null;

        // Implement `containsPoint` so that we can set `interactive` to true and
        // the Tilemap will properly emit events when hovered/clicked.
        // By default, this is not implemented in pixi-tilemap.
        this._pixiObject.containsPoint = (position) => {
          if (!this._pixiObject) {
            // Ease debugging by throwing now rather than waiting for an exception later.
            throw new Error(
              'containsPoint called on a destroyed PIXI object - this object was not properly removed from the PIXI container.'
            );
            return;
          }

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
      }

      onRemovedFromScene() {
        super.onRemovedFromScene();
        // Keep textures because they are shared by all tile maps.
        this._pixiObject.destroy(false);

        // Not strictly necessary, but helps finding wrong
        // handling of this._pixiObject in its container.
        this._pixiObject = null;
      }

      _replacePixiObject(newPixiObject) {
        if (this._pixiObject !== null)
          this._pixiContainer.removeChild(this._pixiObject);
        this._pixiObject = newPixiObject;
        this._pixiContainer.addChild(this._pixiObject);
      }

      _onLoadingError() {
        this.errorPixiObject =
          this.errorPixiObject ||
          new PIXI.Sprite(this._pixiResourcesLoader.getInvalidPIXITexture());

        this._replacePixiObject(this.errorPixiObject);
      }

      _onLoadingSuccess() {
        if (this.errorPixiObject) {
          this._replacePixiObject(this.tileMapPixiObject);

          this.errorPixiObject = null;
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
        const tilemapAtlasImage = this._tilemapAtlasImage;
        const tilemapJsonFile = this._tilemapJsonFile;
        const tilesetJsonFile = this._tilesetJsonFile;
        const layerIndex = this._layerIndex;
        const levelIndex = this._levelIndex;
        const displayMode = this._displayMode;

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
              if (this._wasDestroyed) return;
              if (!tileMap) {
                this._onLoadingError();
                // _loadTileMapWithCallback already log errors
                return;
              }

              this._editableTileMap = tileMap;

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
                  if (this._wasDestroyed) return;
                  if (!textureCache) {
                    this._onLoadingError();
                    // getOrLoadTextureCache already log warns and errors.
                    return;
                  }
                  this._onLoadingSuccess();
                  if (!this._editableTileMap) return;

                  this.width = this._editableTileMap.getWidth();
                  this.height = this._editableTileMap.getHeight();
                  TilemapHelper.PixiTileMapHelper.updatePixiTileMap(
                    this.tileMapPixiObject,
                    this._editableTileMap,
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
            if (this._wasDestroyed) return;
            loadTileMap();
          });
        }
      }

      /**
       * This is called to update the PIXI object on the scene editor, without reloading the tilemap.
       */
      updatePixiTileMap() {
        const tilemapAtlasImage = this._tilemapAtlasImage;
        const tilemapJsonFile = this._tilemapJsonFile;
        const tilesetJsonFile = this._tilesetJsonFile;
        const layerIndex = this._layerIndex;
        const levelIndex = this._levelIndex;
        const displayMode = this._displayMode;

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

        /** @type {TileMapHelper.TileMapManager} */
        const manager = TilemapHelper.TileMapManager.getManager(this._project);

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
            if (this._wasDestroyed) return;
            if (!textureCache) {
              this._onLoadingError();
              // getOrLoadTextureCache already log warns and errors.
              return;
            }
            this._onLoadingSuccess();
            if (!this._editableTileMap) return;

            this.width = this._editableTileMap.getWidth();
            this.height = this._editableTileMap.getHeight();
            TilemapHelper.PixiTileMapHelper.updatePixiTileMap(
              this.tileMapPixiObject,
              this._editableTileMap,
              textureCache,
              displayMode,
              layerIndex
            );
          }
        );
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
        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.ObjectJsImplementation
        );

        const tilemapAtlasImage = object.content.tilemapAtlasImage;
        const tilemapJsonFile = object.content.tilemapJsonFile;
        const tilesetJsonFile = object.content.tilesetJsonFile;
        const layerIndex = object.content.layerIndex;
        const levelIndex = object.content.levelIndex;
        const displayMode = object.content.displayMode;

        if (
          tilemapAtlasImage !== this._tilemapAtlasImage ||
          tilemapJsonFile !== this._tilemapJsonFile ||
          tilesetJsonFile !== this._tilesetJsonFile ||
          layerIndex !== this._layerIndex ||
          levelIndex !== this._levelIndex ||
          displayMode !== this._displayMode
        ) {
          this._tilemapAtlasImage = tilemapAtlasImage;
          this._tilemapJsonFile = tilemapJsonFile;
          this._tilesetJsonFile = tilesetJsonFile;
          this._layerIndex = layerIndex;
          this._levelIndex = levelIndex;
          this._displayMode = displayMode;
          this.updateTileMap();
        }

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

        // Update the opacity, if needed.
        // Do not hide completely an object so it can still be manipulated
        const alphaForDisplay = Math.max(
          this._instance.getOpacity() / 255,
          0.5
        );

        if (
          this._editableTileMap &&
          this._pixiObject.alpha !== alphaForDisplay
        ) {
          this._pixiObject.alpha = alphaForDisplay;
          for (const layer of this._editableTileMap.getLayers()) {
            // Only update layers that are of type TileMapHelper.EditableTileMapLayer.
            // @ts-ignore - only this type of layer has setAlpha.
            if (layer.setAlpha) {
              const editableLayer = /** @type {TileMapHelper.EditableTileMapLayer} */ (layer);
              editableLayer.setAlpha(alphaForDisplay);
            }
          }
          // Only update the tilemap if the alpha has changed.
          this.updatePixiTileMap();
        }
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
     * Renderer for instances of SimpleTileMap inside the IDE.
     */
    class RenderedSimpleTileMapInstance extends RenderedInstance {
      _getStartedText = 'Select this instance\nto start painting';
      _noAtlasText = 'Set up an atlas image\nin the tilemap object.';
      _placeholderTextPixiObject = new PIXI.Text(
        '',
        new PIXI.TextStyle({
          fontFamily: 'Arial',
          fontSize: 16,
          align: 'center',
          padding: 5,
        })
      );
      _placeholderImagePixiObject = new PIXI.Sprite(
        PIXI.Texture.from(
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAADFBMVEUAAAAkMoYsfqH///8FP6xgAAAAAXRSTlMAQObYZgAAAAFiS0dEAxEMTPIAAAAjSURBVBjTpcYxAQAADIMwTGISlTsmoVcCQClzSmvNo2ueGnMajGpBwI5BnwAAAABJRU5ErkJggg=='
        )
      );
      _placeholderPixiObject = new PIXI.Container();

      constructor(
        project,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        pixiResourcesLoader
      ) {
        super(
          project,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          pixiResourcesLoader
        );

        // This setting allows tile maps with more than 16K tiles.
        Tilemap.settings.use32bitIndex = true;

        this.tileMapPixiObject = new Tilemap.CompositeTilemap();
        this._pixiObject = new PIXI.Container();
        this._pixiObject.addChild(this.tileMapPixiObject);
        this._editableTileMap = null;

        // Implement `containsPoint` so that we can set `interactive` to true and
        // the Tilemap will properly emit events when hovered/clicked.
        // By default, this is not implemented in pixi-tilemap.
        this._pixiObject.containsPoint = (position) => {
          if (!this._pixiObject) {
            // Ease debugging by throwing now rather than waiting for an exception later.
            throw new Error(
              'containsPoint called on a destroyed PIXI object - this object was not properly removed from the PIXI container.'
            );
            return;
          }

          // Turns the world position to the local object coordinates
          const localPosition = new PIXI.Point();
          if (this.tileMapPixiObject.visible) {
            this.tileMapPixiObject.worldTransform.applyInverse(
              position,
              localPosition
            );
          } else {
            this._placeholderImagePixiObject.worldTransform.applyInverse(
              position,
              localPosition
            );
          }

          return (
            localPosition.x >= 0 &&
            localPosition.x < this.width &&
            localPosition.y >= 0 &&
            localPosition.y < this.height
          );
        };
        this._placeholderTextPixiObject.interactive = true;
        this._placeholderImagePixiObject.interactive = true;
        this._placeholderTextPixiObject.anchor.x = 0.5;
        this._placeholderTextPixiObject.anchor.y = 0.5;
        this._placeholderTextPixiObject.y = 30;
        this._placeholderImagePixiObject.y = -30;
        this._placeholderImagePixiObject.x = -16;
        this._placeholderPixiObject.addChild(this._placeholderTextPixiObject);
        this._placeholderPixiObject.addChild(this._placeholderImagePixiObject);
        this._pixiObject.addChild(this._placeholderPixiObject);
        this._pixiContainer.addChild(this._pixiObject);
        this.width = 48;
        this.height = 48;
        this._objectName = instance.getObjectName();
        this.update();
        this.updateTileMap();
      }

      onRemovedFromScene() {
        super.onRemovedFromScene();
        // Keep textures because they are shared by all tile maps.
        this._pixiObject.destroy(false);

        // Not strictly necessary, but helps finding wrong
        // handling of this._pixiObject in its container.
        this._pixiObject = null;
      }

      _replacePixiObject(newPixiObject) {
        if (this._pixiObject !== null)
          this._pixiContainer.removeChild(this._pixiObject);
        this._pixiObject = newPixiObject;
        this._pixiContainer.addChild(this._pixiObject);
      }

      _onLoadingError() {
        this.errorPixiObject =
          this.errorPixiObject ||
          new PIXI.Sprite(this._pixiResourcesLoader.getInvalidPIXITexture());

        this._replacePixiObject(this.errorPixiObject);
      }

      _onLoadingSuccess() {
        if (this.errorPixiObject) {
          this._replacePixiObject(this.tileMapPixiObject);

          this.errorPixiObject = null;
        }
      }

      /**
       * Return the path to the thumbnail of the specified object.
       */
      static getThumbnail(project, resourcesLoader, objectConfiguration) {
        const object = gd.castObject(
          objectConfiguration,
          gd.ObjectJsImplementation
        );

        const atlasImageResourceName = object.content.atlasImage || '';
        return resourcesLoader.getResourceFullUrl(
          project,
          atlasImageResourceName,
          {}
        );
      }

      getEditableTileMap() {
        return this._editableTileMap;
      }

      /**
       * This is used to reload the Tilemap
       */
      updateTileMap() {
        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.ObjectJsImplementation
        );
        const atlasImageResourceName = object.content.atlasImage;
        if (!atlasImageResourceName) return;

        const tilemapAsJSObject = JSON.parse(
          this._instance.getRawStringProperty('tilemap') || '{}'
        );

        const tileSize = object.content.tileSize;
        const columnCount = object.content.columnCount;
        const rowCount = object.content.rowCount;

        const atlasTexture = this._pixiResourcesLoader.getPIXITexture(
          this._project,
          atlasImageResourceName
        );

        const loadTileMap = () => {
          /** @type {TileMapHelper.TileMapManager} */
          const manager = TilemapHelper.TileMapManager.getManager(
            this._project
          );
          try {
            manager.getOrLoadSimpleTileMap(
              tilemapAsJSObject,
              this._objectName,
              tileSize,
              columnCount,
              rowCount,
              (tileMap) => {
                if (this._wasDestroyed) return;
                if (!tileMap) {
                  this._onLoadingError();
                  console.error('Could not parse tilemap.');
                  return;
                }

                this._editableTileMap = tileMap;

                manager.getOrLoadSimpleTileMapTextureCache(
                  (textureName) =>
                    this._pixiResourcesLoader.getPIXITexture(
                      this._project,
                      textureName
                    ),
                  atlasImageResourceName,
                  tileSize,
                  columnCount,
                  rowCount,
                  (
                    /** @type {TileMapHelper.TileTextureCache | null} */
                    textureCache
                  ) => {
                    if (this._wasDestroyed) return;
                    this._onLoadingSuccess();
                    if (!this._editableTileMap) return;

                    this.width = this._editableTileMap.getWidth();
                    this.height = this._editableTileMap.getHeight();
                    TilemapHelper.PixiTileMapHelper.updatePixiTileMap(
                      this.tileMapPixiObject,
                      this._editableTileMap,
                      textureCache,
                      'all', // No notion of visibility on simple tile maps.
                      0 // Only one layer is used on simple tile maps.
                    );
                  }
                );
              }
            );
          } catch (error) {
            this._onLoadingError();
            console.error('Could not load tilemap:', error);
          }
        };

        if (atlasTexture.valid) {
          loadTileMap();
        } else {
          // Wait for the atlas image to load.
          atlasTexture.once('update', () => {
            if (this._wasDestroyed) return;
            loadTileMap();
          });
        }
      }

      /**
       * This is called to update the PIXI object on the scene editor, without reloading the tilemap.
       */
      updatePixiTileMap() {
        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.ObjectJsImplementation
        );

        const atlasImageResourceName = object.content.atlasImage;

        const tileSize = object.content.tileSize;
        const columnCount = object.content.columnCount;
        const rowCount = object.content.rowCount;
        /** @type {TileMapHelper.TileMapManager} */
        const manager = TilemapHelper.TileMapManager.getManager(this._project);

        manager.getOrLoadSimpleTileMapTextureCache(
          (textureName) =>
            this._pixiResourcesLoader.getPIXITexture(
              this._project,
              textureName
            ),
          atlasImageResourceName,
          tileSize,
          columnCount,
          rowCount,
          (
            /** @type {TileMapHelper.TileTextureCache | null} */
            textureCache
          ) => {
            if (this._wasDestroyed) return;
            this._onLoadingSuccess();
            if (!this._editableTileMap) return;

            this.width = this._editableTileMap.getWidth();
            this.height = this._editableTileMap.getHeight();
            TilemapHelper.PixiTileMapHelper.updatePixiTileMap(
              this.tileMapPixiObject,
              this._editableTileMap,
              textureCache,
              'all',
              0
            );
          }
        );
      }

      /**
       * This is called to update the PIXI object on the scene editor
       */
      update() {
        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.ObjectJsImplementation
        );
        const atlasImageResourceName = object.content.atlasImage;

        const isTileMapEmpty = this._editableTileMap
          ? this._editableTileMap.isEmpty()
          : false;
        let objectToChange;
        if (this.errorPixiObject) {
          objectToChange = this.errorPixiObject;
        } else if (isTileMapEmpty || !atlasImageResourceName) {
          this.tileMapPixiObject.visible = false;
          this._placeholderPixiObject.visible = true;
          this._placeholderTextPixiObject.text = !atlasImageResourceName
            ? this._noAtlasText
            : this._getStartedText;
          objectToChange = this._placeholderPixiObject;
        } else {
          this._placeholderPixiObject.visible = false;
          this.tileMapPixiObject.visible = true;
          objectToChange = this.tileMapPixiObject;
        }

        if (!isTileMapEmpty) {
          // Don't change size of placeholder object.
          if (this._instance.hasCustomSize()) {
            objectToChange.scale.x = this.getCustomWidth() / this.width;
            objectToChange.scale.y = this.getCustomHeight() / this.height;
          } else {
            objectToChange.scale.x = 1;
            objectToChange.scale.y = 1;
          }

          // Place the center of rotation in the center of the object. Because pivot position in Pixi
          // is in the **local coordinates of the object**, we need to find back the original width
          // and height of the object before scaling (then divide by 2 to find the center)
          const originalWidth = this.width;
          const originalHeight = this.height;
          objectToChange.pivot.x = originalWidth / 2;
          objectToChange.pivot.y = originalHeight / 2;
        }
        // Modifying the pivot position also has an impact on the transform. The instance (X,Y) position
        // of this object refers to the top-left point, but now in Pixi, as we changed the pivot, the Pixi
        // object (X,Y) position refers to the center. So we add an offset to convert from top-left to center.
        objectToChange.x =
          this._instance.getX() +
          objectToChange.pivot.x * objectToChange.scale.x;
        objectToChange.y =
          this._instance.getY() +
          objectToChange.pivot.y * objectToChange.scale.y;

        // Rotation works as intended because we put the pivot in the center
        objectToChange.rotation = RenderedInstance.toRad(
          this._instance.getAngle()
        );

        // Update the opacity, if needed.
        // Do not hide completely an object so it can still be manipulated
        const alphaForDisplay = Math.max(
          this._instance.getOpacity() / 255,
          0.5
        );

        if (this._editableTileMap && objectToChange.alpha !== alphaForDisplay) {
          objectToChange.alpha = alphaForDisplay;
          for (const layer of this._editableTileMap.getLayers()) {
            // Only update layers that are of type TileMapHelper.EditableTileMapLayer.
            // @ts-ignore - only this type of layer has setAlpha.
            if (layer.setAlpha) {
              const editableLayer = /** @type {TileMapHelper.EditableTileMapLayer} */ (layer);
              editableLayer.setAlpha(alphaForDisplay);
            }
          }
          this.updatePixiTileMap();
        }
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
      'TileMap::SimpleTileMap',
      RenderedSimpleTileMapInstance
    );

    /**
     * Renderer for instances of TileMap collision mask inside the IDE.
     */
    class RenderedCollisionMaskInstance extends RenderedInstance {
      _tilemapJsonFile = '';
      _tilesetJsonFile = '';
      _collisionMaskTag = '';
      _layerIndex = null;
      _outlineColor = 0xffffff;
      _fillColor = 0xffffff;
      _outlineOpacity = 0;
      _fillOpacity = 0;
      _outlineSize = 1;

      constructor(
        project,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        pixiResourcesLoader
      ) {
        super(
          project,
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
          if (!this._pixiObject) {
            // Ease debugging by throwing now rather than waiting for an exception later.
            throw new Error(
              'containsPoint called on a destroyed PIXI object - this object was not properly removed from the PIXI container.'
            );
            return;
          }

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
      }

      onRemovedFromScene() {
        super.onRemovedFromScene();
        this._pixiObject.destroy();

        // Not strictly necessary, but helps finding wrong
        // handling of this._pixiObject in its container.
        this._pixiObject = null;
      }

      _replacePixiObject(newPixiObject) {
        if (this._pixiObject !== null)
          this._pixiContainer.removeChild(this._pixiObject);
        this._pixiObject = newPixiObject;
        this._pixiContainer.addChild(this._pixiObject);
      }

      _onLoadingError() {
        this.errorPixiObject =
          this.errorPixiObject ||
          new PIXI.Sprite(this._pixiResourcesLoader.getInvalidPIXITexture());

        this._replacePixiObject(this.errorPixiObject);
      }

      _onLoadingSuccess() {
        if (this.errorPixiObject) {
          this._replacePixiObject(this.tileMapPixiObject);

          this.errorPixiObject = null;
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
        const tilemapJsonFile = this._tilemapJsonFile;
        const tilesetJsonFile = this._tilesetJsonFile;
        const collisionMaskTag = this._collisionMaskTag;
        const layerIndex = this._layerIndex;
        const outlineColor = this._outlineColor;
        const fillColor = this._fillColor;
        const outlineOpacity = this._outlineOpacity;
        const fillOpacity = this._fillOpacity;
        const outlineSize = this._outlineSize;

        /** @type {TileMapHelper.TileMapManager} */
        const manager = TilemapHelper.TileMapManager.getManager(this._project);
        manager.getOrLoadTileMap(
          this._loadTiledMapWithCallback.bind(this),
          tilemapJsonFile,
          tilesetJsonFile,
          0, // levelIndex
          pako,
          (tileMap) => {
            if (this._wasDestroyed) return;
            if (!tileMap) {
              this._onLoadingError();
              // _loadTiledMapWithCallback already log errors
              return;
            }
            this._onLoadingSuccess();

            this.width = tileMap.getWidth();
            this.height = tileMap.getHeight();
            TilemapHelper.PixiTileMapHelper.updatePixiCollisionMask(
              this._pixiObject,
              tileMap,
              collisionMaskTag,
              layerIndex,
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
        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.ObjectJsImplementation
        );

        const tilemapJsonFile = object.content.tilemapJsonFile;
        const tilesetJsonFile = object.content.tilesetJsonFile;
        const collisionMaskTag = object.content.collisionMaskTag;
        const useAllLayers = object.content.useAllLayers;
        const layerIndex = useAllLayers ? null : object.content.layerIndex;
        const outlineColor = objectsRenderingService.rgbOrHexToHexNumber(
          object.content.outlineColor
        );
        const fillColor = objectsRenderingService.rgbOrHexToHexNumber(
          object.content.fillColor
        );
        const outlineOpacity = object.content.outlineOpacity / 255;
        const fillOpacity = object.content.fillOpacity / 255;
        const outlineSize = object.content.outlineSize || 0;

        if (
          tilemapJsonFile !== this._tilemapJsonFile ||
          tilesetJsonFile !== this._tilesetJsonFile ||
          collisionMaskTag !== this._collisionMaskTag ||
          layerIndex !== this._layerIndex ||
          outlineColor !== this._outlineColor ||
          fillColor !== this._fillColor ||
          outlineOpacity !== this._outlineOpacity ||
          fillOpacity !== this._fillOpacity ||
          outlineSize !== this._outlineSize
        ) {
          this._tilemapJsonFile = tilemapJsonFile;
          this._tilesetJsonFile = tilesetJsonFile;
          this._collisionMaskTag = collisionMaskTag;
          this._layerIndex = layerIndex;
          this._outlineColor = outlineColor;
          this._fillColor = fillColor;
          this._outlineOpacity = outlineOpacity;
          this._fillOpacity = fillOpacity;
          this._outlineSize = outlineSize;
          this.updateTileMap();
        }

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
