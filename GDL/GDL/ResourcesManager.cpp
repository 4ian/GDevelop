/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/ResourcesManager.h"
#include "GDL/CommonTools.h"
#include "GDL/tinyxml/tinyxml.h"
#include <iostream>
#if defined(GD_IDE_ONLY)
#include <wx/filedlg.h>
#include <wx/panel.h>
#include <wx/log.h>
#include <wx/dcclient.h>
#include <wx/file.h>
#include <wx/filename.h>
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDCore/PlatformDefinition/Project.h"
#endif

Resource ResourcesManager::badResource;
#if defined(GD_IDE_ONLY)
ResourceFolder ResourcesManager::badFolder;
Resource ResourceFolder::badResource;
#endif

#if defined(GD_IDE_ONLY)
void ResourceFolder::Init(const ResourceFolder & other)
{
    name = other.name;

    resources.clear();
    for (unsigned int i = 0;i<other.resources.size();++i)
    {
        resources.push_back(boost::shared_ptr<Resource>(other.resources[i]->Clone()));
    }
}
#endif

void ResourcesManager::Init(const ResourcesManager & other)
{
    resources.clear();
    for (unsigned int i = 0;i<other.resources.size();++i)
    {
        resources.push_back(boost::shared_ptr<Resource>(other.resources[i]->Clone()));
    }
#if defined(GD_IDE_ONLY)
    folders.clear();
    for (unsigned int i = 0;i<other.folders.size();++i)
    {
        folders.push_back(other.folders[i]);
    }
#endif
}

Resource & ResourcesManager::GetResource(const std::string & name)
{
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i]->GetName() == name )
            return *resources[i];
    }

    return badResource;
}

const Resource & ResourcesManager::GetResource(const std::string & name) const
{
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i]->GetName() == name )
            return *resources[i];
    }

    return badResource;
}

boost::shared_ptr<Resource> ResourcesManager::CreateResource(const std::string & kind)
{
    if (kind == "image")
    {
        return boost::shared_ptr<Resource>(new ImageResource);
    }

    std::cout << "Bad resource created ( type: " << kind << ")" << std::endl;
    return boost::shared_ptr<Resource>(new Resource);
}

bool ResourcesManager::HasResource(const std::string & name) const
{
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i]->GetName() == name )
            return true;
    }

    return false;
}

std::vector<std::string> ResourcesManager::GetAllResourcesList()
{
    std::vector<std::string> allResources;
    for (unsigned int i = 0;i<resources.size();++i)
        allResources.push_back(resources[i]->GetName());

    return allResources;
}


#if defined(GD_IDE_ONLY)
bool ResourcesManager::AddResource(const gd::Resource & resource)
{
    if ( HasResource(resource.GetName()) ) return false;

    try
    {
        const Resource & castedResource = dynamic_cast<const Resource&>(resource);
        boost::shared_ptr<Resource> newResource = boost::shared_ptr<Resource>(castedResource.Clone());
        if ( newResource == boost::shared_ptr<Resource>() ) return false;

        resources.push_back(newResource);
    }
    catch(...) { std::cout << "WARNING: Tried to add a resource which is not a GD C++ Platform Resource to a GD C++ Platform project"; std::cout << char(7); }

    return true;
}

bool ResourcesManager::AddResource(const std::string & name, const std::string & filename)
{
    if ( HasResource(name) ) return false;

    boost::shared_ptr<ImageResource> image(new ImageResource);
    image->GetFile() = filename;
    image->SetName(name);

    resources.push_back(image);

    return true;
}

std::vector<std::string> ResourceFolder::GetAllResourcesList()
{
    std::vector<std::string> allResources;
    for (unsigned int i = 0;i<resources.size();++i)
        allResources.push_back(resources[i]->GetName());

    return allResources;
}

bool ImageResource::EditProperty(gd::Project & project, const std::string & property)
{
    /*if ( property == "file" )
    {
        wxFileDialog dialog( NULL, _( "Choose the image file" ), "", "", _("Supported image files|*.bmp;*.gif;*.jpg;*.png;*.tga;*.dds|All files|*.*"), wxFD_OPEN );
        if ( dialog.ShowModal() == wxID_OK )
        {
            wxFileName filename = wxFileName::FileName(dialog.GetPath());
            filename.MakeRelativeTo(wxFileName::FileName(project.GetProjectFile()).GetPath());
            file = ToString(filename.GetFullPath());

            return true;
        }
    }*/

    return false;
}

