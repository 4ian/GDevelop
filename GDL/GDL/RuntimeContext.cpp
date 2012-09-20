#include "RuntimeContext.h"
#include "GDL/RuntimeScene.h"
#include <vector>

std::vector<Object*> RuntimeContext::GetObjectsRawPointers(const std::string & name)
{
    return scene->objectsInstances.GetObjectsRawPointers(name);
}

RuntimeContext & RuntimeContext::ClearObjectListsMap()
{
    temporaryMap.clear();

    return *this;
}

RuntimeContext & RuntimeContext::AddObjectListToMap(const std::string & objectName, std::vector<Object*> & list)
{
    temporaryMap[objectName] = &list;

    return *this;
}

std::map <std::string, std::vector<Object*> *> RuntimeContext::ReturnObjectListsMap()
{
    return temporaryMap;
}

