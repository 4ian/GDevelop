import { integer } from "../../model/CommonTypes";

/**
 * version 1.1.3 - https://github.com/deepnight/ldtk/blob/66fff7199932357f3ab9b044c2fc2a856f527831/docs/JSON_SCHEMA.json
 */
export type LDtkTileMap = {
  /** LDtk application build identifier.<br/>  This is only used to identify the LDtk version that generated this particular project file, which can be useful for specific bug fixing. Note that the build identifier is just the date of the release, so it's not unique to each user (one single global ID per LDtk public release), and as a result, completely anonymous. */
  appBuildId: number;
  /** Number of backup files to keep, if the `backupOnSave` is TRUE */
  backupLimit: integer;
  /** If TRUE, an extra copy of the project will be created in a sub folder, when saving. */
  backupOnSave: boolean;
  /** Project background color */
  bgColor: string;
  /** Default grid size for new layers */
  defaultGridSize: integer;
  /** Default background color of levels */
  defaultLevelBgColor: string;
  /** **WARNING**: this field will move to the `worlds` array after the \"multi-worlds\" update. It will then be `null`. You can enable the Multi-worlds advanced project option to enable the change immediately.<br/><br/>  Default new level height */
  defaultLevelHeight: integer | null;
  /** **WARNING**: this field will move to the `worlds` array after the \"multi-worlds\" update. It will then be `null`. You can enable the Multi-worlds advanced project option to enable the change immediately.<br/><br/>  Default new level width */
  defaultLevelWidth: integer | null;
  /** Default X pivot (0 to 1) for new entities */
  defaultPivotX: number;
  /** Default Y pivot (0 to 1) for new entities */
  defaultPivotY: number;
  /** A structure containing all the definitions of this project */
  defs: LDtkDefinition;
  /** **WARNING**: this deprecated value is no longer exported since version 0.9.3  Replaced by: `imageExportMode` */
  exportPng: boolean | null;
  /** If TRUE, a Tiled compatible file will also be generated along with the LDtk JSON file (default is FALSE) */
  exportTiled: boolean;
  /** If TRUE, one file will be saved for the project (incl. all its definitions) and one file in a sub-folder for each level. */
  externalLevels: boolean;
  /** An array containing various advanced flags (ie. options or other states). Possible values: `DiscardPreCsvIntGrid`, `ExportPreCsvIntGridFormat`, `IgnoreBackupSuggest`, `PrependIndexToLevelFileNames`, `MultiWorlds`, `UseMultilinesType` */
  flags: LDtkFlag[];
  /** Naming convention for Identifiers (first-letter uppercase, full uppercase etc.) Possible values: `Capitalize`, `Uppercase`, `Lowercase`, `Free` */
  identifierStyle: "Capitalize" | "Uppercase" | "Lowercase" | "Free";
  /** \"Image export\" option when saving project. Possible values: `None`, `OneImagePerLayer`, `OneImagePerLevel`, `LayersAndLevels` */
  imageExportMode:
    | "None"
    | "OneImagePerLayer"
    | "OneImagePerLevel"
    | "LayersAndLevels";
  /** File format version */
  jsonVersion: string;
  /** The default naming convention for level identifiers. */
  levelNamePattern: string;
  /** All levels. The order of this array is only relevant in `LinearHorizontal` and `linearVertical` world layouts (see `worldLayout` value).<br/>  Otherwise, you should refer to the `worldX`,`worldY` coordinates of each Level. */
  levels: LDtkLevel[];
  /** If TRUE, the Json is partially minified (no indentation, nor line breaks, default is FALSE) */
  minifyJson: boolean;
  /** Next Unique integer ID available */
  nextUid: integer;
  /** File naming pattern for exported PNGs */
  pngFilePattern: string | null;
  /** If TRUE, a very simplified will be generated on saving, for quicker & easier engine integration. */
  simplifiedExport: boolean;
  /** This optional description is used by LDtk Samples to show up some informations and instructions. */
  tutorialDesc: string | null;
  /** This array is not used yet in current LDtk version (so, for now, it's always empty).<br/><br/>In a later update, it will be possible to have multiple Worlds in a single project, each containing multiple Levels.<br/><br/>What will change when \"Multiple worlds\" support will be added to LDtk:<br/><br/> - in current version, a LDtk project file can only contain a single world with multiple levels in it. In this case, levels and world layout related settings are stored in the root of the JSON.<br/> - after the \"Multiple worlds\" update, there will be a `worlds` array in root, each world containing levels and layout settings. Basically, it's pretty much only about moving the `levels` array to the `worlds` array, along with world layout related values (eg. `worldGridWidth` etc).<br/><br/>If you want to start supporting this future update easily, please refer to this documentation: https://github.com/deepnight/ldtk/issues/231 */
  worlds: LDtkWorld[];
  /** **WARNING**: this field will move to the `worlds` array after the \"multi-worlds\" update. It will then be `null`. You can enable the Multi-worlds advanced project option to enable the change immediately.<br/><br/>  Height of the world grid in pixels. */
  worldGridHeight: integer | null;
  /** **WARNING**: this field will move to the `worlds` array after the \"multi-worlds\" update. It will then be `null`. You can enable the Multi-worlds advanced project option to enable the change immediately.<br/><br/>  Width of the world grid in pixels. */
  worldGridWidth: integer | null;
  /** **WARNING**: this field will move to the `worlds` array after the \"multi-worlds\" update. It will then be `null`. You can enable the Multi-worlds advanced project option to enable the change immediately.<br/><br/>  An enum that describes how levels are organized in this project (ie. linearly or in a 2D space). Possible values: &lt;`null`&gt;, `Free`, `GridVania`, `LinearHorizontal`, `LinearVertical` */
  worldLayout:
    | "Free"
    | "GridVania"
    | "LinearHorizontal"
    | "LinearVertical"
    | null;
};

