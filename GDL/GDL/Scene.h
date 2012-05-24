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
#include "GDL/InitialInstancesContainer.h"
#include "GDL/Layer.h"
class Object;
class Game;
class CodeExecutionEngine;
class AutomatismsSharedDatas;
class BaseProfiler;
class TiXmlElement;
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/Layout.h"
namespace gd { class BaseEvent; }
namespace gd { typedef boost::shared_ptr<BaseEvent> BaseEventSPtr; }
#endif

#undef GetObject //Disable an annoying macro

/**
 * \brief Represents a layout of the Game Develop C++ Platform
 *
 * During runtime ( i.e. When the game is being played ), Scene is loaded into a RuntimeScene.
 *
 * \see RuntimeScene
 * \ingroup PlatformDefinition
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

    /**
     * Return a reference to the vector containing the (smart) pointers to the objects.
     */
    inline const std::vector < boost::shared_ptr<Object> > & GetInitialObjects() const { return initialObjects; }

    /**
     * Return a reference to the vector containing the (smart) pointers to the objects.
     */
    inline std::vector < boost::shared_ptr<Object> > & GetInitialObjects() { return initialObjects; }

    /**
     * Provide access to the ListVariable member containing the layout variables
     */
    inline const ListVariable & GetVariables() const { return variables; }

    /**
     * Provide access to the ListVariable member containing the layout variables
     */
    inline ListVariable & GetVariables() { return variables; }

    /**
     * Return the container storing initial instances.
     */
    virtual const InitialInstancesContainer & GetInitialInstances() const { return initialInstances; }

    /**
     * Return the container storing initial instances.
     */
    virtual InitialInstancesContainer & GetInitialInstances() { return initialInstances; }

    virtual void LoadFromXml(const TiXmlElement * element);

    #if defined(GD_IDE_ONLY)
    /** \name Specialization of gd::Layout members
     * See gd::Layout documentation for more information about what these members functions should do.
     */
    ///@{
    virtual const std::vector<boost::shared_ptr<gd::BaseEvent> > & GetEvents() const { return events; }
    virtual std::vector<boost::shared_ptr<gd::BaseEvent> > & GetEvents() { return events; }

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

    virtual void OnEventsModified() { eventsModified = true; };
    ///@}

    /**
     * Must be called when compilation of events is over and so events are not considered "modified" anymore.
     */
    virtual void UnsetEventsModified() { eventsModified = false; };

    virtual bool EventsModified() { return eventsModified; };

    virtual void SaveToXml(TiXmlElement * element) const;
    #endif

    bool standardSortMethod; ///< True to sort objects using standard sort.
    float oglFOV; ///< OpenGL Field Of View value
    float oglZNear; ///< OpenGL Near Z position
    float oglZFar; ///< OpenGL Far Z position
    bool stopSoundsOnStartup; ///< True to make the scene stop all sounds at startup.

    #if defined(GD_IDE_ONLY)
    BaseProfiler *                          profiler; ///< Pointer to the profiler. Can be NULL.
    #endif
    vector < Layer >                        initialLayers; ///< Initial layers
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

    std::string                             name; ///< Scene name
    unsigned int                            backgroundColorR; ///< Background color Red component
    unsigned int                            backgroundColorG; ///< Background color Green component
    unsigned int                            backgroundColorB; ///< Background color Blue component
    std::string                             title; ///< Title displayed in the window
    vector < boost::shared_ptr<Object> >    initialObjects; ///< Objects available.
    ListVariable                            variables; ///< Variables list
    InitialInstancesContainer               initialInstances; ///< Initial instances

    #if defined(GD_IDE_ONLY)
    vector < gd::BaseEventSPtr >            events; ///< Scene events
    bool                                    eventsModified;
    #endif

    /**
     * Initialize from another scene. Used by copy-ctor and assign-op.
     * Don't forget to update me if members were changed !
     */
    void Init(const Scene & scene);
};

//"Tool" Functions

/**
 * \brief Functor testing scene name
 * \see Scene
 */
struct SceneHasName : public std::binary_function<boost::shared_ptr<Scene>, std::string, bool> {
    bool operator()(const boost::shared_ptr<Scene> & scene, std::string name) const { return scene->GetName() == name; }
};

#endif // SCENE_H
