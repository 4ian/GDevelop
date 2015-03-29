/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include <iostream>
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "GDCore/IDE/CommonBitmapManager.h"
#include <wx/filedlg.h>
#include <wx/panel.h>
#include <wx/dcclient.h>
#include <wx/file.h>
#include <wx/filename.h>
#endif
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/ResourcesManager.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Utf8Tools.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"

namespace gd
{

std::string Resource::badStr;

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
        resources.push_back(std::shared_ptr<Resource>(other.resources[i]->Clone()));
    }
}
#endif

void ResourcesManager::Init(const ResourcesManager & other)
{
    resources.clear();
    for (unsigned int i = 0;i<other.resources.size();++i)
    {
        resources.push_back(std::shared_ptr<Resource>(other.resources[i]->Clone()));
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

std::shared_ptr<Resource> ResourcesManager::CreateResource(const std::string & kind)
{
    if (kind == "image")
    {
        return std::shared_ptr<Resource>(new ImageResource);
    }

    std::cout << "Bad resource created ( type: " << kind << ")" << std::endl;
    return std::shared_ptr<Resource>(new Resource);
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
        std::shared_ptr<Resource> newResource = std::shared_ptr<Resource>(castedResource.Clone());
        if ( newResource == std::shared_ptr<Resource>() ) return false;

        resources.push_back(newResource);
    }
    catch(...) { std::cout << "WARNING: Tried to add a resource which is not a GD C++ Platform Resource to a GD C++ Platform project"; std::cout << char(7); }

    return true;
}

bool ResourcesManager::AddResource(const std::string & name, const std::string & filename)
{
    if ( HasResource(name) ) return false;

    std::shared_ptr<ImageResource> image(new ImageResource);
    image->SetFile(filename);
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
    return false;
}

bool ImageResource::ChangeProperty(gd::Project & project, const std::string & property, const std::string & newValue)
{
    if ( property == "smooth" )
        smooth = (newValue == GD_T("Yes"));
    else if ( property == "alwaysLoaded" )
        alwaysLoaded = (newValue == GD_T("Yes"));

    return true;
}

void ImageResource::GetPropertyInformation(gd::Project & project, const std::string & property, std::string & userFriendlyName, std::string & description) const
{
    if ( property == "smooth" )
    {
        userFriendlyName = GD_T("Smooth the image");
        description = GD_T("Set this to \"Yes\" to set a smooth filter on the image");
    }
    else if ( property == "alwaysLoaded" )
    {
        userFriendlyName = GD_T("Always loaded in memory");
        description = GD_T("Set this to \"Yes\" to let the image always loaded in memory.\nUseful when the image is used by actions.");
    }
}

std::string ImageResource::GetProperty(gd::Project & project, const std::string & property)
{
    if ( property == "smooth" )
    {
        return ToString(smooth ? GD_T("Yes") : GD_T("No"));
    }
    else if ( property == "alwaysLoaded" )
    {
        return ToString(alwaysLoaded ? GD_T("Yes") : GD_T("No"));
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

#if !defined(GD_NO_WX_GUI)
void ImageResource::RenderPreview(wxPaintDC & dc, wxPanel & previewPanel, gd::Project & project)
{
    wxLogNull noLog; //We take care of errors.

    wxSize size = previewPanel.GetSize();

    //Checkerboard background
    dc.SetBrush(gd::CommonBitmapManager::Get()->transparentBg);
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
bool MoveResourceUpInList(std::vector< std::shared_ptr<Resource> > & resources, const std::string & name)
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

bool MoveResourceDownInList(std::vector< std::shared_ptr<Resource> > & resources, const std::string & name)
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

std::string Resource::GetAbsoluteFile(const gd::Project & project) const
{
#if !defined(GD_NO_WX_GUI)
    wxString projectDir = wxFileName::FileName(project.GetProjectFile()).GetPath();
    wxFileName filename = wxFileName::FileName(GetFile());
    filename.MakeAbsolute(projectDir);
    return ToString(filename.GetFullPath());
#else
    gd::LogWarning("BAD USE: Resource::GetAbsoluteFile called when compiled with no support for wxWidgets");
    return GetFile();
#endif
}

bool ResourceFolder::MoveResourceUpInList(const std::string & name)
{
    return gd::MoveResourceUpInList(resources, name);
}

bool ResourceFolder::MoveResourceDownInList(const std::string & name)
{
    return gd::MoveResourceDownInList(resources, name);
}

bool ResourcesManager::MoveResourceUpInList(const std::string & name)
{
    return gd::MoveResourceUpInList(resources, name);
}

bool ResourcesManager::MoveResourceDownInList(const std::string & name)
{
    return gd::MoveResourceDownInList(resources, name);
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

std::shared_ptr<gd::Resource> ResourcesManager::GetResourceSPtr(const std::string & name)
{
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i]->GetName() == name )
            return resources[i];
    }

    return std::shared_ptr<gd::Resource>();
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
        std::shared_ptr<Resource> resource = std::dynamic_pointer_cast<Resource>(manager.GetResourceSPtr(name));
        if ( resource != std::shared_ptr<Resource>())
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
        if (resources[i] != std::shared_ptr<Resource>() && resources[i]->GetName() == name)
            resources.erase(resources.begin()+i);
        else
            ++i;
    }
}

void ResourcesManager::RemoveResource(const std::string & name)
{
    for (unsigned int i = 0;i<resources.size();)
    {
        if (resources[i] != std::shared_ptr<Resource>() && resources[i]->GetName() == name)
            resources.erase(resources.begin()+i);
        else
            ++i;
    }

    for (unsigned int i = 0;i<folders.size();++i)
        folders[i].RemoveResource(name);
}
#endif


#if defined(GD_IDE_ONLY)
void ResourceFolder::UnserializeFrom(const SerializerElement & element, gd::ResourcesManager & parentManager)
{
    name = utf8::ToLocaleString(element.GetStringAttribute("name"));

    SerializerElement & resourcesElement = element.GetChild("resources", 0, "Resources");
    resourcesElement.ConsiderAsArrayOf("resource", "Resource");
    for(unsigned int i = 0;i<resourcesElement.GetChildrenCount();++i)
        AddResource(utf8::ToLocaleString(resourcesElement.GetChild(i).GetStringAttribute("name")), parentManager);
}

void ResourceFolder::SerializeTo(SerializerElement & element) const
{
    element.SetAttribute("name", utf8::FromLocaleString(name));

    SerializerElement & resourcesElement = element.AddChild("resources");
    resourcesElement.ConsiderAsArrayOf("resource");
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i] == std::shared_ptr<Resource>() ) continue;
        resourcesElement.AddChild("resource").SetAttribute("name", utf8::FromLocaleString(resources[i]->GetName()));
    }
}
#endif

