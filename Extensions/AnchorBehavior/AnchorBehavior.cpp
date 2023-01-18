/**

GDevelop - Anchor Behavior Extension
Copyright (c) 2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/
#include "AnchorBehavior.h"

#include <map>

#include "GDCore/CommonTools.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"

void AnchorBehavior::InitializeContent(gd::SerializerElement& content) {
  content.SetAttribute("relativeToOriginalWindowSize", true);
  content.SetAttribute("leftEdgeAnchor",
                       static_cast<int>(ANCHOR_HORIZONTAL_NONE));
  content.SetAttribute("rightEdgeAnchor",
                       static_cast<int>(ANCHOR_HORIZONTAL_NONE));
  content.SetAttribute("topEdgeAnchor", static_cast<int>(ANCHOR_VERTICAL_NONE));
  content.SetAttribute("bottomEdgeAnchor",
                       static_cast<int>(ANCHOR_VERTICAL_NONE));
  content.SetAttribute("useLegacyBottomAndRightAnchors", false);
}

#if defined(GD_IDE_ONLY)
namespace {
gd::String GetAnchorAsString(AnchorBehavior::HorizontalAnchor anchor) {
  if (anchor == AnchorBehavior::ANCHOR_HORIZONTAL_WINDOW_LEFT)
    return _("Window left");
  else if (anchor == AnchorBehavior::ANCHOR_HORIZONTAL_WINDOW_RIGHT)
    return _("Window right");
  else if (anchor == AnchorBehavior::ANCHOR_HORIZONTAL_PROPORTIONAL)
    return _("Proportional");
  else
    return _("No anchor");
}

gd::String GetAnchorAsString(AnchorBehavior::VerticalAnchor anchor) {
  if (anchor == AnchorBehavior::ANCHOR_VERTICAL_WINDOW_TOP)
    return _("Window top");
  else if (anchor == AnchorBehavior::ANCHOR_VERTICAL_WINDOW_BOTTOM)
    return _("Window bottom");
  else if (anchor == AnchorBehavior::ANCHOR_VERTICAL_PROPORTIONAL)
    return _("Proportional");
  else
    return _("No anchor");
}
}  // namespace

std::map<gd::String, gd::PropertyDescriptor> AnchorBehavior::GetProperties(
    const gd::SerializerElement& behaviorContent) const {
  std::map<gd::String, gd::PropertyDescriptor> properties;

  properties[_("relativeToOriginalWindowSize")]
      .SetValue(behaviorContent.GetBoolAttribute("relativeToOriginalWindowSize")
                    ? "true"
                    : "false")
      .SetType("Boolean")
      .SetLabel(_("Anchor relatively to original window size"))
      .SetDescription(_("otherwise, objects are anchored according to the "
                        "window size when the object is created."));

  properties[_("Left edge anchor")]
      .SetValue(GetAnchorAsString(static_cast<HorizontalAnchor>(
          behaviorContent.GetIntAttribute("leftEdgeAnchor"))))
      .SetType("Choice")
      .AddExtraInfo(_("No anchor"))
      .AddExtraInfo(_("Window left"))
      .AddExtraInfo(_("Window right"))
      .AddExtraInfo(_("Proportional"))
      .SetDescription(_("Anchor the left edge of the object on X axis."));

  properties[_("Right edge anchor")]
      .SetValue(GetAnchorAsString(static_cast<HorizontalAnchor>(
          behaviorContent.GetIntAttribute("rightEdgeAnchor"))))
      .SetType("Choice")
      .AddExtraInfo(_("No anchor"))
      .AddExtraInfo(_("Window left"))
      .AddExtraInfo(_("Window right"))
      .AddExtraInfo(_("Proportional"))
      .SetDescription(_("Anchor the right edge of the object on X axis."));

  properties[_("Top edge anchor")]
      .SetValue(GetAnchorAsString(static_cast<VerticalAnchor>(
          behaviorContent.GetIntAttribute("topEdgeAnchor"))))
      .SetType("Choice")
      .AddExtraInfo(_("No anchor"))
      .AddExtraInfo(_("Window top"))
      .AddExtraInfo(_("Window bottom"))
      .AddExtraInfo(_("Proportional"))
      .SetDescription(_("Anchor the top edge of the object on Y axis."));

  properties[_("Bottom edge anchor")]
      .SetValue(GetAnchorAsString(static_cast<VerticalAnchor>(
          behaviorContent.GetIntAttribute("bottomEdgeAnchor"))))
      .SetType("Choice")
      .AddExtraInfo(_("No anchor"))
      .AddExtraInfo(_("Window top"))
      .AddExtraInfo(_("Window bottom"))
      .AddExtraInfo(_("Proportional"))
      .SetDescription(_("Anchor the bottom edge of the object on Y axis."));

  properties[("useLegacyBottomAndRightAnchors")]
      .SetLabel(_(
          "Stretch object when anchoring right or bottom edge (deprecated, "
          "it's recommended to leave this unchecked and anchor both sides if "
          "you want Sprite to stretch instead.)"))
      .SetGroup(_("Deprecated options (advanced)"))
      .SetValue(behaviorContent.GetBoolAttribute(
                    "useLegacyBottomAndRightAnchors", true)
                    ? "true"
                    : "false")
      .SetType("Boolean");

  return properties;
}

namespace {
AnchorBehavior::HorizontalAnchor GetHorizontalAnchorFromString(
    const gd::String& value) {
  if (value == _("Window left"))
    return AnchorBehavior::ANCHOR_HORIZONTAL_WINDOW_LEFT;
  else if (value == _("Window right"))
    return AnchorBehavior::ANCHOR_HORIZONTAL_WINDOW_RIGHT;
  else if (value == _("Proportional"))
    return AnchorBehavior::ANCHOR_HORIZONTAL_PROPORTIONAL;
  else
    return AnchorBehavior::ANCHOR_HORIZONTAL_NONE;
}

AnchorBehavior::VerticalAnchor GetVerticalAnchorFromString(
    const gd::String& value) {
  if (value == _("Window top"))
    return AnchorBehavior::ANCHOR_VERTICAL_WINDOW_TOP;
  else if (value == _("Window bottom"))
    return AnchorBehavior::ANCHOR_VERTICAL_WINDOW_BOTTOM;
  else if (value == _("Proportional"))
    return AnchorBehavior::ANCHOR_VERTICAL_PROPORTIONAL;
  else
    return AnchorBehavior::ANCHOR_VERTICAL_NONE;
}
}  // namespace

bool AnchorBehavior::UpdateProperty(gd::SerializerElement& behaviorContent,
                                    const gd::String& name,
                                    const gd::String& value) {
  if (name == _("relativeToOriginalWindowSize"))
    behaviorContent.SetAttribute("relativeToOriginalWindowSize", value == "1");
  else if (name == _("Left edge anchor"))
    behaviorContent.SetAttribute(
        "leftEdgeAnchor",
        static_cast<int>(GetHorizontalAnchorFromString(value)));
  else if (name == _("Right edge anchor"))
    behaviorContent.SetAttribute(
        "rightEdgeAnchor",
        static_cast<int>(GetHorizontalAnchorFromString(value)));
  else if (name == _("Top edge anchor"))
    behaviorContent.SetAttribute(
        "topEdgeAnchor", static_cast<int>(GetVerticalAnchorFromString(value)));
  else if (name == _("Bottom edge anchor"))
    behaviorContent.SetAttribute(
        "bottomEdgeAnchor",
        static_cast<int>(GetVerticalAnchorFromString(value)));
  else if (name == "useLegacyBottomAndRightAnchors")
    behaviorContent.SetAttribute("useLegacyBottomAndRightAnchors",
                                 (value == "1"));
  else
    return false;

  return true;
}
#endif
