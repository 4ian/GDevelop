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
    ResourcesMergingHelper() : ArbitraryResourceWorker(), preserveDirectoriesStructure(false) {};
    virtual ~ResourcesMergingHelper() {};

    /**
     * Set the directory used as base directory: All resources filename are relative to this directory.
     * ( Usually, it is the project directory )
     */
    void SetBaseDirectory(const std::string & baseDirectory);

    /**
     * Change the if the directories structure, starting from the base directory, must be preserved.
     * For compilation, all resources must be in a single folder, so that the directories structure is not preserved.
     */
    void PreserveDirectoriesStructure(bool preserveDirectoriesStructure_ = true) {preserveDirectoriesStructure = preserveDirectoriesStructure_;};

    /**
     * Return a map containing the resources old absolute filename as key, and the resources new filenames as value.
     * The new filenames are relative to the Base Directory.
     */
    std::map<std::string, std::string> & GetAllResourcesOldAndNewFilename() { return resourcesNewFilename; };

    /**
     * Resources merging helper collects all resources filenames and update these filenames.
     */
    virtual void ExposeResource(std::string & resource);

    virtual void ExposeImage(std::string & imageName) {};
    virtual void ExposeShader(std::string & shaderName) {};

protected:
    std::map<std::string, std::string> resourcesNewFilename;
    std::string baseDirectory;
    bool preserveDirectoriesStructure; ///< If set to true, the directory structure, starting from baseDirectory, will be preserved in filenames.
};

}

#endif // RESOURCESMERGINGHELPER_H







