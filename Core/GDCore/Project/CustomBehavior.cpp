#include "CustomBehavior.h"

#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"

#include <map>

using namespace gd;

CustomBehavior *CustomBehavior::Clone() const {
  CustomBehavior *clone = new CustomBehavior(*this);
  return clone;
}

std::map<gd::String, gd::PropertyDescriptor> CustomBehavior::GetProperties(
    const gd::SerializerElement &behaviorContent) const {
  const auto &properties = eventsBasedBehavior.GetPropertyDescriptors();
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

    if (behaviorContent.HasChild(propertyName)) {
      if (propertyType == "String" || propertyType == "Choice" ||
          propertyType == "Color" || propertyType == "Behavior") {
        newProperty.SetValue(
            behaviorContent.GetChild(propertyName).GetStringValue());
      } else if (propertyType == "Number") {
        newProperty.SetValue(gd::String::From(
            behaviorContent.GetChild(propertyName).GetDoubleValue()));
      } else if (propertyType == "Boolean") {
        newProperty.SetValue(
            behaviorContent.GetChild(propertyName).GetBoolValue() ? "true"
                                                                  : "false");
      }
    } else {
      // No value was serialized for this property. `newProperty`
      // will have the default value coming from `enumeratedProperty`.
    }
  }

  return objectProperties;
}

bool CustomBehavior::UpdateProperty(gd::SerializerElement &behaviorContent,
                                    const gd::String &propertyName,
                                    const gd::String &newValue) {
  const auto &properties = eventsBasedBehavior.GetPropertyDescriptors();
  if (!properties.Has(propertyName)) {
    return false;
  }
  const auto &property = properties.Get(propertyName);

  auto &element = objectContent.AddChild(propertyName);
  const gd::String &propertyType = property.GetType();

  if (propertyType == "String" || propertyType == "Choice" ||
      propertyType == "Color" || propertyType == "Behavior") {
    element.SetStringValue(newValue);
  } else if (propertyType == "Number") {
    element.SetDoubleValue(newValue.To<double>());
  } else if (propertyType == "Boolean") {
    element.SetBoolValue(newValue == "1");
  }

  return true;
}

void CustomBehavior::InitializeContent(gd::SerializerElement &behaviorContent) {
  const auto &properties = eventsBasedBehavior.GetPropertyDescriptors();
  for (auto &&property : properties.GetInternalVector()) {
    auto element = behaviorContent.AddChild(property->GetName());
    auto propertyType = property->GetType();

    if (propertyType == "String" || propertyType == "Choice" ||
        propertyType == "Color" || propertyType == "Behavior") {
      element.SetStringValue(property->GetValue());
    } else if (propertyType == "Number") {
      element.SetDoubleValue(property->GetValue().To<double>());
    } else if (propertyType == "Boolean") {
      element.SetBoolValue(property->GetValue() == "true");
    }
  }
}
