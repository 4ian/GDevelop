
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

#include "SkeletonObject.h"
#include <SFML/Graphics.hpp>
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/ImageManager.h"
#include "GDCpp/Runtime/Project/InitialInstance.h"
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Runtime/ResourcesLoader.h"
#include "GDCpp/Runtime/Serialization/Serializer.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"

#include <iostream>

#if defined(GD_IDE_ONLY)

#if !defined(GD_NO_WX_GUI)
#include <wx/bitmap.h>
#include <wx/filename.h>
#endif

sf::Texture SkeletonObject::edittimeIconImage;
sf::Sprite SkeletonObject::edittimeIcon;
#endif

SkeletonObject::SkeletonObject(gd::String name_) : Object(name_) {
#if defined(GD_IDE_ONLY)
  originalSize = sf::Vector2f(32.0f, 32.0f),
  originOffset = sf::Vector2f(16.0f, 16.0f), sizeDirty = true;
#endif
}

void SkeletonObject::DoUnserializeFrom(gd::Project& project,
                                       const gd::SerializerElement& element) {
  skeletalDataFilename = element.GetStringAttribute("skeletalDataFilename");
  rootArmatureName = element.GetStringAttribute("rootArmatureName");
  textureDataFilename = element.GetStringAttribute("textureDataFilename");
  textureName = element.GetStringAttribute("textureName");
  apiName = element.GetStringAttribute("apiName");
  debugPolygons = element.GetBoolAttribute("debugPolygons", false);
}

#if defined(GD_IDE_ONLY)
void SkeletonObject::DoSerializeTo(gd::SerializerElement& element) const {
  element.SetAttribute("skeletalDataFilename", skeletalDataFilename);
  element.SetAttribute("rootArmatureName", rootArmatureName);
  element.SetAttribute("textureDataFilename", textureDataFilename);
  element.SetAttribute("textureName", textureName);
  element.SetAttribute("apiName", apiName);
  element.SetAttribute("debugPolygons", debugPolygons);
}

std::map<gd::String, gd::PropertyDescriptor> SkeletonObject::GetProperties(
    gd::Project& project) const {
  std::map<gd::String, gd::PropertyDescriptor> properties;
  properties[_("Skeletal data filename")].SetValue(skeletalDataFilename);
  properties[_("Main armature name")].SetValue(rootArmatureName);
  properties[_("Texture data filename")].SetValue(textureDataFilename);
  properties[_("Texture")].SetValue(textureName);
  properties[_("API")].SetValue(apiName).SetType("Choice").AddExtraInfo(
      "DragonBones");
  properties[_("Debug Polygons")]
      .SetValue(debugPolygons ? "true" : "false")
      .SetType("Boolean");

  return properties;
}

bool SkeletonObject::UpdateProperty(const gd::String& name,
                                    const gd::String& value,
                                    gd::Project& project) {
  if (name == _("Skeletal data filename")) {
    skeletalDataFilename = value;
    sizeDirty = true;
  }
  if (name == _("Main armature name")) {
    rootArmatureName = value;
    sizeDirty = true;
  }
  if (name == _("Texture data filename")) textureDataFilename = value;
  if (name == _("Texture")) textureName = value;
  if (name == _("API")) apiName = value;
  if (name == _("Debug Polygons")) debugPolygons = value == "1";

  return true;
}

void SkeletonObject::LoadEdittimeIcon() {
  edittimeIconImage.loadFromFile("JsPlatform/Extensions/skeletonicon.png");
  edittimeIcon.setTexture(edittimeIconImage);
}

#if !defined(GD_NO_WX_GUI)
bool SkeletonObject::GenerateThumbnail(const gd::Project& project,
                                       wxBitmap& thumbnail) const {
  thumbnail =
      wxBitmap("JsPlatform/Extensions/skeletonicon24.png", wxBITMAP_TYPE_ANY);

  return true;
}
#endif

void SkeletonObject::DrawInitialInstance(gd::InitialInstance& instance,
                                         sf::RenderTarget& renderTarget,
                                         gd::Project& project,
                                         gd::Layout& layout) {
#if !defined(GD_NO_WX_GUI)
  if (sizeDirty) UpdateSize(project);
#endif

  edittimeIcon.setPosition(instance.GetX() - originalSize.x / 2.0f,
                           instance.GetY() - originalSize.y / 2.0f);
  renderTarget.draw(edittimeIcon);
}

sf::Vector2f SkeletonObject::GetInitialInstanceOrigin(
    gd::InitialInstance& instance,
    gd::Project& project,
    gd::Layout& layout) const {
  return originOffset;
}

#if !defined(GD_NO_WX_GUI)
void SkeletonObject::UpdateSize(gd::Project& project) {
  sizeDirty = false;

  // Force the path as relative
  wxString projectDir =
      wxFileName::FileName(project.GetProjectFile()).GetPath();
  wxFileName fileName(skeletalDataFilename.ToWxString());
  fileName.SetPath(projectDir);

  // Can't unserialize from JSON's with empty arrays/objects ?
  // gd::String fileContent =
  // gd::ResourcesLoader::Get()->LoadPlainText(gd::String::FromWxString(fileName.GetFullPath()));
  // gd::SerializerElement element = gd::Serializer::FromJSON(fileContent);
}
#endif
#endif

gd::Object* CreateSkeletonObject(gd::String name) {
  return new SkeletonObject(name);
}
