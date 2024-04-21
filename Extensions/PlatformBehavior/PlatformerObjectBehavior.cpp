/**

GDevelop - Platform Behavior Extension
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "PlatformerObjectBehavior.h"

#include <iostream>
#include <map>
#include <memory>

#include "GDCore/CommonTools.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/MeasurementUnit.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"
#include "PlatformBehavior.h"

void PlatformerObjectBehavior::InitializeContent(
    gd::SerializerElement& behaviorContent) {
  behaviorContent.SetAttribute("gravity", 1000);
  behaviorContent.SetAttribute("maxFallingSpeed", 700);
  behaviorContent.SetAttribute("ladderClimbingSpeed", 150);
  behaviorContent.SetAttribute("acceleration", 1500);
  behaviorContent.SetAttribute("deceleration", 1500);
  behaviorContent.SetAttribute("maxSpeed", 250);
  behaviorContent.SetAttribute("jumpSpeed", 600);
  behaviorContent.SetAttribute("jumpSustainTime", 0.2);
  behaviorContent.SetAttribute("ignoreDefaultControls", false);
  behaviorContent.SetAttribute("slopeMaxAngle", 60);
  behaviorContent.SetAttribute("canGrabPlatforms", false);
  behaviorContent.SetAttribute("canGrabWithoutMoving", true);
  behaviorContent.SetAttribute("yGrabOffset", 0);
  behaviorContent.SetAttribute("xGrabTolerance", 10);
  behaviorContent.SetAttribute("useLegacyTrajectory", false);
  behaviorContent.SetAttribute("canGoDownFromJumpthru", true);
}

#if defined(GD_IDE_ONLY)
std::map<gd::String, gd::PropertyDescriptor>
PlatformerObjectBehavior::GetProperties(
    const gd::SerializerElement& behaviorContent) const {
  std::map<gd::String, gd::PropertyDescriptor> properties;

  properties["Gravity"]
      .SetLabel(_("Gravity"))
      .SetGroup(_("Jump"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixelAcceleration())
      .SetValue(
          gd::String::From(behaviorContent.GetDoubleAttribute("gravity")));
  properties["JumpSpeed"]
      .SetLabel(_("Jump speed"))
      .SetGroup(_("Jump"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixelSpeed())
      .SetValue(
          gd::String::From(behaviorContent.GetDoubleAttribute("jumpSpeed")));
  properties["JumpSustainTime"]
      .SetLabel(_("Jump sustain time"))
      .SetGroup(_("Jump"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetSecond())
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("jumpSustainTime", 0)))
      .SetDescription(
          _("Maximum time (in seconds) during which the jump strength is "
            "sustained if the jump key is held - allowing variable height "
            "jumps."));
  properties["MaxFallingSpeed"]
      .SetLabel(_("Max. falling speed"))
      .SetGroup(_("Jump"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixelSpeed())
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("maxFallingSpeed")));
  properties["LadderClimbingSpeed"]
      .SetLabel(_("Ladder climbing speed"))
      .SetGroup(_("Ladder"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixelSpeed())
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("ladderClimbingSpeed", 150)));
  properties["Acceleration"]
      .SetLabel(_("Acceleration"))
      .SetGroup(_("Walk"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixelAcceleration())
      .SetValue(
          gd::String::From(behaviorContent.GetDoubleAttribute("acceleration")));
  properties["Deceleration"]
      .SetLabel(_("Deceleration"))
      .SetGroup(_("Walk"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixelAcceleration())
      .SetValue(
          gd::String::From(behaviorContent.GetDoubleAttribute("deceleration")));
  properties["MaxSpeed"]
      .SetLabel(_("Max. speed"))
      .SetGroup(_("Walk"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixelSpeed())
      .SetValue(
          gd::String::From(behaviorContent.GetDoubleAttribute("maxSpeed")));
  properties["IgnoreDefaultControls"]
      .SetLabel(_("Default controls"))
      .SetValue(behaviorContent.GetBoolAttribute("ignoreDefaultControls")
                    ? "false"
                    : "true")
      .SetType("Boolean");
  properties["SlopeMaxAngle"]
      .SetLabel(_("Slope max. angle"))
      .SetGroup(_("Walk"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetDegreeAngle())
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("slopeMaxAngle")));
  properties["CanGrabPlatforms"]
      .SetLabel(_("Can grab platform ledges"))
      .SetGroup(_("Ledge"))
      .SetValue(behaviorContent.GetBoolAttribute("canGrabPlatforms", false)
                    ? "true"
                    : "false")
      .SetType("Boolean");
  properties["CanGrabWithoutMoving"]
      .SetLabel(_("Automatically grab platform ledges without having to move "
                  "horizontally"))
      .SetGroup(_("Ledge"))
      .SetValue(behaviorContent.GetBoolAttribute("canGrabWithoutMoving", false)
                    ? "true"
                    : "false")
      .SetType("Boolean");
  properties["YGrabOffset"]
      .SetLabel(_("Grab offset on Y axis"))
      .SetGroup(_("Ledge"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetValue(
          gd::String::From(behaviorContent.GetDoubleAttribute("yGrabOffset")));
  properties["XGrabTolerance"]
      .SetLabel(_("Grab tolerance on X axis"))
      .SetGroup(_("Ledge"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("xGrabTolerance", 10)));
  properties["UseLegacyTrajectory"]
      .SetLabel(_("Use frame rate dependent trajectories (deprecated, it's "
                  "recommended to leave this unchecked)"))
      .SetGroup(_("Deprecated options"))
      .SetDeprecated()
      .SetValue(behaviorContent.GetBoolAttribute("useLegacyTrajectory", true)
                    ? "true"
                    : "false")
      .SetType("Boolean");
  properties["CanGoDownFromJumpthru"]
      .SetLabel(_("Can go down from jumpthru platforms"))
      .SetGroup(_("Walk"))
      .SetValue(behaviorContent.GetBoolAttribute("canGoDownFromJumpthru", false)
                    ? "true"
                    : "false")
      .SetType("Boolean");
  return properties;
}

bool PlatformerObjectBehavior::UpdateProperty(
    gd::SerializerElement& behaviorContent,
    const gd::String& name,
    const gd::String& value) {
  if (name == "IgnoreDefaultControls")
    behaviorContent.SetAttribute("ignoreDefaultControls", (value == "0"));
  else if (name == "CanGrabPlatforms")
    behaviorContent.SetAttribute("canGrabPlatforms", (value == "1"));
  else if (name == "CanGrabWithoutMoving")
    behaviorContent.SetAttribute("canGrabWithoutMoving", (value == "1"));
  else if (name == "UseLegacyTrajectory")
    behaviorContent.SetAttribute("useLegacyTrajectory", (value == "1"));
  else if (name == "CanGoDownFromJumpthru")
    behaviorContent.SetAttribute("canGoDownFromJumpthru", (value == "1"));
  else if (name == "YGrabOffset")
    behaviorContent.SetAttribute("yGrabOffset", value.To<double>());
  else {
    if (value.To<double>() < 0) return false;

    if (name == "Gravity")
      behaviorContent.SetAttribute("gravity", value.To<double>());
    else if (name == "MaxFallingSpeed")
      behaviorContent.SetAttribute("maxFallingSpeed", value.To<double>());
    else if (name == "LadderClimbingSpeed")
      behaviorContent.SetAttribute("ladderClimbingSpeed", value.To<double>());
    else if (name == "Acceleration")
      behaviorContent.SetAttribute("acceleration", value.To<double>());
    else if (name == "Deceleration")
      behaviorContent.SetAttribute("deceleration", value.To<double>());
    else if (name == "MaxSpeed")
      behaviorContent.SetAttribute("maxSpeed", value.To<double>());
    else if (name == "JumpSpeed")
      behaviorContent.SetAttribute("jumpSpeed", value.To<double>());
    else if (name == "JumpSustainTime")
      behaviorContent.SetAttribute("jumpSustainTime", value.To<double>());
    else if (name == "SlopeMaxAngle") {
      double newMaxAngle = value.To<double>();
      if (newMaxAngle < 0 || newMaxAngle >= 90) return false;

      behaviorContent.SetAttribute("slopeMaxAngle", newMaxAngle);
    } else if (name == "XGrabTolerance")
      behaviorContent.SetAttribute("xGrabTolerance", value.To<double>());
    else
      return false;
  }

  return true;
}

#endif
