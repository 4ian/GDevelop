/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "Layout.h"

#include <algorithm>
#include <vector>

#include "GDCore/CommonTools.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/IDE/SceneNameMangler.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/Project/CustomBehaviorsSharedData.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Project/Layer.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectGroup.h"
#include "GDCore/Project/ObjectGroupsContainer.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"
#include "GDCore/Tools/PolymorphicClone.h"
#include "GDCore/Tools/Log.h"

using namespace std;

namespace gd {

gd::Layer Layout::badLayer;
gd::BehaviorsSharedData Layout::badBehaviorSharedData("", "");

Layout::Layout(const Layout& other) { Init(other); }

Layout& Layout::operator=(const Layout& other) {
  if (this != &other) Init(other);

  return *this;
}

Layout::~Layout(){};

Layout::Layout()
    : backgroundColorR(209),
      backgroundColorG(209),
      backgroundColorB(209),
      stopSoundsOnStartup(true),
      standardSortMethod(true),
      disableInputWhenNotFocused(true),
      profiler(NULL)
{
  gd::Layer layer;
  layer.SetCameraCount(1);
  initialLayers.push_back(layer);
}

void Layout::SetName(const gd::String& name_) {
  name = name_;
  mangledName = gd::SceneNameMangler::Get()->GetMangledSceneName(name);
};

bool Layout::HasBehaviorSharedData(const gd::String& behaviorName) {
  return behaviorsSharedData.find(behaviorName) != behaviorsSharedData.end();
}

std::vector<gd::String> Layout::GetAllBehaviorSharedDataNames() const {
  std::vector<gd::String> allNames;

  for (auto& it : behaviorsSharedData) allNames.push_back(it.first);

  return allNames;
}

const gd::BehaviorsSharedData& Layout::GetBehaviorSharedData(
    const gd::String& behaviorName) const {
  auto it = behaviorsSharedData.find(behaviorName);
  if (it != behaviorsSharedData.end()) return *it->second;

  return badBehaviorSharedData;
}

gd::BehaviorsSharedData& Layout::GetBehaviorSharedData(
    const gd::String& behaviorName) {
  auto it = behaviorsSharedData.find(behaviorName);
  if (it != behaviorsSharedData.end()) return *it->second;

  return badBehaviorSharedData;
}

const std::map<gd::String, std::unique_ptr<gd::BehaviorsSharedData> >&
Layout::GetAllBehaviorSharedData() const {
  return behaviorsSharedData;
}

gd::Layer& Layout::GetLayer(const gd::String& name) {
  std::vector<gd::Layer>::iterator layer =
      find_if(initialLayers.begin(),
              initialLayers.end(),
              bind2nd(gd::LayerHasName(), name));

  if (layer != initialLayers.end()) return *layer;

  return badLayer;
}

const gd::Layer& Layout::GetLayer(const gd::String& name) const {
  std::vector<gd::Layer>::const_iterator layer =
      find_if(initialLayers.begin(),
              initialLayers.end(),
              bind2nd(gd::LayerHasName(), name));

  if (layer != initialLayers.end()) return *layer;

  return badLayer;
}

gd::Layer& Layout::GetLayer(std::size_t index) { return initialLayers[index]; }

const gd::Layer& Layout::GetLayer(std::size_t index) const {
  return initialLayers[index];
}

std::size_t Layout::GetLayersCount() const { return initialLayers.size(); }

#if defined(GD_IDE_ONLY)
bool Layout::HasLayerNamed(const gd::String& name) const {
  return (find_if(initialLayers.begin(),
                  initialLayers.end(),
                  bind2nd(gd::LayerHasName(), name)) != initialLayers.end());
}
std::size_t Layout::GetLayerPosition(const gd::String& name) const {
  for (std::size_t i = 0; i < initialLayers.size(); ++i) {
    if (initialLayers[i].GetName() == name) return i;
  }
  return gd::String::npos;
}

void Layout::InsertNewLayer(const gd::String& name, std::size_t position) {
  gd::Layer newLayer;
  newLayer.SetName(name);
  if (position < initialLayers.size())
    initialLayers.insert(initialLayers.begin() + position, newLayer);
  else
    initialLayers.push_back(newLayer);
}

void Layout::InsertLayer(const gd::Layer& layer, std::size_t position) {
  if (position < initialLayers.size())
    initialLayers.insert(initialLayers.begin() + position, layer);
  else
    initialLayers.push_back(layer);
}

void Layout::RemoveLayer(const gd::String& name) {
  std::vector<gd::Layer>::iterator layer =
      find_if(initialLayers.begin(),
              initialLayers.end(),
              bind2nd(gd::LayerHasName(), name));
  if (layer == initialLayers.end()) return;

  initialLayers.erase(layer);
}

void Layout::SwapLayers(std::size_t firstLayerIndex,
                        std::size_t secondLayerIndex) {
  if (firstLayerIndex >= initialLayers.size() ||
      secondLayerIndex >= initialLayers.size())
    return;

  std::iter_swap(initialLayers.begin() + firstLayerIndex,
                 initialLayers.begin() + secondLayerIndex);
}

void Layout::MoveLayer(std::size_t oldIndex, std::size_t newIndex) {
  if (oldIndex >= initialLayers.size() || newIndex >= initialLayers.size())
    return;

  auto layer = initialLayers[oldIndex];
  initialLayers.erase(initialLayers.begin() + oldIndex);
  InsertLayer(layer, newIndex);
}

void Layout::UpdateBehaviorsSharedData(gd::Project& project) {
  std::vector<gd::String> allBehaviorsTypes;
  std::vector<gd::String> allBehaviorsNames;

  // Search in objects for the type and the name of every behaviors.
  for (std::size_t i = 0; i < initialObjects.size(); ++i) {
    std::vector<gd::String> objectBehaviors =
        initialObjects[i]->GetAllBehaviorNames();
    for (unsigned int j = 0; j < objectBehaviors.size(); ++j) {
      auto& behavior =
          initialObjects[i]->GetBehavior(objectBehaviors[j]);
      allBehaviorsTypes.push_back(behavior.GetTypeName());
      allBehaviorsNames.push_back(behavior.GetName());
    }
  }
  for (std::size_t i = 0; i < project.GetObjectsCount(); ++i) {
    std::vector<gd::String> objectBehaviors =
        project.GetObject(i).GetAllBehaviorNames();
    for (std::size_t j = 0; j < objectBehaviors.size(); ++j) {
      auto& behavior =
          project.GetObject(i).GetBehavior(objectBehaviors[j]);
      allBehaviorsTypes.push_back(behavior.GetTypeName());
      allBehaviorsNames.push_back(behavior.GetName());
    }
  }

  // Create non existing shared data
  for (std::size_t i = 0;
       i < allBehaviorsTypes.size() && i < allBehaviorsNames.size();
       ++i) {
    const gd::String& name = allBehaviorsNames[i];

    if (behaviorsSharedData.find(name) != behaviorsSharedData.end()) continue;

    auto sharedData = CreateBehaviorsSharedData(project, name, allBehaviorsTypes[i]);
    if (sharedData) {
      behaviorsSharedData[name] = std::move(sharedData);
    }
  }

  // Remove useless shared data:
  // First construct the list of existing shared data.
  std::vector<gd::String> allSharedData;
  for (const auto& it : behaviorsSharedData) {
    allSharedData.push_back(it.first);
  }

  // Then delete shared data not linked to a behavior
  for (std::size_t i = 0; i < allSharedData.size(); ++i) {
    if (std::find(allBehaviorsNames.begin(),
                  allBehaviorsNames.end(),
                  allSharedData[i]) == allBehaviorsNames.end())
      behaviorsSharedData.erase(allSharedData[i]);
  }
}

std::unique_ptr<gd::BehaviorsSharedData> Layout::CreateBehaviorsSharedData(
        gd::Project& project, const gd::String& name, const gd::String& behaviorsType) {
    if (project.HasEventsBasedBehavior(behaviorsType)) {
      auto sharedData =
          gd::make_unique<gd::CustomBehaviorsSharedData>(name, project, behaviorsType);
      sharedData->InitializeContent();
      return std::move(sharedData);
    }
    const gd::BehaviorMetadata& behaviorMetadata =
        gd::MetadataProvider::GetBehaviorMetadata(
            project.GetCurrentPlatform(),
            behaviorsType);
    if (gd::MetadataProvider::IsBadBehaviorMetadata(behaviorMetadata)) {
      gd::LogWarning("Tried to create a behavior shared data with an unknown type: " +
                     behaviorsType + " on object " + GetName() + "!");
    // It's probably an events-based behavior that was removed.
    // Create a custom behavior shared data to preserve the properties values.
      auto sharedData =
          gd::make_unique<gd::CustomBehaviorsSharedData>(name, project, behaviorsType);
      sharedData->InitializeContent();
      return std::move(sharedData);
    }

    gd::BehaviorsSharedData* behaviorsSharedDataBluePrint =
        behaviorMetadata.GetSharedDataInstance();
    if (!behaviorsSharedDataBluePrint) return nullptr;

    auto sharedData = behaviorsSharedDataBluePrint->Clone();
    sharedData->SetName(name);
    sharedData->SetTypeName(behaviorsType);
    sharedData->InitializeContent();
    return std::unique_ptr<gd::BehaviorsSharedData>(sharedData);
}

void Layout::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("name", GetName());
  element.SetAttribute("mangledName", GetMangledName());
  element.SetAttribute("r", (int)GetBackgroundColorRed());
  element.SetAttribute("v", (int)GetBackgroundColorGreen());
  element.SetAttribute("b", (int)GetBackgroundColorBlue());
  element.SetAttribute("title", GetWindowDefaultTitle());
  element.SetAttribute("standardSortMethod", standardSortMethod);
  element.SetAttribute("stopSoundsOnStartup", stopSoundsOnStartup);
  element.SetAttribute("disableInputWhenNotFocused",
                       disableInputWhenNotFocused);

