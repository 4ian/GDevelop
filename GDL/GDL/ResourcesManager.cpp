#include "GDL/ResourcesManager.h"
#include "GDL/PropImage.h"
#include "GDL/CommonTools.h"
#include "GDL/tinyxml.h"
#include <iostream>
#if defined(GD_IDE_ONLY)
#include <wx/filedlg.h>
#include <wx/panel.h>
#include <wx/log.h>
#include <wx/dcclient.h>
#include <wx/file.h>
#include "GDL/BitmapGUIManager.h"
#endif

std::string Resource::badStr;
ResourceFolder ResourcesManager::badFolder;
Resource ResourcesManager::badResource;

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

#if defined(GD_IDE_ONLY)
bool ImageResource::EditMainProperty()
{
    wxFileDialog dialog( NULL, _( "Choisissez le fichier de l'image" ), "", "", _("Images supportées|*.bmp;*.gif;*.jpg;*.png;*.tga;*.dds|Tous les fichiers|*.*"), wxFD_OPEN );
    if ( dialog.ShowModal() == wxID_OK )
    {
        file = ToString(dialog.GetPath());

        return true;
    }

    return false;
}

std::string ImageResource::GetMainPropertyDescription()
{
    return ToString(_("Fichier de l'image"));
}

bool ImageResource::EditResource()
{
    PropImage dialog(NULL, *this);
    if ( dialog.ShowModal() == 1 )
        return true;

    return false;
}

void ImageResource::RenderPreview(wxPaintDC & dc, wxPanel & previewPanel)
{
    wxLogNull noLog; //We take care of errors.

    wxSize size = previewPanel.GetSize();

    //Fond en damier
    dc.SetBrush(BitmapGUIManager::GetInstance()->transparentBg);
    dc.DrawRectangle(0,0, size.GetWidth(), size.GetHeight());

    if ( !wxFile::Exists(file) )
        return;

    wxBitmap bmp( file, wxBITMAP_TYPE_ANY);
    if ( bmp.GetWidth() > previewPanel.GetSize().x || bmp.GetHeight() > previewPanel.GetSize().y )
    {
        //Rescale to fit in previewPanel
        float xFactor = static_cast<float>(previewPanel.GetSize().x)/static_cast<float>(bmp.GetWidth());
        float yFactor = static_cast<float>(previewPanel.GetSize().y)/static_cast<float>(bmp.GetHeight());
        float factor = std::min(xFactor, yFactor);

        wxImage image = bmp.ConvertToImage();
        bmp = wxBitmap(image.Scale(bmp.GetWidth()*factor, bmp.GetHeight()*factor));
    }

    //Display image in the center
    if ( bmp.IsOk() )
        dc.DrawBitmap(bmp,
                      (size.GetWidth() - bmp.GetWidth()) / 2,
                      (size.GetHeight() - bmp.GetHeight()) / 2,
                      true /* use mask */);
}
#endif

Resource & ResourcesManager::GetResource(const std::string & name)
{
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i]->name == name )
            return *resources[i];
    }

    return badResource;
}

const Resource & ResourcesManager::GetResource(const std::string & name) const
{
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i]->name == name )
            return *resources[i];
    }

    return badResource;
}

boost::shared_ptr<Resource> ResourcesManager::GetResourceSPtr(const std::string & name)
{
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i]->name == name )
            return resources[i];
    }

    return boost::shared_ptr<Resource>();
}

bool ResourceFolder::HasResource(const std::string & name) const
{
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i]->name == name )
            return true;
    }

    return false;
}

void ResourceFolder::AddResource(const std::string & name, std::vector< boost::shared_ptr<Resource> > & alreadyExistingResources)
{
    for (unsigned int i = 0;i<alreadyExistingResources.size();++i)
    {
        if ( alreadyExistingResources[i] != boost::shared_ptr<Resource>() && alreadyExistingResources[i]->name == name)
        {
            resources.push_back(alreadyExistingResources[i]);
            return;
        }
    }
}

bool ResourcesManager::HasResource(const std::string & name) const
{
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i]->name == name )
            return true;
    }

    return false;
}

void ResourcesManager::RenameResource(const std::string & oldName, const std::string & newName)
{
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i]->name == oldName )
            resources[i]->name = newName;
    }
}

