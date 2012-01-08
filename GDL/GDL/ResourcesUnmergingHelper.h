/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef RESOURCESUNMERGINGHELPER_H
#define RESOURCESUNMERGINGHELPER_H

#include "GDL/IDE/ArbitraryResourceWorker.h"
#include <string>

/**
 * Helper used to regenerate resources filename from a "portable" game
 */
class GD_API ResourcesUnmergingHelper : public ArbitraryResourceWorker
{
    public:
        ResourcesUnmergingHelper(std::string newDirectory_) : ArbitraryResourceWorker(), newDirectory(newDirectory_) {};
        virtual ~ResourcesUnmergingHelper() {};

        /**
         * ResourcesUnmergingHelper modify each resouce path.
         */
        virtual void ExposeResource(std::string & resource);

        virtual void ExposeImage(std::string & imageName) {};
        virtual void ExposeShader(std::string & shaderName) {};

    private:
        std::string newDirectory;
};

#endif // RESOURCESUNMERGINGHELPER_H

#endif
