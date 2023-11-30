/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_PROJECT_H
#define GDCORE_PROJECT_H
#include <memory>
#include <vector>

#include "GDCore/Project/ExtensionProperties.h"
#include "GDCore/Project/LoadingScreen.h"
#include "GDCore/Project/ObjectGroupsContainer.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/PlatformSpecificAssets.h"
#include "GDCore/Project/ResourcesManager.h"
#include "GDCore/Project/VariablesContainer.h"
#include "GDCore/Project/Watermark.h"
#include "GDCore/String.h"
namespace gd {
class Platform;
class Layout;
class ExternalEvents;
class ResourcesManager;
class ExternalLayout;
class EventsFunctionsExtension;
class EventsBasedObject;
class EventsBasedBehavior;
class Object;
class ObjectConfiguration;
class VariablesContainer;
class ArbitraryResourceWorker;
class SourceFile;
class Behavior;
class BehaviorsSharedData;
class BaseEvent;
class SerializerElement;
}  // namespace gd
#undef GetObject  // Disable an annoying macro
#undef CreateEvent

namespace gd {
/**
 * \brief Base class representing a project (game), including all resources,
 * scenes, objects, extensions...
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Project : public ObjectsContainer {
 public:
  Project();
  Project(const Project&);
  virtual ~Project();
  Project& operator=(const Project& rhs);

  /** \name Common properties
   * Some properties for the project
   */
  ///@{

  /**
   * \brief Change the project name
   */
  void SetName(const gd::String& name_) { name = name_; };

  /**
   * \brief Get the project name
   */
  const gd::String& GetName() const { return name; }

  /**
   * \brief Get the categories/genres of the project.
   */
  const std::vector<gd::String>& GetCategories() const { return categories; };

  /**
   * \brief Get the categories of the project, to modify them (non-const).
   */
  std::vector<gd::String>& GetCategories() { return categories; };

  /**
   * \brief Change the project description
   */
  void SetDescription(const gd::String& description_) {
    description = description_;
  };

  /**
   * \brief Get the project description
   */
  const gd::String& GetDescription() const { return description; }

  /**
   * \brief Change the version of the project.
   * This can be freely set, but should follow "X.Y.Z" format for compatibility
   * with some exporters.
   */
  void SetVersion(const gd::String& version_) { version = version_; };

  /**
   * \brief Get the project version.
   */
  const gd::String& GetVersion() const { return version; }

  /**
   * \brief Change the author of the project.
   */
  void SetAuthor(const gd::String& author_) { author = author_; };

  /**
   * \brief Get the project author name.
   */
  const gd::String& GetAuthor() const { return author; }

  /**
   * \brief Get the author ids of the project.
   */
  const std::vector<gd::String>& GetAuthorIds() const { return authorIds; };

  /**
   * \brief Get the author ids of the project, to modify them (non-const).
   */
  std::vector<gd::String>& GetAuthorIds() { return authorIds; };

  /**
   * \brief Get the author usernames of the project.
   */
  const std::vector<gd::String>& GetAuthorUsernames() const {
    return authorUsernames;
  };

  /**
   * \brief Get the author usernames of the project, to modify them (non-const).
   */
  std::vector<gd::String>& GetAuthorUsernames() { return authorUsernames; };

  /**
   * Define the project as playable with a keyboard.
   * \param enable True to define the project as playable with a keyboard.
   */
  void SetPlayableWithKeyboard(bool playable = true) {
    isPlayableWithKeyboard = playable;
  }

  /**
   * Check if the project is defined as playable with a keyboard.
   */
  bool IsPlayableWithKeyboard() const { return isPlayableWithKeyboard; }

  /**
   * Define the project as playable with a gamepad.
   * \param enable True to define the project as playable with a gamepad.
   */
  void SetPlayableWithGamepad(bool playable = true) {
    isPlayableWithGamepad = playable;
  }

  /**
   * Check if the project is defined as playable with a gamepad.
   */
  bool IsPlayableWithGamepad() const { return isPlayableWithGamepad; }

