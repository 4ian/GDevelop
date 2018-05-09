/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "RuntimeObjectsListsTools.h"
#include <map>
#include <string>
#include <vector>
#include "RuntimeObject.h"
#include "RuntimeScene.h"

void GD_API PickOnly(RuntimeObjectsLists& pickedObjectsLists,
                     RuntimeObject* thisOne) {
  for (auto it = pickedObjectsLists.begin(); it != pickedObjectsLists.end();
       ++it) {
    if (it->second != NULL) it->second->clear();
  }

  if (pickedObjectsLists[thisOne->GetName()] != NULL)
    pickedObjectsLists[thisOne->GetName()]->push_back(thisOne);
}
