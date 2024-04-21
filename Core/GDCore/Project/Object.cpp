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
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/UUID/UUID.h"

namespace gd {

Object::~Object() {}

Object::Object(const gd::String& name_,
               const gd::String& type_,
               std::unique_ptr<gd::ObjectConfiguration> configuration_)
    : name(name_), configuration(std::move(configuration_)) {
      SetType(type_);
    }

Object::Object(const gd::String& name_,
               const gd::String& type_,
               gd::ObjectConfiguration* configuration_)
    : name(name_), configuration(configuration_) {
      SetType(type_);
    }

void Object::Init(const gd::Object& object) {
  persistentUuid = object.persistentUuid;
  name = object.name;
  assetStoreId = object.assetStoreId;
  objectVariables = object.objectVariables;
  effectsContainer = object.effectsContainer;

  behaviors.clear();
  for (auto& it : object.behaviors) {
    behaviors[it.first] = gd::make_unique<gd::Behavior>(*it.second);
  }

  configuration = object.configuration->Clone();
}

gd::ObjectConfiguration& Object::GetConfiguration() {
  return *configuration;
}

const gd::ObjectConfiguration& Object::GetConfiguration() const {
  return *configuration;
}

std::vector<gd::String> Object::GetAllBehaviorNames() const {
  std::vector<gd::String> allNameIdentifiers;

  for (auto& it : behaviors) allNameIdentifiers.push_back(it.first);

  return allNameIdentifiers;
}

void Object::RemoveBehavior(const gd::String& name) { behaviors.erase(name); }

bool Object::RenameBehavior(const gd::String& name, const gd::String& newName) {
  if (behaviors.find(name) == behaviors.end() ||
      behaviors.find(newName) != behaviors.end())
    return false;

  std::unique_ptr<Behavior> aut =
      std::move(behaviors.find(name)->second);
  behaviors.erase(name);
  behaviors[newName] = std::move(aut);
  behaviors[newName]->SetName(newName);

  return true;
}

gd::Behavior& Object::GetBehavior(const gd::String& name) {
  return *behaviors.find(name)->second;
}

const gd::Behavior& Object::GetBehavior(const gd::String& name) const {
  return *behaviors.find(name)->second;
}

bool Object::HasBehaviorNamed(const gd::String& name) const {
  return behaviors.find(name) != behaviors.end();
}

gd::Behavior* Object::AddNewBehavior(const gd::Project& project,
                                            const gd::String& type,
                                            const gd::String& name) {
  auto initializeAndAdd =
      [this, &name](std::unique_ptr<gd::Behavior> behavior) {
    behavior->InitializeContent();
    this->behaviors[name] = std::move(behavior);
    return this->behaviors[name].get();
  };

  if (project.HasEventsBasedBehavior(type)) {
    return initializeAndAdd(
        gd::make_unique<CustomBehavior>(name, project, type));
  }
  else {
    const gd::BehaviorMetadata& behaviorMetadata =
        gd::MetadataProvider::GetBehaviorMetadata(project.GetCurrentPlatform(),
                                                  type);
    if (gd::MetadataProvider::IsBadBehaviorMetadata(behaviorMetadata)) {
      gd::LogWarning("Tried to create a behavior with an unknown type: " + type
                     + " on object " + GetName() + "!");
    // It's probably an events-based behavior that was removed.
    // Create a custom behavior to preserve the properties values.
    return initializeAndAdd(
        gd::make_unique<CustomBehavior>(name, project, type));
    }
    std::unique_ptr<gd::Behavior> behavior(behaviorMetadata.Get().Clone());
    behavior->SetName(name);
    return initializeAndAdd(std::move(behavior));
  }
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
      SerializerElement& behaviorElement = element.GetChild("Automatism", i);

      gd::String type = behaviorElement.GetStringAttribute("type", "", "Type")
                            .FindAndReplace("Automatism", "Behavior");
      gd::String name = behaviorElement.GetStringAttribute("name", "", "Name");

      auto behavior = gd::Object::AddNewBehavior(project, type, name);
      behavior->UnserializeFrom(behaviorElement);
    }
  }
  // End of compatibility code
  else {
    SerializerElement& behaviorsElement =
        element.GetChild("behaviors", 0, "automatisms");
    behaviorsElement.ConsiderAsArrayOf("behavior", "automatism");
    for (std::size_t i = 0; i < behaviorsElement.GetChildrenCount(); ++i) {
      SerializerElement& behaviorElement = behaviorsElement.GetChild(i);

      gd::String type =
          behaviorElement.GetStringAttribute("type").FindAndReplace(
              "Automatism", "Behavior");  // Compatibility with GD <= 4
      gd::String name = behaviorElement.GetStringAttribute("name");

      auto behavior = gd::Object::AddNewBehavior(project, type, name);
      // Compatibility with GD <= 4.0.98
      // If there is only one child called "content" (in addition to "type" and
      // "name"), it's the content of a JavaScript behavior. Move the content
      // out of the "content" object (to put it directly at the root of the
      // behavior element).
      if (behaviorElement.HasChild("content") &&
          behaviorElement.GetAllChildren().size() == 3) {
        SerializerElement& contentElement = behaviorElement.GetChild("content");

        // Physics2 Behavior was using "type" for the type of the body. The name
        // conflicts with the behavior "type". Rename it.
        if (contentElement.HasChild("type")) {
          contentElement.AddChild("bodyType")
              .SetValue(contentElement.GetChild("type").GetStringValue());
          contentElement.RemoveChild("type");
        }

        behavior->UnserializeFrom(contentElement);
      }
      // end of compatibility code
      else {
        behavior->UnserializeFrom(behaviorElement);
      }
    }
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

  SerializerElement& behaviorsElement = element.AddChild("behaviors");
  behaviorsElement.ConsiderAsArrayOf("behavior");
  std::vector<gd::String> allBehaviors = GetAllBehaviorNames();
  for (std::size_t i = 0; i < allBehaviors.size(); ++i) {
    const gd::Behavior& behavior = GetBehavior(allBehaviors[i]);
    // Default behaviors are added at the object creation according to metadata.
    // They don't need to be serialized.
    if (behavior.IsDefaultBehavior()) {
      continue;
    }
    SerializerElement& behaviorElement = behaviorsElement.AddChild("behavior");

    behavior.SerializeTo(behaviorElement);
    behaviorElement.RemoveChild("type");  // The content can contain type or
                                          // name properties, remove them.
    behaviorElement.RemoveChild("name");
    behaviorElement.SetAttribute("type", behavior.GetTypeName());
    behaviorElement.SetAttribute("name", behavior.GetName());
  }

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