  /**
   * Define the project as playable on a mobile.
   * \param enable True to define the project as playable on a mobile.
   */
  void SetPlayableWithMobile(bool playable = true) {
    isPlayableWithMobile = playable;
  }

  /**
   * Check if the project is defined as playable on a mobile.
   */
  bool IsPlayableWithMobile() const { return isPlayableWithMobile; }

  /**
   * \brief Change the project package name.
   */
  void SetPackageName(const gd::String& packageName_) {
    packageName = packageName_;
  };

  /**
   * \brief Get the project package name.
   */
  const gd::String& GetPackageName() const { return packageName; }

  /**
   * \brief Change the slug of the template from which the project is created.
   */
  void SetTemplateSlug(const gd::String& templateSlug_) {
    templateSlug = templateSlug_;
  };

  /**
   * \brief Get the slug of the template from which the project is created.
   */
  const gd::String& GetTemplateSlug() const { return templateSlug; }

  /**
   * \brief Change the project orientation (in particular when exported with
   * Cordova). This has no effect on desktop and web browsers. \param
   * orientation The orientation to use ("default", "landscape", "portrait").
   */
  void SetOrientation(const gd::String& orientation_) {
    orientation = orientation_;
  };

  /**
   * \brief Get the project orientation ("default", "landscape", "portrait").
   */
  const gd::String& GetOrientation() const { return orientation; }

  /**
   * Called when project file has changed.
   */
  void SetProjectFile(const gd::String& file) { projectFile = file; }

  /**
   * Return project file
   * \see gd::Project::SetProjectFile
   */
  const gd::String& GetProjectFile() const { return projectFile; }

  /**
   * Set that the project should be saved as a folder project.
   * \param enable True to flag as a folder project, false to set it as single
   * file project.
   */
  void SetFolderProject(bool enable = true) { folderProject = enable; }

  /**
   * Check if the project is saved as a folder project.
   * \see gd::Project::SetFolderProject
   */
  bool IsFolderProject() const { return folderProject; }

  /**
   * Called when project file has changed.
   */
  void SetLastCompilationDirectory(const gd::String& dir) {
    latestCompilationDirectory = dir;
  }

  /**
   * Return the latest directory used to compile the game
   * \see gd::Project::SetLastCompilationDirectory
   */
  const gd::String& GetLastCompilationDirectory() const {
    return latestCompilationDirectory;
  }

  /**
   * \brief Return a reference to platform assets of the project (icons,
   * splashscreen...).
   */
  gd::PlatformSpecificAssets& GetPlatformSpecificAssets() {
    return platformSpecificAssets;
  }

  /**
   * \brief Return a reference to platform assets of the project (icons,
   * splashscreen...).
   */
  const gd::PlatformSpecificAssets& GetPlatformSpecificAssets() const {
    return platformSpecificAssets;
  }

  /**
   * \brief Return a reference to loading screen setup for the project
   */
  gd::LoadingScreen& GetLoadingScreen() { return loadingScreen; }

  /**
   * \brief Return a reference to loading screen setup for the project
   */
  const gd::LoadingScreen& GetLoadingScreen() const { return loadingScreen; }

  /**
   * \brief Return a reference to watermark setup for the project
   */
  gd::Watermark& GetWatermark() { return watermark; }

  /**
   * \brief Return a reference to watermark setup for the project
   */
  const gd::Watermark& GetWatermark() const { return watermark; }

  /**
   * Change game's main window default width.
   *
   * \note This is only the default width used when creating the main window for
   * the first time. To change the width at runtime, use the functions related
   * to RuntimeScene.renderWindow
   */
  void SetGameResolutionSize(unsigned int width, unsigned int height) {
    windowWidth = width;
    windowHeight = height;
  }

  /**
   * \brief Returns the default game resolution width.
   */
  unsigned int GetGameResolutionWidth() const { return windowWidth; }

  /**
   * \brief Returns the default game resolution height.
   */
  unsigned int GetGameResolutionHeight() const { return windowHeight; }

