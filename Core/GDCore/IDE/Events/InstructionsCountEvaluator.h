/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_INSTRUCTIONS_COUNT_EVALUATOR_H
#define GDCORE_INSTRUCTIONS_COUNT_EVALUATOR_H
#include <set>

#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/String.h"

namespace gd {
class Project;
class Object;
class Behavior;
}  // namespace gd

namespace gd {

class GD_CORE_API InstructionsCountEvaluator: public ArbitraryEventsWorker {
 public:
  static const int ScanProject(gd::Project& project);

 private:
  InstructionsCountEvaluator(gd::Project& project_) : project(project_), instructionCount(0){};
  gd::Project& project;
  int instructionCount;

  // Instructions Visitor
  bool DoVisitInstruction(gd::Instruction& instruction,
                          bool isCondition) override;
};

};  // namespace gd

#endif
