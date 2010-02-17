#ifndef SCENE_H
#define SCENE_H

#include <vector>
#include <string>
#include <boost/shared_ptr.hpp>

class Game;
#include "GDL/Event.h"
#include "GDL/Object.h"
#include "GDL/ObjectGroup.h"
class InitialPosition;
#include "GDL/Layer.h"

class GD_API Scene
{
    public:
        Scene();
        Scene(const Scene&);
        virtual ~Scene();

        Scene& operator=(const Scene & rhs);

        string name;

        unsigned int backgroundColorR;
        unsigned int backgroundColorG;
        unsigned int backgroundColorB;
        bool standardSortMethod;
        string title; //Titre affiché par la fenêtre

        vector < Event >                        events;
        vector < boost::shared_ptr<Object> >    initialObjects;
        vector < ObjectGroup >                  objectGroups;
        vector < InitialPosition >              initialObjectsPositions;
        vector < Layer >                        initialLayers;
        ListVariable                            variables;

    protected:
    private:
};

//"Tool" Functions

/**
 * Get a type if from an object/group name
 * @return typeId ( or 0 ).
 */
unsigned int GD_API GetTypeIdOfObject(const Game & game, const Scene & scene, std::string objectName, bool searchInGroups = true);

#endif // SCENE_H
