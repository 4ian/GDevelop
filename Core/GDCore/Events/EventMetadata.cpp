/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#if defined(GD_IDE_ONLY)
#include "GDCore/Events/EventMetadata.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Event.h"

namespace gd
{

EventMetadata::EventMetadata(const std::string & name_,
                             const std::string & fullname_,
                             const std::string & description_,
                             const std::string & group_,
                             const std::string & smallicon_,
                             boost::shared_ptr<gd::BaseEvent> instance_) :
fullname(fullname_),
description(description_),
group(group_),
instance(instance_)
{
    if ( instance ) instance->SetType(name_);
}

std::string EventMetadata::CodeGenerator::Generate(gd::BaseEvent & event, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
{
    return "";
}

void EventMetadata::CodeGenerator::Preprocess(gd::BaseEvent & event, gd::EventsCodeGenerator & codeGenerator,
                                              gd::EventsList & eventList, unsigned int indexOfTheEventInThisList)
{
}

}
#endif
