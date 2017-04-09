const gd = global.gd;

export function serializeToJSObject(serializable, methodName = 'serializeTo') {
  const serializedElement = new gd.SerializerElement();
  serializable[methodName](serializedElement);
  const object = JSON.parse(gd.Serializer.toJSON(serializedElement));
  serializedElement.delete();

  return object;
}

export function unserializeFromJSObject(
  serializable,
  object,
  methodName = 'unserializeFrom'
) {
  const serializedElement = gd.Serializer.fromJSObject(object);
  serializable[methodName](serializedElement);
  serializedElement.delete();
}
