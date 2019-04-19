const fs = require('fs');

module.exports = {
  readProjectFile: (filepath) => {
    return new Promise((resolve, reject) => {
      if (!fs) return reject('Not supported');

      fs.readFile(filepath, { encoding: 'utf8' }, (err, data) => {
        if (err) return reject(err);

        try {
          const dataObject = JSON.parse(data);
          return resolve(dataObject);
        } catch (ex) {
          return reject('Malformed file');
        }
      });
    });
  },
  loadSerializedProject: (gd, projectObject) => {
    const serializedProject = gd.Serializer.fromJSObject(projectObject);
    const newProject = gd.ProjectHelper.createNewGDJSProject();
    newProject.unserializeFrom(serializedProject);
  
    return newProject;
  },
};
