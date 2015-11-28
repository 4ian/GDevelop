/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include <iostream>
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "GDCore/IDE/wxTools/CommonBitmapProvider.h"
#include <wx/filedlg.h>
#include <wx/panel.h>
#include <wx/dcclient.h>
#include <wx/file.h>
#include <wx/filename.h>
#endif
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ResourcesManager.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"

namespace gd
{

gd::String Resource::badStr;

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
    for (std::size_t i = 0;i<other.resources.size();++i)
    {
        resources.push_back(std::shared_ptr<Resource>(other.resources[i]->Clone()));
    }
}
#endif

void ResourcesManager::Init(const ResourcesManager & other)
{
    resources.clear();
    for (std::size_t i = 0;i<other.resources.size();++i)
    {
        resources.push_back(std::shared_ptr<Resource>(other.resources[i]->Clone()));
    }
#if defined(GD_IDE_ONLY)
    folders.clear();
    for (std::size_t i = 0;i<other.folders.size();++i)
    {
        folders.push_back(other.folders[i]);
    }
#endif
}

Resource & ResourcesManager::GetResource(const gd::String & name)
{
    for (std::size_t i = 0;i<resources.size();++i)
    {
        if ( resources[i]->GetName() == name )
            return *resources[i];
    }

    return badResource;
}

const Resource & ResourcesManager::GetResource(const gd::String & name) const
{
    for (std::size_t i = 0;i<resources.size();++i)
    {
        if ( resources[i]->GetName() == name )
            return *resources[i];
    }

    return badResource;
}

std::shared_ptr<Resource> ResourcesManager::CreateResource(const gd::String & kind)
{
    if (kind == "image")
        return std::shared_ptr<Resource>(new ImageResource);
    else if (kind == "audio")
        return std::shared_ptr<Resource>(new AudioResource);

    std::cout << "Bad resource created (type: " << kind << ")" << std::endl;
    return std::shared_ptr<Resource>(new Resource);
}

bool ResourcesManager::HasResource(const gd::String & name) const
{
    for (std::size_t i = 0;i<resources.size();++i)
    {
        if ( resources[i]->GetName() == name )
            return true;
    }

    return false;
}

std::vector<gd::String> ResourcesManager::GetAllResourcesList()
{
    std::vector<gd::String> allResources;
    for (std::size_t i = 0;i<resources.size();++i)
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
        std::shared_ptr<Resource> newResource = std::shared_ptr<Resource>(castedResource.Clone());
        if ( newResource == std::shared_ptr<Resource>() ) return false;

        resources.push_back(newResource);
    }
    catch(...) { std::cout << "WARNING: Tried to add a resource which is not a GD C++ Platform Resource to a GD C++ Platform project"; std::cout << char(7); }

    return true;
}

bool ResourcesManager::AddResource(const gd::String & name, const gd::String & filename, const gd::String & kind)
{
    if ( HasResource(name) ) return false;

    std::shared_ptr<Resource> res = CreateResource(kind);
    res->SetFile(filename);
    res->SetName(name);

    resources.push_back(res);

    return true;
}

std::vector<gd::String> ResourceFolder::GetAllResourcesList()
{
    std::vector<gd::String> allResources;
    for (std::size_t i = 0;i<resources.size();++i)
        allResources.push_back(resources[i]->GetName());

    return allResources;
}

bool ImageResource::EditProperty(gd::Project & project, const gd::String & property)
{
    return false;
}

bool ImageResource::ChangeProperty(gd::Project & project, const gd::String & property, const gd::String & newValue)
{
    if ( property == "smooth" )
        smooth = (newValue == _("Yes"));
    else if ( property == "alwaysLoaded" )
        alwaysLoaded = (newValue == _("Yes"));

    return true;
}

void ImageResource::GetPropertyInformation(gd::Project & project, const gd::String & property, gd::String & userFriendlyName, gd::String & description) const
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