bool ImageResource::ChangeProperty(gd::Project & project, const std::string & property, const std::string & newValue)
{
    if ( property == "smooth" )
        smooth = (newValue == _("Yes"));
    else if ( property == "alwaysLoaded" )
        alwaysLoaded = (newValue == _("Yes"));

    return true;
}

void ImageResource::GetPropertyInformation(gd::Project & project, const std::string & property, wxString & userFriendlyName, wxString & description) const
{
    if ( property == "smooth" )
    {
        userFriendlyName = _("Smooth the image");
        description = _("Set this to \"Yes\" to set a smooth filter on the image");
    }
    else if ( property == "alwaysLoaded" )
    {
        userFriendlyName = _("Always loaded in memory");
        description = _("Set this to \"Yes\" to let the image always loaded in memory.\nUseful when the image is used by actions.");
    }
}

std::string ImageResource::GetProperty(gd::Project & project, const std::string & property)
{
    if ( property == "smooth" )
    {
        return ToString(smooth ? _("Yes") : _("No"));
    }
    else if ( property == "alwaysLoaded" )
    {
        return ToString(alwaysLoaded ? _("Yes") : _("No"));
    }

    return "";
}

/**
 * Return a vector containing the name of all the properties of the resource
 */
std::vector<std::string> ImageResource::GetAllProperties(gd::Project & project) const
{
    std::vector<std::string> allProperties;
    allProperties.push_back("smooth");
    allProperties.push_back("alwaysLoaded");

    return allProperties;
}

void ImageResource::RenderPreview(wxPaintDC & dc, wxPanel & previewPanel, gd::Project & project)
{
    wxLogNull noLog; //We take care of errors.

    wxSize size = previewPanel.GetSize();

    //Checkerboard background
    dc.SetBrush(gd::CommonBitmapManager::GetInstance()->transparentBg);
    dc.DrawRectangle(0,0, size.GetWidth(), size.GetHeight());

    wxString fullFilename = GetAbsoluteFile(project);

    if ( !wxFile::Exists(fullFilename) )
        return;

    wxBitmap bmp( fullFilename, wxBITMAP_TYPE_ANY);
    if ( bmp.GetWidth() != 0 && bmp.GetHeight() != 0 && (bmp.GetWidth() > previewPanel.GetSize().x || bmp.GetHeight() > previewPanel.GetSize().y) )
    {
        //Rescale to fit in previewPanel
        float xFactor = static_cast<float>(previewPanel.GetSize().x)/static_cast<float>(bmp.GetWidth());
        float yFactor = static_cast<float>(previewPanel.GetSize().y)/static_cast<float>(bmp.GetHeight());
        float factor = std::min(xFactor, yFactor);

        wxImage image = bmp.ConvertToImage();
        if ( bmp.GetWidth()*factor >= 5 && bmp.GetHeight()*factor >= 5)
            bmp = wxBitmap(image.Scale(bmp.GetWidth()*factor, bmp.GetHeight()*factor));
    }

    //Display image in the center
    if ( bmp.IsOk() )
        dc.DrawBitmap(bmp,
                      (size.GetWidth() - bmp.GetWidth()) / 2,
                      (size.GetHeight() - bmp.GetHeight()) / 2,
                      true /* use mask */);
}

Resource & ResourceFolder::GetResource(const std::string & name)
{
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i]->GetName() == name )
            return *resources[i];
    }

    return badResource;
}

const Resource & ResourceFolder::GetResource(const std::string & name) const
{
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i]->GetName() == name )
            return *resources[i];
    }

    return badResource;
}

namespace
{
bool MoveResourceUpInList(std::vector< boost::shared_ptr<Resource> > & resources, const std::string & name)
{
    unsigned int index = std::string::npos;
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i]->GetName() == name)
        {
            index = i;
            break;
        }
    }

    if ( index < resources.size() && index > 0 )
    {
        swap (resources[index], resources[index-1]);
        return true;
    }

    return false;
}

bool MoveResourceDownInList(std::vector< boost::shared_ptr<Resource> > & resources, const std::string & name)
{
    unsigned int index = std::string::npos;
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i]->GetName() == name)
        {
            index = i;
            break;
        }
    }

    if ( index < resources.size()-1 )
    {
        swap (resources[index], resources[index+1]);
        return true;
    }

    return false;
}


}

