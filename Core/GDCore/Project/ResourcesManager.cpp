/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/Project/ResourcesManager.h"

#include <iostream>
#include <map>

#include "GDCore/CommonTools.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"

namespace gd {

gd::String Resource::badStr;

Resource ResourcesManager::badResource;
gd::String ResourcesManager::badResourceName;
#if defined(GD_IDE_ONLY)
ResourceFolder ResourcesManager::badFolder;
Resource ResourceFolder::badResource;
#endif

#if defined(GD_IDE_ONLY)
void ResourceFolder::Init(const ResourceFolder& other) {
  name = other.name;

  resources.clear();
  for (std::size_t i = 0; i < other.resources.size(); ++i) {
    resources.push_back(std::shared_ptr<Resource>(other.resources[i]->Clone()));
  }
}
#endif

void ResourcesManager::Init(const ResourcesManager& other) {
  resources.clear();
  for (std::size_t i = 0; i < other.resources.size(); ++i) {
    resources.push_back(std::shared_ptr<Resource>(other.resources[i]->Clone()));
  }
#if defined(GD_IDE_ONLY)
  folders.clear();
  for (std::size_t i = 0; i < other.folders.size(); ++i) {
    folders.push_back(other.folders[i]);
  }
#endif
}

Resource& ResourcesManager::GetResource(const gd::String& name) {
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i]->GetName() == name) return *resources[i];
  }

  return badResource;
}

const Resource& ResourcesManager::GetResource(const gd::String& name) const {
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i]->GetName() == name) return *resources[i];
  }

  return badResource;
}

std::shared_ptr<Resource> ResourcesManager::CreateResource(
    const gd::String& kind) {
  if (kind == "image")
    return std::make_shared<ImageResource>();
  else if (kind == "audio")
    return std::make_shared<AudioResource>();
  else if (kind == "font")
    return std::make_shared<FontResource>();
  else if (kind == "video")
    return std::make_shared<VideoResource>();
  else if (kind == "json")
    return std::make_shared<JsonResource>();
  else if (kind == "bitmapFont")
    return std::make_shared<BitmapFontResource>();

  std::cout << "Bad resource created (type: " << kind << ")" << std::endl;
  return std::make_shared<Resource>();
}

bool ResourcesManager::HasResource(const gd::String& name) const {
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i]->GetName() == name) return true;
  }

  return false;
}

const gd::String& ResourcesManager::GetResourceNameWithOrigin(
    const gd::String& originName, const gd::String& originIdentifier) const {
  for (const auto& resource : resources) {
    if (!resource) continue;

    if (resource->GetOriginName() == originName &&
        resource->GetOriginIdentifier() == originIdentifier) {
      return resource->GetName();
    }
  }

  return badResourceName;
}

const gd::String& ResourcesManager::GetResourceNameWithFile(
    const gd::String& file) const {
  for (const auto& resource : resources) {
    if (!resource) continue;

    if (resource->GetFile() == file) {
      return resource->GetName();
    }
  }

  return badResourceName;
}

std::vector<gd::String> ResourcesManager::GetAllResourceNames() const {
  std::vector<gd::String> allResources;
  for (std::size_t i = 0; i < resources.size(); ++i)
    allResources.push_back(resources[i]->GetName());

  return allResources;
}

#if defined(GD_IDE_ONLY)
std::map<gd::String, gd::PropertyDescriptor> Resource::GetProperties() const {
  std::map<gd::String, gd::PropertyDescriptor> nothing;
  return nothing;
}

std::map<gd::String, gd::PropertyDescriptor> ImageResource::GetProperties()
    const {
  std::map<gd::String, gd::PropertyDescriptor> properties;
  properties[_("Smooth the image")]
      .SetValue(smooth ? "true" : "false")
      .SetType("Boolean");
  properties[_("Always loaded in memory")]
      .SetValue(alwaysLoaded ? "true" : "false")
      .SetType("Boolean");

  return properties;
}

bool ImageResource::UpdateProperty(const gd::String& name,
                                   const gd::String& value) {
  if (name == _("Smooth the image"))
    smooth = value == "1";
  else if (name == _("Always loaded in memory"))
    alwaysLoaded = value == "1";

  return true;
}

