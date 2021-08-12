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
#include "GDCore/String.h"
namespace gd {
class Platform;
class Layout;
class ExternalEvents;
class ResourcesManager;
class ExternalLayout;
class EventsFunctionsExtension;
class Object;
class VariablesContainer;
class ArbitraryResourceWorker;
class SourceFile;
class ImageManager;
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
   * \brief Change project name
   */
  void SetName(const gd::String& name_) { name = name_; };

  /**
   * \brief Get project name
   */
  const gd::String& GetName() const { return name; }

  /**
   * \brief Change the version of the project.
   * This can be freely set, but should follow "X.Y.Z" format for compatibility
   * with some exporters.
   */
  void SetVersion(const gd::String& version_) { version = version_; };

  /**
   * \brief Get project version.
   */
  const gd::String& GetVersion() const { return version; }

#if defined(GD_IDE_ONLY)
  /**
   * \brief Change the author of the project.
   */
  void SetAuthor(const gd::String& author_) { author = author_; };

  /**
   * \brief Get project author name.
   */
  const gd::String& GetAuthor() const { return author; }

  /**
   * \brief Change project package name.
   */
  void SetPackageName(const gd::String& packageName_) {
    packageName = packageName_;
  };

  /**
   * \brief Get project package name.
   */
  const gd::String& GetPackageName() const { return packageName; }

  /**
   * \brief Change the project orientation (in particular when exported with
   * Cordova). This has no effect on desktop and web browsers. \param
   * orientation The orientation to use ("default", "landscape", "portrait").
   */
  void SetOrientation(const gd::String& orientation_) {
    orientation = orientation_;
  };

  /**
   * \brief Get project orientation ("default", "landscape", "portrait").
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
#endif

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

#if defined(GD_IDE_ONLY)
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
#endif

  ///@}

  /** \name Factory method
   * Member functions used to create objects for the project
   */
  ///@{

  /**
   * Create an object of the given type with the specified name.
   *
   * \note A project can use more than one platform. In this case, the first
   * platform supporting the object is used, unless \a platformName argument is
   * not empty.<br> It is assumed that each platform provides an equivalent
   * object.
   *
   * \param type The type of the object
   * \param name The name of the object
   * \param platformName The name of the platform to be used. If empty, the
   * first platform supporting the object is used.
   */
  std::unique_ptr<gd::Object> CreateObject(const gd::String& type,
                                           const gd::String& name,
                                           const gd::String& platformName = "");

#if defined(GD_IDE_ONLY)
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
#endif

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

#if defined(GD_IDE_ONLY)
  /**
   * \brief Swap the specified layouts.
   *
   * Do nothing if indexes are not correct.
   */
  void SwapLayouts(std::size_t first, std::size_t second);
#endif

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

#if defined(GD_IDE_ONLY)
  /**
   * \brief Serialize the project.
   *
   * "Dirty" flag is set to false when serialization is done.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Return true if the project is marked as being modified (The IDE or
   * application using the project should ask to save the project if the project
   * is closed).
   */
  bool IsDirty() { return dirty; }

  /**
   * \brief Mark the project as being modified (The IDE or application
   * using the project should ask to save the project if the project is closed).
   */
  void SetDirty(bool enable = true) { dirty = enable; }

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
#endif

/** \name External events management
 * Members functions related to external events management.
 */
///@{
#if defined(GD_IDE_ONLY)
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
#endif
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

#if defined(GD_IDE_ONLY)
  /**
   * \brief Swap the specified external layouts.
   *
   * Do nothing if indexes are not correct.
   */
  void SwapExternalLayouts(std::size_t first, std::size_t second);
#endif

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
#if defined(GD_IDE_ONLY)
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
#endif
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

  /**
   * \brief Provide access to the ImageManager allowing to load SFML or OpenGL
   * textures for the IDE ( or at runtime for the GD C++ Platform ).
   */
  const std::shared_ptr<gd::ImageManager>& GetImageManager() const {
    return imageManager;
  }

  /**
   * \brief Provide access to the ImageManager allowing to load SFML or OpenGL
   * textures for the IDE ( or at runtime for the GD C++ Platform ).
   */
  std::shared_ptr<gd::ImageManager>& GetImageManager() { return imageManager; }

  /**
   * \brief Provide access to the ImageManager allowing to load SFML or OpenGL
   * textures for the IDE ( or at runtime for the GD C++ Platform ).
   */
  void SetImageManager(std::shared_ptr<gd::ImageManager> imageManager_) {
    imageManager = imageManager_;
  }

  /**
   * \brief Called ( e.g. during compilation ) so as to inventory internal
   * resources, sometimes update their filename or any other work or resources.
   *
   * See WholeProjectRefactorer for the same thing for events.
   *
   * \see WholeProjectRefactorer
   * \see ArbitraryResourceWorker
   */
  void ExposeResources(gd::ArbitraryResourceWorker& worker);
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

  /** \name Other
   */
  ///@{

  /**
   * Return true if \a name is valid (can be used safely for an object,
   * behavior, events function name, etc...).
   */
  static bool ValidateName(const gd::String& name);
///@}

/** \name External source files
 * To manage external C++ or Javascript source files used by the game
 */
///@{
#if defined(GD_IDE_ONLY)
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
#endif
///@}

// TODO: Put this in private part
#if defined(GD_IDE_ONLY)
  std::vector<gd::String> imagesChanged;  ///< Images that have been changed and
                                          ///< which have to be reloaded
#endif

 private:
  /**
   * Initialize from another game. Used by copy-ctor and assign-op.
   * Don't forget to update me if members were changed!
   */
  void Init(const gd::Project& project);

  gd::String name;            ///< Game name
  gd::String version;         ///< Game version number (used for some exports)
  unsigned int windowWidth;   ///< Window default width
  unsigned int windowHeight;  ///< Window default height
  int maxFPS;                 ///< Maximum Frame Per Seconds, -1 for unlimited
  unsigned int minFPS;  ///< Minimum Frame Per Seconds ( slow down game if FPS
                        ///< are below this number )
  bool verticalSync;    ///< If true, must activate vertical synchronization.
  gd::String scaleMode;
  bool adaptGameResolutionAtRuntime;  ///< Should the game resolution be adapted
                                      ///< to the window size at runtime
  gd::String
      sizeOnStartupMode;   ///< How to adapt the game size to the screen. Can be
                           ///< "adaptWidth", "adaptHeight" or empty
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
#if defined(GD_IDE_ONLY)
  std::vector<std::unique_ptr<gd::EventsFunctionsExtension> >
      eventsFunctionsExtensions;
#endif
  gd::ResourcesManager
      resourcesManager;  ///< Contains all resources used by the project
  std::shared_ptr<gd::ImageManager>
      imageManager;  ///< Image manager is accessed thanks to a (smart) ptr as
                     ///< it can be shared with GD C++ Platform projects.
  std::vector<gd::Platform*>
      platforms;  ///< Pointers to the platforms this project supports.
  gd::String firstLayout;
#if defined(GD_IDE_ONLY)
  bool useExternalSourceFiles;  ///< True if game used external source files.
  std::vector<std::unique_ptr<gd::SourceFile> >
      externalSourceFiles;  ///< List of external source files used.
  gd::String author;        ///< Game author name
  gd::String packageName;   ///< Game package name
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
  mutable bool dirty;  ///< True to flag the project as being modified.
#endif
};

}  // namespace gd

#endif  // GDCORE_PROJECT_H
