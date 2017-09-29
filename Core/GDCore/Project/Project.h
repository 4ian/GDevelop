/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef GDCORE_PROJECT_H
#define GDCORE_PROJECT_H
#include <memory>
#include <vector>
#include "GDCore/String.h"
class wxPropertyGrid;
class wxPropertyGridEvent;
class TiXmlElement;
#include "GDCore/Project/ClassWithObjects.h"
#include "GDCore/Project/ChangesNotifier.h"
#include "GDCore/Project/VariablesContainer.h"
#include "GDCore/Project/ResourcesManager.h"
#include "GDCore/Project/ObjectGroupsContainer.h"
namespace gd { class Platform; }
namespace gd { class Layout; }
namespace gd { class ExternalEvents; }
namespace gd { class ResourcesManager; }
namespace gd { class ExternalLayout; }
namespace gd { class Object; }
namespace gd { class VariablesContainer; }
namespace gd { class ArbitraryResourceWorker; }
namespace gd { class SourceFile; }
namespace gd { class ImageManager; }
namespace gd { class Behavior; }
namespace gd { class BehaviorsSharedData; }
namespace gd { class BaseEvent; }
namespace gd { class SerializerElement; }
#undef GetObject //Disable an annoying macro
#undef CreateEvent

namespace gd
{
/**
 * \brief Base class used to represent a project of a platform
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Project : public ClassWithObjects
{
public:
    Project();
    Project(const Project&);
    virtual ~Project();
    Project& operator=(const Project & rhs);

    /** \name Common properties
     * Some properties for the project
     */
    ///@{

    /**
     * \brief Change project name
     */
    void SetName(const gd::String & name_) { name = name_; };

    /**
     * \brief Get project name
     */
    const gd::String & GetName() const { return name; }

#if defined(GD_IDE_ONLY)
    /**
     * \brief Change the author of the project.
     */
    void SetAuthor(const gd::String & author_) { author = author_; };

    /**
     * \brief Get project author name.
     */
    const gd::String & GetAuthor() const { return author; }

    /**
     * \brief Change project package name.
     */
    void SetPackageName(const gd::String & packageName_) { packageName = packageName_; };

    /**
     * \brief Get project package name.
     */
    const gd::String & GetPackageName() const { return packageName; }

    /**
     * Called when project file has changed.
     */
    void SetProjectFile(const gd::String & file) { gameFile = file; }

    /**
     * Return project file
     * \see gd::Project::SetProjectFile
     */
    const gd::String & GetProjectFile() const { return gameFile; }

    /**
     * Set that the project should be saved as a folder project.
     * \param enable True to flag as a folder project, false to set it as single file project.
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
    void SetLastCompilationDirectory(const gd::String & dir){ latestCompilationDirectory = dir; }

    /**
     * Return the latest directory used to compile the game
     * \see gd::Project::SetLastCompilationDirectory
     */
    const gd::String & GetLastCompilationDirectory() const {return latestCompilationDirectory;}
#endif

    /**
     * Change game's main window default width.
     *
     * \note This is only the default width used when creating the main window for the first time. To change the width at runtime, use the functions related to RuntimeScene.renderWindow
     */
    void SetDefaultWidth(unsigned int width) { windowWidth = width; }

    /**
     * Get the default width of the project main window
     */
    unsigned int GetMainWindowDefaultWidth() const { return windowWidth; }

    /**
     * Change the default height of the project main window
     */
    void SetDefaultHeight(unsigned int height) { windowHeight = height; }

    /**
     * Return the default height of the project main window
     */
    unsigned int GetMainWindowDefaultHeight() const { return windowHeight; }

    /**
     * Change the default maximum number of frames allowed to be rendered per seconds
     */
    void SetMaximumFPS(int maxFPS_) { maxFPS = maxFPS_; }

    /**
     * Get the default number of maximum frame par seconds
     */
    int GetMaximumFPS() const { return maxFPS; }

    /**
     * Change the default minimum number of frames allowed to be rendered per seconds
     */
    void SetMinimumFPS(unsigned int minFPS_) { minFPS = minFPS_; }

    /**
     * Get the default number of minimum frame par seconds
     */
    unsigned int GetMinimumFPS() const { return minFPS; }

    /**
     * Return true if vertical synchronization is enabled by default.
     */
    bool IsVerticalSynchronizationEnabledByDefault() const { return verticalSync; }

