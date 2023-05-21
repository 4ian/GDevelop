/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Project/RequiredBehaviorRenamer.h"
#include <map>
#include <memory>
#include <vector>
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/String.h"

namespace gd {

void RequiredBehaviorRenamer::DoVisitEventBasedBehavior(gd::EventsBasedBehavior& eventsBasedBehavior) {
  for (size_t i = 0;
        i < eventsBasedBehavior.GetPropertyDescriptors().GetCount();
        i++) {
    NamedPropertyDescriptor& propertyDescriptor =
        eventsBasedBehavior.GetPropertyDescriptors().Get(i);

        std::vector<gd::String>& extraInfo = propertyDescriptor.GetExtraInfo();
        if (propertyDescriptor.GetType() == "Behavior" &&
            extraInfo.size() > 0) {
          const gd::String& requiredBehaviorType = extraInfo[0];
          if (requiredBehaviorType == oldBehaviorType) {
            extraInfo[0] = newBehaviorType;
          }
        }
  }
}

RequiredBehaviorRenamer::~RequiredBehaviorRenamer() {}

}  // namespace gd
