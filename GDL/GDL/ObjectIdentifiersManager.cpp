#include "ObjectIdentifiersManager.h"

ObjectIdentifiersManager *ObjectIdentifiersManager::_singleton = NULL;

ObjectIdentifiersManager::ObjectIdentifiersManager()
{
    nameToObjectIdentifer.insert( StringToObjectIdBiMap::value_type("", 0) );
}

ObjectIdentifiersManager::~ObjectIdentifiersManager()
{
    //dtor
}
