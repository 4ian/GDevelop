#include "ExtensionDependencyCache.h"

#include "GDCore/IDE/Events/UsedExtensionsFinder.h"
#include "GDCore/Project/Project.h"

namespace gd {
const std::set<gd::String> &
ExtensionDependencyCache::FindRequiredExtensionsRecursively(
    gd::Project &project, const gd::String &extensionName) {
  auto itr = dependenciesByExtension.find(extensionName);
  if (itr != dependenciesByExtension.end()) {
    return itr->second;
  }
  if (!project.HasEventsFunctionsExtensionNamed(extensionName)) {
    // This can't happen.
    return InsertAndGetNewDependencies(extensionName);
  }
  auto &eventsFunctionsExtension =
      project.GetEventsFunctionsExtension(extensionName);

  const auto &usedExtensionsResult =
      gd::UsedExtensionsFinder::ScanEventsFunctionsExtension(
          project, eventsFunctionsExtension);
  const auto &directlyRequiredExtension =
      usedExtensionsResult.GetUsedExtensions();
  auto &requiredExtensions = InsertAndGetNewDependencies(extensionName);
  for (const gd::String &requiredExtensionName : directlyRequiredExtension) {
    if (!project.HasEventsFunctionsExtensionNamed(requiredExtensionName)) {
      continue;
    }
    requiredExtensions.insert(requiredExtensionName);
    auto &transitivelyRequiredExtensions =
        FindRequiredExtensionsRecursively(project, requiredExtensionName);
    for (auto &&requiredExtensionName : transitivelyRequiredExtensions) {
      requiredExtensions.insert(requiredExtensionName);
    }
  }
  return requiredExtensions;
};

std::set<gd::String> &ExtensionDependencyCache::InsertAndGetNewDependencies(
    const gd::String &extensionName) {
  std::set<gd::String> dependencies;
  dependenciesByExtension[extensionName] = dependencies;
  return dependenciesByExtension[extensionName];
}

} // namespace gd
