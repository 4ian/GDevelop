/**

GDevelop - Text Object Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef TEXTOBJECT_H
#define TEXTOBJECT_H
#include "GDCore/Project/ObjectConfiguration.h"
namespace gd {
class Project;
class Object;
class InitialInstance;
}

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

#if defined(GD_IDE_ONLY)
  virtual void ExposeResources(gd::ArbitraryResourceWorker& worker,
                               gd::ResourcesManager *resourcesManager);
#endif

  /** \brief Change the text.
   */
  inline void SetString(const gd::String& str) { text = str; };

  /** \brief Get the text.
   */
  inline const gd::String& GetString() const { return text; };

  /** \brief Change the character size.
   */
  inline void SetCharacterSize(float size) { characterSize = size; };

  /** \brief Get the character size.
   */
  inline float GetCharacterSize() const { return characterSize; };

  /** \brief Return the name of the font resource used for the text.
   */
  inline const gd::String& GetFontName() const { return fontName; };

  /** \brief Change the font resource used for the text.
   */
  void SetFontName(const gd::String& resourceName) { fontName = resourceName; };

  bool IsBold() const { return bold; };
  void SetBold(bool enable) { bold = enable; };
  bool IsItalic() const { return italic; };
  void SetItalic(bool enable) { italic = enable; };
  bool IsUnderlined() const { return underlined; };
  void SetUnderlined(bool enable) { underlined = enable; };

  void SetSmooth(bool smooth) { smoothed = smooth; };
  bool IsSmoothed() const { return smoothed; };

  void SetColor(unsigned int r, unsigned int g, unsigned int b) {
    colorR = r;
    colorG = g;
    colorB = b;
  };
  unsigned int GetColorR() const { return colorR; };
  unsigned int GetColorG() const { return colorG; };
  unsigned int GetColorB() const { return colorB; };

 private:
  virtual void DoUnserializeFrom(gd::Project& project,
                                 const gd::SerializerElement& element);
#if defined(GD_IDE_ONLY)
  virtual void DoSerializeTo(gd::SerializerElement& element) const;
#endif

  gd::String text;
  float characterSize;
  gd::String fontName;
  bool smoothed;
  bool bold, italic, underlined;
  unsigned int colorR;
  unsigned int colorG;
  unsigned int colorB;
};

#endif  // TEXTOBJECT_H