  /**
   * \brief Returns true if the game resolution should be adapted to the window
   * size at runtime.
   */
  bool GetAdaptGameResolutionAtRuntime() const {
    return adaptGameResolutionAtRuntime;
  }

  /**
   * \brief Set if the game resolution should be adapted to the window size at
   * runtime. \see SetSizeOnStartupMode
   */
  void SetAdaptGameResolutionAtRuntime(bool adaptGameResolutionAtRuntime_) {
    adaptGameResolutionAtRuntime = adaptGameResolutionAtRuntime_;
  }

  /**
   * \brief Get how the game size should be adapted to the screen.
   */
  const gd::String& GetSizeOnStartupMode() const { return sizeOnStartupMode; }

  /**
   * \brief Set how to adapt the game size to the screen.
   * \param mode The size to be used. Can be "adaptWidth", "adaptHeight" or
   * empty fpr no changes to game size.
   */
  void SetSizeOnStartupMode(const gd::String& mode) {
    sizeOnStartupMode = mode;
  }

  /**
   * Change the default maximum number of frames allowed to be rendered per
   * seconds
   */
  void SetMaximumFPS(int maxFPS_) { maxFPS = maxFPS_; }

  /**
   * Get the default number of maximum frame par seconds
   */
  int GetMaximumFPS() const { return maxFPS; }

  /**
   * Change the default minimum number of frames allowed to be rendered per
   * seconds
   */
  void SetMinimumFPS(unsigned int minFPS_) { minFPS = minFPS_; }

  /**
   * Get the default number of minimum frame par seconds
   */
  unsigned int GetMinimumFPS() const { return minFPS; }

  /**
   * Return true if vertical synchronization is enabled by default.
   */
  bool IsVerticalSynchronizationEnabledByDefault() const {
    return verticalSync;
  }

  /**
   * Set if vertical synchronization is enabled by default.
   */
  void SetVerticalSyncActivatedByDefault(bool enable) { verticalSync = enable; }

  /**
   * Return the scale mode used by the game (usually "linear" or "nearest").
   */
  const gd::String& GetScaleMode() const { return scaleMode; }

  /**
   * Set the scale mode used by the game (usually "linear" or "nearest").
   */
  void SetScaleMode(const gd::String& scaleMode_) { scaleMode = scaleMode_; }

  /**
   * Return true if pixels rounding option is enabled.
   */
  bool GetPixelsRounding() const { return pixelsRounding; }

  /**
   * Set pixels rounding option to true or false.
   */
  void SetPixelsRounding(bool enable) { pixelsRounding = enable; }

  /**
   * Return the antialiasing mode used by the game ("none" or "MSAA").
   */
  const gd::String& GetAntialiasingMode() const { return antialiasingMode; }

  /**
   * Set the antialiasing mode used by the game ("none" or "MSAA").
   */
  void SetAntialiasingMode(const gd::String& antialiasingMode_) {
    antialiasingMode = antialiasingMode_;
  }

  /**
   * Return true if antialising is enabled on mobiles.
   */
  bool IsAntialisingEnabledOnMobile() const {
    return isAntialisingEnabledOnMobile;
  }

  /**
   * Set whether antialising is enabled on mobiles or not.
   */
  void SetAntialisingEnabledOnMobile(bool enable) {
    isAntialisingEnabledOnMobile = enable;
  }

  /**
   * \brief Return if the project should set 0 as Z-order for objects created
   * from events (which is deprecated) - instead of the highest Z order that was
   * found on each layer when the scene started.
   */
  bool GetUseDeprecatedZeroAsDefaultZOrder() const {
    return useDeprecatedZeroAsDefaultZOrder;
  }

  /**
   * \brief Set if the project should set 0 as Z-order for objects created from
   * events (which is deprecated) - instead of the highest Z order that was
   * found on each layer when the scene started.
   */
  void SetUseDeprecatedZeroAsDefaultZOrder(bool enable) {
    useDeprecatedZeroAsDefaultZOrder = enable;
  }

  /**
   * \brief Change the project UUID.
   */
  void SetProjectUuid(const gd::String& projectUuid_) {
    projectUuid = projectUuid_;
  };