gd::String ImageResource::GetProperty(gd::Project & project, const gd::String & property)
{
    if ( property == "smooth" )
    {
        return smooth ? _("Yes") : _("No");
    }
    else if ( property == "alwaysLoaded" )
    {
        return alwaysLoaded ? _("Yes") : _("No");
    }

    return "";
}

/**
 * Return a vector containing the name of all the properties of the resource
 */
std::vector<gd::String> ImageResource::GetAllProperties(gd::Project & project) const
{
    std::vector<gd::String> allProperties;
    allProperties.push_back("smooth");
    allProperties.push_back("alwaysLoaded");

    return allProperties;
}

#if !defined(GD_NO_WX_GUI)
void ImageResource::RenderPreview(wxPaintDC & dc, wxPanel & previewPanel, gd::Project & project)
{
    wxLogNull noLog; //We take care of errors.

    wxSize size = previewPanel.GetSize();

    //Checkerboard background
    dc.SetBrush(gd::CommonBitmapProvider::Get()->transparentBg);
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

#endif

Resource & ResourceFolder::GetResource(const gd::String & name)
{
    for (std::size_t i = 0;i<resources.size();++i)
    {
        if ( resources[i]->GetName() == name )
            return *resources[i];
    }

    return badResource;
}

const Resource & ResourceFolder::GetResource(const gd::String & name) const
{
    for (std::size_t i = 0;i<resources.size();++i)
    {
        if ( resources[i]->GetName() == name )
            return *resources[i];
    }

    return badResource;
}

namespace
{
bool MoveResourceUpInList(std::vector< std::shared_ptr<Resource> > & resources, const gd::String & name)
{
    std::size_t index = gd::String::npos;
    for (std::size_t i = 0;i<resources.size();++i)
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

bool MoveResourceDownInList(std::vector< std::shared_ptr<Resource> > & resources, const gd::String & name)
{
    std::size_t index = gd::String::npos;
    for (std::size_t i = 0;i<resources.size();++i)
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

gd::String Resource::GetAbsoluteFile(const gd::Project & project) const
{
#if !defined(GD_NO_WX_GUI)
    wxString projectDir = wxFileName::FileName(project.GetProjectFile()).GetPath();
    wxFileName filename = wxFileName::FileName(GetFile());
    filename.MakeAbsolute(projectDir);
    return filename.GetFullPath();
#else
    gd::LogWarning("BAD USE: Resource::GetAbsoluteFile called when compiled with no support for wxWidgets");
    return GetFile();
#endif
}

bool ResourceFolder::MoveResourceUpInList(const gd::String & name)
{
    return gd::MoveResourceUpInList(resources, name);
}

bool ResourceFolder::MoveResourceDownInList(const gd::String & name)
{
    return gd::MoveResourceDownInList(resources, name);
}

bool ResourcesManager::MoveResourceUpInList(const gd::String & name)
{
    return gd::MoveResourceUpInList(resources, name);
}

bool ResourcesManager::MoveResourceDownInList(const gd::String & name)
{
    return gd::MoveResourceDownInList(resources, name);
}

bool ResourcesManager::MoveFolderUpInList(const gd::String & name)
{
    for (std::size_t i =1;i<folders.size();++i)
    {
        if ( folders[i].GetName() == name )
        {
            std::swap(folders[i], folders[i-1]);
            return true;
        }
    }

    return false;
}

bool ResourcesManager::MoveFolderDownInList(const gd::String & name)
{
    for (std::size_t i =0;i<folders.size()-1;++i)
    {
        if ( folders[i].GetName() == name )
        {
            std::swap(folders[i], folders[i+1]);
            return true;
        }
    }

    return false;
}

std::shared_ptr<gd::Resource> ResourcesManager::GetResourceSPtr(const gd::String & name)
{
    for (std::size_t i = 0;i<resources.size();++i)
    {
        if ( resources[i]->GetName() == name )
            return resources[i];
    }

    return std::shared_ptr<gd::Resource>();
}

bool ResourcesManager::HasFolder(const gd::String & name) const
{
    for (std::size_t i = 0;i<folders.size();++i)
    {
        if ( folders[i].GetName() == name )
            return true;
    }

    return false;
}

const ResourceFolder & ResourcesManager::GetFolder(const gd::String & name) const
{
    for (std::size_t i = 0;i<folders.size();++i)
    {
        if ( folders[i].GetName() == name )
            return folders[i];
    }

    return badFolder;
}

ResourceFolder & ResourcesManager::GetFolder(const gd::String & name)
{
    for (std::size_t i = 0;i<folders.size();++i)
    {
        if ( folders[i].GetName() == name )
            return folders[i];
    }

    return badFolder;
}

void ResourcesManager::RemoveFolder(const gd::String & name)
{
    for (std::size_t i = 0;i<folders.size();)
    {
        if ( folders[i].GetName() == name )
        {
            folders.erase(folders.begin()+i);
        }
        else
            ++i;
    }
}

void ResourcesManager::CreateFolder(const gd::String & name)
{
    ResourceFolder newFolder;
    newFolder.SetName(name);

    folders.push_back(newFolder);
}

std::vector<gd::String> ResourcesManager::GetAllFolderList()
{
    std::vector<gd::String> allFolders;
    for (std::size_t i =0;i<folders.size();++i)
        allFolders.push_back(folders[i].GetName());

    return allFolders;
}

bool ResourceFolder::HasResource(const gd::String & name) const
{
    for (std::size_t i = 0;i<resources.size();++i)
    {
        if ( resources[i]->GetName() == name )
            return true;
    }

    return false;
}

void ResourceFolder::AddResource(const gd::String & name, gd::ResourcesManager & parentManager)
{
    try
    {
        ResourcesManager & manager = dynamic_cast<ResourcesManager &>(parentManager);
        std::shared_ptr<Resource> resource = std::dynamic_pointer_cast<Resource>(manager.GetResourceSPtr(name));
        if ( resource != std::shared_ptr<Resource>())
            resources.push_back(resource);
    }
    catch(...)
    {
        std::cout << "Warning: A resources manager which is not part of GD C++ Platform was used during call to AddResource" << std::endl;
    }
}

void ResourcesManager::RenameResource(const gd::String & oldName, const gd::String & newName)
{
    for (std::size_t i = 0;i<resources.size();++i)
    {
        if ( resources[i]->GetName() == oldName )
            resources[i]->SetName(newName);
    }
}

void ResourceFolder::RemoveResource(const gd::String & name)
{
    for (std::size_t i = 0;i<resources.size();)
    {
        if (resources[i] != std::shared_ptr<Resource>() && resources[i]->GetName() == name)
            resources.erase(resources.begin()+i);
        else
            ++i;
    }
}

void ResourcesManager::RemoveResource(const gd::String & name)
{
    for (std::size_t i = 0;i<resources.size();)
    {
        if (resources[i] != std::shared_ptr<Resource>() && resources[i]->GetName() == name)
            resources.erase(resources.begin()+i);
        else
            ++i;
    }

    for (std::size_t i = 0;i<folders.size();++i)
        folders[i].RemoveResource(name);
}
#endif


#if defined(GD_IDE_ONLY)
void ResourceFolder::UnserializeFrom(const SerializerElement & element, gd::ResourcesManager & parentManager)
{
    name = element.GetStringAttribute("name");

    SerializerElement & resourcesElement = element.GetChild("resources", 0, "Resources");
    resourcesElement.ConsiderAsArrayOf("resource", "Resource");
    for(std::size_t i = 0;i<resourcesElement.GetChildrenCount();++i)
        AddResource(resourcesElement.GetChild(i).GetStringAttribute("name"), parentManager);
}

void ResourceFolder::SerializeTo(SerializerElement & element) const
{
    element.SetAttribute("name", name);

    SerializerElement & resourcesElement = element.AddChild("resources");
    resourcesElement.ConsiderAsArrayOf("resource");
    for (std::size_t i = 0;i<resources.size();++i)
    {
        if ( resources[i] == std::shared_ptr<Resource>() ) continue;
        resourcesElement.AddChild("resource").SetAttribute("name", resources[i]->GetName());
    }
}
#endif

void ResourcesManager::UnserializeFrom(const SerializerElement & element)
{
    const SerializerElement & resourcesElement = element.GetChild("resources", 0, "Resources");
    resourcesElement.ConsiderAsArrayOf("resource", "Resource");
    for(std::size_t i = 0;i<resourcesElement.GetChildrenCount();++i)
    {
        const SerializerElement & resourceElement = resourcesElement.GetChild(i);
        gd::String kind = resourceElement.GetStringAttribute("kind");
        gd::String name = resourceElement.GetStringAttribute("name");

        std::shared_ptr<Resource> resource = CreateResource(kind);
        resource->SetName(name);
        resource->UnserializeFrom(resourceElement);

        resources.push_back(resource);
    }

    #if defined(GD_IDE_ONLY)
    const SerializerElement & resourcesFoldersElement = element.GetChild("resourceFolders", 0, "ResourceFolders");
    resourcesFoldersElement.ConsiderAsArrayOf("folder", "Folder");
    for(std::size_t i = 0;i<resourcesFoldersElement.GetChildrenCount();++i)
    {
        ResourceFolder folder;
        folder.UnserializeFrom(resourcesFoldersElement.GetChild(i), *this);

        folders.push_back(folder);
    }
    #endif
}

#if defined(GD_IDE_ONLY)
void ResourcesManager::SerializeTo(SerializerElement & element) const
{
    SerializerElement & resourcesElement = element.AddChild("resources");
    resourcesElement.ConsiderAsArrayOf("resource");
    for (std::size_t i = 0;i<resources.size();++i)
    {
        if ( resources[i] == std::shared_ptr<Resource>() ) break;

        SerializerElement & resourceElement = resourcesElement.AddChild("resource");
        resourceElement.SetAttribute("kind", resources[i]->GetKind());
        resourceElement.SetAttribute("name", resources[i]->GetName());

        resources[i]->SerializeTo(resourceElement);
    }

    SerializerElement & resourcesFoldersElement = element.AddChild("resourceFolders");
    resourcesFoldersElement.ConsiderAsArrayOf("folder");
    for (std::size_t i = 0;i<folders.size();++i)
        folders[i].SerializeTo(resourcesFoldersElement.AddChild("folder"));
}
#endif

void ImageResource::SetFile(const gd::String & newFile)
{
    file = newFile;

    //Convert all backslash to slashs.
    while (file.find('\\') != gd::String::npos)
        file.replace(file.find('\\'), 1, "/");
}

void ImageResource::UnserializeFrom(const SerializerElement & element)
{
    alwaysLoaded = element.GetBoolAttribute("alwaysLoaded");
    smooth = element.GetBoolAttribute("smoothed");
    SetUserAdded( element.GetBoolAttribute("userAdded") );
    SetFile(element.GetStringAttribute("file"));
}

#if defined(GD_IDE_ONLY)
void ImageResource::SerializeTo(SerializerElement & element) const
{
    element.SetAttribute("alwaysLoaded", alwaysLoaded);
    element.SetAttribute("smoothed", smooth);
    element.SetAttribute("userAdded", IsUserAdded());
    element.SetAttribute("file", GetFile()); //Keep the resource path in the current locale (but save it in UTF8 for compatibility on other OSes)
}
#endif

void AudioResource::SetFile(const gd::String & newFile)
{
    file = newFile;

    //Convert all backslash to slashs.
    while (file.find('\\') != gd::String::npos)
        file.replace(file.find('\\'), 1, "/");
}

void AudioResource::UnserializeFrom(const SerializerElement & element)
{
    SetUserAdded( element.GetBoolAttribute("userAdded") );
    SetFile(element.GetStringAttribute("file"));
}

#if defined(GD_IDE_ONLY)
void AudioResource::SerializeTo(SerializerElement & element) const
{
    element.SetAttribute("userAdded", IsUserAdded());
    element.SetAttribute("file", GetFile()); //Keep the resource path in the current locale (but save it in UTF8 for compatibility on other OSes)
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

}
