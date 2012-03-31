#ifndef GDCORE_PROJECT_H
#define GDCORE_PROJECT_H
#include <string>
#include <vector>
#include "GDCore/PlatformDefinition/Layout.h"

namespace gd
{
class Platform;

class GD_CORE_API Project
{
public:
    Project();
    virtual ~Project();

    void SetName() {};
    std::string GetName() {return "";}

    /**
     * Must return a vector containing the names of extensions used by the project.
     */
    virtual std::vector < std::string > GetUsedPlatformExtensions() const { return noPlatformExtensionsUsed; };

    /**
     * Must return a reference to the platform the project is based on.
     */
    virtual Platform & GetPlatform() const =0;

    virtual Layout & GetLayout(unsigned int index) {return badLayout;};
    virtual const Layout & GetLayout (unsigned int index) const {return badLayout;};
    virtual void InsertNewLayout(unsigned int position) {return;};
    virtual void RemoveLayout(unsigned int index) {return;};

private:

    static Layout badLayout;
    static std::vector < std::string > noPlatformExtensionsUsed;
};

}


#endif // GDCORE_PROJECT_H