bool ResourceFolder::MoveResourceUpInList(const std::string & name)
{
    return ::MoveResourceUpInList(resources, name);
}

bool ResourceFolder::MoveResourceDownInList(const std::string & name)
{
    return ::MoveResourceDownInList(resources, name);
}

bool ResourcesManager::MoveResourceUpInList(const std::string & name)
{
    return ::MoveResourceUpInList(resources, name);
}

bool ResourcesManager::MoveResourceDownInList(const std::string & name)
{
    return ::MoveResourceDownInList(resources, name);
}

bool ResourcesManager::MoveFolderUpInList(const std::string & name)
{
    for (unsigned int i =1;i<folders.size();++i)
    {
        if ( folders[i].GetName() == name )
        {
            std::swap(folders[i], folders[i-1]);
            return true;
        }
    }

    return false;
}

bool ResourcesManager::MoveFolderDownInList(const std::string & name)
{
    for (unsigned int i =0;i<folders.size()-1;++i)
    {
        if ( folders[i].GetName() == name )
        {
            std::swap(folders[i], folders[i+1]);
            return true;
        }
    }

    return false;
}

boost::shared_ptr<gd::Resource> ResourcesManager::GetResourceSPtr(const std::string & name)
{
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i]->GetName() == name )
            return resources[i];
    }

    return boost::shared_ptr<gd::Resource>();
}

bool ResourcesManager::HasFolder(const std::string & name) const
{
    for (unsigned int i = 0;i<folders.size();++i)
    {
        if ( folders[i].GetName() == name )
            return true;
    }

    return false;
}

const ResourceFolder & ResourcesManager::GetFolder(const std::string & name) const
{
    for (unsigned int i = 0;i<folders.size();++i)
    {
        if ( folders[i].GetName() == name )
            return folders[i];
    }

    return badFolder;
}

ResourceFolder & ResourcesManager::GetFolder(const std::string & name)
{
    for (unsigned int i = 0;i<folders.size();++i)
    {
        if ( folders[i].GetName() == name )
            return folders[i];
    }

    return badFolder;
}

void ResourcesManager::RemoveFolder(const std::string & name)
{
    for (unsigned int i = 0;i<folders.size();)
    {
        if ( folders[i].GetName() == name )
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
    newFolder.SetName(name);

    folders.push_back(newFolder);
}

std::vector<std::string> ResourcesManager::GetAllFolderList()
{
    std::vector<std::string> allFolders;
    for (unsigned int i =0;i<folders.size();++i)
        allFolders.push_back(folders[i].GetName());

    return allFolders;
}

bool ResourceFolder::HasResource(const std::string & name) const
{
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i]->GetName() == name )
            return true;
    }

    return false;
}

void ResourceFolder::AddResource(const std::string & name, gd::ResourcesManager & parentManager)
{
    try
    {
        ResourcesManager & manager = dynamic_cast<ResourcesManager &>(parentManager);
        boost::shared_ptr<Resource> resource = boost::dynamic_pointer_cast<Resource>(manager.GetResourceSPtr(name));
        if ( resource != boost::shared_ptr<Resource>())
            resources.push_back(resource);
    }
    catch(...)
    {
        std::cout << "Warning: A resources manager which is not part of GD C++ Platform was used during call to AddResource" << std::endl;
    }
}

void ResourcesManager::RenameResource(const std::string & oldName, const std::string & newName)
{
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i]->GetName() == oldName )
            resources[i]->SetName(newName);
    }
}

void ResourceFolder::RemoveResource(const std::string & name)
{
    for (unsigned int i = 0;i<resources.size();)
    {
        if (resources[i] != boost::shared_ptr<Resource>() && resources[i]->GetName() == name)
            resources.erase(resources.begin()+i);
        else
            ++i;
    }
}

void ResourcesManager::RemoveResource(const std::string & name)
{
    for (unsigned int i = 0;i<resources.size();)
    {
        if (resources[i] != boost::shared_ptr<Resource>() && resources[i]->GetName() == name)
            resources.erase(resources.begin()+i);
        else
            ++i;
    }

    for (unsigned int i = 0;i<folders.size();++i)
        folders[i].RemoveResource(name);
}
#endif


