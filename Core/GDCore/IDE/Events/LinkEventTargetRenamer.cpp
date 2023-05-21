/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "LinkEventTargetRenamer.h"

#include <map>
#include <memory>
#include <vector>

#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Log.h"

namespace gd {

bool LinkEventTargetRenamer::DoVisitLinkEvent(gd::LinkEvent &linkEvent) {

  if (linkEvent.GetTarget() == oldName) {
    linkEvent.SetTarget(newName);
  }

  return false;
}

LinkEventTargetRenamer::~LinkEventTargetRenamer() {}

} // namespace gd
