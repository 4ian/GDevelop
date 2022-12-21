/**

GDevelop - Tiled Sprite Extension
Copyright (c) 2012-2016 Victor Levasseur (victorlevasseur01@orange.fr)
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCore/Tools/Localization.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "TiledSpriteObject.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#endif

using namespace std;

TiledSpriteObject::TiledSpriteObject()
    : textureName(""), width(32), height(32) {}

void TiledSpriteObject::DoUnserializeFrom(
    gd::Project& project, const gd::SerializerElement& element) {
  textureName = element.GetStringAttribute("texture");
  width = element.GetDoubleAttribute("width", 128);
  height = element.GetDoubleAttribute("height", 128);
}

#if defined(GD_IDE_ONLY)
void TiledSpriteObject::DoSerializeTo(gd::SerializerElement& element) const {
  element.SetAttribute("texture", textureName);
  element.SetAttribute("width", width);
  element.SetAttribute("height", height);
}

void TiledSpriteObject::ExposeResources(
    gd::ArbitraryResourceWorker& worker) {
  worker.ExposeImage(textureName);
}
#endif
