#ifndef OBJINSTANCESHOLDER_H
#define OBJINSTANCESHOLDER_H

#include <algorithm>
#include <string>
#include <vector>
#include <map>
#include <memory>
#include <unordered_map>
#include "GDCpp/Runtime/String.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "GDCpp/IDE/BaseDebugger.h"
#endif

class RuntimeObject;

using RuntimeObjList = std::vector<std::unique_ptr<RuntimeObject>>;
using RuntimeObjNonOwningPtrList = std::vector<RuntimeObject*>;

using RuntimeObjSPtr = std::unique_ptr<RuntimeObject>;

/**
 * \brief Contains lists of objects classified by the name of the objects.
 *
 * \see RuntimeScene
 * \ingroup GameEngine
 */
class GD_API ObjInstancesHolder
{
public:
    /**
     * \brief Default constructor
     */
    ObjInstancesHolder() {};

    /**
     * \brief Copy constructor
     * \note All objects contained inside the container copied are also copied.
     * The new container is fully independent from the original one.
     */
    ObjInstancesHolder(const ObjInstancesHolder & other);

    ~ObjInstancesHolder();

    /**
     * \brief Assignment operator
     * \note All objects contained inside the container copied are also copied.
     * The new container is fully independent from the original one.
     */
    ObjInstancesHolder & operator=(const ObjInstancesHolder & other);

    /**
     * \brief Add a new object to the lists.
     * \note The object is then hold in the container and you can
     * forget the shared pointer to it.
     */
    RuntimeObject * AddObject(RuntimeObjSPtr && object);

    /**
     * \brief Get all objects with the specified name
     */
    inline const RuntimeObjList & GetObjects(const gd::String & name)
    {
        return objectsInstances[name];
    }

    /**
     * \brief Get a "raw pointers" list to objects with the specified name
     */
    RuntimeObjNonOwningPtrList GetObjectsRawPointers(const gd::String & name);

    /**
     * \brief Get a list of all objects contained.
     */
    inline RuntimeObjNonOwningPtrList GetAllObjects()
    {
        RuntimeObjNonOwningPtrList objList;

        for (auto it = objectsInstances.begin() ; it != objectsInstances.end(); ++it )
        {
            for (auto it2 = it->second.begin(); it2 != it->second.end(); ++it2)
            {
                objList.push_back(it2->get());
            }
        }

        return objList;
    }

    /**
     * \brief Remove an object
     *
     * \warning During the game, do not directly remove an object using this function, but make its name empty instead. Example:
     * \code
     * myObject->SetName(""); //The scene will take care of deleting the object
     * scene.objectsInstances.ObjectNameHasChanged(myObject);
     * \endcode
     */
    inline void RemoveObject(RuntimeObject * object)
    {
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
        if(!debugger.expired())
            debugger.lock()->OnRuntimeObjectAboutToBeRemoved(object);
#endif

        for (auto it = objectsInstances.begin() ; it != objectsInstances.end(); ++it )
        {
            RuntimeObjList & associatedList = it->second;
            associatedList.erase(
                std::remove_if(
                    associatedList.begin(),
                    associatedList.end(),
                    [&object](const std::unique_ptr<RuntimeObject> & objectPtr) { return objectPtr.get() == object; }),
                associatedList.end());
        }
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
    }

    /**
     * \brief Remove an entire list of object with a given name
     */
    inline void RemoveObjects(const gd::String & name)
    {
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
        if(!debugger.expired())
        {
            for(auto & objectPtr : objectsInstances[name])
                debugger.lock()->OnRuntimeObjectAboutToBeRemoved(objectPtr.get());
        }
#endif
        objectsInstances[name].clear();
        objectsInstancesRefs[name].clear();
    }

    /**
     * \brief To be called when an object has changed its name.
     */
    void ObjectNameHasChanged(const RuntimeObject * object);

    /**
     * \brief Clear the container.
     * \note All objects contained inside are destroyed.
     */
    inline void Clear()
    {
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
        if(!debugger.expired())
            debugger.lock()->OnRuntimeObjectListFullRefresh();
#endif
        objectsInstances.clear();
        objectsInstancesRefs.clear();
    }

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    void SetDebugger(std::shared_ptr<BaseDebugger> newDebugger) { debugger = newDebugger; if(newDebugger) newDebugger->OnRuntimeObjectListFullRefresh(); }
#endif

private:
    void Init(const ObjInstancesHolder & other);

    std::unordered_map<gd::String, RuntimeObjList > objectsInstances; ///< The list of all objects, classified by name
    std::unordered_map<gd::String, RuntimeObjNonOwningPtrList > objectsInstancesRefs; ///< Clones of the objectsInstances lists, but with references instead.

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    std::weak_ptr<BaseDebugger> debugger;
#endif
};

#endif // OBJINSTANCESHOLDER_H
