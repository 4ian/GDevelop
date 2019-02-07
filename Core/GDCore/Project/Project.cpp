/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "Project.h"
#include <stdio.h>
#include <stdlib.h>
#include <SFML/System/Utf.hpp>
#include <fstream>
#include <map>
#include <vector>
#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Dialogs/ChooseVariableDialog.h"
#include "GDCore/IDE/Dialogs/ProjectExtensionsDialog.h"
#include "GDCore/IDE/Dialogs/ProjectUpdateDialog.h"
#include "GDCore/IDE/PlatformManager.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/IDE/wxTools/SafeYield.h"
#include "GDCore/Project/ChangesNotifier.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/ImageManager.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectGroupsContainer.h"
#include "GDCore/Project/ResourcesManager.h"
#include "GDCore/Project/SourceFile.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Serialization/Splitter.h"
#include "GDCore/String.h"
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/PolymorphicClone.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDCore/Utf8/utf8.h"
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/filename.h>
// clang-format off
#include <wx/propgrid/propgrid.h>
#include <wx/propgrid/advprops.h>
// clang-format on
#include <wx/settings.h>
#include <wx/utils.h>
#endif

using namespace std;

#undef CreateEvent

namespace gd {

Project::Project()
    :
#if defined(GD_IDE_ONLY)
      name(_("Project")),
      version("1.0.0"),
      packageName("com.example.gamename"),
      orientation("landscape"),
      adMobAppId(""),
      folderProject(false),
#endif
      windowWidth(800),
      windowHeight(600),
      maxFPS(60),
      minFPS(10),
      verticalSync(false),
      scaleMode("linear"),
      sizeOnStartupMode("adaptWidth"),
      imageManager(std::make_shared<ImageManager>())
#if defined(GD_IDE_ONLY)
      ,
      useExternalSourceFiles(false),
      currentPlatform(NULL),
      gdMajorVersion(gd::VersionWrapper::Major()),
      gdMinorVersion(gd::VersionWrapper::Minor()),
      gdBuildVersion(gd::VersionWrapper::Build()),
      dirty(false)
#endif
{
  imageManager->SetResourcesManager(&resourcesManager);
#if defined(GD_IDE_ONLY)
  // Game use builtin extensions by default
  extensionsUsed.push_back("BuiltinObject");
  extensionsUsed.push_back("BuiltinAudio");
  extensionsUsed.push_back("BuiltinVariables");
  extensionsUsed.push_back("BuiltinTime");
  extensionsUsed.push_back("BuiltinMouse");
  extensionsUsed.push_back("BuiltinKeyboard");
  extensionsUsed.push_back("BuiltinJoystick");
  extensionsUsed.push_back("BuiltinCamera");
  extensionsUsed.push_back("BuiltinWindow");
  extensionsUsed.push_back("BuiltinFile");
  extensionsUsed.push_back("BuiltinNetwork");
  extensionsUsed.push_back("BuiltinScene");
  extensionsUsed.push_back("BuiltinAdvanced");
  extensionsUsed.push_back("Sprite");
  extensionsUsed.push_back("BuiltinCommonInstructions");
  extensionsUsed.push_back("BuiltinCommonConversions");
  extensionsUsed.push_back("BuiltinStringInstructions");
  extensionsUsed.push_back("BuiltinMathematicalTools");
  extensionsUsed.push_back("BuiltinExternalLayouts");
#endif

#if !defined(GD_IDE_ONLY)
  platforms.push_back(&CppPlatform::Get());
#endif
}

Project::~Project() {}

std::unique_ptr<gd::Object> Project::CreateObject(
    const gd::String& type,
    const gd::String& name,
    const gd::String& platformName) {
  for (std::size_t i = 0; i < platforms.size(); ++i) {
    if (!platformName.empty() && platforms[i]->GetName() != platformName)
      continue;

    std::unique_ptr<gd::Object> object = platforms[i]->CreateObject(
        type, name);  // Create a base object if the type can't be found in the
                      // platform
    if (object && object->GetType() == type)
      return object;  // If the object is valid and has the good type (not a
                      // base object), return it
  }

  return nullptr;
}

std::unique_ptr<gd::Behavior> Project::CreateBehavior(
    const gd::String& type, const gd::String& platformName) {
  for (std::size_t i = 0; i < platforms.size(); ++i) {
    if (!platformName.empty() && platforms[i]->GetName() != platformName)
      continue;

    std::unique_ptr<gd::Behavior> behavior = platforms[i]->CreateBehavior(type);
    if (behavior) return behavior;
  }

  return nullptr;
}

std::shared_ptr<gd::BehaviorsSharedData> Project::CreateBehaviorSharedDatas(
    const gd::String& type, const gd::String& platformName) {
  for (std::size_t i = 0; i < platforms.size(); ++i) {
    if (!platformName.empty() && platforms[i]->GetName() != platformName)
      continue;

    std::shared_ptr<gd::BehaviorsSharedData> behavior =
        platforms[i]->CreateBehaviorSharedDatas(type);
    if (behavior) return behavior;
  }

  return std::shared_ptr<gd::BehaviorsSharedData>();
}

#if defined(GD_IDE_ONLY)
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
#endif

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

#if defined(GD_IDE_ONLY)
void Project::SwapLayouts(std::size_t first, std::size_t second) {
  if (first >= scenes.size() || second >= scenes.size()) return;

  std::iter_swap(scenes.begin() + first, scenes.begin() + second);
}
#endif

gd::Layout& Project::InsertNewLayout(const gd::String& name,
                                     std::size_t position) {
  gd::Layout& newlyInsertedLayout = *(*(scenes.emplace(
      position < scenes.size() ? scenes.begin() + position : scenes.end(),
      new Layout())));

  newlyInsertedLayout.SetName(name);
#if defined(GD_IDE_ONLY)
  newlyInsertedLayout.UpdateBehaviorsSharedData(*this);
#endif

  return newlyInsertedLayout;
}

gd::Layout& Project::InsertLayout(const gd::Layout& layout,
                                  std::size_t position) {
  gd::Layout& newlyInsertedLayout = *(*(scenes.emplace(
      position < scenes.size() ? scenes.begin() + position : scenes.end(),
      new Layout(layout))));

#if defined(GD_IDE_ONLY)
  newlyInsertedLayout.UpdateBehaviorsSharedData(*this);
#endif

  return newlyInsertedLayout;
}

void Project::RemoveLayout(const gd::String& name) {
  std::vector<std::unique_ptr<gd::Layout> >::iterator scene =
      find_if(scenes.begin(), scenes.end(), bind2nd(gd::LayoutHasName(), name));
  if (scene == scenes.end()) return;

  scenes.erase(scene);
}

#if defined(GD_IDE_ONLY)
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
#endif
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

#if defined(GD_IDE_ONLY)
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
#endif

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
// Compatibility with GD2.x
class SpriteObjectsPositionUpdater : public gd::InitialInstanceFunctor {
 public:
  SpriteObjectsPositionUpdater(gd::Project& project_, gd::Layout& layout_)
      : project(project_), layout(layout_){};
  virtual ~SpriteObjectsPositionUpdater(){};