/** Auto-layer rule group */
type LDtkAutoLayerRuleGroup = {
  /**  */
  active: boolean;
  /** *This field was removed in 1.0.0 and should no longer be used.* */
  collapsed: boolean | null;
  /**  */
  isOptional: boolean;
  /**  */
  name: string;
  /**  */
  rules: LDtkAutoRuleDef[];
  /**  */
  uid: integer;
};

/** This complex section isn't meant to be used by game devs at all, as these rules are completely resolved internally by the editor before any saving. You should just ignore this part. */
type LDtkAutoRuleDef = {};

/** If you're writing your own LDtk importer, you should probably just ignore *most* stuff in the `defs` section, as it contains data that are mostly important to the editor. To keep you away from the `defs` section and avoid some unnecessary JSON parsing, important data from definitions is often duplicated in fields prefixed with a double underscore (eg. `__identifier` or `__type`).  The 2 only definition types you might need here are **Tilesets** and **Enums**. */
type LDtkDefinition = {
  /** All entities definitions, including their custom fields */
  entities: LDtkEntityDef[];
  /** All internal enums */
  enums: LDtkEnumDef[];
  /** Note: external enums are exactly the same as `enums`, except they have a `relPath` to point to an external source file. */
  externalEnums: LDtkEnumDef[];
  /** All layer definitions */
  layers: LDtkLayerDef[];
  /** All custom fields available to all levels. */
  levelFields: LDtkFieldDef[];
  /** All tilesets */
  tilesets: LDtkTilesetDef[];
};