std::map<gd::String, gd::PropertyDescriptor> AudioResource::GetProperties() const {
  std::map<gd::String, gd::PropertyDescriptor> properties;
  properties[_("Preload as sound")]
      .SetValue(preloadAsSound ? "true" : "false")
      .SetType("Boolean");
  properties[_("Preload as music")]
      .SetValue(preloadAsMusic ? "true" : "false")
      .SetType("Boolean");

  return properties;
}

bool AudioResource::UpdateProperty(const gd::String& name,
                                   const gd::String& value) {
  if (name == _("Preload as sound"))
    preloadAsSound = value == "1";
  else if (name == _("Preload as music"))
    preloadAsMusic = value == "1";

  return true;
}

bool ResourcesManager::AddResource(const gd::Resource& resource) {
  if (HasResource(resource.GetName())) return false;

  std::shared_ptr<Resource> newResource =
      std::shared_ptr<Resource>(resource.Clone());
  if (newResource == std::shared_ptr<Resource>()) return false;

  resources.push_back(newResource);
  return true;
}

bool ResourcesManager::AddResource(const gd::String& name,
                                   const gd::String& filename,
                                   const gd::String& kind) {
  if (HasResource(name)) return false;

  std::shared_ptr<Resource> res = CreateResource(kind);
  res->SetFile(filename);
  res->SetName(name);

  resources.push_back(res);

  return true;
}

std::vector<gd::String> ResourceFolder::GetAllResourceNames() {
  std::vector<gd::String> allResources;
  for (std::size_t i = 0; i < resources.size(); ++i)
    allResources.push_back(resources[i]->GetName());

  return allResources;
}

Resource& ResourceFolder::GetResource(const gd::String& name) {
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i]->GetName() == name) return *resources[i];
  }

  return badResource;
}

const Resource& ResourceFolder::GetResource(const gd::String& name) const {
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i]->GetName() == name) return *resources[i];
  }

  return badResource;
}

namespace {
bool MoveResourceUpInList(std::vector<std::shared_ptr<Resource> >& resources,
                          const gd::String& name) {
  std::size_t index = gd::String::npos;
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i]->GetName() == name) {
      index = i;
      break;
    }
  }

  if (index < resources.size() && index > 0) {
    swap(resources[index], resources[index - 1]);
    return true;
  }

  return false;
}

bool MoveResourceDownInList(std::vector<std::shared_ptr<Resource> >& resources,
                            const gd::String& name) {
  std::size_t index = gd::String::npos;
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i]->GetName() == name) {
      index = i;
      break;
    }
  }

  if (index < resources.size() - 1) {
    swap(resources[index], resources[index + 1]);
    return true;
  }

  return false;
}

}  // namespace

bool ResourceFolder::MoveResourceUpInList(const gd::String& name) {
  return gd::MoveResourceUpInList(resources, name);
}

bool ResourceFolder::MoveResourceDownInList(const gd::String& name) {
  return gd::MoveResourceDownInList(resources, name);
}

bool ResourcesManager::MoveResourceUpInList(const gd::String& name) {
  return gd::MoveResourceUpInList(resources, name);
}

bool ResourcesManager::MoveResourceDownInList(const gd::String& name) {
  return gd::MoveResourceDownInList(resources, name);
}

std::size_t ResourcesManager::GetResourcePosition(
    const gd::String& name) const {
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i]->GetName() == name) return i;
  }
  return gd::String::npos;
}

void ResourcesManager::MoveResource(std::size_t oldIndex,
                                    std::size_t newIndex) {
  if (oldIndex >= resources.size() || newIndex >= resources.size()) return;

  auto resource = resources[oldIndex];
  resources.erase(resources.begin() + oldIndex);
  resources.insert(resources.begin() + newIndex, resource);
}

bool ResourcesManager::MoveFolderUpInList(const gd::String& name) {
  for (std::size_t i = 1; i < folders.size(); ++i) {
    if (folders[i].GetName() == name) {
      std::swap(folders[i], folders[i - 1]);
      return true;
    }
  }

  return false;
}

