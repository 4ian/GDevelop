// @flow

//TODO: These types could be generated from GDevelop.js instead of being
//manually written here.
type EmscriptenObject = Object & {
    ptr: Number
};

declare type gdPlatform = EmscriptenObject;
declare type gdPlatformExtension = EmscriptenObject;

declare type gdObjectsContainer = EmscriptenObject;
declare type gdProject = gdObjectsContainer & EmscriptenObject;
declare type gdLayout = gdObjectsContainer & EmscriptenObject;
declare type gdExternalLayout = EmscriptenObject;
declare type gdExternalEvents = EmscriptenObject;
declare type gdSerializerElement = EmscriptenObject;
declare type gdInitialInstance = EmscriptenObject;
declare type gdInitialInstancesContainer = EmscriptenObject;
declare type gdBaseEvent = EmscriptenObject;
declare type gdResource = EmscriptenObject;
declare type gdObject = EmscriptenObject;
declare type gdObjectGroup = EmscriptenObject;
declare type gdResourcesManager = EmscriptenObject;
declare type gdEventsList = EmscriptenObject;
declare type gdEventsFunction = EmscriptenObject;

declare type gdInstruction = EmscriptenObject;
declare type gdInstructionMetadata = EmscriptenObject;
declare type gdInstructionsList = EmscriptenObject;
declare type gdParameterMetadata = EmscriptenObject;
declare type gdExpression = EmscriptenObject;
declare type gdExpressionMetadata = EmscriptenObject;
declare type gdObjectMetadata = EmscriptenObject;
declare type gdBehaviorMetadata = EmscriptenObject;

declare type gdVariable = EmscriptenObject;
declare type gdVariablesContainer = EmscriptenObject;

declare type gdVectorPolygon2d = EmscriptenObject;

declare type gdVector2f = EmscriptenObject;

declare type gdSpriteObject = EmscriptenObject;
declare type gdSprite = EmscriptenObject;
declare type gdDirection = EmscriptenObject;
declare type gdAnimation = EmscriptenObject;
declare type gdPoint = EmscriptenObject;

declare type gdEventsFunctionsExtension = EmscriptenObject;
declare type gdVectorEventsFunction = EmscriptenObject;

declare type gdVectorEventsSearchResult = EmscriptenObject;
declare type gdMapStringPropertyDescriptor = EmscriptenObject;

//Represents all objects that have serializeTo and unserializeFrom methods.
declare type gdSerializable = EmscriptenObject;
