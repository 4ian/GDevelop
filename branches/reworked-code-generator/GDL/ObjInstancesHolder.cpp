/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/ObjInstancesHolder.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Object.h"
#include "GDL/profile.h"

void ObjInstancesHolder::AddObject(const ObjSPtr & object)
{
    objectsInstances[object->GetName()].push_back(object);
    objectsRawPointersInstances[object->GetName()].push_back(object.get());
}

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

std::vector<Object*> ObjInstancesHolder::GetObjectsRawPointers(const std::string & name)
{
    BT_PROFILE("GetObjectsRawPointers");

    return objectsRawPointersInstances[name];
}
