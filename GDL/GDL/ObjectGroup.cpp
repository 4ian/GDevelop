/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/ObjectGroup.h"
#include "GDL/ObjectIdentifiersManager.h"
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

ObjectGroup::ObjectGroup() :
id(0)
{
    //ctor
}

ObjectGroup::~ObjectGroup()
{
    //dtor
}

bool ObjectGroup::Find(string name) const
{
    for (unsigned int i = 0;i<memberObjects.size();++i)
    {
    	if ( memberObjects[i].first == name )
            return true;
    }

    return false;
}

void ObjectGroup::AddObject(string name)
{
    if ( !Find(name) )
    {
        ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::GetInstance();
        unsigned int oID = objectIdentifiersManager->GetOIDfromName(name);

        memberObjects.push_back(std::pair<string, unsigned int>(name, oID));
    }
}

void ObjectGroup::RemoveObject(string name)
{
    for (unsigned int i = 0;i<memberObjects.size();++i)
    {
    	if ( memberObjects[i].first == name )
    	{
            memberObjects.erase(memberObjects.begin()+i);
            return;
    	}
    }
}

bool ObjectGroup::HasAnIdenticalValue( const boost::interprocess::flat_set < unsigned int > & list)
{
    for (unsigned int j = 0;j < memberObjects.size();++j)
    {
        if ( list.find(memberObjects[j].second) != list.end())
            return true;
    }
    return false;
}
