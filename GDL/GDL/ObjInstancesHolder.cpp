/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
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
            newObjInstancesHolder.AddObject( boost::shared_ptr<Object>(it->second[i]->Clone()) );
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
    return objectsRawPointersInstances[name];
}

void ObjInstancesHolder::ObjectNameHasChanged(Object * object)
{
    boost::shared_ptr<Object> theObject; //We need the object to keep alive.

    //Find and erase the object from the object lists.
    for (std::map<std::string, ObjList>::iterator it = objectsInstances.begin() ; it != objectsInstances.end(); ++it )
    {
        ObjList & list = it->second;
        for (unsigned int i = 0;i<list.size();++i)
        {
            if ( list[i].get() == object )
            {
                theObject = list[i];
                list.erase(list.begin()+i);
                break;
            }
        }
    }
    //Find and erase the object from the object raw pointers lists.
    for (std::map<std::string, std::vector<Object*> >::iterator it = objectsRawPointersInstances.begin() ; it != objectsRawPointersInstances.end(); ++it )
    {
        std::vector<Object*> & associatedList = it->second;
        associatedList.erase(std::remove(associatedList.begin(), associatedList.end(), object), associatedList.end());
    }

    AddObject(theObject);
}