/** Entity definition */
type LDtkEntityDef = {
  /** Base entity color */
  color: string;
  /** Array of field definitions */
  fieldDefs: LDtkFieldDef[];
  /**  */
  fillOpacity: number;
  /** Pixel height */
  height: integer;
  /**  */
  hollow: boolean;
  /** User defined unique identifier */
  identifier: string;
  /** Only applies to entities resizable on both X/Y. If TRUE, the entity instance width/height will keep the same aspect ratio as the definition. */
  keepAspectRatio: boolean;
  /** Possible values: `DiscardOldOnes`, `PreventAdding`, `MoveLastOne` */
  limitBehavior: "DiscardOldOnes" | "MoveLastOne" | "PreventAdding";
  /** If TRUE, the maxCount is a \"per world\" limit, if FALSE, it's a \"per level\". Possible values: `PerLayer`, `PerLevel`, `PerWorld` */
  limitScope: "PerLayer" | "PerLevel" | "PerWorld";
  /**  */
  lineOpacity: number;
  /** Max instances count */
  maxCount: integer;
  /** An array of 4 dimensions for the up/right/down/left borders (in this order) when using 9-slice mode for `tileRenderMode`.<br/>  If the tileRenderMode is not NineSlice, then this array is empty.<br/>  See: https://en.wikipedia.org/wiki/9-slice_scaling */
  nineSliceBorders: integer[];
  /** Pivot X coordinate (from 0 to 1.0) */
  pivotX: number;
  /** Pivot Y coordinate (from 0 to 1.0) */
  pivotY: number;
  /** Possible values: `Rectangle`, `Ellipse`, `Tile`, `Cross` */
  renderMode: "Cross" | "Ellipse" | "Rectangle" | "Ellipse";
  /** If TRUE, the entity instances will be resizable horizontally */
  resizableX: boolean;
  /** If TRUE, the entity instances will be resizable vertically */
  resizableY: boolean;
  /** Display entity name in editor */
  showName: boolean;
  /** An array of strings that classifies this entity */
  tags: string[];
  /** **WARNING**: this deprecated value will be *removed* completely on version 1.2.0+  Replaced by: `tileRect` */
  tileId: integer | null;
  /**  */
  tileOpacity: number;
  /** An object representing a rectangle from an existing Tileset */
  tileRect: LDtkTilesetRect | null;
  /** An enum describing how the the Entity tile is rendered inside the Entity bounds. Possible values: `Cover`, `FitInside`, `Repeat`, `Stretch`, `FullSizeCropped`, `FullSizeUncropped`, `NineSlice` */
  tileRenderMode:
    | "Cover"
    | "FitInside"
    | "FullSizeCropped"
    | "FullSizeUncropped"
    | "NineSlice"
    | "Repeat"
    | "Stretch";
  /** Tileset ID used for optional tile display */
  tilesetId: integer | null;
  /** Unique Int identifier */
  uid: integer;
  /** Pixel width */
  width: integer;
};

/** Entity instance */
type LDtkEntityInstance = {
  /** Grid-based coordinates (`[x,y]` format) */
  __grid: integer[];
  /** Entity definition identifier */
  __identifier: string;
  /** Pivot coordinates  (`[x,y]` format, values are from 0 to 1) of the Entity */
  __pivot: number[];
  /** The entity \"smart\" color, guessed from either Entity definition, or one its field instances. */
  __smartColor: string;
  /** Array of tags defined in this Entity definition */
  __tags: string[];
  /** Optional TilesetRect used to display this entity (it could either be the default Entity tile, or some tile provided by a field value, like an Enum). */
  __tile: LDtkTilesetRect | null;
  /** Reference of the **Entity definition** UID */
  defUid: integer;
  /** An array of all custom fields and their values. */
  fieldInstances: LDtkFieldInstance[];
  /** Entity height in pixels. For non-resizable entities, it will be the same as Entity definition. */
  height: integer;
  /** Unique instance identifier */
  iid: string;
  /** Pixel coordinates (`[x,y]` format) in current level coordinate space. Don't forget optional layer offsets, if they exist! */
  px: integer[];
  /** Entity width in pixels. For non-resizable entities, it will be the same as Entity definition. */
  width: integer;
};

/** Enum definition */
type LDtkEnumDef = {
  /**  */
  externalFileChecksum: string | null;
  /** Relative path to the external file providing this Enum */
  externalRelPath: string | null;
  /** Tileset UID if provided */
  iconTilesetUid: integer | null;
  /** User defined unique identifier */
  identifier: string;
  /** An array of user-defined tags to organize the Enums */
  tags: string[];
  /** Unique Int identifier */
  uid: integer;
  /** All possible enum values, with their optional Tile infos. */
  values: LDtkEnumDefValues[];
};