  virtual void operator()(gd::InitialInstance& instance) {
    gd::Object* object = NULL;
    if (layout.HasObjectNamed(instance.GetObjectName()))
      object = &layout.GetObject(instance.GetObjectName());
    else if (project.HasObjectNamed(instance.GetObjectName()))
      object = &project.GetObject(instance.GetObjectName());
    else
      return;

    if (object->GetType() != "Sprite") return;
    if (!instance.HasCustomSize()) return;

    wxSetWorkingDirectory(
        wxFileName::FileName(project.GetProjectFile()).GetPath());
    object->LoadResources(project, layout);

    sf::Vector2f size =
        object->GetInitialInstanceDefaultSize(instance, project, layout);

    instance.SetX(instance.GetX() + size.x / 2 - instance.GetCustomWidth() / 2);
    instance.SetY(instance.GetY() + size.y / 2 -
                  instance.GetCustomHeight() / 2);
  }

 private:
  gd::Project& project;
  gd::Layout& layout;
};
// End of compatibility code
#endif

void Project::UnserializeFrom(const SerializerElement& element) {
// Checking version
#if defined(GD_IDE_ONLY)
  gd::String updateText;

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
        _("The version of GDevelop used to create this game seems to be a new "
          "version.\nGDevelop may fail to open the game, or data may be "
          "missing.\nYou should check if a new version of GDevelop is "
          "available."));
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
          _("The version of GDevelop used to create this game seems to be "
            "greater.\nGDevelop may fail to open the game, or data may be "
            "missing.\nYou should check if a new version of GDevelop is "
            "available."));
    }
  }

  // Compatibility code
  if (gdMajorVersion <= 1) {
    gd::LogError(_(
        "The game was saved with version of GDevelop which is too old. Please "
        "open and save the game with one of the first version of GDevelop 2. "
        "You will then be able to open your game with this GDevelop version."));
    return;
  }
