/**

GDevelop - LinkedObjects Extension
Copyright (c) 2011-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "LinkedObjectsTools.h"
#include <iostream>
#include <string>

#include <memory>
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/RuntimeObjectsListsTools.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "ObjectsLinksManager.h"

using namespace std;

namespace GDpriv {
namespace LinkedObjects {

std::map<RuntimeScene*, ObjectsLinksManager> ObjectsLinksManager::managers;

bool GD_EXTENSION_API PickObjectsLinkedTo(
    RuntimeScene& scene,
    std::map<gd::String, std::vector<RuntimeObject*>*> pickedObjectsLists,
    RuntimeObject* object) {
  if (!object) return false;

  std::vector<RuntimeObject*> linkedObjects =
      ObjectsLinksManager::managers[&scene].GetObjectsLinkedWith(object);
  return PickObjectsIf(
      pickedObjectsLists, false, [&linkedObjects](RuntimeObject* obj) {
        return std::find(linkedObjects.begin(), linkedObjects.end(), obj) !=
               linkedObjects.end();
      });
}

void GD_EXTENSION_API LinkObjects(RuntimeScene& scene,
                                  RuntimeObject* a,
                                  RuntimeObject* b) {
  if (!a || !b) return;
  ObjectsLinksManager::managers[&scene].LinkObjects(a, b);
}

void GD_EXTENSION_API RemoveLinkBetween(RuntimeScene& scene,
                                        RuntimeObject* a,
                                        RuntimeObject* b) {
  if (!a || !b) return;
  ObjectsLinksManager::managers[&scene].RemoveLinkBetween(a, b);
}

void GD_EXTENSION_API RemoveAllLinksOf(RuntimeScene& scene,
                                       RuntimeObject* object) {
  if (!object) return;
  ObjectsLinksManager::managers[&scene].RemoveAllLinksOf(object);
}

}  // namespace LinkedObjects
}  // namespace GDpriv
