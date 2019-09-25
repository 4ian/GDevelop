/**

GDevelop - Text Object Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include <SFML/Graphics.hpp>
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/FontManager.h"
#include "GDCpp/Runtime/ImageManager.h"
#include "GDCpp/Runtime/Polygon2d.h"
#include "GDCpp/Runtime/Project/InitialInstance.h"
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
#include "TextObject.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
namespace gd {
class MainFrameWrapper;
}
#endif

using namespace std;

TextObject::TextObject(gd::String name_)
    : Object(name_),
      text("Text"),
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

/* RuntimeTextObject : */

RuntimeTextObject::RuntimeTextObject(RuntimeScene& scene,
                                     const TextObject& textObject)
    : RuntimeObject(scene, textObject), opacity(255), angle(0) {
  ChangeFont(textObject.GetFontName());
  SetSmooth(textObject.IsSmoothed());
  SetColor(
      textObject.GetColorR(), textObject.GetColorG(), textObject.GetColorB());
  SetString(textObject.GetString());
  SetCharacterSize(textObject.GetCharacterSize());
  SetAngle(0);
  SetBold(textObject.IsBold());
  SetItalic(textObject.IsItalic());
  SetUnderlined(textObject.IsUnderlined());
}

bool RuntimeTextObject::Draw(sf::RenderTarget& renderTarget) {
  if (hidden) return true;  // Don't draw anything if hidden

  renderTarget.draw(text);
  return true;
}

void RuntimeTextObject::OnPositionChanged() {
  text.setPosition(GetX() + text.getOrigin().x, GetY() + text.getOrigin().y);
}

/**
 * RuntimeTextObject provides a basic bounding box.
 */
std::vector<Polygon2d> RuntimeTextObject::GetHitBoxes() const {
  std::vector<Polygon2d> mask;
  Polygon2d rectangle = Polygon2d::CreateRectangle(GetWidth(), GetHeight());
  rectangle.Rotate(GetAngle() / 180 * 3.14159);
  rectangle.Move(GetX() + GetCenterX(), GetY() + GetCenterY());

  mask.push_back(rectangle);
  return mask;
}

/**
 * Get the real X position of the sprite
 */
float RuntimeTextObject::GetDrawableX() const {
  return text.getPosition().x - text.getOrigin().x;
}

/**
 * Get the real Y position of the text
 */
float RuntimeTextObject::GetDrawableY() const {
  return text.getPosition().y - text.getOrigin().y;
}

/**
 * Width is the width of the current sprite.
 */
float RuntimeTextObject::GetWidth() const {
  return text.getLocalBounds().width;
}

/**
 * Height is the height of the current sprite.
 */
float RuntimeTextObject::GetHeight() const {
  return text.getLocalBounds().height + text.getLocalBounds().top;
}

void RuntimeTextObject::SetString(const gd::String& str) {
  text.setString(str);
  text.setOrigin(text.getLocalBounds().width / 2,
                 text.getLocalBounds().height / 2);
}

gd::String RuntimeTextObject::GetString() const { return text.getString(); }

/**
 * Change the color filter of the sprite object
 */
void RuntimeTextObject::SetColor(unsigned int r,
                                 unsigned int g,
                                 unsigned int b) {
  text.setFillColor(sf::Color(r, g, b, opacity));
}

void RuntimeTextObject::SetColor(const gd::String& colorStr) {
  std::vector<gd::String> colors = colorStr.Split(U';');

  if (colors.size() < 3) return;  // La couleur est incorrecte

  SetColor(colors[0].To<int>(), colors[1].To<int>(), colors[2].To<int>());
}

void RuntimeTextObject::SetOpacity(float val) {
  if (val > 255)
    val = 255;
  else if (val < 0)
    val = 0;

  opacity = val;
  const sf::Color& currentColor = text.getFillColor();
  text.setFillColor(
      sf::Color(currentColor.r, currentColor.g, currentColor.b, opacity));
}