  editorSettings.SerializeTo(element.AddChild("uiSettings"));

  GetObjectGroups().SerializeTo(element.AddChild("objectsGroups"));
  GetVariables().SerializeTo(element.AddChild("variables"));
  GetInitialInstances().SerializeTo(element.AddChild("instances"));
  SerializeObjectsTo(element.AddChild("objects"));
  SerializeFoldersTo(element.AddChild("objectsFolderStructure"));
  gd::EventsListSerialization::SerializeEventsTo(events,
                                                 element.AddChild("events"));

  SerializeLayersTo(element.AddChild("layers"));

  SerializerElement& behaviorDatasElement =
      element.AddChild("behaviorsSharedData");
  behaviorDatasElement.ConsiderAsArrayOf("behaviorSharedData");
  for (const auto& it : behaviorsSharedData) {
    SerializerElement& dataElement =
        behaviorDatasElement.AddChild("behaviorSharedData");

    it.second->SerializeTo(dataElement);
    dataElement.RemoveChild("type");  // The content can contain type or name
                                      // properties, remove them.
    dataElement.RemoveChild("name");
    dataElement.SetAttribute("type", it.second->GetTypeName());
    dataElement.SetAttribute("name", it.second->GetName());
  }
}

void Layout::SerializeLayersTo(SerializerElement& element) const {
  element.ConsiderAsArrayOf("layer");
  for (std::size_t j = 0; j < GetLayersCount(); ++j)
    GetLayer(j).SerializeTo(element.AddChild("layer"));
}
#endif

