#include "Automatism.h"
#include "ObjectIdentifiersManager.h"

Automatism::Automatism(std::string automatismTypeName) :
activated(true),
type(automatismTypeName)
{
    ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::getInstance();
    typeId = objectIdentifiersManager->GetOIDfromName(automatismTypeName);
}
