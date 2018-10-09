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
 * \note The replacement is done by making a raw search/replace in parameters
 * that are expecting expressions or string expressions. Consequently, to avoid
 * unwanted renaming, be sure to only use ExpressionsRenamer for expression
 * calls that have an obvious name (in particular, make sure they have a
 * namespace: Extension::Expression).
 *
 * \ingroup IDE
 */
class GD_CORE_API ExpressionsRenamer : public ArbitraryEventsWorker {
 public:
  ExpressionsRenamer(const gd::Platform& platform_,
                     const gd::String& oldType_,
                     const gd::String& newType_)
      : platform(platform_), oldType(oldType_), newType(newType_){};
  virtual ~ExpressionsRenamer();

 private:
  bool DoVisitInstruction(gd::Instruction& instruction,
                          bool isCondition) override;

  const gd::Platform& platform;
  gd::String oldType;
  gd::String newType;
};

}  // namespace gd

#endif  // ExpressionsRenamer_H
