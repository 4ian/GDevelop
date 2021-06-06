#pragma once
#include <vector>

#include "GDCore/Extensions/Metadata/DependencyMetadata.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/Project.h"

namespace gd {

/**
 * \brief Store references to a gd::DependencyMetadata and its associated
 * gd::PlatformExtension.
 *
 * \note Both objects must be kept alive, as this is keeping a pointer to them.
 */
struct DependencyMetadataAndExtension {
  DependencyMetadataAndExtension(gd::DependencyMetadata &dependency_,
                                 gd::PlatformExtension &extension_)
      : dependency(&dependency_), extension(&extension_){};

  gd::DependencyMetadata &GetDependency() const { return *dependency; };
  gd::PlatformExtension &GetExtension() const { return *extension; };

 private:
  gd::DependencyMetadata *dependency;
  gd::PlatformExtension *extension;
};

/**
 * \brief Helpers to manipulate dependencies of extensions to be exported along
 * with a game.
 */
class ExportedDependencyResolver {
 public:
  /**
   * \brief Return the list of dependencies to be exported for the given
   * project, used extensions list and dependency type.
   *
   * Not all dependencies declared by extensions must be exported: some are only
   * exported when some settings are filled. Then, some others are only exported
   * when some other dependencies are exported (this won't work for more than
   * one level though).
   */
  static std::vector<DependencyMetadataAndExtension> GetDependenciesFor(
      const gd::Project &project,
      std::set<gd::String> usedExtensions,
      const gd::String &dependencyType) {
    std::vector<DependencyMetadataAndExtension> dependenciesWithProperType;
    for (const gd::String &extensionName : usedExtensions) {
      auto extension = project.GetCurrentPlatform().GetExtension(extensionName);
      for (gd::DependencyMetadata &dependency :
           extension->GetAllDependencies()) {
        if (dependency.GetDependencyType() == dependencyType) {
          DependencyMetadataAndExtension dependencyMetadataAndExtension(
              dependency, *extension);
          dependenciesWithProperType.push_back(dependencyMetadataAndExtension);
        }
      }
    }

    // Keep only the dependencies that have their extra settings filled
    // and those that don't require extra settings to be filled.
    std::vector<DependencyMetadataAndExtension> dependenciesWithFilledSettings;
    for (auto dependencyAndExtension : dependenciesWithProperType) {
      auto &dependency = dependencyAndExtension.GetDependency();
      auto extraSettingValues = GetExtensionDependencyExtraSettingValues(
          project, dependencyAndExtension);

      bool hasExtraSettings = !extraSettingValues.empty();
      if (!dependency.IsOnlyIfSomeExtraSettingsNonEmpty() || hasExtraSettings)
        dependenciesWithFilledSettings.push_back(dependencyAndExtension);
    }

    // Keep only the dependency that depends on another dependencies that is
    // exported (or dependencies that don't require another dependency).
    std::vector<DependencyMetadataAndExtension> exportedDependencies;
    for (auto dependencyAndExtension : dependenciesWithFilledSettings) {
      auto &dependency = dependencyAndExtension.GetDependency();
      auto &otherDependencyName =
          dependency.GetOtherDependencyThatMustBeExported();
      if (otherDependencyName.empty() ||
          std::find_if(
              dependenciesWithFilledSettings.begin(),
              dependenciesWithFilledSettings.end(),
              [&otherDependencyName](
                  DependencyMetadataAndExtension &otherDependencyAndExtension) {
                return otherDependencyAndExtension.GetDependency().GetName() ==
                       otherDependencyName;
              }) != dependenciesWithFilledSettings.end()) {
        exportedDependencies.push_back(dependencyAndExtension);
      }
    }

    return exportedDependencies;
  }

  /**
   * \brief Return the values that were stored in the project for the given
   * dependency.
   */
  static std::map<gd::String, gd::String>
  GetExtensionDependencyExtraSettingValues(
      const gd::Project &project,
      const gd::DependencyMetadataAndExtension &dependencyAndExtension) {
    std::map<gd::String, gd::String> values;
    auto &dependency = dependencyAndExtension.GetDependency();
    const gd::String &extensionName =
        dependencyAndExtension.GetExtension().GetName();

    for (const auto &extraSetting : dependency.GetAllExtraSettings()) {
      const gd::String &type = extraSetting.second.GetType();
      const gd::String extraSettingValue =
          type == "ExtensionProperty"
              ? project.GetExtensionProperties().GetValue(
                    extensionName, extraSetting.second.GetValue())
              : extraSetting.second.GetValue();

      if (!extraSettingValue.empty())
        values[extraSetting.first] = extraSettingValue;
    }

    return values;
  };
};

}  // namespace gd
