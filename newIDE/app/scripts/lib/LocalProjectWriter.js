const fs = require('fs');

const serializeToJSObject = (gd, serializable, methodName = 'serializeTo') => {
  const serializedElement = new gd.SerializerElement();
  serializable[methodName](serializedElement);
  const object = JSON.parse(gd.Serializer.toJSON(serializedElement));
  serializedElement.delete();

  return object;
};

module.exports = {
  writeProjectJSONFile: (gd, project, filepath) => {
    return new Promise((resolve, reject) => {
      if (!fs) return reject('Not supported');
  
      try {
        const content = JSON.stringify(serializeToJSObject(gd, project), null, 2);
        fs.writeFile(filepath, content, err => {
          if (err) return reject(err);
  
          resolve();
        });
      } catch (e) {
        return reject(e);
      }
    });
  }
};
