#ifndef OBJINSTANCESHOLDER_H
#define OBJINSTANCESHOLDER_H

#include "GDL/Object.h"
#include <string>
#include <map>

#include "GDL/profile.h" //Temp profile

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
    inline void AddObject(ObjSPtr object)
    {
        //BT_PROFILE("ObjInstancesHolder::AddObject");
        objectsInstances[object->GetObjectIdentifier()].push_back(object);
    }

    /**
     * Add a entire list of objects with the same identifier
     */
    inline void AddListOfObjectsWithSameName(const ObjList & objects)
    {
        //BT_PROFILE("ObjInstancesHolder::AddListOfObjectsWithSameName");
        if ( objects.empty() ) return;

        ObjList & objList = objectsInstances[objects[0]->GetObjectIdentifier()];
        copy(objects.begin(), objects.end(), back_inserter(objList));
    }

    /**
     * Get all objects with the same identifier
     */
    inline const ObjList & GetObjects(unsigned int oId)
    {
        //BT_PROFILE("ObjInstancesHolder::GetObjects");
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
     * Get a list of all objects
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
        //BT_PROFILE("ObjInstancesHolder::RemoveObject");
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
        //BT_PROFILE("ObjInstancesHolder::RemoveObjects");
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

    std::map<unsigned int, ObjList> objectsInstances;
};

#endif // OBJINSTANCESHOLDER_H
