#ifndef SCENE_H
#define SCENE_H

#include <vector>
#include <string>
#include <boost/shared_ptr.hpp>

class Game;
#include "GDL/Event.h"
#include "GDL/Object.h"
#include "GDL/ObjectGroup.h"
#include "GDL/Position.h"
#include "GDL/Layer.h"

/**
 * A scene is an important part of a game.
 * It contains and manages objects, events...
 */
class GD_API Scene
{
    public:
        Scene();
        Scene(const Scene&);
        virtual ~Scene() {};

        Scene& operator=(const Scene & rhs);

        inline string GetName() const {return name;};
        inline void SetName(string name_) {name = name_;};

        unsigned int backgroundColorR;
        unsigned int backgroundColorG;
        unsigned int backgroundColorB;
        bool standardSortMethod;
        string title; ///< Title displayed in the window

        vector < BaseEventSPtr >                events;
        vector < boost::shared_ptr<Object> >    initialObjects;
        vector < ObjectGroup >                  objectGroups;
        vector < InitialPosition >              initialObjectsPositions;
        vector < Layer >                        initialLayers;
        ListVariable                            variables;

        #if defined(GDE)
        bool wasModified;
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
 * Get a type id from an object/group name
 * @return typeId ( or 0 ).
 */
unsigned int GD_API GetTypeIdOfObject(const Game & game, const Scene & scene, std::string objectName, bool searchInGroups = true);

/**
 * Get automatisms of an object/group
 * @return vector containing names of automatisms
 */
vector < unsigned int > GD_API GetAutomatismsOfObject(const Game & game, const Scene & scene, std::string objectName, bool searchInGroups = true);


#endif // SCENE_H
