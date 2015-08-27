/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCpp/ObjInstancesHolder.h"
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/profile.h"

void ObjInstancesHolder::AddObject(const RuntimeObjSPtr & object)
{
    objectsInstances[object->GetName()].push_back(object);
    objectsRawPointersInstances[object->GetName()].push_back(object.get());
}

std::vector<RuntimeObject*> ObjInstancesHolder::GetObjectsRawPointers(const gd::String & name)
{
    return objectsRawPointersInstances[name];
}

void ObjInstancesHolder::ObjectNameHasChanged(RuntimeObject * object)
{
    std::shared_ptr<RuntimeObject> theObject; //We need the object to keep alive.

    //Find and erase the object from the object lists.
    for (std::unordered_map<gd::String, RuntimeObjList>::iterator it = objectsInstances.begin() ; it != objectsInstances.end(); ++it )
    {
        RuntimeObjList & list = it->second;
        for (std::size_t i = 0;i<list.size();++i)
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
    for (std::unordered_map<gd::String, std::vector<RuntimeObject*> >::iterator it = objectsRawPointersInstances.begin() ; it != objectsRawPointersInstances.end(); ++it )
    {
        std::vector<RuntimeObject*> & associatedList = it->second;
        associatedList.erase(std::remove(associatedList.begin(), associatedList.end(), object), associatedList.end());
    }

    AddObject(theObject);
}

void ObjInstancesHolder::Init(const ObjInstancesHolder & other)
{
    objectsInstances.clear();
    objectsRawPointersInstances.clear();
    for (std::unordered_map<gd::String, RuntimeObjList>::const_iterator it = other.objectsInstances.begin() ;
        it != other.objectsInstances.end(); ++it )
    {
        for (std::size_t i = 0;i<it->second.size();++i) //We need to really copy the objects
            AddObject( std::shared_ptr<RuntimeObject>(it->second[i]->Clone()) );
    }
}

ObjInstancesHolder::ObjInstancesHolder(const ObjInstancesHolder & other)
{
    Init(other);
}

ObjInstancesHolder& ObjInstancesHolder::operator=(const ObjInstancesHolder & other)
{
    if( (this) != &other )
        Init(other);

    return *this;
}
