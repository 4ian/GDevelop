/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef RESOURCESMERGINGHELPER_H
#define RESOURCESMERGINGHELPER_H

#include <string>
#include <vector>
#include <map>
#include <boost/shared_ptr.hpp>
#include "GDCore/IDE/ArbitraryResourceWorker.h"

namespace gd
{

/**
 * \brief ResourcesMergingHelper is used ( mainly during compilation ) so
 * as to inventory resources and change their filenames
 *
 * \see ArbitraryResourceWorker
 *
 * \ingroup IDE
 */
class GD_CORE_API ResourcesMergingHelper : public ArbitraryResourceWorker
{
public:
    ResourcesMergingHelper() : ArbitraryResourceWorker() {};
    virtual ~ResourcesMergingHelper() {};

    std::map<std::string, std::string> & GetAllResourcesNewFilename() { return resourcesNewFilename; };

    /**
     * Resources merging helper collects all resources filenames and update these filenames.
     */
    virtual void ExposeResource(std::string & resource);

    virtual void ExposeImage(std::string & imageName) {};
    virtual void ExposeShader(std::string & shaderName) {};

protected:
    std::map<std::string, std::string> resourcesNewFilename;
};

}

#endif // RESOURCESMERGINGHELPER_H
