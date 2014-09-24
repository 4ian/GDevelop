/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#ifndef ARBITRARYRESOURCEWORKER_H
#define ARBITRARYRESOURCEWORKER_H

#include <string>
#include <vector>
#include <map>
#include <boost/shared_ptr.hpp>
namespace gd {class BaseEvent;}
namespace gd {class Project;}
namespace gd {class EventsList;}
namespace gd {class Resource;}

namespace gd
{

/**
 * \brief ArbitraryResourceWorker is used so as to inventory resources and
 * sometimes update them.
 *
 * \see ResourcesMergingHelper
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
    virtual void ExposeFile(std::string & resourceFileName) = 0;
    void ExposeResource(gd::Resource & resource);
};

/**
 * Tool function iterating over each event and calling Expose(Actions/Conditions)Resources for each
 * actions and conditions with the ArbitraryResourceWorker passed as argument.
 *
 * \see gd::ArbitraryResourceWorker
 * \ingroup IDE
 */
void GD_CORE_API LaunchResourceWorkerOnEvents(const gd::Project & project, gd::EventsList & events, gd::ArbitraryResourceWorker & worker);

}

#endif // ARBITRARYRESOURCEWORKER_H
