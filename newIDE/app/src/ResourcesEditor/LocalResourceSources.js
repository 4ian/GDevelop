import optionalRequire from '../Utils/OptionalRequire.js';
const path = optionalRequire('path');
const electron = optionalRequire('electron');
const dialog = electron ? electron.remote.dialog : null;
const gd = global.gd;

export default [
  {
    name: 'Choose a new image',
    kind: 'image',
    chooseResources: (project, multiSelections = true): Promise<any> => {
      return new Promise((resolve, reject) => {
        if (!dialog) return reject('Not supported');

        const properties = ['openFile'];
        if (multiSelections) properties.push('multiSelections');

        const browserWindow = electron.remote.getCurrentWindow();
        dialog.showOpenDialog(
          browserWindow,
          {
            title: 'Choose an image',
            properties,
            filters: [{ name: 'Image files', extensions: ['png', 'jpg'] }],
          },
          paths => {
            if (!paths) return resolve([]);

            const resources = paths.map(resourcePath => {
              const imageResource = new gd.ImageResource();
              const projectPath = path.dirname(project.getProjectFile());
              imageResource.setFile(path.relative(projectPath, resourcePath));
              imageResource.setName(path.basename(resourcePath));

              return imageResource;
            });
            return resolve(resources);
          }
        );
      });
    },
  },
];