void ResourceFolder::RemoveResource(const std::string & name)
{
    for (unsigned int i = 0;i<resources.size();)
    {
        if (resources[i] != boost::shared_ptr<Resource>() && resources[i]->name == name)
            resources.erase(resources.begin()+i);
        else
            ++i;
    }
}

void ResourcesManager::RemoveResource(const std::string & name)
{
    for (unsigned int i = 0;i<resources.size();)
    {
        if (resources[i] != boost::shared_ptr<Resource>() && resources[i]->name == name)
            resources.erase(resources.begin()+i);
        else
            ++i;
    }

    for (unsigned int i = 0;i<folders.size();++i)
        folders[i].RemoveResource(name);
}

boost::shared_ptr<Resource> ResourcesManager::CreateResource(const std::string & kind)
{
    if (kind == "image")
    {
        return boost::shared_ptr<Resource>(new ImageResource);
    }

    std::cout << "Bad resource created ( type: " << kind << ")" << std::endl;
    return boost::shared_ptr<Resource>(new ImageResource);
}

bool ResourcesManager::HasFolder(const std::string & name) const
{
    for (unsigned int i = 0;i<folders.size();++i)
    {
        if ( folders[i].name == name )
            return true;
    }

    return false;
}

const ResourceFolder & ResourcesManager::GetFolder(const std::string & name) const
{
    for (unsigned int i = 0;i<folders.size();++i)
    {
        if ( folders[i].name == name )
            return folders[i];
    }

    return badFolder;
}

ResourceFolder & ResourcesManager::GetFolder(const std::string & name)
{
    for (unsigned int i = 0;i<folders.size();++i)
    {
        if ( folders[i].name == name )
            return folders[i];
    }

    return badFolder;
}

void ResourcesManager::RemoveFolder(const std::string & name)
{
    for (unsigned int i = 0;i<folders.size();)
    {
        if ( folders[i].name == name )
        {
            folders.erase(folders.begin()+i);
        }
        else
            ++i;
    }
}

void ResourcesManager::CreateFolder(const std::string & name)
{
    ResourceFolder newFolder;
    newFolder.name = name;

    folders.push_back(newFolder);
}

/**
 * Load an xml element.
 */
void ResourceFolder::LoadFromXml(const TiXmlElement * elem)
{
    //TODO
}

#if defined(GD_IDE_ONLY)
/**
 * Save to an xml element.
 */
void ResourceFolder::SaveToXml(TiXmlElement * elem)
{
    //TODO
}
#endif

void ResourcesManager::LoadFromXml(const TiXmlElement * elem)
{
    if (!elem) return;

    const TiXmlElement * resourcesElem = elem->FirstChildElement("Resources");
    const TiXmlElement * resourceElem = resourcesElem ? resourcesElem->FirstChildElement("Resource") : NULL;
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
void ResourcesManager::SaveToXml(TiXmlElement * elem)
{
    if (!elem) return;

    TiXmlElement * resourcesElem = new TiXmlElement( "Resources" );
    elem->LinkEndChild(resourcesElem);
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i] == boost::shared_ptr<Resource>() ) break;

        TiXmlElement * resourceElem = new TiXmlElement( "Resource" );
        resourcesElem->LinkEndChild(resourceElem);

        resourceElem->SetAttribute("kind", resources[i]->kind.c_str());
        resourceElem->SetAttribute("name", resources[i]->name.c_str());

        resources[i]->SaveToXml(resourceElem);
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

void ImageResource::LoadFromXml(const TiXmlElement * elem)
{
    alwaysLoaded = elem->Attribute("alwaysLoaded") ? (std::string(elem->Attribute("alwaysLoaded")) == "true" ) : false;
    smooth = elem->Attribute("smoothed") ? (std::string(elem->Attribute("smoothed")) != "false" ) : true;
    smooth = elem->Attribute("userAdded") ? (std::string(elem->Attribute("userAdded")) != "false" ) : true;
}

#if defined(GD_IDE_ONLY)
void ImageResource::SaveToXml(TiXmlElement * elem)
{
    elem->SetAttribute("alwaysLoaded", alwaysLoaded ? "true" : "false");
    elem->SetAttribute("smoothed", smooth ? "true" : "false");
    elem->SetAttribute("userAdded", userAdded ? "true" : "false");
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