void ResourcesManager::UnserializeFrom(const SerializerElement & element)
{
    const SerializerElement & resourcesElement = element.GetChild("resources", 0, "Resources");
    resourcesElement.ConsiderAsArrayOf("resource", "Resource");
    for(unsigned int i = 0;i<resourcesElement.GetChildrenCount();++i)
    {
        const SerializerElement & resourceElement = resourcesElement.GetChild(i);
        std::string kind = utf8::ToLocaleString(resourceElement.GetStringAttribute("kind"));
        std::string name = utf8::ToLocaleString(resourceElement.GetStringAttribute("name"));

        std::shared_ptr<Resource> resource = CreateResource(kind);
        resource->SetName(name);
        resource->UnserializeFrom(resourceElement);

        resources.push_back(resource);
    }

    #if defined(GD_IDE_ONLY)
    const SerializerElement & resourcesFoldersElement = element.GetChild("resourceFolders", 0, "ResourceFolders");
    resourcesFoldersElement.ConsiderAsArrayOf("folder", "Folder");
    for(unsigned int i = 0;i<resourcesFoldersElement.GetChildrenCount();++i)
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
    for (unsigned int i = 0;i<resources.size();++i)
    {
        if ( resources[i] == std::shared_ptr<Resource>() ) break;

        SerializerElement & resourceElement = resourcesElement.AddChild("resource");
        resourceElement.SetAttribute("kind", utf8::FromLocaleString(resources[i]->GetKind()));
        resourceElement.SetAttribute("name", utf8::FromLocaleString(resources[i]->GetName()));

        resources[i]->SerializeTo(resourceElement);
    }

    SerializerElement & resourcesFoldersElement = element.AddChild("resourceFolders");
    resourcesFoldersElement.ConsiderAsArrayOf("folder");
    for (unsigned int i = 0;i<folders.size();++i)
        folders[i].SerializeTo(resourcesFoldersElement.AddChild("folder"));
}
#endif

void ImageResource::SetFile(const std::string & newFile)
{
    file = newFile;

    //Convert all backslash to slashs.
    while (file.find('\\') != std::string::npos)
        file.replace(file.find('\\'), 1, "/");
}

void ImageResource::UnserializeFrom(const SerializerElement & element)
{
    alwaysLoaded = element.GetBoolAttribute("alwaysLoaded");
    smooth = element.GetBoolAttribute("smoothed");
    SetUserAdded( element.GetBoolAttribute("userAdded") );
    SetFile(utf8::ToLocaleString(element.GetStringAttribute("file")));
}

#if defined(GD_IDE_ONLY)
void ImageResource::SerializeTo(SerializerElement & element) const
{
    element.SetAttribute("alwaysLoaded", alwaysLoaded);
    element.SetAttribute("smoothed", smooth);
    element.SetAttribute("userAdded", IsUserAdded());
    element.SetAttribute("file", utf8::FromLocaleString(GetFile()));
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
