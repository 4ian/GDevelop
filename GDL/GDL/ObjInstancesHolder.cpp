/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/ObjInstancesHolder.h"
#include "GDL/ExtensionsManager.h"

#include "GDL/profile.h"

ObjInstancesHolder ObjInstancesHolder::CopyAndCloneAllObjects() const
{
    ObjInstancesHolder newObjInstancesHolder;

    for (map<std::string, ObjList>::const_iterator it = objectsInstances.begin() ; it != objectsInstances.end(); ++it )
    {
        for (unsigned int i = 0;i<it->second.size();++i) //We need to really copy the objects
            newObjInstancesHolder.AddObject( it->second[i]->Clone() );
    }

    return newObjInstancesHolder;
}

void ObjInstancesHolder::Merge(ObjInstancesHolder & second)
{
    //Get the objects of the two holders
    ObjList thisList = GetAllObjects();
    ObjList secondList = second.GetAllObjects();

    //Add the objects of the second list if necessary
    for (ObjList::const_iterator it = secondList.begin();it != secondList.end();++it)
    {
    	if ( find(thisList.begin(), thisList.end(), *it) == thisList.end() )
            AddObject(*it);
    }
}

std::vector<Object*> ObjInstancesHolder::GetAllObjectsRawPointers()
{
    std::vector<Object*> objList;

    for (map<std::string, ObjList>::iterator it = objectsInstances.begin() ; it != objectsInstances.end(); ++it )
    {
        const ObjList & associatedList = it->second;
        for (unsigned int i = 0;i<associatedList.size();++i)
        {
            objList.push_back(associatedList[i].get());
        }
    }

    return objList;
}
std::vector<Object*> ObjInstancesHolder::GetObjectsRawPointers(const std::string & name)
{
    BT_PROFILE("GetObjectsRawPointers");

    std::vector<Object*> objList;

    const ObjList & associatedList = objectsInstances[name];
    for (unsigned int i = 0;i<associatedList.size();++i) //Mettre 1 à la place de size augmente les performances -> Appel conditions/actions couteux ? -> std::string à passer en const & ! -> Et les objets en oId ???
    {
        objList.push_back(associatedList[i].get());
    }

    return objList;
}
