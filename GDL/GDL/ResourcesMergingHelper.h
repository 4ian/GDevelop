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
class Game;
class BaseEvent;

/**
 * ResourcesMergingHelper is used ( mainly during compilation ) so
 * as to inventory resources and change their filenames
 */
class GD_API ResourcesMergingHelper
{
    public:
        ResourcesMergingHelper() {};
        virtual ~ResourcesMergingHelper() {};

        virtual std::string GetNewFilename(std::string resourceFilename);
        std::map<std::string, std::string> & GetAllResourcesNewFilename() { return resourcesNewFilename; };

    protected:
        std::map<std::string, std::string> resourcesNewFilename;
};

/**
 * Iterate over each event and call Prepare(Actions/Conditions)ResourcesForMerging for each
 * actions and conditions with the ResourcesMergingHelper passed as argument.
 */
void GD_API InventoryEventsResources(const Game & game, std::vector < boost::shared_ptr<BaseEvent> > & events, ResourcesMergingHelper & resourcesMergingHelper);

#endif // RESOURCESMERGINGHELPER_H
#endif
