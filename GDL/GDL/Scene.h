/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef SCENE_H
#define SCENE_H

#include <vector>
#include <map>
#include <string>
#include <boost/shared_ptr.hpp>
#include "GDL/ObjectGroup.h"
#include "GDL/Position.h"
#include "GDL/Layer.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/Layout.h"
#endif
class Object;
class Game;
class CodeExecutionEngine;
class AutomatismsSharedDatas;
class BaseProfiler;
class BaseEvent;
typedef boost::shared_ptr<BaseEvent> BaseEventSPtr;

/**
 * \brief Represents a scene.
 *
 * A scene is basically composed of events, objects and some other members.
 * RuntimeScene are
 */
class GD_API Scene
#if defined(GD_IDE_ONLY)
: public gd::Layout
#endif
{
public:
    Scene();
    Scene(const Scene&);
    virtual ~Scene();

    Scene& operator=(const Scene & rhs);

    /**
     * Return a pointer to a new Scene constructed from this one.
     */
    virtual Scene * Clone() const { return new Scene(*this); };

    /**
     * Get scene name
     */
    virtual const std::string & GetName() const {return name;};

    /**
     * Change scene name
     */
    virtual void SetName(const std::string & name_) {name = name_;};

    /**
     * Set the background color
     */
    virtual void SetBackgroundColor(unsigned int r, unsigned int g, unsigned int b) { backgroundColorR = r; backgroundColorG = g; backgroundColorB = b; }

    /**
     * Get the background color red component
     */
    virtual unsigned int GetBackgroundColorRed() const { return backgroundColorR; }

    /**
     * Get the background color green component
     */
    virtual unsigned int GetBackgroundColorGreen() const { return backgroundColorG; }

    /**
     * Get the background color blue component
     */
    virtual unsigned int GetBackgroundColorBlue() const { return backgroundColorB; }

    /**
     * Get scene window default title
     */
    virtual const std::string & GetWindowDefaultTitle() const {return title;};

    /**
     * Set scene window default title
     */
    virtual void SetWindowDefaultTitle(const std::string & title_) {title = title_;};

    #if defined(GD_IDE_ONLY) //Specialization of gd::Layout members
    virtual void OnEventsModified() { eventsModified = true; };

    /**
     * Return a reference to the list of events associated to the ExternalEvents class.
     */
    virtual const std::vector<boost::shared_ptr<BaseEvent> > & GetEvents() const { return events; }

    /**
     * Return a reference to the list of events associated to the ExternalEvents class.
     */
    virtual std::vector<boost::shared_ptr<BaseEvent> > & GetEvents() { return events; }

    /**
     * Must be called when compilation of events is over and so events are not considered "modified" anymore.
     */
    virtual void UnsetEventsModified() { eventsModified = false; };

    virtual bool EventsModified() { return eventsModified; };
    #endif

    bool standardSortMethod; ///< True to sort objects using standard sort.
    float oglFOV; ///< OpenGL Field Of View value
    float oglZNear; ///< OpenGL Near Z position
    float oglZFar; ///< OpenGL Far Z position
    bool stopSoundsOnStartup; ///< True to make the scene stop all sounds at startup.

    #if defined(GD_IDE_ONLY)
    BaseProfiler *                          profiler; ///< Pointer to the profiler. Can be NULL.
    #endif
    vector < boost::shared_ptr<Object> >    initialObjects; ///< Objects availables.
    vector < ObjectGroup >                  objectGroups; ///< Objects groups availables.
    vector < InitialPosition >              initialObjectsPositions; ///< List of all objects to be put on the scene at the beginning
    vector < Layer >                        initialLayers; ///< Initial layers
    ListVariable                            variables; ///< Variables list
    std::map < std::string, boost::shared_ptr<AutomatismsSharedDatas> > automatismsInitialSharedDatas; ///< Initial shared datas of automatisms

    mutable std::vector<std::string>        externalSourcesDependList; ///< List of source files the scene code depends on.
    boost::shared_ptr<CodeExecutionEngine>  codeExecutionEngine;

    #if defined(GD_IDE_ONLY)
    bool wasModified;

    bool grid; ///< True if grid activated in editor -- Edittime only
    bool snap; ///< True if snap to grid activated in editor -- Edittime only
    int gridWidth; ///< Grid width in editor -- Edittime only
    int gridHeight; ///< Grid height in editor -- Edittime only
    int gridR; ///< Grid red color in editor -- Edittime only
    int gridG; ///< Grid green color in editor -- Edittime only
    int gridB; ///< Grid blue color in editor -- Edittime only
    bool windowMask; ///< True if window mask displayed in editor -- Edittime only
    #endif

private:

    std::string name; ///< Scene name
    unsigned int backgroundColorR; ///< Background color Red component
    unsigned int backgroundColorG; ///< Background color Green component
    unsigned int backgroundColorB; ///< Background color Blue component
    std::string title; ///< Title displayed in the window

    #if defined(GD_IDE_ONLY)
    vector < BaseEventSPtr >                events; ///< Scene events
    bool eventsModified;
    #endif

    /**
     * Initialize from another scene. Used by copy-ctor and assign-op.
     * Don't forget to update me if members were changed !
     */
    void Init(const Scene & scene);
};

//"Tool" Functions

/**
 * Functor testing scene name
 */
struct SceneHasName : public std::binary_function<boost::shared_ptr<Scene>, std::string, bool> {
    bool operator()(const boost::shared_ptr<Scene> & scene, std::string name) const { return scene->GetName() == name; }
};

/**
 * Get a type from an object/group name
 * @return type of the object/group.
 */
std::string GD_API GetTypeOfObject(const Game & game, const Scene & scene, std::string objectName, bool searchInGroups = true);

/**
 * Get a type from an automatism name
 * @return type of the automatism.
 */
std::string GD_API GetTypeOfAutomatism(const Game & game, const Scene & scene, std::string automatismName, bool searchInGroups = true);

/**
 * Get automatisms of an object/group
 * @return vector containing names of automatisms
 */
vector < std::string > GD_API GetAutomatismsOfObject(const Game & game, const Scene & scene, std::string objectName, bool searchInGroups = true);


#endif // SCENE_H