  /**
   * \brief Get the project UUID, useful when using the game on online services
   * that would require a unique identifier.
   */
  const gd::String& GetProjectUuid() const { return projectUuid; }

  /**
   * \brief Create a new project UUID.
   */
  void ResetProjectUuid();

  /**
   * \brief Get the properties set by extensions.
   *
   * Each extension can store arbitrary values indexed by a property name, which
   * are useful to store project wide settings (AdMob id, etc...).
   */
  gd::ExtensionProperties& GetExtensionProperties() {
    return extensionProperties;
  };

  /**
   * \brief Get the properties set by extensions.
   *
   * Each extension can store arbitrary values indexed by a property name, which
   * are useful to store project wide settings (AdMob id, etc...).
   */
  const gd::ExtensionProperties& GetExtensionProperties() const {
    return extensionProperties;
  };

  /**
   * Return the list of platforms used by the project.
   */
  const std::vector<Platform*>& GetUsedPlatforms() const { return platforms; };

  /**
   * Add a platform to the project
   */
  void AddPlatform(Platform& platform);

  /**
   * Remove a platform from the project.
   *
   * \note The remove will fail if there is only one platform left.
   * \return true if the platform was removed, false otherwise.
   */
  bool RemovePlatform(const gd::String& platformName);

  /**
   * \brief Return a reference to the platform being currently used to edit the
   * project.
   */
  Platform& GetCurrentPlatform() const;

  /**
   * \brief Set the platform to be used to edit the project.
   * \param platformName The name of the new current platform. If not found, the
   * current platform won't be changed.
   */
  void SetCurrentPlatform(const gd::String& platformName);

  ///@}

  /** \name Factory method
   * Member functions used to create objects for the project
   */
  ///@{

  /**
   * Create an object of the given type with the specified name.
   *
   * \param type The type of the object
   * \param name The name of the object
   */
  std::unique_ptr<gd::Object> CreateObject(const gd::String& type,
                                           const gd::String& name) const;

  /**
   * Create an object configuration of the given type.
   *
   * \param type The type of the object
   */
  std::unique_ptr<gd::ObjectConfiguration> CreateObjectConfiguration(
      const gd::String& type) const;

  /**
   * Create an event of the given type.
   *
   * \note A project can use more than one platform. In this case, the first
   * platform supporting the event is used, unless \a platformName argument is
   * not empty.<br> It is assumed that each platform provides equivalent events.
   *
   * \param project The project for which the event must be created.
   * \param type The type of the event
   * \param platformName The name of the platform to be used. If empty, the
   * first platform supporting the object is used.
   */
  std::shared_ptr<gd::BaseEvent> CreateEvent(
      const gd::String& type, const gd::String& platformName = "");
  ///@}

  /** \name Layouts management
   * Members functions related to layout management.
   */
  ///@{
  /**
   * \brief Return true if layout called "name" exists.
   */
  bool HasLayoutNamed(const gd::String& name) const;

  /**
   * \brief Return a reference to the layout called "name".
   */
  Layout& GetLayout(const gd::String& name);

  /**
   * \brief Return a reference to the layout called "name".
   */
  const Layout& GetLayout(const gd::String& name) const;

  /**
   * \brief Return a reference to the layout at position "index" in the layout
   * list
   */
  Layout& GetLayout(std::size_t index);

  /**
   * \brief Return a reference to the layout at position "index" in the layout
   * list
   */
  const Layout& GetLayout(std::size_t index) const;

  /**
   * \brief Return the position of the layout called "name" in the layout list
   */
  std::size_t GetLayoutPosition(const gd::String& name) const;

  /**
   * Change the position of the specified layout.
   */
  void MoveLayout(std::size_t oldIndex, std::size_t newIndex);

  /**
   * \brief Swap the specified layouts.
   *
   * Do nothing if indexes are not correct.
   */
  void SwapLayouts(std::size_t first, std::size_t second);

  /**
   * \brief Return the number of layouts.
   */
  std::size_t GetLayoutsCount() const;