// End of Compatibility code
#endif

  const SerializerElement& propElement =
      element.GetChild("properties", 0, "Info");
  SetName(propElement.GetChild("name", 0, "Nom").GetValue().GetString());
  SetVersion(propElement.GetStringAttribute("version", "1.0.0"));
  SetDefaultWidth(
      propElement.GetChild("windowWidth", 0, "WindowW").GetValue().GetInt());
  SetDefaultHeight(
      propElement.GetChild("windowHeight", 0, "WindowH").GetValue().GetInt());
  SetMaximumFPS(
      propElement.GetChild("maxFPS", 0, "FPSmax").GetValue().GetInt());
  SetMinimumFPS(
      propElement.GetChild("minFPS", 0, "FPSmin").GetValue().GetInt());
  SetVerticalSyncActivatedByDefault(
      propElement.GetChild("verticalSync").GetValue().GetBool());
  SetScaleMode(propElement.GetStringAttribute("scaleMode", "linear"));
  SetSizeOnStartupMode(propElement.GetStringAttribute("sizeOnStartupMode", ""));
#if defined(GD_IDE_ONLY)
  SetAuthor(propElement.GetChild("author", 0, "Auteur").GetValue().GetString());
  SetPackageName(propElement.GetStringAttribute("packageName"));
  SetOrientation(propElement.GetStringAttribute("orientation", "default"));
  SetAdMobAppId(propElement.GetStringAttribute("adMobAppId", ""));
  SetFolderProject(propElement.GetBoolAttribute("folderProject"));
  SetProjectFile(propElement.GetStringAttribute("projectFile"));
  SetLastCompilationDirectory(propElement
                                  .GetChild("latestCompilationDirectory",
                                            0,
                                            "LatestCompilationDirectory")
                                  .GetValue()
                                  .GetString());
  platformSpecificAssets.UnserializeFrom(
      propElement.GetChild("platformSpecificAssets"));
  loadingScreen.UnserializeFrom(propElement.GetChild("loadingScreen"));
  winExecutableFilename =
      propElement.GetStringAttribute("winExecutableFilename");
  winExecutableIconFile =
      propElement.GetStringAttribute("winExecutableIconFile");
  linuxExecutableFilename =
      propElement.GetStringAttribute("linuxExecutableFilename");
  macExecutableFilename =
      propElement.GetStringAttribute("macExecutableFilename");
  useExternalSourceFiles =
      propElement.GetBoolAttribute("useExternalSourceFiles");
#endif

  const SerializerElement& extensionsElement =
      propElement.GetChild("extensions", 0, "Extensions");
  extensionsElement.ConsiderAsArrayOf("extension", "Extension");
  for (std::size_t i = 0; i < extensionsElement.GetChildrenCount(); ++i) {
    gd::String extensionName =
        extensionsElement.GetChild(i).GetStringAttribute("name");
    if (find(GetUsedExtensions().begin(),
             GetUsedExtensions().end(),
             extensionName) == GetUsedExtensions().end())
      GetUsedExtensions().push_back(extensionName);
  }

#if defined(GD_IDE_ONLY)
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
#endif

// Compatibility code
#if defined(GD_IDE_ONLY)
  if (VersionWrapper::IsOlder(gdMajorVersion, 0, 0, 0, 3, 0, 0, 0)) {
    updateText +=
        _("Sprite scaling has changed since GD 2: The resizing is made so that "
          "the origin point of the object won't move whatever the scale of the "
          "object.\n");
    updateText +=
        _("You may have to slightly change the position of some objects if you "
          "have changed their size.\n\n");
    updateText += _("Thank you for your understanding.\n");
  }
#endif
// End of Compatibility code

