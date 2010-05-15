#include "GDL/ObjInstancesHolder.h"
#include "GDL/ExtensionsManager.h"

ObjInstancesHolder ObjInstancesHolder::CopyAndCloneAllObjects() const
{
    ObjInstancesHolder newObjInstancesHolder;

    for (map<unsigned int, ObjList>::const_iterator it = objectsInstances.begin() ; it != objectsInstances.end(); ++it )
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
