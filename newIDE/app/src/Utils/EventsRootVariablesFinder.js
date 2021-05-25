const gd: libGDevelop = global.gd;

const isRootVariableName = fullName =>
  !fullName.includes('.') && !fullName.includes('[') && fullName.length > 0;

export default class EventsRootVariablesFinder {
  static findAllGlobalVariables(
    platform: gdPlatform,
    project: gdProject
  ): string[] {
    return (
      gd.EventsVariablesFinder.findAllGlobalVariables(platform, project)
        .toNewVectorString()
        .toJSArray()
        // Remove child references
        .filter(isRootVariableName)
    );
  }

  static findAllLayoutVariables(
    platform: gdPlatform,
    project: gdProject,
    layout: gdLayout
  ): string[] {
    return gd.EventsVariablesFinder.findAllLayoutVariables(
      project.getCurrentPlatform(),
      project,
      layout
    )
      .toNewVectorString()
      .toJSArray()
      .filter(isRootVariableName);
  }

  static findAllObjectVariables(
    platform: gdPlatform,
    project: gdProject,
    layout: gdLayout,
    object: gdObject
  ): string[] {
    return gd.EventsVariablesFinder.findAllObjectVariables(
      project.getCurrentPlatform(),
      project,
      layout,
      object
    )
      .toNewVectorString()
      .toJSArray()
      .filter(isRootVariableName);
  }
}
