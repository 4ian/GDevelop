/**

GDevelop - Panel Sprite Extension
Copyright (c) 2012-2016 Victor Levasseur (victorlevasseur01@orange.fr)
This project is released under the MIT License.
*/

#include "GDCore/Tools/Localization.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "PanelSpriteObject.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#endif

using namespace std;

PanelSpriteObject::PanelSpriteObject()
    : textureName(""),
      width(32),
      height(32),
      leftMargin(0),
      topMargin(0),
      rightMargin(0),
      bottomMargin(0) {}

PanelSpriteObject::~PanelSpriteObject() {}

void PanelSpriteObject::DoUnserializeFrom(
    gd::Project& project, const gd::SerializerElement& element) {
  textureName = element.GetStringAttribute("texture");
  width = element.GetIntAttribute("width", 32);
  height = element.GetIntAttribute("height", 32);
  leftMargin = element.GetIntAttribute("leftMargin");
  topMargin = element.GetIntAttribute("topMargin");
  rightMargin = element.GetIntAttribute("rightMargin");
  bottomMargin = element.GetIntAttribute("bottomMargin");
  tiled = element.GetBoolAttribute("tiled");
}

#if defined(GD_IDE_ONLY)
void PanelSpriteObject::DoSerializeTo(gd::SerializerElement& element) const {
  element.SetAttribute("texture", textureName);
  element.SetAttribute("width", width);
  element.SetAttribute("height", height);
  element.SetAttribute("leftMargin", leftMargin);
  element.SetAttribute("topMargin", topMargin);
  element.SetAttribute("rightMargin", rightMargin);
  element.SetAttribute("bottomMargin", bottomMargin);
  element.SetAttribute("tiled", tiled);
}

void PanelSpriteObject::ExposeResources(
    gd::ArbitraryResourceWorker& worker) {
  worker.ExposeImage(textureName);
}
#endif
