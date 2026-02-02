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
gd::String GetHorizontalAnchorAsString(AnchorBehavior::HorizontalAnchor anchor) {
  if (anchor == AnchorBehavior::ANCHOR_HORIZONTAL_WINDOW_LEFT)
    return "WindowLeft";
  else if (anchor == AnchorBehavior::ANCHOR_HORIZONTAL_WINDOW_RIGHT)
    return "WindowRight";
  else if (anchor == AnchorBehavior::ANCHOR_HORIZONTAL_PROPORTIONAL)
    return "Proportional";
  else if (anchor == AnchorBehavior::ANCHOR_HORIZONTAL_WINDOW_CENTER)
    return "WindowCenter";
  else
    return "None";
}

gd::String GetVerticalAnchorAsString(AnchorBehavior::VerticalAnchor anchor) {
  if (anchor == AnchorBehavior::ANCHOR_VERTICAL_WINDOW_TOP)
    return "WindowTop";
  else if (anchor == AnchorBehavior::ANCHOR_VERTICAL_WINDOW_BOTTOM)
    return "WindowBottom";
  else if (anchor == AnchorBehavior::ANCHOR_VERTICAL_PROPORTIONAL)
    return "Proportional";
  else if (anchor == AnchorBehavior::ANCHOR_VERTICAL_WINDOW_CENTER)
    return "WindowCenter";
  else
    return "None";
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
      .SetValue(GetHorizontalAnchorAsString(static_cast<HorizontalAnchor>(
          behaviorContent.GetIntAttribute("leftEdgeAnchor"))))
      .SetType("Choice")
      .AddChoice("None", _("No anchor"))
      .AddChoice("WindowLeft", _("Window left"))
      .AddChoice("WindowCenter", _("Window center"))
      .AddChoice("WindowRight", _("Window right"))
      .AddChoice("Proportional", _("Proportional"))
      .SetLabel(_("Left edge"))
      .SetDescription(_("Anchor the left edge of the object on X axis."));

  properties["rightEdgeAnchor"]
      .SetValue(GetHorizontalAnchorAsString(static_cast<HorizontalAnchor>(
          behaviorContent.GetIntAttribute("rightEdgeAnchor"))))
      .SetType("Choice")
      .AddChoice("None", _("No anchor"))
      .AddChoice("WindowLeft", _("Window left"))
      .AddChoice("WindowCenter", _("Window center"))
      .AddChoice("WindowRight", _("Window right"))
      .AddChoice("Proportional", _("Proportional"))
      .SetLabel(_("Right edge"))
      .SetDescription(_("Anchor the right edge of the object on X axis."));

  properties["topEdgeAnchor"]
      .SetValue(GetVerticalAnchorAsString(static_cast<VerticalAnchor>(
          behaviorContent.GetIntAttribute("topEdgeAnchor"))))
      .SetType("Choice")
      .AddChoice("None", _("No anchor"))
      .AddChoice("WindowTop", _("Window top"))
      .AddChoice("WindowCenter", _("Window center"))
      .AddChoice("WindowBottom", _("Window bottom"))
      .AddChoice("Proportional", _("Proportional"))
      .SetLabel(_("Top edge"))
      .SetDescription(_("Anchor the top edge of the object on Y axis."));

  properties["bottomEdgeAnchor"]
      .SetValue(GetVerticalAnchorAsString(static_cast<VerticalAnchor>(
          behaviorContent.GetIntAttribute("bottomEdgeAnchor"))))
      .SetType("Choice")
      .AddChoice("None", _("No anchor"))
      .AddChoice("WindowTop", _("Window top"))
      .AddChoice("WindowCenter", _("Window center"))
      .AddChoice("WindowBottom", _("Window bottom"))
      .AddChoice("Proportional", _("Proportional"))
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
  auto normalizedValue = value.LowerCase();
  if (normalizedValue == "windowleft")
    return AnchorBehavior::ANCHOR_HORIZONTAL_WINDOW_LEFT;
  else if (normalizedValue == "windowright")
    return AnchorBehavior::ANCHOR_HORIZONTAL_WINDOW_RIGHT;
  else if (normalizedValue == "proportional")
    return AnchorBehavior::ANCHOR_HORIZONTAL_PROPORTIONAL;
  else if (normalizedValue == "windowcenter")
    return AnchorBehavior::ANCHOR_HORIZONTAL_WINDOW_CENTER;
  else
    return AnchorBehavior::ANCHOR_HORIZONTAL_NONE;
}

AnchorBehavior::VerticalAnchor GetVerticalAnchorFromString(
    const gd::String& value) {
  auto normalizedValue = value.LowerCase();
  if (normalizedValue == "windowtop")
    return AnchorBehavior::ANCHOR_VERTICAL_WINDOW_TOP;
  else if (normalizedValue == "windowbottom")
    return AnchorBehavior::ANCHOR_VERTICAL_WINDOW_BOTTOM;
  else if (normalizedValue == "proportional")
    return AnchorBehavior::ANCHOR_VERTICAL_PROPORTIONAL;
  else if (normalizedValue == "windowcenter")
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
