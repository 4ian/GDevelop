/**

GDevelop - Physics Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "PhysicsBehavior.h"
#include <string>
#include "GDCore/Tools/Localization.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"
#if defined(GD_IDE_ONLY)
#include <map>
#include "GDCore/Project/PropertyDescriptor.h"
#endif

#undef GetObject

void PhysicsBehavior::InitializeContent(
    gd::SerializerElement &behaviorContent) {
  behaviorContent.SetAttribute("dynamic", true);
  behaviorContent.SetAttribute("fixedRotation", false);
  behaviorContent.SetAttribute("isBullet", false);
  behaviorContent.SetAttribute("massDensity", 1);
  behaviorContent.SetAttribute("averageFriction", 0.8);
  behaviorContent.SetAttribute("linearDamping", 0.1);
  behaviorContent.SetAttribute("angularDamping", 0.1);
  behaviorContent.SetAttribute("shapeType", "Box");
  behaviorContent.SetAttribute("positioning", "OnCenter");

  behaviorContent.SetAttribute("autoResizing", false);
  behaviorContent.SetAttribute("polygonWidth", 200);
  behaviorContent.SetAttribute("polygonHeight", 200);

  std::vector<gd::Vector2f> polygonCoords;
  behaviorContent.SetAttribute(
      "coordsList",
      PhysicsBehavior::GetStringFromCoordsVector(polygonCoords, '/', ';'));
  behaviorContent.SetAttribute("averageRestitution", 0);
}

#if defined(GD_IDE_ONLY)
std::map<gd::String, gd::PropertyDescriptor> PhysicsBehavior::GetProperties(
    const gd::SerializerElement &behaviorContent) const {
  std::map<gd::String, gd::PropertyDescriptor> properties;

  gd::String shapeTypeStr = _("Box (rectangle)");
  gd::String shape = behaviorContent.GetStringAttribute("shapeType");
  if (shape == "Circle")
    shapeTypeStr = _("Circle");
  else if (shape == "CustomPolygon")
    shapeTypeStr = _("Custom polygon");
  else
    shapeTypeStr = _("Box (rectangle)");

  properties[_("Shape")]
      .SetValue(shapeTypeStr)
      .SetType("Choice")
      .AddExtraInfo(_("Box (rectangle)"))
      .AddExtraInfo(_("Circle"));

  properties[_("Dynamic object")]
      .SetValue(behaviorContent.GetBoolAttribute("dynamic") ? "true" : "false")
      .SetType("Boolean");
  properties[_("Fixed rotation")]
      .SetValue(behaviorContent.GetBoolAttribute("fixedRotation") ? "true"
                                                                  : "false")
      .SetType("Boolean");
  properties[_("Consider as bullet (better collision handling)")]
      .SetValue(behaviorContent.GetBoolAttribute("isBullet") ? "true" : "false")
      .SetType("Boolean");
  properties[_("Mass density")].SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("massDensity")));
  properties[_("Friction")].SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("averageFriction")));
  properties[_("Restitution (elasticity)")].SetValue(gd::String::From(
      behaviorContent.GetDoubleAttribute("averageRestitution")));
  properties[_("Linear Damping")].SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("linearDamping")));
  properties[_("Angular Damping")].SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("angularDamping")));
  properties["PLEASE_ALSO_SHOW_EDIT_BUTTON_THANKS"].SetValue("");

  return properties;
}

bool PhysicsBehavior::UpdateProperty(gd::SerializerElement &behaviorContent,
                                     const gd::String &name,
                                     const gd::String &value) {
  if (name == _("Shape")) {
    if (value == _("Box (rectangle)"))
      behaviorContent.SetAttribute("shapeType", "Box");
    else if (value == _("Circle"))
      behaviorContent.SetAttribute("shapeType", "Circle");
    else if (value == _("Custom polygon"))
      behaviorContent.SetAttribute("shapeType", "CustomPolygon");
  }
  if (name == _("Dynamic object")) {
    behaviorContent.SetAttribute("dynamic", (value != "0"));
  }
  if (name == _("Fixed rotation")) {
    behaviorContent.SetAttribute("fixedRotation", (value != "0"));
  }
  if (name == _("Consider as bullet (better collision handling)")) {
    behaviorContent.SetAttribute("isBullet", (value != "0"));
  }
  if (name == _("Mass density")) {
    behaviorContent.SetAttribute("massDensity", value.To<float>());
  }
  if (name == _("Friction")) {
    behaviorContent.SetAttribute("averageFriction", value.To<float>());
  }
  if (name == _("Restitution (elasticity)")) {
    behaviorContent.SetAttribute("averageRestitution", value.To<float>());
  }
  if (name == _("Linear Damping")) {
    if (value.To<float>() < 0) return false;
    behaviorContent.SetAttribute("linearDamping", value.To<float>());
  }
  if (name == _("Angular Damping")) {
    if (value.To<float>() < 0) return false;
    behaviorContent.SetAttribute("angularDamping", value.To<float>());
  }

  return true;
}
#endif

gd::String PhysicsBehavior::GetStringFromCoordsVector(
    const std::vector<gd::Vector2f> &vec,
    char32_t coordsSep,
    char32_t composantSep) {
  gd::String coordsStr;

  for (std::size_t a = 0; a < vec.size(); a++) {
    coordsStr += gd::String::From(vec.at(a).x);
    coordsStr.push_back(composantSep);
    coordsStr += gd::String::From(vec.at(a).y);
    if (a != vec.size() - 1) coordsStr.push_back(coordsSep);
  }

  return coordsStr;
}