/** Enum value definition */
type LDtkEnumDefValues = {
  /** An array of 4 Int values that refers to the tile in the tileset image: `[ x, y, width, height ]` */
  __tileSrcRect: integer[] | null;
  /** Optional color */
  color: integer;
  /** Enum value */
  id: string;
  /** The optional ID of the tile */
  tileId: integer | null;
};

/** In a tileset definition, enum based tag infos */
type LDtkEnumTagValue = {
  /**  */
  enumValueId: string;
  /**  */
  tileIds: integer[];
};

/** This section is mostly only intended for the LDtk editor app itself. You can safely ignore it. */
type LDtkFieldDef = {
  /** Human readable value type. Possible values: `Int, Float, String, Bool, Color, ExternEnum.XXX, LocalEnum.XXX, Point, FilePath`.<br/>  If the field is an array, this field will look like `Array<...>` (eg. `Array<Int>`, `Array<Point>` etc.)<br/>  NOTE: if you enable the advanced option **Use Multilines type**, you will have \"*Multilines*\" instead of \"*String*\" when relevant. */
  __type: string;
  /** Optional list of accepted file extensions for FilePath value type. Includes the dot: `.ext` */
  acceptFileTypes: string[] | null;
  /** Possible values: `Any`, `OnlySame`, `OnlyTags` */
  allowedRefs: "Any" | "OnlySame" | "OnlyTags";
  /**  */
  allowedRefTags: string[];
  /**  */
  allowOutOfLevelRef: boolean;
  /** Array max length */
  arrayMaxLength: integer | null;
  /** Array min length */
  arrayMinLength: integer | null;
  /**  */
  autoChainRef: boolean;
  /** TRUE if the value can be null. For arrays, TRUE means it can contain null values (exception: array of Points can't have null values). */
  canBeNull: boolean;
  /** Default value if selected value is null or invalid. */
  defaultOverride: any | null;
  /**  */
  editorAlwaysShow: boolean;
  /**  */
  editorCutLongValues: boolean;
  /** Possible values: `Hidden`, `ValueOnly`, `NameAndValue`, `EntityTile`, `Points`, `PointStar`, `PointPath`, `PointPathLoop`, `RadiusPx`, `RadiusGrid`, `ArrayCountWithLabel`, `ArrayCountNoLabel`, `RefLinkBetweenPivots`, `RefLinkBetweenCenters` */
  editorDisplayMode:
    | "ArrayCountNoLabel"
    | "ArrayCountWithLabel"
    | "EntityTile"
    | "Hidden"
    | "NameAndValue"
    | "PointPath"
    | "PointPathLoop"
    | "PointStar"
    | "Points"
    | "RadiusGrid"
    | "RadiusPx"
    | "RefLinkBetweenCenters"
    | "RefLinkBetweenPivots"
    | "ValueOnly";
  /** Possible values: `Above`, `Center`, `Beneath` */
  editorDisplayPos: "Above" | "Beneath" | "Center";
  /**  */
  editorTextPrefix: string | null;
  /**  */
  editorTextSuffix: string | null;
  /** User defined unique identifier */
  identifier: string;
  /** TRUE if the value is an array of multiple values */
  isArray: boolean;
  /** Max limit for value, if applicable */
  max: number | null;
  /** Min limit for value, if applicable */
  min: number | null;
  /** Optional regular expression that needs to be matched to accept values. Expected format: `/some_reg_ex/g`, with optional \"i\" flag. */
  regex: string | null;
  /**  */
  symmetricalRef: boolean;
  /** Possible values: &lt;`null`&gt;, `LangPython`, `LangRuby`, `LangJS`, `LangLua`, `LangC`, `LangHaxe`, `LangMarkdown`, `LangJson`, `LangXml`, `LangLog` */
  textLanguageMode:
    | "LangC"
    | "LangHaxe"
    | "LangJS"
    | "LangJson"
    | "LangLog"
    | "LangLua"
    | "LangMarkdown"
    | "LangPython"
    | "LangRuby"
    | "LangXml"
    | null;
  /** UID of the tileset used for a Tile */
  tilesetUid: integer | null;
  /** Internal enum representing the possible field types. Possible values: F_Int, F_Float, F_String, F_Text, F_Bool, F_Color, F_Enum(...), F_Point, F_Path, F_EntityRef, F_Tile */
  type: string;
  /** Unique Int identifier */
  uid: integer;
  /** If TRUE, the color associated with this field will override the Entity or Level default color in the editor UI. For Enum fields, this would be the color associated to their values. */
  useForSmartColor: boolean;
};

