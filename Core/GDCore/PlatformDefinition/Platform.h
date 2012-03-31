#ifndef GDCORE_PLATFORM_H
#define GDCORE_PLATFORM_H
#include <boost/shared_ptr.hpp>
#include <vector>
#include <string>

namespace gd
{
class PlatformExtension;

/**
 * \brief Base class for implementing a platform
 *
 */
class GD_CORE_API Platform
{
public:
    Platform();
    virtual ~Platform();

    virtual std::string GetPlatformName() { return "Unnamed platform"; }

    /**
     * Must return all the PlatformExtension available for the platform.
     * \see PlatformExtension
     */
    virtual std::vector < boost::shared_ptr<PlatformExtension> > GetAllPlatformExtensions() const =0;

    /**
     * Must return a (smart) pointer to the extension named name.
     * \param name Extension name
     * \return (smart) pointer to the extension named name.
     *
     * \see PlatformExtension
     */
    virtual boost::shared_ptr<PlatformExtension> GetExtension(const std::string & name) const =0;

private:
};

}

#endif // GDCORE_PLATFORM_H
