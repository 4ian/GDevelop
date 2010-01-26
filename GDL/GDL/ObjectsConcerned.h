/**
 * Game Develop
 *    Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  Système de sélection d'objets suivant un nom donné.
 *  Prend en compte les groupes qui regroupent des objets.
 */

#ifndef OBJECTSCONCERNED_H
#define OBJECTSCONCERNED_H

#include "GDL/Object.h"
#include "GDL/ObjectGroup.h"
#include "GDL/ObjectType.h"
#include "GDL/ObjInstancesHolder.h"
#include <boost/shared_ptr.hpp>
#include <string>
#include <vector>

typedef vector < boost::shared_ptr<Object> > ObjList;
typedef boost::shared_ptr<Object> ObjSPtr;

using namespace std;

class GD_API ObjectsConcerned
{
    public:

        ObjectsConcerned(ObjInstancesHolder * allObjects_, vector < ObjectGroup > * allGroups_ );
        virtual ~ObjectsConcerned();

        /**
        * Search objects matching the name and add them to
        * the picked objects list.
        *
        * @param Name
        * @param Force searching in all objects
        * @return A list of objects matching the name
        */
        ObjList Pick(string name, bool forceGlobal = false);

        /**
        * Search objects matching the name and remove them to
        * the picked objects list. ( They will usually be reinsert
        * by conditions if they match this latters )
        *
        * @param Name
        * @param Force searching in all objects
        * @return A list of objects matching the name
        */
        ObjList PickAndRemove(string name, bool forceGlobal = false);

        /**
        * Add an object to the list of already concerned
        * objects.
        *
        * @param Name of the object concerned
        */
        inline void AddAnObjectConcerned(string name)
        {
            alreadyConcernedObjects.insert((name));
        };

        /** Objects already picked */
        ObjInstancesHolder objectsPicked;

    protected:
    private:

        /** Reference to all objects list */
        ObjInstancesHolder * allObjects;

        /** Reference to groups */
        vector < ObjectGroup > * allGroups;

        /** A set containing name of objects already picked.
        If an object is not in this list, pickers functions will
        use all objects List. If an object is in the list, they will
        use already picked list*/
        set < string > alreadyConcernedObjects;

        /**
        * Pick only object. Called by generals picking functions.
        *
        * @param Name
        * @param Force searching in picked objects list
        * @param Force searching in all objects
        * @param Remove picked objects from picked list. See PickAndRemove
        * @return A list of objects matching the name
        */
        ObjList PickOnlyObjects(string name, bool onlyAlreadyConcernedObjects, bool forceGlobal, bool removeFromAlreadyConcernedObjects);
};

#endif // OBJECTSCONCERNED_H
