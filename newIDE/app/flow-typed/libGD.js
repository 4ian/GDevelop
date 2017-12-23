// @flow

//TODO: These types could be generated from GDevelop.js instead of being
//manually written here.
type EmscriptenObject = {
    ptr: Number
};

declare type gdProject = EmscriptenObject;
declare type gdLayout = EmscriptenObject;
declare type gdExternalLayout = EmscriptenObject;
declare type gdExternalEvents = EmscriptenObject;
declare type gdSerializerElement = EmscriptenObject;
declare type gdInitialInstance = EmscriptenObject;

//Represents all objects that have serializeTo and unserializeFrom methods.
declare type gdSerializable = EmscriptenObject;