bool ResourcesManager::MoveFolderDownInList(const gd::String& name) {
  for (std::size_t i = 0; i < folders.size() - 1; ++i) {
    if (folders[i].GetName() == name) {
      std::swap(folders[i], folders[i + 1]);
      return true;
    }
  }

  return false;
}

std::shared_ptr<gd::Resource> ResourcesManager::GetResourceSPtr(
    const gd::String& name) {
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i]->GetName() == name) return resources[i];
  }

  return std::shared_ptr<gd::Resource>();
}

bool ResourcesManager::HasFolder(const gd::String& name) const {
  for (std::size_t i = 0; i < folders.size(); ++i) {
    if (folders[i].GetName() == name) return true;
  }

  return false;
}

const ResourceFolder& ResourcesManager::GetFolder(
    const gd::String& name) const {
  for (std::size_t i = 0; i < folders.size(); ++i) {
    if (folders[i].GetName() == name) return folders[i];
  }

  return badFolder;
}

ResourceFolder& ResourcesManager::GetFolder(const gd::String& name) {
  for (std::size_t i = 0; i < folders.size(); ++i) {
    if (folders[i].GetName() == name) return folders[i];
  }

  return badFolder;
}

void ResourcesManager::RemoveFolder(const gd::String& name) {
  for (std::size_t i = 0; i < folders.size();) {
    if (folders[i].GetName() == name) {
      folders.erase(folders.begin() + i);
    } else
      ++i;
  }
}

void ResourcesManager::CreateFolder(const gd::String& name) {
  ResourceFolder newFolder;
  newFolder.SetName(name);

  folders.push_back(newFolder);
}

std::vector<gd::String> ResourcesManager::GetAllFolderList() {
  std::vector<gd::String> allFolders;
  for (std::size_t i = 0; i < folders.size(); ++i)
    allFolders.push_back(folders[i].GetName());

  return allFolders;
}

bool ResourceFolder::HasResource(const gd::String& name) const {
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i]->GetName() == name) return true;
  }

  return false;
}

void ResourceFolder::AddResource(const gd::String& name,
                                 gd::ResourcesManager& parentManager) {
  std::shared_ptr<Resource> resource = parentManager.GetResourceSPtr(name);
  if (resource != std::shared_ptr<Resource>()) resources.push_back(resource);
}

void ResourcesManager::RenameResource(const gd::String& oldName,
                                      const gd::String& newName) {
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i]->GetName() == oldName) resources[i]->SetName(newName);
  }
}

void ResourceFolder::RemoveResource(const gd::String& name) {
  for (std::size_t i = 0; i < resources.size();) {
    if (resources[i] != std::shared_ptr<Resource>() &&
        resources[i]->GetName() == name)
      resources.erase(resources.begin() + i);
    else
      ++i;
  }
}

void ResourcesManager::RemoveResource(const gd::String& name) {
  for (std::size_t i = 0; i < resources.size();) {
    if (resources[i] != std::shared_ptr<Resource>() &&
        resources[i]->GetName() == name)
      resources.erase(resources.begin() + i);
    else
      ++i;
  }

  for (std::size_t i = 0; i < folders.size(); ++i)
    folders[i].RemoveResource(name);
}
#endif

#if defined(GD_IDE_ONLY)
void ResourceFolder::UnserializeFrom(const SerializerElement& element,
                                     gd::ResourcesManager& parentManager) {
  name = element.GetStringAttribute("name");

  resources.clear();
  SerializerElement& resourcesElement =
      element.GetChild("resources", 0, "Resources");
  resourcesElement.ConsiderAsArrayOf("resource", "Resource");
  for (std::size_t i = 0; i < resourcesElement.GetChildrenCount(); ++i)
    AddResource(resourcesElement.GetChild(i).GetStringAttribute("name"),
                parentManager);
}

void ResourceFolder::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("name", name);

  SerializerElement& resourcesElement = element.AddChild("resources");
  resourcesElement.ConsiderAsArrayOf("resource");
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i] == std::shared_ptr<Resource>()) continue;
    resourcesElement.AddChild("resource")
        .SetAttribute("name", resources[i]->GetName());
  }
}
#endif