// Compatibility code
#if defined(GD_IDE_ONLY)
  if (VersionWrapper::IsOlderOrEqual(gdMajorVersion,
                                     gdMinorVersion,
                                     revision,
                                     gdBuildVersion,
                                     2,
                                     2,
                                     1,
                                     10822)) {
    if (std::find(GetUsedExtensions().begin(),
                  GetUsedExtensions().end(),
                  "BuiltinExternalLayouts") == GetUsedExtensions().end())
      GetUsedExtensions().push_back("BuiltinExternalLayouts");
  }
#endif

// Compatibility code
#if defined(GD_IDE_ONLY)
  if (VersionWrapper::IsOlderOrEqual(gdMajorVersion,
                                     gdMinorVersion,
                                     revision,
                                     gdBuildVersion,
                                     3,
                                     3,
                                     3,
                                     0)) {
    if (std::find(GetUsedExtensions().begin(),
                  GetUsedExtensions().end(),
                  "AStarBehavior") != GetUsedExtensions().end()) {
      GetUsedExtensions().erase(std::remove(GetUsedExtensions().begin(),
                                            GetUsedExtensions().end(),
                                            "AStarBehavior"),
                                GetUsedExtensions().end());
      GetUsedExtensions().push_back("PathfindingBehavior");
      updateText +=
          _("The project is using the pathfinding behavior. This behavior has "
            "been replaced by a new one:\n");
      updateText +=
          _("You must add the new 'Pathfinding' behavior to the objects that "
            "need to be moved, and add the 'Pathfinding Obstacle' to the "
            "objects that must act as obstacles.");
    }
  }
#endif

// Compatibility code
#if defined(GD_IDE_ONLY)
  if (VersionWrapper::IsOlderOrEqual(gdMajorVersion,
                                     gdMinorVersion,
                                     revision,
                                     gdBuildVersion,
                                     4,
                                     0,
                                     85,
                                     0)) {
    for (unsigned int i = 0; i < extensionsUsed.size(); ++i)
      extensionsUsed[i] =
          extensionsUsed[i].FindAndReplace("Automatism", "Behavior");
  }
#endif

#if defined(GD_IDE_ONLY)
  GetObjectGroups().UnserializeFrom(
      element.GetChild("objectsGroups", 0, "ObjectGroups"));
#endif
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

// Compatibility code with GD 2.x
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    if (gdMajorVersion <= 2) {
      SpriteObjectsPositionUpdater updater(*this, layout);
      gd::InitialInstancesContainer& instances = layout.GetInitialInstances();
      instances.IterateOverInstances(updater);
    }
#endif
    // End of compatibility code
  }

#if defined(GD_IDE_ONLY)
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

  eventsFunctionsExtensions.clear();
  const SerializerElement& eventsFunctionsExtensionsElement =
      element.GetChild("eventsFunctionsExtensions");
  eventsFunctionsExtensionsElement.ConsiderAsArrayOf(
      "eventsFunctionsExtension");
  for (std::size_t i = 0;
       i < eventsFunctionsExtensionsElement.GetChildrenCount();
       ++i) {
    const SerializerElement& eventsFunctionsExtensionElement =
        eventsFunctionsExtensionsElement.GetChild(i);

    gd::EventsFunctionsExtension& newEventsFunctionsExtension =
        InsertNewEventsFunctionsExtension("",
                                          GetEventsFunctionsExtensionsCount());
    newEventsFunctionsExtension.UnserializeFrom(
        *this, eventsFunctionsExtensionElement);
  }
#endif

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

#if defined(GD_IDE_ONLY)
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

#if !defined(GD_NO_WX_GUI)
  if (!updateText.empty())  // TODO
  {
    ProjectUpdateDialog updateDialog(NULL, updateText);
    updateDialog.ShowModal();
  }

  dirty = false;
#endif

#endif
}

