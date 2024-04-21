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

namespace gd {
class EventsFunction;
class EventsFunctionsContainer;
class ParameterMetadata;
}  // namespace gd

namespace gd {

/**
 * \brief ArbitraryEventsFunctionsWorker is an abstract class used to browse
 * functions signatures and do some work on them. It can be used to implement
 * refactoring for example.
 *
 * \ingroup IDE
 */
class GD_CORE_API ArbitraryEventsFunctionsWorker {
 public:
  ArbitraryEventsFunctionsWorker(){};
  virtual ~ArbitraryEventsFunctionsWorker();

  /**
   * \brief Launch the worker on the specified function container.
   */
  void Launch(gd::EventsFunctionsContainer& functions) { VisitEventsFunctionContainer(functions); };

 private:
  void VisitEventsFunctionContainer(gd::EventsFunctionsContainer& functions);
  void VisitEventsFunction(gd::EventsFunction& eventsFunction);

  /**
   * Called to do some work on an function container.
   */
  virtual void DoVisitEventsFunctionsContainer(gd::EventsFunctionsContainer& functions){};

  /**
   * Called to do some work on a function.
   */
  virtual void DoVisitEventsFunction(gd::EventsFunction& eventsFunction){};
};

}  // namespace gd
