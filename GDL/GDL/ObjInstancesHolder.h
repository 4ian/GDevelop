#ifndef OBJINSTANCESHOLDER_H
#define OBJINSTANCESHOLDER_H

#include "GDL/Object.h"
#include <string>
#include <map>

/**
 * Hold lists of objects classified by the name of the objects
 */
class GD_API ObjInstancesHolder
{
public:
    ObjInstancesHolder() {};
    virtual ~ObjInstancesHolder() {};

    /**
     * Add a new object to the lists
     */
    inline void AddObject(ObjSPtr object)
    {
        objectsInstances[object->GetObjectIdentifier()].push_back(object);
    }

    /**
     * Add a entire list of objects with the same identifier
     */
    inline void AddListOfObjectsWithSameName(ObjList objects)
    {
        if ( objects.empty() ) return;

        ObjList & objList = objectsInstances[objects[0]->GetObjectIdentifier()];
        copy(objects.begin(), objects.end(), back_inserter(objList));
    }

    /**
     * Get all objects with the same identifier
     */
    inline ObjList GetObjects(unsigned int oId)
    {
        return objectsInstances[oId];
    }

    /**
     * Get a list of all objects
     */
    inline ObjList GetAllObjects()
    {
        ObjList objList;

        for (map<unsigned int, ObjList>::iterator it = objectsInstances.begin() ; it != objectsInstances.end(); ++it )
            copy(it->second.begin(), it->second.end(), back_inserter(objList));

        return objList;
    }

    /**
     * Remove an object
     */
    inline void RemoveObject(const ObjSPtr & object)
    {
        for (map<unsigned int, ObjList>::iterator it = objectsInstances.begin() ; it != objectsInstances.end(); ++it )
        {
            ObjList & associatedList = it->second;
            associatedList.erase(std::remove(associatedList.begin(), associatedList.end(), object), associatedList.end());
        }
    }

    /**
     * Remove an entire list of object of the given identifier
     */
    inline void RemoveObjects(unsigned int oId)
    {
        objectsInstances[oId].clear();
    }

    /**
     * Call this when changing name/identifier of an object.
     */
    inline void ObjectIdentifierHasChanged(const ObjSPtr & object)
    {
        RemoveObject(object);
        AddObject(object);
    }

    /**
     * Return an new ObjInstancesHolder containing the same
     * objects but copied
     */
    ObjInstancesHolder CopyAndCloneAllObjects() const;

    inline void Clear()
    {
        objectsInstances.clear();
    }

protected:
private:

    std::map<unsigned int, ObjList> objectsInstances;
};

#endif // OBJINSTANCESHOLDER_H
