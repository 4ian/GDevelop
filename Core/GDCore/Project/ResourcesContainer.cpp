/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/Project/ResourcesContainer.h"

#include <iostream>
#include <map>
#include <unordered_set>

#include "GDCore/CommonTools.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"

namespace {
gd::String NormalizePathSeparator(const gd::String &path) {
  gd::String normalizedPath = path;
  while (normalizedPath.find('\\') != gd::String::npos)
    normalizedPath.replace(normalizedPath.find('\\'), 1, "/");

  return normalizedPath;
}
} // namespace

namespace gd {

gd::String Resource::badStr;

Resource ResourcesContainer::badResource;
gd::String ResourcesContainer::badResourceName;

void ResourcesContainer::Init(const ResourcesContainer &other) {
  resources.clear();
  for (std::size_t i = 0; i < other.resources.size(); ++i) {
    resources.push_back(std::shared_ptr<Resource>(other.resources[i]->Clone()));
  }
}

Resource &ResourcesContainer::GetResource(const gd::String &name) {
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i]->GetName() == name)
      return *resources[i];
  }

  return badResource;
}

const Resource &ResourcesContainer::GetResource(const gd::String &name) const {
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i]->GetName() == name)
      return *resources[i];
  }

  return badResource;
}

const gd::String &ResourcesContainer::GetResourceNameWithOrigin(
    const gd::String &originName, const gd::String &originIdentifier) const {
  for (const auto &resource : resources) {
    if (!resource)
      continue;

    if (resource->GetOriginName() == originName &&
        resource->GetOriginIdentifier() == originIdentifier) {
      return resource->GetName();
    }
  }

  return badResourceName;
}

const gd::String &
ResourcesContainer::GetResourceNameWithFile(const gd::String &file) const {
  for (const auto &resource : resources) {
    if (!resource)
      continue;

    if (resource->GetFile() == file) {
      return resource->GetName();
    }
  }

  return badResourceName;
}

std::vector<gd::String> ResourcesContainer::FindFilesNotInResources(
    const std::vector<gd::String> &filePathsToCheck) const {
  std::unordered_set<gd::String> resourceFilePaths;
  for (const auto &resource : resources) {
    resourceFilePaths.insert(NormalizePathSeparator(resource->GetFile()));
  }

  std::vector<gd::String> filePathsNotInResources;
  for (const gd::String &file : filePathsToCheck) {
    gd::String normalizedPath = NormalizePathSeparator(file);
    if (resourceFilePaths.find(normalizedPath) == resourceFilePaths.end())
      filePathsNotInResources.push_back(file);
  }

  return filePathsNotInResources;
}

std::shared_ptr<Resource>
ResourcesContainer::CreateResource(const gd::String &kind) {
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
  else if (kind == "tilemap")
    return std::make_shared<TilemapResource>();
  else if (kind == "tileset")
    return std::make_shared<TilesetResource>();
  else if (kind == "bitmapFont")
    return std::make_shared<BitmapFontResource>();
  else if (kind == "model3D")
    return std::make_shared<Model3DResource>();
  else if (kind == "atlas")
    return std::make_shared<AtlasResource>();
  else if (kind == "spine")
    return std::make_shared<SpineResource>();
  else if (kind == "javascript")
    return std::make_shared<JavaScriptResource>();
  else if (kind == "internal-in-game-editor-only-svg")
    return std::make_shared<InternalInGameEditorOnlySvgResource>();

  std::cout << "Bad resource created (type: " << kind << ")" << std::endl;
  return std::make_shared<Resource>();
}

const gd::String Resource::imageType = "image";
const gd::String Resource::audioType = "audio";
const gd::String Resource::fontType = "font";
const gd::String Resource::videoType = "video";
const gd::String Resource::jsonType = "json";
const gd::String Resource::tileMapType = "tilemap";
const gd::String Resource::tileSetType = "tileset";
const gd::String Resource::bitmapType = "bitmapFont";
const gd::String Resource::model3DType = "model3D";
const gd::String Resource::atlasType = "atlas";
const gd::String Resource::spineType = "spine";
const gd::String Resource::javaScriptType = "javascript";
const gd::String Resource::internalInGameEditorOnlySvgType = "internal-in-game-editor-only-svg";

