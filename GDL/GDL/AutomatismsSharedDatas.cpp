/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "AutomatismsSharedDatas.h"
#include "ObjectIdentifiersManager.h"

AutomatismsSharedDatas::AutomatismsSharedDatas(std::string typeName) :
type(typeName)
{
    ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::GetInstance();
    typeId = objectIdentifiersManager->GetOIDfromName(typeName);
}

void AutomatismsSharedDatas::SetName(std::string name_)
{
    name = name_;

    ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::GetInstance();
    automatismId = objectIdentifiersManager->GetOIDfromName(name);
}
