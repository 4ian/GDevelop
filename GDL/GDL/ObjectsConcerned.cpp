#include "GDL/ObjectsConcerned.h"
#include "GDL/Object.h"
#include <boost/shared_ptr.hpp>
#include "GDL/ObjectGroup.h"
#include "GDL/ObjectType.h"
#include "GDL/profile.h"

ObjectsConcerned::ObjectsConcerned(ObjList * allObjects_, vector < ObjectGroup > * allGroups_ ) :
allObjects(allObjects_),
allGroups(allGroups_)
{
    //ctor
    objectsPicked.reserve(50); //Reserve some space
}


////////////////////////////////////////////////////////////
/// Prendre les objets ayant le nom voulu ou appartenant au groupe ayant ce nom
////////////////////////////////////////////////////////////
ObjList ObjectsConcerned::Pick(string name, bool forceGlobal)
{
    BT_PROFILE("Pick");
    ObjList objectsToTest;

    vector < ObjectGroup >::iterator groupsIter = allGroups->begin();
    vector < ObjectGroup >::const_iterator groupsEnd = allGroups->end();
    for (;groupsIter!=groupsEnd;++groupsIter)
    {
        //Si le groupe a le nom voulu, on va prendre en compte ses objets
        if ( (*groupsIter).GetName() == name )
        {
            bool containObjectAlreadyC = (*groupsIter).HasAnIdenticalValue(alreadyConcernedObjects);

            for (unsigned int j = 0;j < (*groupsIter).Getobjets().size();++j)
            {
                ObjList listObjects = PickOnlyObjects((*groupsIter).Getobjets()[j], containObjectAlreadyC, forceGlobal, false);
                copy(listObjects.begin(), listObjects.end(), back_inserter(objectsToTest));
            }
        }
    }

    ObjList listObjects = PickOnlyObjects(name, false, forceGlobal, false);
    copy(listObjects.begin(), listObjects.end(), back_inserter(objectsToTest));

    return objectsToTest;
}

////////////////////////////////////////////////////////////
/// Prendre les objets ayant le nom voulu ou appartenant au groupe ayant ce nom
/// mais en les supprimant des objectsPicked
////////////////////////////////////////////////////////////
ObjList ObjectsConcerned::PickAndRemove(string name, bool forceGlobal)
{
    BT_PROFILE("PickAndRemove");
    ObjList objectsToTest;

    vector < ObjectGroup >::iterator groupsIter = allGroups->begin();
    vector < ObjectGroup >::const_iterator groupsEnd = allGroups->end();
    for (;groupsIter!=groupsEnd;++groupsIter)
    {
        //Si le groupe a le nom voulu, on va prendre en compte ses objets
        if ( (*groupsIter).GetName() == name )
        {
            bool containObjectAlreadyC = (*groupsIter).HasAnIdenticalValue(alreadyConcernedObjects);

            for (unsigned int j = 0;j < (*groupsIter).Getobjets().size();++j)
            {
                ObjList listObjects = PickOnlyObjects((*groupsIter).Getobjets()[j], containObjectAlreadyC, forceGlobal, true);
                copy(listObjects.begin(), listObjects.end(), back_inserter(objectsToTest));
            }
        }
    }

    ObjList listObjects = PickOnlyObjects(name, false, forceGlobal, true);
    copy(listObjects.begin(), listObjects.end(), back_inserter(objectsToTest));

    return objectsToTest;
}

////////////////////////////////////////////////////////////
/// Prendre les objets ayant le nom voulu, sans tenir compte des groupes
////////////////////////////////////////////////////////////
ObjList ObjectsConcerned::PickOnlyObjects(string name, bool onlyAlreadyConcerned, bool forceGlobal, bool removeFromAlreadyConcernedObjects)
{
    ObjList objectsToTest;

    //L'objet a il déjà été selectionné auparavant ?
    if (( onlyAlreadyConcerned || find(alreadyConcernedObjects.begin(),
                                        alreadyConcernedObjects.end(),
                                        name) != alreadyConcernedObjects.end() )
        && !forceGlobal )
    {
        //Rechercher dans les objets déjà concernés
        ObjList::iterator objIter = objectsPicked.begin();
        ObjList::const_iterator objEnd = objectsPicked.end();
        for (;objIter != objEnd;++objIter)
        {
        	if ( (*objIter)->GetName() == name )
        	    objectsToTest.push_back(*objIter); //Ajout aux objets à tester
        }

        if  ( removeFromAlreadyConcernedObjects ) //Ajout aux objets pour les futures instructions
        {
            objectsPicked.erase(std::remove_if(objectsPicked.begin(), objectsPicked.end(),
                                                std::bind2nd(ObjectHasName(), name))
                                , objectsPicked.end());
        }
    }
    else
    {
        //Rechercher dans tous les objets
        ObjList::iterator objIter = allObjects->begin();
        ObjList::const_iterator objEnd = allObjects->end();
        for (;objIter!=objEnd;++objIter)
        {
        	if ( (*objIter)->GetName() == name )
        	{
        	    objectsToTest.push_back(*objIter); //Ajout aux objets à tester

                if  ( !removeFromAlreadyConcernedObjects )
                    objectsPicked.push_back(*objIter); //Ajout aux objets pour les futures instructions
        	}
        }
    }

    alreadyConcernedObjects.insert(name);

    return objectsToTest;
}

ObjectsConcerned::~ObjectsConcerned()
{
    //dtor
}
