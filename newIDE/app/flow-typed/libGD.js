// @flow

declare type libGDevelop = Object;

//TODO: These types could be generated from GDevelop.js instead of being
//manually written here.
declare type gdEmscriptenObject = Object & {
    ptr: Number
};

declare type gdPlatform = gdEmscriptenObject;
declare type gdPlatformExtension = gdEmscriptenObject;

declare type gdBehavior = gdEmscriptenObject;
declare type gdBehaviorContent = gdEmscriptenObject;
declare type gdObject = gdEmscriptenObject;
declare type gdObjectsContainer = gdEmscriptenObject;
declare type gdObjectGroup = gdEmscriptenObject;
declare type gdObjectGroupsContainer = gdEmscriptenObject;
declare type gdProject = gdObjectsContainer & gdEmscriptenObject;
declare type gdEffect = gdEmscriptenObject;
declare type gdEffectsContainer = gdEmscriptenObject;
declare type gdLayout = gdObjectsContainer & gdEmscriptenObject;
declare type gdLayer = gdEffectsContainer & gdEmscriptenObject;
declare type gdExternalLayout = gdEmscriptenObject;
declare type gdExternalEvents = gdEmscriptenObject;
declare type gdSerializerElement = gdEmscriptenObject;
declare type gdInitialInstance = gdEmscriptenObject;
declare type gdInitialInstancesContainer = gdEmscriptenObject;
declare type gdBaseEvent = gdEmscriptenObject;
declare type gdResource = gdEmscriptenObject;
declare type gdResourcesManager = gdEmscriptenObject;
declare type gdEventsList = gdEmscriptenObject;
declare type gdEventsFunction = gdEmscriptenObject;

declare type gdInstruction = gdEmscriptenObject;
declare type gdInstructionMetadata = gdEmscriptenObject;
declare type gdMapStringInstructionMetadata = gdEmscriptenObject;
declare type gdInstructionsList = gdEmscriptenObject;
declare type gdParameterMetadata = gdEmscriptenObject;
declare type gdExpression = gdEmscriptenObject;
declare type gdExpressionMetadata = gdEmscriptenObject;
declare type gdMapStringExpressionMetadata = gdEmscriptenObject;
declare type gdObjectMetadata = gdEmscriptenObject;
declare type gdBehaviorMetadata = gdEmscriptenObject;
declare type gdEffectMetadata = gdEmscriptenObject;

declare type gdVariable = gdEmscriptenObject;
declare type gdVariablesContainer = gdEmscriptenObject;

declare type gdVectorPolygon2d = gdEmscriptenObject;

declare type gdVector2f = gdEmscriptenObject;

declare type gdSpriteObject = gdEmscriptenObject;
declare type gdSprite = gdEmscriptenObject;
declare type gdDirection = gdEmscriptenObject;
declare type gdAnimation = gdEmscriptenObject;
declare type gdPoint = gdEmscriptenObject;

declare type gdEventsBasedBehaviorsList = gdEmscriptenObject;
declare type gdEventsBasedBehavior = gdEmscriptenObject;
declare type gdEventsFunctionsContainer = gdEmscriptenObject;
declare type gdEventsFunctionsExtension = gdEventsFunctionsContainer & gdEmscriptenObject;

declare type gdVectorEventsSearchResult = gdEmscriptenObject;
declare type gdMapStringPropertyDescriptor = gdEmscriptenObject;
declare type gdPropertyDescriptor = gdEmscriptenObject;
declare type gdNamedPropertyDescriptor = gdEmscriptenObject;
declare type gdNamedPropertyDescriptorsList = gdEmscriptenObject;

declare type gdExpressionNode = gdEmscriptenObject;
declare type gdUniquePtrExpressionNode = gdEmscriptenObject;

declare type gdExpressionCompletionDescription = gdEmscriptenObject;
declare type gdVectorExpressionCompletionDescription = gdEmscriptenObject;

declare type gdjsExporter = gdEmscriptenObject;

declare type gdEventsContext = gdEmscriptenObject;

//Represents all objects that have serializeTo and unserializeFrom methods.
declare type gdSerializable = gdEmscriptenObject;
