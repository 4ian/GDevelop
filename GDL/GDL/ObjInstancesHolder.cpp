#include "GDL/ObjInstancesHolder.h"
#include "GDL/ExtensionsManager.h"

ObjInstancesHolder ObjInstancesHolder::CopyAndCloneAllObjects() const
{
    ObjInstancesHolder newObjInstancesHolder;
    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();

    for (map<string, ObjList>::const_iterator it = objectsInstances.begin() ; it != objectsInstances.end(); ++it )
    {
        for (unsigned int i = 0;i<it->second.size();++i) //We need to really copy the objects
            newObjInstancesHolder.AddObject( extensionManager->CreateObject(it->second[i]) );
    }

    return newObjInstancesHolder;
}

void ObjInstancesHolder::RemoveObject(const ObjSPtr & object)
{
    for (map<string, ObjList>::iterator it = objectsInstances.begin() ; it != objectsInstances.end(); ++it )
    {
        ObjList & associatedList = it->second;
        associatedList.erase(std::remove(associatedList.begin(), associatedList.end(), object), associatedList.end());
    }
}
