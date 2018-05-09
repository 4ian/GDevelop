/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Metadata/EventMetadata.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"

namespace gd {

EventMetadata::EventMetadata(const gd::String &name_,
                             const gd::String &fullname_,
                             const gd::String &description_,
                             const gd::String &group_,
                             const gd::String &smallicon_,
                             std::shared_ptr<gd::BaseEvent> instance_)
    : fullname(fullname_),
      description(description_),
      group(group_),
      instance(instance_) {
  ClearCodeGenerationAndPreprocessing();
  if (instance) instance->SetType(name_);
}

void EventMetadata::ClearCodeGenerationAndPreprocessing() {
  hasCustomCodeGenerator = false;
  codeGeneration = [](gd::BaseEvent &,
                      gd::EventsCodeGenerator &,
                      gd::EventsCodeGenerationContext &) { return ""; };
  preprocessing = [](gd::BaseEvent &,
                     gd::EventsCodeGenerator &,
                     gd::EventsList &,
                     std::size_t) {
    // Do nothing
  };
}

}  // namespace gd
#endif
