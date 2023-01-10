/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_ARBITRARYFUNCTIONSWORKER_H
#define GDCORE_ARBITRARYFUNCTIONSWORKER_H

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
 * \brief ArbitraryFunctionsWorker is an abstract class used to browse
 * functions signature and do some work on them. Can be used to implement
 * refactoring for example.
 *
 * \ingroup IDE
 */
class GD_CORE_API ArbitraryFunctionsWorker {
 public:
  ArbitraryFunctionsWorker(){};
  virtual ~ArbitraryFunctionsWorker();

  /**
   * \brief Launch the worker on the specified function container.
   */
  void Launch(gd::EventsFunctionsContainer& functions) { VisitFunctionContainer(functions); };

 private:
  void VisitFunctionContainer(gd::EventsFunctionsContainer& functions);
  void VisitFunction(gd::EventsFunction& eventsFunction);

  /**
   * Called to do some work on an function container.
   */
  virtual void DoVisitFunctionsContainer(gd::EventsFunctionsContainer& functions){};

  /**
   * Called to do some work on a function.
   */
  virtual void DoVisitFunction(gd::EventsFunction& eventsFunction){};
};

}  // namespace gd

#endif  // GDCORE_ARBITRARYFUNCTIONSWORKER_H
