/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef RESOURCESUNMERGINGHELPER_H
#define RESOURCESUNMERGINGHELPER_H

#include "GDL/ResourcesMergingHelper.h"
#include <string>

/**
 * Helper used to regenerate resources filename from a "portable" game
 */
class GD_API ResourcesUnmergingHelper : public ResourcesMergingHelper
{
    public:
        ResourcesUnmergingHelper(std::string newDirectory_) : ResourcesMergingHelper(), newDirectory(newDirectory_) {};
        virtual ~ResourcesUnmergingHelper() {};

        virtual std::string GetNewFilename(std::string resourceFilename);

    private:
        std::string newDirectory;
};

#endif // RESOURCESUNMERGINGHELPER_H

#endif
