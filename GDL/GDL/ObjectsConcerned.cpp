#include "GDL/ObjectsConcerned.h"
#include "GDL/Object.h"
#include <boost/shared_ptr.hpp>
#include "GDL/ObjectGroup.h"
#include "GDL/ObjectType.h"
#include "GDL/profile.h"

ObjectsConcerned::ObjectsConcerned(ObjInstancesHolder * allObjects_, vector < ObjectGroup > * allGroups_ ) :
allObjects(allObjects_),
allGroups(allGroups_),
parent(NULL)
{
    //ctor
}


////////////////////////////////////////////////////////////
/// Prendre les objets ayant le nom voulu ou appartenant au groupe ayant ce nom
////////////////////////////////////////////////////////////
ObjList ObjectsConcerned::Pick(unsigned int oID, bool forceGlobal)
{
    //BT_PROFILE("Pick");
    ObjList objectsToTest;

    vector < ObjectGroup >::iterator groupsIter = allGroups->begin();
    vector < ObjectGroup >::const_iterator groupsEnd = allGroups->end();
    for (;groupsIter!=groupsEnd;++groupsIter)
    {
        //Si le groupe a le nom voulu, on va prendre en compte ses objets
        if ( (*groupsIter).GetIdentifier() == oID )
        {
            bool containObjectAlreadyC = (*groupsIter).HasAnIdenticalValue(alreadyConcernedObjects);

            for (unsigned int j = 0;j < (*groupsIter).GetAllObjectsWithOID().size();++j)
            {
                ObjList listObjects = PickOnlyObjects((*groupsIter).GetAllObjectsWithOID()[j].second, containObjectAlreadyC, forceGlobal, false);
                copy(listObjects.begin(), listObjects.end(), back_inserter(objectsToTest));
            }
        }
    }

    ObjList listObjects = PickOnlyObjects(oID, false, forceGlobal, false);
    copy(listObjects.begin(), listObjects.end(), back_inserter(objectsToTest));

    return objectsToTest;
}

////////////////////////////////////////////////////////////
/// Prendre les objets ayant le nom voulu ou appartenant au groupe ayant ce nom
/// mais en les supprimant des objectsPicked
////////////////////////////////////////////////////////////
ObjList ObjectsConcerned::PickAndRemove(unsigned int oID, bool forceGlobal)
{
    //BT_PROFILE("PickAndRemove");
    ObjList objectsToTest;

    vector < ObjectGroup >::iterator groupsIter = allGroups->begin();
    vector < ObjectGroup >::const_iterator groupsEnd = allGroups->end();
    for (;groupsIter!=groupsEnd;++groupsIter)
    {
        //Si le groupe a le nom voulu, on va prendre en compte ses objets
        if ( (*groupsIter).GetIdentifier() == oID )
        {
            bool containObjectAlreadyC = (*groupsIter).HasAnIdenticalValue(alreadyConcernedObjects);

            for (unsigned int j = 0;j < (*groupsIter).GetAllObjectsWithOID().size();++j)
            {
                ObjList listObjects = PickOnlyObjects((*groupsIter).GetAllObjectsWithOID()[j].second, containObjectAlreadyC, forceGlobal, true);
                copy(listObjects.begin(), listObjects.end(), back_inserter(objectsToTest));
            }
        }
    }

    ObjList listObjects = PickOnlyObjects(oID, false, forceGlobal, true);
    copy(listObjects.begin(), listObjects.end(), back_inserter(objectsToTest));

    return objectsToTest;
}

////////////////////////////////////////////////////////////
/// Prendre les objets ayant le nom voulu, sans tenir compte des groupes
////////////////////////////////////////////////////////////
ObjList ObjectsConcerned::PickOnlyObjects(unsigned int oId, bool onlyAlreadyConcerned, bool forceGlobal, bool removeFromAlreadyConcernedObjects)
{
    ObjList objectsToTest;

    //L'objet a il déjà été selectionné auparavant ?
    if (( onlyAlreadyConcerned || find(alreadyConcernedObjects.begin(),
                                        alreadyConcernedObjects.end(),
                                        oId) != alreadyConcernedObjects.end() )
        && !forceGlobal )
    {
        objectsToTest = objectsPicked.GetObjects(oId);

        if  ( removeFromAlreadyConcernedObjects ) objectsPicked.RemoveObjects(oId);
    }
    else
    {
        objectsToTest = allObjects->GetObjects(oId);

        if  ( !removeFromAlreadyConcernedObjects )
			objectsPicked.AddListOfObjectsWithSameName(objectsToTest);
    }

    alreadyConcernedObjects.insert(oId);

    return objectsToTest;
}

ObjectsConcerned::~ObjectsConcerned()
{
    //dtor
}
