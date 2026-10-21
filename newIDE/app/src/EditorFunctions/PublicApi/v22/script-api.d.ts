/**
 * The result of every editor function. Identical to the output of the
 * corresponding tool call: inspect `success` and read the other fields
 * depending on the function called.
 */
type FunctionResult = {
  /** false when the call failed — `message` then explains why. */
  success: boolean;
  /** Failure explanation, or additional information on success. */
  message?: string;
  /** Other fields depend on the function (same as the tool call output). */
  [key: string]: any;
};

type SimplifiedInstance = {
  /** Name of the object this instance belongs to. */
  name: string;
  /** Instance identifier — pass it to `existing_instance_ids`. */
  id: string;
  x: number;
  y: number;
  /** Only for 3D instances. */
  z?: number;
  angle?: number;
  layer?: string;
  zOrder?: number;
  /** Actual computed width (custom size or default). */
  width: number;
  height: number;
  /** Only for 3D instances. */
  depth?: number;
  [key: string]: any;
};

type SimplifiedVariable = {
  variableName: string;
  /** `String`, `Number`, `Boolean`, `Structure` or `Array`. */
  type: string;
  /** Not set for structures and arrays. */
  value?: string;
  variableChildren?: Array<SimplifiedVariable>;
};

type NamedProperty = {
  /** Pass it as `property_name` to change it. */
  name: string;
  value: string;
  type?: string;
  label?: string;
  [key: string]: any;
};

type ObjectSizeInfo = {
  width: number | null;
  height: number | null;
  /** null when the object is 2D. */
  depth: number | null;
  originX: number;
  originY: number;
  originZ: number | null;
  centerX: number | null;
  centerY: number | null;
  centerZ: number | null;
};

type InstanceSurfaces = {
  /** Only with `surface_beneath`: the first surface below the top of the box of the instance, the instance itself ignored. null: none. */
  surfaceBeneath?: SurfaceBeneath | null;
  /** Only with `surface_beneath.grid`: the heights of the surfaces in the box of the instance, the instance included. */
  surfaceGrid?: {
    /** The X of each column. */
    xs: Array<number>;
    /** With up "z": the Y of each row. */
    ys?: Array<number>;
    /** With up "z": the Z of the surface for each row then column (`z[row][column]`), null where there is none. */
    z?: Array<Array<number | null>>;
    /** With up "-y": the Y of the surface for each column, null where there is none. */
    y?: Array<number | null>;
    /** The highest point found: x, y and, with up "z", z. */
    highest: { x: number; y: number; z?: number } | null;
    /** The lowest point found. */
    lowest: { x: number; y: number; z?: number } | null;
  };
};

type SurfaceBeneath = {
  /** With up "z": the Z of the surface. */
  z?: number;
  /** With up "-y": the Y of the surface. */
  y?: number;
  /** The object the surface belongs to. */
  objectName: string;
  /** The id of the instance the surface belongs to. */
  id: string;
  /** The bottom of the instance minus the surface, along the up direction: positive when it floats above it, negative when it sinks into it. */
  gap: number;
};

type SimplifiedFunction = {
  functionName: string;
  /** `Action`, `Condition`, `Expression`, `ExpressionAndCondition` or `ActionWithOperator`. */
  functionType: string;
  /** For functions returning a value: `expression` for a number (the name GDevelop gives to that value type), `string` for a text (a string expression is an `Expression` with `expressionType: "string"`). Write it as `number` or `string` (`expression_type` / the `expressionType` setting). */
  expressionType?: string;
  /** In order, including the implicit `Object` (and `Behavior`) parameters of object and behavior functions. */
  parameters: Array<{
    name: string;
    type: string;
    /** Object type for object parameters, behavior type for behavior parameters. */
    extraInfo?: string;
    optional?: boolean;
    isImplicit?: boolean;
    [key: string]: any;
  }>;
  /** Only when the events of the function do not receive `parameters`: the setter of an `ExpressionAndCondition` (an `ActionWithOperator`) receives the parameters of that expression plus the generated `Value`. */
  parametersForEvents?: Array<{
    name: string;
    type: string;
    /** Object type for object parameters, behavior type for behavior parameters. */
    extraInfo?: string;
    optional?: boolean;
    isImplicit?: boolean;
    [key: string]: any;
  }>;
  isPrivate?: boolean;
  isAsync?: boolean;
  /** Called automatically by the engine: it has no call form. */
  isLifecycle?: boolean;
  eventsCount: number;
  /** How to call it from EventScript (from `inspect_extension` only). */
  callForm?: string;
  /** Set when a non-lifecycle function has no `callForm` (the extension was not regenerated yet). */
  callFormUnavailableReason?: string;
  [key: string]: any;
};

type SimplifiedChildObject = {
  objectName: string;
  objectType: string;
  [key: string]: any;
};

type SimplifiedProperty = {
  propertyName: string;
  /** `Number`, `String`, `Boolean`, `Choice`, `Color`, `Behavior`, `Resource`... */
  type: string;
  label?: string;
  defaultValue?: string;
  /** Required behavior type for `Behavior`, resource kind for `Resource`. */
  extraInfo?: Array<string>;
  hidden?: boolean;
  [key: string]: any;
};

/**
 * Creates a new object of a specified type, or replace an existing one, or duplicate an existing one.
 * Either `search_terms` can be provided to search for a matching asset in the asset store, or `asset_id` can be provided to directly pick a specific asset for which you already know the ID.
 * No instances is added on the scene for the object. If needed, instances must be placed on the scene after the object is created.
 * Inside a custom object (a `scope` of type `custom_object_variant`, with `variant_name` "" - child objects are only added on the default variant), the object is created as a child object of the custom object, and a child object can never be named `Object` (this name is reserved for the custom object itself).
 * Safe to re-run: if an object with the same name and type already exists and `replace_existing_object` is not set, nothing is changed and the call still succeeds.
 */
declare function create_or_replace_object(args: {
  /** Where the object is created, replaced or duplicated. Set `type` and the name field(s) of that type. */
  scope: {
    /** `scene`: a scene (`scene_name`). `custom_object_variant`: the child objects, instances and layers of a variant of a custom object (`extension_name` + `custom_object_name` + `variant_name`, `""` being the default variant that named variants inherit from). */
    type: 'scene' | 'custom_object_variant';
    /** The name of the scene (type `scene`). */
    scene_name?: string;
    /** The name of the extension (extension, custom_behavior, custom_object and custom_object_variant types). */
    extension_name?: string;
    /** The name of the custom object in the extension (custom_object and custom_object_variant types). */
    custom_object_name?: string;
    /** The name of the variant of the custom object (type `custom_object_variant`); "" is the default variant. */
    variant_name?: string;
  };
  /** The scope in which the new object will be, whether it has been created, duplicated or replaced. If set to `scene`, the object will be created in the list of objects of the scene given by `scope`. If set to `global`, the object will be created in the list of global objects. Only valid with a `scope` of type `scene`: in a custom object, the object is always a child object. */
  target_object_scope?: 'scene' | 'global';
  /** The type of the object to create, found in the reference (e.g., `Sprite`, `TiledSpriteObject::TiledSprite`, `TextObject::Text`, `PanelSpriteObject::PanelSprite`, `PrimitiveDrawing::Drawer`, `ParticleSystem::ParticleEmitter`, `Scene3D::Model3DObject`, etc...). For an existing object, enter the exact type of the existing object. */
  object_type: string;
  /** The unique name to assign to the new object, or the name of the existing object to replace (in this case, `replace_existing_object` must be set to true). */
  object_name: string;
  /** If set to true, the existing object with the same name will be replaced by the new one found in the asset store. If not set to true, an existing object with the same name (and type) is kept unchanged and the call succeeds without doing anything. */
  replace_existing_object?: boolean;
  /** If set, the existing object with this name will be duplicated to create the new object. This is useful when you want to create a new object based on an existing one, but with a different name. The `object_type` must match the type of the existing object. If the existing object does not exist, this will throw an error. */
  duplicated_object_name?: string;
  /** Where the object to duplicate lives. Only used if `duplicated_object_name` is set (it defaults to `scope`). Set `type` and the name field(s) of that type. */
  duplicated_object_scope?: {
    /** `scene`: a scene (`scene_name`). `custom_object_variant`: the child objects, instances and layers of a variant of a custom object (`extension_name` + `custom_object_name` + `variant_name`, `""` being the default variant that named variants inherit from). */
    type: 'scene' | 'custom_object_variant';
    /** The name of the scene (type `scene`). */
    scene_name?: string;
    /** The name of the extension (extension, custom_behavior, custom_object and custom_object_variant types). */
    extension_name?: string;
    /** The name of the custom object in the extension (custom_object and custom_object_variant types). */
    custom_object_name?: string;
    /** The name of the variant of the custom object (type `custom_object_variant`); "" is the default variant. */
    variant_name?: string;
  };
  /** If specified, the asset with this specific ID will be created (search_terms will be ignored). Must be the hexadecimal asset ID alone (e.g. `31b04c0eea`) - never an asset name or a project resource filename. To change a resource used by an existing object, do not use this: set the object resource property with `change_object_properties_effects`. A skybox is not an object: it goes on a 3D layer, with the `asset_id` of a `changed_layer_effects` item of `change_scene_properties_layers_effects_groups`. */
  asset_id?: string;
  /** A list of search terms or tags that will be used to find an asset in GDevelop Asset Store. Must be single words separated by a comma, the most generic word must be first. For example: `spaceship, red, insurgent, cannon`. If you duplicate or move an existing object, or if `asset_id` is provided, you can leave this empty. */
  search_terms?: string;
  /** Optional short description of the object, potentially used to find a suitable asset in the asset store (e.g., 'a red sports car', 'a wooden treasure chest'). It will be stored in the object metadata for future reference. */
  description?: string;
  /** For 2D objects where it makes sense (i.e: not for 3D objects, not for UI elements...), the kind of view it will have in the game. Can be `top-down` or `side-view`. */
  two_dimensional_view_kind?: 'top-down' | 'side-view';
}): Promise<FunctionResult>;

type InspectObjectPropertiesEffectsResult = FunctionResult & {
  properties: Array<NamedProperty>;
  behaviors: Array<{
    behaviorName: string;
    behaviorType: string;
  }>;
  rawJson?: { [key: string]: any };
  frameImageSizes?: { [image: string]: { width: number; height: number } };
  modelAnimationSources?: Array<string>;
  [key: string]: any;
};
/**
 * Retrieves the list of properties, effects and their current values for a specific object.
 */
declare function inspect_object_properties_effects(args: {
  /** Where the object lives (a scene, or a variant of a custom object for one of its child objects). Set `type` and the name field(s) of that type. */
  scope: {
    /** `scene`: a scene (`scene_name`). `custom_object_variant`: the child objects, instances and layers of a variant of a custom object (`extension_name` + `custom_object_name` + `variant_name`, `""` being the default variant that named variants inherit from). */
    type: 'scene' | 'custom_object_variant';
    /** The name of the scene (type `scene`). */
    scene_name?: string;
    /** The name of the extension (extension, custom_behavior, custom_object and custom_object_variant types). */
    extension_name?: string;
    /** The name of the custom object in the extension (custom_object and custom_object_variant types). */
    custom_object_name?: string;
    /** The name of the variant of the custom object (type `custom_object_variant`); "" is the default variant. */
    variant_name?: string;
  };
  /** The name of the object to inspect. */
  object_name: string;
  /** Rarely needed: also returns `rawJson`, the full configuration, for what `properties` don't expose (animations, points, collision masks, tile map settings...). */
  include_raw_json?: boolean;
}): Promise<InspectObjectPropertiesEffectsResult>;

/**
 * Modifies the value of one or more specific properties for an object, and/or adds, removes or changes its effects. It can also be used to rename an object.
 * If needed, use `inspect_object_properties_effects` to inspect available properties and effects of an object.
 * Changes the shared object, not a placed instance: instance position, size, rotation, opacity and visibility are set via `put_2d_instances`/`put_3d_instances` (no `x`/`y`/`z` or `visible` object property. A resource property takes the name of a resource of the project: a file attached by the user must first be added with `change_project_properties_resources`; a texture/3D model from the asset store is imported via `create_or_replace_object`.
 */
declare function change_object_properties_effects(args: {
  /** Where the object lives (a scene, or a variant of a custom object for one of its child objects). Set `type` and the name field(s) of that type. */
  scope: {
    /** `scene`: a scene (`scene_name`). `custom_object_variant`: the child objects, instances and layers of a variant of a custom object (`extension_name` + `custom_object_name` + `variant_name`, `""` being the default variant that named variants inherit from). */
    type: 'scene' | 'custom_object_variant';
    /** The name of the scene (type `scene`). */
    scene_name?: string;
    /** The name of the extension (extension, custom_behavior, custom_object and custom_object_variant types). */
    extension_name?: string;
    /** The name of the custom object in the extension (custom_object and custom_object_variant types). */
    custom_object_name?: string;
    /** The name of the variant of the custom object (type `custom_object_variant`); "" is the default variant. */
    variant_name?: string;
  };
  /** The name of the object whose property needs changing. */
  object_name: string;
  /** Optional boolean. If true, the object with this name will be deleted, along with all of its placed instances (in every scene using it, if it is a global object) and its membership in any group. No other property needs to be set in this case. This does not work for groups: to delete a group, use `change_scene_properties_layers_effects_groups` instead. Destructive: only set this when the user has explicitly and unambiguously asked to delete this object. Never set it on your own initiative, for example as an attempt to fix an issue. */
  delete_this_object?: boolean;
  /** A list of object properties to change. */
  changed_properties?: Array<{
    /** The exact name of the property to change (e.g., 'text', 'color', 'characterSize'...). If you want to rename the object, the property must be `name`. */
    property_name: string;
    /** The new value for the property. Should be provided as a string, even if the underlying type is number or boolean (e.g., '100', 'true', 'Hello World'...). */
    new_value: string;
  }>;
  /** A list of effects to add, remove or change (update their properties) for this object. Only objects whose type supports effects can have one (check with `inspect_object_properties_effects`). */
  changed_effects?: Array<{
    /** The name of the effect to change (or add, it will be added if it does not exist. In this case, `effect_type` must be set). */
    effect_name: string;
    /** If renaming an effect, the new name of the effect. Unchanged if not set. */
    new_effect_name?: string;
    /** The type of the effect, only when adding a new effect. Must be the exact type of the effect, as listed in the GDevelop documentation. For example: `AdvancedBloom`, `KawaseBlur`... Some effects (mostly Scene3D lighting/post-processing effects like `Exposure`, `Bloom`, `Skybox`) only work on layers, not objects. */
    effect_type?: string;
    /** The new position of the effect in the order of effects. 0 is the first applied effect. */
    new_effect_position?: number;
    /** If true, the effect with this name will be deleted. */
    delete_this_effect?: boolean;
    /** New values to set for the effect. Available properties can be inspected using `inspect_object_properties_effects` tool for existing or newly added effects. */
    changed_properties?: Array<{
      property_name: string;
      new_value: string;
    }>;
  }>;
  /** Advanced, alone in its call: the complete edited `rawJson`, as a JSON string. Animations and points are matched by name: rename them with `renamed_animations`/`renamed_points`, not here. */
  raw_json?: string;
  /** Updates the events (when the old name is unique; not events on object groups). Only `renamed_points` can be in the same call. */
  renamed_animations?: Array<{
    old_name: string;
    new_name: string;
    /** Index of the animation, when `old_name` is empty or shared. */
    index?: number;
  }>;
  /** Renames the point in every frame; updates the events (not events on object groups). */
  renamed_points?: Array<{
    old_name: string;
    new_name: string;
  }>;
}): Promise<FunctionResult>;

