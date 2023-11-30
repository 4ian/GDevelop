#include "CustomObjectTypeRenamer.h"

#include "GDCore/Events/Instruction.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/WholeProjectRefactorer.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"

namespace gd {

void CustomObjectTypeRenamer::DoVisitObject(gd::Object& object) {
  if (object.GetType() == oldType) {
    object.SetType(newType);
  }
};

void CustomObjectTypeRenamer::DoVisitBehavior(gd::Behavior& behavior) {};

CustomObjectTypeRenamer::~CustomObjectTypeRenamer() {}

}  // namespace gd