    /**
     * Set if vertical synchronization is enabled by default.
     */
    void SetVerticalSyncActivatedByDefault(bool enable) { verticalSync = enable; }

    /**
     * Return a reference to the vector containing the names of extensions used by the project.
     */
    const std::vector < gd::String > & GetUsedExtensions() const { return extensionsUsed; };

    /**
     * Return a reference to the vector containing the names of extensions used by the project.
     */
    std::vector < gd::String > & GetUsedExtensions() { return extensionsUsed; };

    #if defined(GD_IDE_ONLY)
    /**
     * Return the list of platforms used by the project.
     */
    const std::vector < Platform* > & GetUsedPlatforms() const { return platforms; };

    /**
     * Add a platform to the project
     */
    void AddPlatform(Platform & platform);

    /**
     * Remove a platform from the project.
     *
     * \note The remove will fail if there is only one platform left.
     * \return true if the platform was removed, false otherwise.
     */
    bool RemovePlatform(const gd::String & platformName);

    /**
     * \brief Return a reference to the platform being currently used to edit the project.
     */
    Platform & GetCurrentPlatform() const;

    /**
     * \brief Set the platform to be used to edit the project.
     * \param platformName The name of the new current platform. If not found, the current platform won't be changed.
     */
    void SetCurrentPlatform(const gd::String & platformName);
    #endif

    ///@}

    /** \name Factory method
     * Member functions used to create objects for the project
     */
    ///@{

    /**
     * Create an object of the given type with the specified name.
     *
     * \note A project can use more than one platform. In this case, the first platform supporting the object is used,
     * unless \a platformName argument is not empty.<br>
     * It is assumed that each platform provides an equivalent object.
     *
     * \param type The type of the object
     * \param name The name of the object
     * \param platformName The name of the platform to be used. If empty, the first platform supporting the object is used.
     */
    std::unique_ptr<gd::Object> CreateObject(const gd::String & type, const gd::String & name, const gd::String & platformName = "");

    /**
     * Create a behavior of the given type.
     *
     * \note A project can use more than one platform. In this case, the first platform supporting the behavior is used,
     * unless \a platformName argument is not empty.<br>
     * It is assumed that each platform provides an equivalent behavior.
     *
     * \param project The project for which the object must be created.
     * \param type The type of the behavior
     * \param platformName The name of the platform to be used. If empty, the first platform supporting the object is used.
     */
    std::unique_ptr<gd::Behavior> CreateBehavior(const gd::String & type, const gd::String & platformName = "");

    /**
     * Create behavior shared data of the given type.
     *
     * \note A project can use more than one platform. In this case, the first platform supporting the behavior shared data is used,
     * unless \a platformName argument is not empty.<br>
     * It is assumed that each platform provides equivalent behavior shared data.
     *
     * \param project The project for which the behavior shared data must be created.
     * \param type The type of behavior shared data
     * \param platformName The name of the platform to be used. If empty, the first platform supporting the object is used.
     */
    std::shared_ptr<gd::BehaviorsSharedData> CreateBehaviorSharedDatas(const gd::String & type, const gd::String & platformName = "");

#if defined(GD_IDE_ONLY)
    /**
     * Create an event of the given type.
     *
     * \note A project can use more than one platform. In this case, the first platform supporting the event is used,
     * unless \a platformName argument is not empty.<br>
     * It is assumed that each platform provides equivalent events.
     *
     * \param project The project for which the event must be created.
     * \param type The type of the event
     * \param platformName The name of the platform to be used. If empty, the first platform supporting the object is used.
     */
    std::shared_ptr<gd::BaseEvent> CreateEvent(const gd::String & type, const gd::String & platformName = "");
    ///@}
#endif

#if !defined(GD_NO_WX_GUI)
    /** \name GUI property grid management
     * Members functions related to managing the wxWidgets property grid used to display the properties of the project.
     */
    ///@{
    /**
     * IDE calls this function so as to let the project populate a wxPropertyGrid with its properties.
     */
    void PopulatePropertyGrid(wxPropertyGrid * grid);

    /**
     * IDE calls this function so that the project update its properties from the values stored in the wxPropertyGrid.
     */
    void UpdateFromPropertyGrid(wxPropertyGrid * grid);

