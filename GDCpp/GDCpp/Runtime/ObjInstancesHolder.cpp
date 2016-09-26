/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCpp/Runtime/ObjInstancesHolder.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/profile.h"

RuntimeObject * ObjInstancesHolder::AddObject(RuntimeObjSPtr && object)
{
    auto it = objectsInstances[object->GetName()].insert(
        objectsInstances[object->GetName()].end(),
        std::move(object));
    objectsInstancesRefs[(*it)->GetName()].push_back(
        it->get()
    );

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    if(!debugger.expired())
        debugger.lock()->OnRuntimeObjectAdded(it->get());
#endif

    return it->get();
}

RuntimeObjNonOwningPtrList ObjInstancesHolder::GetObjectsRawPointers(const gd::String & name)
{
    return objectsInstancesRefs[name];
}

void ObjInstancesHolder::ObjectNameHasChanged(const RuntimeObject * object)
{
    std::unique_ptr<RuntimeObject> theObject; //We need the object to keep alive.

    //Find and erase the object from the object lists.
    for (auto it = objectsInstances.begin() ; it != objectsInstances.end(); ++it )
    {
        RuntimeObjList & list = it->second;
        for (std::size_t i = 0;i<list.size();++i)
        {
            if ( list[i].get() == object )
            {
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
                if(!debugger.expired())
                    debugger.lock()->OnRuntimeObjectAboutToBeRemoved(list[i].get());
#endif
                theObject = std::move(list[i]);
                list.erase(list.begin()+i);
                break;
            }
        }
    }
    //Find and erase the object from the object raw pointers lists.
    for (auto it = objectsInstancesRefs.begin() ; it != objectsInstancesRefs.end(); ++it )
    {
        RuntimeObjNonOwningPtrList & associatedList = it->second;
        associatedList.erase(
            std::remove(
                associatedList.begin(),
                associatedList.end(),
                object),
            associatedList.end());
    }

    AddObject(std::move(theObject));
}

void ObjInstancesHolder::Init(const ObjInstancesHolder & other)
{
    objectsInstances.clear();
    objectsInstancesRefs.clear();

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    debugger = std::weak_ptr<BaseDebugger>(); //Do not affect the other's debugger
#endif

    for (auto it = other.objectsInstances.cbegin() ;
        it != other.objectsInstances.cend(); ++it )
    {
        for (std::size_t i = 0;i<it->second.size();++i) //We need to really copy the objects
            AddObject( std::unique_ptr<RuntimeObject>(it->second[i]->Clone()) );
    }
}

ObjInstancesHolder::ObjInstancesHolder(const ObjInstancesHolder & other)
{
    Init(other);
}

ObjInstancesHolder::~ObjInstancesHolder()
{

}

ObjInstancesHolder& ObjInstancesHolder::operator=(const ObjInstancesHolder & other)
{
    if( (this) != &other )
        Init(other);

    return *this;
}
