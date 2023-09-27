/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once
#include <map>
#include <memory>
#include <unordered_map>
#include <unordered_set>
#include <vector>

#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/String.h"
namespace gd {
class BaseEvent;
class PropertiesContainer;
class EventsList;
class Platform;
}  // namespace gd

namespace gd {

/**
 * \brief Replace in expressions and in parameters of actions or conditions,
 * references to the name of a property by another.
 *
 * \ingroup IDE
 */
class GD_CORE_API EventsPropertyReplacer
    : public ArbitraryEventsWorkerWithContext {
 public:
  EventsPropertyReplacer(
      const gd::Platform &platform_,
      const gd::PropertiesContainer &targetPropertiesContainer_,
      const std::unordered_map<gd::String, gd::String> &oldToNewPropertyNames_,
      const std::unordered_set<gd::String> &removedPropertyNames_)
      : platform(platform_),
        targetPropertiesContainer(targetPropertiesContainer_),
        oldToNewPropertyNames(oldToNewPropertyNames_),
        removedPropertyNames(removedPropertyNames_){};
  virtual ~EventsPropertyReplacer();

 private:
  bool DoVisitInstruction(gd::Instruction &instruction,
                          bool isCondition) override;
  bool DoVisitEventExpression(gd::Expression &expression,
                              const gd::ParameterMetadata &metadata) override;

  const gd::Platform &platform;
  const gd::PropertiesContainer &targetPropertiesContainer;
  const std::unordered_map<gd::String, gd::String> &oldToNewPropertyNames;
  const std::unordered_set<gd::String> &removedPropertyNames;
};

}  // namespace gd
