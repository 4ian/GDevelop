//@flow
export function isExtensionNameTaken(
  name: string,
  project: gdProject
): boolean {
  const allExtensions = project.getCurrentPlatform().getAllPlatformExtensions();
  for (let i = 0; i < allExtensions.size(); i++) {
    if (allExtensions.at(i).getName() === name) return true;
  }
  return project.hasEventsFunctionsExtensionNamed(name);
}
