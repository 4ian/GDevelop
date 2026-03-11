#include "ExtensionDependencyCache.h"

#include "GDCore/IDE/Events/UsedExtensionsFinder.h"
#include "GDCore/Project/Project.h"

namespace gd {
const std::set<gd::String> &
ExtensionDependencyCache::FindRequiredExtensionsRecursively(
    gd::Project &project, const gd::String &extensionName) {
  auto itr = dependencies.find(extensionName);
  if (itr != dependencies.end()) {
    return *itr->second;
  }
  if (!project.HasEventsFunctionsExtensionNamed(extensionName)) {
    // This can't happen.
    dependencies[extensionName] = gd::make_unique<std::set<gd::String>>();
    return *dependencies[extensionName];
  }
  auto &eventsFunctionsExtension =
      project.GetEventsFunctionsExtension(extensionName);

  const auto &usedExtensionsResult =
      gd::UsedExtensionsFinder::ScanEventsFunctionsExtension(
          project, eventsFunctionsExtension);
  const auto &directlyRequiredExtension =
      usedExtensionsResult.GetUsedExtensions();
  auto requiredExtensions = gd::make_unique<std::set<gd::String>>();
  for (const gd::String &requiredExtensionName : directlyRequiredExtension) {
    if (!project.HasEventsFunctionsExtensionNamed(requiredExtensionName)) {
      continue;
    }
    requiredExtensions->insert(requiredExtensionName);
    auto &transitivelyRequiredExtensions =
        FindRequiredExtensionsRecursively(project, requiredExtensionName);
    for (auto &&requiredExtensionName : transitivelyRequiredExtensions) {
      requiredExtensions->insert(requiredExtensionName);
    }
  }
  dependencies[extensionName] = std::move(requiredExtensions);
  return *dependencies[extensionName];
};
} // namespace gd
