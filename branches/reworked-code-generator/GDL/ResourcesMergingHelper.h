/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef RESOURCESMERGINGHELPER_H
#define RESOURCESMERGINGHELPER_H

#include <string>
#include <vector>
#include <map>
#include <boost/shared_ptr.hpp>
#include "GDL/ArbitraryResourceWorker.h"
class Game;
class BaseEvent;

/**
 * ResourcesMergingHelper is used ( mainly during compilation ) so
 * as to inventory resources and change their filenames
 */
class GD_API ResourcesMergingHelper : public ArbitraryResourceWorker
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

#endif // RESOURCESMERGINGHELPER_H
#endif
