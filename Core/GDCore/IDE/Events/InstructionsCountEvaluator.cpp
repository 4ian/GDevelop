#include "InstructionsCountEvaluator.h"

#include "GDCore/Events/Instruction.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/ProjectExposerHelper.h"

namespace gd {

const int InstructionsCountEvaluator::ScanProject(gd::Project &project) {
  InstructionsCountEvaluator worker(project);
  gd::ProjectExposerHelper::ExposeProjectEventsWithoutExtensions(project,
                                                                 worker);
  return worker.instructionCount;
};

// Instructions scanner

bool InstructionsCountEvaluator::DoVisitInstruction(
    gd::Instruction &instruction, bool isCondition) {
  instructionCount++;
  return false;
}

} // namespace gd
