/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "Project.h"

#include <stdio.h>
#include <stdlib.h>

#include <cctype>
#include <fstream>
#include <map>
#include <vector>

#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Events/UsedExtensionsFinder.h"
#include "GDCore/IDE/PlatformManager.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/CustomObjectConfiguration.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectConfiguration.h"
#include "GDCore/Project/ObjectGroupsContainer.h"
#include "GDCore/Project/ResourcesManager.h"
#include "GDCore/Project/SourceFile.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/PolymorphicClone.h"
#include "GDCore/Tools/UUID/UUID.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDCore/Utf8/utf8.h"

using namespace std;

#undef CreateEvent

namespace gd {

Project::Project()
    : name(_("Project")),
      version("1.0.0"),
      packageName("com.example.gamename"),
      templateSlug(""),
      orientation("landscape"),
      folderProject(false),
      windowWidth(800),
      windowHeight(600),
      maxFPS(60),
      minFPS(20),
      verticalSync(false),
      scaleMode("linear"),
      pixelsRounding(false),
      adaptGameResolutionAtRuntime(true),
      sizeOnStartupMode("adaptWidth"),
      projectUuid(""),
      useDeprecatedZeroAsDefaultZOrder(false),
      useExternalSourceFiles(false),
      isPlayableWithKeyboard(false),
      isPlayableWithGamepad(false),
      isPlayableWithMobile(false),
      currentPlatform(NULL),
      gdMajorVersion(gd::VersionWrapper::Major()),
      gdMinorVersion(gd::VersionWrapper::Minor()),
      gdBuildVersion(gd::VersionWrapper::Build()) {}

Project::~Project() {}

void Project::ResetProjectUuid() { projectUuid = UUID::MakeUuid4(); }

std::unique_ptr<gd::Object> Project::CreateObject(
  const gd::String& type,
  const gd::String& name) const {
    return gd::make_unique<Object>(name, type, CreateObjectConfiguration(type));
}

std::unique_ptr<gd::ObjectConfiguration> Project::CreateObjectConfiguration(
  const gd::String& type) const {
  if (Project::HasEventsBasedObject(type)) {
    return gd::make_unique<CustomObjectConfiguration>(*this, type);
  }
  else {
    // Create a base object if the type can't be found in the platform.
    return currentPlatform->CreateObjectConfiguration(type);
  }
}

bool Project::HasEventsBasedObject(const gd::String& type) const {
  const auto separatorIndex = type.find(PlatformExtension::GetNamespaceSeparator());
  if (separatorIndex == std::string::npos) {
    return false;
  }
  gd::String extensionName = type.substr(0, separatorIndex);
  if (!Project::HasEventsFunctionsExtensionNamed(extensionName)) {
    return false;
  }
  auto &extension = Project::GetEventsFunctionsExtension(extensionName);
  gd::String objectTypeName = type.substr(separatorIndex + 2);
  return extension.GetEventsBasedObjects().Has(objectTypeName);
}

gd::EventsBasedObject& Project::GetEventsBasedObject(const gd::String& type) {
  const auto separatorIndex = type.find(PlatformExtension::GetNamespaceSeparator());
  gd::String extensionName = type.substr(0, separatorIndex);
  gd::String objectTypeName = type.substr(separatorIndex + 2);

  auto &extension = Project::GetEventsFunctionsExtension(extensionName);
  return extension.GetEventsBasedObjects().Get(objectTypeName);
}

const gd::EventsBasedObject& Project::GetEventsBasedObject(const gd::String& type) const {
  const auto separatorIndex = type.find(PlatformExtension::GetNamespaceSeparator());
  gd::String extensionName = type.substr(0, separatorIndex);
  gd::String objectTypeName = type.substr(separatorIndex + 2);

  const auto &extension = Project::GetEventsFunctionsExtension(extensionName);
  return extension.GetEventsBasedObjects().Get(objectTypeName);
}

bool Project::HasEventsBasedBehavior(const gd::String& type) const {
    const auto separatorIndex = type.find(PlatformExtension::GetNamespaceSeparator());
    if (separatorIndex == std::string::npos) {
      return false;
    }
    gd::String extensionName = type.substr(0, separatorIndex);
    if (!Project::HasEventsFunctionsExtensionNamed(extensionName)) {
      return false;
    }
    auto &extension = Project::GetEventsFunctionsExtension(extensionName);
    gd::String behaviorTypeName = type.substr(separatorIndex + 2);
    return extension.GetEventsBasedBehaviors().Has(behaviorTypeName);
}

gd::EventsBasedBehavior& Project::GetEventsBasedBehavior(const gd::String& type) {
    const auto separatorIndex = type.find(PlatformExtension::GetNamespaceSeparator());
    gd::String extensionName = type.substr(0, separatorIndex);
    gd::String behaviorTypeName = type.substr(separatorIndex + 2);

    auto &extension = Project::GetEventsFunctionsExtension(extensionName);
    return extension.GetEventsBasedBehaviors().Get(behaviorTypeName);
}

const gd::EventsBasedBehavior& Project::GetEventsBasedBehavior(const gd::String& type) const {
    const auto separatorIndex = type.find(PlatformExtension::GetNamespaceSeparator());
    gd::String extensionName = type.substr(0, separatorIndex);
    gd::String behaviorTypeName = type.substr(separatorIndex + 2);

    auto &extension = Project::GetEventsFunctionsExtension(extensionName);
    return extension.GetEventsBasedBehaviors().Get(behaviorTypeName);
}

std::shared_ptr<gd::BaseEvent> Project::CreateEvent(
    const gd::String& type, const gd::String& platformName) {
  for (std::size_t i = 0; i < platforms.size(); ++i) {
    if (!platformName.empty() && platforms[i]->GetName() != platformName)
      continue;

    std::shared_ptr<gd::BaseEvent> event = platforms[i]->CreateEvent(type);
    if (event) return event;
  }

  return std::shared_ptr<gd::BaseEvent>();
}

Platform& Project::GetCurrentPlatform() const {
  if (currentPlatform == NULL)
    std::cout << "FATAL ERROR: Project has no assigned current platform. GD "
                 "will crash."
              << std::endl;

  return *currentPlatform;
}

void Project::AddPlatform(Platform& platform) {
  for (std::size_t i = 0; i < platforms.size(); ++i) {
    if (platforms[i] == &platform) return;
  }

  // Add the platform and make it the current one if the game has no other
  // platform.
  platforms.push_back(&platform);
  if (currentPlatform == NULL) currentPlatform = &platform;
}

void Project::SetCurrentPlatform(const gd::String& platformName) {
  for (std::size_t i = 0; i < platforms.size(); ++i) {
    if (platforms[i]->GetName() == platformName) {
      currentPlatform = platforms[i];
      return;
    }
  }
}

bool Project::RemovePlatform(const gd::String& platformName) {
  if (platforms.size() <= 1) return false;

  for (std::size_t i = 0; i < platforms.size(); ++i) {
    if (platforms[i]->GetName() == platformName) {
      // Remove the platform, ensuring that currentPlatform remains correct.
      if (currentPlatform == platforms[i]) currentPlatform = platforms.back();
      if (currentPlatform == platforms[i]) currentPlatform = platforms[0];
      platforms.erase(platforms.begin() + i);

      return true;
    }
  }

  return false;
}

bool Project::HasLayoutNamed(const gd::String& name) const {
  return (find_if(scenes.begin(),
                  scenes.end(),
                  bind2nd(gd::LayoutHasName(), name)) != scenes.end());
}
gd::Layout& Project::GetLayout(const gd::String& name) {
  return *(*find_if(
      scenes.begin(), scenes.end(), bind2nd(gd::LayoutHasName(), name)));
}
const gd::Layout& Project::GetLayout(const gd::String& name) const {
  return *(*find_if(
      scenes.begin(), scenes.end(), bind2nd(gd::LayoutHasName(), name)));
}
gd::Layout& Project::GetLayout(std::size_t index) { return *scenes[index]; }
const gd::Layout& Project::GetLayout(std::size_t index) const {
  return *scenes[index];
}
std::size_t Project::GetLayoutPosition(const gd::String& name) const {
  for (std::size_t i = 0; i < scenes.size(); ++i) {
    if (scenes[i]->GetName() == name) return i;
  }
  return gd::String::npos;
}
std::size_t Project::GetLayoutsCount() const { return scenes.size(); }

void Project::SwapLayouts(std::size_t first, std::size_t second) {
  if (first >= scenes.size() || second >= scenes.size()) return;

  std::iter_swap(scenes.begin() + first, scenes.begin() + second);
}

gd::Layout& Project::InsertNewLayout(const gd::String& name,
                                     std::size_t position) {
  gd::Layout& newlyInsertedLayout = *(*(scenes.emplace(
      position < scenes.size() ? scenes.begin() + position : scenes.end(),
      new Layout())));

  newlyInsertedLayout.SetName(name);
  newlyInsertedLayout.UpdateBehaviorsSharedData(*this);

  return newlyInsertedLayout;
}

gd::Layout& Project::InsertLayout(const gd::Layout& layout,
                                  std::size_t position) {
  gd::Layout& newlyInsertedLayout = *(*(scenes.emplace(
      position < scenes.size() ? scenes.begin() + position : scenes.end(),
      new Layout(layout))));

  newlyInsertedLayout.UpdateBehaviorsSharedData(*this);

  return newlyInsertedLayout;
}

void Project::RemoveLayout(const gd::String& name) {
  std::vector<std::unique_ptr<gd::Layout> >::iterator scene =
      find_if(scenes.begin(), scenes.end(), bind2nd(gd::LayoutHasName(), name));
  if (scene == scenes.end()) return;

  scenes.erase(scene);
}

bool Project::HasExternalEventsNamed(const gd::String& name) const {
  return (find_if(externalEvents.begin(),
                  externalEvents.end(),
                  bind2nd(gd::ExternalEventsHasName(), name)) !=
          externalEvents.end());
}
gd::ExternalEvents& Project::GetExternalEvents(const gd::String& name) {
  return *(*find_if(externalEvents.begin(),
                    externalEvents.end(),
                    bind2nd(gd::ExternalEventsHasName(), name)));
}
const gd::ExternalEvents& Project::GetExternalEvents(
    const gd::String& name) const {
  return *(*find_if(externalEvents.begin(),
                    externalEvents.end(),
                    bind2nd(gd::ExternalEventsHasName(), name)));
}
gd::ExternalEvents& Project::GetExternalEvents(std::size_t index) {
  return *externalEvents[index];
}
const gd::ExternalEvents& Project::GetExternalEvents(std::size_t index) const {
  return *externalEvents[index];
}
std::size_t Project::GetExternalEventsPosition(const gd::String& name) const {
  for (std::size_t i = 0; i < externalEvents.size(); ++i) {
    if (externalEvents[i]->GetName() == name) return i;
  }
  return gd::String::npos;
}
std::size_t Project::GetExternalEventsCount() const {
  return externalEvents.size();
}

gd::ExternalEvents& Project::InsertNewExternalEvents(const gd::String& name,
                                                     std::size_t position) {
  gd::ExternalEvents& newlyInsertedExternalEvents = *(*(externalEvents.emplace(
      position < externalEvents.size() ? externalEvents.begin() + position
                                       : externalEvents.end(),
      new gd::ExternalEvents())));

  newlyInsertedExternalEvents.SetName(name);

  return newlyInsertedExternalEvents;
}

gd::ExternalEvents& Project::InsertExternalEvents(
    const gd::ExternalEvents& events, std::size_t position) {
  gd::ExternalEvents& newlyInsertedExternalEvents = *(*(externalEvents.emplace(
      position < externalEvents.size() ? externalEvents.begin() + position
                                       : externalEvents.end(),
      new gd::ExternalEvents(events))));

  return newlyInsertedExternalEvents;
}

void Project::RemoveExternalEvents(const gd::String& name) {
  std::vector<std::unique_ptr<gd::ExternalEvents> >::iterator events =
      find_if(externalEvents.begin(),
              externalEvents.end(),
              bind2nd(gd::ExternalEventsHasName(), name));
  if (events == externalEvents.end()) return;

  externalEvents.erase(events);
}

void Project::SwapExternalEvents(std::size_t first, std::size_t second) {
  if (first >= externalEvents.size() || second >= externalEvents.size()) return;

  std::iter_swap(externalEvents.begin() + first,
                 externalEvents.begin() + second);
}

void Project::SwapExternalLayouts(std::size_t first, std::size_t second) {
  if (first >= externalLayouts.size() || second >= externalLayouts.size())
    return;

  std::iter_swap(externalLayouts.begin() + first,
                 externalLayouts.begin() + second);
}
bool Project::HasExternalLayoutNamed(const gd::String& name) const {
  return (find_if(externalLayouts.begin(),
                  externalLayouts.end(),
                  bind2nd(gd::ExternalLayoutHasName(), name)) !=
          externalLayouts.end());
}
gd::ExternalLayout& Project::GetExternalLayout(const gd::String& name) {
  return *(*find_if(externalLayouts.begin(),
                    externalLayouts.end(),
                    bind2nd(gd::ExternalLayoutHasName(), name)));
}
const gd::ExternalLayout& Project::GetExternalLayout(
    const gd::String& name) const {
  return *(*find_if(externalLayouts.begin(),
                    externalLayouts.end(),
                    bind2nd(gd::ExternalLayoutHasName(), name)));
}
gd::ExternalLayout& Project::GetExternalLayout(std::size_t index) {
  return *externalLayouts[index];
}
const gd::ExternalLayout& Project::GetExternalLayout(std::size_t index) const {
  return *externalLayouts[index];
}
std::size_t Project::GetExternalLayoutPosition(const gd::String& name) const {
  for (std::size_t i = 0; i < externalLayouts.size(); ++i) {
    if (externalLayouts[i]->GetName() == name) return i;
  }
  return gd::String::npos;
}

std::size_t Project::GetExternalLayoutsCount() const {
  return externalLayouts.size();
}

gd::ExternalLayout& Project::InsertNewExternalLayout(const gd::String& name,
                                                     std::size_t position) {
  gd::ExternalLayout& newlyInsertedExternalLayout = *(*(externalLayouts.emplace(
      position < externalLayouts.size() ? externalLayouts.begin() + position
                                        : externalLayouts.end(),
      new gd::ExternalLayout())));

  newlyInsertedExternalLayout.SetName(name);
  return newlyInsertedExternalLayout;
}

gd::ExternalLayout& Project::InsertExternalLayout(
    const gd::ExternalLayout& layout, std::size_t position) {
  gd::ExternalLayout& newlyInsertedExternalLayout = *(*(externalLayouts.emplace(
      position < externalLayouts.size() ? externalLayouts.begin() + position
                                        : externalLayouts.end(),
      new gd::ExternalLayout(layout))));

  return newlyInsertedExternalLayout;
}

void Project::RemoveExternalLayout(const gd::String& name) {
  std::vector<std::unique_ptr<gd::ExternalLayout> >::iterator externalLayout =
      find_if(externalLayouts.begin(),
              externalLayouts.end(),
              bind2nd(gd::ExternalLayoutHasName(), name));
  if (externalLayout == externalLayouts.end()) return;

  externalLayouts.erase(externalLayout);
}

void Project::SwapEventsFunctionsExtensions(std::size_t first,
                                            std::size_t second) {
  if (first >= eventsFunctionsExtensions.size() ||
      second >= eventsFunctionsExtensions.size())
    return;

  std::iter_swap(eventsFunctionsExtensions.begin() + first,
                 eventsFunctionsExtensions.begin() + second);
}
bool Project::HasEventsFunctionsExtensionNamed(const gd::String& name) const {
  return (
      find_if(
          eventsFunctionsExtensions.begin(),
          eventsFunctionsExtensions.end(),
          [&name](
              const std::unique_ptr<gd::EventsFunctionsExtension>& extension) {
            return extension->GetName() == name;
          }) != eventsFunctionsExtensions.end());
}
gd::EventsFunctionsExtension& Project::GetEventsFunctionsExtension(
    const gd::String& name) {
  return *(*find_if(
      eventsFunctionsExtensions.begin(),
      eventsFunctionsExtensions.end(),
      [&name](const std::unique_ptr<gd::EventsFunctionsExtension>& extension) {
        return extension->GetName() == name;
      }));
}
const gd::EventsFunctionsExtension& Project::GetEventsFunctionsExtension(
    const gd::String& name) const {
  return *(*find_if(
      eventsFunctionsExtensions.begin(),
      eventsFunctionsExtensions.end(),
      [&name](const std::unique_ptr<gd::EventsFunctionsExtension>& extension) {
        return extension->GetName() == name;
      }));
}
gd::EventsFunctionsExtension& Project::GetEventsFunctionsExtension(
    std::size_t index) {
  return *eventsFunctionsExtensions[index];
}
const gd::EventsFunctionsExtension& Project::GetEventsFunctionsExtension(
    std::size_t index) const {
  return *eventsFunctionsExtensions[index];
}
std::size_t Project::GetEventsFunctionsExtensionPosition(
    const gd::String& name) const {
  for (std::size_t i = 0; i < eventsFunctionsExtensions.size(); ++i) {
    if (eventsFunctionsExtensions[i]->GetName() == name) return i;
  }
  return gd::String::npos;
}

std::size_t Project::GetEventsFunctionsExtensionsCount() const {
  return eventsFunctionsExtensions.size();
}

gd::EventsFunctionsExtension& Project::InsertNewEventsFunctionsExtension(
    const gd::String& name, std::size_t position) {
  gd::EventsFunctionsExtension& newlyInsertedEventsFunctionsExtension =
      *(*(eventsFunctionsExtensions.emplace(
          position < eventsFunctionsExtensions.size()
              ? eventsFunctionsExtensions.begin() + position
              : eventsFunctionsExtensions.end(),
          new gd::EventsFunctionsExtension())));

  newlyInsertedEventsFunctionsExtension.SetName(name);
  return newlyInsertedEventsFunctionsExtension;
}

gd::EventsFunctionsExtension& Project::InsertEventsFunctionsExtension(
    const gd::EventsFunctionsExtension& extension, std::size_t position) {
  gd::EventsFunctionsExtension& newlyInsertedEventsFunctionsExtension =
      *(*(eventsFunctionsExtensions.emplace(
          position < eventsFunctionsExtensions.size()
              ? eventsFunctionsExtensions.begin() + position
              : eventsFunctionsExtensions.end(),
          new gd::EventsFunctionsExtension(extension))));

  return newlyInsertedEventsFunctionsExtension;
}

void Project::RemoveEventsFunctionsExtension(const gd::String& name) {
  std::vector<std::unique_ptr<gd::EventsFunctionsExtension> >::iterator
      eventsFunctionExtension = find_if(
          eventsFunctionsExtensions.begin(),
          eventsFunctionsExtensions.end(),
          [&name](
              const std::unique_ptr<gd::EventsFunctionsExtension>& extension) {
            return extension->GetName() == name;
          });
  if (eventsFunctionExtension == eventsFunctionsExtensions.end()) return;

  eventsFunctionsExtensions.erase(eventsFunctionExtension);
}
void Project::ClearEventsFunctionsExtensions() {
  eventsFunctionsExtensions.clear();
}

void Project::UnserializeFrom(const SerializerElement& element) {
  const SerializerElement& gdVersionElement =
      element.GetChild("gdVersion", 0, "GDVersion");
  gdMajorVersion =
      gdVersionElement.GetIntAttribute("major", gdMajorVersion, "Major");
  gdMinorVersion =
      gdVersionElement.GetIntAttribute("minor", gdMinorVersion, "Minor");
  gdBuildVersion = gdVersionElement.GetIntAttribute("build", 0, "Build");
  int revision = gdVersionElement.GetIntAttribute("revision", 0, "Revision");

  if (gdMajorVersion > gd::VersionWrapper::Major())
    gd::LogWarning(
        "The version of GDevelop used to create this game seems to be a new "
        "version.\nGDevelop may fail to open the game, or data may be "
        "missing.\nYou should check if a new version of GDevelop is "
        "available.");
  else {
    if ((gdMajorVersion == gd::VersionWrapper::Major() &&
         gdMinorVersion > gd::VersionWrapper::Minor()) ||
        (gdMajorVersion == gd::VersionWrapper::Major() &&
         gdMinorVersion == gd::VersionWrapper::Minor() &&
         gdBuildVersion > gd::VersionWrapper::Build()) ||
        (gdMajorVersion == gd::VersionWrapper::Major() &&
         gdMinorVersion == gd::VersionWrapper::Minor() &&
         gdBuildVersion == gd::VersionWrapper::Build() &&
         revision > gd::VersionWrapper::Revision())) {
      gd::LogWarning(
          "The version of GDevelop used to create this game seems to be "
          "greater.\nGDevelop may fail to open the game, or data may be "
          "missing.\nYou should check if a new version of GDevelop is "
          "available.");
    }
  }

  const SerializerElement& propElement =
      element.GetChild("properties", 0, "Info");
  SetName(propElement.GetChild("name", 0, "Nom").GetValue().GetString());
  SetDescription(propElement.GetChild("description", 0).GetValue().GetString());
  SetVersion(propElement.GetStringAttribute("version", "1.0.0"));
  SetGameResolutionSize(
      propElement.GetChild("windowWidth", 0, "WindowW").GetValue().GetInt(),
      propElement.GetChild("windowHeight", 0, "WindowH").GetValue().GetInt());
  SetMaximumFPS(
      propElement.GetChild("maxFPS", 0, "FPSmax").GetValue().GetInt());
  SetMinimumFPS(
      propElement.GetChild("minFPS", 0, "FPSmin").GetValue().GetInt());
  SetVerticalSyncActivatedByDefault(
      propElement.GetChild("verticalSync").GetValue().GetBool());
  SetScaleMode(propElement.GetStringAttribute("scaleMode", "linear"));
  SetPixelsRounding(propElement.GetBoolAttribute("pixelsRounding", false));
  SetAdaptGameResolutionAtRuntime(
      propElement.GetBoolAttribute("adaptGameResolutionAtRuntime", false));
  SetSizeOnStartupMode(propElement.GetStringAttribute("sizeOnStartupMode", ""));
  SetProjectUuid(propElement.GetStringAttribute("projectUuid", ""));
  SetAuthor(propElement.GetChild("author", 0, "Auteur").GetValue().GetString());
  SetPackageName(propElement.GetStringAttribute("packageName"));
  SetTemplateSlug(propElement.GetStringAttribute("templateSlug"));
  SetOrientation(propElement.GetStringAttribute("orientation", "default"));
  SetFolderProject(propElement.GetBoolAttribute("folderProject"));
  SetLastCompilationDirectory(propElement
                                  .GetChild("latestCompilationDirectory",
                                            0,
                                            "LatestCompilationDirectory")
                                  .GetValue()
                                  .GetString());
  platformSpecificAssets.UnserializeFrom(
      propElement.GetChild("platformSpecificAssets"));
  loadingScreen.UnserializeFrom(propElement.GetChild("loadingScreen"));

  useExternalSourceFiles =
      propElement.GetBoolAttribute("useExternalSourceFiles");

  authorIds.clear();
  auto& authorIdsElement = propElement.GetChild("authorIds");
  authorIdsElement.ConsiderAsArray();
  for (std::size_t i = 0; i < authorIdsElement.GetChildrenCount(); ++i) {
    authorIds.push_back(authorIdsElement.GetChild(i).GetStringValue());
  }

  categories.clear();
  auto& categoriesElement = propElement.GetChild("categories");
  categoriesElement.ConsiderAsArray();
  for (std::size_t i = 0; i < categoriesElement.GetChildrenCount(); ++i) {
    categories.push_back(categoriesElement.GetChild(i).GetStringValue());
  }

  auto& playableDevicesElement = propElement.GetChild("playableDevices");
  playableDevicesElement.ConsiderAsArray();
  for (std::size_t i = 0; i < playableDevicesElement.GetChildrenCount(); ++i) {
    const auto& playableDevice =
        playableDevicesElement.GetChild(i).GetStringValue();
    if (playableDevice == "keyboard") {
      isPlayableWithKeyboard = true;
    } else if (playableDevice == "gamepad") {
      isPlayableWithGamepad = true;
    } else if (playableDevice == "mobile") {
      isPlayableWithMobile = true;
    }
  }

  // Compatibility with GD <= 5.0.0-beta101
  if (VersionWrapper::IsOlderOrEqual(
          gdMajorVersion, gdMinorVersion, gdBuildVersion, 0, 4, 0, 98, 0) &&
      !propElement.HasAttribute("useDeprecatedZeroAsDefaultZOrder")) {
    useDeprecatedZeroAsDefaultZOrder = true;
  } else {
    useDeprecatedZeroAsDefaultZOrder =
        propElement.GetBoolAttribute("useDeprecatedZeroAsDefaultZOrder", false);
  }
  // end of compatibility code

  // Compatibility with GD <= 5.0.0-beta101
  if (!propElement.HasAttribute("projectUuid") &&
      !propElement.HasChild("projectUuid")) {
    ResetProjectUuid();
  }
  // end of compatibility code

  extensionProperties.UnserializeFrom(
      propElement.GetChild("extensionProperties"));

  // Compatibility with GD <= 5.0.0-beta98
  // Move AdMob App ID from project property to extension property.
  if (propElement.GetStringAttribute("adMobAppId", "") != "") {
    extensionProperties.SetValue(
        "AdMob",
        "AdMobAppId",
        propElement.GetStringAttribute("adMobAppId", ""));
  }
  // end of compatibility code

  currentPlatform = NULL;
  gd::String currentPlatformName =
      propElement.GetChild("currentPlatform").GetValue().GetString();
  // Compatibility code
  if (VersionWrapper::IsOlderOrEqual(
          gdMajorVersion, gdMajorVersion, gdMinorVersion, 0, 3, 4, 73, 0)) {
    if (currentPlatformName == "Game Develop C++ platform")
      currentPlatformName = "GDevelop C++ platform";
    if (currentPlatformName == "Game Develop JS platform")
      currentPlatformName = "GDevelop JS platform";
  }
  // End of Compatibility code

  const SerializerElement& platformsElement =
      propElement.GetChild("platforms", 0, "Platforms");
  platformsElement.ConsiderAsArrayOf("platform", "Platform");
  for (std::size_t i = 0; i < platformsElement.GetChildrenCount(); ++i) {
    gd::String name = platformsElement.GetChild(i).GetStringAttribute("name");
    // Compatibility code
    if (VersionWrapper::IsOlderOrEqual(
            gdMajorVersion, gdMajorVersion, gdMinorVersion, 0, 3, 4, 73, 0)) {
      if (name == "Game Develop C++ platform") name = "GDevelop C++ platform";
      if (name == "Game Develop JS platform") name = "GDevelop JS platform";
    }
    // End of Compatibility code

    gd::Platform* platform = gd::PlatformManager::Get()->GetPlatform(name);

    if (platform) {
      AddPlatform(*platform);
      if (platform->GetName() == currentPlatformName ||
          currentPlatformName.empty())
        currentPlatform = platform;
    } else {
      std::cout << "Platform \"" << name << "\" is unknown." << std::endl;
    }
  }

  // Compatibility code
  if (platformsElement.GetChildrenCount() == 0) {
    // Compatibility with GD2.x
    platforms.push_back(
        gd::PlatformManager::Get()->GetPlatform("GDevelop C++ platform"));
    currentPlatform = platforms.back();
  }
  // End of Compatibility code

  if (currentPlatform == NULL && !platforms.empty())
    currentPlatform = platforms.back();

  eventsFunctionsExtensions.clear();
  const SerializerElement& eventsFunctionsExtensionsElement =
      element.GetChild("eventsFunctionsExtensions");
  eventsFunctionsExtensionsElement.ConsiderAsArrayOf(
      "eventsFunctionsExtension");
  // First, only unserialize behaviors and objects names.
  // As event based objects can contains CustomObject and Custom Object,
  // this allows them to reference EventBasedBehavior and EventBasedObject
  // respectively.
  for (std::size_t i = 0;
       i < eventsFunctionsExtensionsElement.GetChildrenCount();
       ++i) {
    const SerializerElement& eventsFunctionsExtensionElement =
        eventsFunctionsExtensionsElement.GetChild(i);

    gd::EventsFunctionsExtension& newEventsFunctionsExtension =
        InsertNewEventsFunctionsExtension("",
                                          GetEventsFunctionsExtensionsCount());
    newEventsFunctionsExtension.UnserializeExtensionDeclarationFrom(
        *this, eventsFunctionsExtensionElement);
  }
  // Then unserialize functions, behaviors and objects content.
  for (std::size_t i = 0;
       i < eventsFunctionsExtensionsElement.GetChildrenCount();
       ++i) {
    const SerializerElement& eventsFunctionsExtensionElement =
        eventsFunctionsExtensionsElement.GetChild(i);

    eventsFunctionsExtensions.at(i)->UnserializeExtensionImplementationFrom(
        *this, eventsFunctionsExtensionElement);
  }

  GetObjectGroups().UnserializeFrom(
      element.GetChild("objectsGroups", 0, "ObjectGroups"));
  resourcesManager.UnserializeFrom(
      element.GetChild("resources", 0, "Resources"));
  UnserializeObjectsFrom(*this, element.GetChild("objects", 0, "Objects"));
  GetVariables().UnserializeFrom(element.GetChild("variables", 0, "Variables"));

  scenes.clear();
  const SerializerElement& layoutsElement =
      element.GetChild("layouts", 0, "Scenes");
  layoutsElement.ConsiderAsArrayOf("layout", "Scene");
  for (std::size_t i = 0; i < layoutsElement.GetChildrenCount(); ++i) {
    const SerializerElement& layoutElement = layoutsElement.GetChild(i);

    gd::Layout& layout = InsertNewLayout(
        layoutElement.GetStringAttribute("name", "", "nom"), -1);
    layout.UnserializeFrom(*this, layoutElement);
  }
  SetFirstLayout(element.GetChild("firstLayout").GetStringValue());

  externalEvents.clear();
  const SerializerElement& externalEventsElement =
      element.GetChild("externalEvents", 0, "ExternalEvents");
  externalEventsElement.ConsiderAsArrayOf("externalEvents", "ExternalEvents");
  for (std::size_t i = 0; i < externalEventsElement.GetChildrenCount(); ++i) {
    const SerializerElement& externalEventElement =
        externalEventsElement.GetChild(i);

    gd::ExternalEvents& externalEvents = InsertNewExternalEvents(
        externalEventElement.GetStringAttribute("name", "", "Name"),
        GetExternalEventsCount());
    externalEvents.UnserializeFrom(*this, externalEventElement);
  }

  externalLayouts.clear();
  const SerializerElement& externalLayoutsElement =
      element.GetChild("externalLayouts", 0, "ExternalLayouts");
  externalLayoutsElement.ConsiderAsArrayOf("externalLayout", "ExternalLayout");
  for (std::size_t i = 0; i < externalLayoutsElement.GetChildrenCount(); ++i) {
    const SerializerElement& externalLayoutElement =
        externalLayoutsElement.GetChild(i);

    gd::ExternalLayout& newExternalLayout =
        InsertNewExternalLayout("", GetExternalLayoutsCount());
    newExternalLayout.UnserializeFrom(externalLayoutElement);
  }

  externalSourceFiles.clear();
  const SerializerElement& externalSourceFilesElement =
      element.GetChild("externalSourceFiles", 0, "ExternalSourceFiles");
  externalSourceFilesElement.ConsiderAsArrayOf("sourceFile", "SourceFile");
  for (std::size_t i = 0; i < externalSourceFilesElement.GetChildrenCount();
       ++i) {
    const SerializerElement& sourceFileElement =
        externalSourceFilesElement.GetChild(i);

    gd::SourceFile& newSourceFile = InsertNewSourceFile("", "");
    newSourceFile.UnserializeFrom(sourceFileElement);
  }
}

void Project::SerializeTo(SerializerElement& element) const {
  SerializerElement& versionElement = element.AddChild("gdVersion");
  versionElement.SetAttribute("major", gd::VersionWrapper::Major());
  versionElement.SetAttribute("minor", gd::VersionWrapper::Minor());
  versionElement.SetAttribute("build", gd::VersionWrapper::Build());
  versionElement.SetAttribute("revision", gd::VersionWrapper::Revision());

  SerializerElement& propElement = element.AddChild("properties");
  propElement.AddChild("name").SetValue(GetName());
  propElement.AddChild("description").SetValue(GetDescription());
  propElement.SetAttribute("version", GetVersion());
  propElement.AddChild("author").SetValue(GetAuthor());
  propElement.AddChild("windowWidth").SetValue(GetGameResolutionWidth());
  propElement.AddChild("windowHeight").SetValue(GetGameResolutionHeight());
  propElement.AddChild("latestCompilationDirectory")
      .SetValue(GetLastCompilationDirectory());
  propElement.AddChild("maxFPS").SetValue(GetMaximumFPS());
  propElement.AddChild("minFPS").SetValue(GetMinimumFPS());
  propElement.AddChild("verticalSync")
      .SetValue(IsVerticalSynchronizationEnabledByDefault());
  propElement.SetAttribute("scaleMode", scaleMode);
  propElement.SetAttribute("pixelsRounding", pixelsRounding);
  propElement.SetAttribute("adaptGameResolutionAtRuntime",
                           adaptGameResolutionAtRuntime);
  propElement.SetAttribute("sizeOnStartupMode", sizeOnStartupMode);
  propElement.SetAttribute("projectUuid", projectUuid);
  propElement.SetAttribute("folderProject", folderProject);
  propElement.SetAttribute("packageName", packageName);
  propElement.SetAttribute("templateSlug", templateSlug);
  propElement.SetAttribute("orientation", orientation);
  platformSpecificAssets.SerializeTo(
      propElement.AddChild("platformSpecificAssets"));
  loadingScreen.SerializeTo(propElement.AddChild("loadingScreen"));
  propElement.SetAttribute("useExternalSourceFiles", useExternalSourceFiles);

  auto& authorIdsElement = propElement.AddChild("authorIds");
  authorIdsElement.ConsiderAsArray();
  for (const auto& authorId : authorIds) {
    authorIdsElement.AddChild("").SetStringValue(authorId);
  }

  auto& categoriesElement = propElement.AddChild("categories");
  categoriesElement.ConsiderAsArray();
  for (const auto& category : categories) {
    categoriesElement.AddChild("").SetStringValue(category);
  }

  auto& playableDevicesElement = propElement.AddChild("playableDevices");
  playableDevicesElement.ConsiderAsArray();
  if (isPlayableWithKeyboard) {
    playableDevicesElement.AddChild("").SetStringValue("keyboard");
  }
  if (isPlayableWithGamepad) {
    playableDevicesElement.AddChild("").SetStringValue("gamepad");
  }
  if (isPlayableWithMobile) {
    playableDevicesElement.AddChild("").SetStringValue("mobile");
  }

  // Compatibility with GD <= 5.0.0-beta101
  if (useDeprecatedZeroAsDefaultZOrder) {
    propElement.SetAttribute("useDeprecatedZeroAsDefaultZOrder", true);
  }
  // end of compatibility code

  extensionProperties.SerializeTo(propElement.AddChild("extensionProperties"));

  SerializerElement& platformsElement = propElement.AddChild("platforms");
  platformsElement.ConsiderAsArrayOf("platform");
  for (std::size_t i = 0; i < platforms.size(); ++i) {
    if (platforms[i] == NULL) {
      std::cout << "ERROR: The project has a platform which is NULL.";
      continue;
    }

    platformsElement.AddChild("platform")
        .SetAttribute("name", platforms[i]->GetName());
  }
  if (currentPlatform != NULL)
    propElement.AddChild("currentPlatform")
        .SetValue(currentPlatform->GetName());
  else
    std::cout << "ERROR: The project current platform is NULL.";

  resourcesManager.SerializeTo(element.AddChild("resources"));
  SerializeObjectsTo(element.AddChild("objects"));
  GetObjectGroups().SerializeTo(element.AddChild("objectsGroups"));
  GetVariables().SerializeTo(element.AddChild("variables"));

  element.SetAttribute("firstLayout", firstLayout);
  gd::SerializerElement& layoutsElement = element.AddChild("layouts");
  layoutsElement.ConsiderAsArrayOf("layout");
  for (std::size_t i = 0; i < GetLayoutsCount(); i++)
    GetLayout(i).SerializeTo(layoutsElement.AddChild("layout"));

  SerializerElement& externalEventsElement = element.AddChild("externalEvents");
  externalEventsElement.ConsiderAsArrayOf("externalEvents");
  for (std::size_t i = 0; i < GetExternalEventsCount(); ++i)
    GetExternalEvents(i).SerializeTo(
        externalEventsElement.AddChild("externalEvents"));

  SerializerElement& eventsFunctionsExtensionsElement =
      element.AddChild("eventsFunctionsExtensions");
  eventsFunctionsExtensionsElement.ConsiderAsArrayOf(
      "eventsFunctionsExtension");
  for (std::size_t i = 0; i < eventsFunctionsExtensions.size(); ++i)
    eventsFunctionsExtensions[i]->SerializeTo(
        eventsFunctionsExtensionsElement.AddChild("eventsFunctionsExtension"));

  SerializerElement& externalLayoutsElement =
      element.AddChild("externalLayouts");
  externalLayoutsElement.ConsiderAsArrayOf("externalLayout");
  for (std::size_t i = 0; i < externalLayouts.size(); ++i)
    externalLayouts[i]->SerializeTo(
        externalLayoutsElement.AddChild("externalLayout"));

  SerializerElement& externalSourceFilesElement =
      element.AddChild("externalSourceFiles");
  externalSourceFilesElement.ConsiderAsArrayOf("sourceFile");
  for (std::size_t i = 0; i < externalSourceFiles.size(); ++i)
    externalSourceFiles[i]->SerializeTo(
        externalSourceFilesElement.AddChild("sourceFile"));
}

bool Project::ValidateName(const gd::String& name) {
  if (name.empty()) return false;

  if (isdigit(name[0])) return false;

  gd::String allowedCharacters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
  return !(name.find_first_not_of(allowedCharacters) != gd::String::npos);
}

void Project::ExposeResources(gd::ArbitraryResourceWorker& worker) {
  // See also gd::WholeProjectRefactorer::ExposeProjectEvents for a method that
  // traverse the whole project (this time for events) and ExposeProjectEffects
  // (this time for effects). Ideally, this method could be moved outside of
  // gd::Project.

  // Add project resources
  worker.ExposeResources(&GetResourcesManager());
  platformSpecificAssets.ExposeResources(worker);

  // Add layouts resources
  for (std::size_t s = 0; s < GetLayoutsCount(); s++) {
    for (std::size_t j = 0; j < GetLayout(s).GetObjectsCount();
         ++j) { // Add objects resources
      GetLayout(s).GetObject(j).GetConfiguration().ExposeResources(worker);
    }

    LaunchResourceWorkerOnEvents(*this, GetLayout(s).GetEvents(), worker);
  }
  // Add external events resources
  for (std::size_t s = 0; s < GetExternalEventsCount(); s++) {
    LaunchResourceWorkerOnEvents(
        *this, GetExternalEvents(s).GetEvents(), worker);
  }
  // Add events functions extensions resources
  for (std::size_t e = 0; e < GetEventsFunctionsExtensionsCount(); e++) {
    auto& eventsFunctionsExtension = GetEventsFunctionsExtension(e);
    for (auto&& eventsFunction : eventsFunctionsExtension.GetInternalVector()) {
      LaunchResourceWorkerOnEvents(*this, eventsFunction->GetEvents(), worker);
    }
  }

  // Add global objects resources
  for (std::size_t j = 0; j < GetObjectsCount(); ++j) {
    GetObject(j).GetConfiguration().ExposeResources(worker);
  }

  // Add loading screen background image if present
  if (loadingScreen.GetBackgroundImageResourceName() != "")
    worker.ExposeImage(loadingScreen.GetBackgroundImageResourceName());
}

bool Project::HasSourceFile(gd::String name, gd::String language) const {
  vector<std::unique_ptr<SourceFile> >::const_iterator sourceFile =
      find_if(externalSourceFiles.begin(),
              externalSourceFiles.end(),
              bind2nd(gd::ExternalSourceFileHasName(), name));

  if (sourceFile == externalSourceFiles.end()) return false;

  return language.empty() || (*sourceFile)->GetLanguage() == language;
}

gd::SourceFile& Project::GetSourceFile(const gd::String& name) {
  return *(*find_if(externalSourceFiles.begin(),
                    externalSourceFiles.end(),
                    bind2nd(gd::ExternalSourceFileHasName(), name)));
}

const gd::SourceFile& Project::GetSourceFile(const gd::String& name) const {
  return *(*find_if(externalSourceFiles.begin(),
                    externalSourceFiles.end(),
                    bind2nd(gd::ExternalSourceFileHasName(), name)));
}

void Project::RemoveSourceFile(const gd::String& name) {
  std::vector<std::unique_ptr<gd::SourceFile> >::iterator sourceFile =
      find_if(externalSourceFiles.begin(),
              externalSourceFiles.end(),
              bind2nd(gd::ExternalSourceFileHasName(), name));
  if (sourceFile == externalSourceFiles.end()) return;

  externalSourceFiles.erase(sourceFile);
}

gd::SourceFile& Project::InsertNewSourceFile(const gd::String& name,
                                             const gd::String& language,
                                             std::size_t position) {
  if (HasSourceFile(name, language)) return GetSourceFile(name);

  gd::SourceFile& newlyInsertedSourceFile = *(
      *(externalSourceFiles.emplace(position < externalSourceFiles.size()
                                        ? externalSourceFiles.begin() + position
                                        : externalSourceFiles.end(),
                                    new SourceFile())));
  newlyInsertedSourceFile.SetLanguage(language);
  newlyInsertedSourceFile.SetFileName(name);

  return newlyInsertedSourceFile;
}

Project::Project(const Project& other) { Init(other); }

Project& Project::operator=(const Project& other) {
  if (this != &other) Init(other);

  return *this;
}

void Project::Init(const gd::Project& game) {
  name = game.name;
  categories = game.categories;
  description = game.description;
  firstLayout = game.firstLayout;
  version = game.version;
  windowWidth = game.windowWidth;
  windowHeight = game.windowHeight;
  maxFPS = game.maxFPS;
  minFPS = game.minFPS;
  verticalSync = game.verticalSync;
  scaleMode = game.scaleMode;
  pixelsRounding = game.pixelsRounding;
  adaptGameResolutionAtRuntime = game.adaptGameResolutionAtRuntime;
  sizeOnStartupMode = game.sizeOnStartupMode;
  projectUuid = game.projectUuid;
  useDeprecatedZeroAsDefaultZOrder = game.useDeprecatedZeroAsDefaultZOrder;

  author = game.author;
  authorIds = game.authorIds;
  isPlayableWithKeyboard = game.isPlayableWithKeyboard;
  isPlayableWithGamepad = game.isPlayableWithGamepad;
  isPlayableWithMobile = game.isPlayableWithMobile;
  packageName = game.packageName;
  templateSlug = game.templateSlug;
  orientation = game.orientation;
  folderProject = game.folderProject;
  latestCompilationDirectory = game.latestCompilationDirectory;
  platformSpecificAssets = game.platformSpecificAssets;
  loadingScreen = game.loadingScreen;
  objectGroups = game.objectGroups;

  extensionProperties = game.extensionProperties;

  gdMajorVersion = game.gdMajorVersion;
  gdMinorVersion = game.gdMinorVersion;
  gdBuildVersion = game.gdBuildVersion;

  currentPlatform = game.currentPlatform;
  platforms = game.platforms;

  resourcesManager = game.resourcesManager;

  initialObjects = gd::Clone(game.initialObjects);

  scenes = gd::Clone(game.scenes);

  externalEvents = gd::Clone(game.externalEvents);

  externalLayouts = gd::Clone(game.externalLayouts);
  eventsFunctionsExtensions = gd::Clone(game.eventsFunctionsExtensions);

  useExternalSourceFiles = game.useExternalSourceFiles;

  externalSourceFiles = gd::Clone(game.externalSourceFiles);

  variables = game.GetVariables();

  projectFile = game.GetProjectFile();
}

}  // namespace gd
