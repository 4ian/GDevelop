#ifndef RUNTIMECONTEXT_H
#define RUNTIMECONTEXT_H

#include <vector>
#include <string>
#include <map>
class Object;
class RuntimeScene;

/**
 * \brief Class used by events generated code to get access to various things without including "heavy" classes such as RuntimeScene.
 */
class GD_API RuntimeContext
{
public:
    RuntimeContext(RuntimeScene * scene_) : scene(scene_) {};
    virtual ~RuntimeContext() {};

    /**
     * Get a "raw pointers" list to objects with a specific name.
     * Equivalent to :
     * \code
     * scene->objectsInstances.GetObjectsRawPointers(name)
     * \endcode
     */
    std::vector<Object*> GetObjectsRawPointers(const std::string & name);

    RuntimeContext & ClearObjectListsMap();
    RuntimeContext & AddObjectListToMap(const std::string & objectName, std::vector<Object*> & list);
    std::map <std::string, std::vector<Object*> *> ReturnObjectListsMap();

    RuntimeScene * scene;

private:
    std::map <std::string, std::vector<Object*> *> temporaryMap;
};

#endif // RUNTIMECONTEXT_H

