/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/Object.h"

#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/CustomBehavior.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Project/QuickCustomization.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/UUID/UUID.h"

namespace gd {

Object::~Object() {}

Object::Object(const gd::String& name_,
               const gd::String& type_,
               std::unique_ptr<gd::ObjectConfiguration> configuration_)
    : name(name_),
      configuration(std::move(configuration_)),
      objectVariables(gd::VariablesContainer::SourceType::Object) {
  SetType(type_);
}

Object::Object(const gd::String& name_,
               const gd::String& type_,
               gd::ObjectConfiguration* configuration_)
    : name(name_),
      configuration(configuration_),
      objectVariables(gd::VariablesContainer::SourceType::Object) {
  SetType(type_);
}

void Object::Init(const gd::Object& object) {
  CopyWithoutConfiguration(object);
  configuration = object.configuration->Clone();
}

void Object::CopyWithoutConfiguration(const gd::Object& object) {
  persistentUuid = object.persistentUuid;
  name = object.name;
  assetStoreId = object.assetStoreId;
  objectVariables = object.objectVariables;
  effectsContainer = object.effectsContainer;
  behaviors = object.behaviors;
}

gd::ObjectConfiguration& Object::GetConfiguration() { return *configuration; }

const gd::ObjectConfiguration& Object::GetConfiguration() const {
  return *configuration;
}

std::vector<gd::String> Object::GetAllBehaviorNames() const {
  return behaviors.GetAllBehaviorNames();
}

void Object::RemoveBehavior(const gd::String& name) { behaviors.RemoveBehavior(name); }

bool Object::RenameBehavior(const gd::String& name, const gd::String& newName) {
  return behaviors.RenameBehavior(name, newName);
}

gd::Behavior& Object::GetBehavior(const gd::String& name) {
  return behaviors.GetBehavior(name);
}

const gd::Behavior& Object::GetBehavior(const gd::String& name) const {
  return behaviors.GetBehavior(name);
}

bool Object::HasBehaviorNamed(const gd::String& name) const {
  return behaviors.HasBehaviorNamed(name);
}

gd::Behavior* Object::AddNewBehavior(const gd::Project& project,
                                     const gd::String& type,
                                     const gd::String& name) {
  return behaviors.AddNewBehavior(project, type, name);
}

void Object::UnserializeFrom(gd::Project& project,
                             const SerializerElement& element) {
  persistentUuid = element.GetStringAttribute("persistentUuid");

  SetType(element.GetStringAttribute("type"));
  assetStoreId = element.GetStringAttribute("assetStoreId");
  name = element.GetStringAttribute("name", name, "nom");

  objectVariables.UnserializeFrom(
      element.GetChild("variables", 0, "Variables"));

  if (element.HasChild("effects")) {
    const SerializerElement& effectsElement = element.GetChild("effects");
    effectsContainer.UnserializeFrom(effectsElement);
  }

  // Compatibility with GD <= 3.3
  if (element.HasChild("Automatism")) {
    for (std::size_t i = 0; i < element.GetChildrenCount("Automatism"); ++i) {
      SerializerElement &behaviorElement = element.GetChild("Automatism", i);

      gd::String type = behaviorElement.GetStringAttribute("type", "", "Type")
                            .FindAndReplace("Automatism", "Behavior");
      gd::String name = behaviorElement.GetStringAttribute("name", "", "Name");

      auto behavior = gd::Object::AddNewBehavior(project, type, name);
      behavior->UnserializeFrom(behaviorElement);
    }
  }
  // End of compatibility code
  else {
    SerializerElement &behaviorsElement =
        element.GetChild("behaviors", 0, "automatisms");
    behaviors.UnserializeFrom(project, behaviorsElement);
  }

  configuration->UnserializeFrom(project, element);
}

void Object::SerializeTo(SerializerElement& element) const {
  if (!persistentUuid.empty())
    element.SetStringAttribute("persistentUuid", persistentUuid);

  element.SetAttribute("name", GetName());
  element.SetAttribute("assetStoreId", GetAssetStoreId());
  element.SetAttribute("type", GetType());
  objectVariables.SerializeTo(element.AddChild("variables"));
  effectsContainer.SerializeTo(element.AddChild("effects"));
  behaviors.SerializeTo(element.AddChild("behaviors"));
  configuration->SerializeTo(element);
}

Object& Object::ResetPersistentUuid() {
  persistentUuid = UUID::MakeUuid4();
  objectVariables.ResetPersistentUuid();

  return *this;
}

Object& Object::ClearPersistentUuid() {
  persistentUuid = "";
  objectVariables.ClearPersistentUuid();

  return *this;
}

}  // namespace gd
