#include "RuntimeContext.h"
#include "GDL/RuntimeScene.h"
#include <vector>

std::vector<Object*> RuntimeContext::GetObjectsRawPointers(const std::string & name)
{
    return scene->objectsInstances.GetObjectsRawPointers(name);
}
