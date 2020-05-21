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
  class GD_CORE_API ExtensionPropertiesManager {
    public:
  	  gd::String& GetValue(const gd::String& extension, const gd::String& property) {
        return properties[extension][property];
      };

      const gd::String& GetValue(const gd::String& extension, const gd::String& property) const {
        return properties.at(extension).at(property);
      };

      void SetValue(const gd::String& extension, const gd::String& property, const gd::String& newValue) {
        properties[extension][property] = newValue;
      };

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
