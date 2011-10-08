#include "ResourcesManager.h"
#include <iostream>

void ResourceFolder::Init(const ResourceFolder & other)
{
    name = other.name;

    resources.clear();
    for (unsigned int i = 0;i<other.resources.size();++i)
    {
        resources.push_back(other.resources[i]->Clone());
    }
}

void ResourcesManager::Init(const ResourcesManager & other)
{
    resources.clear();
    for (unsigned int i = 0;i<other.resources.size();++i)
    {
        resources.push_back(other.resources[i]->Clone());
    }
    folders.clear();
    for (unsigned int i = 0;i<other.folders.size();++i)
    {
        folders.push_back(other.folders[i]);
    }
}

static boost::shared_ptr<Resource> ResourcesManager::CreateResource(const std::string & kind)
{
    if (kind == "Image")
    {
        return boost::shared_ptr<Resource>(new ImageResource);
    }

    std::cout << "Bad resource created ( type: " << kind << ")" << std::endl;
    return boost::shared_ptr<Resource>(new ImageResource);
}

virtual void ResourcesManager::LoadFromXml(const TiXmlElement * elem)
{
    const TiXmlElement * resourcesElem = elem->FirstChildElement("Resources");
    const TiXmlElement * resourceElem = resourcesEleme ? resourcesEleme->FirstChildElement("Resource") : NULL;
    while ( resourceElem )
    {
        std::string kind = resourceElem->Attribute("kind") ? resourceElem->Attribute("kind") : "";
        std::string name = resourceElem->Attribute("name") ? resourceElem->Attribute("name") : "";

        boost::shared_ptr<Resource> resource = CreateResource(kind);
        resource->name = name;
        resource->LoadFromXml(resourceElem);

        resources.push_back(resource);
        resourceElem = resourceElem->NextSiblingElement();
    }

    const TiXmlElement * resourceFoldersElem = elem->FirstChildElement("ResourceFolders");
    const TiXmlElement * resourceFolderElem  = resourceFoldersElem ? resourceFoldersElem->FirstChildElement() : NULL;
    while ( resourceFolderElem )
    {
        ResourceFolder folder;
        folder.LoadFromXml(resourceFolderElem);

        folders.push_back(folder);
        resourceFolderElem = resourceFolderElem->NextSiblingElement();
    }
}

#if defined(GD_IDE_ONLY)
virtual void ResourcesManager::SaveToXml(TiXmlElement * elem)
{
    TiXmlElement * resourcesElem = new TiXmlElement( "Resources" );
    elem->LinkEndChild(resourcesElem);
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i] == boost::shared_ptr<Resource>() ) break;

        TiXmlElement * resourceElem = new TiXmlElement( "Resource" );
        resourcesElem->LinkEndChild(resourceElem);

        resourceElem->SetAttribute("kind", resources[i]->kind.c_str());
        resourceElem->SetAttribute("name", resources[i]->name.c_str());

        resource->SaveToXml(resourceElem);
    }

    const TiXmlElement * resourceFoldersElem = elem->FirstChildElement("ResourceFolders");
    const TiXmlElement * resourceFolderElem  = resourceFoldersElem ? resourceFoldersElem->FirstChildElement() : NULL;
    while ( resourceFolderElem )
    {
        ResourceFolder folder;
        folder.LoadFromXml(resourceFolderElem);

        folders.push_back(folder);
        resourceFolderElem = resourceFolderElem->NextSiblingElement();
    }
}
#endif

virtual void ImageResource::LoadFromXml(const TiXmlElement * elem)
{
    alwaysLoaded = elem->Attribute("alwaysLoaded") ? (std::string(elem->Attribute("alwaysLoaded")) == "true" ) : false;
    smooth = elem->Attribute("smoothed") ? (std::string(elem->Attribute("smoothed")) != "false" ) : true;
    smooth = elem->Attribute("userAdded") ? (std::string(elem->Attribute("userAdded")) != "false" ) : true;
}

#if defined(GD_IDE_ONLY)
virtual void ResourcesManager::SaveToXml(TiXmlElement * elem)
{
    elem->SetAttribute("alwaysLoaded", alwaysLoaded ? "true", "false");
    elem->SetAttribute("smoothed", smoothed ? "true", "false");
    elem->SetAttribute("userAdded", userAdded ? "true", "false");
}
#endif


ResourceFolder::ResourceFolder(const ResourceFolder & other)
{
    Init(other);
}

ResourceFolder& ResourceFolder::operator=(const ResourceFolder & other)
{
    if ( this != &other )
        Init(other);

    return *this;
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

ResourcesManager::ResourcesManager()
{
    //ctor
}

ResourcesManager::~ResourcesManager()
{
    //dtor
}
