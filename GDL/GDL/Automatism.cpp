#include "Automatism.h"
#include "ObjectIdentifiersManager.h"

Automatism::Automatism(std::string automatismTypeName) :
activated(true),
type(automatismTypeName),
automatismId(0)
{
    ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::getInstance();
    typeId = objectIdentifiersManager->GetOIDfromName(automatismTypeName);
}

void Automatism::SetName(std::string name_)
{
    name = name_;

    ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::getInstance();
    automatismId = objectIdentifiersManager->GetOIDfromName(name);
}
