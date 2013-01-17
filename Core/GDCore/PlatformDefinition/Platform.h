/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_PLATFORM_H
#define GDCORE_PLATFORM_H
#include <boost/shared_ptr.hpp>
#include <vector>
#include <string>
namespace gd { class InstructionsMetadataHolder; }
namespace gd { class Project; }

namespace gd
{
class PlatformExtension;

/**
 * \brief Base class for implementing a platform
 *
 * \todo Current implementation status: Used in some part of the IDE: Currently, the IDE automatically create the Platform class of the GD C++ Platform when it is need.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Platform
{
public:
    Platform();
    virtual ~Platform();

    /**
     * Must return the platform name
     */
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

    /**
     * Must return a reference to the InstructionsMetadataHolder of the platform
     * \see gd::InstructionsMetadataHolder
     */
    virtual gd::InstructionsMetadataHolder & GetInstructionsMetadataHolder() const =0;

    /**
     * Must create an empty project
     */
    virtual boost::shared_ptr<gd::Project> CreateNewEmptyProject() const =0;

    /**
     * Called when the IDE is about to shut down: Take this opportunity for erasing
     * for example any temporary file.
     */
    virtual void OnIDEClosed() {};

    /**
     * Called when the IDE is initialized and ready to be used.
     */
    virtual void OnIDEInitialized() {};

private:
};

}

#endif // GDCORE_PLATFORM_H