#if defined(GD_IDE_ONLY)
void Project::SerializeTo(SerializerElement& element) const {
  SerializerElement& versionElement = element.AddChild("gdVersion");
  versionElement.SetAttribute("major", gd::VersionWrapper::Major());
  versionElement.SetAttribute("minor", gd::VersionWrapper::Minor());
  versionElement.SetAttribute("build", gd::VersionWrapper::Build());
  versionElement.SetAttribute("revision", gd::VersionWrapper::Revision());

  SerializerElement& propElement = element.AddChild("properties");
  propElement.AddChild("name").SetValue(GetName());
  propElement.SetAttribute("version", GetVersion());
  propElement.AddChild("author").SetValue(GetAuthor());
  propElement.AddChild("windowWidth").SetValue(GetMainWindowDefaultWidth());
  propElement.AddChild("windowHeight").SetValue(GetMainWindowDefaultHeight());
  propElement.AddChild("latestCompilationDirectory")
      .SetValue(GetLastCompilationDirectory());
  propElement.AddChild("maxFPS").SetValue(GetMaximumFPS());
  propElement.AddChild("minFPS").SetValue(GetMinimumFPS());
  propElement.AddChild("verticalSync")
      .SetValue(IsVerticalSynchronizationEnabledByDefault());
  propElement.SetAttribute("scaleMode", scaleMode);
  propElement.SetAttribute("sizeOnStartupMode", sizeOnStartupMode);
  propElement.SetAttribute("projectFile", gameFile);
  propElement.SetAttribute("folderProject", folderProject);
  propElement.SetAttribute("packageName", packageName);
  propElement.SetAttribute("orientation", orientation);
  propElement.SetAttribute("adMobAppId", adMobAppId);
  platformSpecificAssets.SerializeTo(
      propElement.AddChild("platformSpecificAssets"));
  loadingScreen.SerializeTo(propElement.AddChild("loadingScreen"));
  propElement.SetAttribute("winExecutableFilename", winExecutableFilename);
  propElement.SetAttribute("winExecutableIconFile", winExecutableIconFile);
  propElement.SetAttribute("linuxExecutableFilename", linuxExecutableFilename);
  propElement.SetAttribute("macExecutableFilename", macExecutableFilename);
  propElement.SetAttribute("useExternalSourceFiles", useExternalSourceFiles);

  SerializerElement& extensionsElement = propElement.AddChild("extensions");
  extensionsElement.ConsiderAsArrayOf("extension");
  for (std::size_t i = 0; i < GetUsedExtensions().size(); ++i)
    extensionsElement.AddChild("extension")
        .SetAttribute("name", GetUsedExtensions()[i]);

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

#if defined(GD_IDE_ONLY)
  dirty = false;
#endif
}

bool Project::ValidateObjectName(const gd::String& name) {
  gd::String allowedCharacters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
  return !(name.find_first_not_of(allowedCharacters) != gd::String::npos);
}

gd::String Project::GetBadObjectNameWarning() {
  return _("Please use only letters, digits\nand underscores ( _ ).");
}

