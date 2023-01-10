/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_SHAREDDATABEHAVIORTYPERENAMER_H
#define GDCORE_SHAREDDATABEHAVIORTYPERENAMER_H
#include <map>
#include <memory>
#include <vector>
#include "GDCore/IDE/Project/ArbitrarySharedDataWorker.h"
#include "GDCore/String.h"
namespace gd {
class BaseEvent;
class Project;
class EventsList;
}  // namespace gd

namespace gd {

/**
 * \brief Rename the behavior type of shared data.
 *
 * \ingroup IDE
 */
class GD_CORE_API SharedDataBehaviorTypeRenamer : public ArbitrarySharedDataWorker {
 public:
  SharedDataBehaviorTypeRenamer(const gd::String& oldBehaviorType_,
                                       const gd::String& newBehaviorType_)
      : oldBehaviorType(oldBehaviorType_), newBehaviorType(newBehaviorType_){};
  virtual ~SharedDataBehaviorTypeRenamer();

 private:
  void DoVisitSharedData(gd::BehaviorsSharedData& behavior) override;

  gd::String oldBehaviorType;
  gd::String newBehaviorType;
};

}  // namespace gd

#endif  // GDCORE_SHAREDDATABEHAVIORTYPERENAMER_H
