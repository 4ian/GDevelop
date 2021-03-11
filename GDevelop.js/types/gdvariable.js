// Automatically generated by GDevelop.js/scripts/generate-types.js
declare class gdVariable {
  static String: 0;
  static Number: 1;
  static Boolean: 2;
  static Structure: 3;
  static Array: 4;
  constructor(): void;
  static isPrimitive(type: Variable_Type): boolean;
  getType(): Variable_Type;
  castTo(type: string): void;
  setString(str: string): void;
  getString(): string;
  setValue(val: number): void;
  getValue(): number;
  setBool(val: boolean): void;
  getBool(): boolean;
  getChildrenCount(): number;
  contains(variableToSearch: gdVariable, recursive: boolean): boolean;
  hasChild(str: string): boolean;
  getChild(str: string): gdVariable;
  removeChild(name: string): void;
  renameChild(oldName: string, newName: string): boolean;
  getAllChildrenNames(): gdVectorString;
  removeRecursively(variableToRemove: gdVariable): void;
  getAtIndex(index: number): gdVariable;
  pushNew(): gdVariable;
  removeAtIndex(index: number): void;
  getAllChildrenArray(): gdVectorVariable;
  serializeTo(element: gdSerializerElement): void;
  unserializeFrom(element: gdSerializerElement): void;
  delete(): void;
  ptr: number;
};