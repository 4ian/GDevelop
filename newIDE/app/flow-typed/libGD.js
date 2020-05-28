// @flow

declare type libGDevelop = Object;

//TODO: These types could be generated from GDevelop.js instead of being
//manually written here.

// Base Types -->
declare type gdEmscriptenObject = Object & {
    ptr: number;
    delete(): void;
};

declare class gdEmscriptenClass extends Object {
    ptr: number;
    delete(): void;
}

// Serializer -->
//Represents all objects that have serializeTo and unserializeFrom methods.
declare type gdSerializableObject = gdEmscriptenObject & {
    serializeTo(): gdSerializerElement;
    unserializeFrom(element: gdSerializerElement): void;
};

declare class gdSerializableClass extends gdEmscriptenClass {
    serializeTo(): gdSerializerElement;
    unserializeFrom(element: gdSerializerElement): void;
}

declare type gdSerializerElement = gdEmscriptenObject;
// <-- Serializer

declare class gdSetString {
    toNewVectorString(): gdVectorString;
};

// Vectors -->
declare class gdVector<VectorObject> extends gdEmscriptenClass {
    size(): number;
    at(index: number): VectorObject;
    get(index: number): VectorObject;
    toJSArray(): Array<VectorObject>;
}
declare class gdModifiableVector<VectorObject> extends gdVector<VectorObject> {
    push_back(value: VectorObject): void;
    resize(size: number): void;
    set(index: number, value: VectorObject): void;
    clear(): void;
}
declare type gdVectorString = gdModifiableVector<string>;
declare type gdVectorEventsSearchResult = gdModifiableVector<gdEventsSearchResult>;
declare type gdVectorPolygon2d = gdModifiableVector<gdPolygon2d>;
declare type gdVectorPlatformExtension = gdVector<gdPlatformExtension>;
declare type gdVectorExpressionCompletionDescription = gdVector<gdExpressionCompletionDescription>;

declare class gdVector2f extends gdEmscriptenClass {
    x: number;
    y: number;
    set_x(newValue: number): void;
    set_y(newValue: number): void;
};
// <-- Vectors

// Maps -->
declare class gdMap<Key, Value> extends gdEmscriptenClass {
    get(key: Key): Value;
    set(key: Key, value: Value): void;
    has(key: Key): boolean;
    keys(): gdVector<Key>;
};
declare type gdMapStringEventMetadata = gdMap<string, gdEventMetadata>;
declare type gdMapStringInstructionMetadata = gdMap<string, gdInstructionMetadata>;
declare type gdMapStringExpressionMetadata = gdMap<string, gdExpressionMetadata>;
declare type gdMapStringBoolean = gdMap<string, boolean>;
declare type gdMapStringPropertyDescriptor = gdMap<string, gdPropertyDescriptor>;
// <-- Maps
// <-- Base types

// Platforms -->
declare class gdPlatform extends gdEmscriptenClass {
    getName(): string;
    getFullName(): string;
    getSubtitle(): string;
    getDescription(): string;

    isExtensionLoaded(name: string): boolean;
    removeExtension(name: string): void;
    reloadBuiltinExtensions(): void;

    getAllPlatformExtensions(): gdVectorPlatformExtension;
};
declare class gdJsPlatform extends gdPlatform {
    static get(): gdJsPlatform;

    addNewExtension(platformExtension: gdPlatformExtension): void;

    getBehavior(type: string): gdBehavior;
    getBehaviorSharedDatas(type: string): gdBehaviorsSharedData;
}
// Extension -->
declare class gdPlatformExtension extends gdEmscriptenClass {
    static getNamespaceSeparator(): string;

    setExtensionInformation(name: string,
                            fullname: string,
                            description: string,
                            author: string,
                            license: string): gdPlatformExtension;
    setExtensionHelpPath(helpPath: string): gdPlatformExtension;
    markAsDeprecated(): void;

    addCondition(name: string,
                fullname: string,
                description: string,
                sentence: string,
                group: string,
                icon: string,
                smallicon: string): gdInstructionMetadata;

    addAction(name: string,
              fullname: string,
              description: string,
              sentence: string,
              group: string,
              icon: string,
              smallicon: string): gdInstructionMetadata;

    addExpression(name: string,
                  fullname: string,
                  description: string,
                  group: string,
                  smallicon): gdExpressionMetadata;

