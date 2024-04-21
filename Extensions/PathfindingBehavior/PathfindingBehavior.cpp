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
    const gd::SerializerElement &behaviorContent) const {
  std::map<gd::String, gd::PropertyDescriptor> properties;

  properties["AllowDiagonals"]
      .SetLabel(_("Allows diagonals"))
      .SetValue(behaviorContent.GetBoolAttribute("allowDiagonals") ? "true"
                                                                   : "false")
      .SetGroup(_("Path smoothing"))
      .SetAdvanced()
      .SetType("Boolean");
  properties["Acceleration"]
      .SetLabel(_("Acceleration"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixelAcceleration()).SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("acceleration")));
  properties["MaxSpeed"]
      .SetLabel(_("Max. speed"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixelSpeed()).SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("maxSpeed")));
  properties["AngularMaxSpeed"]
      .SetLabel(_("Rotation speed"))
      .SetGroup(_("Rotation"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetAngularSpeed())
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("angularMaxSpeed")));
  properties["RotateObject"]
      .SetLabel(_("Rotate object"))
      .SetGroup(_("Rotation"))
      .SetValue(behaviorContent.GetBoolAttribute("rotateObject") ? "true"
                                                                 : "false")
      .SetType("Boolean");
  properties["AngleOffset"]
      .SetLabel(_("Angle offset"))
      .SetGroup(_("Rotation"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetDegreeAngle())
      .SetValue(
          gd::String::From(behaviorContent.GetDoubleAttribute("angleOffset")));
  properties["CellWidth"]
      .SetLabel(_("Virtual cell width"))
      .SetGroup(_("Virtual Grid"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetValue(
          gd::String::From(behaviorContent.GetDoubleAttribute("cellWidth", 0)));
  properties["CellHeight"]
      .SetLabel(_("Virtual cell height"))
      .SetGroup(_("Virtual Grid"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("cellHeight", 0)));
  properties["GridOffsetX"]
      .SetLabel(_("Virtual grid X offset"))
      .SetGroup(_("Virtual Grid"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("gridOffsetX", 0)));
  properties["GridOffsetY"]
      .SetLabel(_("Virtual grid Y offset"))
      .SetGroup(_("Virtual Grid"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("gridOffsetY", 0)));
  properties["ExtraBorder"]
      .SetDescription(_("Extra border size"))
      .SetGroup(_("Collision"))
      .SetAdvanced()
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetValue(
          gd::String::From(behaviorContent.GetDoubleAttribute("extraBorder")));
  properties["SmoothingMaxCellGap"]
      .SetLabel(_("Smoothing max cell gap"))
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("smoothingMaxCellGap")))
      .SetGroup(_("Path smoothing"))
      .SetAdvanced()
      .SetDescription(_("It's recommended to leave a max gap of 1 cell. "
                        "Setting it to 0 disable the smoothing."));

  return properties;
}

bool PathfindingBehavior::UpdateProperty(gd::SerializerElement& behaviorContent,
                                         const gd::String& name,
                                         const gd::String& value) {
  if (name == "AllowDiagonals") {
    behaviorContent.SetAttribute("allowDiagonals", (value != "0"));
    return true;
  }
  if (name == "RotateObject") {
    behaviorContent.SetAttribute("rotateObject", (value != "0"));
    return true;
  }
  if (name == "ExtraBorder") {
    behaviorContent.SetAttribute("extraBorder", value.To<float>());
    return true;
  }

  if (value.To<float>() < 0) return false;

  if (name == "Acceleration")
    behaviorContent.SetAttribute("acceleration", value.To<float>());
  else if (name == "MaxSpeed")
    behaviorContent.SetAttribute("maxSpeed", value.To<float>());
  else if (name == "AngularMaxSpeed")
    behaviorContent.SetAttribute("angularMaxSpeed", value.To<float>());
  else if (name == "AngleOffset")
    behaviorContent.SetAttribute("angleOffset", value.To<float>());
  else if (name == "CellWidth")
    behaviorContent.SetAttribute("cellWidth", value.To<float>());
  else if (name == "CellHeight")
    behaviorContent.SetAttribute("cellHeight", value.To<float>());
  else if (name == "GridOffsetX")
    behaviorContent.SetAttribute("gridOffsetX", value.To<float>());
  else if (name == "GridOffsetY")
    behaviorContent.SetAttribute("gridOffsetY", value.To<float>());
  else if (name == "SmoothingMaxCellGap")
    behaviorContent.SetAttribute("smoothingMaxCellGap", value.To<float>());
  else
    return false;

  return true;
}
#endif
