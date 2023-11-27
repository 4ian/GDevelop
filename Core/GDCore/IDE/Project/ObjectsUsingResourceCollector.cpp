#include "ObjectsUsingResourceCollector.h"

#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"

namespace gd {

void ObjectsUsingResourceCollector::DoVisitObject(gd::Object& object) {
  gd::ResourceNameMatcher resourceNameMatcher(*resourcesManager, resourceName);

  object.GetConfiguration().ExposeResources(resourceNameMatcher);
  if (resourceNameMatcher.AnyResourceMatches()) {
    objectNames.push_back(object.GetName());
  }
};

ObjectsUsingResourceCollector::~ObjectsUsingResourceCollector() {}

}  // namespace gd