/** Field instance */
type LDtkFieldInstance = {
  /** Field definition identifier */
  __identifier: string;
  /** Optional TilesetRect used to display this field (this can be the field own Tile, or some other Tile guessed from the value, like an Enum). */
  __tile: LDtkTilesetRect | null;
  /** Type of the field, such as `Int`, `Float`, `String`, `Enum(my_enum_name)`, `Bool`, etc.<br/>  NOTE: if you enable the advanced option **Use Multilines type**, you will have \"*Multilines*\" instead of \"*String*\" when relevant. */
  __type: string;
  /** Actual value of the field instance. The value type varies, depending on `__type`:<br/>   - For **classic types** (ie. Integer, Float, Boolean, String, Text and FilePath), you just get the actual value with the expected type.<br/>   - For **Color**, the value is an hexadecimal string using \"#rrggbb\" format.<br/>   - For **Enum**, the value is a String representing the selected enum value.<br/>   - For **Point**, the value is a [GridPoint](#ldtk-GridPoint) object.<br/>   - For **Tile**, the value is a [TilesetRect](#ldtk-TilesetRect) object.<br/>   - For **EntityRef**, the value is an [EntityReferenceInfos](#ldtk-EntityReferenceInfos) object.<br/><br/>  If the field is an array, then this `__value` will also be a JSON array. */
  __value: any;
  /** Reference of the **Field definition** UID */
  defUid: integer;
  /** Editor internal raw values */
  realEditorValues: any[];
};

type LDtkFlag =
  | "DiscardPreCsvIntGrid"
  | "ExportPreCsvIntGridFormat"
  | "IgnoreBackupSuggest"
  | "PrependIndexToLevelFileNames"
  | "MultiWorlds"
  | "UseMultilinesType";

/** IntGrid value definition */
type LDtkIntGridValueDef = {
  /**  */
  color: string;
  /** User defined unique identifier */
  identifier: string | null;
  /** The IntGrid value itself */
  value: integer;
};

/** IntGrid value instance */
type LDtkIntGridValueInstance = {
  /** Coordinate ID in the layer grid */
  coordId: integer;
  /** IntGrid value */
  v: integer;
};

