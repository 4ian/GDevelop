/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include <map>
#include <memory>
#include <vector>

#include "GDCore/String.h"
#include "GDCore/Tools/SerializableWithNameList.h"

namespace gd {
class EventsBasedBehavior;
}  // namespace gd

namespace gd {

/**
 * \brief ArbitraryEventsFunctionsWorker is an abstract class used to browse
 * event-based behaviors and do some work on them. It can be used to implement
 * refactoring for example.
 *
 * \ingroup IDE
 */
class GD_CORE_API ArbitraryEventBasedBehaviorsWorker {
 public:
  ArbitraryEventBasedBehaviorsWorker(){};
  virtual ~ArbitraryEventBasedBehaviorsWorker();

  /**
   * \brief Launch the worker on the specified event-based behaviors.
   */
  void Launch(gd::SerializableWithNameList<gd::EventsBasedBehavior>& behaviors) { VisitEventBasedBehaviors(behaviors); };

  /**
   * \brief Launch the worker on the specified event-based behavior.
   */
  void Launch(EventsBasedBehavior& behavior) { VisitEventBasedBehavior(behavior); };

 private:
  void VisitEventBasedBehaviors(gd::SerializableWithNameList<gd::EventsBasedBehavior>& behaviors);
  void VisitEventBasedBehavior(gd::EventsBasedBehavior& behavior);

  /**
   * Called to do some work on event-based behaviors.
   */
  virtual void DoVisitEventBasedBehaviors(gd::SerializableWithNameList<gd::EventsBasedBehavior>& behaviors){};

  /**
   * Called to do some work on an event-based behavior.
   */
  virtual void DoVisitEventBasedBehavior(gd::EventsBasedBehavior& behavior){};
};

}  // namespace gd