  /**
   * \brief Add a new empty layout called "name" at the specified
   * position in the layout list.
   */
  gd::Layout& InsertNewLayout(const gd::String& name, std::size_t position);

  /**
   * \brief Add a new layout constructed from the layout passed as
   * parameter.
   * \param layout The layout that must be copied and inserted
   * into the project
   * \param position Insertion position. Even if the position
   * is invalid, the layout must be inserted at the end of the layout list.
   *
   * \note No pointer or reference must be kept on the layout passed
   * as parameter.
   *
   */
  gd::Layout& InsertLayout(const Layout& layout, std::size_t position);

  /**
   * \brief Delete layout named "name".
   */
  void RemoveLayout(const gd::String& name);

  ///@}

  /**
   * \brief Unserialize the project from an element.
   */
  void UnserializeFrom(const SerializerElement& element);

  /**
   * \brief Serialize the project.
   *
   * "Dirty" flag is set to false when serialization is done.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * Get the major version of GDevelop used to save the project.
   */
  unsigned int GetLastSaveGDMajorVersion() { return gdMajorVersion; };

  /**
   * Get the minor version of GDevelop used to save the project.
   */
  unsigned int GetLastSaveGDMinorVersion() { return gdMinorVersion; };

  /**
   * Get the minor version of GDevelop used to save the project.
   */
  unsigned int GetLastSaveGDBuildVersion() { return gdBuildVersion; };

  /** \name External events management
   * Members functions related to external events management.
   */
  ///@{
  /**
   * Return true if external events called "name" exists.
   */
  bool HasExternalEventsNamed(const gd::String& name) const;

  /**
   * Return a reference to the external events called "name".
   */
  ExternalEvents& GetExternalEvents(const gd::String& name);

  /**
   * Return a reference to the external events called "name".
   */
  const ExternalEvents& GetExternalEvents(const gd::String& name) const;

  /**
   * Return a reference to the external events at position "index" in the
   * external events list
   */
  ExternalEvents& GetExternalEvents(std::size_t index);

  /**
   * Return a reference to the external events at position "index" in the
   * external events list
   */
  const ExternalEvents& GetExternalEvents(std::size_t index) const;

  /**
   * Return the position of the external events called "name" in the external
   * events list
   */
  std::size_t GetExternalEventsPosition(const gd::String& name) const;

  /**
   * Change the position of the specified external events.
   */
  void MoveExternalEvents(std::size_t oldIndex, std::size_t newIndex);

  /**
   * \brief Swap the specified external events.
   *
   * Do nothing if indexes are not correct.
   */
  void SwapExternalEvents(std::size_t first, std::size_t second);

  /**
   * Return the number of external events.
   */
  std::size_t GetExternalEventsCount() const;

  /**
   * \brief Adds a new empty external events sheet called "name" at the
   * specified position in the layout list.
   */
  ExternalEvents& InsertNewExternalEvents(const gd::String& name,
                                          std::size_t position);

  /**
   * \brief Adds a new external events sheet constructed from the layout passed
   * as parameter. \note No pointer or reference must be kept on the external
   * events passed as parameter. \param externalEvents The external events that
   * must be copied and inserted into the project \param position Insertion
   * position. Even if the position is invalid, the external events must be
   * inserted at the end of the external events list.
   */
  ExternalEvents& InsertExternalEvents(const ExternalEvents& externalEvents,
                                       std::size_t position);

  /**
   * \brief Delete external events named "name".
   */
  void RemoveExternalEvents(const gd::String& name);
  ///@}

  /** \name External layout management
   * Members functions related to external layout management.
   */
  ///@{

  /**
   * Return true if external layout called "name" exists.
   */
  bool HasExternalLayoutNamed(const gd::String& name) const;

  /**
   * Return a reference to the external layout called "name".
   */
  ExternalLayout& GetExternalLayout(const gd::String& name);

  /**
   * Return a reference to the external layout called "name".
   */
  const ExternalLayout& GetExternalLayout(const gd::String& name) const;