void Layout::UnserializeLayersFrom(const SerializerElement& element) {
  initialLayers.clear();
  element.ConsiderAsArrayOf("layer", "Layer");
  for (std::size_t i = 0; i < element.GetChildrenCount(); ++i) {
    gd::Layer layer;
    layer.UnserializeFrom(element.GetChild(i));
    initialLayers.push_back(layer);
  }
}

void Layout::UnserializeFrom(gd::Project& project,
                             const SerializerElement& element) {
  SetBackgroundColor(element.GetIntAttribute("r"),
                     element.GetIntAttribute("v"),
                     element.GetIntAttribute("b"));
  SetWindowDefaultTitle(
      element.GetStringAttribute("title", "(No title)", "titre"));
  standardSortMethod = element.GetBoolAttribute("standardSortMethod");
  stopSoundsOnStartup = element.GetBoolAttribute("stopSoundsOnStartup");
  disableInputWhenNotFocused =
      element.GetBoolAttribute("disableInputWhenNotFocused");

  editorSettings.UnserializeFrom(
      element.GetChild("uiSettings", 0, "UISettings"));

  GetObjectGroups().UnserializeFrom(
      element.GetChild("objectsGroups", 0, "GroupesObjets"));
  gd::EventsListSerialization::UnserializeEventsFrom(
      project, GetEvents(), element.GetChild("events", 0, "Events"));

  UnserializeObjectsFrom(project, element.GetChild("objects", 0, "Objets"));
  if (element.HasChild("objectsFolderStructure")) {
    UnserializeFoldersFrom(project, element.GetChild("objectsFolderStructure", 0));
  }
  AddMissingObjectsInRootFolder();

  initialInstances.UnserializeFrom(
      element.GetChild("instances", 0, "Positions"));
  variables.UnserializeFrom(element.GetChild("variables", 0, "Variables"));

  UnserializeLayersFrom(element.GetChild("layers", 0, "Layers"));

  // Compatibility with GD <= 4
  gd::String deprecatedTag1 = "automatismsSharedData";
  gd::String deprecatedTag2 = "automatismSharedData";
  if (!element.HasChild(deprecatedTag1)) {
    deprecatedTag1 = "AutomatismsSharedDatas";
    deprecatedTag2 = "AutomatismSharedDatas";
  }
  // end of compatibility code

  SerializerElement& behaviorsDataElement =
      element.GetChild("behaviorsSharedData", 0, deprecatedTag1);
  behaviorsDataElement.ConsiderAsArrayOf("behaviorSharedData", deprecatedTag2);
  for (unsigned int i = 0; i < behaviorsDataElement.GetChildrenCount(); ++i) {
    SerializerElement& sharedDataElement = behaviorsDataElement.GetChild(i);
    gd::String type =
        sharedDataElement.GetStringAttribute("type", "", "Type")
            .FindAndReplace("Automatism",
                            "Behavior");  // Compatibility with GD <= 4
    gd::String name = sharedDataElement.GetStringAttribute("name", "", "Name");


    auto sharedData = CreateBehaviorsSharedData(project, name, type);
    if (sharedData) {
      // Compatibility with GD <= 4.0.98
      // If there is only one child called "content" (in addition to "type" and
      // "name"), it's the content of a JavaScript behavior. Move the content
      // out of the "content" object (to put it directly at the root of the
      // behavior shared data element).
      if (sharedDataElement.HasChild("content")) {
        sharedData->UnserializeFrom(sharedDataElement.GetChild("content"));
      }
      // end of compatibility code
      else {
        sharedData->UnserializeFrom(sharedDataElement);
      }
      behaviorsSharedData[name] = std::move(sharedData);
    }
  }
}

