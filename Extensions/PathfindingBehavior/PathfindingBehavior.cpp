/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "PathfindingBehavior.h"
#include <map>
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Serialization/SerializerElement.h"

void PathfindingBehavior::InitializeContent(
    gd::SerializerElement& behaviorContent) {
  behaviorContent.SetAttribute("allowDiagonals", true);
  behaviorContent.SetAttribute("acceleration", 400);
  behaviorContent.SetAttribute("maxSpeed", 200);
  behaviorContent.SetAttribute("angularMaxSpeed", 180);
  behaviorContent.SetAttribute("rotateObject", true);
  behaviorContent.SetAttribute("angleOffset", 0);
  behaviorContent.SetAttribute("cellWidth", 20);
  behaviorContent.SetAttribute("cellHeight", 20);
  behaviorContent.SetAttribute("gridOffsetX", 0);
  behaviorContent.SetAttribute("gridOffsetY", 0);
  behaviorContent.SetAttribute("extraBorder", 0);
  behaviorContent.SetAttribute("smoothingMaxCellGap", 1);
}

#if defined(GD_IDE_ONLY)
std::map<gd::String, gd::PropertyDescriptor> PathfindingBehavior::GetProperties(
    const gd::SerializerElement& behaviorContent) const {
  std::map<gd::String, gd::PropertyDescriptor> properties;

  properties[_("Allows diagonals")]
      .SetValue(behaviorContent.GetBoolAttribute("allowDiagonals") ? "true"
                                                                   : "false")
      .SetGroup(_("Path smoothing"))
      .SetType("Boolean");
  properties[_("Acceleration")].SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("acceleration")));
  properties[_("Max. speed")].SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("maxSpeed")));
  properties[_("Rotate speed")].SetGroup(_("Rotation")).SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("angularMaxSpeed")));
  properties[_("Rotate object")].SetGroup(_("Rotation"))
      .SetValue(behaviorContent.GetBoolAttribute("rotateObject") ? "true"
                                                                 : "false")
      .SetType("Boolean");
  properties[_("Angle offset")].SetGroup(_("Rotation")).SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("angleOffset")));
  properties[_("Virtual cell width")].SetGroup(_("Virtual Grid")).SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("cellWidth", 0)));
  properties[_("Virtual cell height")].SetGroup(_("Virtual Grid")).SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("cellHeight", 0)));
  properties[_("Virtual grid X offset")].SetGroup(_("Virtual Grid")).SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("gridOffsetX", 0)));
  properties[_("Virtual grid Y offset")].SetGroup(_("Virtual Grid")).SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("gridOffsetY", 0)));
  properties[_("Extra border size")].SetGroup(_("Collision")).SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("extraBorder")));
  properties[_("Smoothing max cell gap")]
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("smoothingMaxCellGap")))
      .SetGroup(_("Path smoothing"))
      .SetDescription(_("It's recommended to leave a max gap of 1 cell."));

  return properties;
}

bool PathfindingBehavior::UpdateProperty(gd::SerializerElement& behaviorContent,
                                         const gd::String& name,
                                         const gd::String& value) {
  if (name == _("Allows diagonals")) {
    behaviorContent.SetAttribute("allowDiagonals", (value != "0"));
    return true;
  }
  if (name == _("Rotate object")) {
    behaviorContent.SetAttribute("rotateObject", (value != "0"));
    return true;
  }
  if (name == _("Extra border size")) {
    behaviorContent.SetAttribute("extraBorder", value.To<float>());
    return true;
  }

  if (value.To<float>() < 0) return false;

  if (name == _("Acceleration"))
    behaviorContent.SetAttribute("acceleration", value.To<float>());
  else if (name == _("Max. speed"))
    behaviorContent.SetAttribute("maxSpeed", value.To<float>());
  else if (name == _("Rotate speed"))
    behaviorContent.SetAttribute("angularMaxSpeed", value.To<float>());
  else if (name == _("Angle offset"))
    behaviorContent.SetAttribute("angleOffset", value.To<float>());
  else if (name == _("Virtual cell width"))
    behaviorContent.SetAttribute("cellWidth", value.To<float>());
  else if (name == _("Virtual cell height"))
    behaviorContent.SetAttribute("cellHeight", value.To<float>());
  else if (name == _("Virtual grid X offset"))
    behaviorContent.SetAttribute("gridOffsetX", value.To<float>());
  else if (name == _("Virtual grid Y offset"))
    behaviorContent.SetAttribute("gridOffsetY", value.To<float>());
  else if (name == _("Smoothing max cell gap"))
    behaviorContent.SetAttribute("smoothingMaxCellGap", value.To<float>());
  else
    return false;

  return true;
}
#endif
