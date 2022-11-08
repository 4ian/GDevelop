/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventsFunctionsExtension.h"

#include "EventsBasedBehavior.h"
#include "EventsBasedObject.h"
#include "EventsFunction.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/MakeUnique.h"

namespace gd {

EventsFunctionsExtension::EventsFunctionsExtension() :
    gd::EventsFunctionsContainer(
        gd::EventsFunctionsContainer::FunctionOwner::Extension) {}

EventsFunctionsExtension::EventsFunctionsExtension(
    const EventsFunctionsExtension& other) :
    gd::EventsFunctionsContainer(
        gd::EventsFunctionsContainer::FunctionOwner::Extension) {
  Init(other);
}

EventsFunctionsExtension& EventsFunctionsExtension::operator=(
    const EventsFunctionsExtension& other) {
  if (this != &other) Init(other);

  return *this;
}

void EventsFunctionsExtension::Init(const gd::EventsFunctionsExtension& other) {
  version = other.version;
  extensionNamespace = other.extensionNamespace;
  shortDescription = other.shortDescription;
  description = other.description;
  name = other.name;
  fullName = other.fullName;
  category = other.category;
  tags = other.tags;
  author = other.author;
  authorIds = other.authorIds;
  previewIconUrl = other.previewIconUrl;
  iconUrl = other.iconUrl;
  helpPath = other.helpPath;
  EventsFunctionsContainer::Init(other);
  eventsBasedBehaviors = other.eventsBasedBehaviors;
  eventsBasedObjects = other.eventsBasedObjects;
}

void EventsFunctionsExtension::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("version", version);
  element.SetAttribute("extensionNamespace", extensionNamespace);
  element.SetAttribute("shortDescription", shortDescription);
  element.AddChild("description").SetMultilineStringValue(description);
  element.SetAttribute("name", name);
  element.SetAttribute("fullName", fullName);
  element.SetAttribute("category", category);
  if (!originName.empty() || !originIdentifier.empty()) {
    element.AddChild("origin")
        .SetAttribute("name", originName)
        .SetAttribute("identifier", originIdentifier);
  }
  auto& tagsElement = element.AddChild("tags");
  tagsElement.ConsiderAsArray();
  for (const auto& tag : tags) {
    tagsElement.AddChild("").SetStringValue(tag);
  }
  auto& authorIdsElement = element.AddChild("authorIds");
  authorIdsElement.ConsiderAsArray();
  for (const auto& authorId : authorIds) {
    authorIdsElement.AddChild("").SetStringValue(authorId);
  }
  element.SetAttribute("author", author);
  element.SetAttribute("previewIconUrl", previewIconUrl);
  element.SetAttribute("iconUrl", iconUrl);
  element.SetAttribute("helpPath", helpPath);
  auto& dependenciesElement = element.AddChild("dependencies");
  dependenciesElement.ConsiderAsArray();
  for (auto& dependency : dependencies)
    SerializeDependencyTo(dependency, dependenciesElement.AddChild(""));

  SerializeEventsFunctionsTo(element.AddChild("eventsFunctions"));
  eventsBasedBehaviors.SerializeElementsTo(
      "eventsBasedBehavior", element.AddChild("eventsBasedBehaviors"));
  eventsBasedObjects.SerializeElementsTo(
      "eventsBasedObject", element.AddChild("eventsBasedObjects"));
}

void EventsFunctionsExtension::UnserializeFrom(
    gd::Project& project, const SerializerElement& element) {
      UnserializeExtensionDeclarationFrom(project, element);
      UnserializeExtensionImplementationFrom(project, element);
}