bool ResourcesContainer::HasResource(const gd::String &name) const {
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i]->GetName() == name)
      return true;
  }

  return false;
}

std::vector<gd::String> ResourcesContainer::GetAllResourceNames() const {
  std::vector<gd::String> allResources;
  for (std::size_t i = 0; i < resources.size(); ++i)
    allResources.push_back(resources[i]->GetName());

  return allResources;
}

std::map<gd::String, gd::PropertyDescriptor> Resource::GetProperties() const {
  std::map<gd::String, gd::PropertyDescriptor> nothing;
  return nothing;
}

std::map<gd::String, gd::PropertyDescriptor>
ImageResource::GetProperties() const {
  std::map<gd::String, gd::PropertyDescriptor> properties;
  properties[_("Smooth the image")]
      .SetValue(smooth ? "true" : "false")
      .SetType("Boolean");

  return properties;
}

bool ImageResource::UpdateProperty(const gd::String &name,
                                   const gd::String &value) {
  if (name == _("Smooth the image"))
    smooth = value == "1";

  return true;
}

std::map<gd::String, gd::PropertyDescriptor>
AudioResource::GetProperties() const {
  std::map<gd::String, gd::PropertyDescriptor> properties;
  properties[_("Preload as sound")]
      .SetDescription(_("Loads the fully decoded file into cache, so it can be "
                        "played right away as Sound with no further delays."))
      .SetValue(preloadAsSound ? "true" : "false")
      .SetType("Boolean");
  properties[_("Preload as music")]
      .SetDescription(_("Prepares the file for immediate streaming as Music "
                        "(does not wait for complete download)."))
      .SetValue(preloadAsMusic ? "true" : "false")
      .SetType("Boolean");
  properties[_("Preload in cache")]
      .SetDescription(_("Loads the complete file into cache, but does not "
                        "decode it into memory until requested."))
      .SetValue(preloadInCache ? "true" : "false")
      .SetType("Boolean");

  return properties;
}

bool AudioResource::UpdateProperty(const gd::String &name,
                                   const gd::String &value) {
  if (name == _("Preload as sound"))
    preloadAsSound = value == "1";
  else if (name == _("Preload as music"))
    preloadAsMusic = value == "1";
  else if (name == _("Preload in cache"))
    preloadInCache = value == "1";

  return true;
}

bool ResourcesContainer::AddResource(const gd::Resource &resource) {
  if (HasResource(resource.GetName()))
    return false;

  std::shared_ptr<Resource> newResource =
      std::shared_ptr<Resource>(resource.Clone());
  if (newResource == std::shared_ptr<Resource>())
    return false;

  resources.push_back(newResource);
  return true;
}

bool ResourcesContainer::AddResource(const gd::String &name,
                                     const gd::String &filename,
                                     const gd::String &kind) {
  if (HasResource(name))
    return false;

  std::shared_ptr<Resource> res = CreateResource(kind);
  res->SetFile(filename);
  res->SetName(name);

  resources.push_back(res);

  return true;
}

namespace {
bool MoveResourceUpInList(std::vector<std::shared_ptr<Resource>> &resources,
                          const gd::String &name) {
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

bool MoveResourceDownInList(std::vector<std::shared_ptr<Resource>> &resources,
                            const gd::String &name) {
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

} // namespace

bool ResourcesContainer::MoveResourceUpInList(const gd::String &name) {
  return gd::MoveResourceUpInList(resources, name);
}

bool ResourcesContainer::MoveResourceDownInList(const gd::String &name) {
  return gd::MoveResourceDownInList(resources, name);
}

std::size_t
ResourcesContainer::GetResourcePosition(const gd::String &name) const {
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i]->GetName() == name)
      return i;
  }
  return gd::String::npos;
}

Resource &ResourcesContainer::GetResourceAt(std::size_t index) {
  if (index < resources.size())
    return *resources[index];

  return badResource;
}

