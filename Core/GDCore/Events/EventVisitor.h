/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <iostream>
#include <memory>
#include <vector>

#include "GDCore/String.h"

namespace gd {
class BaseEvent;
class LinkEvent;
}  // namespace gd

namespace gd {

/**
 * \brief Visitor of any kind of event.
 *
 * \ingroup Events
 */
class GD_CORE_API EventVisitor {
 public:
  virtual ~EventVisitor(){};

  /**
   * Called to do some work on an event.
   * 
   * \return true if the event must be deleted from the events list, false
   * otherwise.
   */
  virtual bool VisitEvent(gd::BaseEvent& linkEvent) = 0;
  
  /**
   * Called to do some work on a link event.
   * 
   * Note that VisitEvent is also called with this event.
   * 
   * \return true if the event must be deleted from the events list, false
   * otherwise.
   */
  virtual bool VisitLinkEvent(gd::LinkEvent& linkEvent) = 0;
};

/**
 * \brief Visitor of any kind of event.
 *
 * \ingroup Events
 */
class GD_CORE_API ReadOnlyEventVisitor {
 public:
  virtual ~ReadOnlyEventVisitor(){};

  /**
   * Called to do some work on an event.
   */
  virtual void VisitEvent(const gd::BaseEvent& linkEvent) = 0;

  /**
   * Called to do some work on a link event.
   * 
   * Note that VisitEvent is also called with this event.
   */
  virtual void VisitLinkEvent(const gd::LinkEvent& linkEvent) = 0;

  /**
   * @brief Abort the iteration on the events.
   */
  virtual void StopAnyEventIteration() = 0;
};

}
