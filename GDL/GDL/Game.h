/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GAME_H
#define GAME_H

#include <string>
#include <vector>
#include <boost/shared_ptr.hpp>
#include "GDL/VariableList.h"
#include "GDL/LoadingScreen.h"
#include "GDL/ResourcesManager.h"
class Object;
class Scene;
class ExternalEvents;
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/Project.h"
namespace gd { class Platform; }
namespace gd { class Layout; }
namespace gd { class ExternalEvents; }
namespace GDpriv { class SourceFile; }
#endif

/**
 * \brief Represent a game.
 *
 * Game contains all data of a game, from scenes to properties like game's name.
 *
 * \ingroup GameEngine
 * \ingroup PlatformDefinition
 *
 * \note When compiled for Game Develop IDE, this class inherits gd::Project and thus redefines methods related to gd::Project. When compiled for runtime, the class is stand alone and so contains only method useful for runtime.
 */
class GD_API Game
#if defined(GD_IDE_ONLY)
 : public gd::Project //When compiled for GD IDE, Game class inherits from gd::Project so as to be able to be manipulated by Game Develop.
#endif
{
public:

    /**
     * Default constructor
     */
    Game();

    /**
     * Default copy constructor
     */
    Game(const Game&);

    /**
     * Default destructor
     */
    virtual ~Game();

    /**
     * Assignment operator
     */
    Game& operator=(const Game & rhs);

    /**
     * Change project name
     */
    virtual void SetName(const std::string & name_) { name = name_; };

    /**
     * Get project name
     */
    virtual const std::string & GetName() const {return name;}

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
     * Change game's main window default height.
     *
     * \note This is only the default height used when creating the main window for the first time. To change the height at runtime, use the functions related to RuntimeScene.renderWindow
     */
    virtual void SetMainWindowDefaultHeight(unsigned int height)  { windowHeight = height; }

    /**
     * Get the default height of the project main window
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
     * Return a reference to the vector containing the (smart) pointers to the layouts.
     */
    inline const std::vector < boost::shared_ptr<Object> > & GetGlobalObjects() const { return globalObjects; }

    /**
     * Return a reference to the vector containing the (smart) pointers to the layouts.
     */
    inline std::vector < boost::shared_ptr<Object> > & GetGlobalObjects() { return globalObjects; }

    /**
     * Return a reference to the vector containing the (smart) pointers to the layouts.
     */
    inline const std::vector < boost::shared_ptr<Scene> > & GetLayouts() const { return scenes; }

    /**
     * Return a reference to the vector containing the (smart) pointers to the layouts.
     */
    inline std::vector < boost::shared_ptr<Scene> > & GetLayouts() { return scenes; }

    /**
     * Provide access to the ListVariable member containing the global variables
     */
    inline const ListVariable & GetVariables() const { return variables; }

    /**
     * Provide access to the ListVariable member containing the global variables
     */
    inline ListVariable & GetVariables() { return variables; }

    #if defined(GD_IDE_ONLY)
    /**
     * Return a reference to the vector containing the (smart) pointers to the external events.
     */
    inline const std::vector < boost::shared_ptr<ExternalEvents> > & GetExternalEvents() const { return externalEvents; }

    /**
     * Return a reference to the vector containing the (smart) pointers to the external events.
     */
    inline std::vector < boost::shared_ptr<ExternalEvents> > & GetExternalEvents() { return externalEvents; }
    #endif

    bool portable; ///< True if the game was saved as a portable game file
    LoadingScreen loadingScreen; ///< Data concerning the loading screen
    ResourcesManager resourceManager; ///< Contains all resources used by the project
    bool useExternalSourceFiles; ///< True if game used external source files.

    #if defined(GD_IDE_ONLY)
    std::string gameFile; ///< File of the game
    std::vector < string > imagesChanged; ///< Images that have been changed and which have to be reloaded
    std::string winExecutableFilename; ///< Windows executable name
    std::string winExecutableIconFile; ///< Icon for Windows executable
    std::string linuxExecutableFilename;  ///< Linux executable name
    std::string macExecutableFilename;  ///< Mac executable name
    std::vector < boost::shared_ptr<GDpriv::SourceFile> > externalSourceFiles; ///< List of C++ source files used.
    #endif

    #if defined(GD_IDE_ONLY)
    /** \name Specialization of gd::Project members
     * See gd::Project documentation for more information about what these members functions should do.
     */
    ///@{
    virtual void SetAuthor(const std::string & author_) { author = author_; };
    virtual const std::string & GetAuthor() {return author;}

    virtual bool HasLayoutNamed(const std::string & name) const;
    virtual gd::Layout & GetLayout(const std::string & name);
    virtual const gd::Layout & GetLayout(const std::string & name) const;
    virtual gd::Layout & GetLayout(unsigned int index);
    virtual const gd::Layout & GetLayout (unsigned int index) const;
    virtual unsigned int GetLayoutPosition(const std::string & name) const;
    virtual unsigned int GetLayoutCount() const;
    virtual void InsertNewLayout(std::string & name, unsigned int position);
    virtual void InsertLayout(const gd::Layout & layout, unsigned int position);
    virtual void RemoveLayout(const std::string & name);

    virtual bool HasExternalEventsNamed(const std::string & name) const;
    virtual gd::ExternalEvents & GetExternalEvents(const std::string & name);
    virtual const gd::ExternalEvents & GetExternalEvents(const std::string & name) const;
    virtual gd::ExternalEvents & GetExternalEvents(unsigned int index);
    virtual const gd::ExternalEvents & GetExternalEvents (unsigned int index) const;
    virtual unsigned int GetExternalEventsPosition(const std::string & name) const;
    virtual unsigned int GetExternalEventsCount() const;
    virtual void InsertNewExternalEvents(std::string & name, unsigned int position);
    virtual void InsertExternalEvents(const gd::ExternalEvents & externalEvents, unsigned int position);
    virtual void RemoveExternalEvents(const std::string & name);

    virtual bool HasObjectNamed(const std::string & name) const;
    virtual gd::Object & GetObject(const std::string & name);
    virtual const gd::Object & GetObject(const std::string & name) const;
    virtual gd::Object & GetObject(unsigned int index);
    virtual const gd::Object & GetObject (unsigned int index) const;
    virtual unsigned int GetObjectPosition(const std::string & name) const;
    virtual unsigned int GetObjectsCount() const;
    virtual void InsertNewObject(std::string & name, unsigned int position);
    virtual void InsertObject(const gd::Object & theObject, unsigned int position);
    virtual void RemoveObject(const std::string & name);

    virtual std::vector < std::string > & GetUsedPlatformExtensions() { return extensionsUsed; };
    virtual const std::vector < std::string > & GetUsedPlatformExtensions() const { return extensionsUsed; };
    virtual gd::Platform & GetPlatform() const { return *platform; }
    ///@}
    #endif

private:

    std::string                                         name; ///< Game name
    unsigned int                                        windowWidth; ///< Window default width
    unsigned int                                        windowHeight; ///< Window default height
    int                                                 maxFPS; ///< Maximum Frame Per Seconds, -1 for unlimited
    unsigned int                                        minFPS; ///< Minimum Frame Per Seconds ( slow down game if FPS are below this number )
    bool                                                verticalSync; ///< If true, must activate vertical synchronization.
    std::vector < boost::shared_ptr<Scene> >            scenes; ///< List of all scenes
    std::vector < boost::shared_ptr<Object> >           globalObjects; ///< Global objects
    ListVariable                                        variables; ///< Initial global variables
    #if defined(GD_IDE_ONLY)
    std::string                                         author; ///< Game author name
    vector < std::string >                              extensionsUsed; ///< List of extensions used
    gd::Platform *                                      platform; ///< Pointer to the platform owning the project
    std::vector < boost::shared_ptr<ExternalEvents> >   externalEvents; ///< List of all externals events
    #endif

    /**
     * Initialize from another game. Used by copy-ctor and assign-op.
     * Don't forget to update me if members were changed !
     */
    void Init(const Game & game);
};

#endif // GAME_H
