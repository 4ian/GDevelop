/**
 * Game Develop
 *    Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  Un groupe d'objets contient le nom de plusieurs objets
 */

#include "GDL/ObjectGroup.h"
#include "GDL/ObjectType.h"
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

ObjectGroup::ObjectGroup()
{
    //ctor
}

ObjectGroup::~ObjectGroup()
{
    //dtor
}

bool ObjectGroup::Find(string name) const
{
    if ( find(m_objets.begin(), m_objets.end(), name) != m_objets.end() )
        return true;

    return false;
}

void ObjectGroup::AddObject(string name)
{
    if ( !Find(name) )
        m_objets.push_back(name);
}

void ObjectGroup::RemoveObject(string name)
{
    m_objets.erase(remove(m_objets.begin(), m_objets.end(), name), m_objets.end());
}
/*
bool ObjectGroup::HasAnIdenticalValue( const set < ObjectType > & list)
{
    ObjectTypeManager * objectTypeManager = ObjectTypeManager::getInstance();

    for (unsigned int j = 0;j < m_objets.size();++j)
    {
        if ( find(list.begin(), list.end(), objectTypeManager->GetObjectTypeFromName(m_objets[j])) != list.end())
            return true;
    }
    return false;
}*/

bool ObjectGroup::HasAnIdenticalValue( const set < string > & list)
{
    for (unsigned int j = 0;j < m_objets.size();++j)
    {
        if ( find(list.begin(), list.end(), m_objets[j]) != list.end())
            return true;
    }
    return false;
}
