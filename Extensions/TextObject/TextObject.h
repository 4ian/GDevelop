/**

GDevelop - Text Object Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#pragma once

#include "GDCore/Project/ObjectConfiguration.h"
namespace gd {
class Project;
class Object;
class InitialInstance;
}  // namespace gd

/**
 * Text Object
 */
class GD_EXTENSION_API TextObject : public gd::ObjectConfiguration {
 public:
  TextObject();
  virtual ~TextObject();
  virtual std::unique_ptr<gd::ObjectConfiguration> Clone() const {
    return gd::make_unique<TextObject>(*this);
  }

  virtual void ExposeResources(gd::ArbitraryResourceWorker& worker);

  /** \brief Change the text.
   */
  inline void SetText(const gd::String& str) { text = str; };

  /** \brief Get the text.
   */
  inline const gd::String& GetText() const { return text; };

  /** \brief Change the character size.
   */
  inline void SetCharacterSize(double size) { characterSize = size; };

  /** \brief Get the character size.
   */
  inline double GetCharacterSize() const { return characterSize; };

  /** \brief Return the name of the font resource used for the text.
   */
  inline const gd::String& GetFontName() const { return fontName; };

  /** \brief Change the font resource used for the text.
   */
  void SetFontName(const gd::String& resourceName) { fontName = resourceName; };

  inline const gd::String& GetTextAlignment() const { return textAlignment; };
  void SetTextAlignment(const gd::String& textAlignment_) {
    textAlignment = textAlignment_;
  };

  bool IsBold() const { return bold; };
  void SetBold(bool enable) { bold = enable; };
  bool IsItalic() const { return italic; };
  void SetItalic(bool enable) { italic = enable; };
  bool IsUnderlined() const { return underlined; };
  void SetUnderlined(bool enable) { underlined = enable; };

  void SetSmooth(bool smooth) { smoothed = smooth; };
  bool IsSmoothed() const { return smoothed; };

  void SetColor(const gd::String& color_) {
    color = color_;
  };
  inline const gd::String& GetColor() const { return color; };

  void SetOutlineEnabled(bool smooth) { isOutlineEnabled = smooth; };
  bool IsOutlineEnabled() const { return isOutlineEnabled; };

  void SetOutlineThickness(double value) { outlineThickness = value; };
  double GetOutlineThickness() const { return outlineThickness; };

  void SetOutlineColor(const gd::String& color) {
    outlineColor = color;
  };
  const gd::String& GetOutlineColor() const { return outlineColor; };

  void SetShadowEnabled(bool smooth) { isShadowEnabled = smooth; };
  bool IsShadowEnabled() const { return isShadowEnabled; };

  void SetShadowColor(const gd::String& color) {
    shadowColor = color;
  };
  const gd::String& GetShadowColor() const { return shadowColor; };

  void SetShadowOpacity(double value) { shadowOpacity = value; };
  double GetShadowOpacity() const { return shadowOpacity; };

  void SetShadowAngle(double value) { shadowAngle = value; };
  double GetShadowAngle() const { return shadowAngle; };

  void SetShadowDistance(double value) { shadowDistance = value; };
  double GetShadowDistance() const { return shadowDistance; };

  void SetShadowBlurRadius(double value) { shadowBlurRadius = value; };
  double GetShadowBlurRadius() const { return shadowBlurRadius; };

 private:
  virtual void DoUnserializeFrom(gd::Project& project,
                                 const gd::SerializerElement& element);
  virtual void DoSerializeTo(gd::SerializerElement& element) const;

  gd::String text;
  double characterSize;
  gd::String fontName;
  bool smoothed;
  bool bold, italic, underlined;
  gd::String color;
  gd::String textAlignment;

  bool isOutlineEnabled;
  double outlineThickness;
  gd::String outlineColor;

  bool isShadowEnabled;
  gd::String shadowColor;
  double shadowOpacity;
  double shadowAngle;
  double shadowDistance;
  double shadowBlurRadius;
};
