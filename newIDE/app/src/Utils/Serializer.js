const gd = global.gd;

export function serializeToJSObject(serializable) {
  const serializedElement = new gd.SerializerElement();
  serializable.serializeTo(serializedElement);
  const object = JSON.parse(gd.Serializer.toJSON(serializedElement));
  serializedElement.delete();

  return object;
}

export function unserializeFromJSObject(serializable, object) {
  const serializedElement = gd.Serializer.fromJSObject(object);
  serializable.unserializeFrom(serializedElement);
  serializedElement.delete();
}
