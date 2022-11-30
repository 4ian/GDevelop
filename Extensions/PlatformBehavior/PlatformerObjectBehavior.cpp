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

  properties[_("Gravity")]
      .SetGroup(_("Jump"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixelAcceleration())
      .SetValue(
          gd::String::From(behaviorContent.GetDoubleAttribute("gravity")));
  properties[_("Jump speed")]
      .SetGroup(_("Jump"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixelSpeed())
      .SetValue(
          gd::String::From(behaviorContent.GetDoubleAttribute("jumpSpeed")));
  properties["jumpSustainTime"]
      .SetGroup(_("Jump"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetSecond())
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("jumpSustainTime", 0)))
      .SetLabel(_("Jump sustain time"))
      .SetDescription(
          _("Maximum time (in seconds) during which the jump strength is "
            "sustained if the jump key is held - allowing variable height "
            "jumps."));
  properties[_("Max. falling speed")]
      .SetGroup(_("Jump"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixelSpeed())
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("maxFallingSpeed")));
  properties[_("Ladder climbing speed")]
      .SetGroup(_("Ladder"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixelSpeed())
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("ladderClimbingSpeed", 150)));
  properties[_("Acceleration")]
      .SetGroup(_("Walk"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixelAcceleration())
      .SetValue(
          gd::String::From(behaviorContent.GetDoubleAttribute("acceleration")));
  properties[_("Deceleration")]
      .SetGroup(_("Walk"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixelAcceleration())
      .SetValue(
          gd::String::From(behaviorContent.GetDoubleAttribute("deceleration")));
  properties[_("Max. speed")]
      .SetGroup(_("Walk"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixelSpeed())
      .SetValue(
          gd::String::From(behaviorContent.GetDoubleAttribute("maxSpeed")));
  properties[_("Default controls")]
      .SetValue(behaviorContent.GetBoolAttribute("ignoreDefaultControls")
                    ? "false"
                    : "true")
      .SetType("Boolean");
  properties[_("Slope max. angle")]
      .SetGroup(_("Walk"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetDegreeAngle())
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("slopeMaxAngle")));
  properties[_("Can grab platform ledges")]
      .SetGroup(_("Ledge"))
      .SetValue(behaviorContent.GetBoolAttribute("canGrabPlatforms", false)
                    ? "true"
                    : "false")
      .SetType("Boolean");
  properties[_("Automatically grab platform ledges without having to move "
               "horizontally")]
      .SetGroup(_("Ledge"))
      .SetValue(behaviorContent.GetBoolAttribute("canGrabWithoutMoving", false)
                    ? "true"
                    : "false")
      .SetType("Boolean");
  properties[_("Grab offset on Y axis")]
      .SetGroup(_("Ledge"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetValue(
          gd::String::From(behaviorContent.GetDoubleAttribute("yGrabOffset")));
  properties[_("Grab tolerance on X axis")]
      .SetGroup(_("Ledge"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("xGrabTolerance", 10)));
  properties["useLegacyTrajectory"]
      .SetLabel(_("Use frame rate dependent trajectories (deprecated, it's "
                  "recommended to leave this unchecked)"))
      .SetGroup(_("Deprecated options (advanced)"))
      .SetValue(behaviorContent.GetBoolAttribute("useLegacyTrajectory", true)
                    ? "true"
                    : "false")
      .SetType("Boolean");
  properties[_("Can go down from jumpthru platforms")]
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
  if (name == _("Default controls"))
    behaviorContent.SetAttribute("ignoreDefaultControls", (value == "0"));
  else if (name == _("Can grab platform ledges"))
    behaviorContent.SetAttribute("canGrabPlatforms", (value == "1"));
  else if (name == _("Automatically grab platform ledges without having to "
                     "move horizontally"))
    behaviorContent.SetAttribute("canGrabWithoutMoving", (value == "1"));
  else if (name == "useLegacyTrajectory")
    behaviorContent.SetAttribute("useLegacyTrajectory", (value == "1"));
  else if (name == _("Can go down from jumpthru platforms"))
    behaviorContent.SetAttribute("canGoDownFromJumpthru", (value == "1"));
  else if (name == _("Grab offset on Y axis"))
    behaviorContent.SetAttribute("yGrabOffset", value.To<double>());
  else {
    if (value.To<double>() < 0) return false;

    if (name == _("Gravity"))
      behaviorContent.SetAttribute("gravity", value.To<double>());
    else if (name == _("Max. falling speed"))
      behaviorContent.SetAttribute("maxFallingSpeed", value.To<double>());
    else if (name == _("Ladder climbing speed"))
      behaviorContent.SetAttribute("ladderClimbingSpeed", value.To<double>());
    else if (name == _("Acceleration"))
      behaviorContent.SetAttribute("acceleration", value.To<double>());
    else if (name == _("Deceleration"))
      behaviorContent.SetAttribute("deceleration", value.To<double>());
    else if (name == _("Max. speed"))
      behaviorContent.SetAttribute("maxSpeed", value.To<double>());
    else if (name == _("Jump speed"))
      behaviorContent.SetAttribute("jumpSpeed", value.To<double>());
    else if (name == "jumpSustainTime")
      behaviorContent.SetAttribute("jumpSustainTime", value.To<double>());
    else if (name == _("Slope max. angle")) {
      double newMaxAngle = value.To<double>();
      if (newMaxAngle < 0 || newMaxAngle >= 90) return false;

      behaviorContent.SetAttribute("slopeMaxAngle", newMaxAngle);
    } else if (name == _("Grab tolerance on X axis"))
      behaviorContent.SetAttribute("xGrabTolerance", value.To<double>());
    else
      return false;
  }

  return true;
}

#endif