void Layout::Init(const Layout& other) {
  SetName(other.name);
  backgroundColorR = other.backgroundColorR;
  backgroundColorG = other.backgroundColorG;
  backgroundColorB = other.backgroundColorB;
  standardSortMethod = other.standardSortMethod;
  title = other.title;
  stopSoundsOnStartup = other.stopSoundsOnStartup;
  disableInputWhenNotFocused = other.disableInputWhenNotFocused;
  initialInstances = other.initialInstances;
  initialLayers = other.initialLayers;
  variables = other.GetVariables();

  initialObjects = gd::Clone(other.initialObjects);

  behaviorsSharedData.clear();
  for (const auto& it : other.behaviorsSharedData) {
    behaviorsSharedData[it.first] =
        std::unique_ptr<gd::BehaviorsSharedData>(it.second->Clone());
  }

  events = other.events;
  editorSettings = other.editorSettings;
  objectGroups = other.objectGroups;

  profiler = other.profiler;
}

std::vector<gd::String> GetHiddenLayers(const Layout& layout) {
  std::vector<gd::String> hiddenLayers;
  for (std::size_t i = 0; i < layout.GetLayersCount(); ++i) {
    if (!layout.GetLayer(i).GetVisibility()) {
      hiddenLayers.push_back(layout.GetLayer(i).GetName());
    }
  }

  return hiddenLayers;
}

