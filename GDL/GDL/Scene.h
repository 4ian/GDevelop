/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef SCENE_H
#define SCENE_H

#include "GDL/Event.h" //This include must be placed first
#include <vector>
#include <map>
#include <string>
#include <boost/shared_ptr.hpp>

class Game;
#include "GDL/Object.h"
#include "GDL/ObjectGroup.h"
#include "GDL/Position.h"
#include "GDL/Layer.h"
class EventsExecutionEngine;
class AutomatismsSharedDatas;

/**
 * \brief Represents a scene.
 *
 * A scene is basically composed of events, objects and some other members.
 * RuntimeScene are
 */
class GD_API Scene
{
    public:
        Scene();
        Scene(const Scene&);
        virtual ~Scene();

        Scene& operator=(const Scene & rhs);

        /**
         * Get scene name
         */
        inline string GetName() const {return name;};

        /**
         * Change scene name
         */
        inline void SetName(string name_) {name = name_;};

        unsigned int backgroundColorR; ///< Background color Red component
        unsigned int backgroundColorG; ///< Background color Green component
        unsigned int backgroundColorB; ///< Background color Blue component
        bool standardSortMethod; ///< True to sort objects using standard sort.
        string title; ///< Title displayed in the window
        float oglFOV; ///< OpenGL Field Of View value
        float oglZNear; ///< OpenGL Near Z position
        float oglZFar; ///< OpenGL Far Z position
        bool stopSoundsOnStartup; ///< True to make the scene stop all sounds at startup.

        vector < BaseEventSPtr >                events; ///< Scene events
        vector < boost::shared_ptr<Object> >    initialObjects; ///< Objects availables.
        vector < ObjectGroup >                  objectGroups; ///< Objects groups availables.
        vector < InitialPosition >              initialObjectsPositions; ///< List of all objects to be put on the scene at the beginning
        vector < Layer >                        initialLayers; ///< Initial layers
        ListVariable                            variables; ///< Variables list
        std::map < std::string, boost::shared_ptr<AutomatismsSharedDatas> > automatismsInitialSharedDatas; ///< Initial shared datas of automatisms

        boost::shared_ptr<EventsExecutionEngine> compiledEventsExecutionEngine;
        #if defined(GD_IDE_ONLY)
        bool wasModified;
        bool eventsModified;
        bool eventsBeingCompiled;

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
        string name;

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
struct SceneHasName : public std::binary_function<boost::shared_ptr<Scene>, string, bool> {
    bool operator()(const boost::shared_ptr<Scene> & scene, string name) const { return scene->GetName() == name; }
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
