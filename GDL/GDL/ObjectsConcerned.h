/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef OBJECTSCONCERNED_H
#define OBJECTSCONCERNED_H

#include "GDL/Object.h"
#include "GDL/ObjectGroup.h"
#include "GDL/ObjInstancesHolder.h"
#include <boost/shared_ptr.hpp>
#include <boost/interprocess/containers/flat_set.hpp>
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
        virtual ~ObjectsConcerned() {};

        /**
         * Make the ObjectsConcerned inherits from another :
         * Useful for example so as to notify parent events an object have been destroyed.
         */
        inline void InheritsFrom(ObjectsConcerned * parent_)
        {
            *this = *parent_;
            parent = parent_;
        }

        /**
        * Search objects matching the identifier and add them to
        * the picked objects list.
        *
        * @param oID Identifier of the objects to pick
        * @param forceGlobal Force searching in all objects
        * @return A list of objects having the requested identifier
        */
        ObjList Pick(unsigned int oID, bool forceGlobal = false);

        /**
        * Search objects matching the identifier and remove them to
        * the picked objects list. ( They will usually be reinsert
        * by conditions if they match this latters )
        *
        * @param oID Identifier of the objects to pick
        * @param forceGlobal Force searching in all objects
        * @return A list of objects having the requested identifier
        */
        ObjList PickAndRemove(unsigned int oID, bool forceGlobal = false);

        /**
        * Add an object to the list of already concerned
        * objects.
        *
        * @param oID Identifier of the objects to pick
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
         * Return a (boost flat_)set with the identifier of the objects already concerned.
         * Used by Merge function.
         */
        inline boost::interprocess::flat_set < unsigned int > & GetAlreadyConcernedObjects()
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

        /**
         * Reset all objects picked and already concerned objets.
         */
        inline void Reset()
        {
            objectsPicked.Clear();
            alreadyConcernedObjects.clear();
        }

        ObjInstancesHolder objectsPicked; ///< Objects already picked

        ObjInstancesHolder * allObjects; ///< Reference to all objects list
        vector < ObjectGroup > * allGroups; ///< Reference to groups

        /** A set containing identifers of objects already picked.
        If an object is not in this list, pickers functions will
        use all objects List. If an object is in the list, they will
        use already picked list*/
        boost::interprocess::flat_set < unsigned int > alreadyConcernedObjects;

        /**
        * Pick only object. Called by generals picking functions.
        *
        * @param oID Identifier of the objects to pick
        * @param onlyAlreadyConcernedObjects Force searching in picked objects list
        * @param forceGlobal Force searching in all objects
        * @param removeFromAlreadyConcernedObjects Remove picked objects from picked list. See PickAndRemove
        * @return A list of objects matching the identifier
        */
        ObjList PickOnlyObjects(unsigned int oID, bool onlyAlreadyConcernedObjects, bool forceGlobal, bool removeFromAlreadyConcernedObjects);

        ObjectsConcerned * parent; ///< Keep a reference of the parent, so as to notify it about an object suppression. Can be NULL.
};

#endif // OBJECTSCONCERNED_H