gd::String GD_CORE_API GetTypeOfObject(const gd::ObjectsContainer& project,
                                       const gd::ObjectsContainer& layout,
                                       gd::String name,
                                       bool searchInGroups) {
  gd::String type;

  // Search in objects.
  if (layout.HasObjectNamed(name))
    type = layout.GetObject(name).GetType();
  else if (project.HasObjectNamed(name))
    type = project.GetObject(name).GetType();

  // Search in groups.
  // Currently, a group is considered as the "intersection" of all of its objects.
  // Search "groups is the intersection of its objects" in the codebase.
  else if (searchInGroups) {
    for (std::size_t i = 0; i < layout.GetObjectGroups().size(); ++i) {
      if (layout.GetObjectGroups()[i].GetName() == name) {
        // A group has the name searched
        // Verifying now that all objects have the same type.

        vector<gd::String> groupsObjects =
            layout.GetObjectGroups()[i].GetAllObjectsNames();
        gd::String previousType =
            groupsObjects.empty()
                ? ""
                : GetTypeOfObject(project, layout, groupsObjects[0], false);

        for (std::size_t j = 0; j < groupsObjects.size(); ++j) {
          if (GetTypeOfObject(project, layout, groupsObjects[j], false) !=
              previousType)
            return "";  // The group has more than one type.
        }

        if (!type.empty() && previousType != type)
          return "";  // The group has objects of different type, so the group
                      // has not any type.

        type = previousType;
      }
    }
    for (std::size_t i = 0; i < project.GetObjectGroups().size(); ++i) {
      if (project.GetObjectGroups()[i].GetName() == name) {
        // A group has the name searched
        // Verifying now that all objects have the same type.

        vector<gd::String> groupsObjects =
            project.GetObjectGroups()[i].GetAllObjectsNames();
        gd::String previousType =
            groupsObjects.empty()
                ? ""
                : GetTypeOfObject(project, layout, groupsObjects[0], false);

        for (std::size_t j = 0; j < groupsObjects.size(); ++j) {
          if (GetTypeOfObject(project, layout, groupsObjects[j], false) !=
              previousType)
            return "";  // The group has more than one type.
        }

        if (!type.empty() && previousType != type)
          return "";  // The group has objects of different type, so the group
                      // has not any type.

        type = previousType;
      }
    }
  }

  return type;
}

void GD_CORE_API FilterBehaviorNamesFromObject(
    const gd::Object &object, const gd::String &behaviorType,
    std::vector<gd::String> &behaviorNames) {
  for (size_t i = 0; i < behaviorNames.size(); i++) {
    auto &behaviorName = behaviorNames[i];
    if (!object.HasBehaviorNamed(behaviorName) ||
        object.GetBehavior(behaviorName).GetTypeName() != behaviorType) {
      behaviorNames.erase(behaviorNames.begin() + i);
    }
  }
}

