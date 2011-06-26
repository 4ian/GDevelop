/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/ObjectGroup.h"
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

ObjectGroup::ObjectGroup()
{
    //ctor
}

bool ObjectGroup::Find(string name) const
{
    return std::find(memberObjects.begin(), memberObjects.end(), name) != memberObjects.end();
}

void ObjectGroup::AddObject(string name)
{
    if ( !Find(name) ) memberObjects.push_back(name);
}

void ObjectGroup::RemoveObject(string name)
{
    std::remove(memberObjects.begin(), memberObjects.end(), name);
    return;
}