    /**
     * IDE calls this function when a property is selected in the property grid.
     */
    void OnSelectionInPropertyGrid(wxPropertyGrid * grid, wxPropertyGridEvent & event);

    /**
     * IDE calls this function when a property was changed in the property grid.
     */
    void OnChangeInPropertyGrid(wxPropertyGrid * grid, wxPropertyGridEvent & event);
    ///@}
#endif

    /** \name Layouts management
     * Members functions related to layout management.
     */
    ///@{

    /**
     * \brief Return true if layout called "name" exists.
     */
    bool HasLayoutNamed(const gd::String & name) const;

    /**
     * \brief Return a reference to the layout called "name".
     */
    Layout & GetLayout(const gd::String & name);

    /**
     * \brief Return a reference to the layout called "name".
     */
    const Layout & GetLayout(const gd::String & name) const;

    /**
     * \brief Return a reference to the layout at position "index" in the layout list
     */
    Layout & GetLayout(std::size_t index);

    /**
     * \brief Return a reference to the layout at position "index" in the layout list
     */
    const Layout & GetLayout (std::size_t index) const;

    /**
     * \brief Return the position of the layout called "name" in the layout list
     */
    std::size_t GetLayoutPosition(const gd::String & name) const;

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
     * \brief Must add a new empty layout called "name" at the specified position in the layout list.
     */
    gd::Layout & InsertNewLayout(const gd::String & name, std::size_t position);

    /**
     * \brief Must add a new layout constructed from the layout passed as parameter.
     * \note No pointer or reference must be kept on the layout passed as parameter.
     * \param layout The layout that must be copied and inserted into the project
     * \param position Insertion position. Even if the position is invalid, the layout must be inserted at the end of the layout list.
     */
    gd::Layout & InsertLayout(const Layout & layout, std::size_t position);

    /**
     * Must delete layout named "name".
     */
    void RemoveLayout(const gd::String & name);

    ///@}

    /**
     * \brief Unserialize the project from an element.
     */
    void UnserializeFrom(const SerializerElement & element);

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Called to serialize the project to a TiXmlElement.
     *
     * "Dirty" flag is set to false when serialization is done.
     */
    void SerializeTo(SerializerElement & element) const;

    /**
     * \brief Return true if the project is marked as being modified (The IDE or application
     * using the project should ask to save the project if the project is closed).
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
    unsigned int GetLastSaveGDMajorVersion() { return GDMajorVersion; };

    /**
     * Get the minor version of GDevelop used to save the project.
     */
    unsigned int GetLastSaveGDMinorVersion() { return GDMinorVersion; };
    #endif

    /** \name External events management
     * Members functions related to external events management.
     */
    ///@{
    #if defined(GD_IDE_ONLY)
    /**
     * Return true if external events called "name" exists.
     */
    bool HasExternalEventsNamed(const gd::String & name) const;

    /**
     * Return a reference to the external events called "name".
     */
    ExternalEvents & GetExternalEvents(const gd::String & name);

    /**
     * Return a reference to the external events called "name".
     */
    const ExternalEvents & GetExternalEvents(const gd::String & name) const;

    /**
     * Return a reference to the external events at position "index" in the external events list
     */
    ExternalEvents & GetExternalEvents(std::size_t index);

    /**
     * Return a reference to the external events at position "index" in the external events list
     */
    const ExternalEvents & GetExternalEvents (std::size_t index) const;

    /**
     * Return the position of the external events called "name" in the external events list
     */
    std::size_t GetExternalEventsPosition(const gd::String & name) const;

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
     * Must add a new empty external events sheet called "name" at the specified position in the layout list.
     */
    ExternalEvents & InsertNewExternalEvents(const gd::String & name, std::size_t position);

    /**
     * Must add a new external events sheet constructed from the layout passed as parameter.
     * \note No pointer or reference must be kept on the external events passed as parameter.
     * \param externalEvents The external events that must be copied and inserted into the project
     * \param position Insertion position. Even if the position is invalid, the external events must be inserted at the end of the external events list.
     */
    ExternalEvents & InsertExternalEvents(const ExternalEvents & externalEvents, std::size_t position);

    /**
     * Must delete external events named "name".
     */
    void RemoveExternalEvents(const gd::String & name);
    #endif
    ///@}

    /** \name External layout management
     * Members functions related to external layout management.
     */
    ///@{