type AddBehaviorResult = FunctionResult & {
  /** One entry per object (`object_name` may be a group), including behaviors already present. Pass `behaviorName` as `behavior_name` to the behavior functions. */
  addedBehaviors: Array<{
    objectName: string;
    behaviorName: string;
    behaviorType: string;
    [key: string]: any;
  }>;
  [key: string]: any;
};
/**
 * Adds a new behavior of a specified type to an object.
 * The name of the behavior will be automatically set when the behavior is added to the object.
 * Further configuration might be needed via `inspect_behavior_properties` or `change_behavior_property`.
 */
declare function add_behavior(args: {
  /** Where the object lives (on a custom object, behaviors are added on the default variant, `variant_name` ""). Set `type` and the name field(s) of that type. */
  scope: {
    /** `scene`: a scene (`scene_name`). `custom_object_variant`: the child objects, instances and layers of a variant of a custom object (`extension_name` + `custom_object_name` + `variant_name`, `""` being the default variant that named variants inherit from). */
    type: 'scene' | 'custom_object_variant';
    /** The name of the scene (type `scene`). */
    scene_name?: string;
    /** The name of the extension (extension, custom_behavior, custom_object and custom_object_variant types). */
    extension_name?: string;
    /** The name of the custom object in the extension (custom_object and custom_object_variant types). */
    custom_object_name?: string;
    /** The name of the variant of the custom object (type `custom_object_variant`); "" is the default variant. */
    variant_name?: string;
  };
  /** The name of the object to add the behavior to. */
  object_name: string;
  /** The type identifier of the behavior to add (e.g., 'PlatformBehavior::PlatformerObjectBehavior', 'TopDownMovementBehavior::TopDownMovementBehavior', 'Physics2::Physics2Behavior', 'DraggableBehavior::Draggable'...). */
  behavior_type: string;
}): Promise<AddBehaviorResult>;

type InspectBehaviorPropertiesResult = FunctionResult & {
  properties: Array<NamedProperty>;
  [key: string]: any;
};
/**
 * Retrieves the list of properties and their current values for a specific behavior attached to an object.
 */
declare function inspect_behavior_properties(args: {
  /** Where the object lives (a scene, or a variant of a custom object for one of its child objects). Set `type` and the name field(s) of that type. */
  scope: {
    /** `scene`: a scene (`scene_name`). `custom_object_variant`: the child objects, instances and layers of a variant of a custom object (`extension_name` + `custom_object_name` + `variant_name`, `""` being the default variant that named variants inherit from). */
    type: 'scene' | 'custom_object_variant';
    /** The name of the scene (type `scene`). */
    scene_name?: string;
    /** The name of the extension (extension, custom_behavior, custom_object and custom_object_variant types). */
    extension_name?: string;
    /** The name of the custom object in the extension (custom_object and custom_object_variant types). */
    custom_object_name?: string;
    /** The name of the variant of the custom object (type `custom_object_variant`); "" is the default variant. */
    variant_name?: string;
  };
  /** The name of the object that has the behavior. */
  object_name: string;
  /** The name of the behavior instance to inspect. */
  behavior_name: string;
}): Promise<InspectBehaviorPropertiesResult>;

/**
 * Modifies the value of one or more specific properties for a behavior attached to an object.
 * This also works for shared properties. Property names and descriptions for an object are listed when calling `inspect_behavior_properties`.
 */
declare function change_behavior_property(args: {
  /** Where the object lives (property values can be changed on any variant; removing a behavior is done on the default variant, `variant_name` ""). Set `type` and the name field(s) of that type. */
  scope: {
    /** `scene`: a scene (`scene_name`). `custom_object_variant`: the child objects, instances and layers of a variant of a custom object (`extension_name` + `custom_object_name` + `variant_name`, `""` being the default variant that named variants inherit from). */
    type: 'scene' | 'custom_object_variant';
    /** The name of the scene (type `scene`). */
    scene_name?: string;
    /** The name of the extension (extension, custom_behavior, custom_object and custom_object_variant types). */
    extension_name?: string;
    /** The name of the custom object in the extension (custom_object and custom_object_variant types). */
    custom_object_name?: string;
    /** The name of the variant of the custom object (type `custom_object_variant`); "" is the default variant. */
    variant_name?: string;
  };
  /** The name of the object that has the behavior. */
  object_name: string;
  /** The name of the behavior instance whose property needs changing. */
  behavior_name: string;
  /** Optional boolean. If true, the behavior with this name will be deleted from the object, along with any other behavior on it that depends on this one (directly or indirectly). No other property needs to be set in this case. Destructive: only set this when the user has explicitly and unambiguously asked to delete this behavior. Never set it on your own initiative, for example as an attempt to fix an issue. */
  delete_this_behavior?: boolean;
  /** A list of behavior properties to change. */
  changed_properties?: Array<{
    /** The exact name of the behavior property to change (e.g., 'gravity', 'speed', 'ignoreDefaultControls'). */
    property_name: string;
    /** The new value for the property. Should be provided as a string, even if the underlying type is number or boolean (e.g., '9.8', 'false', '"SomeValue"'). */
    new_value: string;
  }>;
}): Promise<FunctionResult>;

type DescribeInstancesResult = FunctionResult & {
  instances: Array<SimplifiedInstance & InstanceSurfaces & { rawJson?: { numberProperties: Array<{ name: string; value: number }>; stringProperties: Array<{ name: string; value: string }>; flippedX: boolean; flippedY: boolean; flippedZ: boolean } }>;
  /** Default size and origin/center of each object seen (null when unknown). */
  objectSizeInfo?: { [objectName: string]: ObjectSizeInfo | null };
  [key: string]: any;
};
/**
 * Lists all object instances currently placed in the given scope (a scene, an external layout or a variant of a custom object), including their identifier, type, object name, layer, visibility, position and size. The position of an instance is its origin point — usually its top-left corner in 2D, or its corner with minimum X, Y and Z in 3D — NOT its center. Some objects have a different origin point: check `objectSizeInfo` in the results.
 * Each instance also reports its per-instance variables (`initialVariables`, present only when the instance overrides the object variables — absent means the instance uses the object variables).
 */
declare function describe_instances(args: {
  /** Where the instances are placed. In a custom object variant, the positions are in the local space of the custom object. Set `type` and the name field(s) of that type. */
  scope: {
    /** `scene`: a scene (`scene_name`). `external_layout`: the instances of an external layout (`external_layout_name`), with the objects and layers of its associated scene. `custom_object_variant`: the child objects, instances and layers of a variant of a custom object (`extension_name` + `custom_object_name` + `variant_name`, `""` being the default variant that named variants inherit from). */
    type: 'scene' | 'external_layout' | 'custom_object_variant';
    /** The name of the scene (type `scene`). */
    scene_name?: string;
    /** The name of the external layout (type `external_layout`). */
    external_layout_name?: string;
    /** The name of the extension (extension, custom_behavior, custom_object and custom_object_variant types). */
    extension_name?: string;
    /** The name of the custom object in the extension (custom_object and custom_object_variant types). */
    custom_object_name?: string;
    /** The name of the variant of the custom object (type `custom_object_variant`); "" is the default variant. */
    variant_name?: string;
  };
  /** Optional name(s) of the object(s), separated by a comma, to filter the instances by. If not set, all instances will be described. */
  filter_by_object_name?: string;
  /** Rarely needed: also returns the `rawJson` of each instance (starting animation, tile map tiles, text input values, flips). */
  include_raw_json?: boolean;
  /** Optional. Also reports, for each listed instance, the surface below it as shown in the scene editor (the scene, or the custom object variant, is opened in the editor for this). `surfaceBeneath` is the first surface found below the top of its box, the instance itself ignored: its Z (or Y with `up: "-y"`, and always for 2D instances, seen from the side), the object and the id of the instance it belongs to, and `gap` (positive: the instance floats above it, negative: it sinks into it), or null when there is none. Use it to check that instances stand on the ground, or to find the height of a terrain. */
  surface_beneath?: {
    /** The up direction: `z` (the default, most 3D games) or `-y` (side view games: instances fall toward +Y, and the bottom of their box is its maximum Y). */
    up?: 'z' | '-y';
    /** Optional names of objects or groups, separated by commas: the only ones to land on. */
    include_objects?: string;
    /** Optional names of objects or groups, separated by commas, to fall through (example: water, grass, decorations). */
    exclude_objects?: string;
    /** Optional, from 2 to 32: also reports `surfaceGrid`, the heights of the surfaces inside the box of each instance (the instance included: a terrain gives its relief), on this many points per side, with the highest and the lowest. With `up: "-y"`, the heights are along X only (a side view). Use it with `filter_by_object_name` to describe a few instances. */
    grid?: number;
  };
}): Promise<DescribeInstancesResult>;

/**
 * Advanced: changes the starting animation, tile map tiles, text input values or flips of instances, from their edited `rawJson` (`describe_instances` with `include_raw_json`).
 */
declare function change_instances_raw_json(args: {
  /** Where the instances are placed. Set `type` and the name field(s) of that type. */
  scope: {
    /** `scene`: a scene (`scene_name`). `external_layout`: the instances of an external layout (`external_layout_name`), with the objects and layers of its associated scene. `custom_object_variant`: the child objects, instances and layers of a variant of a custom object (`extension_name` + `custom_object_name` + `variant_name`, `""` being the default variant that named variants inherit from). */
    type: 'scene' | 'external_layout' | 'custom_object_variant';
    /** The name of the scene (type `scene`). */
    scene_name?: string;
    /** The name of the external layout (type `external_layout`). */
    external_layout_name?: string;
    /** The name of the extension (extension, custom_behavior, custom_object and custom_object_variant types). */
    extension_name?: string;
    /** The name of the custom object in the extension (custom_object and custom_object_variant types). */
    custom_object_name?: string;
    /** The name of the variant of the custom object (type `custom_object_variant`); "" is the default variant. */
    variant_name?: string;
  };
  changes: Array<{
    /** From `describe_instances`. */
    instance_id: string;
    /** The edited `rawJson` (complete) as a JSON string. */
    raw_json: string;
  }>;
}): Promise<FunctionResult>;

/**
 * Places new instance(s), or move/erase existing instances, of an existing object onto a specified 2D layer of the given scope (a scene, an external layout or a variant of a custom object) using a virtual brush at given X, Y coordinates. Can also be used to resize, rotate, change opacity, visibility, layer or Z order of existing 2D instance(s). Existing instances identifiers can be found by calling `describe_instances` (`id` field for each instance).
 * To delete instances, use `brush_kind: "erase"` with `existing_instance_ids`, or with only `object_name` to erase every instance of it on `layer_name` (no separate remove tool exists). To move existing instances, use the `point` brush with `existing_instance_ids` (the `none` brush never changes position). An instance position, size, rotation, opacity and visibility are set here, not via `change_object_property`.
 */
