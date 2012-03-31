/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef ARBITRARYRESOURCEWORKER_H
#define ARBITRARYRESOURCEWORKER_H

#include <string>
#include <vector>
#include <map>
#include <boost/shared_ptr.hpp>
class Game;
class BaseEvent;
namespace gd {class Project;}

/**
 * \brief ArbitraryResourceWorker is used so as to inventory resources and
 * sometimes update them.
 *
 * \see ResourcesMergingHelper
 * \see ResourcesUnmergingHelper
 * \see ImagesUsedInventorizer
 */
class GD_CORE_API ArbitraryResourceWorker
{
    public:

        ArbitraryResourceWorker() {};
        virtual ~ArbitraryResourceWorker();

        virtual void ExposeImage(std::string & imageName) = 0;
        virtual void ExposeShader(std::string & shaderName) = 0;
        virtual void ExposeResource(std::string & resource) = 0;
};

/**
 * Iterate over each event and call Expose(Actions/Conditions)Resources for each
 * actions and conditions with the ArbitraryResourceWorker passed as argument.
 */
void GD_CORE_API LaunchResourceWorkerOnEvents(const gd::Project & project, std::vector < boost::shared_ptr<BaseEvent> > & events, ArbitraryResourceWorker & worker);

#endif // ARBITRARYRESOURCEWORKER_H

#endif