std::vector<gd::String> GD_CORE_API GetBehaviorNamesInObjectOrGroup(
    const gd::ObjectsContainer &project, const gd::ObjectsContainer &layout,
    const gd::String &objectOrGroupName, const gd::String &behaviorType,
    bool searchInGroups) {
  // Search in objects.
  if (layout.HasObjectNamed(objectOrGroupName)) {
    auto &object = layout.GetObject(objectOrGroupName);
    auto behaviorNames = object.GetAllBehaviorNames();
    FilterBehaviorNamesFromObject(object, behaviorType, behaviorNames);
    return behaviorNames;
  }
  if (project.HasObjectNamed(objectOrGroupName)) {
    auto &object = project.GetObject(objectOrGroupName);
    auto behaviorNames = object.GetAllBehaviorNames();
    FilterBehaviorNamesFromObject(object, behaviorType, behaviorNames);
    return behaviorNames;
  }

  if (!searchInGroups) {
    std::vector<gd::String> behaviorNames;
    return behaviorNames;
  }

  // Search in groups.
  // Currently, a group is considered as the "intersection" of all of its objects.
  // Search "groups is the intersection of its objects" in the codebase.
  const gd::ObjectsContainer *container;
  if (layout.GetObjectGroups().Has(objectOrGroupName)) {
    container = &layout;
  } else if (project.GetObjectGroups().Has(objectOrGroupName)) {
    container = &project;
  } else {
    std::vector<gd::String> behaviorNames;
    return behaviorNames;
  }
  const vector<gd::String> &groupsObjects =
      container->GetObjectGroups().Get(objectOrGroupName).GetAllObjectsNames();

  // Empty groups don't contain any behavior.
  if (groupsObjects.empty()) {
    std::vector<gd::String> behaviorNames;
    return behaviorNames;
  }

  // Compute the intersection of the behaviors of all objects.
  auto behaviorNames = GetBehaviorNamesInObjectOrGroup(
      project, layout, groupsObjects[0], behaviorType, false);
  for (size_t i = 1; i < groupsObjects.size(); i++) {
    auto &objectName = groupsObjects[i];

    if (layout.HasObjectNamed(objectName)) {
      auto &object = layout.GetObject(objectName);
      FilterBehaviorNamesFromObject(object, behaviorType, behaviorNames);
      return behaviorNames;
    }
    if (project.HasObjectNamed(objectName)) {
      auto &object = project.GetObject(objectName);
      FilterBehaviorNamesFromObject(object, behaviorType, behaviorNames);
      return behaviorNames;
    }
    if (behaviorNames.size() == 0) {
      return behaviorNames;
    }
  }
  return behaviorNames;
}

bool GD_CORE_API HasBehaviorInObjectOrGroup(const gd::ObjectsContainer &project,
                                            const gd::ObjectsContainer &layout,
                                            const gd::String &objectOrGroupName,
                                            const gd::String &behaviorName,
                                            bool searchInGroups) {
  // Search in objects.
  if (layout.HasObjectNamed(objectOrGroupName)) {
    return layout.GetObject(objectOrGroupName).HasBehaviorNamed(behaviorName);
  }
  if (project.HasObjectNamed(objectOrGroupName)) {
    return project.GetObject(objectOrGroupName).HasBehaviorNamed(behaviorName);
  }

  if (!searchInGroups) {
    return false;
  }

  // Search in groups.
  // Currently, a group is considered as the "intersection" of all of its objects.
  // Search "groups is the intersection of its objects" in the codebase.
  const gd::ObjectsContainer *container;
  if (layout.GetObjectGroups().Has(objectOrGroupName)) {
    container = &layout;
  } else if (project.GetObjectGroups().Has(objectOrGroupName)) {
    container = &project;
  } else {
    return false;
  }
  const vector<gd::String> &groupsObjects =
      container->GetObjectGroups().Get(objectOrGroupName).GetAllObjectsNames();

  // Empty groups don't contain any behavior.
  if (groupsObjects.empty()) {
    return false;
  }

  // Check that all objects have the behavior.
  for (auto &&object : groupsObjects) {
    if (!HasBehaviorInObjectOrGroup(project, layout, object, behaviorName,
                                    false)) {
      return false;
    }
  }
  return true;
}