declare function put_2d_instances(args: {
  /** Where the instances are placed. In a custom object variant, the positions are in the local space of the custom object. Set `type` and the name field(s) of that type. */
  scope: {
    /** `scene`: a scene (`scene_name`). `external_layout`: the instances of an external layout (`external_layout_name`), with the objects and layers of its associated scene. `custom_object_variant`: the child objects, instances and layers of a variant of a custom object (`extension_name` + `custom_object_name` + `variant_name`, `""` being the default variant that named variants inherit from). */
    type: 'scene' | 'external_layout' | 'custom_object_variant';
    /** The name of the scene (type `scene`). */
    scene_name?: string;
    /** The name of the external layout (type `external_layout`). */
    external_layout_name?: string;
    /** The name of the extension (extension, custom_behavior, custom_object and custom_object_variant types). */
    extension_name?: string;
    /** The name of the custom object in the extension (custom_object and custom_object_variant types). */
    custom_object_name?: string;
    /** The name of the variant of the custom object (type `custom_object_variant`); "" is the default variant. */
    variant_name?: string;
  };
  /** The name of the object to create (or manipulate) instances of. Always required unless you specify `existing_instance_ids`. */
  object_name?: string;
  /** The name of the layer to place (or move) the instance on. Use an empty string "" for the default base layer. For existing instances (`existing_instance_ids`), they will be moved to this layer. */
  layer_name: string;
  /** The kind of brush to use. Can be `point` (one instance at the exact position), `line` (multiple instances distributed along a line), `grid` (multiple instances distributed in a grid), `random_in_circle` (multiple instances randomly scattered in a circle), `erase` (remove either instances in a circle around the brush, or the instances given by their identifiers) or `none` (only modifies the existing instances given by `existing_instance_ids`, or without them every instance of `object_name` on `layer_name`, without moving them — never creates instances). */
  brush_kind: 'point' | 'line' | 'grid' | 'random_in_circle' | 'erase' | 'none';
  /** The X and Y coordinates of the center of the brush, in pixels, separated by a comma. Example: 100,200. Must be omitted for the `none` brush (which never moves instances — passing a position with it is an error); can be omitted for `erase` when specifying `existing_instance_ids`. If using `line` or `grid` brush, this is the start position and you must also specify the `brush_end_position`. Note: each instance is placed by its ORIGIN, which is the top-left corner of its box only when the object has no origin point of its own (a sprite or a custom object can have one anywhere). Never compute a position from a size alone: place the instances by their box with `brush_position_anchor`, or read the offsets of the origin in `objectSizeInfo` (in tool results). */
  brush_position?: string;
  /** Optional. Which point of the instances the brush positions: `origin` (the default: their x;y, wherever the origin of the object is), `min_corner` (the top-left corner of their box) or `center` (the middle of their box). Use it instead of computing a position from a size: it needs nothing to be known of the origin of the object, and two objects centered on each other take the same position. The box is the unrotated, unflipped one, at the size these instances have. Refused when the size or the origin of the object is unknown. */
  brush_position_anchor?: 'origin' | 'min_corner' | 'center';
  /** The radius of the brush, for `random_in_circle` or `erase` brush kind. */
  brush_size?: number;
  /** The X and Y coordinates of the end position of the brush, separated by a comma. Only used for `line` and `grid` brush. Example: 400,650. */
  brush_end_position?: string;
  /** The optional identifiers of existing instances to modify — get them from `describe_instances` (the `id` field of each instance). They must be instances of `object_name`. These instances are moved by a placement brush (`point`, `line`, `grid` or `random_in_circle` — `point` moves EVERY listed instance to exactly `brush_position`, so use one call per target position), updated in place without moving (`none`: size, rotation, opacity, z-order and layer only — never position), or removed (`erase`), separated by a comma (example: `a213v-cdef,b193v-98a1,3334873`). This can be combined with `new_instances_count`. Without `existing_instance_ids` (and without `brush_position`), the `none` and `erase` brushes modify or erase EVERY instance of `object_name` on `layer_name`. */
  existing_instance_ids?: string;
  /** The number of new instances to create and position using the brush. Usually don't go over 10-20 instances. Make sure to specify the `object_name` for this. */
  new_instances_count?: number;
  /** Optional Z order for the new or modified instances. Unchanged if not set (or set to the highest value of the layer for new instances). */
  instances_z_order?: number;
  /** Optional size in pixel for the new or modified instances. Must be width then height, separated by a comma. Example: 100,200. If not specified, default size is used. */
  instances_size?: string;
  /** The angle in degrees to set for the new or modified instances. Do not specify this to leave it changed. */
  instances_rotation?: number;
  /** Optional opacity for the new or modified instances - from 0 (fully transparent) to 255 (fully opaque). Do not specify this to leave it unchanged (new instances default to 255, fully opaque). */
  instances_opacity?: number;
  /** Optional. Set to true to make the new or modified instances hidden when the scene starts (they still exist and can be displayed at runtime with the "Show" action); set to false to make them visible. Do not specify this to leave it unchanged (new instances default to visible). */
  instances_hidden?: boolean;
  /** Optional, for side view games. Drops each placed instance down (toward +Y) onto the first surface below the brush position, as shown in the scene editor (the collision masks of the objects): its horizontal center is at the brush X and the bottom of its box rests on the surface. The scene (or the custom object variant) is opened in the editor to find the surfaces. Put the brush position above the surface. With the `none` brush, each existing instance is dropped from where it is (only its Y changes). The instances being placed are never a surface. The result tells, for each instance, the object it rests on, or that no surface was found (the instance then stays at the brush position). Omit `brush_position_anchor` with it. */
  drop_to_surface?: {
    /** Optional names of objects or groups, separated by commas: the only ones to land on. */
    include_objects?: string;
    /** Optional names of objects or groups, separated by commas, to fall through (example: water, grass, decorations). */
    exclude_objects?: string;
  };
}): Promise<FunctionResult>;

/**
 * Places new instance(s), or move/erase existing instances, of an existing object onto a specified 3D layer of the given scope (a scene, an external layout or a variant of a custom object) using a virtual brush at given X, Y, Z coordinates. Can also be used to resize, rotate, hide or update existing 3D instance(s). Existing instances identifiers can be found by calling `describe_instances` (`id` field for each instance).
 * To delete instances, use `brush_kind: "erase"` with `existing_instance_ids`, or with only `object_name` to erase every instance of it on `layer_name` (no separate remove tool exists). To move existing instances, use the `point` brush with `existing_instance_ids` (the `none` brush never changes position). An instance position, size, rotation and visibility are set here, not via `change_object_property`.
 */
declare function put_3d_instances(args: {
  /** Where the instances are placed. In a custom object variant, the positions are in the local space of the custom object. Set `type` and the name field(s) of that type. */
  scope: {
    /** `scene`: a scene (`scene_name`). `external_layout`: the instances of an external layout (`external_layout_name`), with the objects and layers of its associated scene. `custom_object_variant`: the child objects, instances and layers of a variant of a custom object (`extension_name` + `custom_object_name` + `variant_name`, `""` being the default variant that named variants inherit from). */
    type: 'scene' | 'external_layout' | 'custom_object_variant';
    /** The name of the scene (type `scene`). */
    scene_name?: string;
    /** The name of the external layout (type `external_layout`). */
    external_layout_name?: string;
    /** The name of the extension (extension, custom_behavior, custom_object and custom_object_variant types). */
    extension_name?: string;
    /** The name of the custom object in the extension (custom_object and custom_object_variant types). */
    custom_object_name?: string;
    /** The name of the variant of the custom object (type `custom_object_variant`); "" is the default variant. */
    variant_name?: string;
  };
  /** The name of the object to create (or manipulate) instances of. Always required unless you specify `existing_instance_ids` */
  object_name?: string;
  /** The name of the layer to place (or move) the instance on. Use an empty string "" for the default base layer. For existing instances (`existing_instance_ids`), they will be moved to this layer. */
  layer_name: string;
  /** The kind of brush to use. Can be `point` (one instance at the exact position), `line` (multiple instances on a line), `random_in_sphere` (multiple instances randomly scattered in a sphere), `erase` (remove either instances in a sphere around the brush, or the instances given by their identifiers) or `none` (only modifies the existing instances given by `existing_instance_ids`, or without them every instance of `object_name` on `layer_name`, without moving them — never creates instances). */
  brush_kind: 'point' | 'line' | 'random_in_sphere' | 'erase' | 'none';
  /** The X,Y,Z coordinates of the center of the brush, in pixels, separated by a comma. Example: 100,200,50. Must be omitted for the `none` brush (which never moves instances — passing a position with it is an error); can be omitted for `erase` when specifying `existing_instance_ids`. If using `line` brush, this is the start position and you must also specify the `brush_end_position`. Note: each instance is placed by its ORIGIN, which is NOT always the corner of its box: a 3D model is positioned by the origin it was authored with, usually near the middle of the model (only a `Cube3DObject` is positioned by its minimum corner). Never compute a position from a size alone: place the instances by their box with `brush_position_anchor`, or read the offsets of the origin in `objectSizeInfo` (in tool results). */
  brush_position?: string;
  /** Optional. Which point of the instances the brush positions: `origin` (the default: their x;y;z, wherever the origin of the object is), `min_corner` (the corner of their box with the minimum X, Y and Z), `center` (the middle of their box) or `bottom_center` (the middle on X and Y, the minimum on Z: what rests an object on the ground, or stacks a part on top of another). Use it instead of computing a position from a size: it needs nothing to be known of the origin of the object, and two objects centered on each other take the same position. The box is the unrotated, unflipped one, at the size these instances have. Refused when the size or the origin of the object is unknown. */
  brush_position_anchor?: 'origin' | 'min_corner' | 'center' | 'bottom_center';
  /** The radius of the brush, for `random_in_sphere` or `erase` brush kind. */
  brush_size?: number;
  /** The X,Y,Z coordinates of the end position of the brush, separated by a comma. Only used for `line` brush. Example: 400,650,100. */
  brush_end_position?: string;
  /** The optional identifiers of existing instances to modify — get them from `describe_instances` (the `id` field of each instance). They must be instances of `object_name`. These instances are moved by a placement brush (`point`, `line` or `random_in_sphere` — `point` moves EVERY listed instance to exactly `brush_position`, all three axes, so use one call per target position), updated in place without moving (`none`: size, rotation and layer only — never position), or removed (`erase`), separated by a comma (example: `a213v-cdef,b193v-98a1,3334873`). This can be combined with `new_instances_count`. Without `existing_instance_ids` (and without `brush_position`), the `none` and `erase` brushes modify or erase EVERY instance of `object_name` on `layer_name`. */
  existing_instance_ids?: string;
  /** The number of new instances to create and position using the brush. Make sure to specify the `object_name` for this. */
  new_instances_count?: number;
  /** Optional size in pixel for the new or modified instances. Must be width then height then depth, separated by a comma. Example: 100,200,150. If not specified, default size is used. */
  instances_size?: string;
  /** The angles in degrees to set for the new or modified instances, on the X, Y and Z axes, separated by a comma. All three values are required. For example: 0,20,50. Do not specify this to leave it unchanged. */
  instances_rotation?: string;
  /** Optional. Set to true to make the new or modified instances hidden when the scene starts (they still exist and can be displayed at runtime with the "Show" action); set to false to make them visible. Do not specify this to leave it unchanged (new instances default to visible). This is the way to make a 3D instance start invisible (3D objects have no opacity). */
  instances_hidden?: boolean;
  /** Optional. Drops each placed instance onto the surface below it, as shown in the scene editor (a 3D terrain, a 3D model, a 3D box...), so that it rests on it: the bottom center of its box (unrotated) is put on the first surface hit. The scene (or the custom object variant) is opened in the editor to find the surfaces. With `up: "z"` (the default), `brush_position` (and `brush_end_position`) can be just "x,y" to drop from above everything; with "x,y,z", only the surfaces below this Z are found. With the `none` brush, each existing instance is dropped from above everything, where it is (only its Z changes, or its Y with `up: "-y"`). The instances being placed are never a surface. The result tells, for each instance, the object it rests on, or that no surface was found (the instance then stays at the brush position, with its bottom at Z=0 when the position was just "x,y"). Use `brush_position_anchor` only as `bottom_center` (or omit it). */
  drop_to_surface?: {
    /** The up direction: `z` (the default, most 3D games) or `-y` (side view games: instances fall toward +Y, and the bottom of their box is its maximum Y). */
    up?: 'z' | '-y';
    /** Optional names of objects or groups, separated by commas: the only ones to land on. */
    include_objects?: string;
    /** Optional names of objects or groups, separated by commas, to fall through (example: water, grass, decorations). */
    exclude_objects?: string;
  };
}): Promise<FunctionResult>;

type ReadEventsSourceResult = FunctionResult & {
  eventScript: string;
  /** Set when reading the events of a function. */
  functionName?: string;
  /** Set when reading a function: what its events can use. */
  scopeSummary?: {
    parameters: Array<{
      name: string;
      type: string;
    }>;
    properties: Array<string>;
    /** Custom objects only. */
    childObjects?: Array<string>;
    extensionVariables: {
      global: Array<string>;
      scene: Array<string>;
    };
  };
  /** Set when a `js` event is too large for `max_chars`: a range of lines of its code, or its lines matching `search` (read-only, not EventScript). */
  jsCodeExcerpt?: {
    eventId: string;
    fromLine: number;
    toLine: number;
    totalLines: number;
    /** Lines prefixed with their number and a tab (not part of the code). */
    code: string;
  };
  [key: string]: any;
};
/**
 * Read events of a scene, of external events, or of a function of an extension, as "events script" source: the exact syntax accepted by the `event_script` field used to generate events. Each event is annotated with its id (like `# event-2.1`). Use this BEFORE replacing an event: fetch the event with `event_ids`, edit the returned script, and resend the event in FULL. With `replace_event_but_keep_existing_sub_events`, resend the event WITHOUT its sub-events (they are kept automatically); with `replace_entire_event_and_sub_events`, anything left out of your script is lost. Without any filter, it returns every top-level event with deep sub-events collapsed into `# ...` markers. Filters compose by NARROWING each other (an event must match ALL of them): `event_ids` restricts to these events (returned in full, ancestors shown as header lines for context), `search` and `object_names` select matching events inside that scope. Prefer a single filter; if the result is empty, retry with fewer filters rather than concluding the logic does not exist. A `link "Name"` line includes the events of the external events (or of the scene) it names: read them with a `scope` of type `external_events` (or `scene`) and that name. When reading a function (`function_name`), the output also contains a `scopeSummary`: the parameters, the properties, the child objects and the extension variables usable in that function. The output is capped (`max_chars`): anything collapsed or dropped is marked with a `# ...` note telling which `event_ids` to fetch to see it.
 */
declare function read_events_source(args: {
  /** Whose events to read: a scene, external events, or the extension, custom behavior or custom object owning the function named by `function_name`. Set `type` and the name field(s) of that type. */
  scope: {
    /** `scene`: a scene (`scene_name`). `external_events`: external events (`external_events_name`): events not tied to a scene, included in scenes by `link` events. Usually not recommended. `extension`: an extension of the project (`extension_name`): its free functions and extension variables. `custom_behavior`: a custom behavior of an extension (`extension_name` + `custom_behavior_name`). `custom_object`: a custom object of an extension (`extension_name` + `custom_object_name`): its declaration and functions. */
    type: 'scene' | 'external_events' | 'extension' | 'custom_behavior' | 'custom_object';
    /** The name of the scene (type `scene`). */
    scene_name?: string;
    /** The name of the external events (type `external_events`). */
    external_events_name?: string;
    /** The name of the extension (extension, custom_behavior, custom_object and custom_object_variant types). */
    extension_name?: string;
    /** The name of the custom behavior in the extension (type `custom_behavior`). */
    custom_behavior_name?: string;
    /** The name of the custom object in the extension (custom_object and custom_object_variant types). */
    custom_object_name?: string;
  };
  /** The name of the function whose events should be read. Required with a `scope` of type `extension` (a free function), `custom_behavior` or `custom_object`. Unused with a `scene` or `external_events` scope. */
  function_name?: string;
  /** Event ids (like `event-2` or `event-2.1.0`, as annotated in the source and reported by the explorer agent) or names of group events. These events are returned in full. */
  event_ids?: Array<string>;
  /** Case-insensitive text searched in each event's own lines (conditions, actions, local variables - not its sub-events). Matching events are returned in full. In a `js` event larger than `max_chars`, only its matching lines are returned, with the lines around them, in `jsCodeExcerpt`. */
  search?: string;
  /** Only return events referencing at least one of these objects. */
  object_names?: Array<string>;
  /** How many levels of sub-events to include for each returned event (default: all levels for a filtered read, 1 for a whole-scene read). Collapsed levels are shown as `# ...` markers. */
  sub_events_depth?: number;
  /** Maximum size of the returned source (default 12000 characters, maximum 30000, or 1000000 inside `run_script`, where the output stays in the script). When exceeded, sub-events are collapsed first, then trailing events dropped (with a note listing their ids). */
  max_chars?: number;
  /** A `js` event larger than `max_chars` is returned by parts in `jsCodeExcerpt` (numbered lines, with a note giving the next `js_from_line`): the first line of its code to read, or to search with `search` (default 1). */
  js_from_line?: number;
}): Promise<ReadEventsSourceResult>;

