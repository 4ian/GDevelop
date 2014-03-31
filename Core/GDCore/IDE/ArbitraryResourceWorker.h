/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef ARBITRARYRESOURCEWORKER_H
#define ARBITRARYRESOURCEWORKER_H

#include <string>
#include <vector>
#include <map>
#include <boost/shared_ptr.hpp>
namespace gd {class BaseEvent;}
namespace gd {class Project;}

namespace gd
{

/**
 * \brief ArbitraryResourceWorker is used so as to inventory resources and
 * sometimes update them.
 *
 * \see ResourcesMergingHelper
 * \see gd::ResourcesUnmergingHelper
 * \see ImagesUsedInventorizer
 *
 * \see gd::LaunchResourceWorkerOnEvents
 *
 * \ingroup IDE
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
 * Tool function iterating over each event and calling Expose(Actions/Conditions)Resources for each
 * actions and conditions with the ArbitraryResourceWorker passed as argument.
 *
 * \see gd::ArbitraryResourceWorker
 * \ingroup IDE
 */
void GD_CORE_API LaunchResourceWorkerOnEvents(const gd::Project & project, std::vector < boost::shared_ptr<gd::BaseEvent> > & events, gd::ArbitraryResourceWorker & worker);

}

#endif // ARBITRARYRESOURCEWORKER_H
