/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/Project/InitialInstance.h"

#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/UUID/UUID.h"
#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Project/CustomBehavior.h"
#include "GDCore/Tools/Log.h"

namespace gd {

gd::String* InitialInstance::badStringPropertyValue = NULL;

InitialInstance::InitialInstance()
    : objectName(""),
      x(0),
      y(0),
      z(0),
      angle(0),
      rotationX(0),
      rotationY(0),
      zOrder(0),
      opacity(255),
      layer(""),
      flippedX(false),
      flippedY(false),
      flippedZ(false),
      customSize(false),
      customDepth(false),
      width(0),
      height(0),
      depth(0),
      locked(false),
      sealed(false),
      keepRatio(true),
      persistentUuid(UUID::MakeUuid4()) {}

void InitialInstance::Init(const gd::InitialInstance& object) {
  objectName = object.objectName;
  x = object.x;
  y = object.y;
  z = object.z;
  angle = object.angle;
  rotationX = object.rotationX;
  rotationY = object.rotationY;
  zOrder = object.zOrder;
  opacity = object.opacity;
  layer = object.layer;
  flippedX = object.flippedX;
  flippedY = object.flippedY;
  flippedZ = object.flippedZ;
  customSize = object.customSize;
  customDepth = object.customDepth;
  width = object.width;
  height = object.height;
  depth = object.depth;
  locked = object.locked;
  sealed = object.sealed;
  keepRatio = object.keepRatio;
  persistentUuid = object.persistentUuid;
  defaultWidth = object.defaultWidth;
  defaultHeight = object.defaultHeight;
  defaultDepth = object.defaultDepth;
  numberProperties = object.numberProperties;
  stringProperties = object.stringProperties;
  initialVariables = object.initialVariables;
  behaviorOverridings = gd::Clone(object.behaviorOverridings);
}

void InitialInstance::UnserializeFrom(gd::Project &project,
                                      const SerializerElement &element) {
  SetObjectName(element.GetStringAttribute("name", "", "nom"));
  SetX(element.GetDoubleAttribute("x"));
  SetY(element.GetDoubleAttribute("y"));
  SetZ(element.GetDoubleAttribute("z", 0));
  SetAngle(element.GetDoubleAttribute("angle"));
  SetRotationX(element.GetDoubleAttribute("rotationX", 0));
  SetRotationY(element.GetDoubleAttribute("rotationY", 0));
  SetHasCustomSize(
      element.GetBoolAttribute("customSize", false, "personalizedSize"));
  SetCustomWidth(element.GetDoubleAttribute("width"));
  SetCustomHeight(element.GetDoubleAttribute("height"));
  if (element.HasChild("depth") || element.HasAttribute("depth")) {
    SetHasCustomDepth(true);
    SetCustomDepth(element.GetDoubleAttribute("depth"));
  } else {
    SetHasCustomDepth(false);
  }
  if (element.HasChild("defaultWidth") ||
      element.HasAttribute("defaultWidth")) {
    defaultWidth = element.GetDoubleAttribute("defaultWidth");
  }
  if (element.HasChild("defaultHeight") ||
      element.HasAttribute("defaultHeight")) {
    defaultHeight = element.GetDoubleAttribute("defaultHeight");
  }
  if (element.HasChild("defaultDepth") ||
      element.HasAttribute("defaultDepth")) {
    defaultDepth = element.GetDoubleAttribute("defaultDepth");
  }
  SetZOrder(element.GetIntAttribute("zOrder", 0, "plan"));
  SetOpacity(element.GetIntAttribute("opacity", 255));
  SetLayer(element.GetStringAttribute("layer"));
  SetFlippedX(element.GetBoolAttribute("flippedX", false));
  SetFlippedY(element.GetBoolAttribute("flippedY", false));
  SetFlippedZ(element.GetBoolAttribute("flippedZ", false));
  SetLocked(element.GetBoolAttribute("locked", false));
  SetSealed(element.GetBoolAttribute("sealed", false));
  SetShouldKeepRatio(element.GetBoolAttribute("keepRatio", false));

  persistentUuid = element.GetStringAttribute("persistentUuid");
  if (persistentUuid.empty()) ResetPersistentUuid();

  numberProperties.clear();
  if (element.HasChild("numberProperties", "floatInfos")) {
    const SerializerElement& numberPropertiesElement =
        element.GetChild("numberProperties", 0, "floatInfos");
    numberPropertiesElement.ConsiderAsArrayOf("property", "Info");
    for (std::size_t j = 0; j < numberPropertiesElement.GetChildrenCount(); ++j) {
      gd::String name =
          numberPropertiesElement.GetChild(j).GetStringAttribute("name");
      double value =
          numberPropertiesElement.GetChild(j).GetDoubleAttribute("value");

      // Compatibility with GD <= 5.1.164
      if (name == "z") {
        SetZ(value);
      } else if (name == "rotationX") {
        SetRotationX(value);
      } else if (name == "rotationY") {
        SetRotationY(value);
      } else if (name == "depth") {
        SetHasCustomDepth(true);
        SetCustomDepth(value);
      }
      // end of compatibility code
      else {
        numberProperties[name] = value;
      }
    }
  }

  stringProperties.clear();
  if (element.HasChild("stringProperties", "stringInfos")) {
    const SerializerElement& stringPropElement =
        element.GetChild("stringProperties", 0, "stringInfos");
    stringPropElement.ConsiderAsArrayOf("property", "Info");
    for (std::size_t j = 0; j < stringPropElement.GetChildrenCount(); ++j) {
      gd::String name = stringPropElement.GetChild(j).GetStringAttribute("name");
      gd::String value =
          stringPropElement.GetChild(j).GetStringAttribute("value");
      stringProperties[name] = value;
    }
  }

  if (element.HasChild("initialVariables", "InitialVariables")) {
    GetVariables().UnserializeFrom(
        element.GetChild("initialVariables", 0, "InitialVariables"));
  }

  if (element.HasChild("behaviorOverridings")) {
    SerializerElement& behaviorsElement = element.GetChild("behaviorOverridings");
    behaviorsElement.ConsiderAsArrayOf("behaviorOverriding");
    for (std::size_t i = 0; i < behaviorsElement.GetChildrenCount(); ++i) {
      SerializerElement& behaviorElement = behaviorsElement.GetChild(i);

      gd::String type = behaviorElement.GetStringAttribute("type");
      gd::String name = behaviorElement.GetStringAttribute("name");

      auto behavior = AddNewBehaviorOverriding(project, type, name);
      
      behavior->UnserializeFrom(behaviorElement);
    }
  }
}

void InitialInstance::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("name", GetObjectName());
  element.SetAttribute("x", GetX());
  element.SetAttribute("y", GetY());
  if (GetZ() != 0) element.SetAttribute("z", GetZ());
  element.SetAttribute("zOrder", GetZOrder());
  if (GetOpacity() != 255) element.SetAttribute("opacity", GetOpacity());
  if (IsFlippedX()) element.SetAttribute("flippedX", IsFlippedX());
  if (IsFlippedY()) element.SetAttribute("flippedY", IsFlippedY());
  if (IsFlippedZ()) element.SetAttribute("flippedZ", IsFlippedZ());
  element.SetAttribute("layer", GetLayer());
  element.SetAttribute("angle", GetAngle());
  if (GetRotationX() != 0) element.SetAttribute("rotationX", GetRotationX());
  if (GetRotationY() != 0) element.SetAttribute("rotationY", GetRotationY());
  element.SetAttribute("customSize", HasCustomSize());
  element.SetAttribute("width", GetCustomWidth());
  element.SetAttribute("height", GetCustomHeight());
  if (HasCustomDepth()) element.SetAttribute("depth", GetCustomDepth());
  // defaultWidth, defaultHeight and defaultDepth are not serialized
  // because they are evaluated by InGameEditor.
  if (IsLocked()) element.SetAttribute("locked", IsLocked());
  if (IsSealed()) element.SetAttribute("sealed", IsSealed());
  if (ShouldKeepRatio()) element.SetAttribute("keepRatio", ShouldKeepRatio());