type ReadGameProjectJsonResult = FunctionResult & {
  success: boolean;
  /** The value at the requested path - its shape depends on the path. */
  result?: any;
  message?: string;
  [key: string]: any;
};
/**
 * Read parts of the game project. Use path to navigate, optionally filter arrays, paginate with offset/limit, and pick specific fields. Use ["key"] bracket notation for property names containing spaces or special characters (use backslash to escape quotes or backslashes inside: ["my \"key\""]). The extensions of the project are under `extensions` (`extensions[*].extensionName`, and for each one `customObjects`, `customBehaviors`, `freeFunctions` and `tests`); there is no `[name=...]` path syntax, so pick one extension with `filter: { property: 'extensionName', value: 'MyExt' }`.
 */
declare function read_game_project_json(args: {
  /** Path into the project. Use dots for simple keys, [0] for array index, [*] for all array items, ["key"] for keys with special characters. Examples: `scenes`, `scenes[0]`, `scenes[*].sceneName`, `scenes[0].layers[*].layerName`, `scenes[0].objectGroups[*].objectGroupName`, `scenes[0].objects[*].objectName`, `scenes[0].objects[*].objectType`, `scenes[0].objects[*].behaviors[*].behaviorName`, `scenes[0].objects[*].objectVariables[*].variableName`, `scenes[0].sceneVariables[*].variableName`, `externalLayouts[*].externalLayoutName`, `globalVariables[*].variableName`, `extensions`, `extensions[*].extensionName`, `extensions[0].customObjects[*].objectName`, `extensions[0].customBehaviors[*].behaviorName`, `extensions[0].freeFunctions[*].functionName`, `extensions[0].tests[*].testName` */
  path: string;
  /** Optional. Keep only the items of the last array in the path whose `property` matches: `value` (strict equality), or `contains` / `startsWith` (case-insensitive) to search by name. */
  filter?: {
    property?: string;
    value?: string;
    contains?: string;
    startsWith?: string;
  };
  /** Optional. Skip this many items of the resulting array (for pagination, following "... and N more items" markers). */
  offset?: number;
  /** Optional. Return at most this many items of the resulting array. */
  limit?: number;
  /** Optional. Return only {count} of the resulting array - cheap existence/size checks. */
  countOnly?: boolean;
  /** Max depth of nested objects to return. Default 2. Use 0 for structure overview, higher for full details. */
  maxDepth?: number;
  /** Max length of string values before truncation. Default 200. Set higher to read full long strings if needed. */
  maxStringLength?: number;
}): Promise<ReadGameProjectJsonResult>;

/**
 * Creates a new, empty scene within the current GDevelop project (or an external layout associated to a scene).
 */
declare function create_scene(args: {
  /** The desired unique name for the new scene (or external layout). */
  scene_name: string;
  /** Optional. If set, creates an external layout named `scene_name` for this existing scene (whose objects and layers the instances use), instead of a scene. The other arguments are then ignored. Refused when a scene already has this name. Instances of an external layout must be instantiated at runtime (see action `CreateObjectsFromExternalLayout("<name>", 0, 0)`). */
  as_external_layout_of_scene?: string;
  /** Whether to include a UI layer in the new scene. If true, a layer called "UI" will be created and added to the scene. */
  include_ui_layer?: boolean;
  /** The CSS formatted color of the background of the scene (e.g: `#000000` (black), `#FFFFFF` (white)...) */
  background_color?: string;
  /** Whether this scene should be the startup scene loaded when the game starts. */
  is_first_scene?: boolean;
}): Promise<FunctionResult>;

type InspectScenePropertiesLayersEffectsResult = FunctionResult & {
  /** The scene properties. Absent for a custom object variant, which has `area` instead. */
  properties?: {
    name: string;
    isFirstScene: boolean;
    backgroundColor: string;
    gameResolutionWidth: number;
    gameResolutionHeight: number;
    [key: string]: any;
  };
  layers: Array<{
    /** "" is the base layer (`layerName` in `inspect_extension` and the project JSON). */
    name: string;
    position: number;
    visible: boolean;
    [key: string]: any;
  }>;
  /** Custom object variants only. */
  isDefaultVariant?: boolean;
  /** Custom object variants only: the bounds of the variant. */
  area?: {
    minX: number;
    minY: number;
    minZ: number;
    maxX: number;
    maxY: number;
    maxZ: number;
  };
  /** Custom object variants only: set when the variant comes from the asset store. */
  assetStoreAssetId?: string;
  /** Custom object variants only. */
  objectGroups?: Array<{
    objectGroupName: string;
    objectNames: Array<string>;
  }>;
  [key: string]: any;
};
/**
 * Retrieves the properties of a scene (background color, etc...), as well as the layers of the scene and the effects applied on each layer, if any, and the properties of each effect (along with descriptions of these properties). For 3D games, lights (ambient light, hemisphere light, directional light) are done using effects. 3D shadows are casted by the directional light, if any. For a variant of a custom object, it returns instead `isDefaultVariant`, its `area` (`minX`, `minY`, `minZ`, `maxX`, `maxY`, `maxZ`), its layers with their effects and the object groups of the custom object (no scene `properties`). For game-wide properties (resolution, game name...) and the list of project resources, use `inspect_project_properties_resources`.
 */
declare function inspect_scene_properties_layers_effects(args: {
  /** What to inspect: a scene, or a variant of a custom object. Set `type` and the name field(s) of that type. */
  scope: {
    /** `scene`: a scene (`scene_name`). `custom_object_variant`: the child objects, instances and layers of a variant of a custom object (`extension_name` + `custom_object_name` + `variant_name`, `""` being the default variant that named variants inherit from). */
    type: 'scene' | 'custom_object_variant';
    /** The name of the scene (type `scene`). */
    scene_name?: string;
    /** The name of the extension (extension, custom_behavior, custom_object and custom_object_variant types). */
    extension_name?: string;
    /** The name of the custom object in the extension (custom_object and custom_object_variant types). */
    custom_object_name?: string;
    /** The name of the variant of the custom object (type `custom_object_variant`); "" is the default variant. */
    variant_name?: string;
  };
}): Promise<InspectScenePropertiesLayersEffectsResult>;

/**
 * Change one or more properties of a scene (background color, rename the scene, etc...) or modify a layer (add, remove, change name, order or initial visibility) or an effect of a layer (add, remove, properties), or modify a group (add, remove, rename, add/remove objects in the group), or move instances to another scene or external layout (`move_instances`). On a variant of a custom object, `changed_properties` are the bounds of its area (`areaMinX`, `areaMinY`, `areaMinZ`, `areaMaxX`, `areaMaxY`, `areaMaxZ`), `delete_this_scene` is invalid (delete a variant with `change_custom_object`) and object groups can only be changed on the default variant (`variant_name` ""). For game-wide properties (resolution, game name...), use `change_project_properties_resources`. An effect of the asset store (a skybox or a fog preset for a 3D layer) is added on a layer with the `asset_id` of a `changed_layer_effects` item.
 */
declare function change_scene_properties_layers_effects_groups(args: {
  /** What to update: a scene, an external layout, or a variant of a custom object. Set `type` and the name field(s) of that type. */
  scope: {
    /** `scene`: a scene (`scene_name`). `external_layout`: the instances of an external layout (`external_layout_name`), with the objects and layers of its associated scene. `custom_object_variant`: the child objects, instances and layers of a variant of a custom object (`extension_name` + `custom_object_name` + `variant_name`, `""` being the default variant that named variants inherit from). */
    type: 'scene' | 'external_layout' | 'custom_object_variant';
    /** The name of the scene (type `scene`). */
    scene_name?: string;
    /** The name of the external layout (type `external_layout`). */
    external_layout_name?: string;
    /** The name of the extension (extension, custom_behavior, custom_object and custom_object_variant types). */
    extension_name?: string;
    /** The name of the custom object in the extension (custom_object and custom_object_variant types). */
    custom_object_name?: string;
    /** The name of the variant of the custom object (type `custom_object_variant`); "" is the default variant. */
    variant_name?: string;
  };
  /** Optional boolean. If true, the scene (or external layout) of the scope will be deleted, with its instances. No other property needs to be set in this case. The project's first scene is updated automatically if needed. Destructive: only set this when the user has explicitly and unambiguously asked to delete this scene or external layout. Never set it on your own initiative, for example as an attempt to fix an issue. */
  delete_this_scene?: boolean;
  /** A list of properties of the scene to change. Available properties are listed by `inspect_scene_properties_layers_effects` tool. To rename the scene (or external layout), set the property `name` to the new name (events and references are updated automatically). To make the scene the one loaded when the game starts (the project `firstLayout`), set `isFirstScene` to "true". On an external layout, `associatedScene` changes the scene it belongs to (refused if its instances use objects or layers that scene does not have). */
  changed_properties?: Array<{
    property_name: string;
    new_value: string;
  }>;
  /** A list of layers to change (or add or remove). Not on an external layout: its layers are those of its scene. */
  changed_layers?: Array<{
    /** The name of the layer to change (or to add: it will be added if it does not exist. And it will be positioned at the top unless you specify `new_layer_position`). */
    layer_name: string;
    /** If renaming a layer, the new name of the layer. Unchanged if not set. */
    new_layer_name?: string;
    /** The new position of the layer. 0 is the bottom-most layer, 1 is the layer on top of it, etc. If larger than the number of layers, it will be set on top. Unchanged if not set. */
    new_layer_position?: number;
    /** The visibility of the layer when the scene starts. Set to false to hide the layer (and everything on it) initially. Unchanged if not set. To show or hide a layer while the game is running, use the "Show layer" action in events instead. */
    new_visibility?: boolean;
    /** If true, the layer with this name will be deleted. All instances on the layer will also be removed (if `move_instances_to_layer` is not set). */
    delete_this_layer?: boolean;
    /** If `delete_this_layer` is set to true, this can contain the name of the layer to move the instances to (use an empty string "" to move them to the base layer). If not set, the instances will be removed. */
    move_instances_to_layer?: string;
  }>;
  /** A list of effects to add, remove or change (update their properties) for one or more layers. */
  changed_layer_effects?: Array<{
    /** The name of the layer to which the effect (existing or new) belongs. */
    layer_name: string;
    /** The name of the effect to change (or add, it will be added if it does not exist. In this case, `effect_type` must be set). */
    effect_name: string;
    /** If renaming an effect, the new name of the effect. Unchanged if not set. */
    new_effect_name?: string;
    /** The type of the effect, only when adding a new effect. Must be the exact type of the effect, as listed in the GDevelop documentation. For example: `Exposure`, `KawaseBlur`... Not needed with `asset_id`: the effect then takes the type of the asset. */
    effect_type?: string;
    /** The hexadecimal ID alone (e.g. `31b04c0eea`) of an effect of the asset store (a skybox, a fog preset... found with `search_object_asset_store` and `allowed_object_types` set to its effect type, e.g. `["Scene3D::Skybox"]`) to install and use for this effect: the effect takes the type and the parameters of the asset, and its resources, if any (the six face images of a skybox), are installed in the project and set on its properties - never set them by hand. */
    asset_id?: string;
    /** The new position of the effect in the order of effects. 0 is the first applied effect. */
    new_effect_position?: number;
    /** If true, the effect with this name will be deleted. */
    delete_this_effect?: boolean;
    /** New values to set for the effect. Available properties can be inspected using `inspect_scene_properties_layers_effects` tool for existing or newly added effects. */
    changed_properties?: Array<{
      property_name: string;
      new_value: string;
    }>;
  }>;
  /** A list of groups to change (or add or remove). */
  changed_groups?: Array<{
    /** The name of the group to change (or to add: it will be added if it does not exist). */
    group_name: string;
    /** The new name of the group, if renaming it. This can be left empty to not rename the group. */
    new_group_name?: string;
    /** Optional boolean. If true, the group with this name will be deleted. The objects in the group will not be deleted, just removed from the group. */
    delete_this_group?: boolean;
    /** Object names to add to the group. Only list the objects you want to add — the objects already in the group are kept. If an object is not found, it is ignored (do not create objects here). No need to set this when deleting the group (`delete_this_group` is true). */
    objects_to_add?: Array<string>;
    /** Object names to remove from the group. Only list the objects you want to remove — the rest of the group is left untouched. The objects themselves are not deleted, they are only removed from the group. No need to set this when deleting the group (`delete_this_group` is true). */
    objects_to_remove?: Array<string>;
  }>;
  /** Optional. Move instances of `scope` (a scene or external layout) to `to_scope` (another scene or external layout), keeping all their properties and ids. All instances are moved unless filtered (an instance must match every given filter). Atomic: refused if the target lacks an object or layer of a moved instance. Applied before the other changes of the call. */
  move_instances?: {
    /** Where to move the instances: an existing scene or external layout (create it first with `create_scene`). Set `type` and the name field(s) of that type. */
    to_scope: {
      /** `scene`: a scene (`scene_name`). `external_layout`: the instances of an external layout (`external_layout_name`), with the objects and layers of its associated scene. */
      type: 'scene' | 'external_layout';
      /** The name of the scene (type `scene`). */
      scene_name?: string;
      /** The name of the external layout (type `external_layout`). */
      external_layout_name?: string;
    };
    /** Optional: only move the instances of these objects (exact names). */
    filter_by_object_names?: Array<string>;
    /** Optional: only move the instances on these layers ("" is the base layer). */
    filter_by_layer_names?: Array<string>;
    /** Optional: only move these instances (the `id` of each instance from `describe_instances`). Refused if an id is not found. */
    instance_ids?: Array<string>;
  };
}): Promise<FunctionResult>;

type InspectProjectPropertiesResourcesResult = FunctionResult & {
  properties: {
    name: string;
    windowWidth: number;
    windowHeight: number;
    firstLayout: string;
    [key: string]: any;
  };
  sceneNames: Array<string>;
  /** Only when `list_all_resources` or `filter_by_resource_name` is set. */
  resources?: Array<{
    name: string;
    kind: string;
    [key: string]: any;
  }>;
  [key: string]: any;
};
/**
 * Retrieves, in a single call with no argument, the project-wide properties of the game (name, resolution, orientation, scale mode, FPS limits, first scene loaded on startup...), the list of scenes, and a summary of the resources of the project (how many images, audio files, fonts, 3D models...). Resources can also be searched by name or fully listed with the optional arguments.
 */
