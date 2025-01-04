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
#include "GDCore/Extensions/PlatformExtension.h"

namespace gd {

EventsFunctionsExtension::EventsFunctionsExtension() :
    gd::EventsFunctionsContainer(
        gd::EventsFunctionsContainer::FunctionOwner::Extension),
      globalVariables(gd::VariablesContainer::SourceType::ExtensionGlobal),
      sceneVariables(gd::VariablesContainer::SourceType::ExtensionScene) {}

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
  globalVariables = other.GetGlobalVariables();
  sceneVariables = other.GetSceneVariables();
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

  if (!sourceFiles.empty()) {
    auto& sourceFilesElement = element.AddChild("sourceFiles");
    sourceFilesElement.ConsiderAsArray();
    for (auto& sourceFile : sourceFiles)
      sourceFile.SerializeTo(sourceFilesElement.AddChild(""));
  }

  GetGlobalVariables().SerializeTo(element.AddChild("globalVariables"));
  GetSceneVariables().SerializeTo(element.AddChild("sceneVariables"));

  SerializeEventsFunctionsTo(element.AddChild("eventsFunctions"));
  eventsBasedBehaviors.SerializeElementsTo(
      "eventsBasedBehavior", element.AddChild("eventsBasedBehaviors"));
  eventsBasedObjects.SerializeElementsTo(
      "eventsBasedObject", element.AddChild("eventsBasedObjects"));
}

void EventsFunctionsExtension::UnserializeFrom(
    gd::Project& project, const SerializerElement& element) {
  // Unserialize first the "declaration" (everything but objects content)
  // so that objects can be then unserialized in proper order (they can depend
  // on each others)
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

  sourceFiles.clear();
  if (element.HasChild("sourceFiles")) {
    const auto& sourceFilesElement = element.GetChild("sourceFiles");
    sourceFilesElement.ConsiderAsArray();
    for (size_t i = 0; i < sourceFilesElement.GetChildrenCount(); ++i) {
      SourceFileMetadata sourceFile;
      sourceFile.UnserializeFrom(sourceFilesElement.GetChild(i));
      sourceFiles.push_back(sourceFile);
    }
  }

  globalVariables.UnserializeFrom(element.GetChild("globalVariables"));
  sceneVariables.UnserializeFrom(element.GetChild("sceneVariables"));

  // Only unserialize behaviors and objects names.
  // As event based objects can contains objects using CustomBehavior and/or
  // CustomObject, this allows them to reference EventBasedBehavior and
  // EventBasedObject respectively.
  eventsBasedBehaviors.Clear();
  auto &behaviorsElement = element.GetChild("eventsBasedBehaviors");
  behaviorsElement.ConsiderAsArrayOf("eventsBasedBehavior");
  for (std::size_t i = 0; i < behaviorsElement.GetChildrenCount(); ++i) {
    const gd::String &behaviorName =
        behaviorsElement.GetChild(i).GetStringAttribute("name");
    eventsBasedBehaviors.InsertNew(behaviorName, eventsBasedBehaviors.GetCount());
  }
  eventsBasedObjects.Clear();
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

  auto &eventsBasedObjectsElement = element.GetChild("eventsBasedObjects");
  eventsBasedObjectsElement.ConsiderAsArrayOf("eventsBasedObject");
  for (gd::String &eventsBasedObjectName :
       GetUnserializingOrderEventsBasedObjectNames(eventsBasedObjectsElement)) {
    size_t extensionIndex = eventsBasedObjects.GetPosition(
        eventsBasedObjects.Get(eventsBasedObjectName));
    const SerializerElement &eventsBasedObjectElement =
        eventsBasedObjectsElement.GetChild(extensionIndex);

    eventsBasedObjects.at(extensionIndex)
        .UnserializeFrom(project, eventsBasedObjectElement);
  }
}

std::vector<gd::String>
EventsFunctionsExtension::GetUnserializingOrderEventsBasedObjectNames(
    const gd::SerializerElement &eventsBasedObjectsElement) {

  // Child-objects need the event-based objects they use to be loaded completely
  // before they are unserialized.

  // At the beginning, everything is yet to be loaded.
  std::vector<gd::String> remainingEventsBasedObjectNames(
      eventsBasedObjects.size());
  for (std::size_t i = 0; i < eventsBasedObjects.size(); ++i) {
    remainingEventsBasedObjectNames[i] = eventsBasedObjects.at(i).GetName();
  }

  // Helper allowing to find if an object depends on at least one other object from
  // the extension that is not loaded yet.
  auto &extensionName = name;
  auto isDependentFromRemainingEventsBasedObjects =
      [&remainingEventsBasedObjectNames,
       &extensionName](const gd::SerializerElement &eventsBasedObjectElement) {
        auto &objectsElement = eventsBasedObjectElement.GetChild("objects");
        objectsElement.ConsiderAsArrayOf("object");

        for (std::size_t objectIndex = 0;
             objectIndex < objectsElement.GetChildrenCount(); ++objectIndex) {
          const gd::String &objectType =
              objectsElement.GetChild(objectIndex).GetStringAttribute("type");

          gd::String usedExtensionName =
              PlatformExtension::GetExtensionFromFullObjectType(objectType);
          if (usedExtensionName != extensionName) {
            // The object comes from another extension: the project is already responsible
            // for loading extensions in the proper order.
            continue;
          }
          gd::String eventsBasedObjectName =
              gd::PlatformExtension::GetObjectNameFromFullObjectType(
                  objectType);

          if (std::find(remainingEventsBasedObjectNames.begin(),
                        remainingEventsBasedObjectNames.end(),
                        eventsBasedObjectName) !=
              remainingEventsBasedObjectNames.end()) {
            return true;
          }
        }
        return false;
      };

  // Find the order of loading so that the objects are loaded when all the objects
  // they depend on are already loaded.
  std::vector<gd::String> loadOrderEventsBasedObjectNames;
  bool foundAnyEventsBasedObject = true;
  while (foundAnyEventsBasedObject) {
    foundAnyEventsBasedObject = false;
    for (std::size_t i = 0; i < remainingEventsBasedObjectNames.size(); ++i) {
      auto eventsBasedObjectName = remainingEventsBasedObjectNames[i];
      size_t extensionIndex = eventsBasedObjects.GetPosition(
          eventsBasedObjects.Get(eventsBasedObjectName));
      const SerializerElement &eventsBasedObjectElement =
          eventsBasedObjectsElement.GetChild(extensionIndex);

      if (!isDependentFromRemainingEventsBasedObjects(
              eventsBasedObjectElement)) {
        loadOrderEventsBasedObjectNames.push_back(eventsBasedObjectName);
        remainingEventsBasedObjectNames.erase(
            remainingEventsBasedObjectNames.begin() + i);
        i--;
        foundAnyEventsBasedObject = true;
      }
    }
  }
  return loadOrderEventsBasedObjectNames;
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
