/**

GDevelop - Primitive Drawing Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "ShapePainterObject.h"

#include "GDCore/CommonTools.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"

using namespace std;

ShapePainterObjectBase::ShapePainterObjectBase()
    : fillColorR(255),
      fillColorG(255),
      fillColorB(255),
      fillOpacity(255),
      outlineSize(1),
      outlineColorR(0),
      outlineColorG(0),
      outlineColorB(0),
      outlineOpacity(255),
      clearBetweenFrames(true),
      absoluteCoordinates(false),
      antialiasing("none") {}

ShapePainterObject::ShapePainterObject() {}

void ShapePainterObjectBase::DoUnserializeFrom(
    gd::Project& project, const gd::SerializerElement& element) {
  fillOpacity =
      element.GetChild("fillOpacity", 0, "FillOpacity").GetValue().GetInt();
  outlineSize =
      element.GetChild("outlineSize", 0, "OutlineSize").GetValue().GetInt();
  outlineOpacity = element.GetChild("outlineOpacity", 0, "OutlineOpacity")
                       .GetValue()
                       .GetInt();

  fillColorR =
      element.GetChild("fillColor", 0, "FillColor").GetIntAttribute("r");
  fillColorG =
      element.GetChild("fillColor", 0, "FillColor").GetIntAttribute("g");
  fillColorB =
      element.GetChild("fillColor", 0, "FillColor").GetIntAttribute("b");

  outlineColorR =
      element.GetChild("outlineColor", 0, "OutlineColor").GetIntAttribute("r");
  outlineColorG =
      element.GetChild("outlineColor", 0, "OutlineColor").GetIntAttribute("g");
  outlineColorB =
      element.GetChild("outlineColor", 0, "OutlineColor").GetIntAttribute("b");

  absoluteCoordinates =
      element.GetChild("absoluteCoordinates", 0, "AbsoluteCoordinates")
          .GetValue()
          .GetBool();
  clearBetweenFrames =
      element.HasChild("clearBetweenFrames")
          ? element.GetChild("clearBetweenFrames").GetValue().GetBool()
          : true;

  antialiasing = element.HasChild("antialiasing")
                     ? element.GetChild("antialiasing").GetValue().GetString()
                     : "none";
}

void ShapePainterObject::DoUnserializeFrom(
    gd::Project& project, const gd::SerializerElement& element) {
  ShapePainterObjectBase::DoUnserializeFrom(project, element);
}

void ShapePainterObjectBase::DoSerializeTo(
    gd::SerializerElement& element) const {
  element.AddChild("fillOpacity").SetValue(fillOpacity);
  element.AddChild("outlineSize").SetValue(outlineSize);
  element.AddChild("outlineOpacity").SetValue(outlineOpacity);
  element.AddChild("fillColor")
      .SetAttribute("r", (int)fillColorR)
      .SetAttribute("g", (int)fillColorG)
      .SetAttribute("b", (int)fillColorB);
  element.AddChild("outlineColor")
      .SetAttribute("r", (int)outlineColorR)
      .SetAttribute("g", (int)outlineColorG)
      .SetAttribute("b", (int)outlineColorB);
  element.AddChild("absoluteCoordinates").SetValue(absoluteCoordinates);
  element.AddChild("clearBetweenFrames").SetValue(clearBetweenFrames);
  element.AddChild("antialiasing").SetValue(antialiasing);
}

void ShapePainterObject::DoSerializeTo(gd::SerializerElement& element) const {
  ShapePainterObjectBase::DoSerializeTo(element);
}

/**
 * Change the color filter of the sprite object
 */
void ShapePainterObjectBase::SetFillColor(unsigned int r,
                                          unsigned int g,
                                          unsigned int b) {
  fillColorR = r;
  fillColorG = g;
  fillColorB = b;
}

void ShapePainterObjectBase::SetFillOpacity(double val) {
  if (val > 255)
    val = 255;
  else if (val < 0)
    val = 0;

  fillOpacity = val;
}

/**
 * Change the color filter of the sprite object
 */
void ShapePainterObjectBase::SetOutlineColor(unsigned int r,
                                             unsigned int g,
                                             unsigned int b) {
  outlineColorR = r;
  outlineColorG = g;
  outlineColorB = b;
}

void ShapePainterObjectBase::SetOutlineOpacity(double val) {
  if (val > 255)
    val = 255;
  else if (val < 0)
    val = 0;

  outlineOpacity = val;
}

/**
 * Change the fill color
 */
void ShapePainterObjectBase::SetFillColor(const gd::String& color) {
  std::vector<gd::String> colors = color.Split(U';');
  if (colors.size() < 3) return;

  fillColorR = colors[0].To<int>();
  fillColorG = colors[1].To<int>();
  fillColorB = colors[2].To<int>();
}

/**
 * Change the color of the outline
 */
void ShapePainterObjectBase::SetOutlineColor(const gd::String& color) {
  std::vector<gd::String> colors = color.Split(U';');
  if (colors.size() < 3) return;

  outlineColorR = colors[0].To<int>();
  outlineColorG = colors[1].To<int>();
  outlineColorB = colors[2].To<int>();
}
