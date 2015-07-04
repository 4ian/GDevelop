/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#include "GDCore/Events/EventMetadata.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Event.h"

namespace gd
{

EventMetadata::EventMetadata(const gd::String & name_,
                             const gd::String & fullname_,
                             const gd::String & description_,
                             const gd::String & group_,
                             const gd::String & smallicon_,
                             std::shared_ptr<gd::BaseEvent> instance_) :
fullname(fullname_),
description(description_),
group(group_),
instance(instance_)
{
    if ( instance ) instance->SetType(name_);
}

gd::String EventMetadata::CodeGenerator::Generate(gd::BaseEvent & event, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
{
    return "";
}

void EventMetadata::CodeGenerator::Preprocess(gd::BaseEvent & event, gd::EventsCodeGenerator & codeGenerator,
                                              gd::EventsList & eventList, unsigned int indexOfTheEventInThisList)
{
}

}
#endif
