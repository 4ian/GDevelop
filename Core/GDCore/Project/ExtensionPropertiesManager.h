/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EXTENSIONPROPERTIESMANAGERS_H
#define GDCORE_EXTENSIONPROPERTIESMANAGERS_H
#include <map>
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/String.h"

namespace gd{
  class ExtensionProperty {
    public:
      ExtensionProperty() {};
      std::shared_ptr<gd::PlatformExtension> extension; ///< Source of metadata
      gd::String& name;
      gd::String& value;
      std::map<gd::String, gd::PropertyDescriptor> extraData;
  }

  class GD_CORE_API ExtensionPropertiesManager {
    public:
      ExtensionPropertiesManager(gd::Project& project) {
        for(std::shared_ptr<PlatformExtension> extension : project.GetCurrentPlatform().GetAllPlatformExtensions()) {
          for(std::pair<const gd::String, gd::PropertyDescriptor>& originalProperty : extension->GetAllProperties()) {
            ExtensionProperty property = ExtensionProperty();
            property.extension = extension;
            property.name = originalProperty.first;
            property.value = "";
            properties[extension->GetName()][property.name] = property;
          }
        }
      }
      
      const gd::PropertyDescriptor& GetMetadata(const gd::String& extension, const gd::String& property) const {
        return properties.at(extension).at(property).extension->GetProperty(property);
      }

      gd::String& GetValue(const gd::String& extension, const gd::String& property) {
        return properties.at(extension).at(property).value;
      }

      void SetValue(const gd::String& extension, const gd::String& property, const gd::String& newValue) {
        return properties.at(extension).at(property).value = newValue;
      }
    private:
      std::map<gd::String, std::map<gd::String, gd::ExtensionProperty>> properties;
  }
}  // namespace gd

#endif  // EXTENSIONPROPERTIESMANAGERS_H
