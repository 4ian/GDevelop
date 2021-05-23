const gd: libGDevelop = global.gd;

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
        .filter(name => !name.includes('.') && !name.includes('['))
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
      .filter(name => !name.includes('.') && !name.includes('['));
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
      .filter(name => !name.includes('.') && !name.includes('['));
  }
}