declare function inspect_project_properties_resources(args: {
  /** Optional: list the resources whose name contains this text (case-insensitive), with the file each resource points to. */
  filter_by_resource_name?: string;
  /** Optional: if true, list all the resources of the project, with the file each resource points to. If not set, only a count of resources per kind is returned. */
  list_all_resources?: boolean;
}): Promise<InspectProjectPropertiesResourcesResult>;

/**
 * Change one or more project-wide properties of the game (name, resolution, orientation, scale mode, FPS limits, the first scene loaded when the game starts, etc.), rename or delete a resource of the project, or add the files attached by the user to the resources of the project. Current properties and resources are listed by `inspect_project_properties_resources`.
 */
declare function change_project_properties_resources(args: {
  /** A list of project properties to change. */
  changed_properties?: Array<{
    /** The name of the property to change, as listed by `inspect_project_properties_resources`: `name` (the game name), `description`, `version`, `author`, `packageName`, `orientation` ("default", "landscape" or "portrait", for mobile), `windowWidth` and `windowHeight` (the game resolution, in pixels), `adaptGameResolutionAtRuntime` ("true" or "false"), `sizeOnStartupMode` ("adaptWidth", "adaptHeight" or an empty string), `scaleMode` ("linear", or "nearest" for pixel-art games), `pixelsRounding` ("true" or "false"), `antialiasingMode` ("none" or "MSAA"), `minFPS` and `maxFPS`, `firstLayout` (the name of the scene loaded when the game starts - an empty string means the first scene of the project). */
    property_name: string;
    /** The new value of the property, always sent as a string (for example: "1280", "true", "nearest", "My Game"). */
    new_value: string;
  }>;
  /** A list of resources of the project to rename, delete, or whose file to replace. */
  changed_resources?: Array<{
    /** The name of the resource to change, as listed by `inspect_project_properties_resources`. */
    resource_name: string;
    /** If renaming the resource, its new name (objects and events using it are updated automatically). Unchanged if not set. */
    new_resource_name?: string;
    /** Optional boolean. If true, the resource with this name will be removed from the project. This fails if the resource is still used by an object. In that case, never modify or update the objects to force the deletion: stop and report the problem, so the user can decide what to do with these objects. Destructive: only set this when the user has explicitly and unambiguously asked to delete this resource. Never set it on your own initiative, for example as an attempt to fix an issue. */
    delete_this_resource?: boolean;
    /** The id of a file attached by the user, to become the file of this resource: the resource keeps its name, so every object, effect and event using it uses the new file. The file must be of the same kind (an image for an image resource, a font for a font...). */
    replace_file_with_attachment_id?: string;
  }>;
  /** Files attached by the user to add as new resources of the project. Then, use the name of the new resource where it is needed (an object property, an effect parameter, events...). */
  added_resources?: Array<{
    /** The id of the file attached by the user. */
    attachment_id: string;
    /** The name of the new resource. Defaults to the file name. If a resource already has this name, another name is chosen: use the name returned. */
    resource_name?: string;
    /** The kind of resource, only needed when the file extension is not enough (a .json file can be a json, tilemap, tileset or spine resource). */
    resource_kind?: 'image' | 'audio' | 'font' | 'video' | 'json' | 'tilemap' | 'tileset' | 'bitmapFont' | 'model3D' | 'atlas' | 'spine';
  }>;
}): Promise<FunctionResult>;

/**
 * Create, edit or delete one or more variables in a single call. Any variable used in events must be created beforehand if it does not already exist in the project. All the variables changed in one call share the same scope (and same scene/object/instance). Use multiple calls for different scopes (or different instances).
 */
declare function add_or_edit_variable(args: {
  /** Where the variables live. Defaults to the project (global variables) when not set. Set `type` and the name field(s) of that type. */
  scope?: {
    /** `project`: the project itself (global objects, global variables). `scene`: a scene (`scene_name`). `extension`: an extension of the project (`extension_name`): its free functions and extension variables. `custom_object_variant`: the child objects, instances and layers of a variant of a custom object (`extension_name` + `custom_object_name` + `variant_name`, `""` being the default variant that named variants inherit from). */
    type: 'project' | 'scene' | 'extension' | 'custom_object_variant';
    /** The name of the scene (type `scene`). */
    scene_name?: string;
    /** The name of the extension (extension, custom_behavior, custom_object and custom_object_variant types). */
    extension_name?: string;
    /** The name of the custom object in the extension (custom_object and custom_object_variant types). */
    custom_object_name?: string;
    /** The name of the variant of the custom object (type `custom_object_variant`); "" is the default variant. */
    variant_name?: string;
  };
  /** Which variables to change, inside the `scope`. With a `scene` scope: `global` (a project wide variable), `scene`, `object`, `group` (the variables of every object of a group) or `instance` (the variables of one placed instance, with `instance_id`). With an `extension` scope: `scene` (the scene variables of the extension) or `global` (the global variables of the extension). With a `custom_object_variant` scope: `object`, `group` or `instance`, on the child objects of the variant. With a `project` scope (the default): `global`, `object` or `group` (global objects). `object` and `group` need the object name (`object_name`). Note that `object` variables are shared defaults for ALL instances of the object: to give a different value to a specific placed instance (e.g. a different `SlotNumber` per instance), use the `instance` scope. A variable set on an instance is also declared on its object when missing (all the instances of an object have the same variables, each instance can hold its own value), so events can read it with `TheObject.TheVariable`. */
  variable_scope: string;
  /** The name of the object or object group to which the variables belong. Required if `variable_scope` is `object` or `group`. */
  object_name?: string;
  /** The identifier of the placed instance whose variables to change — get it from `describe_instances` (the `id` field of each instance). To change the variables of several instances, use one call per instance. Only used (and required) when `variable_scope` is `instance`. */
  instance_id?: string;
  /** The list of variables to create, edit or delete (all sharing the scope given above). */
  variables: Array<{
    /** The name of the variable to create, edit or delete. Optionally, a path can be provided to target a nested variable (e.g., "MyVariable.ChildVariable" or "MyArray[0]"). When creating or editing, if the variable (or any of its parents) does not exist, it will be created. */
    variable_name_or_path: string;
    /** The new value of the variable. Can be a string (`Hello World`), a number (e.g: `0`, `3.14`, `-5.23`), a boolean (`true`, `false`) or some JSON which will be parsed as an object (to make a structure variable) or array and put inside the variable. Required unless `delete_this_variable` is true. */
    value?: string;
    /** The variable type. Can be `string`, `number` or `boolean`. If not set, the value will be used to infer the type. */
    variable_type?: string;
    /** If true, the variable (or the nested variable at the given path) is removed entirely from the project. Use this to clean up variables that are no longer needed, instead of setting them to an empty value. */
    delete_this_variable?: boolean;
  }>;
}): Promise<FunctionResult>;

type InspectVariablesResult = FunctionResult & {
  variables: Array<SimplifiedVariable>;
  [key: string]: any;
};
/**
 * Read variables and their children (structures/arrays) for a scope, to see what exists and their exact paths (e.g. `MyArray[2]`, `MyStruct.child`) before editing them with `add_or_edit_variable`.
 */
declare function inspect_variables(args: {
  /** Where the variables live. Defaults to the project (global variables) when not set. Set `type` and the name field(s) of that type. */
  scope?: {
    /** `project`: the project itself (global objects, global variables). `scene`: a scene (`scene_name`). `extension`: an extension of the project (`extension_name`): its free functions and extension variables. `custom_object_variant`: the child objects, instances and layers of a variant of a custom object (`extension_name` + `custom_object_name` + `variant_name`, `""` being the default variant that named variants inherit from). */
    type: 'project' | 'scene' | 'extension' | 'custom_object_variant';
    /** The name of the scene (type `scene`). */
    scene_name?: string;
    /** The name of the extension (extension, custom_behavior, custom_object and custom_object_variant types). */
    extension_name?: string;
    /** The name of the custom object in the extension (custom_object and custom_object_variant types). */
    custom_object_name?: string;
    /** The name of the variant of the custom object (type `custom_object_variant`); "" is the default variant. */
    variant_name?: string;
  };
  /** Which variables to read, inside the `scope`. With a `scene` scope: `global` (a project wide variable), `scene`, `object` or `group` (the variables of every object of a group). With an `extension` scope: `scene` (the scene variables of the extension) or `global` (the global variables of the extension). With a `custom_object_variant` scope: `object` or `group`, on the child objects of the variant. With a `project` scope (the default): `global`, `object` or `group` (global objects). `object` and `group` need the object name (`object_name`). */
  variable_scope: string;
  /** The name of the object or object group whose variables to inspect. Required if `variable_scope` is `object` or `group`. */
  object_name?: string;
  /** Optional. The specific variables or nested paths to inspect (e.g. `Score`, `MyStruct.child`, `MyArray[2]`). If omitted or empty, all variables of the scope are returned. */
  variable_names_or_paths?: Array<string>;
}): Promise<InspectVariablesResult>;

type ChangeGameplayTestsResult = FunctionResult & {
  /** The tests of the scope after the changes, in order (capped at 50). */
  tests: Array<{
    test_name: string;
    description: string;
  }>;
  [key: string]: any;
};
/**
 * Delete gameplay tests, or change their properties: `name` (rename), `description`, `index` (0-based position in the tests list). The source can NOT be changed here: test code must go through the gameplay test runner so it is executed and verified. Returns the ordered tests of the scope after the changes (capped at 50).
 */
declare function change_gameplay_tests(args: {
  /** The tests container the tests belong to: the project itself, or one of its events-based extensions. */
  scope: {
    type: 'project' | 'extension';
    /** The name of the events-based extension (required when `type` is 'extension'). */
    extension_name?: string;
  };
  /** The changes to apply, one entry per test. */
  changes: Array<{
    /** The exact name of an existing test in the scope. */
    test_name: string;
    /** If true, the test is deleted (`changed_properties` is then ignored). */
    delete_this_test?: boolean;
    /** A list of test properties to change. */
    changed_properties?: Array<{
      /** 'name' (rename — fails if the new name is taken), 'description', or 'index' (new 0-based position, clamped). */
      property_name: string;
      /** The new value, always as a string (e.g. '0' for an index). */
      new_value: string;
    }>;
  }>;
}): Promise<ChangeGameplayTestsResult>;

type InspectExtensionResult = FunctionResult & {
  /** Always present: the extension-level overview. */
  extension: {
    extensionName: string;
    fullName: string;
    /** true for extensions installed from the extension store: they cannot be modified. */
    isReadOnly: boolean;
    customObjects: Array<{
      objectName: string;
      /** `ExtensionName::ObjectName`, usable in `object_type`. */
      objectType: string;
      /** One-line summary (type, children, functions). */
      signature: string;
      [key: string]: any;
    }>;
    customBehaviors: Array<{
      behaviorName: string;
      /** `ExtensionName::BehaviorName`, usable in `behavior_type`. */
      behaviorType: string;
      signature: string;
      [key: string]: any;
    }>;
    freeFunctions: Array<{
      functionName: string;
      functionType: string;
      signature: string;
      [key: string]: any;
    }>;
    globalVariables: Array<SimplifiedVariable>;
    sceneVariables: Array<SimplifiedVariable>;
    dependencies: Array<{
      dependencyName: string;
      /** `npm` or `cordova`. */
      type: string;
      [key: string]: any;
    }>;
    tests: Array<{
      testName: string;
      type: string;
      [key: string]: any;
    }>;
    [key: string]: any;
  };
  /** When `custom_object_name` is given. */
  customObject?: {
    objectName: string;
    /** `ExtensionName::ObjectName`, usable in `object_type`. */
    objectType: string;
    properties: Array<SimplifiedProperty>;
    functions: Array<SimplifiedFunction>;
    /** Child objects of the default variant. */
    childObjects: Array<SimplifiedChildObject>;
    /** Named variants (the default variant is `""`). */
    variantNames: Array<string>;
    [key: string]: any;
  };
  /** When `custom_behavior_name` is given. */
  customBehavior?: {
    behaviorName: string;
    /** `ExtensionName::BehaviorName`, usable in `behavior_type`. */
    behaviorType: string;
    properties: Array<SimplifiedProperty>;
    sharedProperties: Array<SimplifiedProperty>;
    functions: Array<SimplifiedFunction>;
    [key: string]: any;
  };
  /** When `function_name` is given: the full declaration with its `callForm`. */
  functionDeclaration?: SimplifiedFunction;
  /** When `variant_name` is given (`""` = the default variant): what a `custom_object_variant` scope sees. */
  variant?: {
    variantName: string;
    isDefaultVariant: boolean;
    /** With their `behaviors`, `objectVariables` and a `configuration` summary. */
    childObjects: Array<SimplifiedChildObject>;
    layers: Array<{
      /** "" is the base layer. */
      layerName: string;
      position: number;
      visible: boolean;
      [key: string]: any;
    }>;
    instances: Array<SimplifiedInstance>;
    [key: string]: any;
  };
  [key: string]: any;
};
/**
 * Read the declarations of an extension of the project, drilling down level by level (the events are NOT returned: read them with `read_events_source`).
 * With `extension_name` alone: the settings of the extension, its variables, dependencies, gameplay tests and the one-line signatures of its custom objects, custom behaviors and free functions.
 * Add `custom_object_name` or `custom_behavior_name` (never both): its settings, its properties (and shared properties for a behavior) and the full signatures of its functions.
 * Add `function_name`: that one function in full - type, parameters (including the implicit `Object` and `Behavior` ones) and how to call it from "events script" (`Ext::Fn(...)` for a free function, `Object.Ext::Fn(...)` for an object function, `Object.Behavior::Fn(...)` for a behavior function, plus the expression form when it is one). Lifecycle functions have no call form: they are called by the engine.
 * Add `variant_name` (with `custom_object_name`): the area, layers, child objects with their configuration, object groups and instances of that variant.
 * Private functions and properties are always included (you are authoring the extension). An extension installed from the extension store is returned with `isReadOnly: true`: it can be read and called, never modified.
 */
declare function inspect_extension(args: {
  /** The name of the extension of the project to read (as listed in `extensions` of the game project). */
  extension_name: string;
  /** Optional. The name of a custom object of the extension to read. Cannot be set together with `custom_behavior_name`. */
  custom_object_name?: string;
  /** Optional. The name of a custom behavior of the extension to read. Cannot be set together with `custom_object_name`. */
  custom_behavior_name?: string;
  /** Optional. The name of a function to read in full: a free function of the extension, or a function of the custom object or custom behavior given above. */
  function_name?: string;
  /** Optional. The name of a variant of the custom object to read ("" is the default variant). Requires `custom_object_name`. */
  variant_name?: string;
}): Promise<InspectExtensionResult>;

