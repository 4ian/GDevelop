/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef ExpressionsParameterMover_H
#define ExpressionsParameterMover_H
#include <map>
#include <memory>
#include <vector>
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/String.h"
namespace gd {
class BaseEvent;
class Platform;
class EventsList;
}  // namespace gd

namespace gd {

/**
 * \brief Move in expressions, in parameters of actions or conditions, a
 * parameter from one position to another.
 *
 * \see InstructionsParameterMover
 * \ingroup IDE
 */
class GD_CORE_API ExpressionsParameterMover
    : public ArbitraryEventsWorkerWithContext {
 public:
  ExpressionsParameterMover(const gd::Platform &platform_)
      : platform(platform_){};
  virtual ~ExpressionsParameterMover();

  ExpressionsParameterMover &SetFreeExpressionMovedParameter(
      const gd::String &functionName_,
      std::size_t oldIndex_,
      std::size_t newIndex_) {
    objectType = "";
    behaviorType = "";
    functionName = functionName_;
    oldIndex = oldIndex_;
    newIndex = newIndex_;
    return *this;
  }
  ExpressionsParameterMover &SetObjectExpressionMovedParameter(
      const gd::String &objectType_,
      const gd::String &functionName_,
      std::size_t oldIndex_,
      std::size_t newIndex_) {
    objectType = objectType_;
    behaviorType = "";
    functionName = functionName_;
    oldIndex = oldIndex_;
    newIndex = newIndex_;
    return *this;
  };
  ExpressionsParameterMover &SetBehaviorExpressionMovedParameter(
      const gd::String &behaviorType_,
      const gd::String &functionName_,
      std::size_t oldIndex_,
      std::size_t newIndex_) {
    objectType = "";
    behaviorType = behaviorType_;
    functionName = functionName_;
    oldIndex = oldIndex_;
    newIndex = newIndex_;
    return *this;
  };

 private:
  bool DoVisitInstruction(gd::Instruction &instruction,
                          bool isCondition) override;

  const gd::Platform &platform;
  gd::String functionName;
  std::size_t oldIndex;
  std::size_t newIndex;
  gd::String behaviorType;
  gd::String objectType;
};

}  // namespace gd

#endif  // ExpressionsParameterMover_H
