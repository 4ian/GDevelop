#include "BehaviorTypeRenamer.h"

#include "GDCore/Events/Instruction.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/WholeProjectRefactorer.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"

namespace gd {

void BehaviorTypeRenamer::DoVisitObject(gd::Object& object) {
};

void BehaviorTypeRenamer::DoVisitBehavior(gd::Behavior& behavior) {
  if (behavior.GetTypeName() == oldType) {
    behavior.SetTypeName(newType);
  }
};

BehaviorTypeRenamer::~BehaviorTypeRenamer() {}

}  // namespace gd