/** Layer definition */
type LDtkLayerDef = {
  /** Type of the layer (*IntGrid, Entities, Tiles or AutoLayer*) */
  __type: string;
  /** Contains all the auto-layer rule definitions. */
  autoRuleGroups: LDtkAutoLayerRuleGroup[];
  /**  */
  autoSourceLayerDefUid: integer | null;
  /** **WARNING**: this deprecated value will be *removed* completely on version 1.2.0+  Replaced by: `tilesetDefUid` */
  autoTilesetDefUid: integer | null;
  /** Opacity of the layer (0 to 1.0) */
  displayOpacity: number;
  /** An array of tags to forbid some Entities in this layer */
  excludedTags: string[];
  /**  Width and height of the grid in pixels*/
  gridSize: integer;
  /** Height of the optional \"guide\" grid in pixels */
  guideGridHei: integer;
  /** Width of the optional \"guide\" grid in pixels */
  guideGridWid: integer;
  /**  */
  hideFieldsWhenInactive: boolean;
  /** Hide the layer from the list on the side of the editor view. */
  hideInList: boolean;
  /** User defined unique identifier */
  identifier: string;
  /** Alpha of this layer when it is not the active one. */
  inactiveOpacity: number;
  /** An array that defines extra optional info for each IntGrid value.<br/>  WARNING: the array order is not related to actual IntGrid values! As user can re-order IntGrid values freely, you may value \"2\" before value \"1\" in this array. */
  intGridValues: LDtkIntGridValueDef[];
  /** Parallax horizontal factor (from -1 to 1, defaults to 0) which affects the scrolling speed of this layer, creating a fake 3D (parallax) effect. */
  parallaxFactorX: number;
  /** Parallax vertical factor (from -1 to 1, defaults to 0) which affects the scrolling speed of this layer, creating a fake 3D (parallax) effect. */
  parallaxFactorY: number;
  /** If true (default), a layer with a parallax factor will also be scaled up/down accordingly. */
  parallaxScaling: boolean;
  /** X offset of the layer, in pixels (IMPORTANT: this should be added to the `LayerInstance` optional offset) */
  pxOffsetX: integer;
  /** Y offset of the layer, in pixels (IMPORTANT: this should be added to the `LayerInstance` optional offset) */
  pxOffsetY: integer;
  /** An array of tags to filter Entities that can be added to this layer */
  requiredTags: string[];
  /** If the tiles are smaller or larger than the layer grid, the pivot value will be used to position the tile relatively its grid cell. */
  tilePivotX: number;
  /**  If the tiles are smaller or larger than the layer grid, the pivot value will be used to position the tile relatively its grid cell.*/
  tilePivotY: number;
  /** Reference to the default Tileset UID being used by this layer definition.<br/>  **WARNING**: some layer *instances* might use a different tileset. So most of the time, you should probably use the `__tilesetDefUid` value found in layer instances.<br/>  Note: since version 1.0.0, the old `autoTilesetDefUid` was removed and merged into this value. */
  tilesetDefUid: integer | null;
  /** Type of the layer as Haxe Enum Possible values: `IntGrid`, `Entities`, `Tiles`, `AutoLayer` */
  type: "AutoLayer" | "Entities" | "IntGrid" | "Tiles";
  /** Unique Int identifier */
  uid: integer;
};

/** Layer instance */
type LDtkLayerInstance = {
  /** Grid-based height */
  __cHei: integer;
  /** Grid-based width */
  __cWid: integer;
  /** Grid size */
  __gridSize: integer;
  /** Layer definition identifier */
  __identifier: string;
  /** Layer opacity as Float [0-1] */
  __opacity: number;
  /** Total layer X pixel offset, including both instance and definition offsets. */
  __pxTotalOffsetX: integer;
  /** Total layer Y pixel offset, including both instance and definition offsets. */
  __pxTotalOffsetY: integer;
  /** The definition UID of corresponding Tileset, if any. */
  __tilesetDefUid: integer | null;
  /** The relative path to corresponding Tileset, if any. */
  __tilesetRelPath: string | null;
  /** Layer type (possible values: IntGrid, Entities, Tiles or AutoLayer) */
  __type: string;
  /** An array containing all tiles generated by Auto-layer rules. The array is already sorted in display order (ie. 1st tile is beneath 2nd, which is beneath 3rd etc.).<br/><br/>  Note: if multiple tiles are stacked in the same cell as the result of different rules, all tiles behind opaque ones will be discarded. */
  autoLayerTiles: LDtkTile[];
  /**  */
  entityInstances: LDtkEntityInstance[];
  /**  */
  gridTiles: LDtkTile[];
  /** Unique layer instance identifier */
  iid: string;
  /** **WARNING**: this deprecated value is no longer exported since version 1.0.0  Replaced by: `intGridCsv` */
  intGrid: LDtkIntGridValueInstance[] | null;
  /** A list of all values in the IntGrid layer, stored in CSV format (Comma Separated Values).<br/>  Order is from left to right, and top to bottom (ie. first row from left to right, followed by second row, etc).<br/>  `0` means \"empty cell\" and IntGrid values start at 1.<br/>  The array size is `__cWid` x `__cHei` cells. */
  intGridCsv: integer[];
  /** Reference the Layer definition UID */
  layerDefUid: integer;
  /** Reference to the UID of the level containing this layer instance */
  levelId: integer;
  /** An Array containing the UIDs of optional rules that were enabled in this specific layer instance. */
  optionalRules: integer[];
  /** This layer can use another tileset by overriding the tileset UID here. */
  overrideTilesetUid: integer | null;
  /** X offset in pixels to render this layer, usually 0 (IMPORTANT: this should be added to the `LayerDef` optional offset, see `__pxTotalOffsetX`) */
  pxOffsetX: integer;
  /** Y offset in pixels to render this layer, usually 0 (IMPORTANT: this should be added to the `LayerDef` optional offset, see `__pxTotalOffsetY`) */
  pxOffsetY: integer;
  /** Random seed used for Auto-Layers rendering */
  seed: integer;
  /** Layer instance visibility */
  visible: boolean;
};

