#include "ResourceWrapper.h"

void ResourceWrapper::SetResourceName(const std::string & name)
{
    if ( resourceName != boost::shared_ptr<std::string>() && *resourceName == name)
        return;

    resourceName = boost::shared_ptr<std::string>(new std::string(name));
}

void ResourceWrapper::SetResourceName(const std::string & name, RuntimeScene & scene)
{
    if ( resourceName != boost::shared_ptr<std::string>() && *resourceName == name)
        return;

    resourceName = boost::shared_ptr<std::string>(new std::string(name));
}

std::string ResourceWrapper::GetResourceName() const
{
    if ( resourceName != boost::shared_ptr<std::string>() )
        return *resourceName;

    return "";
};
