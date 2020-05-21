#include <map>
#include "ExtensionPropertiesManager.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

void ExtensionPropertiesManager::SerializeTo(SerializerElement& element) const {
    element.ConsiderAsArrayOf("extensionProperties");
    for(const std::pair<gd::String, std::map<gd::String, gd::String>> extension : properties) {
        for(const std::pair<gd::String, gd::String> property : extension.second) {
            SerializerElement& propertyElement = element.AddChild("extensionProperty");
            propertyElement.AddChild("extension").SetStringValue(extension.first);
            propertyElement.AddChild("property").SetStringValue(property.first);
            propertyElement.AddChild("value").SetStringValue(property.second);
        }
    }
};

void ExtensionPropertiesManager::UnserializeFrom(const SerializerElement& element) {
    element.ConsiderAsArrayOf("extensionProperties");
    for(std::pair<const gd::String, std::shared_ptr<SerializerElement>> extensionProperties: element.GetAllChildren()) {
        std::shared_ptr<SerializerElement> extensionPropertiesElement = extensionProperties.second;
        properties[extensionPropertiesElement->GetChild("extension").GetStringValue()][extensionPropertiesElement->GetChild("property").GetStringValue()] = extensionPropertiesElement->GetChild("value").GetStringValue();
    }
};

}; // namespace gd