void ResourcesManager::UnserializeFrom(const SerializerElement& element) {
  resources.clear();
  const SerializerElement& resourcesElement =
      element.GetChild("resources", 0, "Resources");
  resourcesElement.ConsiderAsArrayOf("resource", "Resource");
  for (std::size_t i = 0; i < resourcesElement.GetChildrenCount(); ++i) {
    const SerializerElement& resourceElement = resourcesElement.GetChild(i);
    gd::String kind = resourceElement.GetStringAttribute("kind");
    gd::String name = resourceElement.GetStringAttribute("name");
    gd::String metadata = resourceElement.GetStringAttribute("metadata", "");

    std::shared_ptr<Resource> resource = CreateResource(kind);
    resource->SetName(name);
    resource->SetMetadata(metadata);

    if (resourceElement.HasChild("origin")) {
      gd::String originName =
          resourceElement.GetChild("origin").GetStringAttribute("name", "");
      gd::String originIdentifier =
          resourceElement.GetChild("origin").GetStringAttribute("identifier",
                                                                "");
      resource->SetOrigin(originName, originIdentifier);
    }
    resource->UnserializeFrom(resourceElement);

    resources.push_back(resource);
  }

#if defined(GD_IDE_ONLY)
  folders.clear();
  const SerializerElement& resourcesFoldersElement =
      element.GetChild("resourceFolders", 0, "ResourceFolders");
  resourcesFoldersElement.ConsiderAsArrayOf("folder", "Folder");
  for (std::size_t i = 0; i < resourcesFoldersElement.GetChildrenCount(); ++i) {
    ResourceFolder folder;
    folder.UnserializeFrom(resourcesFoldersElement.GetChild(i), *this);

    folders.push_back(folder);
  }
#endif
}

#if defined(GD_IDE_ONLY)
void ResourcesManager::SerializeTo(SerializerElement& element) const {
  SerializerElement& resourcesElement = element.AddChild("resources");
  resourcesElement.ConsiderAsArrayOf("resource");
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i] == std::shared_ptr<Resource>()) break;

    SerializerElement& resourceElement = resourcesElement.AddChild("resource");
    resourceElement.SetAttribute("kind", resources[i]->GetKind());
    resourceElement.SetAttribute("name", resources[i]->GetName());
    resourceElement.SetAttribute("metadata", resources[i]->GetMetadata());

    const gd::String& originName = resources[i]->GetOriginName();
    const gd::String& originIdentifier = resources[i]->GetOriginIdentifier();
    if (!originName.empty() || !originIdentifier.empty()) {
      resourceElement.AddChild("origin")
          .SetAttribute("name", originName)
          .SetAttribute("identifier", originIdentifier);
    }

    resources[i]->SerializeTo(resourceElement);
  }

  SerializerElement& resourcesFoldersElement =
      element.AddChild("resourceFolders");
  resourcesFoldersElement.ConsiderAsArrayOf("folder");
  for (std::size_t i = 0; i < folders.size(); ++i)
    folders[i].SerializeTo(resourcesFoldersElement.AddChild("folder"));
}
#endif

void ImageResource::SetFile(const gd::String& newFile) {
  file = newFile;

  // Convert all backslash to slashs.
  while (file.find('\\') != gd::String::npos)
    file.replace(file.find('\\'), 1, "/");
}

void ImageResource::UnserializeFrom(const SerializerElement& element) {
  alwaysLoaded = element.GetBoolAttribute("alwaysLoaded");
  smooth = element.GetBoolAttribute("smoothed");
  SetUserAdded(element.GetBoolAttribute("userAdded"));
  SetFile(element.GetStringAttribute("file"));
}

#if defined(GD_IDE_ONLY)
void ImageResource::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("alwaysLoaded", alwaysLoaded);
  element.SetAttribute("smoothed", smooth);
  element.SetAttribute("userAdded", IsUserAdded());
  element.SetAttribute("file", GetFile());
}
#endif

void AudioResource::SetFile(const gd::String& newFile) {
  file = newFile;

  // Convert all backslash to slashs.
  while (file.find('\\') != gd::String::npos)
    file.replace(file.find('\\'), 1, "/");
}

void AudioResource::UnserializeFrom(const SerializerElement& element) {
  SetUserAdded(element.GetBoolAttribute("userAdded"));
  SetFile(element.GetStringAttribute("file"));
  SetPreloadAsMusic(element.GetBoolAttribute("preloadAsMusic"));
  SetPreloadAsSound(element.GetBoolAttribute("preloadAsSound"));
}

