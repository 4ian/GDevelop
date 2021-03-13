const fs = require('fs');

const serializeToJSON = (gd, serializable, methodName = 'serializeTo') => {
  const serializedElement = new gd.SerializerElement();
  serializable[methodName](serializedElement);
  const json = gd.Serializer.toJSON(serializedElement);
  serializedElement.delete();

  return json;
};

module.exports = {
  writeProjectJSONFile: (gd, project, filepath) => {
    return new Promise((resolve, reject) => {
      if (!fs) return reject('Not supported');

      try {
        const content = serializeToJSON(gd, project);
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
