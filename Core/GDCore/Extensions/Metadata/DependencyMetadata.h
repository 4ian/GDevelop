/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef DEPENDENCYMETADATA_H
#define DEPENDENCYMETADATA_H
#include <map>

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
   * \brief Sets the type of dependecy (what will be used to install it)
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

  const gd::String& GetName() const { return name; };
  const gd::String& GetExportName() const { return exportName; };
  const gd::String& GetVersion() const { return version; };
  const gd::String& GetDependencyType() const { return dependencyType; };
  gd::PropertyDescriptor& GetExtraSetting(const gd::String& settingName) {
    return extraData[settingName];
  };
  std::map<gd::String, gd::PropertyDescriptor>& GetAllExtraSettings() {
    return extraData;
  }

 private:
  gd::String name;  ///< The name of the dependency.
  gd::String exportName;  ///< The name used to install the package (example: npm package name
                          ///< for npm dependency type).
  gd::String version;  ///< The version of the dependency
  gd::String dependencyType =
      "npm";  ///< The tool used to install the dependency.
  std::map<gd::String, gd::PropertyDescriptor>
      extraData;  ///< Contains dependency type specific additional parameters
                  ///< for the dependency.
};
}  // namespace gd
#endif  // DEPENDENCYMETADATA_H