type CreateExtensionResult = FunctionResult & {
  /** The final name of the extension: use it in the following calls. */
  extensionName: string;
  [key: string]: any;
};
/**
 * Creates a new, empty extension in the project - or duplicates an existing one into an editable copy.
 * An extension holds custom behaviors, custom objects, free functions and its own variables: add them with `create_custom_behavior`, `create_custom_object` and `create_custom_function`.
 * The final name is returned as `extensionName` and can differ from the requested one (invalid characters removed, a suffix added when the name is already taken): always reuse the returned name in the next calls.
 * An extension installed from the extension store is read-only, but `duplicated_extension_name` makes an editable copy of it (which will no longer receive the store updates).
 */
declare function create_extension(args: {
  /** The name of the extension to create. Only letters, digits and underscores, not starting with a digit (e.g. `DialogSystem`). It is the namespace of everything it contains (`DialogSystem::OpenDialog`). */
  extension_name: string;
  /** Optional. The name of an existing extension of the project to duplicate: everything inside is copied and renamed for the new extension. The properties given below then override the copied ones. */
  duplicated_extension_name?: string;
  /** Optional. The name shown to the user in the editor (e.g. `Dialog system`). */
  full_name?: string;
  /** Optional. One sentence saying what the extension does, shown in the extensions list. */
  short_description?: string;
  /** Optional. The full description of the extension (Markdown accepted). */
  description?: string;
  /** Optional. The category of the extension in the editor (e.g. `User interface`, `Game mechanic`, `Visual effect`). */
  category?: string;
  /** Optional. Comma-separated tags describing the extension (e.g. `dialog, ui, text`). */
  tags?: string;
  /** Optional. The author of the extension. */
  author?: string;
}): Promise<CreateExtensionResult>;

type ChangeExtensionPropertiesResult = FunctionResult & {
  /** The name of the extension after the change. */
  extensionName: string;
  /** True when the call had nothing to change. */
  nothingChanged?: boolean;
  [key: string]: any;
};
/**
 * Changes the properties of an extension of the project, renames it, deletes it, or changes the dependencies (npm or Cordova packages) it declares.
 * Renaming updates everything using the extension in the project: its functions called from events, and the object and behavior types of its custom objects and custom behaviors.
 * Deleting is refused while something still uses the extension, unless `delete_even_if_used` is set.
 */
declare function change_extension_properties(args: {
  /** The name of the extension to change. */
  extension_name: string;
  /** If renaming the extension, its new name (only letters, digits and underscores, not starting with a digit). Everything using it is updated. */
  new_name?: string;
  /** Optional boolean. If true, the extension and everything it contains is deleted. Destructive: only set this when the user has explicitly and unambiguously asked to delete this extension. */
  delete_this_extension?: boolean;
  /** Only used with `delete_this_extension`: delete the extension even when objects, behaviors or events of the project still use it (they become invalid until they are fixed). */
  delete_even_if_used?: boolean;
  /** A list of properties of the extension to change. `tags` is a comma-separated list of tags; `version` is a version number like `1.0.0`; `dimension`, `helpPath`, `previewIconUrl` and `iconUrl` are free text. */
  changed_properties?: Array<{
    property_name: 'fullName' | 'shortDescription' | 'description' | 'category' | 'tags' | 'version' | 'author' | 'helpPath' | 'previewIconUrl' | 'iconUrl' | 'dimension';
    new_value: string;
  }>;
  /** A list of dependencies of the extension to add, change or remove. A dependency is an npm package (web and desktop builds) or a Cordova plugin (mobile builds) added to the exported game. */
  changed_dependencies?: Array<{
    /** The name of the dependency to change, or of the dependency to add if the extension has none with this name. */
    dependency_name: string;
    /** If renaming the dependency, its new name. Unchanged if not set. */
    new_name?: string;
    /** If true, the dependency is removed from the extension. */
    delete_this_dependency?: boolean;
    /** Required when adding a dependency: `npm` for the web and desktop builds, `cordova` for the mobile ones. */
    type?: 'npm' | 'cordova';
    /** The name of the package as it must be installed in the exported game (e.g. the npm package name or the Cordova plugin id). */
    export_name?: string;
    /** The version of the package to install (e.g. `1.6.0`). */
    version?: string;
    /** Extra settings of the dependency, as an object of string values (e.g. the variables of a Cordova plugin). */
    extra_settings?: {
      [key: string]: any;
    };
  }>;
}): Promise<ChangeExtensionPropertiesResult>;

type CreateCustomObjectResult = FunctionResult & {
  extensionName: string;
  /** The final name of the custom object. */
  customObjectName: string;
  /** `ExtensionName::ObjectName`: pass it as `object_type` to place one in a scene. */
  objectType: string;
  [key: string]: any;
};
/**
 * Creates a custom object in an extension: an object made of child objects, with its own properties and functions, that can then be placed in scenes like any other object type.
 * The returned `objectType` (`ExtensionName::ObjectName`) is what `create_or_replace_object` expects to add one to a scene, and the final name is returned as `customObjectName` (it can differ from the requested one).
 * Fill it afterwards with `create_or_replace_object` and `put_2d_instances`/`put_3d_instances` on a `custom_object_variant` scope (its child objects and their instances), `change_custom_object` (its properties) and `create_custom_function` (its functions).
 */
declare function create_custom_object(args: {
  /** The name of the extension the custom object is created in. */
  extension_name: string;
  /** The name of the custom object to create. Only letters, digits and underscores, not starting with a digit (e.g. `Dialog`). */
  custom_object_name: string;
  /** Optional. The name of an existing custom object to duplicate (its child objects, properties, functions and events are copied). */
  duplicated_custom_object_name?: string;
  /** Optional. The extension the duplicated custom object comes from, when it is not `extension_name`. An object of an extension installed from the store can be duplicated this way. */
  duplicated_from_extension_name?: string;
  /** Optional. The name shown to the user in the editor (e.g. `Dialog box`). */
  full_name?: string;
  /** Optional. What the object is, shown to the user in the editor. */
  description?: string;
  /** Optional. The name given by default to a new instance of this object added to a scene (e.g. `Dialog`). */
  default_name?: string;
  /** Optional. True for an object rendered in 3D: needed when its child objects are 3D objects (a 3D behavior on the custom object needs it too). */
  is_3d?: boolean;
  /** Optional. True to give the object animations, so the animation actions, conditions and expressions work on it. */
  is_animatable?: boolean;
  /** Optional. True to give the object a text, so the text actions, conditions and expressions work on it. */
  is_text_container?: boolean;
  /** Optional. True so the children follow the size given to each instance of the object (how a resizable UI panel behaves), instead of keeping the size they have in the object. */
  is_inner_area_following_parent_size?: boolean;
  /** Optional. True to hide the object from the editor: it can then only be used as a child of another object of the same extension. */
  is_private?: boolean;
  /** Optional. The bounds of the object in its own coordinates, which give its default size (64x64 pixels when not set). */
  area?: {
    minX: number;
    minY: number;
    minZ?: number;
    maxX: number;
    maxY: number;
    maxZ?: number;
  };
}): Promise<CreateCustomObjectResult>;

type ChangeCustomObjectResult = FunctionResult & {
  extensionName: string;
  /** The name of the custom object after the change. */
  customObjectName: string;
  objectType: string;
  /** The named variants of the custom object after the change (the default variant is `""` and is not listed). */
  variantNames: Array<string>;
  /** True when the call had nothing to change. */
  nothingChanged?: boolean;
  [key: string]: any;
};
/**
 * Changes a custom object of an extension: its settings, its properties (the values configured on each object placed in a scene), its variants, or renames or deletes it. Also forwards the actions, conditions and expressions of one of its child objects.
 * Renaming updates every object of the project using this type, and every custom object having one as a child.
 * `changed_variants` creates or deletes named variants. A variant is an alternative content of the object (child objects configuration, instances, layers): `""` is the default variant, from which every named variant inherits its child objects. Renaming a variant is not supported.
 * Returns the named variants of the object after the change (`variantNames`).
 */
declare function change_custom_object(args: {
  /** The name of the extension holding the custom object. */
  extension_name: string;
  /** The name of the custom object to change. */
  custom_object_name: string;
  /** If renaming the custom object, its new name (only letters, digits and underscores, not starting with a digit). Everything using it is updated. */
  new_name?: string;
  /** Optional boolean. If true, the custom object is deleted from the extension. Destructive: only set this when the user has explicitly and unambiguously asked to delete it. */
  delete_this_custom_object?: boolean;
  /** Only used with `delete_this_custom_object`: delete even when objects of the project still use this type (they become invalid until they are fixed). */
  delete_even_if_used?: boolean;
  /** A list of settings of the custom object to change. `isRenderedIn3D`, `isAnimatable`, `isTextContainer`, `isInnerAreaFollowingParentSize` and `isPrivate` take "true" or "false"; `areaMinX` to `areaMaxZ` (the bounds giving the default size) take a number as a string. */
  changed_settings?: Array<{
    setting_name: 'fullName' | 'description' | 'defaultName' | 'isRenderedIn3D' | 'isAnimatable' | 'isTextContainer' | 'isInnerAreaFollowingParentSize' | 'isPrivate' | 'areaMinX' | 'areaMinY' | 'areaMinZ' | 'areaMaxX' | 'areaMaxY' | 'areaMaxZ' | 'assetStoreTag';
    new_value: string;
  }>;
  /** A list of properties of the custom object to add, change or delete. A property is a value the user configures on each object placed in a scene, and that the events of the object can read and write. */
  changed_properties?: Array<{
    /** The name of the property to change, or of the property to add if it does not exist yet. Only letters, digits and underscores, not starting with a digit. */
    property_name: string;
    /** If renaming the property, its new name. The events and the objects using it are updated. */
    new_name?: string;
    /** If true, the property is removed. The events using it must be fixed afterwards. */
    delete_this_property?: boolean;
    /** The type of the property (`Number` by default when adding one). `Choice` and `NumberWithChoices` need `choices`; `Behavior` and `Resource` need `extra_info`. `LeaderboardId` is only for a custom object; `Layer`, `ObjectAnimationName`, `KeyboardKey` and `Behavior` only for a custom behavior (`Layer` being the only one also allowed on a shared property). */
    type?: 'Number' | 'String' | 'Boolean' | 'Choice' | 'NumberWithChoices' | 'Color' | 'MultilineString' | 'Resource' | 'Behavior' | 'KeyboardKey' | 'Layer' | 'ObjectAnimationName' | 'LeaderboardId';
    /** The label of the property, shown to the user. */
    label?: string;
    /** A longer explanation of the property, shown to the user. */
    description?: string;
    /** The group the property is displayed in, to organize a long list of properties. */
    group?: string;
    /** The default value of the property, always as a string (`0`, `true`, a choice value, a color as `255;255;255`...). */
    default_value?: string;
    /** For a `Choice` or `NumberWithChoices` property: the possible values, replacing the existing ones. */
    choices?: Array<{
      /** The value stored in the property. */
      value: string;
      /** The text shown to the user (defaults to the value). */
      label?: string;
    }>;
    /** The required behavior type for a `Behavior` property (e.g. `MyExtension::MyBehavior`), or the resource kind for a `Resource` property (`image`, `audio`, `json`, `font`, `video`, `model3D`...). */
    extra_info?: string;
    /** If true, the property is not shown to the user (an internal state of the object or behavior). */
    hidden?: boolean;
    /** If true, the property is only shown in the advanced settings. */
    advanced?: boolean;
    /** If true, the property is marked as deprecated (kept for existing games, hidden from the editor). */
    deprecated?: boolean;
    /** The unit of a `Number` property, as named in GDevelop (e.g. `Pixel`, `Second`, `DegreeAngle`, `PixelSpeed`). */
    measurement_unit?: string;
    /** If true, an expression reading the property and an action changing it are generated, so the user can use the property from the events sheet. */
    generate_getter_and_setter?: boolean;
  }>;
  /** A list of variants of the custom object to create or delete. */
  changed_variants?: Array<{
    /** The name of the variant to create or delete. `""` is the default variant: it can neither be created nor deleted. */
    variant_name: string;
    /** Not supported yet: a variant cannot be renamed. Create a new variant from it and delete the old one instead. */
    new_name?: string;
    /** When creating a variant, the name of the variant to copy it from (`""` copies the default variant). When not set, the new variant starts empty, with a base layer and the default area. */
    duplicated_from_variant_name?: string;
    /** If true, the variant is deleted and every object using it falls back to the default variant. */
    delete_this_variant?: boolean;
  }>;
  /** Sets the area (the default size) of every variant from the child instances it holds, instead of computing `areaMinX` to `areaMaxZ` by hand. Call it after placing or moving the child instances. `min_at_origin` moves the children so (0;0;0) is their minimum corner; `centered_on_origin` moves them so (0;0;0) is their center, which puts the center of rotation of the custom object on its own position - what a turret, a wheel or anything spinning around itself needs. */
  fit_area_to_children?: 'min_at_origin' | 'centered_on_origin';
  /** The names of child objects whose actions, conditions and expressions must be forwarded by this custom object, so they can be used directly on it. This is how an object of a read-only extension is customized: hold one as a child and forward what you need. */
  forward_child_object_functions?: Array<string>;
}): Promise<ChangeCustomObjectResult>;

type CreateCustomBehaviorResult = FunctionResult & {
  extensionName: string;
  /** The final name of the custom behavior. */
  customBehaviorName: string;
  /** `ExtensionName::BehaviorName`: pass it as `behavior_type` to `add_behavior`. */
  behaviorType: string;
  [key: string]: any;
};
/**
 * Creates a custom behavior in an extension: reusable logic with its own properties, added to objects with `add_behavior`.
 * The returned `behaviorType` (`ExtensionName::BehaviorName`) is what `add_behavior` expects, and the final name is returned as `customBehaviorName` (it can differ from the requested one).
 * Fill it afterwards with `change_custom_behavior` (its properties) and `create_custom_function` (its functions, including the lifecycle ones like `doStepPreEvents`).
 */
