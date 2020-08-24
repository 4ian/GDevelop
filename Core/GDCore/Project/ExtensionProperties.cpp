#include "ExtensionProperties.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"

namespace gd {
const gd::String ExtensionProperties::defaultValue = "";

std::map<gd::String, gd::PropertyDescriptor>
ExtensionProperties::GetAllExtensionProperties(const gd::String& extensionName,
                                               gd::Project& project) {
  // Create a copy
  std::map<gd::String, gd::PropertyDescriptor> props(
      project.GetCurrentPlatform()
          .GetExtension(extensionName)
          ->GetAllProperties());
  // Set values
  for (std::pair<gd::String, gd::PropertyDescriptor> property : props) {
    if (properties.count(extensionName) > 0 &&
        properties[extensionName].count(property.first) > 0) {
      props[property.first].SetValue(properties[extensionName][property.first]);
    }
  }
  return props;
};

void ExtensionProperties::SerializeTo(SerializerElement& element) const {
  element.ConsiderAsArrayOf("extensionProperties");
  for (const std::pair<gd::String, std::map<gd::String, gd::String>> extension :
       properties) {
    for (const std::pair<gd::String, gd::String> property : extension.second) {
      SerializerElement& propertyElement =
          element.AddChild("extensionProperties");
      propertyElement.AddChild("extension").SetStringValue(extension.first);
      propertyElement.AddChild("property").SetStringValue(property.first);
      propertyElement.AddChild("value").SetStringValue(property.second);
    }
  }
};

void ExtensionProperties::UnserializeFrom(const SerializerElement& element) {
  properties.clear();
  element.ConsiderAsArrayOf("extensionProperties");
  for (std::pair<const gd::String, std::shared_ptr<SerializerElement>>
           extensionProperties : element.GetAllChildren()) {
    std::shared_ptr<SerializerElement> extensionPropertiesElement =
        extensionProperties.second;
    properties
        [extensionPropertiesElement->GetChild("extension").GetStringValue()]
        [extensionPropertiesElement->GetChild("property").GetStringValue()] =
            extensionPropertiesElement->GetChild("value").GetStringValue();
  }
};

};  // namespace gd
