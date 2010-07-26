#include "AutomatismsSharedDatas.h"
#include "ObjectIdentifiersManager.h"

AutomatismsSharedDatas::AutomatismsSharedDatas(std::string typeName) :
type(typeName)
{
    ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::getInstance();
    typeId = objectIdentifiersManager->GetOIDfromName(typeName);
}
