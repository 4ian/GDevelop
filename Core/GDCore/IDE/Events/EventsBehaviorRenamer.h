/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef EventsBehaviorRenamer_H
#define EventsBehaviorRenamer_H
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
 * \brief Replace in expressions and in parameters of actions or conditions, references
 * to the name of a behavior of an object by another name.
 *
 * \ingroup IDE
 */
class GD_CORE_API EventsBehaviorRenamer : public ArbitraryEventsWorkerWithContext {
 public:
  EventsBehaviorRenamer(const gd::Platform &platform_,
  const gd::String& objectName_,
  const gd::String& oldBehaviorName_,
  const gd::String& newBehaviorName_) :
    platform(platform_),
    objectName(objectName_),
    oldBehaviorName(oldBehaviorName_),
    newBehaviorName(newBehaviorName_)
  {};
  virtual ~EventsBehaviorRenamer();

 private:
  bool DoVisitInstruction(gd::Instruction &instruction,
                          bool isCondition) override;

  const gd::Platform &platform;
  gd::String objectName;
  gd::String oldBehaviorName;
  gd::String newBehaviorName;
};

}  // namespace gd

#endif  // EventsBehaviorRenamer_H
