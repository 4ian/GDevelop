import optionalRequire from '../Utils/OptionalRequire.js';
const electron = optionalRequire('electron');
const path = optionalRequire('path');

export default class ResourceLoader {
    static get(project, resourceName) {
        if (electron) { // Support local filesystem with Electron
            const file = project.getProjectFile();
            const projectPath = path.dirname(file);
            const resourceRelativePath =
                project.getResourcesManager().getResource(resourceName).getFile();
            const resourceAbsolutePath = path.resolve(projectPath, resourceRelativePath);
            console.log("Loading", resourceAbsolutePath);
            return 'file://' + resourceAbsolutePath;
        }

        if (project.getResourcesManager().hasResource(resourceName)) {
            const filename = project.getResourcesManager().getResource(resourceName).getFile();
            return filename;
        }

        return resourceName;
    }

    static getInvalidImageURL() { return "res/error48.png" }
};
