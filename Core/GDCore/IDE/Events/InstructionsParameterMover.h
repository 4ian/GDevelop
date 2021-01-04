/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef InstructionsParameterMover_H
#define InstructionsParameterMover_H
#include <map>
#include <memory>
#include <vector>
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/String.h"
namespace gd {
class BaseEvent;
class Project;
class EventsList;
}  // namespace gd

namespace gd {

/**
 * \brief Reorder the parameters of the instruction with the specified
 * type in events, moving the parameter at the specified \a oldIndex to
 * \a newIndex.
 *
 * \see ExpressionsParameterMover
 * \ingroup IDE
 */
class GD_CORE_API InstructionsParameterMover : public ArbitraryEventsWorker {
 public:
  InstructionsParameterMover(const gd::Project& project_,
                             const gd::String& instructionType_,
                             std::size_t oldIndex_,
                             std::size_t newIndex_)
      : project(project_),
        instructionType(instructionType_),
        oldIndex(oldIndex_),
        newIndex(newIndex_){};
  virtual ~InstructionsParameterMover();

 private:
  bool DoVisitInstruction(gd::Instruction& instruction,
                          bool isCondition) override;

  const gd::Project& project;
  gd::String instructionType;
  std::size_t oldIndex;
  std::size_t newIndex;
};

}  // namespace gd

#endif  // InstructionsParameterMover_H
