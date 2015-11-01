/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <string>
#include <vector>
#include <map>
#include "RuntimeScene.h"
#include "RuntimeObject.h"
#include "RuntimeObjectsListsTools.h"

void GD_API PickOnly(RuntimeObjectsLists & pickedObjectsLists, RuntimeObject * thisOne)
{
    for (auto it = pickedObjectsLists.begin();it!=pickedObjectsLists.end();++it)
    {
        if (it->second != NULL) it->second->clear();
    }

    if (pickedObjectsLists[thisOne->GetName()] != NULL) pickedObjectsLists[thisOne->GetName()]->push_back(thisOne);
}