/** This section contains all the level data. It can be found in 2 distinct forms, depending on Project current settings:  - If \"*Separate level files*\" is **disabled** (default): full level data is *embedded* inside the main Project JSON file, - If \"*Separate level files*\" is **enabled**: level data is stored in *separate* standalone `.ldtkl` files (one per level). In this case, the main Project JSON file will still contain most level data, except heavy sections, like the `layerInstances` array (which will be null). The `externalRelPath` string points to the `ldtkl` file.  A `ldtkl` file is just a JSON file containing exactly what is described below. */
type LDtkLevel = {
  /** Background color of the level (same as `bgColor`, except the default value is automatically used here if its value is `null`) */
  __bgColor: string;
  /** Position informations of the background image, if there is one. */
  __bgPos: LDtkLevelBgPosInfos | null;
  /** An array listing all other levels touching this one on the world map.<br/>  Only relevant for world layouts where level spatial positioning is manual (ie. GridVania, Free). For Horizontal and Vertical layouts, this array is always empty. */
  __neighbours: LDtkNeighbourLevel[];
  /** The \"guessed\" color for this level in the editor, decided using either the background color or an existing custom field. */
  __smartColor: string;
  /** Background color of the level. If `null`, the project `defaultLevelBgColor` should be used. */
  bgColor: string | null;
  /** Background image Y pivot (0-1) */
  bgPivotY: number;
  /** Background image X pivot (0-1) */
  bgPivotX: number;
  /** An enum defining the way the background image (if any) is positioned on the level. See `__bgPos` for resulting position info. Possible values: &lt;`null`&gt;, `Unscaled`, `Contain`, `Cover`, `CoverDirty` */
  bgPos: "Unscaled" | "Contain" | "Cover" | "CoverDirty" | null;
  /** The *optional* relative path to the level background image. */
  bgRelPath: string | null;
  /** This value is not null if the project option \"*Save levels separately*\" is enabled. In this case, this **relative** path points to the level Json file. */
  externalRelPath: string | null;
  /** An array containing this level custom field values. */
  fieldInstances: LDtkFieldInstance[];
  /** User defined unique identifier */
  identifier: string;
  /** Unique instance identifier */
  iid: string;
  /** An array containing all Layer instances. **IMPORTANT**: if the project option \"*Save levels separately*\" is enabled, this field will be `null`.<br/>  This array is **sorted in display order**: the 1st layer is the top-most and the last is behind. */
  layerInstances: LDtkLayerInstance[] | null;
  /** Height of the level in pixels */
  pxHei: integer;
  /** Width of the level in pixels */
  pxWid: integer;
  /** Unique Int identifier */
  uid: integer;
  /** If TRUE, the level identifier will always automatically use the naming pattern as defined in `Project.levelNamePattern`. Becomes FALSE if the identifier is manually modified by user. */
  useAutoIdentifier: boolean;
  /** Index that represents the \"depth\" of the level in the world. Default is 0, greater means \"above\", lower means \"below\".<br/>  This value is mostly used for display only and is intended to make stacking of levels easier to manage. */
  worldDepth: integer;
  /** World X coordinate in pixels.<br/>  Only relevant for world layouts where level spatial positioning is manual (ie. GridVania, Free). For Horizontal and Vertical layouts, the value is always -1 here. */
  worldX: integer;
  /** World Y coordinate in pixels.<br/>  Only relevant for world layouts where level spatial positioning is manual (ie. GridVania, Free). For Horizontal and Vertical layouts, the value is always -1 here. */
  worldY: integer;
};