    addStrExpression(name: string,
                     fullname: string,
                     description: string,
                     group: string,
                     smallicon): gdExpressionMetadata;

    addBehavior(name: string,
                fullname: string,
                defaultName: string,
                description: string,
                group: string,
                icon24x24: string,
                className: string,
                instance: gdBehavior,
                sharedDatasInstance: gdBehaviorsSharedData): gdBehaviorMetadata;

    addObject(name: string,
        fullname: string,
        description: string,
        icon24x24: string,
        instance: gdObject): gdObjectMetadata;

    addEffect(name: string): gdEffectMetadata;

    getFullName(): string;
    getName(): string;
    getDescription(): string;
    getAuthor(): string;
    getLicense(): string;
    getHelpPath(): string;
    isBuiltin(): boolean;
    getNameSpace(): string;

    getExtensionObjectsTypes(): gdVectorString;
    getBehaviorsTypes(): gdVectorString;
    getExtensionEffectTypes(): gdVectorString;
    getObjectMetadata(type: string): gdObjectMetadata;
    getBehaviorMetadata(type: string): gdBehaviorMetadata;
    getEffectMetadata(type: string): gdEffectMetadata;
    getAllEvents(): gdMapStringEventMetadata;
    getAllActions(): gdMapStringInstructionMetadata;
    getAllConditions(): gdMapStringInstructionMetadata;
    getAllExpressions(): gdMapStringInstructionMetadata;
    getAllStrExpressions(): gdMapStringInstructionMetadata;
    getAllActionsForObject(objectType: string): gdMapStringInstructionMetadata;
    getAllConditionsForObject(objectType: string): gdMapStringInstructionMetadata;
    getAllExpressionsForObject(objectType: string): gdMapStringExpressionMetadata;
    getAllStrExpressionsForObject(objectType: string): gdMapStringExpressionMetadata;
    getAllActionsForBehavior(autoType: string): gdMapStringInstructionMetadata;
    getAllConditionsForBehavior(autoType: string): gdMapStringInstructionMetadata;
    getAllExpressionsForBehavior(autoType: string): gdMapStringExpressionMetadata;
    getAllStrExpressionsForBehavior(autoType: string): gdMapStringExpressionMetadata;
};
declare class gdInstruction extends gdEmscriptenClass {
    clone(): gdInstruction;

    setType(type: string): void;
    getType(): string;
    setInverted(inverted: boolean): void;
    isInverted(): boolean;
    setParameter(id: number, value: string): void;
    getParameter(id: number): string;
    setParametersCount(count: number): void;
    getParametersCount(): number;
    getSubInstructions(): gdInstructionsList;
};
declare class gdInstructionsList extends gdSerializableClass {
    insert(instrunction: ?gdInstruction, position: number): gdInstruction;
    insertInstructions(list: gdInstructionsList, begin: number, end: number, position: number): void;
    size(): number;
    set(index: number, instruction: ?gdInstruction): void;
    contains(instruction: gdInstruction): boolean;
    get(index: number): gdInstruction;
    remove(instruction: gdInstruction): void;
    removeAt(index: number): void;
    clear(): void;
};

// Metadata -->
declare type gdEventMetadata = gdEmscriptenObject;
declare class gdInstructionMetadata extends gdEmscriptenClass {
    getFullName(): string;
    getDescription(): string;
    getSentence(): string;
    getGroup(): string;
    getIconFilename(): string;
    getSmallIconFilename(): string;
    getHelpPath(): string;
    canHaveSubInstructions(): boolean;
    getParameter(index: number): gdParameterMetadata;
    getParametersCount():  number;
    getParameters(): gdVectorParameterMetadata;
    getUsageComplexity(): number;
    isHidden(): boolean;
    isPrivate(): boolean;

    setCanHaveSubInstructions(): gdInstructionMetadata;
    setHelpPath(helpPath: string): gdInstructionMetadata;
    setHidden(): gdInstructionMetadata;
    setPrivate(): gdInstructionMetadata;
    addParameter(type: string,
                 description: string,
                 optionalObjectType: string,
                 parameterIsOptional: boolean): gdInstructionMetadata;
    addCodeOnlyParameter(type: string, supplementaryInformation: string): gdInstructionMetadata;
    setDefaultValue(defaultValue: string): gdInstructionMetadata;
    setParameterLongDescription(longDescription: string): gdInstructionMetadata;

