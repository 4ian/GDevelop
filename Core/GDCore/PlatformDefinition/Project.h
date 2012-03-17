#ifndef GDCORE_PROJECT_H
#define GDCORE_PROJECT_H
#include "GDCore/PlatformDefinition/Layout.h"

namespace gd
{

class Project
{
public:
    Project();
    virtual ~Project();

    void SetName() {};
    std::string GetName() {return "";}

    Layout & GetLayout(unsigned int index) {return badLayout;};
    const Layout & GetLayout (unsigned int index) const {return badLayout;};
    void InsertNewLayout(unsigned int position) {return;};
    void RemoveLayout(unsigned int index) {return;};

private:

    static Layout badLayout;
};

}


#endif // GDCORE_PROJECT_H