#if defined(GD_IDE_ONLY)
void AudioResource::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("userAdded", IsUserAdded());
  element.SetAttribute("file", GetFile());
  element.SetAttribute("preloadAsMusic", PreloadAsMusic());
  element.SetAttribute("preloadAsSound", PreloadAsSound());
}
#endif

void FontResource::SetFile(const gd::String& newFile) {
  file = newFile;

  // Convert all backslash to slashs.
  while (file.find('\\') != gd::String::npos)
    file.replace(file.find('\\'), 1, "/");
}

void FontResource::UnserializeFrom(const SerializerElement& element) {
  SetUserAdded(element.GetBoolAttribute("userAdded"));
  SetFile(element.GetStringAttribute("file"));
}

#if defined(GD_IDE_ONLY)
void FontResource::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("userAdded", IsUserAdded());
  element.SetAttribute("file", GetFile());
}
#endif

void VideoResource::SetFile(const gd::String& newFile) {
  file = newFile;

  // Convert all backslash to slashs.
  while (file.find('\\') != gd::String::npos)
    file.replace(file.find('\\'), 1, "/");
}

void VideoResource::UnserializeFrom(const SerializerElement& element) {
  SetUserAdded(element.GetBoolAttribute("userAdded"));
  SetFile(element.GetStringAttribute("file"));
}

#if defined(GD_IDE_ONLY)
void VideoResource::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("userAdded", IsUserAdded());
  element.SetAttribute("file", GetFile());
}
#endif

void JsonResource::SetFile(const gd::String& newFile) {
  file = newFile;

  // Convert all backslash to slashs.
  while (file.find('\\') != gd::String::npos)
    file.replace(file.find('\\'), 1, "/");
}

void JsonResource::UnserializeFrom(const SerializerElement& element) {
  SetUserAdded(element.GetBoolAttribute("userAdded"));
  SetFile(element.GetStringAttribute("file"));
  DisablePreload(element.GetBoolAttribute("disablePreload", false));
}

#if defined(GD_IDE_ONLY)
void JsonResource::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("userAdded", IsUserAdded());
  element.SetAttribute("file", GetFile());
  element.SetAttribute("disablePreload", IsPreloadDisabled());
}

std::map<gd::String, gd::PropertyDescriptor> JsonResource::GetProperties()
    const {
  std::map<gd::String, gd::PropertyDescriptor> properties;
  properties["disablePreload"]
      .SetValue(disablePreload ? "true" : "false")
      .SetType("Boolean")
      .SetLabel(_("Disable preloading at game startup"));

  return properties;
}

bool JsonResource::UpdateProperty(const gd::String& name,
                                  const gd::String& value) {
  if (name == "disablePreload") disablePreload = value == "1";

  return true;
}

#endif

void BitmapFontResource::SetFile(const gd::String& newFile) {
  file = newFile;

  // Convert all backslash to slashs.
  while (file.find('\\') != gd::String::npos)
    file.replace(file.find('\\'), 1, "/");
}

void BitmapFontResource::UnserializeFrom(const SerializerElement& element) {
  SetUserAdded(element.GetBoolAttribute("userAdded"));
  SetFile(element.GetStringAttribute("file"));
}

#if defined(GD_IDE_ONLY)
void BitmapFontResource::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("userAdded", IsUserAdded());
  element.SetAttribute("file", GetFile());
}
#endif

#if defined(GD_IDE_ONLY)
ResourceFolder::ResourceFolder(const ResourceFolder& other) { Init(other); }

ResourceFolder& ResourceFolder::operator=(const ResourceFolder& other) {
  if (this != &other) Init(other);

  return *this;
}
#endif

ResourcesManager::ResourcesManager(const ResourcesManager& other) {
  Init(other);
}

ResourcesManager& ResourcesManager::operator=(const ResourcesManager& other) {
  if (this != &other) Init(other);

  return *this;
}

ResourcesManager::ResourcesManager() {
  // ctor
}

ResourcesManager::~ResourcesManager() {
  // dtor
}

}  // namespace gd
