const fs = require('fs');

module.exports = {
  readProjectFile: filepath => {
    return new Promise((resolve, reject) => {
      if (!fs) return reject('Not supported');

      fs.readFile(filepath, { encoding: 'utf8' }, (err, data) => {
        if (err) return reject(err);

        if (data.includes(`"__REFERENCE_TO_SPLIT_OBJECT": true,`)) {
          reject(
            new Error(
              'This file is splitted across multiple files, which is not supported (though feel free to contribute and add support for this). Save the file as a single file project instead.'
            )
          );
        }

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
