/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/String.h"
#include <map>
#include <memory>
#include <vector>

namespace gd {
class BaseEvent;
class LinkEvent;
class Platform;
class EventsList;
} // namespace gd

namespace gd {

/**
 * \brief Replace in link events the name of external events.
 *
 * \ingroup IDE
 */
class GD_CORE_API LinkEventTargetRenamer
    : public ArbitraryEventsWorkerWithContext {
public:
  LinkEventTargetRenamer(const gd::Platform &platform_,
                         const gd::String &oldName_, const gd::String &newName_)
      : platform(platform_), oldName(oldName_), newName(newName_){};
  virtual ~LinkEventTargetRenamer();

private:
  bool DoVisitLinkEvent(gd::LinkEvent &linkEvent) override;

  const gd::Platform &platform;
  gd::String oldName;
  gd::String newName;
};

} // namespace gd
