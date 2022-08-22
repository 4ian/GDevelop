#include "CustomObject.h"

#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"

#include <map>

using namespace gd;

std::unique_ptr<gd::Object> CustomObject::Clone() const {
  CustomObject* clone = new CustomObject(*this);
  return std::unique_ptr<gd::Object>(clone);
}

// TODO EBO Extract a class from Object for the object configuration.
// This will allow CustomObject to have a ObjectConfiguration composed of
// ObjectConfiguration for their children in addition to its own properties.
// This will be used by the GUI to display custom editors (for sprites for
// instance)
std::map<gd::String, gd::PropertyDescriptor> CustomObject::GetProperties() const {
    const auto &properties = eventsBasedObject.GetPropertyDescriptors();
    auto objectProperties = std::map<gd::String, gd::PropertyDescriptor>();

    for (auto &property : properties.GetInternalVector()) {
      const auto &propertyName = property->GetName();
      const auto &propertyType = property->GetType();

      // TODO Move this into a PropertyDescriptor copy method.
      auto &newProperty = objectProperties[propertyName]
            .SetType(property->GetType())
            .SetDescription(property->GetDescription())
            .SetGroup(property->GetGroup())
            .SetLabel(property->GetLabel())
            .SetValue(property->GetValue())
            .SetHidden(property->IsHidden());
      
      for (auto &extraInfo : property->GetExtraInfo()) {
        newProperty.AddExtraInfo(extraInfo);
      }

      if (objectContent.HasChild(propertyName)) {
        if (
          propertyType == "String" ||
          propertyType == "Choice" ||
          propertyType == "Color"
        ) {
          newProperty.SetValue(
            objectContent.GetChild(propertyName).GetStringValue()
          );
        } else if (propertyType == "Number") {
          newProperty.SetValue(
            gd::String::From(objectContent.GetChild(propertyName).GetDoubleValue())
          );
        } else if (propertyType == "Boolean") {
          newProperty.SetValue(
            objectContent.GetChild(propertyName).GetBoolValue()
              ? "true"
              : "false"
          );
        }
      } else {
        // No value was serialized for this property. `newProperty`
        // will have the default value coming from `enumeratedProperty`.
      }
    }

    return objectProperties;
}

bool CustomObject::UpdateProperty(const gd::String& propertyName,
                                  const gd::String& newValue) {
    const auto &properties = eventsBasedObject.GetPropertyDescriptors();
    if (!properties.Has(propertyName)) {
      return false;
    }
    const auto &property = properties.Get(propertyName);

    auto &element = objectContent.AddChild(propertyName);
    const gd::String &propertyType = property.GetType();

    if (
      propertyType == "String" ||
      propertyType == "Choice" ||
      propertyType == "Color"
    ) {
      element.SetStringValue(newValue);
    } else if (propertyType == "Number") {
      element.SetDoubleValue(newValue.To<double>());
    } else if (propertyType == "Boolean") {
      element.SetBoolValue(newValue == "1");
    }

    return true;
}

std::map<gd::String, gd::PropertyDescriptor>
CustomObject::GetInitialInstanceProperties(
    const gd::InitialInstance& instance,
    gd::Project& project,
    gd::Layout& scene) {
  return std::map<gd::String, gd::PropertyDescriptor>();
}

bool CustomObject::UpdateInitialInstanceProperty(
    gd::InitialInstance& instance,
    const gd::String& name,
    const gd::String& value,
    gd::Project& project,
    gd::Layout& scene) {
  return false;
}

void CustomObject::DoSerializeTo(SerializerElement& arg0) const {
  arg0.AddChild("content") = objectContent;
}
void CustomObject::DoUnserializeFrom(Project& arg0,
                                               const SerializerElement& arg1) {
  objectContent = arg1.GetChild("content");
}

void CustomObject::ExposeResources(
    gd::ArbitraryResourceWorker& worker) {
  std::map<gd::String, gd::PropertyDescriptor> properties = GetProperties();

  for (auto& property : properties) {
    const String& propertyName = property.first;
    const gd::PropertyDescriptor& propertyDescriptor = property.second;
    if (propertyDescriptor.GetType() == "resource") {
      auto& extraInfo = propertyDescriptor.GetExtraInfo();
      const gd::String& resourceType = extraInfo.empty() ? "" : extraInfo[0];
      const gd::String& oldPropertyValue = propertyDescriptor.GetValue();

      gd::String newPropertyValue = oldPropertyValue;
      if (resourceType == "image") {
        worker.ExposeImage(newPropertyValue);
      } else if (resourceType == "audio") {
        worker.ExposeAudio(newPropertyValue);
      } else if (resourceType == "font") {
        worker.ExposeFont(newPropertyValue);
      } else if (resourceType == "video") {
        worker.ExposeVideo(newPropertyValue);
      } else if (resourceType == "json") {
        worker.ExposeJson(newPropertyValue);
      } else if (resourceType == "bitmapFont") {
        worker.ExposeBitmapFont(newPropertyValue);
      }

      if (newPropertyValue != oldPropertyValue) {
        UpdateProperty(propertyName, newPropertyValue);
      }
    }
  }
}
