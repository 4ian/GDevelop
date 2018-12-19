/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef InstructionsTypeRenamer_H
#define InstructionsTypeRenamer_H
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
 * \brief Replace in events all instructions of the specified type
 * by another type.
 *
 * \ingroup IDE
 */
class GD_CORE_API InstructionsTypeRenamer : public ArbitraryEventsWorker {
 public:
  InstructionsTypeRenamer(const gd::Project& project_,
                          const gd::String& oldType_,
                          const gd::String& newType_)
      : project(project_), oldType(oldType_), newType(newType_){};
  virtual ~InstructionsTypeRenamer();

 private:
  bool DoVisitInstruction(gd::Instruction& instruction,
                          bool isCondition) override;

  const gd::Project& project;
  gd::String oldType;
  gd::String newType;
};

}  // namespace gd

#endif  // InstructionsTypeRenamer_H
