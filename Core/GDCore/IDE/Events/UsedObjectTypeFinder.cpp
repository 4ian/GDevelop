#include "UsedObjectTypeFinder.h"

#include "GDCore/Events/Instruction.h"
#include "GDCore/IDE/ProjectBrowserHelper.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"

namespace gd {

bool UsedObjectTypeFinder::ScanProject(gd::Project &project,
                                       const gd::String &objectType) {
  UsedObjectTypeFinder worker(project, objectType);
  gd::ProjectBrowserHelper::ExposeProjectObjects(project, worker);
  return worker.hasFoundObjectType;
};

void UsedObjectTypeFinder::DoVisitObject(gd::Object &object) {
  if (!hasFoundObjectType && object.GetType() == objectType) {
    hasFoundObjectType = true;
  }
};

} // namespace gd