bool GD_CORE_API IsDefaultBehavior(const gd::ObjectsContainer& project,
                                         const gd::ObjectsContainer& layout,
                                         gd::String objectOrGroupName,
                                         gd::String behaviorName,
                                         bool searchInGroups) {
  // Search in objects.
  if (layout.HasObjectNamed(objectOrGroupName)) {
    auto &object = layout.GetObject(objectOrGroupName);
    return object.HasBehaviorNamed(behaviorName) &&
           object.GetBehavior(behaviorName).IsDefaultBehavior();
  }
  if (project.HasObjectNamed(objectOrGroupName)) {
    auto &object = project.GetObject(objectOrGroupName);
    return object.HasBehaviorNamed(behaviorName) &&
           object.GetBehavior(behaviorName).IsDefaultBehavior();
  }

  if (!searchInGroups) {
    return false;
  }

  // Search in groups.
  // Currently, a group is considered as the "intersection" of all of its objects.
  // Search "groups is the intersection of its objects" in the codebase.
  const gd::ObjectsContainer *container;
  if (layout.GetObjectGroups().Has(objectOrGroupName)) {
    container = &layout;
  } else if (project.GetObjectGroups().Has(objectOrGroupName)) {
    container = &project;
  } else {
    return false;
  }
  const vector<gd::String> &groupsObjects =
      container->GetObjectGroups().Get(objectOrGroupName).GetAllObjectsNames();

  // Empty groups don't contain any behavior.
  if (groupsObjects.empty()) {
    return false;
  }

  // Check that all objects have the same type.
  for (auto &&object : groupsObjects) {
    if (!IsDefaultBehavior(project, layout, object, behaviorName,
                                    false)) {
      return false;
    }
  }
  return true;
}

gd::String GD_CORE_API GetTypeOfBehaviorInObjectOrGroup(const gd::ObjectsContainer& project,
                                         const gd::ObjectsContainer& layout,
                                         const gd::String& objectOrGroupName,
                                         const gd::String& behaviorName,
                                         bool searchInGroups) {
  // Search in objects.
  if (layout.HasObjectNamed(objectOrGroupName)) {
    auto &object = layout.GetObject(objectOrGroupName);
    return object.HasBehaviorNamed(behaviorName) ?
           object.GetBehavior(behaviorName).GetTypeName() : "";
  }
  if (project.HasObjectNamed(objectOrGroupName)) {
    auto &object = project.GetObject(objectOrGroupName);
    return object.HasBehaviorNamed(behaviorName) ?
           object.GetBehavior(behaviorName).GetTypeName() : "";
  }

  if (!searchInGroups) {
    return "";
  }

  // Search in groups.
  // Currently, a group is considered as the "intersection" of all of its objects.
  // Search "groups is the intersection of its objects" in the codebase.
  const gd::ObjectsContainer *container;
  if (layout.GetObjectGroups().Has(objectOrGroupName)) {
    container = &layout;
  } else if (project.GetObjectGroups().Has(objectOrGroupName)) {
    container = &project;
  } else {
    return "";
  }
  const vector<gd::String> &groupsObjects =
      container->GetObjectGroups().Get(objectOrGroupName).GetAllObjectsNames();

  // Empty groups don't contain any behavior.
  if (groupsObjects.empty()) {
    return "";
  }

  // Check that all objects have the behavior with the same type.
  auto behaviorType = GetTypeOfBehaviorInObjectOrGroup(
      project, layout, groupsObjects[0], behaviorName, false);
  for (auto &&object : groupsObjects) {
    if (GetTypeOfBehaviorInObjectOrGroup(project, layout, object, behaviorName,
                                    false) != behaviorType) {
      return "";
    }
  }
  return behaviorType;
}

