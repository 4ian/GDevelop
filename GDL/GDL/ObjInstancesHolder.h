#ifndef OBJINSTANCESHOLDER_H
#define OBJINSTANCESHOLDER_H

#include "GDL/Object.h"
#include <string>
#include <map>

/**
 * \brief Hold lists of objects classified by the name of the objects.
 */
class GD_API ObjInstancesHolder
{
public:
    ObjInstancesHolder() {};
    virtual ~ObjInstancesHolder() {};

    /**
     * Add a new object to the lists
     */
    inline void AddObject(const ObjSPtr & object)
    {
        objectsInstances[object->GetName()].push_back(object);
    }

    /**
     * Get all objects with a specific name
     */
    inline const ObjList & GetObjects(const std::string & name)
    {
        return objectsInstances[name];
    }
    /**
     * Get a "raw pointers" list to objects with a specific name
     */
    std::vector<Object*> GetObjectsRawPointers(const std::string & name);

    /**
     * Get a list of all objects
     */
    inline ObjList GetAllObjects()
    {
        ObjList objList;

        for (std::map<std::string, ObjList>::iterator it = objectsInstances.begin() ; it != objectsInstances.end(); ++it )
            copy(it->second.begin(), it->second.end(), back_inserter(objList));

        return objList;
    }

    /**
     * Get a "raw pointers" list to all objects
     */
    std::vector<Object*> GetAllObjectsRawPointers();

    /**
     * Remove an object
     *
     * \attention In an event, do not directly remove an object using this function, but make its name empty instead. Example :
     * \code
     * scene.objectsInstances.ObjectIdentifierHasChanged(myObject); //Keep the object in objectsInstances from scene, but notify its identifier has changed.
     * objectsConcerned.AnObjectWasDeleted(myObject); //Remove object from objectsConcerned.
     * \endcode
     */
    inline void RemoveObject(const ObjSPtr & object)
    {
        for (std::map<std::string, ObjList>::iterator it = objectsInstances.begin() ; it != objectsInstances.end(); ++it )
        {
            ObjList & associatedList = it->second;
            associatedList.erase(std::remove(associatedList.begin(), associatedList.end(), object), associatedList.end());
        }
    }

    /**
     * Remove an entire list of object of the given identifier
     */
    inline void RemoveObjects(const std::string & name)
    {
        objectsInstances[name].clear();
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
     * objects but copied.
     */
    ObjInstancesHolder CopyAndCloneAllObjects() const;

    /**
     * Merge this ObjInstancesHolder with the objects of another.
     */
    void Merge(ObjInstancesHolder & second);

    /**
     * Clear the container.
     */
    inline void Clear()
    {
        objectsInstances.clear();
    }

protected:
private:

    std::map<std::string, ObjList> objectsInstances;
};

#endif // OBJINSTANCESHOLDER_H