  /**
   * Return a reference to the external layout at position "index" in the
   * external layout list
   */
  ExternalLayout& GetExternalLayout(std::size_t index);

  /**
   * Return a reference to the external layout at position "index" in the
   * external layout list
   */
  const ExternalLayout& GetExternalLayout(std::size_t index) const;

  /**
   * Return the position of the external layout called "name" in the external
   * layout list
   */
  std::size_t GetExternalLayoutPosition(const gd::String& name) const;

  /**
   * Change the position of the specified external layout.
   */
  void MoveExternalLayout(std::size_t oldIndex, std::size_t newIndex);

  /**
   * \brief Swap the specified external layouts.
   *
   * Do nothing if indexes are not correct.
   */
  void SwapExternalLayouts(std::size_t first, std::size_t second);

  /**
   * Return the number of external layout.
   */
  std::size_t GetExternalLayoutsCount() const;

  /**
   * \brief Adds a new empty external layout called "name" at the specified
   * position in the layout list.
   */
  gd::ExternalLayout& InsertNewExternalLayout(const gd::String& name,
                                              std::size_t position);

  /**
   * \brief Adds a new external layout constructed from the layout passed as
   * parameter.
   *
   * \note No pointer or reference must be kept on the external
   * layout passed as parameter.
   *
   * \param externalLayout The external layout that
   * must be copied and inserted into the projects
   * \param position Insertion position. Even if the position is invalid, the
   * external layout must be inserted at the end of the external layout list.
   */
  gd::ExternalLayout& InsertExternalLayout(const ExternalLayout& externalLayout,
                                           std::size_t position);

  /**
   * \brief Delete external layout named "name".
   */
  void RemoveExternalLayout(const gd::String& name);

  /**
   * Set the first layout of the project.
   */
  void SetFirstLayout(const gd::String& name) { firstLayout = name; }

  /**
   * Get the first layout of the project.
   */
  const gd::String& GetFirstLayout() { return firstLayout; }

  ///@}

  /** \name Events functions extensions management
   */
  ///@{
  /**
   * \brief  Check if events functions extension called "name" exists.
   */
  bool HasEventsFunctionsExtensionNamed(const gd::String& name) const;

  /**
   * \brief Return a reference to the events functions extension called "name".
   */
  EventsFunctionsExtension& GetEventsFunctionsExtension(const gd::String& name);

  /**
   * \brief Return a reference to the events functions extension called "name".
   */
  const EventsFunctionsExtension& GetEventsFunctionsExtension(
      const gd::String& name) const;

  /**
   * \brief Return a reference to the events functions extension at position
   * "index" in the list
   */
  EventsFunctionsExtension& GetEventsFunctionsExtension(std::size_t index);

  /**
   * \brief Return a reference to the events functions extension at position
   * "index" in the list
   */
  const EventsFunctionsExtension& GetEventsFunctionsExtension(
      std::size_t index) const;

  /**
   * \brief Return the position of the events functions extension called "name"
   * in the list.
   */
  std::size_t GetEventsFunctionsExtensionPosition(const gd::String& name) const;

  /**
   * Change the position of the specified events function extension.
   */
  void MoveEventsFunctionsExtension(std::size_t oldIndex, std::size_t newIndex);

  /**
   * \brief Swap the specified events functions extensions.
   *
   * Do nothing if indexes are not correct.
   */
  void SwapEventsFunctionsExtensions(std::size_t first, std::size_t second);

  /**
   * \brief Returns the number of events functions extension.
   */
  std::size_t GetEventsFunctionsExtensionsCount() const;

  /**
   * \brief Adds a new empty events functions extension called "name" at the
   * specified position in the list.
   */
  gd::EventsFunctionsExtension& InsertNewEventsFunctionsExtension(
      const gd::String& name, std::size_t position);

  /**
   * \brief Adds an events functions extension to the list.
   *
   * \note A copy of it is stored in the project (and returned).
   * \return The newly stored events functions extension (a copy of the one
   * passed as parameter).
   */
  gd::EventsFunctionsExtension& InsertEventsFunctionsExtension(
      const EventsFunctionsExtension& eventsFunctionExtension,
      std::size_t position);