  if (persistentUuid.empty()) persistentUuid = UUID::MakeUuid4();
  element.SetStringAttribute("persistentUuid", persistentUuid);

  SerializerElement& numberPropertiesElement =
      element.AddChild("numberProperties");
  numberPropertiesElement.ConsiderAsArrayOf("property");
  for (const auto& property : numberProperties) {
    numberPropertiesElement.AddChild("property")
        .SetAttribute("name", property.first)
        .SetAttribute("value", property.second);
  }

  SerializerElement& stringPropElement = element.AddChild("stringProperties");
  stringPropElement.ConsiderAsArrayOf("property");
  for (const auto& property : stringProperties) {
    stringPropElement.AddChild("property")
        .SetAttribute("name", property.first)
        .SetAttribute("value", property.second);
  }

  GetVariables().SerializeTo(element.AddChild("initialVariables"));

  if (!behaviorOverridings.empty()) {
    SerializerElement &behaviorsElement =
        element.AddChild("behaviorOverridings");
    behaviorsElement.ConsiderAsArrayOf("behaviorOverriding");
    for (auto &it : behaviorOverridings) {
      const auto &name = it.first;
      const auto &behavior = it.second;

      // Default behaviors are added at the object creation according to
      // metadata. They don't need to be serialized.
      if (behavior->IsDefaultBehavior()) {
        continue;
      }
      // Empty behavior overridings are only removed at serialization to avoid
      // to destroy them while they may still be used.
      if (behavior->GetProperties().empty()) {
        continue;
      }
      SerializerElement &behaviorElement =
          behaviorsElement.AddChild("behaviorOverriding");

      behavior->SerializeTo(behaviorElement);
      // The content can contain type or name properties, remove them.
      behaviorElement.RemoveChild("type");
      behaviorElement.RemoveChild("name");
      behaviorElement.RemoveChild("isFolded");
      behaviorElement.SetAttribute("type", behavior->GetTypeName());
      behaviorElement.SetAttribute("name", behavior->GetName());
    }
  }
}

