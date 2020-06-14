/**

GDevelop - Primitive Drawing Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include <SFML/Graphics.hpp>
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/FontManager.h"
#include "GDCpp/Runtime/ImageManager.h"
#include "GDCpp/Runtime/Polygon2d.h"
#include "GDCpp/Runtime/Project/InitialInstance.h"
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
#include "ShapePainterObject.h"

#if defined(GD_IDE_ONLY)
#include "GDCpp/Runtime/CommonTools.h"
#endif

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
      absoluteCoordinates(false) {}

ShapePainterObject::ShapePainterObject(gd::String name_) : gd::Object(name_) {}

RuntimeShapePainterObject::RuntimeShapePainterObject(
    RuntimeScene& scene, const ShapePainterObject& shapePainterObject)
    : RuntimeObject(scene, shapePainterObject) {
  ShapePainterObjectBase::operator=(shapePainterObject);
}

void ShapePainterObjectBase::DoUnserializeFrom(
    const gd::SerializerElement& element) {
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
  clearBetweenFrames = element.HasChild("clearBetweenFrames") ? element.GetChild("clearBetweenFrames").GetValue().GetBool() : true;
}

void ShapePainterObject::DoUnserializeFrom(
    gd::Project& project, const gd::SerializerElement& element) {
  ShapePainterObjectBase::DoUnserializeFrom(element);
}

#if defined(GD_IDE_ONLY)
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
}

void ShapePainterObject::DoSerializeTo(gd::SerializerElement& element) const {
  ShapePainterObjectBase::DoSerializeTo(element);
}
#endif

/**
 * Render object at runtime
 */
bool RuntimeShapePainterObject::Draw(sf::RenderTarget& renderTarget) {
  // Don't draw anything if hidden
  if (hidden) {
    shapesToDraw.clear();
    return true;
  }

  for (std::size_t i = 0; i < shapesToDraw.size(); ++i) {
    renderTarget.draw(shapesToDraw[i].rectangleShape);
    renderTarget.draw(shapesToDraw[i].circleShape);
  }

  shapesToDraw.clear();

  return true;
}

#if defined(GD_IDE_ONLY)
void RuntimeShapePainterObject::GetPropertyForDebugger(
    std::size_t propertyNb, gd::String& name, gd::String& value) const {
  if (propertyNb == 0) {
    name = _("Fill color");
    value = gd::String::From(GetFillColorR()) + ";" +
            gd::String::From(GetFillColorG()) + ";" +
            gd::String::From(GetFillColorB());
  } else if (propertyNb == 1) {
    name = _("Fill opacity");
    value = gd::String::From(GetFillOpacity());
  } else if (propertyNb == 2) {
    name = _("Outline size");
    value = gd::String::From(GetOutlineSize());
  } else if (propertyNb == 3) {
    name = _("Outline color");
    value = gd::String::From(GetOutlineColorR()) + ";" +
            gd::String::From(GetOutlineColorG()) + ";" +
            gd::String::From(GetOutlineColorB());
  } else if (propertyNb == 4) {
    name = _("Outline opacity");
    value = gd::String::From(GetOutlineOpacity());
  }
}

bool RuntimeShapePainterObject::ChangeProperty(std::size_t propertyNb,
                                               gd::String newValue) {
  if (propertyNb == 0) {
    std::vector<gd::String> colors = newValue.Split(U';');
    if (colors.size() < 3) return false;  // Color is not valid

    SetFillColor(colors[0].To<int>(), colors[1].To<int>(), colors[2].To<int>());
  } else if (propertyNb == 1) {
    SetFillOpacity(newValue.To<float>());
  } else if (propertyNb == 2) {
    SetOutlineSize(newValue.To<int>());
  } else if (propertyNb == 3) {
    std::vector<gd::String> colors = newValue.Split(U';');
    if (colors.size() < 3) return false;  // Color is not valid

    SetOutlineColor(
        colors[0].To<int>(), colors[1].To<int>(), colors[2].To<int>());
  } else if (propertyNb == 4) {
    SetOutlineOpacity(newValue.To<float>());
  }

  return true;
}

std::size_t RuntimeShapePainterObject::GetNumberOfProperties() const {
  return 5;
}
#endif

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

void ShapePainterObjectBase::SetFillOpacity(float val) {
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

void ShapePainterObjectBase::SetOutlineOpacity(float val) {
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

void RuntimeShapePainterObject::DrawRectangle(float x,
                                              float y,
                                              float x2,
                                              float y2) {
  float Xgap = AreCoordinatesAbsolute() ? 0 : GetX();
  float Ygap = AreCoordinatesAbsolute() ? 0 : GetY();

  DrawingCommand command(sf::RectangleShape(sf::Vector2f(x2 - x, y2 - y)));
  command.rectangleShape.setPosition(x + Xgap, y + Ygap);
  command.rectangleShape.setFillColor(sf::Color(
      GetFillColorR(), GetFillColorG(), GetFillColorB(), GetFillOpacity()));
  command.rectangleShape.setOutlineThickness(GetOutlineSize());
  command.rectangleShape.setOutlineColor(sf::Color(GetOutlineColorR(),
                                                   GetOutlineColorG(),
                                                   GetOutlineColorB(),
                                                   GetOutlineOpacity()));

  shapesToDraw.push_back(command);
}

void RuntimeShapePainterObject::DrawLine(
    float x, float y, float x2, float y2, float thickness) {
  float Xgap = AreCoordinatesAbsolute() ? 0 : GetX();
  float Ygap = AreCoordinatesAbsolute() ? 0 : GetY();

  float length = sqrt((x - x2) * (x - x2) + (y - y2) * (y - y2));
  DrawingCommand command(sf::RectangleShape(sf::Vector2f(length, thickness)));
  command.rectangleShape.setPosition((x + x2) / 2 + Xgap, (y + y2) / 2 + Ygap);
  command.rectangleShape.setOrigin(length / 2, thickness / 2);
  command.rectangleShape.setRotation(atan2(y2 - y, x2 - x) * 180 / 3.14159);
  command.rectangleShape.setFillColor(sf::Color(
      GetFillColorR(), GetFillColorG(), GetFillColorB(), GetFillOpacity()));
  command.rectangleShape.setOutlineThickness(GetOutlineSize());
  command.rectangleShape.setOutlineColor(sf::Color(GetOutlineColorR(),
                                                   GetOutlineColorG(),
                                                   GetOutlineColorB(),
                                                   GetOutlineOpacity()));

  shapesToDraw.push_back(command);
}

void RuntimeShapePainterObject::DrawCircle(float x, float y, float radius) {
  float Xgap = AreCoordinatesAbsolute() ? 0 : GetX();
  float Ygap = AreCoordinatesAbsolute() ? 0 : GetY();

  sf::CircleShape circle(radius);
  DrawingCommand command(circle);
  command.circleShape.setPosition(x + Xgap, y + Ygap);
  command.circleShape.setOrigin(radius, radius);
  command.circleShape.setFillColor(sf::Color(
      GetFillColorR(), GetFillColorG(), GetFillColorB(), GetFillOpacity()));
  command.circleShape.setOutlineThickness(GetOutlineSize());
  command.circleShape.setOutlineColor(sf::Color(GetOutlineColorR(),
                                                GetOutlineColorG(),
                                                GetOutlineColorB(),
                                                GetOutlineOpacity()));

  shapesToDraw.push_back(command);
}