/** Level background image position info */
type LDtkLevelBgPosInfos = {
  /** An array of 4 float values describing the cropped sub-rectangle of the displayed background image. This cropping happens when original is larger than the level bounds. Array format: `[ cropX, cropY, cropWidth, cropHeight ]` */
  cropRect: number[];
  /** An array containing the `[scaleX,scaleY]` values of the **cropped** background image, depending on `bgPos` option. */
  scale: number[];
  /** An array containing the `[x,y]` pixel coordinates of the top-left corner of the **cropped** background image, depending on `bgPos` option. */
  topLeftPx: integer[];
};

/** Nearby level info */
type LDtkNeighbourLevel = {
  /** A single lowercase character tipping on the level location (`n`orth, `s`outh, `w`est, `e`ast). */
  dir: string;
  /** Neighbour Instance Identifier */
  levelIid: string;
  /** **WARNING**: this deprecated value will be *removed* completely on version 1.2.0+  Replaced by: `levelIid` */
  levelUid: integer;
};

/** This structure represents a single tile from a given Tileset. */
type LDtkTile = {
  /** Internal data used by the editor.<br/>  For auto-layer tiles: `[ruleId, coordId]`.<br/>  For tile-layer tiles: `[coordId]`. */
  d: integer[];
  /** \"Flip bits\", a 2-bits integer to represent the mirror transformations of the tile.<br/>   - Bit 0 = X flip<br/>   - Bit 1 = Y flip<br/>   Examples: f=0 (no flip), f=1 (X flip only), f=2 (Y flip only), f=3 (both flips) */
  f: integer;
  /** Pixel coordinates of the tile in the **layer** (`[x,y]` format). Don't forget optional layer offsets, if they exist! */
  px: integer[];
  /** Pixel coordinates of the tile in the **tileset** (`[x,y]` format) */
  src: integer[];
  /** The *Tile ID* in the corresponding tileset. */
  t: integer;
};

/** The `Tileset` definition is the most important part among project definitions. It contains some extra informations about each integrated tileset. If you only had to parse one definition section, that would be the one. */
export type LDtkTilesetDef = {
  /** Grid-based height */
  __cHei: integer;
  /** Grid-based width */
  __cWid: integer;
  /** The following data is used internally for various optimizations. It's always synced with source image changes. */
  cachedPixelData: object | null;
  /** An array of custom tile metadata */
  customData: LDtkTileCustomMetadata[];
  /** If this value is set, then it means that this atlas uses an internal LDtk atlas image instead of a loaded one. Possible values: &lt;`null`&gt;, `LdtkIcons` */
  embedAtlas: "LdtkIcons" | null;
  /** Tileset tags using Enum values specified by `tagsSourceEnumId`. This array contains 1 element per Enum value, which contains an array of all Tile IDs that are tagged with it. */
  enumTags: LDtkEnumTagValue[];
  /** User defined unique identifier */
  identifier: string;
  /** Distance in pixels from image borders */
  padding: integer;
  /** Image height in pixels */
  pxHei: integer;
  /** Image width in pixels */
  pxWid: integer;
  /** Path to the source file, relative to the current project JSON file<br/>  It can be null if no image was provided, or when using an embed atlas. */
  relPath: string | null;
  /** Array of group of tiles selections, only meant to be used in the editor */
  savedSelections: object[];
  /** Space in pixels between all tiles */
  spacing: integer;
  /** An array of user-defined tags to organize the Tilesets */
  tags: string[];
  /** Optional Enum definition UID used for this tileset meta-data */
  tagsSourceEnumUid: integer | null;
  /**  */
  tileGridSize: integer;
  /** Unique Identifier */
  uid: integer;
};

/** In a tileset definition, user defined meta-data of a tile. */
type LDtkTileCustomMetadata = {
  /**  */
  data: string;
  /**  */
  tileId: integer;
};

/** This object represents a custom sub rectangle in a Tileset image. */
type LDtkTilesetRect = {
  /** Height in pixels */
  h: integer;
  /** UID of the tileset */
  tilesetUid: integer;
  /** Width in pixels */
  w: integer;
  /** X pixels coordinate of the top-left corner in the Tileset image */
  x: integer;
  /** Y pixels coordinate of the top-left corner in the Tileset image */
  y: integer;
};

type LDtkWorld = {};