InitialInstance& InitialInstance::ResetPersistentUuid() {
  persistentUuid = UUID::MakeUuid4();
  return *this;
}

std::map<gd::String, gd::PropertyDescriptor>
InitialInstance::GetCustomProperties(
    gd::ObjectsContainer& globalObjectsContainer,
    gd::ObjectsContainer& objectsContainer) {
  // Find an object
  if (objectsContainer.HasObjectNamed(GetObjectName()))
    return objectsContainer.GetObject(GetObjectName())
        .GetConfiguration()
        .GetInitialInstanceProperties(*this);
  else if (globalObjectsContainer.HasObjectNamed(GetObjectName()))
    return globalObjectsContainer.GetObject(GetObjectName())
        .GetConfiguration()
        .GetInitialInstanceProperties(*this);

  std::map<gd::String, gd::PropertyDescriptor> nothing;
  return nothing;
}

bool InitialInstance::UpdateCustomProperty(
    const gd::String& name,
    const gd::String& value,
    gd::ObjectsContainer& globalObjectsContainer,
    gd::ObjectsContainer& objectsContainer) {
  if (objectsContainer.HasObjectNamed(GetObjectName()))
    return objectsContainer.GetObject(GetObjectName())
        .GetConfiguration()
        .UpdateInitialInstanceProperty(*this, name, value);
  else if (globalObjectsContainer.HasObjectNamed(GetObjectName()))
    return globalObjectsContainer.GetObject(GetObjectName())
        .GetConfiguration()
        .UpdateInitialInstanceProperty(*this, name, value);

  return false;
}

double InitialInstance::GetRawDoubleProperty(const gd::String& name) const {
  const auto& it = numberProperties.find(name);
  return it != numberProperties.end() ? it->second : 0;
}

const gd::String& InitialInstance::GetRawStringProperty(
    const gd::String& name) const {
  if (!badStringPropertyValue) badStringPropertyValue = new gd::String("");

  const auto& it = stringProperties.find(name);
  return it != stringProperties.end() ? it->second : *badStringPropertyValue;
}

void InitialInstance::SetRawDoubleProperty(const gd::String& name,
                                           double value) {
  numberProperties[name] = value;
}

void InitialInstance::SetRawStringProperty(const gd::String& name,
                                           const gd::String& value) {
  stringProperties[name] = value;
}

