/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/BehaviorsContainer.h"

#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/CustomBehavior.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Project/QuickCustomization.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/UUID/UUID.h"

namespace gd {

BehaviorsContainer::~BehaviorsContainer() {}

BehaviorsContainer::BehaviorsContainer(bool isOverriding_)
    : isOverriding(isOverriding_) {}

void BehaviorsContainer::Init(const gd::BehaviorsContainer &behaviorsContainer) {
  isOverriding = behaviorsContainer.isOverriding;
  behaviors = gd::Clone(behaviorsContainer.behaviors);
}

std::vector<gd::String> BehaviorsContainer::GetAllBehaviorNames() const {
  std::vector<gd::String> allNameIdentifiers;

  for (auto &it : behaviors)
    allNameIdentifiers.push_back(it.first);

  return allNameIdentifiers;
}

void BehaviorsContainer::RemoveBehavior(const gd::String &name) {
  behaviors.erase(name);
}

bool BehaviorsContainer::RenameBehavior(const gd::String &name,
                                        const gd::String &newName) {
  if (behaviors.find(name) == behaviors.end() ||
      behaviors.find(newName) != behaviors.end())
    return false;

  std::unique_ptr<Behavior> aut = std::move(behaviors.find(name)->second);
  behaviors.erase(name);
  behaviors[newName] = std::move(aut);
  behaviors[newName]->SetName(newName);

  return true;
}

gd::Behavior &BehaviorsContainer::GetBehavior(const gd::String &name) {
  return *behaviors.find(name)->second;
}

const gd::Behavior &
BehaviorsContainer::GetBehavior(const gd::String &name) const {
  return *behaviors.find(name)->second;
}

bool BehaviorsContainer::HasBehaviorNamed(const gd::String &name) const {
  return behaviors.find(name) != behaviors.end();
}

gd::Behavior *BehaviorsContainer::AddNewBehavior(const gd::Project &project,
                                                 const gd::String &type,
                                                 const gd::String &name) {
  auto initializeAndAdd = [this,
                           &name](std::unique_ptr<gd::Behavior> behavior) {
    if (isOverriding) {
      // We don't call the Initialize method for behavior overridings because they
      // should have no property value initially.
      behavior->ClearContent();
    }
    else {
      behavior->InitializeContent();
    }
    this->behaviors[name] = std::move(behavior);
    return this->behaviors[name].get();
  };

  if (project.HasEventsBasedBehavior(type)) {
    return initializeAndAdd(
        gd::make_unique<CustomBehavior>(name, project, type));
  } else {
    const gd::BehaviorMetadata &behaviorMetadata =
        gd::MetadataProvider::GetBehaviorMetadata(project.GetCurrentPlatform(),
                                                  type);
    if (gd::MetadataProvider::IsBadBehaviorMetadata(behaviorMetadata)) {
      gd::LogWarning("Tried to create a behavior with an unknown type: " +
                     type);
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

void BehaviorsContainer::UnserializeFrom(gd::Project &project,
                                         const SerializerElement &element) {
  element.ConsiderAsArrayOf("behavior", "automatism");
  for (std::size_t i = 0; i < element.GetChildrenCount(); ++i) {
    SerializerElement &behaviorElement = element.GetChild(i);

    gd::String type = behaviorElement.GetStringAttribute("type").FindAndReplace(
        "Automatism", "Behavior"); // Compatibility with GD <= 4
    gd::String name = behaviorElement.GetStringAttribute("name");

    auto behavior = gd::BehaviorsContainer::AddNewBehavior(project, type, name);
    // Compatibility with GD <= 4.0.98
    // If there is only one child called "content" (in addition to "type" and
    // "name"), it's the content of a JavaScript behavior. Move the content
    // out of the "content" object (to put it directly at the root of the
    // behavior element).
    if (behaviorElement.HasChild("content") &&
        behaviorElement.GetAllChildren().size() == 3) {
      SerializerElement &contentElement = behaviorElement.GetChild("content");

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

    bool isFolded = behaviorElement.GetBoolAttribute("isFolded", false);
    behavior->SetFolded(isFolded);

    // Handle Quick Customization info.
    if (behaviorElement.HasChild("propertiesQuickCustomizationVisibilities")) {
      behavior->GetPropertiesQuickCustomizationVisibilities().UnserializeFrom(
          behaviorElement.GetChild("propertiesQuickCustomizationVisibilities"));
    }
    if (behaviorElement.HasChild("quickCustomizationVisibility")) {
      behavior->SetQuickCustomizationVisibility(
          QuickCustomization::StringAsVisibility(
              behaviorElement.GetStringAttribute(
                  "quickCustomizationVisibility")));
    }
  }
}

void BehaviorsContainer::SerializeTo(SerializerElement &element) const {
  element.ConsiderAsArrayOf("behavior");
  std::vector<gd::String> allBehaviors = GetAllBehaviorNames();
  for (std::size_t i = 0; i < allBehaviors.size(); ++i) {
    const gd::Behavior &behavior = GetBehavior(allBehaviors[i]);
    // Default behaviors are added at the object creation according to
    // metadata. They don't need to be serialized.
    // During the export, all behaviors are set as not default by
    // `BehaviorDefaultFlagClearer` because the Runtime needs all the behaviors.
    if (behavior.IsDefaultBehavior()) {
      continue;
    }
    SerializerElement &behaviorElement = element.AddChild("behavior");

    behavior.SerializeTo(behaviorElement);
    behaviorElement.RemoveChild("type"); // The content can contain type or
                                         // name properties, remove them.
    behaviorElement.RemoveChild("name");
    behaviorElement.RemoveChild("isFolded");
    behaviorElement.SetAttribute("type", behavior.GetTypeName());
    behaviorElement.SetAttribute("name", behavior.GetName());
    if (behavior.IsFolded())
      behaviorElement.SetAttribute("isFolded", true);

    // Handle Quick Customization info.
    behaviorElement.RemoveChild("propertiesQuickCustomizationVisibilities");
    const QuickCustomizationVisibilitiesContainer
        &propertiesQuickCustomizationVisibilities =
            behavior.GetPropertiesQuickCustomizationVisibilities();
    if (!propertiesQuickCustomizationVisibilities.IsEmpty()) {
      propertiesQuickCustomizationVisibilities.SerializeTo(
          behaviorElement.AddChild("propertiesQuickCustomizationVisibilities"));
    }
    const QuickCustomization::Visibility visibility =
        behavior.GetQuickCustomizationVisibility();
    if (visibility != QuickCustomization::Visibility::Default) {
      behaviorElement.SetAttribute(
          "quickCustomizationVisibility",
          QuickCustomization::VisibilityAsString(visibility));
    }
  }
}

} // namespace gd
