#include "Automatism.h"
#include "ObjectIdentifiersManager.h"

Automatism::Automatism(std::string automatismTypeName) :
activated(true),
automatismId(0),
type(automatismTypeName)
{
    ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::GetInstance();
    typeId = objectIdentifiersManager->GetOIDfromName(automatismTypeName);
}

void Automatism::SetName(std::string name_)
{
    name = name_;

    ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::GetInstance();
    automatismId = objectIdentifiersManager->GetOIDfromName(name);
}
