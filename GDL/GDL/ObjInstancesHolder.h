#ifndef OBJINSTANCESHOLDER_H
#define OBJINSTANCESHOLDER_H

#include "GDL/Object.h"
#include <string>
#include <map>

/**
 * Hold lists of objects classified by the name of the objects
 */
class ObjInstancesHolder
{
public:
    ObjInstancesHolder() {};
    virtual ~ObjInstancesHolder() {};

    /**
     * Add a new object to the lists
     */
    inline void AddObject(ObjSPtr object)
    {
        objectsInstances[object->GetName()].push_back(object);
    }

    /**
     * Add a entire list of objects with the same name
     */
    inline void AddListOfObjectsWithSameName(ObjList objects)
    {
        if ( objects.empty() ) return;

        ObjList & objList = objectsInstances[objects[0]->GetName()];
        copy(objects.begin(), objects.end(), back_inserter(objList));
    }

    /**
     * Get all objects of the corresponding name
     */
    inline ObjList GetObjects(std::string name)
    {
        return objectsInstances[name];
    }

    /**
     * Get a list of all objects
     */
    inline ObjList GetAllObjects()
    {
        ObjList objList;

        for (map<string, ObjList>::iterator it = objectsInstances.begin() ; it != objectsInstances.end(); ++it )
            copy(it->second.begin(), it->second.end(), back_inserter(objList));

        return objList;
    }

    /**
     * Remove an object
     */
    void RemoveObject(const ObjSPtr & object);

    /**
     * Remove an entire list of object of the given name
     */
    inline void RemoveObjects(std::string name)
    {
        objectsInstances[name].clear();
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

    std::map<std::string, ObjList> objectsInstances;
};

#endif // OBJINSTANCESHOLDER_H
