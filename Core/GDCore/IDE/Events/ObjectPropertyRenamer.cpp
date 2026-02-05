#include "ObjectPropertyRenamer.h"

#include "GDCore/Events/Instruction.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/WholeProjectRefactorer.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"

namespace gd {

void ObjectPropertyRenamer::DoVisitObject(gd::Object &object) {
  if (object.GetType() == objectType) {
    object.GetConfiguration().RenameProperty(oldName, newName);
  }
};

void ObjectPropertyRenamer::DoVisitBehavior(gd::Behavior &behavior) {};

ObjectPropertyRenamer::~ObjectPropertyRenamer() {}

} // namespace gd
