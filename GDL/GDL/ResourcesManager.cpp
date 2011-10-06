#include "ResourcesManager.h"

ResourcesManager::ResourcesManager()
{
    //ctor
}

ResourcesManager::~ResourcesManager()
{
    //dtor
}

void ResourcesManager::Init(const ResourcesManager & other)
{
    resources.clear();
    for (unsigned int i = 0;i<other.resources.size();++i)
    {
        resources.push_back(other.resources[i]->Clone());
    }
}

ResourcesManager::ResourcesManager(const ResourcesManager & other)
{
    Init(other);
}

ResourcesManager& ResourcesManager::operator=(const ResourcesManager & other)
{
    if ( this != &other )
        Init(other);

    return *this;
}