    useStandardOperatorParameters(type: string): gdInstructionMetadata;
    useStandardRelationalOperatorParameters(type: string): gdInstructionMetadata;

    markAsSimple(): gdInstructionMetadata;
    markAsAdvanced(): gdInstructionMetadata;
    markAsComplex(): gdInstructionMetadata;

    getCodeExtraInformation(): gdExtraInformation;
};
declare type gdParameterMetadata = gdEmscriptenObject;
declare class gdExpressionMetadata extends gdEmscriptenClass {
    constructor(extensionNamespace: string,
                name: string,
                fullname: string,
                description: string,
                group: string,
                smallicon: string): void;

    getFullName(): string;
    getDescription(): string;
    getGroup(): string;
    getSmallIconFilename(): string;
    isShown(): boolean;
    isPrivate(): boolean;
    getParameter(id: number): gdParameterMetadata;
    getParametersCount(): number;
    getParameters(): gdVectorParameterMetadata;

    setHidden(): gdExpressionMetadata;
    setPrivate(): gdExpressionMetadata;
    addParameter(type: string, 
                 description: string, 
                 optionalObjectType: string, 
                 parameterIsOptional: boolean
                ): gdExpressionMetadata;
    addCodeOnlyParameter(type: string, supplementaryInformation: string): gdExpressionMetadata;
    setDefaultValue(defaultValue: string): gdExpressionMetadata;
    setParameterLongDescription(longDescription: string): gdExpressionMetadata;

    getCodeExtraInformation(): gdExpressionCodeGenerationInformation;

    //FlowFixMe: Those are used in code (MetadataDeclarationHelpers.js) 
    //           but aren't actually exposed from ExpressionMetadata! 
    //           (see Bindings.idl) type gdExpressionMetadata probably missued.
    useStandardRelationalOperatorParameters(arg: string): gdExpressionMetadata;
    useStandardOperatorParameters(arg: string): gdExpressionMetadata;
};
declare type gdObjectMetadata = gdEmscriptenObject;
declare type gdBehaviorMetadata = gdEmscriptenObject;
declare type gdEffectMetadata = gdEmscriptenObject;
// <-- Metadata
// <-- Extension
// <-- Platforms

// Behavior -->
declare type gdBehavior = gdEmscriptenObject;
declare type gdBehaviorContent = gdEmscriptenObject;
declare type gdBehaviorsSharedData = {
    getProperties(behaviorSharedDataContent: gdSerializerElement, project: gdProject): gdMapStringPropertyDescriptor;
    updateProperty(behaviorSharedDataContent: gdSerializerElement, name: string, value: string, project: gdProject): boolean;
    initializeContent(behaviorSharedDataContent: gdSerializerElement): void;
};
// <-- Behavior

// Objects -->
declare class gdObject extends gdSerializableClass {
    constructor(name: string): void;

    setName(name: string): void;
    getName(): string;
    setType(type: string): void;
    getType(): string;
    setTags(tags: string): void;
    getTags(): string;

    getProperties(project: gdProject): gdMapStringPropertyDescriptor;
    updateProperty(name: string, value: string, project: gdProject): boolean;

    getInitialInstanceProperties(instance: gdInitialInstance, project: gdProject, scene: gdLayout): gdMapStringPropertyDescriptor;
    updateInitialInstanceProperty(instance: gdInitialInstance, name: string, value: string, project: gdProject, scene: gdLayout): boolean;

    exposeResources(worker: gdArbitraryResourceWorker): void;

    getVariables(): gdVariablesContainer;
    getAllBehaviorNames(): gdVectorString;
    hasBehaviorNamed(name: string): boolean;
    addNewBehavior(project: gdProject, type: string, name: string): gdBehaviorContent;
    getBehavior(name: string): gdBehavior;
    removeBehavior(name: string): void;
    renameBehavior(oldName: string, name: string): boolean;
};
declare type gdObjectsContainer = gdEmscriptenObject;
declare type gdObjectGroup = gdEmscriptenObject;
declare type gdObjectGroupsContainer = gdEmscriptenObject;
declare type gdInitialInstance = gdEmscriptenObject;
declare type gdInitialInstancesContainer = gdEmscriptenObject;
// <-- Objects

// Variables -->
declare class gdVariable extends gdSerializableClass {
    setString(str: string): void;
    getString(): string;
    setValue(val: number): void;
    getValue(): number;

