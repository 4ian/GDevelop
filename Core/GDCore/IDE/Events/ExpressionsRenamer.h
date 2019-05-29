/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef ExpressionsRenamer_H
#define ExpressionsRenamer_H
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
 * \brief Replace in expressions, in parameters of actions or conditions, calls
 * to a function by another function.
 *
 * \ingroup IDE
 */
class GD_CORE_API ExpressionsRenamer : public ArbitraryEventsWorkerWithContext {
 public:
  ExpressionsRenamer(const gd::Platform &platform_) : platform(platform_){};
  virtual ~ExpressionsRenamer();

  ExpressionsRenamer &SetReplacedFreeExpression(
      const gd::String &oldFunctionName_, const gd::String &newFunctionName_) {
    objectType = "";
    behaviorType = "";
    oldFunctionName = oldFunctionName_;
    newFunctionName = newFunctionName_;
    return *this;
  }
  ExpressionsRenamer &SetReplacedObjectExpression(
      const gd::String &objectType_,
      const gd::String &oldFunctionName_,
      const gd::String &newFunctionName_) {
    objectType = objectType_;
    behaviorType = "";
    oldFunctionName = oldFunctionName_;
    newFunctionName = newFunctionName_;
    return *this;
  };
  ExpressionsRenamer &SetReplacedBehaviorExpression(
      const gd::String &behaviorType_,
      const gd::String &oldFunctionName_,
      const gd::String &newFunctionName_) {
    objectType = "";
    behaviorType = behaviorType_;
    oldFunctionName = oldFunctionName_;
    newFunctionName = newFunctionName_;
    return *this;
  };

 private:
  bool DoVisitInstruction(gd::Instruction &instruction,
                          bool isCondition) override;

  const gd::Platform &platform;
  gd::String oldFunctionName;
  gd::String newFunctionName;
  gd::String behaviorType;
  gd::String objectType;
};

}  // namespace gd

#endif  // ExpressionsRenamer_H