    /**
     * Return true if external layout called "name" exists.
     */
    bool HasExternalLayoutNamed(const gd::String & name) const;

    /**
     * Return a reference to the external layout called "name".
     */
    ExternalLayout & GetExternalLayout(const gd::String & name);

    /**
     * Return a reference to the external layout called "name".
     */
    const ExternalLayout & GetExternalLayout(const gd::String & name) const;

    /**
     * Return a reference to the external layout at position "index" in the external layout list
     */
    ExternalLayout & GetExternalLayout(std::size_t index);

    /**
     * Return a reference to the external layout at position "index" in the external layout list
     */
    const ExternalLayout & GetExternalLayout (std::size_t index) const;

    /**
     * Return the position of the external layout called "name" in the external layout list
     */
    std::size_t GetExternalLayoutPosition(const gd::String & name) const;

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
     * Must add a new empty external layout called "name" at the specified position in the layout list.
     */
    gd::ExternalLayout & InsertNewExternalLayout(const gd::String & name, std::size_t position);

    /**
     * Must add a new external layout constructed from the layout passed as parameter.
     * \note No pointer or reference must be kept on the external layout passed as parameter.
     * \param externalLayout The external layout that must be copied and inserted into the project
     * \param position Insertion position. Even if the position is invalid, the external layout must be inserted at the end of the external layout list.
     */
    gd::ExternalLayout & InsertExternalLayout(const ExternalLayout & externalLayout, std::size_t position);

    /**
     * Must delete external layout named "name".
     */
    void RemoveExternalLayout(const gd::String & name);

    /**
     * Set the first layout of the project.
     */
    void SetFirstLayout(const gd::String & name ) { firstLayout = name; }

    /**
     * Get the first layout of the project.
     */
    const gd::String & GetFirstLayout() { return firstLayout; }

    ///@}

    /** \name Global objects groups management
     * Members functions related to global objects groups management.
     */
    ///@{

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Return a reference to the project's objects groups.
     */
    ObjectGroupsContainer & GetObjectGroups() { return objectGroups; }

    /**
     * \brief Return a const reference to the project's objects groups.
     */
    const ObjectGroupsContainer & GetObjectGroups() const { return objectGroups; }
    #endif

    ///@}

    /** \name Resources management
     * Members functions related to resources management.
     */
    ///@{
    /**
     * \brief Provide access to the ResourceManager member containing the list of the resources.
     */
    const ResourcesManager & GetResourcesManager() const { return resourcesManager; }

    /**
     * \brief Provide access to the ResourceManager member containing the list of the resources.
     */
    ResourcesManager & GetResourcesManager() { return resourcesManager; }

    /**
     * \brief Provide access to the ImageManager allowing to load SFML or OpenGL textures for the
     * IDE ( or at runtime for the GD C++ Platform ).
     */
    const std::shared_ptr<gd::ImageManager> & GetImageManager() const { return imageManager; }

    /**
     * \brief Provide access to the ImageManager allowing to load SFML or OpenGL textures for the
     * IDE ( or at runtime for the GD C++ Platform ).
     */
    std::shared_ptr<gd::ImageManager> & GetImageManager() { return imageManager; }

    /**
     * \brief Provide access to the ImageManager allowing to load SFML or OpenGL textures for the
     * IDE ( or at runtime for the GD C++ Platform ).
     */
    void SetImageManager(std::shared_ptr<gd::ImageManager> imageManager_) { imageManager = imageManager_; }

    /**
     * \brief Called ( e.g. during compilation ) so as to inventory internal resources and sometimes update their filename.
     *
     * \see ArbitraryResourceWorker
     */
    void ExposeResources(gd::ArbitraryResourceWorker & worker);
    ///@}

    /** \name Variable management
     * Members functions related to global variables management.
     */
    ///@{

    /**
     * Provide access to the gd::VariablesContainer member containing the global variables
     */
    inline const gd::VariablesContainer & GetVariables() const { return variables; }

    /**
     * Provide access to the gd::VariablesContainer member containing the global variables
     */
    inline gd::VariablesContainer & GetVariables() { return variables; }

    ///@}

    /** \name Other
     */
    ///@{

    /**
     * Return true if \a objectName can be used as name for an object.
     *
     * Default implementation check if objectName is only composed of a-z,A-Z,0-9 or _ characters an
     * if does not conflict with an expression.
     */
    static bool ValidateObjectName(const gd::String & objectName);