void EventsFunctionsExtension::UnserializeExtensionDeclarationFrom(
    gd::Project& project, const SerializerElement& element) {
  version = element.GetStringAttribute("version");
  extensionNamespace = element.GetStringAttribute("extensionNamespace");
  shortDescription = element.GetStringAttribute("shortDescription");
  description = element.GetChild("description").GetMultilineStringValue();
  name = element.GetStringAttribute("name");
  fullName = element.GetStringAttribute("fullName");
  category = element.GetStringAttribute("category");
  author = element.GetStringAttribute("author");
  previewIconUrl = element.GetStringAttribute("previewIconUrl");
  iconUrl = element.GetStringAttribute("iconUrl");
  helpPath = element.GetStringAttribute("helpPath");

  if (element.HasChild("origin")) {
    gd::String originName =
        element.GetChild("origin").GetStringAttribute("name", "");
    gd::String originIdentifier =
        element.GetChild("origin").GetStringAttribute("identifier", "");
    SetOrigin(originName, originIdentifier);
  }

  tags.clear();
  auto& tagsElement = element.GetChild("tags");
  if (!tagsElement.IsValueUndefined()) {
    // Compatibility with GD <= 5.0.0-beta102
    gd::String tagsAsString = tagsElement.GetStringValue();
    tags = tagsAsString.Split(',');
    for (auto& tag : tags) {
      tag = tag.Trim();
    }
    // end of compatibility code
  } else {
    tagsElement.ConsiderAsArray();
    for (std::size_t i = 0; i < tagsElement.GetChildrenCount(); ++i) {
      tags.push_back(tagsElement.GetChild(i).GetStringValue());
    }
  }

  authorIds.clear();
  auto& authorIdsElement = element.GetChild("authorIds");
  authorIdsElement.ConsiderAsArray();
  for (std::size_t i = 0; i < authorIdsElement.GetChildrenCount(); ++i) {
    authorIds.push_back(authorIdsElement.GetChild(i).GetStringValue());
  }

  dependencies.clear();
  const auto& dependenciesElement = element.GetChild("dependencies");
  dependenciesElement.ConsiderAsArray();
  for (size_t i = 0; i < dependenciesElement.GetChildrenCount(); ++i)
    dependencies.push_back(
        UnserializeDependencyFrom(dependenciesElement.GetChild(i)));

  // Only unserialize behaviors and objects names.
  // As event based objects can contains objects using CustomBehavior and/or
  // CustomObject, this allows them to reference EventBasedBehavior and
  // EventBasedObject respectively.
  auto &behaviorsElement = element.GetChild("eventsBasedBehaviors");
  behaviorsElement.ConsiderAsArrayOf("eventsBasedBehavior");
  for (std::size_t i = 0; i < behaviorsElement.GetChildrenCount(); ++i) {
    const gd::String &behaviorName =
        behaviorsElement.GetChild(i).GetStringAttribute("name");
    eventsBasedBehaviors.InsertNew(behaviorName, eventsBasedBehaviors.GetCount());
  }
  auto &objectsElement = element.GetChild("eventsBasedObjects");
  objectsElement.ConsiderAsArrayOf("eventsBasedObject");
  for (std::size_t i = 0; i < objectsElement.GetChildrenCount(); ++i) {
    const gd::String &objectName =
        objectsElement.GetChild(i).GetStringAttribute("name");
    eventsBasedObjects.InsertNew(objectName, eventsBasedObjects.GetCount());
  }
}

void EventsFunctionsExtension::UnserializeExtensionImplementationFrom(
    gd::Project& project,
    const SerializerElement& element) {
  UnserializeEventsFunctionsFrom(project, element.GetChild("eventsFunctions"));
  eventsBasedBehaviors.UnserializeElementsFrom(
      "eventsBasedBehavior", project, element.GetChild("eventsBasedBehaviors"));
  eventsBasedObjects.UnserializeElementsFrom(
      "eventsBasedObject", project, element.GetChild("eventsBasedObjects"));
}

bool EventsFunctionsExtension::IsExtensionLifecycleEventsFunction(
    const gd::String& eventsFunctionName) {
  // The list of all supported lifecycle events function names.
  // If adding a new one, code generator(s) must be updated.
  return eventsFunctionName == "onFirstSceneLoaded" ||
         eventsFunctionName == "onSceneLoaded" ||
         eventsFunctionName == "onScenePreEvents" ||
         eventsFunctionName == "onScenePostEvents" ||
         eventsFunctionName == "onScenePaused" ||
         eventsFunctionName == "onSceneResumed" ||
         eventsFunctionName == "onSceneUnloading";
}

}  // namespace gd
