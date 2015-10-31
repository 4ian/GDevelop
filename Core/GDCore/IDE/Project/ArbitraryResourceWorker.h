/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef ARBITRARYRESOURCEWORKER_H
#define ARBITRARYRESOURCEWORKER_H

#include "GDCore/String.h"
#include <vector>
#include <map>
#include <memory>
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
 * \see gd::ImagesUsedInventorizer
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

    virtual void ExposeImage(gd::String & imageName) = 0;
    virtual void ExposeShader(gd::String & shaderName) = 0;
    virtual void ExposeFile(gd::String & resourceFileName) = 0;
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