  /**
   * \brief Delete the events functions extension named "name".
   */
  void RemoveEventsFunctionsExtension(const gd::String& name);

  /**
   * \brief Remove all the events functions extensions.
   */
  void ClearEventsFunctionsExtensions();

  /**
   * \brief  Check if events based object with a given type exists.
   */
  bool HasEventsBasedObject(const gd::String& type) const;

  /**
   * \brief Return the events based object with a given type.
   */
  gd::EventsBasedObject& GetEventsBasedObject(const gd::String& type);

  /**
   * \brief Return the events based object with a given type.
   */
  const gd::EventsBasedObject& GetEventsBasedObject(
      const gd::String& type) const;

  /**
   * \brief  Check if events based behavior with a given type exists.
   */
  bool HasEventsBasedBehavior(const gd::String& type) const;

  /**
   * \brief Return the events based behavior with a given type.
   */
  gd::EventsBasedBehavior& GetEventsBasedBehavior(const gd::String& type);

  /**
   * \brief Return the events based behavior with a given type.
   */
  const gd::EventsBasedBehavior& GetEventsBasedBehavior(
      const gd::String& type) const;

  ///@}

  /** \name Resources management
   * Members functions related to resources management.
   */
  ///@{
  /**
   * \brief Provide access to the ResourceManager member containing the list of
   * the resources.
   */
  const ResourcesManager& GetResourcesManager() const {
    return resourcesManager;
  }

  /**
   * \brief Provide access to the ResourceManager member containing the list of
   * the resources.
   */
  ResourcesManager& GetResourcesManager() { return resourcesManager; }

  ///@}

  /** \name Variable management
   * Members functions related to global variables management.
   */
  ///@{

  /**
   * Provide access to the gd::VariablesContainer member containing the global
   * variables
   */
  inline const gd::VariablesContainer& GetVariables() const {
    return variables;
  }

  /**
   * Provide access to the gd::VariablesContainer member containing the global
   * variables
   */
  inline gd::VariablesContainer& GetVariables() { return variables; }

  ///@}

  /** \name Identifier names
   */
  ///@{

  /**
   * Return true if \a name is valid (can be used safely for an object,
   * behavior, events function name, etc...).
   */
  static bool IsNameSafe(const gd::String& name);

  /**
   * Return a name, based on the one passed in parameter, that can be safely
   * used for an object, behavior, events function name, etc...
   */
  static gd::String GetSafeName(const gd::String& name);
  ///@}

  /** \name External source files
   * To manage external C++ or Javascript source files used by the game
   */
  ///@{
  /**
   * \brief Return true if the game activated the use of external source files.
   */
  bool UseExternalSourceFiles() const { return useExternalSourceFiles; }

  /**
   * \brief Return a const reference to the vector containing all the source
   * files used by the game.
   */
  const std::vector<std::unique_ptr<gd::SourceFile> >& GetAllSourceFiles()
      const {
    return externalSourceFiles;
  }

  /**
   * \brief Return true if the source file with the specified name is used by
   * the game. \param name The filename of the source file. \param language
   * Optional. If specified, check that the source file that exists is in this
   * language.
   */
  bool HasSourceFile(gd::String name, gd::String language = "") const;

  /**
   * Return a reference to the external source file with the given name.
   */
  SourceFile& GetSourceFile(const gd::String& name);

  /**
   * Return a reference to the external source file with the given name.
   */
  const SourceFile& GetSourceFile(const gd::String& name) const;

  /**
   * Remove the specified source file.
   */
  void RemoveSourceFile(const gd::String& name);

  /**
   * Add a new source file the specified position in the external source files
   * list.
   */
  gd::SourceFile& InsertNewSourceFile(const gd::String& name,
                                      const gd::String& language,
                                      std::size_t position = -1);
  ///@}

 private:
  /**
   * Initialize from another game. Used by copy-ctor and assign-op.
   * Don't forget to update me if members were changed!
   */
  void Init(const gd::Project& project);

