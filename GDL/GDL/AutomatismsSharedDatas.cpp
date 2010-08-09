#include "AutomatismsSharedDatas.h"
#include "ObjectIdentifiersManager.h"

AutomatismsSharedDatas::AutomatismsSharedDatas(std::string typeName) :
type(typeName)
{
    ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::getInstance();
    typeId = objectIdentifiersManager->GetOIDfromName(typeName);
}

void AutomatismsSharedDatas::SetName(std::string name_)
{
    name = name_;

    ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::getInstance();
    automatismId = objectIdentifiersManager->GetOIDfromName(name);
}
