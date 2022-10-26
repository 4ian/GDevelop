// Automatically generated by GDevelop.js/scripts/generate-types.js
declare class gdEventsBasedBehavior {
  constructor(): void;
  setDescription(description: string): gdEventsBasedBehavior;
  getDescription(): string;
  setName(name: string): gdEventsBasedBehavior;
  getName(): string;
  setFullName(fullName: string): gdEventsBasedBehavior;
  getFullName(): string;
  setObjectType(fullName: string): gdEventsBasedBehavior;
  getObjectType(): string;
  getEventsFunctions(): gdEventsFunctionsContainer;
  getPropertyDescriptors(): gdNamedPropertyDescriptorsList;
  getSharedPropertyDescriptors(): gdNamedPropertyDescriptorsList;
  serializeTo(element: gdSerializerElement): void;
  unserializeFrom(project: gdProject, element: gdSerializerElement): void;
  static getPropertyActionName(propertyName: string): string;
  static getPropertyConditionName(propertyName: string): string;
  static getPropertyExpressionName(propertyName: string): string;
  delete(): void;
  ptr: number;
};