declare function create_custom_behavior(args: {
  /** The name of the extension the custom behavior is created in. */
  extension_name: string;
  /** The name of the custom behavior to create. Only letters, digits and underscores, not starting with a digit (e.g. `Health`). */
  custom_behavior_name: string;
  /** Optional. The name of an existing custom behavior to duplicate (its properties, functions and events are copied). */
  duplicated_custom_behavior_name?: string;
  /** Optional. The extension the duplicated custom behavior comes from, when it is not `extension_name`. A behavior of an extension installed from the store can be duplicated this way. */
  duplicated_from_extension_name?: string;
  /** Optional. The name shown to the user in the editor (e.g. `Health points`). */
  full_name?: string;
  /** Optional. What the behavior does, shown to the user in the editor. */
  description?: string;
  /** Optional. The type of object the behavior can be used on (e.g. `Sprite`, `TextObject::Text`). Leave it empty (the default) to accept any object. */
  object_type?: string;
  /** Optional. True to hide the behavior from the editor: it can then only be used inside the same extension, typically as a required behavior of another one. */
  is_private?: boolean;
}): Promise<CreateCustomBehaviorResult>;

type ChangeCustomBehaviorResult = FunctionResult & {
  extensionName: string;
  /** The name of the custom behavior after the change. */
  customBehaviorName: string;
  behaviorType: string;
  /** True when the call had nothing to change. */
  nothingChanged?: boolean;
  [key: string]: any;
};
/**
 * Changes a custom behavior of an extension: its settings, its properties, its shared properties, or renames or deletes it.
 * A property is configured on each object having the behavior; a shared property is configured once for all the objects of a scene having it.
 * Renaming updates every object using the behavior and every use of it in the events.
 */
declare function change_custom_behavior(args: {
  /** The name of the extension holding the custom behavior. */
  extension_name: string;
  /** The name of the custom behavior to change. */
  custom_behavior_name: string;
  /** If renaming the custom behavior, its new name (only letters, digits and underscores, not starting with a digit). Everything using it is updated. */
  new_name?: string;
  /** Optional boolean. If true, the custom behavior is deleted from the extension. Destructive: only set this when the user has explicitly and unambiguously asked to delete it. */
  delete_this_custom_behavior?: boolean;
  /** Only used with `delete_this_custom_behavior`: delete even when objects of the project still have this behavior (it is removed from them). */
  delete_even_if_used?: boolean;
  /** A list of settings of the custom behavior to change. `isPrivate` takes "true" or "false"; `objectType` takes an object type (e.g. `Sprite`) or an empty string for any object; `quickCustomizationVisibility` takes `default`, `visible` or `hidden`. */
  changed_settings?: Array<{
    setting_name: 'fullName' | 'description' | 'objectType' | 'isPrivate' | 'quickCustomizationVisibility';
    new_value: string;
  }>;
  /** A list of properties of the behavior to add, change or delete. Each object having the behavior configures its own values. */
  changed_properties?: Array<{
    /** The name of the property to change, or of the property to add if it does not exist yet. Only letters, digits and underscores, not starting with a digit. */
    property_name: string;
    /** If renaming the property, its new name. The events and the objects using it are updated. */
    new_name?: string;
    /** If true, the property is removed. The events using it must be fixed afterwards. */
    delete_this_property?: boolean;
    /** The type of the property (`Number` by default when adding one). `Choice` and `NumberWithChoices` need `choices`; `Behavior` and `Resource` need `extra_info`. `LeaderboardId` is only for a custom object; `Layer`, `ObjectAnimationName`, `KeyboardKey` and `Behavior` only for a custom behavior (`Layer` being the only one also allowed on a shared property). */
    type?: 'Number' | 'String' | 'Boolean' | 'Choice' | 'NumberWithChoices' | 'Color' | 'MultilineString' | 'Resource' | 'Behavior' | 'KeyboardKey' | 'Layer' | 'ObjectAnimationName' | 'LeaderboardId';
    /** The label of the property, shown to the user. */
    label?: string;
    /** A longer explanation of the property, shown to the user. */
    description?: string;
    /** The group the property is displayed in, to organize a long list of properties. */
    group?: string;
    /** The default value of the property, always as a string (`0`, `true`, a choice value, a color as `255;255;255`...). */
    default_value?: string;
    /** For a `Choice` or `NumberWithChoices` property: the possible values, replacing the existing ones. */
    choices?: Array<{
      /** The value stored in the property. */
      value: string;
      /** The text shown to the user (defaults to the value). */
      label?: string;
    }>;
    /** The required behavior type for a `Behavior` property (e.g. `MyExtension::MyBehavior`), or the resource kind for a `Resource` property (`image`, `audio`, `json`, `font`, `video`, `model3D`...). */
    extra_info?: string;
    /** If true, the property is not shown to the user (an internal state of the object or behavior). */
    hidden?: boolean;
    /** If true, the property is only shown in the advanced settings. */
    advanced?: boolean;
    /** If true, the property is marked as deprecated (kept for existing games, hidden from the editor). */
    deprecated?: boolean;
    /** The unit of a `Number` property, as named in GDevelop (e.g. `Pixel`, `Second`, `DegreeAngle`, `PixelSpeed`). */
    measurement_unit?: string;
    /** If true, an expression reading the property and an action changing it are generated, so the user can use the property from the events sheet. */
    generate_getter_and_setter?: boolean;
  }>;
  /** A list of shared properties of the behavior to add, change or delete. A shared property has a single value for all the objects of a scene having this behavior. */
  changed_shared_properties?: Array<{
    /** The name of the property to change, or of the property to add if it does not exist yet. Only letters, digits and underscores, not starting with a digit. */
    property_name: string;
    /** If renaming the property, its new name. The events and the objects using it are updated. */
    new_name?: string;
    /** If true, the property is removed. The events using it must be fixed afterwards. */
    delete_this_property?: boolean;
    /** The type of the property (`Number` by default when adding one). `Choice` and `NumberWithChoices` need `choices`; `Behavior` and `Resource` need `extra_info`. `LeaderboardId` is only for a custom object; `Layer`, `ObjectAnimationName`, `KeyboardKey` and `Behavior` only for a custom behavior (`Layer` being the only one also allowed on a shared property). */
    type?: 'Number' | 'String' | 'Boolean' | 'Choice' | 'NumberWithChoices' | 'Color' | 'MultilineString' | 'Resource' | 'Behavior' | 'KeyboardKey' | 'Layer' | 'ObjectAnimationName' | 'LeaderboardId';
    /** The label of the property, shown to the user. */
    label?: string;
    /** A longer explanation of the property, shown to the user. */
    description?: string;
    /** The group the property is displayed in, to organize a long list of properties. */
    group?: string;
    /** The default value of the property, always as a string (`0`, `true`, a choice value, a color as `255;255;255`...). */
    default_value?: string;
    /** For a `Choice` or `NumberWithChoices` property: the possible values, replacing the existing ones. */
    choices?: Array<{
      /** The value stored in the property. */
      value: string;
      /** The text shown to the user (defaults to the value). */
      label?: string;
    }>;
    /** The required behavior type for a `Behavior` property (e.g. `MyExtension::MyBehavior`), or the resource kind for a `Resource` property (`image`, `audio`, `json`, `font`, `video`, `model3D`...). */
    extra_info?: string;
    /** If true, the property is not shown to the user (an internal state of the object or behavior). */
    hidden?: boolean;
    /** If true, the property is only shown in the advanced settings. */
    advanced?: boolean;
    /** If true, the property is marked as deprecated (kept for existing games, hidden from the editor). */
    deprecated?: boolean;
    /** The unit of a `Number` property, as named in GDevelop (e.g. `Pixel`, `Second`, `DegreeAngle`, `PixelSpeed`). */
    measurement_unit?: string;
    /** If true, an expression reading the property and an action changing it are generated, so the user can use the property from the events sheet. */
    generate_getter_and_setter?: boolean;
  }>;
}): Promise<ChangeCustomBehaviorResult>;

type CreateCustomFunctionResult = FunctionResult & {
  extensionName: string;
  /** The final name of the function. */
  functionName: string;
  /** How to call the function from an events script (e.g. `MyExtension::MyFunction(Object, Value)`). */
  callForms: Array<string>;
  /** `Action`, `Condition`, `Expression`, `StringExpression`, `ExpressionAndCondition` or `ActionWithOperator`. */
  functionType: string;
  [key: string]: any;
};
/**
 * Creates a function in an extension: a free function of the extension itself, or a function of one of its custom behaviors or custom objects (`scope` says which). Write its events afterwards with `generate_events` on the same scope.
 * Lifecycle functions are called automatically by the engine, take NO parameter and are actions. Their names are fixed, per owner: on an extension `onFirstSceneLoaded`, `onSceneLoaded`, `onScenePreEvents`, `onScenePostEvents`, `onScenePaused`, `onSceneResumed`, `onSceneUnloading`; on a custom behavior `onCreated`, `onActivate`, `onDeActivate`, `doStepPreEvents`, `doStepPostEvents`, `onDestroy`; on a custom object `onCreated`, `doStepPostEvents`, `onDestroy`, `onHotReloading`.
 * The `Object` parameter of a custom object function, and the `Object` and `Behavior` parameters of a custom behavior function, are implicit: they are added automatically and must never be declared in `parameters`.
 * `sentence` is the text read by the user in the events sheet, where `_PARAM1_`, `_PARAM2_`... are replaced by the parameters: the first parameter you declare is `_PARAM2_` on a custom behavior, and `_PARAM1_` on a custom object or on a free function. On a custom object or custom behavior function, `_PARAM0_` is the object the function runs on: put it in the sentence like every GDevelop object action does (`Apply _PARAM2_ damage to _PARAM0_`); `_PARAM1_` of a behavior function is its implicit `Behavior` and is never written. A sentence is generated from the name and the parameters when it is not given.
 * Returns `callForms`: how to call the new function from an events script.
 */
declare function create_custom_function(args: {
  /** Where the function is created: the extension itself (a free function), one of its custom behaviors or one of its custom objects. Set `type` and the name field(s) of that type. */
  scope: {
    /** `extension`: an extension of the project (`extension_name`): its free functions and extension variables. `custom_behavior`: a custom behavior of an extension (`extension_name` + `custom_behavior_name`). `custom_object`: a custom object of an extension (`extension_name` + `custom_object_name`): its declaration and functions. */
    type: 'extension' | 'custom_behavior' | 'custom_object';
    /** The name of the extension (extension, custom_behavior, custom_object and custom_object_variant types). */
    extension_name?: string;
    /** The name of the custom behavior in the extension (type `custom_behavior`). */
    custom_behavior_name?: string;
    /** The name of the custom object in the extension (custom_object and custom_object_variant types). */
    custom_object_name?: string;
  };
  /** The name of the function to create. Only letters, digits and underscores, not starting with a digit (e.g. `OpenDialog`). Use one of the lifecycle names listed above to hook into the engine lifecycle. */
  function_name: string;
  /** Optional. The name of an existing function of the same scope to duplicate (its parameters and events are copied). `function_type` is then not needed. */
  duplicated_function_name?: string;
  /** What the function is (required, unless `duplicated_function_name` is set): `Action` does something, `Condition` checks something, `Expression` returns a value (`expression_type` says which), `ExpressionAndCondition` returns a value and gives the condition comparing it, `ActionWithOperator` is the action changing the value returned by an `ExpressionAndCondition` (named by `getter_name`). `StringExpression` is the legacy way of writing an `Expression` returning a text. */
  function_type?: 'Action' | 'Condition' | 'Expression' | 'StringExpression' | 'ExpressionAndCondition' | 'ActionWithOperator';
  /** Optional. What an `Expression` or an `ExpressionAndCondition` returns: `number` (the default) or `string` for a text. Only for these two types (a `StringExpression` already returns a text, and the others return nothing). Change it later with the `expressionType` setting of `change_custom_function`. The project reports a number as `expressionType: "expression"` (the name GDevelop gives to that value type): `expression` is accepted here too. */
  expression_type?: 'number' | 'string';
  /** Optional. The name shown to the user in the events editor (e.g. `Open the dialog`). */
  full_name?: string;
  /** Optional. What the function does, shown to the user in the events editor. */
  description?: string;
  /** Optional. The sentence shown in the events sheet, with the `_PARAMn_` placeholders described above (e.g. `Open _PARAM1_ with message _PARAM2_`). Generated when not set. */
  sentence?: string;
  /** Optional. The group the function is displayed in, to organize the actions and conditions of the extension. */
  group?: string;
  /** Only for an `ActionWithOperator`: the name of the `ExpressionAndCondition` function of the same scope whose value this action changes. */
  getter_name?: string;
  /** Optional. True to hide the function from the events editor: it can then only be called from the other functions of the same extension. */
  is_private?: boolean;
  /** Optional. True for a function that finishes later: its callers wait for it before running the next actions. Its events must run `BuiltinAsync::ResolveAsyncEventsFunction()` once its work is done. */
  is_async?: boolean;
  /** The parameters of the function, in the order the user fills them. Never declare the implicit `Object` and `Behavior` parameters, declare none on a lifecycle function, and none on an `ActionWithOperator` (it takes the parameters of its `getter_name` function, plus the generated `Value`). */
  parameters?: Array<{
    /** The name of the parameter. It is used as-is in the events of the function (like a variable). Only letters, digits and underscores, not starting with a digit. */
    name: string;
    /** The type of the parameter: `objectList` for objects, `behavior` for a behavior of the object parameter written just before it, `expression` for a number, `string` for a text, `yesorno` for a boolean, `variable` for a variable, `identifier`, a resource type... */
    type: 'objectList' | 'objectListOrEmptyIfJustDeclared' | 'behavior' | 'expression' | 'string' | 'stringWithSelector' | 'numberWithChoices' | 'keyboardKey' | 'mouseButton' | 'key' | 'mouse' | 'color' | 'layer' | 'sceneName' | 'yesorno' | 'trueorfalse' | 'objectPointName' | 'objectAnimationName' | 'layerEffectName' | 'layerEffectParameterName' | 'objectEffectName' | 'objectEffectParameterName' | 'leaderboardId' | 'identifier' | 'variable' | 'scenevar' | 'imageResource' | 'audioResource' | 'fontResource' | 'jsonResource' | 'videoResource' | 'tilemapResource' | 'tilesetResource' | 'bitmapFontResource' | 'model3DResource' | 'atlasResource' | 'spineResource';
    /** The text shown to the user for this parameter in the events editor. */
    label?: string;
    /** A longer explanation of the parameter, shown to the user. */
    long_description?: string;
    /** The object type for an `objectList` parameter (e.g. `Sprite`, empty for any object), the behavior type for a `behavior` parameter (e.g. `MyExtension::MyBehavior`), `scene` or `object` for an `identifier`, a JSON array of choices for `stringWithSelector` and `numberWithChoices`. */
    extra_info?: string;
    /** If true, the user can leave the parameter empty (`default_value` is then used). */
    optional?: boolean;
    /** The value used when an optional parameter is left empty, always as a string. */
    default_value?: string;
  }>;
}): Promise<CreateCustomFunctionResult>;

