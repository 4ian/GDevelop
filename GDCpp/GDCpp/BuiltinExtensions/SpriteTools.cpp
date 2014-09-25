/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "SpriteTools.h"
#include <string>
#include <vector>
#include "GDCpp/RuntimeSpriteObject.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/Collisions.h"
#include "GDCpp/profile.h"
#include "GDCpp/BuiltinExtensions/ObjectTools.h"

using namespace std;

static bool SpriteCollisionInnerTest(RuntimeObject * obj1, RuntimeObject * obj2, const ListsTestFuncExtraParameter &extraParameter )
{
    return CheckCollision( static_cast<RuntimeSpriteObject*>(obj1), static_cast<RuntimeSpriteObject*>(obj2));
}

/**
 * Test a collision between two sprites objects
 */
bool GD_API SpriteCollision( std::map <std::string, std::vector<RuntimeObject*> *> objectsLists1, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists2, bool conditionInverted )
{
    return TwoObjectListsTest(objectsLists1, objectsLists2, conditionInverted, SpriteCollisionInnerTest, ListsTestFuncExtraParameter());
}
