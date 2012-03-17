#ifndef GDCORE_LAYOUT_H
#define GDCORE_LAYOUT_H
#include <string>

namespace gd
{

class GD_CORE_API Layout
{
public:
    Layout();
    virtual ~Layout();

    void SetName() {};
    std::string GetName() {return "";}

private:
};

}

#endif // GDCORE_LAYOUT_H
