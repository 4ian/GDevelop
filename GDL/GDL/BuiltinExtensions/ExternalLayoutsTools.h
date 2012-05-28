#ifndef EXTERNALLAYOUTSTOOLS_H
#define EXTERNALLAYOUTSTOOLS_H
#include <string>
class RuntimeScene;

namespace ExternalLayoutsTools
{
    void GD_API CreateObjectsFromExternalLayout(RuntimeScene & scene, const std::string & externalLayoutName);
};

#endif // EXTERNALLAYOUTSTOOLS_H
