import optionalRequire from '../Utils/OptionalRequire.js';
import slug from 'slug';
const electron = optionalRequire('electron');
const path = optionalRequire('path');

const loadedFontFamilies = {
};

export default class ResourceLoader {
    static _getSystemFullFilename(project, filename) {
      if (electron) { // Support local filesystem with Electron
        const file = project.getProjectFile();
        const projectPath = path.dirname(file);
        const resourceAbsolutePath = path.resolve(projectPath, filename);
        console.log("Loading", resourceAbsolutePath);
        return 'file://' + resourceAbsolutePath;
      }

      return filename;
    }

    static get(project, resourceName) {
      if (project.getResourcesManager().hasResource(resourceName)) {
        const resourceRelativePath =
          project.getResourcesManager().getResource(resourceName).getFile();
        return ResourceLoader._getSystemFullFilename(project, resourceRelativePath);
      }

      return resourceName;
    }

    static getFontFamily(project, fontFilename) {
      if (!fontFilename) return "";

      if (loadedFontFamilies[fontFilename]) {
        return loadedFontFamilies[fontFilename];
      }

      const fontFamily = slug(fontFilename);
      const fontFaceDeclaration =
        "@font-face { font-family: '" + fontFamily + "';" +
        "src: url(" + ResourceLoader._getSystemFullFilename(project, fontFilename) + "); }";
      const declaration =
        "<style type='text/css'>" +
        fontFaceDeclaration +
        "</style>";

      document.querySelector('head').innerHTML += declaration;
      return loadedFontFamilies[fontFilename] = fontFamily;
    }

    static getInvalidImageURL() { return "res/error48.png" }
};
