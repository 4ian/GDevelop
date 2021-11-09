/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EXTENSIONPROPERTIES_H
#define GDCORE_EXTENSIONPROPERTIES_H
#include <map>

#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"

namespace gd {
class Project;
class PropertyDescriptor;
}  // namespace gd

namespace gd {
class GD_CORE_API ExtensionProperties {
  static const gd::String defaultValue;

 public:
  const gd::String& GetValue(const gd::String& extension,
                             const gd::String& property) const {
    if (properties.count(extension) == 0 ||
        properties.at(extension).count(property) == 0) {
      return ExtensionProperties::defaultValue;
    }
    return properties.at(extension).at(property);
  };

  void SetValue(const gd::String& extension,
                const gd::String& property,
                const gd::String& newValue) {
    properties[extension][property] = newValue;
  };

  bool HasProperty(const gd::String& extension, const gd::String& property) {
    for (std::pair<gd::String, gd::String> propertyPair :
         properties[extension]) {
      if (propertyPair.first == property) {
        return true;
      }
    }
    return false;
  }

  std::map<gd::String, gd::PropertyDescriptor> GetAllExtensionProperties(
      const gd::String& extensionName, gd::Project& project);

  ///@{
  /**
   * \brief Serialize the Extension Properties.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the Extension Properties.
   */
  void UnserializeFrom(const SerializerElement& element);
  ///@}

 private:
  std::map<gd::String, std::map<gd::String, gd::String>>
      properties;  ///< The properties of the project
};
}  // namespace gd

#endif  // EXTENSIONPROPERTIES_H
