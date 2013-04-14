/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
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
    virtual ~Project();

    /**
     * Must return a pointer to a copy of the project.
     * A such method is needed as the IDE may want to store copies of some projects and so need a way to do polymorphic copies.
     *
     * Typical implementation example:
     * \code
     * return new MyProject(*this);
     * \endcode
     */
    virtual Project * Clone() const =0;

    /** \name Common properties
     * Some properties for the project
     */
    ///@{

    /**
     * Change project name
     */
    virtual void SetName(const std::string & name_) { name = name_; };

    /**
     * Get project name
     */
    virtual const std::string & GetName() const {return name;}

    /**
     * Must change the name of the project with the name passed as parameter.
     */
    virtual void SetAuthor(const std::string & author_) { author = author_; };

    /**
     * Must return the name of the project.
     */
    virtual const std::string & GetAuthor() const {return author;}

    /**
     * Called when project file has changed.
     */
    virtual void SetProjectFile(const std::string & file) { gameFile = file; }

    /**
     * Must return project file
     * \see gd::Project::SetProjectFile
     */
    virtual const std::string & GetProjectFile() const { return gameFile; }

    /**
     * Called when project file has changed.
     */
    virtual void SetLastCompilationDirectory(const std::string & dir){ latestCompilationDirectory = dir; }

    /**
     * Must return the latest directory used to compile the game
     * \see gd::Project::SetLastCompilationDirectory
     */
    virtual const std::string & GetLastCompilationDirectory() const {return latestCompilationDirectory;}

    /**
     * Change game's main window default width.
     *
     * \note This is only the default width used when creating the main window for the first time. To change the width at runtime, use the functions related to RuntimeScene.renderWindow
     */
    virtual void SetMainWindowDefaultWidth(unsigned int width) { windowWidth = width; }

    /**
     * Get the default width of the project main window
     */
    virtual unsigned int GetMainWindowDefaultWidth() const { return windowWidth; }

    /**
     * Change the default height of the project main window
     */
    virtual void SetMainWindowDefaultHeight(unsigned int height) { windowHeight = height; }

    /**
     * Return the default height of the project main window
     */
    virtual unsigned int GetMainWindowDefaultHeight() const { return windowHeight; }

    /**
     * Change the default maximum number of frames allowed to be rendered per seconds
     */
    virtual void SetMaximumFPS(int maxFPS_) { maxFPS = maxFPS_; }

    /**
     * Get the default number of maximum frame par seconds
     */
    virtual int GetMaximumFPS() const { return maxFPS; }

    /**
     * Change the default minimum number of frames allowed to be rendered per seconds
     */
    virtual void SetMinimumFPS(unsigned int minFPS_) { minFPS = minFPS_; }

    /**
     * Get the default number of minimum frame par seconds
     */
    virtual unsigned int GetMinimumFPS() const { return minFPS; }

    /**
     * Return true if vertical synchronization is enabled by default.
     */
    virtual bool IsVerticalSynchronizationEnabledByDefault() const { return verticalSync; }

    /**
     * Set if vertical synchronization is enabled by default.
     */
    virtual void SetVerticalSyncActivatedByDefault(bool enable) { verticalSync = enable; }

    /**
     * Must return a reference to the vector containing the names of extensions used by the project.
     *
     * \note Default implementation: Return a reference to an empty vector
     */
    virtual const std::vector < std::string > & GetUsedPlatformExtensions() const { return extensionsUsed; };

    /**
     * Must return a reference to the vector containing the names of extensions used by the project.
     *
     * \note Default implementation: Return a reference to an empty vector
     */
    virtual std::vector < std::string > & GetUsedPlatformExtensions() { return extensionsUsed; };

    /**
     * Must return a reference to the platform the project is based on.
     */
    virtual Platform & GetPlatform() const { return *platform; }

    ///@}

    /** \name GUI property grid management
     * Members functions related to managing the wxWidgets property grid used to display the properties of the project.
     */
    ///@{
    /**
     * IDE calls this function so as to let the project populate a wxPropertyGrid with its properties.
     *
     * The default implementation take care of managing the common properties.
     * If you redefine this method, do not forget to also call the base class method:
     * \code
     * void MyProjectClass::PopulatePropertyGrid(wxPropertyGrid * grid)
     * {
     *     gd::Project::PopulatePropertyGrid(grid);
     *     //...
     * \endcode
     */
    virtual void PopulatePropertyGrid(wxPropertyGrid * grid);

    /**
     * IDE calls this function so that the project update its properties from the values stored in the wxPropertyGrid.
     *
     * The default implementation take care of managing the common properties.
     * If you redefine this method, do not forget to also call the base class method ( See PopulatePropertyGrid for an example )
     */
    virtual void UpdateFromPropertyGrid(wxPropertyGrid * grid);

    /**
     * IDE calls this function when a property is selected in the property grid.
     *
     * The default implementation take care of managing the common properties.
     * If you redefine this method, do not forget to also call the base class method ( See PopulatePropertyGrid for an example )
     */
    virtual void OnSelectionInPropertyGrid(wxPropertyGrid * grid, wxPropertyGridEvent & event);

    /**
     * IDE calls this function when a property was changed in the property grid.
     *
     * The default implementation take care of managing the common properties.
     * If you redefine this method, do not forget to also call the base class method ( See PopulatePropertyGrid for an example )
     */
    virtual void OnChangeInPropertyGrid(wxPropertyGrid * grid, wxPropertyGridEvent & event);
    ///@}

    /** \name Layouts management
     * Members functions related to layout management.
     */
    ///@{

    /**
     * Must return true if layout called "name" exists.
     */
    virtual bool HasLayoutNamed(const std::string & name) const;

    /**
     * Must return a reference to the layout called "name".
     */
    virtual Layout & GetLayout(const std::string & name);

    /**
     * Must return a reference to the layout called "name".
     */
    virtual const Layout & GetLayout(const std::string & name) const;

    /**
     * Must return a reference to the layout at position "index" in the layout list
     */
    virtual Layout & GetLayout(unsigned int index);

    /**
     * Must return a reference to the layout at position "index" in the layout list
     */
    virtual const Layout & GetLayout (unsigned int index) const;

    /**
     * Must return the position of the layout called "name" in the layout list
     */
    virtual unsigned int GetLayoutPosition(const std::string & name) const;

    /**
     * Must return the number of layouts.
     */
    virtual unsigned int GetLayoutCount() const;

    /**
     * Must add a new empty layout called "name" at the specified position in the layout list.
     */
    virtual gd::Layout & InsertNewLayout(const std::string & name, unsigned int position);

    /**
     * Must add a new layout constructed from the layout passed as parameter.
     * \note No pointer or reference must be kept on the layout passed as parameter.
     * \param layout The layout that must be copied and inserted into the project
     * \param position Insertion position. Even if the position is invalid, the layout must be inserted at the end of the layout list.
     */
    virtual void InsertLayout(const Layout & layout, unsigned int position);

    /**
     * Must delete layout named "name".
     */
    virtual void RemoveLayout(const std::string & name);

    ///@}

    /** \name Saving and loading
     * Members functions related to saving and loading the project.
     */
    ///@{

    /**
     * Save the project to a file.
     * \warning This tool method do not need to ( and must not ) be redefined: See Project::SaveToXml method instead.
     */
    bool SaveToFile(const std::string & filename);

    /**
     * Load the project from a file.
     * \warning This tool method do not need to ( and must not ) be redefined: See Project::LoadFromXml method instead.
     */
    bool LoadFromFile(const std::string & filename);

    /**
     * Called to save the layout to a TiXmlElement.
     */
    virtual void SaveToXml(TiXmlElement * element) const;

    /**
     * Called to load the layout from a TiXmlElement.
     */
    virtual void LoadFromXml(const TiXmlElement * element);

    /**
     * Get the major version of Game Develop used to save the project.
     */
    unsigned int GetLastSaveGDMajorVersion() { return GDMajorVersion; };

    /**
     * Get the minor version of Game Develop used to save the project.
     */
    unsigned int GetLastSaveGDMinorVersion() { return GDMinorVersion; };
    ///@}

    /** \name External events management
     * Members functions related to external events management.
     */
    ///@{

    /**
     * Must return true if external events called "name" exists.
     */
    virtual bool HasExternalEventsNamed(const std::string & name) const;

    /**
     * Must return a reference to the external events called "name".
     */
    virtual ExternalEvents & GetExternalEvents(const std::string & name);

    /**
     * Must return a reference to the external events called "name".
     */
    virtual const ExternalEvents & GetExternalEvents(const std::string & name) const;

    /**
     * Must return a reference to the external events at position "index" in the external events list
     */
    virtual ExternalEvents & GetExternalEvents(unsigned int index);

    /**
     * Must return a reference to the external events at position "index" in the external events list
     */
    virtual const ExternalEvents & GetExternalEvents (unsigned int index) const;

    /**
     * Must return the position of the external events called "name" in the external events list
     */
    virtual unsigned int GetExternalEventsPosition(const std::string & name) const;

    /**
     * Must return the number of external events.
     */
    virtual unsigned int GetExternalEventsCount() const;

    /**
     * Must add a new empty external events sheet called "name" at the specified position in the layout list.
     */
    virtual ExternalEvents & InsertNewExternalEvents(const std::string & name, unsigned int position);

    /**
     * Must add a new external events sheet constructed from the layout passed as parameter.
     * \note No pointer or reference must be kept on the external events passed as parameter.
     * \param externalEvents The external events that must be copied and inserted into the project
     * \param position Insertion position. Even if the position is invalid, the external events must be inserted at the end of the external events list.
     */
    virtual void InsertExternalEvents(const ExternalEvents & externalEvents, unsigned int position);

    /**
     * Must delete external events named "name".
     */
    virtual void RemoveExternalEvents(const std::string & name);

    ///@}

    /** \name External layout management
     * Members functions related to external layout management.
     */
    ///@{

    /**
     * Must return true if external layout called "name" exists.
     */
    virtual bool HasExternalLayoutNamed(const std::string & name) const;

    /**
     * Must return a reference to the external layout called "name".
     */
    virtual ExternalLayout & GetExternalLayout(const std::string & name);

    /**
     * Must return a reference to the external layout called "name".
     */
    virtual const ExternalLayout & GetExternalLayout(const std::string & name) const;

    /**
     * Must return a reference to the external layout at position "index" in the external layout list
     */
    virtual ExternalLayout & GetExternalLayout(unsigned int index);

    /**
     * Must return a reference to the external layout at position "index" in the external layout list
     */
    virtual const ExternalLayout & GetExternalLayout (unsigned int index) const;

    /**
     * Must return the position of the external layout called "name" in the external layout list
     */
    virtual unsigned int GetExternalLayoutPosition(const std::string & name) const;

    /**
     * Must return the number of external layout.
     */
    virtual unsigned int GetExternalLayoutsCount() const;

    /**
     * Must add a new empty external layout called "name" at the specified position in the layout list.
     */
    virtual gd::ExternalLayout & InsertNewExternalLayout(const std::string & name, unsigned int position);

    /**
     * Must add a new external layout constructed from the layout passed as parameter.
     * \note No pointer or reference must be kept on the external layout passed as parameter.
     * \param externalLayout The external layout that must be copied and inserted into the project
     * \param position Insertion position. Even if the position is invalid, the external layout must be inserted at the end of the external layout list.
     */
    virtual void InsertExternalLayout(const ExternalLayout & externalLayout, unsigned int position);

    /**
     * Must delete external layout named "name".
     */
    virtual void RemoveExternalLayout(const std::string & name);

    ///@}

    /** \name Global objects groups management
     * Members functions related to global objects groups management.
     */
    ///@{

    /**
     * Return a reference to the vector containing the project's objects groups.
     */
    std::vector <ObjectGroup> & GetObjectGroups() { return objectGroups; }

    /**
     * Return a const reference to the vector containing the project's objects groups.
     */
    const std::vector <ObjectGroup> & GetObjectGroups() const { return objectGroups; }

    ///@}

    /** \name Resources management
     * Members functions related to resources management.
     */
    ///@{
    /**
     * Provide access to the ResourceManager member containing the list of the resources.
     */
    inline const ResourcesManager & GetResourcesManager() const { return resourcesManager; }

    /**
     * Provide access to the ResourceManager member containing the list of the resources.
     */
    inline ResourcesManager & GetResourcesManager() { return resourcesManager; }

    /**
     * Provide access to the ImageManager allowing to load SFML or OpenGL textures for the
     * IDE ( or at runtime for the GD C++ Platform ).
     */
    inline const boost::shared_ptr<gd::ImageManager> & GetImageManager() const { return imageManager; }

    /**
     * Provide access to the ImageManager allowing to load SFML or OpenGL textures for the
     * IDE ( or at runtime for the GD C++ Platform ).
     */
    inline boost::shared_ptr<gd::ImageManager> & GetImageManager() { return imageManager; }

    /**
     * Provide access to the ImageManager allowing to load SFML or OpenGL textures for the
     * IDE ( or at runtime for the GD C++ Platform ).
     */
    inline void SetImageManager(boost::shared_ptr<gd::ImageManager> imageManager_) { imageManager = imageManager_; }

    /**
     * Called ( e.g. during compilation ) so as to inventory internal resources and sometimes update their filename.
     *
     * \note The default implementation takes care of exposing all resources of global objects, layouts, events.
     * If you want to expose additional resources, you can redefine this method to add the resources to expose and call the
     * base class method too:
     * \code
     * void MyProject::ExposeResources(gd::ArbitraryResourceWorker & worker)
     * {
     *     gd::Project::ExposeResources(worker);
     *     worker.ExposeResource(myResource);
     * }
     * \endcode
     *
     * \see ArbitraryResourceWorker
     */
    virtual void ExposeResources(gd::ArbitraryResourceWorker & worker);
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

    /** \name Notification of changes
     *
     */
    ///@{

    /**
     * Must provide a ChangesNotifier object that will be called by the IDE if needed.
     * The IDE is not supposed to store the returned object.
     *
     * The default implementation simply return a ChangesNotifier object doing nothing.
     */
    virtual ChangesNotifier & GetChangesNotifier() { return defaultEmptyChangesNotifier; };
    ///@}

    /** \name Other
     */
    ///@{

    /**
     * Must return true if \a objectName can be used as name for an object.
     *
     * Default implementation check if objectName is only composed of a-z,A-Z,0-9 or _ characters an
     * if does not conflict with an expression.
     */
    bool ValidateObjectName(const std::string & objectName);

    /**
     * Must return a message that will be displayed when an invalid object name has been entered.
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

protected:

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
    std::vector<ObjectGroup> objectGroups;              ///< Global objects groups
    boost::shared_ptr<gd::ImageManager>                 imageManager;///< Image manager is accessed thanks to a (smart) ptr as it can be shared with GD C++ Platform RuntimeGame.
    #if defined(GD_IDE_ONLY)
    std::string                                         author; ///< Game author name
    std::string                                         gameFile; ///< File of the game
    std::string                                         latestCompilationDirectory; ///< File of the game
    std::vector < std::string >                         extensionsUsed; ///< List of extensions used
    gd::Platform *                                      platform; ///< Pointer to the platform owning the project
    std::vector < boost::shared_ptr<gd::ExternalEvents> >   externalEvents; ///< List of all externals events
    mutable unsigned int                                GDMajorVersion; ///< The GD major version used the last time the project was saved.
    mutable unsigned int                                GDMinorVersion; ///< The GD minor version used the last time the project was saved.
    #endif


    static ChangesNotifier defaultEmptyChangesNotifier;
};

}


#endif // GDCORE_PROJECT_H
