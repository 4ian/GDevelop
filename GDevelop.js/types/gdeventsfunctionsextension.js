// Automatically generated by GDevelop.js/scripts/generate-types.js
declare class gdEventsFunctionsExtension extends gdEventsFunctionsContainer {
  constructor(): void;
  setNamespace(namespace_: string): gdEventsFunctionsExtension;
  getNamespace(): string;
  setVersion(version: string): gdEventsFunctionsExtension;
  getVersion(): string;
  setShortDescription(shortDescription: string): gdEventsFunctionsExtension;
  getShortDescription(): string;
  setDescription(description: string): gdEventsFunctionsExtension;
  getDescription(): string;
  setName(name: string): gdEventsFunctionsExtension;
  getName(): string;
  setFullName(fullName: string): gdEventsFunctionsExtension;
  getFullName(): string;
  setCategory(category: string): gdEventsFunctionsExtension;
  getCategory(): string;
  getTags(): gdVectorString;
  getAuthorIds(): gdVectorString;
  setAuthor(author: string): gdEventsFunctionsExtension;
  getAuthor(): string;
  setPreviewIconUrl(previewIconUrl: string): gdEventsFunctionsExtension;
  getPreviewIconUrl(): string;
  setIconUrl(iconUrl: string): gdEventsFunctionsExtension;
  getIconUrl(): string;
  setHelpPath(helpPath: string): gdEventsFunctionsExtension;
  getHelpPath(): string;
  setOrigin(originName: string, originIdentifier: string): void;
  getOriginName(): string;
  getOriginIdentifier(): string;
  addDependency(): gdDependencyMetadata;
  removeDependencyAt(index: number): void;
  getAllDependencies(): gdVectorDependencyMetadata;
  addSourceFile(): gdSourceFileMetadata;
  removeSourceFileAt(index: number): void;
  getAllSourceFiles(): gdVectorSourceFileMetadata;
  getGlobalVariables(): gdVariablesContainer;
  getSceneVariables(): gdVariablesContainer;
  getEventsBasedBehaviors(): gdEventsBasedBehaviorsList;
  getEventsBasedObjects(): gdEventsBasedObjectsList;
  serializeTo(element: gdSerializerElement): void;
  unserializeFrom(project: gdProject, element: gdSerializerElement): void;
  static isExtensionLifecycleEventsFunction(eventsFunctionName: string): boolean;
  insertNewEventsFunction(name: string, pos: number): gdEventsFunction;
  insertEventsFunction(eventsFunction: gdEventsFunction, pos: number): gdEventsFunction;
  hasEventsFunctionNamed(name: string): boolean;
  getEventsFunction(name: string): gdEventsFunction;
  getEventsFunctionAt(pos: number): gdEventsFunction;
  removeEventsFunction(name: string): void;
  moveEventsFunction(oldIndex: number, newIndex: number): void;
  getEventsFunctionsCount(): number;
  getEventsFunctionPosition(eventsFunction: gdEventsFunction): number;
  delete(): void;
  ptr: number;
};