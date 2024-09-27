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

namespace {
gd::String GetAnchorAsString(AnchorBehavior::HorizontalAnchor anchor) {
  if (anchor == AnchorBehavior::ANCHOR_HORIZONTAL_WINDOW_LEFT)
    return _("Window left");
  else if (anchor == AnchorBehavior::ANCHOR_HORIZONTAL_WINDOW_RIGHT)
    return _("Window right");
  else if (anchor == AnchorBehavior::ANCHOR_HORIZONTAL_PROPORTIONAL)
    return _("Proportional");
  else if (anchor == AnchorBehavior::ANCHOR_HORIZONTAL_WINDOW_CENTER)
    return _("Window center");
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
  else if (anchor == AnchorBehavior::ANCHOR_VERTICAL_WINDOW_CENTER)
    return _("Window center");
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

  properties["leftEdgeAnchor"]
      .SetValue(GetAnchorAsString(static_cast<HorizontalAnchor>(
          behaviorContent.GetIntAttribute("leftEdgeAnchor"))))
      .SetType("Choice")
      .AddExtraInfo(_("No anchor"))
      .AddExtraInfo(_("Window left"))
      .AddExtraInfo(_("Window center"))
      .AddExtraInfo(_("Window right"))
      .AddExtraInfo(_("Proportional"))
      .SetLabel(_("Left edge"))
      .SetDescription(_("Anchor the left edge of the object on X axis."));

  properties["rightEdgeAnchor"]
      .SetValue(GetAnchorAsString(static_cast<HorizontalAnchor>(
          behaviorContent.GetIntAttribute("rightEdgeAnchor"))))
      .SetType("Choice")
      .AddExtraInfo(_("No anchor"))
      .AddExtraInfo(_("Window left"))
      .AddExtraInfo(_("Window center"))
      .AddExtraInfo(_("Window right"))
      .AddExtraInfo(_("Proportional"))
      .SetLabel(_("Right edge"))
      .SetDescription(_("Anchor the right edge of the object on X axis."));

  properties["topEdgeAnchor"]
      .SetValue(GetAnchorAsString(static_cast<VerticalAnchor>(
          behaviorContent.GetIntAttribute("topEdgeAnchor"))))
      .SetType("Choice")
      .AddExtraInfo(_("No anchor"))
      .AddExtraInfo(_("Window top"))
      .AddExtraInfo(_("Window center"))
      .AddExtraInfo(_("Window bottom"))
      .AddExtraInfo(_("Proportional"))
      .SetLabel(_("Top edge"))
      .SetDescription(_("Anchor the top edge of the object on Y axis."));

  properties["bottomEdgeAnchor"]
      .SetValue(GetAnchorAsString(static_cast<VerticalAnchor>(
          behaviorContent.GetIntAttribute("bottomEdgeAnchor"))))
      .SetType("Choice")
      .AddExtraInfo(_("No anchor"))
      .AddExtraInfo(_("Window top"))
      .AddExtraInfo(_("Window center"))
      .AddExtraInfo(_("Window bottom"))
      .AddExtraInfo(_("Proportional"))
      .SetLabel(_("Bottom edge"))
      .SetDescription(_("Anchor the bottom edge of the object on Y axis."));

  properties["useLegacyBottomAndRightAnchors"]
      .SetLabel(_(
          "Stretch object when anchoring right or bottom edge (deprecated, "
          "it's recommended to leave this unchecked and anchor both sides if "
          "you want Sprite to stretch instead.)"))
      .SetValue(behaviorContent.GetBoolAttribute(
                    "useLegacyBottomAndRightAnchors", true)
                    ? "true"
                    : "false")
      .SetType("Boolean")
      .SetDeprecated(true);

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
  else if (value == _("Window center"))
    return AnchorBehavior::ANCHOR_HORIZONTAL_WINDOW_CENTER;
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
  else if (value == _("Window center"))
    return AnchorBehavior::ANCHOR_VERTICAL_WINDOW_CENTER;
  else
    return AnchorBehavior::ANCHOR_VERTICAL_NONE;
}
}  // namespace

bool AnchorBehavior::UpdateProperty(gd::SerializerElement& behaviorContent,
                                    const gd::String& name,
                                    const gd::String& value) {
  if (name == "relativeToOriginalWindowSize")
    behaviorContent.SetAttribute("relativeToOriginalWindowSize", value == "1");
  else if (name == "leftEdgeAnchor")
    behaviorContent.SetAttribute(
        "leftEdgeAnchor",
        static_cast<int>(GetHorizontalAnchorFromString(value)));
  else if (name == "rightEdgeAnchor")
    behaviorContent.SetAttribute(
        "rightEdgeAnchor",
        static_cast<int>(GetHorizontalAnchorFromString(value)));
  else if (name == "topEdgeAnchor")
    behaviorContent.SetAttribute(
        "topEdgeAnchor", static_cast<int>(GetVerticalAnchorFromString(value)));
  else if (name == "bottomEdgeAnchor")
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
