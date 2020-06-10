export function isValidExtensionName (
    name: string,
    project: gdProject
  ): boolean {
    for(let extensionName of project.getUsedExtensions().toJSArray()) {
      if(extensionName === name)
        return true;
    };
    return project.hasEventsFunctionsExtensionNamed(name);
};
