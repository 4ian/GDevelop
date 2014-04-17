/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_PROJECT_H
#define GDCORE_PROJECT_H
#include <string>
#include <vector>
class wxPropertyGrid;
class wxPropertyGridEvent;
class TiXmlElement;
#include "GDCore/PlatformDefinition/ObjectGroup.h"
#include "GDCore/PlatformDefinition/ClassWithObjects.h"
#include "GDCore/PlatformDefinition/ChangesNotifier.h"
#include "GDCore/PlatformDefinition/VariablesContainer.h"
#include "GDCore/PlatformDefinition/ResourcesManager.h"
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
namespace gd { class Automatism; }
namespace gd { class AutomatismsSharedData; }
namespace gd { class BaseEvent; }
#undef GetObject //Disable an annoying macro

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
     * Change project name
     */
    void SetName(const std::string & name_) { name = name_; };

    /**
     * Get project name
     */
    const std::string & GetName() const {return name;}

#if defined(GD_IDE_ONLY)
    /**
     * Must change the name of the project with the name passed as parameter.
     */
    void SetAuthor(const std::string & author_) { author = author_; };

    /**
     * Return the name of the project.
     */
    const std::string & GetAuthor() const {return author;}

    /**
     * Called when project file has changed.
     */
    void SetProjectFile(const std::string & file) { gameFile = file; }

    /**
     * Return project file
     * \see gd::Project::SetProjectFile
     */
    const std::string & GetProjectFile() const { return gameFile; }

    /**
     * Called when project file has changed.
     */
    void SetLastCompilationDirectory(const std::string & dir){ latestCompilationDirectory = dir; }

    /**
     * Return the latest directory used to compile the game
     * \see gd::Project::SetLastCompilationDirectory
     */
    const std::string & GetLastCompilationDirectory() const {return latestCompilationDirectory;}
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
    const std::vector < std::string > & GetUsedExtensions() const { return extensionsUsed; };

    /**
     * Return a reference to the vector containing the names of extensions used by the project.
     */
    std::vector < std::string > & GetUsedExtensions() { return extensionsUsed; };

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
    bool RemovePlatform(const std::string & platformName);

    /**
     * \brief Return a reference to the platform being currently used to edit the project.
     */
    Platform & GetCurrentPlatform() const;

    /**
     * \brief Set the platform to be used to edit the project.
     * \param platformName The name of the new current platform. If not found, the current platform won't be changed.
     */
    void SetCurrentPlatform(const std::string & platformName);
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
    boost::shared_ptr<gd::Object> CreateObject(const std::string & type, const std::string & name, const std::string & platformName = "");

    /**
     * Create an automatism of the given type.
     *
     * \note A project can use more than one platform. In this case, the first platform supporting the automatism is used,
     * unless \a platformName argument is not empty.<br>
     * It is assumed that each platform provides an equivalent automatism.
     *
     * \param project The project for which the object must be created.
     * \param type The type of the automatism
     * \param platformName The name of the platform to be used. If empty, the first platform supporting the object is used.
     */
    gd::Automatism* CreateAutomatism(const std::string & type, const std::string & platformName = "");

    /**
     * Create automatism shared data of the given type.
     *
     * \note A project can use more than one platform. In this case, the first platform supporting the automatism shared data is used,
     * unless \a platformName argument is not empty.<br>
     * It is assumed that each platform provides equivalent automatism shared data.
     *
     * \param project The project for which the automatism shared data must be created.
     * \param type The type of automatism shared data
     * \param platformName The name of the platform to be used. If empty, the first platform supporting the object is used.
     */
    boost::shared_ptr<gd::AutomatismsSharedData> CreateAutomatismSharedDatas(const std::string & type, const std::string & platformName = "");

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
    boost::shared_ptr<gd::BaseEvent> CreateEvent(const std::string & type, const std::string & platformName = "");
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
    bool HasLayoutNamed(const std::string & name) const;

    /**
     * \brief Return a reference to the layout called "name".
     */
    Layout & GetLayout(const std::string & name);

    /**
     * \brief Return a reference to the layout called "name".
     */
    const Layout & GetLayout(const std::string & name) const;

    /**
     * \brief Return a reference to the layout at position "index" in the layout list
     */
    Layout & GetLayout(unsigned int index);

    /**
     * \brief Return a reference to the layout at position "index" in the layout list
     */
    const Layout & GetLayout (unsigned int index) const;

    /**
     * \brief Return the position of the layout called "name" in the layout list
     */
    unsigned int GetLayoutPosition(const std::string & name) const;

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Swap the specified layouts.
     *
     * Do nothing if indexes are not correct.
     */
    void SwapLayouts(unsigned int first, unsigned int second);
    #endif

    /**
     * \brief Return the number of layouts.
     */
    unsigned int GetLayoutCount() const;

    /**
     * \brief Must add a new empty layout called "name" at the specified position in the layout list.
     */
    gd::Layout & InsertNewLayout(const std::string & name, unsigned int position);

    /**
     * \brief Must add a new layout constructed from the layout passed as parameter.
     * \note No pointer or reference must be kept on the layout passed as parameter.
     * \param layout The layout that must be copied and inserted into the project
     * \param position Insertion position. Even if the position is invalid, the layout must be inserted at the end of the layout list.
     */
    gd::Layout & InsertLayout(const Layout & layout, unsigned int position);

    /**
     * Must delete layout named "name".
     */
    void RemoveLayout(const std::string & name);

    ///@}

    /** \name Saving and loading
     * Members functions related to saving and loading the project.
     */
    ///@{
    /**
     * \brief Save the project to a file.
     *
     * "Dirty" flag is set to false when save is done.
     */
    bool SaveToFile(const std::string & filename);

    /**
     * \brief Load the project from a file.
     */
    bool LoadFromFile(const std::string & filename);

    /**
     * Called to save the layout to a TiXmlElement.
     *
     * "Dirty" flag is set to false when save is done.
     */
    void SaveToXml(TiXmlElement * element) const;

    /**
     * Called to load the layout from a TiXmlElement.
     */
    void LoadFromXml(const TiXmlElement * element);

    #if defined(GD_IDE_ONLY)

    /**
     * \brief Return true if the project is marked as being modified (The IDE or application
     * using the project should ask for save the project if the project is closed).
     */
    bool IsDirty() { return dirty; }

    /**
     * \brief Mark the project as being modified (The IDE or application
     * using the project should ask for save the project if the project is closed).
     */
    void SetDirty(bool enable = true) { dirty = enable; }

    /**
     * Get the major version of Game Develop used to save the project.
     */
    unsigned int GetLastSaveGDMajorVersion() { return GDMajorVersion; };

    /**
     * Get the minor version of Game Develop used to save the project.
     */
    unsigned int GetLastSaveGDMinorVersion() { return GDMinorVersion; };
    #endif
    ///@}

    /** \name External events management
     * Members functions related to external events management.
     */
    ///@{
    #if defined(GD_IDE_ONLY)
    /**
     * Return true if external events called "name" exists.
     */
    bool HasExternalEventsNamed(const std::string & name) const;

    /**
     * Return a reference to the external events called "name".
     */
    ExternalEvents & GetExternalEvents(const std::string & name);

    /**
     * Return a reference to the external events called "name".
     */
    const ExternalEvents & GetExternalEvents(const std::string & name) const;

    /**
     * Return a reference to the external events at position "index" in the external events list
     */
    ExternalEvents & GetExternalEvents(unsigned int index);

    /**
     * Return a reference to the external events at position "index" in the external events list
     */
    const ExternalEvents & GetExternalEvents (unsigned int index) const;

    /**
     * Return the position of the external events called "name" in the external events list
     */
    unsigned int GetExternalEventsPosition(const std::string & name) const;

    /**
     * \brief Swap the specified external events.
     *
     * Do nothing if indexes are not correct.
     */
    void SwapExternalEvents(unsigned int first, unsigned int second);

    /**
     * Return the number of external events.
     */
    unsigned int GetExternalEventsCount() const;

    /**
     * Must add a new empty external events sheet called "name" at the specified position in the layout list.
     */
    ExternalEvents & InsertNewExternalEvents(const std::string & name, unsigned int position);

    /**
     * Must add a new external events sheet constructed from the layout passed as parameter.
     * \note No pointer or reference must be kept on the external events passed as parameter.
     * \param externalEvents The external events that must be copied and inserted into the project
     * \param position Insertion position. Even if the position is invalid, the external events must be inserted at the end of the external events list.
     */
    void InsertExternalEvents(const ExternalEvents & externalEvents, unsigned int position);

    /**
     * Must delete external events named "name".
     */
    void RemoveExternalEvents(const std::string & name);
    #endif
    ///@}

    /** \name External layout management
     * Members functions related to external layout management.
     */
    ///@{

    /**
     * Return true if external layout called "name" exists.
     */
    bool HasExternalLayoutNamed(const std::string & name) const;

    /**
     * Return a reference to the external layout called "name".
     */
    ExternalLayout & GetExternalLayout(const std::string & name);

    /**
     * Return a reference to the external layout called "name".
     */
    const ExternalLayout & GetExternalLayout(const std::string & name) const;

    /**
     * Return a reference to the external layout at position "index" in the external layout list
     */
    ExternalLayout & GetExternalLayout(unsigned int index);

    /**
     * Return a reference to the external layout at position "index" in the external layout list
     */
    const ExternalLayout & GetExternalLayout (unsigned int index) const;

    /**
     * Return the position of the external layout called "name" in the external layout list
     */
    unsigned int GetExternalLayoutPosition(const std::string & name) const;

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Swap the specified external layouts.
     *
     * Do nothing if indexes are not correct.
     */
    void SwapExternalLayouts(unsigned int first, unsigned int second);
    #endif

    /**
     * Return the number of external layout.
     */
    unsigned int GetExternalLayoutsCount() const;

    /**
     * Must add a new empty external layout called "name" at the specified position in the layout list.
     */
    gd::ExternalLayout & InsertNewExternalLayout(const std::string & name, unsigned int position);

    /**
     * Must add a new external layout constructed from the layout passed as parameter.
     * \note No pointer or reference must be kept on the external layout passed as parameter.
     * \param externalLayout The external layout that must be copied and inserted into the project
     * \param position Insertion position. Even if the position is invalid, the external layout must be inserted at the end of the external layout list.
     */
    void InsertExternalLayout(const ExternalLayout & externalLayout, unsigned int position);

    /**
     * Must delete external layout named "name".
     */
    void RemoveExternalLayout(const std::string & name);

    /**
     * Set the first layout of the project.
     */
    void SetFirstLayout(const std::string & name ) { firstLayout = name; }

    /**
     * Get the first layout of the project.
     */
    const std::string & GetFirstLayout() { return firstLayout; }

    ///@}

    /** \name Global objects groups management
     * Members functions related to global objects groups management.
     */
    ///@{

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Return a reference to the vector containing the project's objects groups.
     */
    std::vector <ObjectGroup> & GetObjectGroups() { return objectGroups; }

    /**
     * \brief Return a const reference to the vector containing the project's objects groups.
     */
    const std::vector <ObjectGroup> & GetObjectGroups() const { return objectGroups; }
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
    const boost::shared_ptr<gd::ImageManager> & GetImageManager() const { return imageManager; }

    /**
     * \brief Provide access to the ImageManager allowing to load SFML or OpenGL textures for the
     * IDE ( or at runtime for the GD C++ Platform ).
     */
    boost::shared_ptr<gd::ImageManager> & GetImageManager() { return imageManager; }

    /**
     * \brief Provide access to the ImageManager allowing to load SFML or OpenGL textures for the
     * IDE ( or at runtime for the GD C++ Platform ).
     */
    void SetImageManager(boost::shared_ptr<gd::ImageManager> imageManager_) { imageManager = imageManager_; }

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
    bool ValidateObjectName(const std::string & objectName);

    /**
     * Return a message that will be displayed when an invalid object name has been entered.
     *
     * \note This message will be displayed by the IDE into a tooltip.
     */
    std::string GetBadObjectNameWarning();

    ///@}

    //TODO: Put this in private part
    bool useExternalSourceFiles; ///< True if game used external source files.

    #if defined(GD_IDE_ONLY)
    std::vector < std::string > imagesChanged; ///< Images that have been changed and which have to be reloaded
    std::string winExecutableFilename; ///< Windows executable name
    std::string winExecutableIconFile; ///< Icon for Windows executable
    std::string linuxExecutableFilename;  ///< Linux executable name
    std::string macExecutableFilename;  ///< Mac executable name
    std::vector < boost::shared_ptr<gd::SourceFile> > externalSourceFiles; ///< List of C++ source files used.
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

    std::string                                         name; ///< Game name
    unsigned int                                        windowWidth; ///< Window default width
    unsigned int                                        windowHeight; ///< Window default height
    int                                                 maxFPS; ///< Maximum Frame Per Seconds, -1 for unlimited
    unsigned int                                        minFPS; ///< Minimum Frame Per Seconds ( slow down game if FPS are below this number )
    bool                                                verticalSync; ///< If true, must activate vertical synchronization.
    std::vector < boost::shared_ptr<gd::Layout> >       scenes; ///< List of all scenes
    gd::VariablesContainer                              variables; ///< Initial global variables
    std::vector < boost::shared_ptr<gd::ExternalLayout> >   externalLayouts; ///< List of all externals layouts
    gd::ResourcesManager                                resourcesManager; ///< Contains all resources used by the project
    boost::shared_ptr<gd::ImageManager>                 imageManager;///< Image manager is accessed thanks to a (smart) ptr as it can be shared with GD C++ Platform projects.
    std::vector < std::string >                         extensionsUsed; ///< List of extensions used
    std::vector < gd::Platform* >                       platforms; ///< Pointers to the platforms this project supports.
    std::string                                         firstLayout;
    #if defined(GD_IDE_ONLY)
    std::vector<ObjectGroup>                            objectGroups; ///< Global objects groups
    std::string                                         author; ///< Game author name
    std::string                                         gameFile; ///< File of the game
    std::string                                         latestCompilationDirectory; ///< File of the game
    gd::Platform*                                       currentPlatform; ///< The platform being used to edit the project.
    std::vector < boost::shared_ptr<gd::ExternalEvents> >   externalEvents; ///< List of all externals events
    mutable unsigned int                                GDMajorVersion; ///< The GD major version used the last time the project was saved.
    mutable unsigned int                                GDMinorVersion; ///< The GD minor version used the last time the project was saved.
    mutable bool                                        dirty; ///< True to flag the project as being modified.
    #endif
};

}


#endif // GDCORE_PROJECT_H