const Resource &ResourcesContainer::GetResourceAt(std::size_t index) const {
  if (index < resources.size())
    return *resources[index];

  return badResource;
}

void ResourcesContainer::MoveResource(std::size_t oldIndex,
                                      std::size_t newIndex) {
  if (oldIndex >= resources.size() || newIndex >= resources.size())
    return;

  auto resource = resources[oldIndex];
  resources.erase(resources.begin() + oldIndex);
  resources.insert(resources.begin() + newIndex, resource);
}

std::shared_ptr<gd::Resource>
ResourcesContainer::GetResourceSPtr(const gd::String &name) {
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i]->GetName() == name)
      return resources[i];
  }

  return std::shared_ptr<gd::Resource>();
}

void ResourcesContainer::RenameResource(const gd::String& oldName,
                                      const gd::String& newName) {
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i]->GetName() == oldName) resources[i]->SetName(newName);
  }
}

void ResourcesContainer::RemoveResource(const gd::String &name) {
  for (std::size_t i = 0; i < resources.size();) {
    if (resources[i] != std::shared_ptr<Resource>() &&
        resources[i]->GetName() == name)
      resources.erase(resources.begin() + i);
    else
      ++i;
  }
}

void ResourcesContainer::UnserializeFrom(const SerializerElement &element) {
  resources.clear();
  const SerializerElement &resourcesElement =
      element.GetChild("resources", 0, "Resources");
  resourcesElement.ConsiderAsArrayOf("resource", "Resource");
  for (std::size_t i = 0; i < resourcesElement.GetChildrenCount(); ++i) {
    const SerializerElement &resourceElement = resourcesElement.GetChild(i);
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
}

void ResourcesContainer::SerializeTo(SerializerElement &element) const {
  SerializerElement &resourcesElement = element.AddChild("resources");
  resourcesElement.ConsiderAsArrayOf("resource");
  for (std::size_t i = 0; i < resources.size(); ++i) {
    if (resources[i] == std::shared_ptr<Resource>())
      break;

    SerializerElement &resourceElement = resourcesElement.AddChild("resource");
    gd::ResourcesContainer::SerializeResourceTo(*resources[i], resourceElement);
  }
}

void ResourcesContainer::SerializeResourceTo(
    gd::Resource &resource, SerializerElement &resourceElement) {
  resourceElement.SetAttribute("kind", resource.GetKind());
  resourceElement.SetAttribute("name", resource.GetName());
  resourceElement.SetAttribute("metadata", resource.GetMetadata());

  const gd::String &originName = resource.GetOriginName();
  const gd::String &originIdentifier = resource.GetOriginIdentifier();
  if (!originName.empty() || !originIdentifier.empty()) {
    resourceElement.AddChild("origin")
        .SetAttribute("name", originName)
        .SetAttribute("identifier", originIdentifier);
  }
  resource.SerializeTo(resourceElement);
}

void ImageResource::SetFile(const gd::String &newFile) {
  file = NormalizePathSeparator(newFile);
}

void ImageResource::UnserializeFrom(const SerializerElement &element) {
  smooth = element.GetBoolAttribute("smoothed");
  SetUserAdded(element.GetBoolAttribute("userAdded"));
  SetFile(element.GetStringAttribute("file"));
}

void ImageResource::SerializeTo(SerializerElement &element) const {
  element.SetAttribute("smoothed", smooth);
  element.SetAttribute("userAdded", IsUserAdded());
  element.SetAttribute("file", GetFile());
}

void AudioResource::SetFile(const gd::String &newFile) {
  file = NormalizePathSeparator(newFile);
}

void AudioResource::UnserializeFrom(const SerializerElement &element) {
  SetUserAdded(element.GetBoolAttribute("userAdded"));
  SetFile(element.GetStringAttribute("file"));
  SetPreloadAsMusic(element.GetBoolAttribute("preloadAsMusic"));
  SetPreloadAsSound(element.GetBoolAttribute("preloadAsSound"));
  SetPreloadInCache(element.GetBoolAttribute("preloadInCache"));
}

void AudioResource::SerializeTo(SerializerElement &element) const {
  element.SetAttribute("userAdded", IsUserAdded());
  element.SetAttribute("file", GetFile());
  element.SetAttribute("preloadAsMusic", PreloadAsMusic());
  element.SetAttribute("preloadAsSound", PreloadAsSound());
  element.SetAttribute("preloadInCache", PreloadInCache());
}

void FontResource::SetFile(const gd::String &newFile) {
  file = NormalizePathSeparator(newFile);
}

void FontResource::UnserializeFrom(const SerializerElement &element) {
  SetUserAdded(element.GetBoolAttribute("userAdded"));
  SetFile(element.GetStringAttribute("file"));
}

void FontResource::SerializeTo(SerializerElement &element) const {
  element.SetAttribute("userAdded", IsUserAdded());
  element.SetAttribute("file", GetFile());
}

void VideoResource::SetFile(const gd::String &newFile) {
  file = NormalizePathSeparator(newFile);
}

void VideoResource::UnserializeFrom(const SerializerElement &element) {
  SetUserAdded(element.GetBoolAttribute("userAdded"));
  SetFile(element.GetStringAttribute("file"));
}

void VideoResource::SerializeTo(SerializerElement &element) const {
  element.SetAttribute("userAdded", IsUserAdded());
  element.SetAttribute("file", GetFile());
}

void JsonResource::SetFile(const gd::String &newFile) {
  file = NormalizePathSeparator(newFile);
}

void JsonResource::UnserializeFrom(const SerializerElement &element) {
  SetUserAdded(element.GetBoolAttribute("userAdded"));
  SetFile(element.GetStringAttribute("file"));
  DisablePreload(element.GetBoolAttribute("disablePreload", false));
}

void JsonResource::SerializeTo(SerializerElement &element) const {
  element.SetAttribute("userAdded", IsUserAdded());
  element.SetAttribute("file", GetFile());
  element.SetAttribute("disablePreload", IsPreloadDisabled());
}

std::map<gd::String, gd::PropertyDescriptor>
JsonResource::GetProperties() const {
  std::map<gd::String, gd::PropertyDescriptor> properties;
  properties["disablePreload"]
      .SetValue(disablePreload ? "true" : "false")
      .SetType("Boolean")
      .SetLabel(_("Disable preloading at game startup"));

  return properties;
}

bool JsonResource::UpdateProperty(const gd::String &name,
                                  const gd::String &value) {
  if (name == "disablePreload")
    disablePreload = value == "1";

  return true;
}

void TilemapResource::SetFile(const gd::String &newFile) {
  file = NormalizePathSeparator(newFile);
}

void TilemapResource::UnserializeFrom(const SerializerElement &element) {
  SetUserAdded(element.GetBoolAttribute("userAdded"));
  SetFile(element.GetStringAttribute("file"));
  DisablePreload(element.GetBoolAttribute("disablePreload", false));
}

void TilemapResource::SerializeTo(SerializerElement &element) const {
  element.SetAttribute("userAdded", IsUserAdded());
  element.SetAttribute("file", GetFile());
  element.SetAttribute("disablePreload", IsPreloadDisabled());
}

std::map<gd::String, gd::PropertyDescriptor>
TilemapResource::GetProperties() const {
  std::map<gd::String, gd::PropertyDescriptor> properties;
  properties["disablePreload"]
      .SetValue(disablePreload ? "true" : "false")
      .SetType("Boolean")
      .SetLabel(_("Disable preloading at game startup"));

  return properties;
}

bool TilemapResource::UpdateProperty(const gd::String &name,
                                     const gd::String &value) {
  if (name == "disablePreload")
    disablePreload = value == "1";

  return true;
}

void TilesetResource::SetFile(const gd::String &newFile) {
  file = NormalizePathSeparator(newFile);
}

void TilesetResource::UnserializeFrom(const SerializerElement &element) {
  SetUserAdded(element.GetBoolAttribute("userAdded"));
  SetFile(element.GetStringAttribute("file"));
  DisablePreload(element.GetBoolAttribute("disablePreload", false));
}

void TilesetResource::SerializeTo(SerializerElement &element) const {
  element.SetAttribute("userAdded", IsUserAdded());
  element.SetAttribute("file", GetFile());
  element.SetAttribute("disablePreload", IsPreloadDisabled());
}

std::map<gd::String, gd::PropertyDescriptor>
TilesetResource::GetProperties() const {
  std::map<gd::String, gd::PropertyDescriptor> properties;
  properties["disablePreload"]
      .SetValue(disablePreload ? "true" : "false")
      .SetType("Boolean")
      .SetLabel(_("Disable preloading at game startup"));

  return properties;
}

bool TilesetResource::UpdateProperty(const gd::String &name,
                                     const gd::String &value) {
  if (name == "disablePreload")
    disablePreload = value == "1";

  return true;
}

void BitmapFontResource::SetFile(const gd::String &newFile) {
  file = NormalizePathSeparator(newFile);
}

void BitmapFontResource::UnserializeFrom(const SerializerElement &element) {
  SetUserAdded(element.GetBoolAttribute("userAdded"));
  SetFile(element.GetStringAttribute("file"));
}

void BitmapFontResource::SerializeTo(SerializerElement &element) const {
  element.SetAttribute("userAdded", IsUserAdded());
  element.SetAttribute("file", GetFile());
}

void Model3DResource::SetFile(const gd::String &newFile) {
  file = NormalizePathSeparator(newFile);
}

void Model3DResource::UnserializeFrom(const SerializerElement &element) {
  SetUserAdded(element.GetBoolAttribute("userAdded"));
  SetFile(element.GetStringAttribute("file"));
}

void Model3DResource::SerializeTo(SerializerElement &element) const {
  element.SetAttribute("userAdded", IsUserAdded());
  element.SetAttribute("file", GetFile());
}

void AtlasResource::SetFile(const gd::String &newFile) {
  file = NormalizePathSeparator(newFile);
}

void AtlasResource::UnserializeFrom(const SerializerElement &element) {
  SetUserAdded(element.GetBoolAttribute("userAdded"));
  SetFile(element.GetStringAttribute("file"));
}

void AtlasResource::SerializeTo(SerializerElement &element) const {
  element.SetAttribute("userAdded", IsUserAdded());
  element.SetAttribute("file", GetFile());
}

void JavaScriptResource::SetFile(const gd::String &newFile) {
  file = NormalizePathSeparator(newFile);
}

void JavaScriptResource::UnserializeFrom(const SerializerElement &element) {
  SetUserAdded(element.GetBoolAttribute("userAdded"));
  SetFile(element.GetStringAttribute("file"));
}

void JavaScriptResource::SerializeTo(SerializerElement &element) const {
  element.SetAttribute("userAdded", IsUserAdded());
  element.SetAttribute("file", GetFile());
}

void InternalInGameEditorOnlySvgResource::SetFile(const gd::String &newFile) {
  file = NormalizePathSeparator(newFile);
}

void InternalInGameEditorOnlySvgResource::UnserializeFrom(const SerializerElement &element) {
  SetUserAdded(element.GetBoolAttribute("userAdded"));
  SetFile(element.GetStringAttribute("file"));
}

void InternalInGameEditorOnlySvgResource::SerializeTo(SerializerElement &element) const {
  element.SetAttribute("userAdded", IsUserAdded());
  element.SetAttribute("file", GetFile());
}

ResourcesContainer::ResourcesContainer(const ResourcesContainer &other) {
  Init(other);
}

ResourcesContainer &
ResourcesContainer::operator=(const ResourcesContainer &other) {
  if (this != &other)
    Init(other);

  return *this;
}

ResourcesContainer::ResourcesContainer(
    const ResourcesContainer::SourceType sourceType_)
    : sourceType(sourceType_) {}

ResourcesContainer::~ResourcesContainer() {
  // dtor
}

} // namespace gd
