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
bool GetHorizontalAnchorFromString(
    const gd::String& value, AnchorBehavior::HorizontalAnchor& anchor) {
  if (value == _("Window left")) {
    anchor = AnchorBehavior::ANCHOR_HORIZONTAL_WINDOW_LEFT;
    return true;
  } else if (value == _("Window right")) {
    anchor = AnchorBehavior::ANCHOR_HORIZONTAL_WINDOW_RIGHT;
    return true;
  } else if (value == _("Proportional")) {
    anchor = AnchorBehavior::ANCHOR_HORIZONTAL_PROPORTIONAL;
    return true;
  } else if (value == _("Window center")) {
    anchor = AnchorBehavior::ANCHOR_HORIZONTAL_WINDOW_CENTER;
    return true;
  } else if (value == _("No anchor")) {
    anchor = AnchorBehavior::ANCHOR_HORIZONTAL_NONE;
    return true;
  }
  return false;
}

bool GetVerticalAnchorFromString(
    const gd::String& value, AnchorBehavior::VerticalAnchor& anchor) {
  if (value == _("Window top")) {
    anchor = AnchorBehavior::ANCHOR_VERTICAL_WINDOW_TOP;
    return true;
  } else if (value == _("Window bottom")) {
    anchor = AnchorBehavior::ANCHOR_VERTICAL_WINDOW_BOTTOM;
    return true;
  } else if (value == _("Proportional")) {
    anchor = AnchorBehavior::ANCHOR_VERTICAL_PROPORTIONAL;
    return true;
  } else if (value == _("Window center")) {
    anchor = AnchorBehavior::ANCHOR_VERTICAL_WINDOW_CENTER;
    return true;
  } else if (value == _("No anchor")) {
    anchor = AnchorBehavior::ANCHOR_VERTICAL_NONE;
    return true;
  }
  return false;
}
}  // namespace

bool AnchorBehavior::UpdateProperty(gd::SerializerElement& behaviorContent,
                                    const gd::String& name,
                                    const gd::String& value) {
  if (name == "relativeToOriginalWindowSize")
    behaviorContent.SetAttribute("relativeToOriginalWindowSize", value == "1");
  else if (name == "leftEdgeAnchor") {
    HorizontalAnchor anchor;
    if (!GetHorizontalAnchorFromString(value, anchor)) return false;
    behaviorContent.SetAttribute("leftEdgeAnchor", static_cast<int>(anchor));
  } else if (name == "rightEdgeAnchor") {
    HorizontalAnchor anchor;
    if (!GetHorizontalAnchorFromString(value, anchor)) return false;
    behaviorContent.SetAttribute("rightEdgeAnchor", static_cast<int>(anchor));
  } else if (name == "topEdgeAnchor") {
    VerticalAnchor anchor;
    if (!GetVerticalAnchorFromString(value, anchor)) return false;
    behaviorContent.SetAttribute("topEdgeAnchor", static_cast<int>(anchor));
  } else if (name == "bottomEdgeAnchor") {
    VerticalAnchor anchor;
    if (!GetVerticalAnchorFromString(value, anchor)) return false;
    behaviorContent.SetAttribute("bottomEdgeAnchor", static_cast<int>(anchor));
  } else if (name == "useLegacyBottomAndRightAnchors")
    behaviorContent.SetAttribute("useLegacyBottomAndRightAnchors",
                                 (value == "1"));
  else
    return false;

  return true;
}
