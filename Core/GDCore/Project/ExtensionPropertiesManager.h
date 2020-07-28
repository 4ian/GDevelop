/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EXTENSIONPROPERTIESMANAGERS_H
#define GDCORE_EXTENSIONPROPERTIESMANAGERS_H
#include <map>
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"

namespace gd{
  class Project;
  class PropertyDescriptor;
}

namespace gd{
  class GD_CORE_API ExtensionPropertiesManager {
    public:
      const gd::String& GetValue(const gd::String& extension, const gd::String& property) const {
        return properties.at(extension).at(property);
      };

      void SetValue(const gd::String& extension, const gd::String& property, const gd::String& newValue) {
        properties[extension][property] = newValue;
      };

      bool HasProperty(const gd::String& extension, const gd::String& property) {
        for (std::pair<gd::String, gd::String> propertyPair : properties[extension]) {
          if (propertyPair.first == property) {
            return true;
          }
        }
        return false;
      }

      std::map<gd::String, gd::PropertyDescriptor> GetAllExtensionProperties(const gd::String& extensionName, gd::Project& project);

      ///@{
      /**
       * \brief Serialize the Extension Properties.
       */
      virtual void SerializeTo(SerializerElement& element) const;

      /**
       * \brief Unserialize the Extension Properties.
       */
      virtual void UnserializeFrom(const SerializerElement& element);
      ///@}

    private:
      std::map<gd::String, std::map<gd::String, gd::String>> properties; ///< The properties of the project
  };
}  // namespace gd

#endif  // EXTENSIONPROPERTIESMANAGERS_H
