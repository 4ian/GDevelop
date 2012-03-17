#ifndef GDCORE_PLATFORM_H
#define GDCORE_PLATFORM_H

#include <string>

namespace gd
{

/**
 * \brief Base class for implementing a platform
 *
 */
class GD_CORE_API Platform
{
public:
    Platform();
    virtual ~Platform();

    std::string GetPlatformName() { return "Unnamed platform"; }


protected:
private:
};

}

#endif // GDCORE_PLATFORM_H