    /**
     * Return a message that will be displayed when an invalid object name has been entered.
     *
     * \note This message will be displayed by the IDE into a tooltip.
     */
    static gd::String GetBadObjectNameWarning();

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
     * \brief Return a const reference to the vector containing all the source files used by
     * the game.
     */
    const std::vector < std::unique_ptr<gd::SourceFile> > & GetAllSourceFiles() const { return externalSourceFiles; }

    /**
     * \brief Return true if the source file with the specified name is used by the game.
     * \param name The filename of the source file.
     * \param language Optional. If specified, check that the source file that exists is in this language.
     */
    bool HasSourceFile(gd::String name, gd::String language = "") const;

    /**
     * Return a reference to the external source file with the given name.
     */
    SourceFile & GetSourceFile(const gd::String & name);

    /**
     * Return a reference to the external source file with the given name.
     */
    const SourceFile & GetSourceFile(const gd::String & name) const;

    /**
     * Remove the specified source file.
     */
    void RemoveSourceFile(const gd::String & name);

    /**
     * Add a new source file the specified position in the external source files list.
     */
    gd::SourceFile & InsertNewSourceFile(const gd::String & name, const gd::String & language, std::size_t position = -1);
    #endif
    ///@}

    //TODO: Put this in private part
    #if defined(GD_IDE_ONLY)
    std::vector < gd::String > imagesChanged; ///< Images that have been changed and which have to be reloaded
    gd::String winExecutableFilename; ///< Windows executable name
    gd::String winExecutableIconFile; ///< Icon for Windows executable
    gd::String linuxExecutableFilename;  ///< Linux executable name
    gd::String macExecutableFilename;  ///< Mac executable name
    #endif

private:

    /**
     * Initialize from another game. Used by copy-ctor and assign-op.
     * Don't forget to update me if members were changed !
     */
    void Init(const gd::Project & project);

    /**
     * Helper method for LoadFromXml method.
     */
    void LoadProjectInformationFromXml(const TiXmlElement * elem);

    gd::String                                         name; ///< Game name
    unsigned int                                        windowWidth; ///< Window default width
    unsigned int                                        windowHeight; ///< Window default height
    int                                                 maxFPS; ///< Maximum Frame Per Seconds, -1 for unlimited
    unsigned int                                        minFPS; ///< Minimum Frame Per Seconds ( slow down game if FPS are below this number )
    bool                                                verticalSync; ///< If true, must activate vertical synchronization.
    std::vector < std::unique_ptr<gd::Layout> >       scenes; ///< List of all scenes
    gd::VariablesContainer                              variables; ///< Initial global variables
    std::vector < std::unique_ptr<gd::ExternalLayout> >   externalLayouts; ///< List of all externals layouts
    gd::ResourcesManager                                resourcesManager; ///< Contains all resources used by the project
    std::shared_ptr<gd::ImageManager>                 imageManager;///< Image manager is accessed thanks to a (smart) ptr as it can be shared with GD C++ Platform projects.
    std::vector < gd::String >                         extensionsUsed; ///< List of extensions used
    std::vector < gd::Platform* >                       platforms; ///< Pointers to the platforms this project supports.
    gd::String                                         firstLayout;
    #if defined(GD_IDE_ONLY)
    bool                                                useExternalSourceFiles; ///< True if game used external source files.
    std::vector < std::unique_ptr<gd::SourceFile> >   externalSourceFiles; ///< List of external source files used.
    gd::ObjectGroupsContainer                            objectGroups; ///< Global objects groups
    gd::String                                         author; ///< Game author name
    gd::String                                         packageName; ///< Game package name
    bool                                                folderProject; ///< True if folder project, false if single file project.
    gd::String                                         gameFile; ///< File of the game
    gd::String                                         latestCompilationDirectory; ///< File of the game
    gd::Platform*                                       currentPlatform; ///< The platform being used to edit the project.
    std::vector < std::unique_ptr<gd::ExternalEvents> >   externalEvents; ///< List of all externals events
    mutable unsigned int                                GDMajorVersion; ///< The GD major version used the last time the project was saved.
    mutable unsigned int                                GDMinorVersion; ///< The GD minor version used the last time the project was saved.
    mutable bool                                        dirty; ///< True to flag the project as being modified.
    #endif
};

}


#endif // GDCORE_PROJECT_H
