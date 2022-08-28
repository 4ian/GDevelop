/**

GDevelop - Text Object Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCore/Tools/Localization.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "TextObject.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#endif

using namespace std;

TextObject::TextObject()
    : text("Text"),
      characterSize(20),
      fontName(""),
      smoothed(true),
      bold(false),
      italic(false),
      underlined(false),
      colorR(0),
      colorG(0),
      colorB(0)
{
}

TextObject::~TextObject(){};

void TextObject::DoUnserializeFrom(gd::Project& project,
                                   const gd::SerializerElement& element) {
  SetString(element.GetChild("string", 0, "String").GetValue().GetString());
  SetFontName(element.GetChild("font", 0, "Font").GetValue().GetString());
  SetCharacterSize(element.GetChild("characterSize", 0, "CharacterSize")
                       .GetValue()
                       .GetInt());
  SetColor(element.GetChild("color", 0, "Color").GetIntAttribute("r", 255),
           element.GetChild("color", 0, "Color").GetIntAttribute("g", 255),
           element.GetChild("color", 0, "Color").GetIntAttribute("b", 255));

  smoothed = element.GetBoolAttribute("smoothed");
  bold = element.GetBoolAttribute("bold");
  italic = element.GetBoolAttribute("italic");
  underlined = element.GetBoolAttribute("underlined");
}

#if defined(GD_IDE_ONLY)
void TextObject::DoSerializeTo(gd::SerializerElement& element) const {
  element.AddChild("string").SetValue(GetString());
  element.AddChild("font").SetValue(GetFontName());
  element.AddChild("characterSize").SetValue(GetCharacterSize());
  element.AddChild("color")
      .SetAttribute("r", (int)GetColorR())
      .SetAttribute("g", (int)GetColorG())
      .SetAttribute("b", (int)GetColorB());

  element.SetAttribute("smoothed", smoothed);
  element.SetAttribute("bold", bold);
  element.SetAttribute("italic", italic);
  element.SetAttribute("underlined", underlined);
}

void TextObject::ExposeResources(gd::ArbitraryResourceWorker& worker) {
  worker.ExposeFont(fontName);
}
#endif