    hasChild(str: string): boolean;
    getChild(str: string): gdVariable;
    removeChild(name: string): void;
    renameChild(oldName: string, newName: string): boolean;
    getAllChildrenNames(): gdVectorString;
    getChildrenCount(): number;
    isNumber(): boolean;
    isStructure(): boolean;
    contains(variableToSearch: gdVariable, recursive: boolean): boolean;
    removeRecursively(variableToRemove: gdVariable): void;
};
declare class gdVariablesContainer extends gdSerializableClass {
    has(name: string): boolean;
    get(name: string): gdVariable;
    getAt(index: number): gdVariable;
    getNameAt(index: number): string;
    insert(name: string, variable: gdVariable, index: number): gdVariable;
    insertNew(name: string, index: number): gdVariable;
    remove(name: string): void;
    rename(oldName: string, newName: string): boolean;
    swap(firstIndex: number, secondIndex: number): void;
    move(oldIndex: number, newIndex: number): void;
    getPosition(name: string): number;
    count(): number;
    clear(): void;
    removeRecursively(variableToRemove: gdVariable): void;
};
// <-- Variables

// Sprite -->
declare class gdSpriteObject extends gdObject {
    addAnimation(animation: gdAnimation): void;
    getAnimation(index: number): gdAnimation;
    getAnimationsCount(): number;
    removeAnimation(index: number): void;
    removeAllAnimations(): void;
    hasNoAnimations(): boolean;
    swapAnimations(first: number, second: number): void;
    moveAnimation(oldIndex: number, newIndex: number): void;
};
declare type gdSprite = gdEmscriptenObject;
declare type gdDirection = gdEmscriptenObject;
declare type gdAnimation = gdEmscriptenObject;
declare type gdPoint = gdEmscriptenObject;
// <-- Sprite

// Event Based Extension -->
declare type gdEventsBasedBehaviorsList = gdEmscriptenObject;
declare type gdEventsBasedBehavior = gdEmscriptenObject;
declare type gdEventsFunctionsContainer = gdEmscriptenObject;
declare type gdEventsFunctionsExtension = gdEventsFunctionsContainer;
// <-- Event Based Extension

// Property Dexcriptor -->
declare class gdPropertyDescriptor extends gdSerializableClass {
    constructor(value: string): void;

    setValue(value: string): gdPropertyDescriptor;
    getValue(): string;
    setType(type: string): gdPropertyDescriptor;
    getType(): string;
    setLabel(label: string): gdPropertyDescriptor;
    getLabel(): string;
    setDescription(label: string): gdPropertyDescriptor;
    getDescription(): string;
    addExtraInfo(type: string): gdPropertyDescriptor;
    getExtraInfo(): gdVectorString;
    setHidden(enable: boolean): gdPropertyDescriptor;
    isHidden(): boolean;
};
declare class gdNamedPropertyDescriptor extends gdPropertyDescriptor {
    setName(name: string): gdNamedPropertyDescriptor;
    getName(): string;

    toPropertyDescriptor(): gdPropertyDescriptor;
};
declare class gdNamedPropertyDescriptorsList {
    insertNew(name: string, position: number): gdNamedPropertyDescriptor;
    insert(item: gdPropertyDescriptor, position: number): gdNamedPropertyDescriptor;
    has(name: string): boolean;
    get(name: string): gdNamedPropertyDescriptor;
    getAt(position: number): gdNamedPropertyDescriptor;
    remove(name: string): void;
    move(oldIndex: number, newIndex: number): void;
    getCount(): number;
};
// <-- Property Dexcriptor

// Expression -->
declare type gdExpressionNode = gdEmscriptenObject;
declare type gdUniquePtrExpressionNode = gdEmscriptenObject;
declare type gdExpressionCompletionDescription = gdEmscriptenObject;
// <-- Expressions

// Exporter -->
declare class gdjsExporter extends gdEmscriptenClass {
    constructor(abstractFilesystem: object, gdjsRoot: string): void;
    setCodeOutputDirectory(path: string): void;
    exportLayoutForPixiPreview(project: gdProject, layout: gdLayout, exportDir: string): boolean;
    exportExternalLayoutForPixiPreview(project: gdProject, layout: gdLayout, externalLayout: gdExternalLayout, exportDir: string): boolean;
    exportWholePixiProject(project: gdProject, exportDir: string, exportOptions: gdMapStringBoolean): boolean;
    exportWholeCocos2dProject(project: gdProject, debugMode: boolean, exportDir: string): boolean;
    getLastError(): string;
};
declare class gdEventsContext extends gdEmscriptenClass {
    getReferencedObjectOrGroupNames(): gdSetString;
    getObjectNames(): gdSetString;
    getBehaviorNamesOfObjectOrGroup(objectOrGroupName: string): gdSetString;
};
// <-- Exporter