  gd::String name;            ///< Game name
  gd::String description;     ///< Game description
  gd::String version;         ///< Game version number (used for some exports)
  unsigned int windowWidth;   ///< Window default width
  unsigned int windowHeight;  ///< Window default height
  int maxFPS;                 ///< Maximum Frame Per Seconds, -1 for unlimited
  unsigned int minFPS;  ///< Minimum Frame Per Seconds ( slow down game if FPS
                        ///< are below this number )
  bool verticalSync;    ///< If true, must activate vertical synchronization.
  gd::String scaleMode;
  bool pixelsRounding;  ///< If true, the rendering should stop pixel
                        ///< interpolation of rendered objects.
  bool adaptGameResolutionAtRuntime;  ///< Should the game resolution be adapted
                                      ///< to the window size at runtime
  gd::String
      sizeOnStartupMode;  ///< How to adapt the game size to the screen. Can be
                          ///< "adaptWidth", "adaptHeight" or empty
  gd::String antialiasingMode;
  bool isAntialisingEnabledOnMobile;
  gd::String projectUuid;  ///< UUID useful to identify the game in online
                           ///< services or database that would require it.
  bool useDeprecatedZeroAsDefaultZOrder;  ///< If true, objects created from
                                          ///< events will have 0 as Z order,
                                          ///< instead of the highest Z order
                                          ///< found on the layer at the scene
                                          ///< startup.
  std::vector<std::unique_ptr<gd::Layout> > scenes;  ///< List of all scenes
  gd::VariablesContainer variables;  ///< Initial global variables
  std::vector<std::unique_ptr<gd::ExternalLayout> >
      externalLayouts;  ///< List of all externals layouts
  std::vector<std::unique_ptr<gd::EventsFunctionsExtension> >
      eventsFunctionsExtensions;
  gd::ResourcesManager
      resourcesManager;  ///< Contains all resources used by the project
  std::vector<gd::Platform*>
      platforms;  ///< Pointers to the platforms this project supports.
  gd::String firstLayout;
  bool useExternalSourceFiles;  ///< True if game used external source files.
  std::vector<std::unique_ptr<gd::SourceFile> >
      externalSourceFiles;  ///< List of external source files used.
  gd::String author;        ///< Game author name, for publishing purpose.
  std::vector<gd::String>
      authorIds;  ///< Game author ids, from GDevelop users DB.
  std::vector<gd::String>
      authorUsernames;  ///< Game author usernames, from GDevelop users DB.
  std::vector<gd::String> categories;  ///< Game categories
  bool isPlayableWithKeyboard;  ///< The project is playable with a keyboard.
  bool isPlayableWithGamepad;   ///< The project is playable with a gamepad.
  bool isPlayableWithMobile;    ///< The project is playable on a mobile.
  gd::String packageName;       ///< Game package name
  gd::String templateSlug;  ///< The slug of the template from which the game is
                            ///< created.
  gd::String orientation;   ///< Lock game orientation (on mobile devices).
                            ///< "default", "landscape" or "portrait".
  bool
      folderProject;  ///< True if folder project, false if single file project.
  gd::String
      projectFile;  ///< Path to the project file - when editing a local file.
  gd::String latestCompilationDirectory;
  gd::Platform*
      currentPlatform;  ///< The platform being used to edit the project.
  gd::PlatformSpecificAssets platformSpecificAssets;
  gd::LoadingScreen loadingScreen;
  gd::Watermark watermark;
  std::vector<std::unique_ptr<gd::ExternalEvents> >
      externalEvents;  ///< List of all externals events
  ExtensionProperties
      extensionProperties;              ///< The properties of the extensions.
  mutable unsigned int gdMajorVersion;  ///< The GD major version used the last
                                        ///< time the project was saved.
  mutable unsigned int gdMinorVersion;  ///< The GD minor version used the last
                                        ///< time the project was saved.
  mutable unsigned int gdBuildVersion;  ///< The GD build version used the last
                                        ///< time the project was saved.
};

}  // namespace gd

#endif  // GDCORE_PROJECT_H