void Project::ExposeResources(gd::ArbitraryResourceWorker& worker) {
  // See also gd::WholeProjectRefactorer::ExposeProjectEvents for a method that
  // traverse the whole project (this time for events). Ideally, this method
  // could be moved outside of gd::Project.

  // Add project resources
  worker.ExposeResources(&GetResourcesManager());
  platformSpecificAssets.ExposeResources(worker);
#if !defined(GD_NO_WX_GUI)
  gd::SafeYield::Do();
#endif

  // Add layouts resources
  for (std::size_t s = 0; s < GetLayoutsCount(); s++) {
    for (std::size_t j = 0; j < GetLayout(s).GetObjectsCount();
         ++j)  // Add objects resources
      GetLayout(s).GetObject(j).ExposeResources(worker);

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
    for (auto&& eventsFunction :
         eventsFunctionsExtension.GetEventsFunctions()) {
      LaunchResourceWorkerOnEvents(*this, eventsFunction->GetEvents(), worker);
    }
  }
#if !defined(GD_NO_WX_GUI)
  gd::SafeYield::Do();
#endif

  // Add global objects resources
  for (std::size_t j = 0; j < GetObjectsCount(); ++j) {
    GetObject(j).ExposeResources(worker);
  }

#if !defined(GD_NO_WX_GUI)
  gd::SafeYield::Do();
#endif
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

#if !defined(GD_NO_WX_GUI)
void Project::PopulatePropertyGrid(wxPropertyGrid* grid) {
  grid->Append(new wxPropertyCategory(_("Properties")));
  grid->Append(
      new wxStringProperty(_("Name of the project"), wxPG_LABEL, GetName()));
  grid->Append(
      new wxStringProperty(_("Package name"), wxPG_LABEL, GetPackageName()));
  grid->Append(new wxStringProperty(_("Author"), wxPG_LABEL, GetAuthor()));
  grid->Append(new wxStringProperty(
      _("Globals variables"), wxPG_LABEL, _("Click to edit...")));
  grid->Append(
      new wxStringProperty(_("Extensions"), wxPG_LABEL, _("Click to edit...")));
  grid->Append(new wxPropertyCategory(_("Window")));
  grid->Append(
      new wxUIntProperty(_("Width"), wxPG_LABEL, GetMainWindowDefaultWidth()));
  grid->Append(new wxUIntProperty(
      _("Height"), wxPG_LABEL, GetMainWindowDefaultHeight()));
  grid->Append(new wxBoolProperty(_("Vertical Synchronization"),
                                  wxPG_LABEL,
                                  IsVerticalSynchronizationEnabledByDefault()));
  grid->Append(new wxBoolProperty(
      _("Limit the framerate"), wxPG_LABEL, GetMaximumFPS() != -1));
  grid->Append(
      new wxIntProperty(_("Maximum FPS"), wxPG_LABEL, GetMaximumFPS()));
  grid->Append(
      new wxUIntProperty(_("Minimum FPS"), wxPG_LABEL, GetMinimumFPS()));

  grid->SetPropertyCell(wxString(_("Globals variables")),
                        1,
                        _("Click to edit..."),
                        wxNullBitmap,
                        wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
  grid->SetPropertyReadOnly(wxString(_("Globals variables")));
  grid->SetPropertyCell(wxString(_("Extensions")),
                        1,
                        _("Click to edit..."),
                        wxNullBitmap,
                        wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
  grid->SetPropertyReadOnly(wxString(_("Extensions")));

  if (GetMaximumFPS() == -1) {
    grid->GetProperty(_("Maximum FPS"))->Enable(false);
    grid->GetProperty(_("Maximum FPS"))->SetValue("");
  } else
    grid->GetProperty(_("Maximum FPS"))->Enable(true);

  grid->Append(new wxPropertyCategory(_("Generation")));
  grid->Append(new wxStringProperty(
      _("Windows executable name"), wxPG_LABEL, winExecutableFilename));
  grid->Append(new wxImageFileProperty(
      _("Windows executable icon"), wxPG_LABEL, winExecutableIconFile));
  grid->Append(new wxStringProperty(
      _("Linux executable name"), wxPG_LABEL, linuxExecutableFilename));
  grid->Append(new wxStringProperty(
      _("Mac OS executable name"), wxPG_LABEL, macExecutableFilename));

  grid->Append(new wxPropertyCategory(_("C++ features")));
  grid->Append(new wxBoolProperty(_("Activate the use of C++/JS source files"),
                                  wxPG_LABEL,
                                  useExternalSourceFiles));
}

void Project::UpdateFromPropertyGrid(wxPropertyGrid* grid) {
  if (grid->GetProperty(_("Name of the project")) != NULL)
    SetName(grid->GetProperty(_("Name of the project"))->GetValueAsString());
  if (grid->GetProperty(_("Author")) != NULL)
    SetAuthor(grid->GetProperty(_("Author"))->GetValueAsString());
  if (grid->GetProperty(_("Package name")) != NULL)
    SetPackageName(grid->GetProperty(_("Package name"))->GetValueAsString());
  if (grid->GetProperty(_("Width")) != NULL)
    SetDefaultWidth(grid->GetProperty(_("Width"))->GetValue().GetInteger());
  if (grid->GetProperty(_("Height")) != NULL)
    SetDefaultHeight(grid->GetProperty(_("Height"))->GetValue().GetInteger());
  if (grid->GetProperty(_("Vertical Synchronization")) != NULL)
    SetVerticalSyncActivatedByDefault(
        grid->GetProperty(_("Vertical Synchronization"))->GetValue().GetBool());
  if (grid->GetProperty(_("Limit the framerate")) != NULL &&
      !grid->GetProperty(_("Limit the framerate"))->GetValue().GetBool())
    SetMaximumFPS(-1);
  else if (grid->GetProperty(_("Maximum FPS")) != NULL)
    SetMaximumFPS(grid->GetProperty(_("Maximum FPS"))->GetValue().GetInteger());
  if (grid->GetProperty(_("Minimum FPS")) != NULL)
    SetMinimumFPS(grid->GetProperty(_("Minimum FPS"))->GetValue().GetInteger());

  if (grid->GetProperty(_("Windows executable name")) != NULL)
    winExecutableFilename =
        grid->GetProperty(_("Windows executable name"))->GetValueAsString();
  if (grid->GetProperty(_("Windows executable icon")) != NULL)
    winExecutableIconFile =
        grid->GetProperty(_("Windows executable icon"))->GetValueAsString();
  if (grid->GetProperty(_("Linux executable name")) != NULL)
    linuxExecutableFilename =
        grid->GetProperty(_("Linux executable name"))->GetValueAsString();
  if (grid->GetProperty(_("Mac OS executable name")) != NULL)
    macExecutableFilename =
        grid->GetProperty(_("Mac OS executable name"))->GetValueAsString();
  if (grid->GetProperty(_("Activate the use of C++/JS source files")) != NULL)
    useExternalSourceFiles =
        grid->GetProperty(_("Activate the use of C++/JS source files"))
            ->GetValue()
            .GetBool();
}

void Project::OnChangeInPropertyGrid(wxPropertyGrid* grid,
                                     wxPropertyGridEvent& event) {
  if (event.GetPropertyName() == _("Limit the framerate"))
    grid->EnableProperty(
        wxString(_("Maximum FPS")),
        grid->GetProperty(_("Limit the framerate"))->GetValue().GetBool());

  UpdateFromPropertyGrid(grid);
}

void Project::OnSelectionInPropertyGrid(wxPropertyGrid* grid,
                                        wxPropertyGridEvent& event) {
  if (event.GetColumn() == 1)  // Manage button-like properties
  {
    if (event.GetPropertyName() == _("Extensions")) {
      gd::ProjectExtensionsDialog dialog(NULL, *this);
      dialog.ShowModal();
    } else if (event.GetPropertyName() == _("Globals variables")) {
      gd::ChooseVariableDialog dialog(
          NULL, GetVariables(), /*editingOnly=*/true);
      dialog.SetAssociatedProject(this);
      dialog.ShowModal();
    }
  }
}
#endif
#endif

Project::Project(const Project& other) { Init(other); }

Project& Project::operator=(const Project& other) {
  if (this != &other) Init(other);

  return *this;
}

void Project::Init(const gd::Project& game) {
  // Some properties
  name = game.name;
  version = game.version;
  windowWidth = game.windowWidth;
  windowHeight = game.windowHeight;
  maxFPS = game.maxFPS;
  minFPS = game.minFPS;
  verticalSync = game.verticalSync;
  scaleMode = game.scaleMode;
  sizeOnStartupMode = game.sizeOnStartupMode;

#if defined(GD_IDE_ONLY)
  author = game.author;
  packageName = game.packageName;
  orientation = game.orientation;
  adMobAppId = game.adMobAppId;
  folderProject = game.folderProject;
  latestCompilationDirectory = game.latestCompilationDirectory;
  platformSpecificAssets = game.platformSpecificAssets;
  loadingScreen = game.loadingScreen;
  objectGroups = game.objectGroups;

  gdMajorVersion = game.gdMajorVersion;
  gdMinorVersion = game.gdMinorVersion;
  gdBuildVersion = game.gdBuildVersion;

  currentPlatform = game.currentPlatform;
#endif
  extensionsUsed = game.extensionsUsed;
  platforms = game.platforms;

  // Resources
  resourcesManager = game.resourcesManager;
  imageManager = std::make_shared<ImageManager>(*game.imageManager);
  imageManager->SetResourcesManager(&resourcesManager);

  initialObjects = gd::Clone(game.initialObjects);

  scenes = gd::Clone(game.scenes);

#if defined(GD_IDE_ONLY)
  externalEvents = gd::Clone(game.externalEvents);
#endif

  externalLayouts = gd::Clone(game.externalLayouts);
#if defined(GD_IDE_ONLY)
  eventsFunctionsExtensions = gd::Clone(game.eventsFunctionsExtensions);

  useExternalSourceFiles = game.useExternalSourceFiles;

  externalSourceFiles = gd::Clone(game.externalSourceFiles);
#endif

  variables = game.GetVariables();

#if defined(GD_IDE_ONLY)
  gameFile = game.GetProjectFile();
  imagesChanged = game.imagesChanged;

  winExecutableFilename = game.winExecutableFilename;
  winExecutableIconFile = game.winExecutableIconFile;
  linuxExecutableFilename = game.linuxExecutableFilename;
  macExecutableFilename = game.macExecutableFilename;
#endif
}

}  // namespace gd