gd::String GD_CORE_API GetTypeOfBehavior(const gd::ObjectsContainer& project,
                                         const gd::ObjectsContainer& layout,
                                         gd::String name,
                                         bool searchInGroups) {
  for (std::size_t i = 0; i < layout.GetObjectsCount(); ++i) {
    const auto &object = layout.GetObject(i);
    if (object.HasBehaviorNamed(name)) {
      return object.GetBehavior(name).GetTypeName();
    }
  }

  for (std::size_t i = 0; i < project.GetObjectsCount(); ++i) {
    const auto &object = project.GetObject(i);
    if (object.HasBehaviorNamed(name)) {
      return object.GetBehavior(name).GetTypeName();
    }
  }

  return "";
}

vector<gd::String> GD_CORE_API
GetBehaviorsOfObject(const gd::ObjectsContainer& project,
                     const gd::ObjectsContainer& layout,
                     const gd::String& name,
                     bool searchInGroups) {
  bool behaviorsAlreadyInserted = false;
  vector<gd::String> behaviors;

  // Search in objects
  if (layout.HasObjectNamed(name))  // We check first layout's objects' list.
  {
    std::vector<gd::String> objectBehaviors =
        layout.GetObject(name).GetAllBehaviorNames();
    std::copy(objectBehaviors.begin(),
              objectBehaviors.end(),
              back_inserter(behaviors));
    behaviorsAlreadyInserted = true;
  } else if (project.HasObjectNamed(name))  // Then the global object list
  {
    vector<gd::String> objectBehaviors =
        project.GetObject(name).GetAllBehaviorNames();
    std::copy(objectBehaviors.begin(),
              objectBehaviors.end(),
              back_inserter(behaviors));
    behaviorsAlreadyInserted = true;
  }

  // Search in groups
  // Currently, a group is considered as the "intersection" of all of its objects.
  // Search "groups is the intersection of its objects" in the codebase.
  if (searchInGroups) {
    for (std::size_t i = 0; i < layout.GetObjectGroups().size(); ++i) {
      if (layout.GetObjectGroups()[i].GetName() == name) {
        // A group has the name searched
        // Verifying now that all objects have common behaviors.

        vector<gd::String> groupsObjects =
            layout.GetObjectGroups()[i].GetAllObjectsNames();
        for (std::size_t j = 0; j < groupsObjects.size(); ++j) {
          // Get behaviors of the object of the group and delete behavior which
          // are not in commons.
          vector<gd::String> objectBehaviors =
              GetBehaviorsOfObject(project, layout, groupsObjects[j], false);
          if (!behaviorsAlreadyInserted) {
            behaviorsAlreadyInserted = true;
            behaviors = objectBehaviors;
          } else {
            for (std::size_t a = 0; a < behaviors.size(); ++a) {
              if (find(objectBehaviors.begin(),
                       objectBehaviors.end(),
                       behaviors[a]) == objectBehaviors.end()) {
                behaviors.erase(behaviors.begin() + a);
                --a;
              }
            }
          }
        }
      }
    }
    for (std::size_t i = 0; i < project.GetObjectGroups().size(); ++i) {
      if (project.GetObjectGroups()[i].GetName() == name) {
        // A group has the name searched
        // Verifying now that all objects have common behaviors.

        vector<gd::String> groupsObjects =
            project.GetObjectGroups()[i].GetAllObjectsNames();
        for (std::size_t j = 0; j < groupsObjects.size(); ++j) {
          // Get behaviors of the object of the group and delete behavior which
          // are not in commons.
          vector<gd::String> objectBehaviors =
              GetBehaviorsOfObject(project, layout, groupsObjects[j], false);
          if (!behaviorsAlreadyInserted) {
            behaviorsAlreadyInserted = true;
            behaviors = objectBehaviors;
          } else {
            for (std::size_t a = 0; a < behaviors.size(); ++a) {
              if (find(objectBehaviors.begin(),
                       objectBehaviors.end(),
                       behaviors[a]) == objectBehaviors.end()) {
                behaviors.erase(behaviors.begin() + a);
                --a;
              }
            }
          }
        }
      }
    }
  }

  return behaviors;
}

}  // namespace gd
