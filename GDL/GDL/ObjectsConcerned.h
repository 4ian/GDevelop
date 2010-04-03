/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
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

/**
 * Class used to pick objects from all objects of the scene, or from
 * already picked objects.
 */
class GD_API ObjectsConcerned
{
    public:

        ObjectsConcerned(ObjInstancesHolder * allObjects_, vector < ObjectGroup > * allGroups_ );

        /**
         * Using this constructor implies to call InheritsFrom after.
         */
        ObjectsConcerned() : allObjects(NULL), allGroups(NULL), parent(NULL) {};
        virtual ~ObjectsConcerned();

        /**
         * Make the ObjectsConcerned inherits from another.
         */
        inline void InheritsFrom(ObjectsConcerned * parent_)
        {
            *this = *parent_;
            parent = parent_;
        }

        /**
        * Search objects matching the name and add them to
        * the picked objects list.
        *
        * @param Name
        * @param Force searching in all objects
        * @return A list of objects matching the name
        */
        ObjList Pick(unsigned int oID, bool forceGlobal = false);

        /**
        * Search objects matching the name and remove them to
        * the picked objects list. ( They will usually be reinsert
        * by conditions if they match this latters )
        *
        * @param Name
        * @param Force searching in all objects
        * @return A list of objects matching the name
        */
        ObjList PickAndRemove(unsigned int oID, bool forceGlobal = false);

        /**
        * Add an object to the list of already concerned
        * objects.
        *
        * @param Name of the object concerned
        */
        inline void AddAnObjectConcerned(unsigned int oID)
        {
            alreadyConcernedObjects.insert(oID);
        };

        /**
         * Remove an object which was deleted
         * from objects picked, and from parent's objects picked also.
         */
        inline void AnObjectWasDeleted(ObjSPtr object)
        {
            objectsPicked.RemoveObject(object);
            if ( parent != NULL ) parent->AnObjectWasDeleted(object);
        }

        /**
         * Return a set with the identifier of the objects already concerned.
         * Used by Merge function.
         */
        inline set < unsigned int > & GetAlreadyConcernedObjects()
        {
            return alreadyConcernedObjects;
        }

        /**
         * Merge with another ObjectsConcerned class :
         * Merge objectsPicked and objectsAlreadyConcerned.
         */
        inline void Merge(ObjectsConcerned & second)
        {
            objectsPicked.Merge(second.objectsPicked);
            copy(second.GetAlreadyConcernedObjects().begin(), second.GetAlreadyConcernedObjects().end(), std::inserter(alreadyConcernedObjects, alreadyConcernedObjects.begin()));
        }

        /** Objects already picked */
        ObjInstancesHolder objectsPicked;

    protected:
    private:

        /** Reference to all objects list */
        ObjInstancesHolder * allObjects;

        /** Reference to groups */
        vector < ObjectGroup > * allGroups;

        /** A set containing identifers of objects already picked.
        If an object is not in this list, pickers functions will
        use all objects List. If an object is in the list, they will
        use already picked list*/
        set < unsigned int > alreadyConcernedObjects;

        /**
        * Pick only object. Called by generals picking functions.
        *
        * @param Name
        * @param Force searching in picked objects list
        * @param Force searching in all objects
        * @param Remove picked objects from picked list. See PickAndRemove
        * @return A list of objects matching the name
        */
        ObjList PickOnlyObjects(unsigned int oID, bool onlyAlreadyConcernedObjects, bool forceGlobal, bool removeFromAlreadyConcernedObjects);

        ObjectsConcerned * parent;
};

#endif // OBJECTSCONCERNED_H
