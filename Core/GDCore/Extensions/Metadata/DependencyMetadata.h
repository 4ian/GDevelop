/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef DEPENDENCYMETADATA_H
#define DEPENDENCYMETADATA_H
#include <map>
#include <set>

#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Log.h"

namespace gd {
/**
 * \brief Contains information about a dependency (library, npm/cordova
 * package, or other according to the export) of an extension.
 */
class GD_CORE_API DependencyMetadata {
 public:
  /**
   * Construct a new dependency metadata, though you probably want to call
   * `AddDependency` on gd::PlatformExtension.
   *
   * \see gd::PlatformExtension
   */
  DependencyMetadata() : onlyIfSomeExtraSettingsNonEmpty(false){};

  /**
   * \brief Sets the name shown to users.
   */
  DependencyMetadata& SetName(const gd::String& name_) {
    name = name_;
    return *this;
  };

  /**
   * \brief Sets the name written by the exporter.
   * Typically, this is what is used by the dependency manager
   * to find the dependency.
   *
   * \example
   * \code
   *  // For depending upon the NPM package is-thirteen
   *  gd::DependencyMetadata dependencyMetadata = gd::DependencyMetadata();
   *  dependencyMetadata.setExporterName("is-thirteen");
   * \endcode
   */
  DependencyMetadata& SetExportName(const gd::String& exportName_) {
    exportName = exportName_;
    return *this;
  };

  /**
   * \brief Set the version of the dependency to install.
   * Use an empty string to use the latest version.
   */
  DependencyMetadata& SetVersion(const gd::String& version_) {
    version = version_;
    return *this;
  };

  /**
   * \brief Sets the type of dependency (what will be used to install it)
   *
   * This can either be "npm" or "cordova" for now.
   */
  DependencyMetadata& SetDependencyType(const gd::String& dependencyType_) {
    dependencyType = dependencyType_;
    if (dependencyType != "npm" && dependencyType != "cordova") {
      gd::LogWarning("Invalid dependency type: " + dependencyType);
    }
    return *this;
  };

  /**
   * \brief Sets a dependency type specific setting.
   */
  DependencyMetadata& SetExtraSetting(
      const gd::String& settingName,
      const gd::PropertyDescriptor& settingValue) {
    extraData[settingName] = settingValue;
    return *this;
  };

  /**
   * \brief Mark the dependency to be included in the export only if at least
   * one of the extra settings is set.
   */
  DependencyMetadata& OnlyIfSomeExtraSettingsNonEmpty() {
    onlyIfSomeExtraSettingsNonEmpty = true;
    return *this;
  };

  /**
   * \brief Check if at least one of the extra settings must be set for the
   * dependency to be included in the export.
   */
  bool IsOnlyIfSomeExtraSettingsNonEmpty() const {
    return onlyIfSomeExtraSettingsNonEmpty;
  };

  /**
   * \brief Mark the dependency to be included in the export only if one other
   * dependency is included in the export.
   */
  DependencyMetadata& OnlyIfOtherDependencyIsExported(
      const gd::String& otherDependency) {
    onlyIfOtherDependencyIsExported = otherDependency;
    return *this;
  };

  /**
   * \brief Get the name of another dependency that must be exported to have
   * this one also exported.
   */
  const gd::String& GetOtherDependencyThatMustBeExported() const {
    return onlyIfOtherDependencyIsExported;
  };

  const gd::String& GetName() const { return name; };
  const gd::String& GetExportName() const { return exportName; };
  const gd::String& GetVersion() const { return version; };
  const gd::String& GetDependencyType() const {
    if (dependencyType == "")
      gd::LogWarning("Dependency has no type, it won't be exported.");
    return dependencyType;
  };

  const std::map<gd::String, gd::PropertyDescriptor>& GetAllExtraSettings()
      const {
    return extraData;
  }

  void CopyFrom(const DependencyMetadata& dependencyMetadata) {
    *this = dependencyMetadata;
  }

 private:
  gd::String name;        ///< The name of the dependency.
  gd::String exportName;  ///< The name used to install the package (example:
                          ///< npm package name for npm dependency type).
  gd::String version;     ///< The version of the dependency
  gd::String dependencyType;  ///< The tool used to install the dependency.
  std::map<gd::String, gd::PropertyDescriptor>
      extraData;  ///< Contains dependency type specific additional parameters
                  ///< for the dependency.
  bool onlyIfSomeExtraSettingsNonEmpty;  ///< If true, only use this dependency
                                         ///< if at least one of the extra
                                         ///< settings is set.
  gd::String onlyIfOtherDependencyIsExported;
};
}  // namespace gd
#endif  // DEPENDENCYMETADATA_H
