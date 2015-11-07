/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "SpriteTools.h"
#include <string>
#include <vector>
#include "GDCpp/RuntimeSpriteObject.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeObjectsListsTools.h"
#include "GDCpp/Collisions.h"
#include "GDCpp/profile.h"
#include "GDCpp/Extensions/Builtin/ObjectTools.h"

using namespace std;

/**
 * Test a collision between two sprites objects
 */
bool GD_API SpriteCollision( std::map <gd::String, std::vector<RuntimeObject*> *> objectsLists1, std::map <gd::String, std::vector<RuntimeObject*> *> objectsLists2, bool conditionInverted )
{
    return TwoObjectListsTest(objectsLists1, objectsLists2, conditionInverted, [](RuntimeObject * obj1, RuntimeObject * obj2) {
    	return CheckCollision( static_cast<RuntimeSpriteObject*>(obj1), static_cast<RuntimeSpriteObject*>(obj2));
    });
}
