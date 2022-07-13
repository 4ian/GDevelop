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
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Project/PropertyDescriptor.h"

namespace gd {

Object::~Object() {}

Object::Object(const gd::String& name_) : name(name_) {}

void Object::Init(const gd::Object& object) {
  name = object.name;
  assetStoreId = object.assetStoreId;
  type = object.type;
  objectVariables = object.objectVariables;
  tags = object.tags;
  effectsContainer = object.effectsContainer;

  behaviors.clear();
  for (auto& it : object.behaviors) {
    behaviors[it.first] = gd::make_unique<gd::BehaviorContent>(*it.second);
  }
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

  std::unique_ptr<BehaviorContent> aut =
      std::move(behaviors.find(name)->second);
  behaviors.erase(name);
  behaviors[newName] = std::move(aut);
  behaviors[newName]->SetName(newName);

  return true;
}

gd::BehaviorContent& Object::GetBehavior(const gd::String& name) {
  return *behaviors.find(name)->second;
}

const gd::BehaviorContent& Object::GetBehavior(const gd::String& name) const {
  return *behaviors.find(name)->second;
}

bool Object::HasBehaviorNamed(const gd::String& name) const {
  return behaviors.find(name) != behaviors.end();
}

gd::BehaviorContent& Object::AddBehavior(
    const gd::BehaviorContent& behaviorContent) {
  const gd::String& behaviorName = behaviorContent.GetName();
  auto newBehaviorContent =
      gd::make_unique<gd::BehaviorContent>(behaviorContent);
  behaviors[behaviorName] = std::move(newBehaviorContent);
  return *behaviors[behaviorName];
}

std::map<gd::String, gd::PropertyDescriptor> Object::GetProperties() const {
  std::map<gd::String, gd::PropertyDescriptor> nothing;
  return nothing;
}

gd::BehaviorContent* Object::AddNewBehavior(const gd::Project& project,
                                            const gd::String& type,
                                            const gd::String& name) {
  const gd::BehaviorMetadata& behaviorMetadata =
      gd::MetadataProvider::GetBehaviorMetadata(project.GetCurrentPlatform(),
                                                type);
  if (gd::MetadataProvider::IsBadBehaviorMetadata(behaviorMetadata)) {
    return nullptr;
  }

  auto behaviorContent = gd::make_unique<gd::BehaviorContent>(name, type);
  behaviorMetadata.Get().InitializeContent(behaviorContent->GetContent());
  behaviors[name] = std::move(behaviorContent);
  return behaviors[name].get();
}

std::map<gd::String, gd::PropertyDescriptor>
Object::GetInitialInstanceProperties(const gd::InitialInstance& instance,
                                     gd::Project& project,
                                     gd::Layout& layout) {
  std::map<gd::String, gd::PropertyDescriptor> nothing;
  return nothing;
}

void Object::UnserializeFrom(gd::Project& project,
                             const SerializerElement& element) {
  type = element.GetStringAttribute("type");
  assetStoreId = element.GetStringAttribute("assetStoreId");
  name = element.GetStringAttribute("name", name, "nom");
  tags = element.GetStringAttribute("tags");

  objectVariables.UnserializeFrom(
      element.GetChild("variables", 0, "Variables"));
  behaviors.clear();

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

      auto behaviorContent = gd::make_unique<gd::BehaviorContent>(name, type);
      behaviorContent->UnserializeFrom(behaviorElement);
      behaviors[name] = std::move(behaviorContent);
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

      auto behaviorContent = gd::make_unique<gd::BehaviorContent>(name, type);
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

        behaviorContent->UnserializeFrom(contentElement);
      }
      // end of compatibility code
      else {
        behaviorContent->UnserializeFrom(behaviorElement);
      }
      behaviors[name] = std::move(behaviorContent);
    }
  }

  DoUnserializeFrom(project, element);
}

void Object::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("name", GetName());
  element.SetAttribute("assetStoreId", GetAssetStoreId());
  element.SetAttribute("type", GetType());
  element.SetAttribute("tags", GetTags());
  objectVariables.SerializeTo(element.AddChild("variables"));
  effectsContainer.SerializeTo(element.AddChild("effects"));

  SerializerElement& behaviorsElement = element.AddChild("behaviors");
  behaviorsElement.ConsiderAsArrayOf("behavior");
  std::vector<gd::String> allBehaviors = GetAllBehaviorNames();
  for (std::size_t i = 0; i < allBehaviors.size(); ++i) {
    const gd::BehaviorContent& behaviorContent = GetBehavior(allBehaviors[i]);
    SerializerElement& behaviorElement = behaviorsElement.AddChild("behavior");

    behaviorContent.SerializeTo(behaviorElement);
    behaviorElement.RemoveChild("type");  // The content can contain type or
                                          // name properties, remove them.
    behaviorElement.RemoveChild("name");
    behaviorElement.SetAttribute("type", behaviorContent.GetTypeName());
    behaviorElement.SetAttribute("name", behaviorContent.GetName());
  }

  DoSerializeTo(element);
}

}  // namespace gd
