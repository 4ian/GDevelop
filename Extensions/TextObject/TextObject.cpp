/**

GDevelop - Text Object Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "TextObject.h"

#include "GDCore/CommonTools.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"

using namespace std;

TextObject::TextObject()
    : text("Text"),
      characterSize(20),
      fontName(""),
      smoothed(true),
      bold(false),
      italic(false),
      underlined(false),
      color("0;0;0"),
      textAlignment("left"),
      verticalTextAlignment("top"),
      isOutlineEnabled(false),
      outlineThickness(2),
      outlineColor("255;255;255"),
      isShadowEnabled(false),
      shadowColor("0;0;0"),
      shadowOpacity(127),
      shadowAngle(90),
      shadowDistance(4),
      shadowBlurRadius(2) {}

TextObject::~TextObject() {};

bool TextObject::UpdateProperty(const gd::String& propertyName,
                                const gd::String& newValue) {
  if (propertyName == "text") {
    text = newValue;
    return true;
  }
  if (propertyName == "characterSize") {
    characterSize = newValue.To<double>();
    return true;
  }
  if (propertyName == "font") {
    fontName = newValue;
    return true;
  }
  if (propertyName == "bold") {
    bold = newValue == "1";
    return true;
  }
  if (propertyName == "italic") {
    italic = newValue == "1";
    return true;
  }
  if (propertyName == "color") {
    color = newValue;
    return true;
  }
  if (propertyName == "textAlignment") {
    textAlignment = newValue;
    return true;
  }
  if (propertyName == "verticalTextAlignment") {
    verticalTextAlignment = newValue;
    return true;
  }
  if (propertyName == "isOutlineEnabled") {
    isOutlineEnabled = newValue == "1";
    return true;
  }
  if (propertyName == "outlineColor") {
    outlineColor = newValue;
    return true;
  }
  if (propertyName == "outlineThickness") {
    outlineThickness = newValue.To<double>();
    return true;
  }
  if (propertyName == "isShadowEnabled") {
    isShadowEnabled = newValue == "1";
    return true;
  }
  if (propertyName == "shadowColor") {
    shadowColor = newValue;
    return true;
  }
  if (propertyName == "shadowOpacity") {
    shadowOpacity = newValue.To<double>();
    return true;
  }
  if (propertyName == "shadowAngle") {
    shadowAngle = newValue.To<double>();
    return true;
  }
  if (propertyName == "shadowDistance") {
    shadowDistance = newValue.To<double>();
    return true;
  }
  if (propertyName == "shadowBlurRadius") {
    shadowBlurRadius = newValue.To<double>();
    return true;
  }

  return false;
}

std::map<gd::String, gd::PropertyDescriptor> TextObject::GetProperties() const {
  std::map<gd::String, gd::PropertyDescriptor> objectProperties;

  objectProperties["text"]
      .SetValue(text)
      .SetType("textarea")
      .SetLabel(_("Text"));

  objectProperties["characterSize"]
      .SetValue(gd::String::From(characterSize))
      .SetType("number")
      .SetLabel(_("Font size"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Font"));

  objectProperties["font"]
      .SetValue(fontName)
      .SetType("resource")
      .AddExtraInfo("font")
      .SetLabel(_("Font"))
      .SetGroup(_("Font"))
      .SetQuickCustomizationVisibility(gd::QuickCustomization::Hidden);

  objectProperties["bold"]
      .SetValue(bold ? "true" : "false")
      .SetType("boolean")
      .SetLabel(_("Bold"))
      .SetGroup(_("Font"))
      .SetQuickCustomizationVisibility(gd::QuickCustomization::Hidden);

  objectProperties["italic"]
      .SetValue(italic ? "true" : "false")
      .SetType("boolean")
      .SetLabel(_("Italic"))
      .SetGroup(_("Font"))
      .SetQuickCustomizationVisibility(gd::QuickCustomization::Hidden);

  objectProperties["color"]
      .SetValue(color)
      .SetType("color")
      .SetLabel(_("Color"))
      .SetGroup(_("Font"));

  objectProperties["textAlignment"]
      .SetValue(textAlignment)
      .SetType("choice")
      .AddExtraInfo("left")
      .AddExtraInfo("center")
      .AddExtraInfo("right")
      .SetLabel(_("Alignment"))
      .SetDescription(_("Alignment of the text when multiple lines are displayed"))
      .SetGroup(_("Font"))
      .SetQuickCustomizationVisibility(gd::QuickCustomization::Hidden);

  objectProperties["verticalTextAlignment"]
      .SetValue(verticalTextAlignment)
      .SetType("choice")
      .AddExtraInfo("top")
      .AddExtraInfo("center")
      .AddExtraInfo("bottom")
      .SetLabel(_("Vertical alignment"))
      .SetGroup(_("Font"))
      .SetQuickCustomizationVisibility(gd::QuickCustomization::Hidden);

  objectProperties["isOutlineEnabled"]
      .SetValue(isOutlineEnabled ? "true" : "false")
      .SetType("boolean")
      .SetLabel(_("Show outline"))
      .SetGroup(_("Outline"))
      .SetAdvanced()
      .SetQuickCustomizationVisibility(gd::QuickCustomization::Hidden);

  objectProperties["outlineColor"]
      .SetValue(outlineColor)
      .SetType("color")
      .SetLabel(_("Color"))
      .SetGroup(_("Outline"))
      .SetAdvanced()
      .SetQuickCustomizationVisibility(gd::QuickCustomization::Hidden);

  objectProperties["outlineThickness"]
      .SetValue(gd::String::From(outlineThickness))
      .SetType("number")
      .SetLabel(_("Thickness"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Outline"))
      .SetAdvanced()
      .SetQuickCustomizationVisibility(gd::QuickCustomization::Hidden);

  objectProperties["isShadowEnabled"]
      .SetValue(isShadowEnabled ? "true" : "false")
      .SetType("boolean")
      .SetLabel(_("Show shadow"))
      .SetGroup(_("Shadow"))
      .SetAdvanced()
      .SetQuickCustomizationVisibility(gd::QuickCustomization::Hidden);

  objectProperties["shadowColor"]
      .SetValue(shadowColor)
      .SetType("color")
      .SetLabel(_("Color"))
      .SetGroup(_("Shadow"))
      .SetAdvanced()
      .SetQuickCustomizationVisibility(gd::QuickCustomization::Hidden);

  objectProperties["shadowOpacity"]
      .SetValue(gd::String::From(shadowOpacity))
      .SetType("number")
      .SetLabel(_("Opacity"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Shadow"))
      .SetAdvanced()
      .SetQuickCustomizationVisibility(gd::QuickCustomization::Hidden);

  objectProperties["shadowAngle"]
      .SetValue(gd::String::From(shadowAngle))
      .SetType("number")
      .SetLabel(_("Angle"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetDegreeAngle())
      .SetGroup(_("Shadow"))
      .SetAdvanced()
      .SetQuickCustomizationVisibility(gd::QuickCustomization::Hidden);

  objectProperties["shadowDistance"]
      .SetValue(gd::String::From(shadowDistance))
      .SetType("number")
      .SetLabel(_("Distance"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Shadow"))
      .SetAdvanced()
      .SetQuickCustomizationVisibility(gd::QuickCustomization::Hidden);

  objectProperties["shadowBlurRadius"]
      .SetValue(gd::String::From(shadowBlurRadius))
      .SetType("number")
      .SetLabel(_("Blur radius"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Shadow"))
      .SetAdvanced()
      .SetQuickCustomizationVisibility(gd::QuickCustomization::Hidden);

  return objectProperties;
}

void TextObject::DoUnserializeFrom(gd::Project& project,
                                   const gd::SerializerElement& element) {
  // Compatibility with GD <= 5.3.188
  // end of compatibility code
  bool isLegacy = !element.HasChild("content");
  auto& content = isLegacy ? element : element.GetChild("content");

  SetFontName(content.GetChild("font", 0, "Font").GetValue().GetString());
  SetTextAlignment(content.GetChild("textAlignment").GetValue().GetString());
  SetVerticalTextAlignment(content.GetStringAttribute("verticalTextAlignment", "top"));
  SetCharacterSize(content.GetChild("characterSize", 0, "CharacterSize")
                       .GetValue()
                       .GetInt());
  smoothed = content.GetBoolAttribute("smoothed");
  bold = content.GetBoolAttribute("bold");
  italic = content.GetBoolAttribute("italic");
  underlined = content.GetBoolAttribute("underlined");

  // Compatibility with GD <= 5.3.188
  if (isLegacy) {
    SetText(content.GetChild("string", 0, "String").GetValue().GetString());
    SetColor(
        gd::String::From(
            content.GetChild("color", 0, "Color").GetIntAttribute("r", 255)) +
        ";" +
        gd::String::From(
            content.GetChild("color", 0, "Color").GetIntAttribute("g", 255)) +
        ";" +
        gd::String::From(
            content.GetChild("color", 0, "Color").GetIntAttribute("b", 255)));
  } else
  // end of compatibility code
  {
    SetText(content.GetStringAttribute("text"));
    SetColor(content.GetStringAttribute("color", "0;0;0"));

    SetOutlineEnabled(content.GetBoolAttribute("isOutlineEnabled", false));
    SetOutlineThickness(content.GetIntAttribute("outlineThickness", 2));
    SetOutlineColor(content.GetStringAttribute("outlineColor", "255;255;255"));

    SetShadowEnabled(content.GetBoolAttribute("isShadowEnabled", false));
    SetShadowColor(content.GetStringAttribute("shadowColor", "0;0;0"));
    SetShadowOpacity(content.GetIntAttribute("shadowOpacity", 127));
    SetShadowAngle(content.GetIntAttribute("shadowAngle", 90));
    SetShadowDistance(content.GetIntAttribute("shadowDistance", 4));
    SetShadowBlurRadius(content.GetIntAttribute("shadowBlurRadius", 2));
  }
}

void TextObject::DoSerializeTo(gd::SerializerElement& element) const {
  // Allow users to rollback to 5.3.188 or older releases without loosing their
  // configuration.
  // TODO Remove this in a few releases.
  // Compatibility with GD <= 5.3.188
  {
    element.AddChild("string").SetValue(GetText());
    element.AddChild("font").SetValue(GetFontName());
    element.AddChild("textAlignment").SetValue(GetTextAlignment());
    element.AddChild("characterSize").SetValue(GetCharacterSize());
    auto colorComponents = GetColor().Split(';');
    element.AddChild("color")
        .SetAttribute(
            "r", colorComponents.size() == 3 ? colorComponents[0].To<int>() : 0)
        .SetAttribute(
            "g", colorComponents.size() == 3 ? colorComponents[1].To<int>() : 0)
        .SetAttribute(
            "b",
            colorComponents.size() == 3 ? colorComponents[2].To<int>() : 0);
    element.SetAttribute("smoothed", smoothed);
    element.SetAttribute("bold", bold);
    element.SetAttribute("italic", italic);
    element.SetAttribute("underlined", underlined);
  }
  // end of compatibility code

  auto& content = element.AddChild("content");
  content.AddChild("text").SetValue(GetText());
  content.AddChild("font").SetValue(GetFontName());
  content.AddChild("textAlignment").SetValue(GetTextAlignment());
  content.AddChild("verticalTextAlignment").SetValue(GetVerticalTextAlignment());
  content.AddChild("characterSize").SetValue(GetCharacterSize());
  content.AddChild("color").SetValue(GetColor());

  content.SetAttribute("smoothed", smoothed);
  content.SetAttribute("bold", bold);
  content.SetAttribute("italic", italic);
  content.SetAttribute("underlined", underlined);

  content.SetAttribute("isOutlineEnabled", isOutlineEnabled);
  content.SetAttribute("outlineThickness", outlineThickness);
  content.SetAttribute("outlineColor", outlineColor);

  content.SetAttribute("isShadowEnabled", isShadowEnabled);
  content.SetAttribute("shadowColor", shadowColor);
  content.SetAttribute("shadowOpacity", shadowOpacity);
  content.SetAttribute("shadowAngle", shadowAngle);
  content.SetAttribute("shadowDistance", shadowDistance);
  content.SetAttribute("shadowBlurRadius", shadowBlurRadius);
}

void TextObject::ExposeResources(gd::ArbitraryResourceWorker& worker) {
  worker.ExposeFont(fontName);
}