#if defined(GD_IDE_ONLY)
/**
 * Load an xml element.
 */
void ResourceFolder::LoadFromXml(const TiXmlElement * elem, gd::ResourcesManager & parentManager)
{
    if (!elem) return;

    name = elem->Attribute("name") ? elem->Attribute("name") : "";

    const TiXmlElement * resourcesElem = elem->FirstChildElement("Resources");
    const TiXmlElement * resourceElem = resourcesElem ? resourcesElem->FirstChildElement("Resource") : NULL;
    while ( resourceElem )
    {
        std::string resName = resourceElem->Attribute("name") ? resourceElem->Attribute("name") : "";
        AddResource(resName, parentManager);

        resourceElem = resourceElem->NextSiblingElement();
    }
}

/**
 * Save to an xml element.
 */
void ResourceFolder::SaveToXml(TiXmlElement * elem) const
{
    if (!elem) return;

    elem->SetAttribute("name", name.c_str());

    TiXmlElement * resourcesElem = new TiXmlElement( "Resources" );
    elem->LinkEndChild(resourcesElem);
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i] == boost::shared_ptr<Resource>() ) break;

        TiXmlElement * resourceElem = new TiXmlElement( "Resource" );
        resourcesElem->LinkEndChild(resourceElem);

        resourceElem->SetAttribute("name", resources[i]->GetName().c_str());
    }
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
        resource->SetName(name);
        resource->LoadFromXml(resourceElem);

        resources.push_back(resource);
        resourceElem = resourceElem->NextSiblingElement();
    }

    #if defined(GD_IDE_ONLY)
    const TiXmlElement * resourceFoldersElem = elem->FirstChildElement("ResourceFolders");
    const TiXmlElement * resourceFolderElem  = resourceFoldersElem ? resourceFoldersElem->FirstChildElement() : NULL;
    while ( resourceFolderElem )
    {
        ResourceFolder folder;
        folder.LoadFromXml(resourceFolderElem, *this);

        folders.push_back(folder);
        resourceFolderElem = resourceFolderElem->NextSiblingElement();
    }
    #endif
}

#if defined(GD_IDE_ONLY)
void ResourcesManager::SaveToXml(TiXmlElement * elem) const
{
    if (!elem) return;

    TiXmlElement * resourcesElem = new TiXmlElement( "Resources" );
    elem->LinkEndChild(resourcesElem);
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i] == boost::shared_ptr<Resource>() ) break;

        TiXmlElement * resourceElem = new TiXmlElement( "Resource" );
        resourcesElem->LinkEndChild(resourceElem);

        resourceElem->SetAttribute("kind", resources[i]->GetKind().c_str());
        resourceElem->SetAttribute("name", resources[i]->GetName().c_str());

        resources[i]->SaveToXml(resourceElem);
    }

    TiXmlElement * resourceFoldersElem = new TiXmlElement( "ResourceFolders" );
    elem->LinkEndChild(resourceFoldersElem);
    for (unsigned int i = 0;i<folders.size();++i)
    {
        TiXmlElement * folderElem = new TiXmlElement( "Folder" );
        resourceFoldersElem->LinkEndChild(folderElem);

        folders[i].SaveToXml(folderElem);
    }
}
#endif

void ImageResource::LoadFromXml(const TiXmlElement * elem)
{
    alwaysLoaded = elem->Attribute("alwaysLoaded") ? (std::string(elem->Attribute("alwaysLoaded")) == "true" ) : false;
    smooth = elem->Attribute("smoothed") ? (std::string(elem->Attribute("smoothed")) != "false" ) : true;
    SetUserAdded( elem->Attribute("userAdded") ? (std::string(elem->Attribute("userAdded")) != "false" ) : true );
    GetFile() = elem->Attribute("file") ? elem->Attribute("file") : "";
}

#if defined(GD_IDE_ONLY)
void ImageResource::SaveToXml(TiXmlElement * elem) const
{
    elem->SetAttribute("alwaysLoaded", alwaysLoaded ? "true" : "false");
    elem->SetAttribute("smoothed", smooth ? "true" : "false");
    elem->SetAttribute("userAdded", IsUserAdded() ? "true" : "false");
    elem->SetAttribute("file", GetFile().c_str());
}


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
#endif

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