bool InitialInstance::HasAnyOverriddenProperty(const gd::Object &object) {
  for (auto &behaviorOverridingPair : behaviorOverridings) {
    auto &behaviorName = behaviorOverridingPair.first;
    auto &behaviorOverriding = behaviorOverridingPair.second;
    if (behaviorOverriding->GetProperties().empty() ||
        !object.HasBehaviorNamed(behaviorName)) {
      continue;
    }
    const auto &behaviorProperties =
        object.GetBehavior(behaviorName).GetProperties();
    if (HasAnyOverriddenPropertyForBehavior(object.GetBehavior(behaviorName))) {
      return true;
    }
  }
  return false;
}

bool InitialInstance::HasAnyOverriddenPropertyForBehavior(
    const gd::Behavior &behavior) {
  auto &behaviorName = behavior.GetName();
  if (!HasBehaviorOverridingNamed(behaviorName)) {
    return false;
  }
  auto &behaviorOverriding = GetBehaviorOverriding(behaviorName);
  if (behaviorOverriding.GetProperties().empty()) {
    return false;
  }
  const auto &behaviorProperties = behavior.GetProperties();
  for (auto &overridingPropertyPair : behaviorOverriding.GetProperties()) {
    auto &overridingPropertyName = overridingPropertyPair.first;
    auto &overridingProperty = overridingPropertyPair.second;

    if (behaviorProperties.find(overridingPropertyName) ==
        behaviorProperties.end()) {
      continue;
    }
    if (overridingProperty.GetValue() !=
        behaviorProperties.at(overridingPropertyName).GetValue()) {
      return true;
    }
  }
  return false;
}

gd::Behavior &InitialInstance::GetBehaviorOverriding(const gd::String &name) {
  return *behaviorOverridings.find(name)->second;
}

const gd::Behavior &
InitialInstance::GetBehaviorOverriding(const gd::String &name) const {
  return *behaviorOverridings.find(name)->second;
}

bool InitialInstance::HasBehaviorOverridingNamed(const gd::String &name) const {
  return behaviorOverridings.find(name) != behaviorOverridings.end();
}

void InitialInstance::RemoveBehaviorOverriding(const gd::String &name) {
  behaviorOverridings.erase(name);
}

bool InitialInstance::RenameBehaviorOverriding(const gd::String &name,
                                               const gd::String &newName) {
  if (behaviorOverridings.find(name) == behaviorOverridings.end() ||
      behaviorOverridings.find(newName) != behaviorOverridings.end())
    return false;

  std::unique_ptr<Behavior> aut =
      std::move(behaviorOverridings.find(name)->second);
  behaviorOverridings.erase(name);
  behaviorOverridings[newName] = std::move(aut);
  behaviorOverridings[newName]->SetName(newName);

  return true;
}

gd::Behavior *
InitialInstance::AddNewBehaviorOverriding(const gd::Project &project,
                                          const gd::String &type,
                                          const gd::String &name) {
  // We don't call the Initialize method because behavior overriding should have
  // no property value initially.
  auto addWithoutInitialization =
      [this, &name](std::unique_ptr<gd::Behavior> behavior) {
        this->behaviorOverridings[name] = std::move(behavior);
        return this->behaviorOverridings[name].get();
      };

  if (project.HasEventsBasedBehavior(type)) {
    return addWithoutInitialization(
        gd::make_unique<CustomBehavior>(name, project, type));
  } else {
    const gd::BehaviorMetadata &behaviorMetadata =
        gd::MetadataProvider::GetBehaviorMetadata(project.GetCurrentPlatform(),
                                                  type);
    if (gd::MetadataProvider::IsBadBehaviorMetadata(behaviorMetadata)) {
      gd::LogWarning(
          "Tried to create a behavior with an unknown type: " + type +
          " on an instance of object " + GetObjectName() + "!");
      // It's probably an events-based behavior that was removed.
      // Create a custom behavior to preserve the properties values.
      return addWithoutInitialization(
          gd::make_unique<CustomBehavior>(name, project, type));
    }
    std::unique_ptr<gd::Behavior> behavior(behaviorMetadata.Get().Clone());
    behavior->SetName(name);
    return addWithoutInitialization(std::move(behavior));
  }
}

}  // namespace gd