type ChangeCustomFunctionResult = FunctionResult & {
  extensionName: string;
  /** The name of the function after the change. */
  functionName: string;
  /** How to call the function from an events script after the change. */
  callForms: Array<string>;
  /** True when the call had nothing to change. */
  nothingChanged?: boolean;
  [key: string]: any;
};
/**
 * Changes a function of an extension, of a custom behavior or of a custom object (`scope` says which): its settings, its parameters (add, rename, retype, reorder, delete), or renames or deletes it. Its events are written with `generate_events`.
 * Renaming the function or one of its parameters updates every use of it in the events of the project.
 * The implicit `Object` and `Behavior` parameters can never be renamed, retyped or deleted, and a lifecycle function can never be renamed.
 * Returns `callForms`: how to call the function from an events script after the change.
 */
declare function change_custom_function(args: {
  /** Where the function lives: the extension itself (a free function), one of its custom behaviors or one of its custom objects. Set `type` and the name field(s) of that type. */
  scope: {
    /** `extension`: an extension of the project (`extension_name`): its free functions and extension variables. `custom_behavior`: a custom behavior of an extension (`extension_name` + `custom_behavior_name`). `custom_object`: a custom object of an extension (`extension_name` + `custom_object_name`): its declaration and functions. */
    type: 'extension' | 'custom_behavior' | 'custom_object';
    /** The name of the extension (extension, custom_behavior, custom_object and custom_object_variant types). */
    extension_name?: string;
    /** The name of the custom behavior in the extension (type `custom_behavior`). */
    custom_behavior_name?: string;
    /** The name of the custom object in the extension (custom_object and custom_object_variant types). */
    custom_object_name?: string;
  };
  /** The name of the function to change. */
  function_name: string;
  /** If renaming the function, its new name (only letters, digits and underscores, not starting with a digit). Every use of it in the events is updated. */
  new_name?: string;
  /** Optional boolean. If true, the function is deleted: the events using it become invalid until they are fixed. Destructive: only set this when the user has explicitly and unambiguously asked to delete it. */
  delete_this_function?: boolean;
  /** A list of settings of the function to change. `isPrivate`, `isAsync` and `isDeprecated` take "true" or "false" (the events of an `isAsync` function must run `BuiltinAsync::ResolveAsyncEventsFunction()` once its work is done); `functionType` takes one of `Action`, `Condition`, `Expression`, `StringExpression`, `ExpressionAndCondition`, `ActionWithOperator`; `expressionType` takes `number` (also spelled `expression`, as the project reports it) or `string` and is only for a function returning a value (an `Expression`, a `StringExpression` or an `ExpressionAndCondition`) - a function that stops returning a value (`Action`, `Condition`, `ActionWithOperator`) loses its return type and returns a number again if it becomes an expression later, pass `expressionType` in the same call to choose; `sentence` uses the `_PARAMn_` placeholders; `getterName` is the `ExpressionAndCondition` of an `ActionWithOperator`. */
  changed_settings?: Array<{
    setting_name: 'fullName' | 'description' | 'sentence' | 'group' | 'getterName' | 'isPrivate' | 'isAsync' | 'functionType' | 'expressionType' | 'helpUrl' | 'isDeprecated' | 'deprecationMessage';
    new_value: string;
  }>;
  /** A list of parameters of the function to add, change, reorder or delete. Not for an `ActionWithOperator`: it takes the parameters of its getter (change them on the getter, they reach its actions with operator, calls included). */
  changed_parameters?: Array<{
    /** The name of the parameter to change, or of the parameter to add if the function has none with this name. */
    parameter_name: string;
    /** If renaming the parameter, its new name. The events using it are updated. */
    new_name?: string;
    /** If true, the parameter is removed. The events and the calls using it must be fixed afterwards. */
    delete_this_parameter?: boolean;
    /** The type of the parameter (required when adding one). A `behavior` parameter always applies to the object parameter declared before it. */
    type?: 'objectList' | 'objectListOrEmptyIfJustDeclared' | 'behavior' | 'expression' | 'string' | 'stringWithSelector' | 'numberWithChoices' | 'keyboardKey' | 'mouseButton' | 'key' | 'mouse' | 'color' | 'layer' | 'sceneName' | 'yesorno' | 'trueorfalse' | 'objectPointName' | 'objectAnimationName' | 'layerEffectName' | 'layerEffectParameterName' | 'objectEffectName' | 'objectEffectParameterName' | 'leaderboardId' | 'identifier' | 'variable' | 'scenevar' | 'imageResource' | 'audioResource' | 'fontResource' | 'jsonResource' | 'videoResource' | 'tilemapResource' | 'tilesetResource' | 'bitmapFontResource' | 'model3DResource' | 'atlasResource' | 'spineResource';
    /** The text shown to the user for this parameter in the events editor. */
    label?: string;
    /** A longer explanation of the parameter, shown to the user. */
    long_description?: string;
    /** The object type for an `objectList` parameter, the behavior type for a `behavior` parameter, `scene` or `object` for an `identifier`, a JSON array of choices for `stringWithSelector` and `numberWithChoices`. */
    extra_info?: string;
    /** If true, the user can leave the parameter empty (`default_value` is then used). */
    optional?: boolean;
    /** The value used when an optional parameter is left empty, always as a string. */
    default_value?: string;
    /** The new position of the parameter among the parameters of the function, 0 being the first one. The implicit `Object` and `Behavior` parameters are not counted. */
    new_index?: number;
  }>;
}): Promise<ChangeCustomFunctionResult>;

/**
 * Run one gameplay test in a real game preview (the editor exports the project, boots the preview and executes the test against the gameplay test harness). Returns the result object: status (`passed`/`failed`/`error`/`stopped`/`timeout`), framesExecuted, durationMs, assertions, errors, consoleLogs, eventLog, finalState and optional screenshots. When `source` is provided, the test is created/updated (persisted into the project or extension when `persist` is true, the default) and then run. Without `source`, the existing test with `test_name` is run as stored.
 */
declare function run_gameplay_test(args: {
  /** The tests container the test belongs to: the project itself, or one of its events-based extensions. */
  scope: {
    type: 'project' | 'extension';
    /** The name of the events-based extension (required when `type` is 'extension'). */
    extension_name?: string;
  };
  /** The name of the test to run (unique in its scope). */
  test_name: string;
  /** The JavaScript body executed as `async (harness) => { ... }` — the BODY only, never the wrapper function itself. OMIT this to run the stored test code as-is (the normal way to run an existing test). When provided, the test is created/updated with this source — OVERWRITING the stored code when `persist` is true — then run: only do this to author a new test or to fix a test whose previous run could not execute. */
  source?: string;
  /** Short description of what the test verifies (stored with the test when it is created/updated). */
  description?: string;
  /** Whether the created/updated test is saved into the project/extension (default true). */
  persist?: boolean;
  /** Wall-clock timeout for the run, in milliseconds (default 30000, maximum 120000). */
  timeout_ms?: number;
}): Promise<FunctionResult>;

/**
 * Adds new events (conditions and actions), or rework one or more events of the event sheet of a scene, of external events or of a function of an extension, based on "EventScript". This will translate "EventScript" into functional event(s), either new events or replacing existing ones. Get the event ID or group names from the explorer agent first to know where to place the events. If the "EventScript" does not compile, its errors are returned to you and NOTHING is applied: fix the script and call again (a one-line fix, usually). If the corrected script still does not compile, a slower sub-agent takes over and fixes it, then reports what it applied along with the errors of your script. This sub-agent does have not have full context of the game, so you must be precise: include object names, list the extensions that will be used in `extension_names_list`, include precise variable names. Do not invent name of conditions or actions or parameters. For sounds/musics to play, you can first ask the explorer agent to search the resource store for existing audio files, then reference the exact name of the chosen file. To change a part of an existing event (some lines of a `js` event, an action of a long event), use `edits` rather than resending the whole event.
 */
declare function generate_events(args: {
  /** Where the events are added or edited: a scene, external events (written with the objects and variables of their associated scene, or else of a scene linking to them), or the extension, custom behavior or custom object owning the function named by `function_name`. Set `type` and the name field(s) of that type. */
  scope: {
    /** `scene`: a scene (`scene_name`). `external_events`: external events (`external_events_name`): events not tied to a scene, included in scenes by `link` events. Usually not recommended. `extension`: an extension of the project (`extension_name`): its free functions and extension variables. `custom_behavior`: a custom behavior of an extension (`extension_name` + `custom_behavior_name`). `custom_object`: a custom object of an extension (`extension_name` + `custom_object_name`): its declaration and functions. */
    type: 'scene' | 'external_events' | 'extension' | 'custom_behavior' | 'custom_object';
    /** The name of the scene (type `scene`). */
    scene_name?: string;
    /** The name of the external events (type `external_events`). */
    external_events_name?: string;
    /** The name of the extension (extension, custom_behavior, custom_object and custom_object_variant types). */
    extension_name?: string;
    /** The name of the custom behavior in the extension (type `custom_behavior`). */
    custom_behavior_name?: string;
    /** The name of the custom object in the extension (custom_object and custom_object_variant types). */
    custom_object_name?: string;
  };
  /** The name of the function whose events should be added or edited. Required with a `scope` of type `extension` (a free function), `custom_behavior` or `custom_object`. Unused with a `scene` or `external_events` scope. */
  function_name?: string;
  /** One entry per logical group of events to emit. Each entry has its own placement. Use multiple entries when a single request needs events placed in different locations (e.g., replacing one event AND adding new ones elsewhere). No more than 6 entries. */
  event_batches: Array<{
    /** The events written in the "events script" syntax (see the documentation in your instructions). When valid, the events are created instantly, without any agent working on them - so prefer it whenever you know the exact conditions/actions to use. If it does not compile, the errors are returned to you (nothing applied): fix and call again. Only a second failing attempt is handed to the (slower) agent. */
    event_script?: string;
    /** A pseudo-code of the desired events logic, for the rare case where "events script" would not work. This is read by the agent and can also be used to indicate event(s) to remove or rework. Not needed if `event_script` is given. Avoid using it. */
    events_description?: string;
    /** Structural tree operation. Sub-events relations nest under the target — new events inherit its conditions and object picking. Sibling relations place next to the target with the same parent — new events inherit only the parent's conditions, NOT the target's. To rework an existing event, prefer `replace_event_but_keep_existing_sub_events`: it replaces the event (conditions, actions, local variables) and re-attaches its existing sub-events, unmodified, to the first new event — so do NOT include the sub-events in your script (they would be duplicated). Use `replace_entire_event_and_sub_events` only to rework an event AND all its sub-events: everything not in your script is deleted, so your script must contain the full subtree you want to keep (read it first with `read_events_source`). Use `append_to_end` to add the events at the end of the events of the scope (the scene, the external events or the function). */
    placement_relation: 'insert_after_sibling' | 'insert_before_sibling' | 'replace_event_but_keep_existing_sub_events' | 'replace_entire_event_and_sub_events' | 'append_subevents_to' | 'append_to_end' | 'delete';
    /** REQUIRED with the replace relations and an `event_script` (not with `edits`): the CURRENT source of what you are replacing, as returned by `read_events_source`. With `replace_event_but_keep_existing_sub_events`: the event itself, WITHOUT its sub-events. With `replace_entire_event_and_sub_events`: the event WITH all its sub-events. Whitespace, line breaks, casing, `#` comments and `pass` lines are ignored. Proves what you replace was read and has not changed: the call is REJECTED (nothing applied) on mismatch, with the current source in the answer. */
    expected_event_source?: string;
    /** Reference event ID or group name. Required for all relations except append_to_end. Meaning depends on relation: parent for append_subevents_to; sibling anchor for insert_*_sibling; event being replaced for the replace relations or delete. If unsure, call `read_events_source` to get the event ID. */
    placement_target_event_id?: string;
    /** Safety check: The ID of the event (or group name) that must end up as the direct parent of the inserted events after placement. Use empty string for top-level scene events. If unsure, don't specify this field. */
    placement_expected_parent_event_id?: string;
    /** One sentence explaining why this placement is correct with respect to inherited parent conditions and object picking. Example: "Sibling of event-2.5 (not 2.5.1) because these events check State='XXX' and must not inherit event-2.5's State='YYY' condition." */
    placement_rationale: string;
    /** Instead of `event_script`, with a replace relation: exact text replacements in the CURRENT source of the event, as `read_events_source` returns it - the code of a `js` event (also given as numbered lines in `jsCodeExcerpt`: never copy the numbers), the "events script" of any other event (without its sub-events with `replace_event_but_keep_existing_sub_events`, with them with `replace_entire_event_and_sub_events`). Applied in order; if one fails, nothing is changed. The code of a `js` event is changed directly, whatever its size: give the `edits` of `js` events in a call of their own. The answer says how many occurrences each edit replaced, at which lines, and gives the numbered lines around the changes (`editedEventSnippets`). */
    edits?: Array<{
      /** The exact text to replace. It must be found once: include lines around it to make it unique (or set `replace_all`). */
      old_string: string;
      /** The text replacing `old_string`. */
      new_string: string;
      /** Replace every occurrence of `old_string` (default false). */
      replace_all?: boolean;
    }>;
  }>;
  /** A comma-separated list of the exact type of extensions (including built-in ones), behaviors, and/or objects that will be used in the event (e.g: `Sprite, PhysicsCharacter3D, PhysicsCharacter3D::PhysicsCharacter3D, ParticleSystem::ParticleEmitter, BuiltinMouse` - can be arbitrarily long to list everything needed). */
  extension_names_list: string;
  /** A comma-separated list of the exact name of objects (scene, global objects...) or groups that will be used in the events (probably those mentioned in the events description, but there can be more if you think they are useful). Example: `Player, Obstacle, Enemy1, RedCoin, GreenCoin, Super_Enemy`. These objects (or groups) must all already be part of the game (if not, please use the "edit" agent first to build these objects, add behaviors, etc...). */
  objects_list: string;
  /** Estimated complexity of the requested events generation, from 0 to 100. Example: editing a parameter value in an event with 3 actions: 6, 1 new condition and 1 new action or less: 12, 2 events max with 6 actions/conditions: 22, more events or loops: 40, large algorithm or many concerns in the request: 82, very large algorithm or many tasks, would need splitting work: 93. Will be used for estimating the work effort. */
  estimated_complexity: number;
}): Promise<FunctionResult>;