void RuntimeTextObject::ChangeFont(const gd::String& fontName_) {
  if (!text.getFont() || fontName_ != fontName) {
    fontName = fontName_;
    text.setFont(*FontManager::Get()->GetFont(fontName));
    text.setOrigin(text.getLocalBounds().width / 2,
                   text.getLocalBounds().height / 2);
    OnPositionChanged();
    SetSmooth(smoothed);  // Ensure texture smoothing is up to date.
  }
}

void RuntimeTextObject::SetFontStyle(int style) { text.setStyle(style); }

int RuntimeTextObject::GetFontStyle() { return text.getStyle(); }

bool RuntimeTextObject::HasFontStyle(sf::Text::Style style) {
  return (text.getStyle() & style) != 0;
}

bool RuntimeTextObject::IsBold() { return HasFontStyle(sf::Text::Bold); }

void RuntimeTextObject::SetBold(bool bold) {
  SetFontStyle((bold ? sf::Text::Bold : 0) |
               (IsItalic() ? sf::Text::Italic : 0) |
               (IsUnderlined() ? sf::Text::Underlined : 0));
}

bool RuntimeTextObject::IsItalic() { return HasFontStyle(sf::Text::Italic); }

void RuntimeTextObject::SetItalic(bool italic) {
  SetFontStyle((IsBold() ? sf::Text::Bold : 0) |
               (italic ? sf::Text::Italic : 0) |
               (IsUnderlined() ? sf::Text::Underlined : 0));
}

bool RuntimeTextObject::IsUnderlined() {
  return HasFontStyle(sf::Text::Underlined);
}

void RuntimeTextObject::SetUnderlined(bool underlined) {
  SetFontStyle((IsBold() ? sf::Text::Bold : 0) |
               (IsItalic() ? sf::Text::Italic : 0) |
               (underlined ? sf::Text::Underlined : 0));
}

void RuntimeTextObject::SetSmooth(bool smooth) {
  smoothed = smooth;

  if (text.getFont())
    const_cast<sf::Texture&>(text.getFont()->getTexture(GetCharacterSize()))
        .setSmooth(smooth);
}

#if defined(GD_IDE_ONLY)
void RuntimeTextObject::GetPropertyForDebugger(std::size_t propertyNb,
                                               gd::String& name,
                                               gd::String& value) const {
  if (propertyNb == 0) {
    name = _("Text");
    value = GetString();
  } else if (propertyNb == 1) {
    name = _("Font");
    value = GetFontName();
  } else if (propertyNb == 2) {
    name = _("Font Size");
    value = gd::String::From(GetCharacterSize());
  } else if (propertyNb == 3) {
    name = _("Color");
    value = gd::String::From(GetColorR()) + ";" +
            gd::String::From(GetColorG()) + ";" + gd::String::From(GetColorB());
  } else if (propertyNb == 4) {
    name = _("Opacity");
    value = gd::String::From(GetOpacity());
  } else if (propertyNb == 5) {
    name = _("Smoothing");
    value = smoothed ? _("Yes") : _("No");
  }
}

bool RuntimeTextObject::ChangeProperty(std::size_t propertyNb,
                                       gd::String newValue) {
  if (propertyNb == 0) {
    SetString(newValue);
    return true;
  } else if (propertyNb == 1) {
    ChangeFont(newValue);
  } else if (propertyNb == 2) {
    SetCharacterSize(std::max(1, newValue.To<int>()));
  } else if (propertyNb == 3) {
    gd::String r, gb, g, b;
    {
      size_t separationPos = newValue.find(";");

      if (separationPos > newValue.length()) return false;

      r = newValue.substr(0, separationPos);
      gb = newValue.substr(separationPos + 1, newValue.length());
    }

    {
      size_t separationPos = gb.find(";");

      if (separationPos > gb.length()) return false;

      g = gb.substr(0, separationPos);
      b = gb.substr(separationPos + 1, gb.length());
    }

    SetColor(r.To<int>(), g.To<int>(), b.To<int>());
  } else if (propertyNb == 4) {
    SetOpacity(std::min(std::max(0.0f, newValue.To<float>()), 255.0f));
  } else if (propertyNb == 5) {
    SetSmooth(!(newValue == _("No")));
  }

  return true;
}

std::size_t RuntimeTextObject::GetNumberOfProperties() const { return 6; }
#endif