// Layout -->
declare type gdLayout = gdObjectsContainer;
declare type gdLayer = gdEffectsContainer;
declare type gdExternalLayout = gdEmscriptenObject;
// <-- Layout

// --> Resources
declare class gdResource extends gdSerializableClass {
    clone(): gdResource;
    setName(name: string): void;
    getName(): string;
    setKind(kind: string): void;
    getKind(): string;
    isUserAdded(): boolean;
    setUserAdded(yes: boolean): void;
    useFile(): boolean;
    setFile(file: string): void;
    getFile(): string;
    setMetadata(metadata: string): void;
    getMetadata(): string;

    getProperties(project: gdProject): gdMapStringPropertyDescriptor;
    updateProperty(name: string, value: string, project: gdProject): boolean;
};
declare class gdResourcesManager extends gdEmscriptenClass {
    getAllResourceNames(): gdVectorString;
    hasResource(name: string): boolean;
    getResource(name: string): gdResource;
    addResource(res: gdResource): boolean;
    removeResource(name: string): void;
    renameResource(oldName: string, name: string): void;
    getResourcePosition(name: string): number;
    moveResourceUpInList(oldName: string): boolean;
    moveResourceDownInList(oldName: string): boolean;
    mveResource(oldIndex: number, newIndex: number): void;
};
// <-- Resources

// Effects -->
declare type gdEffect = gdEmscriptenObject;
declare type gdEffectsContainer = gdEmscriptenObject;
// <-- Effects

// Events -->
declare class gdExternalEvents extends gdSerializableClass {
    setName(name: string): void;
    getName(): string;

    getAssociatedLayout(): string;
    setAssociatedLayout(name: string): void;

    getEvents(): gdEventsList;
};
declare class gdBaseEvent extends gdSerializableClass {
    clone(): gdBaseEvent;
    getType(): string;
    setType(type: string): void;
    isExecutable(): boolean;
    canHaveSubEvents(): boolean;
    hasSubEvents(): boolean;
    getSubEvents(): gdEventsList;
    isDisabled(): boolean;
    setDisabled(disable: boolean): void;
    isFolded(): boolean;
    setFolded(folded: boolean): void;
};
declare class gdEventsList extends gdSerializableClass {
    insertEvent(event: gdBaseEvent, position: number): gdBaseEvent;
    insertNewEvent(project: gdProject, type: string, position: number): gdBaseEvent;
    insertEvents(list: gdEventsList, begin: number, end: number, position: number): void;
    getEventAt(position: number): gdBaseEvent;
    removeEventAt(position: number): void;
    removeEvent(event: gdBaseEvent): void;
    getEventsCount(): number;
    contains(event: gdBaseEvent, recursive: boolean): boolean;
    moveEventToAnotherEventsList(eventToMove: gdBaseEvent, newEventsList: gdEventsList, newPosition: number): boolean;
    isEmpty(): boolean;
    clear(): void;
};
declare class gdEventsFunction extends gdSerializableClass {
    setDescription(description: string): gdEventsFunction;
    getDescription(): string;
    setName(name: string): gdEventsFunction;
    getName(): string;
    setFullName(fullName: string): gdEventsFunction;
    getFullName(): string;
    setSentence(sentence: string): gdEventsFunction;
    getSentence(): string;
    setFunctionType(type: string): gdEventsFunction;
    getFunctionType(): string;

    getEvents(): gdEventsList;
    getParameters(): gdVectorParameterMetadata;
    getObjectGroups(): gdObjectGroupsContainer;
};
declare class gdEventsSearchResult extends gdEmscriptenClass {
    isEventsListValid(): boolean;
    getEventsList(): gdEventsList;
    getPositionInList(): number;
    isEventValid(): boolean;
    getEvent(): gdBaseEvent;
};
// <-- Events

// Project -->
declare type gdProject = gdObjectsContainer;
// <-- Project
