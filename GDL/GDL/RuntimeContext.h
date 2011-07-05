#ifndef RUNTIMECONTEXT_H
#define RUNTIMECONTEXT_H

#include <vector>
#include <string>
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

    RuntimeScene * scene;
};

#endif // RUNTIMECONTEXT_H
