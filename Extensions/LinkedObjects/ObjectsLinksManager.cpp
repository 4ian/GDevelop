/**

GDevelop - LinkedObjects Extension
Copyright (c) 2011-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "ObjectsLinksManager.h"

#include <iostream>
#include <string>
#include "LinkedObjectsTools.h"

#include <memory>
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/RuntimeScene.h"

using namespace std;

namespace GDpriv {
namespace LinkedObjects {

void ObjectsLinksManager::LinkObjects(RuntimeObject* a, RuntimeObject* b) {
  {
    std::set<RuntimeObject*>& objectLinks = links[a];
    objectLinks.insert(b);
  }
  {
    std::set<RuntimeObject*>& objectLinks = links[b];
    objectLinks.insert(a);
  }
}

void ObjectsLinksManager::RemoveLinkBetween(RuntimeObject* a,
                                            RuntimeObject* b) {
  {
    std::set<RuntimeObject*>& objectLinks = links[a];
    objectLinks.erase(b);
  }
  {
    std::set<RuntimeObject*>& objectLinks = links[b];
    objectLinks.erase(a);
  }
}

void ObjectsLinksManager::RemoveAllLinksOf(RuntimeObject* object) {
  std::set<RuntimeObject*>& objectLinks = links[object];
  for (std::set<RuntimeObject*>::iterator linkedObj = objectLinks.begin();
       linkedObj != objectLinks.end();
       ++linkedObj) {
    std::set<RuntimeObject*>& linkedObjectLinks = links[*linkedObj];
    linkedObjectLinks.erase(object);
  }

  links.erase(object);  // Remove all links of object
}

std::vector<RuntimeObject*> ObjectsLinksManager::GetObjectsLinkedWith(
    RuntimeObject* object) {
  // Get links of object
  const std::set<RuntimeObject*>& objectLinks = links[object];
  std::vector<RuntimeObject*> list;
  list.reserve(objectLinks.size());

  // Create the list, avoiding dead links or links to just deleted objects
  for (std::set<RuntimeObject*>::iterator linkedObj = objectLinks.begin();
       linkedObj != objectLinks.end();
       ++linkedObj) {
    if (!(*linkedObj)->GetName().empty()) list.push_back((*linkedObj));
  }

  return list;
}

void ObjectsLinksManager::ClearAll() { links.clear(); }

}  // namespace LinkedObjects
}  // namespace GDpriv
