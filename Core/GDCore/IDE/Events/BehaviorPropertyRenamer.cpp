#include "BehaviorPropertyRenamer.h"

#include "GDCore/Events/Instruction.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/WholeProjectRefactorer.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"

namespace gd {

void BehaviorPropertyRenamer::DoVisitBehavior(gd::Behavior &behavior) {
  if (behavior.GetTypeName() == behaviorType) {
    behavior.RenameProperty(oldName, newName);
  }
};

BehaviorPropertyRenamer::~BehaviorPropertyRenamer() {}

} // namespace gd
