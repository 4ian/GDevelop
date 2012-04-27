/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "ObjectGroup.h"
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

namespace gd
{

bool ObjectGroup::Find(const string & name) const
{
    return std::find(memberObjects.begin(), memberObjects.end(), name) != memberObjects.end();
}

void ObjectGroup::AddObject(const string & name)
{
    if ( !Find(name) ) memberObjects.push_back(name);
}

void ObjectGroup::RemoveObject(const string & name)
{
    memberObjects.erase(std::remove(memberObjects.begin(), memberObjects.end(), name), memberObjects.end());
    return;
}


}
