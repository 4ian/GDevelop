import optionalRequire from '../Utils/OptionalRequire.js';
const path = optionalRequire('path');
const electron = optionalRequire('electron');
const dialog = electron ? electron.remote.dialog : null;
const gd = global.gd;

export default [
  {
    name: 'Choose a new image',
    kind: 'image',
    chooseResource: (project): Promise<any> => {
      return new Promise((resolve, reject) => {
        if (!dialog) return reject('Not supported');

        const browserWindow = electron.remote.getCurrentWindow();
        dialog.showOpenDialog(
          browserWindow,
          {
            title: 'Choose an image',
            properties: ['openFile'],
            filters: [
              { name: 'Image files', extensions: ['png', 'jpg'] },
            ],
          },
          paths => {
            if (!paths || !paths.length) return resolve(null);

            const imageResource = new gd.ImageResource();
            const projectPath = path.dirname(project.getProjectFile());
            imageResource.setFile(path.relative(projectPath, paths[0]));
            imageResource.setName(path.basename(paths[0]));
            return resolve(imageResource);
          }
        );
      });
    },
  },
];
