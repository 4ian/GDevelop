#ifndef OBJINSTANCESHOLDER_H
#define OBJINSTANCESHOLDER_H

#include <string>
#include <vector>
#include <map>
#include <boost/shared_ptr.hpp>
class Object;

typedef std::vector < boost::shared_ptr<Object> > ObjList;
typedef boost::shared_ptr<Object> ObjSPtr;

/**
 * \brief Hold lists of objects classified by the name of the objects.
 *
 * \see RuntimeScene
 * \ingroup GameEngine
 */
class GD_API ObjInstancesHolder
{
public:
    ObjInstancesHolder() {};
    virtual ~ObjInstancesHolder() {};

    /**
     * Add a new object to the lists
     */
    void AddObject(const ObjSPtr & object);

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
     * Remove an object
     *
     * \attention In an event, do not directly remove an object using this function, but make its name empty instead. Example :
     * \code
     * myObject->SetName(""); //The scene will take care of deleting the object
     * scene.objectsInstances.ObjectNameHasChanged(myObject);
     * \endcode
     */
    inline void RemoveObject(const ObjSPtr & object)
    {
        for (std::map<std::string, ObjList>::iterator it = objectsInstances.begin() ; it != objectsInstances.end(); ++it )
        {
            ObjList & associatedList = it->second;
            associatedList.erase(std::remove(associatedList.begin(), associatedList.end(), object), associatedList.end());
        }
        for (std::map<std::string, std::vector<Object*> >::iterator it = objectsRawPointersInstances.begin() ; it != objectsRawPointersInstances.end(); ++it )
        {
            std::vector<Object*> & associatedList = it->second;
            associatedList.erase(std::remove(associatedList.begin(), associatedList.end(), object.get()), associatedList.end());
        }
    }

    /**
     * Remove an entire list of object of the given identifier
     */
    inline void RemoveObjects(const std::string & name)
    {
        objectsInstances[name].clear();
        objectsRawPointersInstances[name].clear();
    }

    /**
     * Call this when changing name/identifier of an object.
     */
    void ObjectNameHasChanged(Object * object);

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
        objectsRawPointersInstances.clear();
    }

protected:
private:

    std::map<std::string, ObjList > objectsInstances;
    std::map<std::string, std::vector<Object*> > objectsRawPointersInstances;
};

#endif // OBJINSTANCESHOLDER_H

