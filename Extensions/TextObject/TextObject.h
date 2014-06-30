/**

Game Develop - Text Object Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#ifndef TEXTOBJECT_H
#define TEXTOBJECT_H

#include <SFML/Graphics/Text.hpp>
#include "GDCpp/Object.h"
#include "GDCpp/RuntimeObject.h"
class ImageManager;
class RuntimeScene;
namespace gd { class Object; }
namespace gd { class ImageManager; }
namespace gd { class InitialInstance; }
#if defined(GD_IDE_ONLY)
class wxBitmap;
namespace gd { class Project; }
class wxWindow;
namespace gd { class MainFrameWrapper; }
namespace gd {class ResourcesMergingHelper;}
#endif

/**
 * Text Object
 */
class GD_EXTENSION_API TextObject : public gd::Object
{
public :

    TextObject(std::string name_);
    virtual ~TextObject();
    virtual gd::Object * Clone() const { return new TextObject(*this); }

    #if defined(GD_IDE_ONLY)
    virtual void DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout);
    virtual sf::Vector2f GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const;
    virtual void ExposeResources(gd::ArbitraryResourceWorker & worker);
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const;
    virtual void EditObject( wxWindow* parent, gd::Project & game_, gd::MainFrameWrapper & mainFrameWrapper_ );
    virtual void LoadResources(gd::Project & project, gd::Layout & layout);
    #endif

    /** \brief Change the text.
     */
    inline void SetString(const std::string & str) { text = str; };

    /** \brief Get the text.
     */
    inline std::string GetString() const { return text; };

    /** \brief Change the character size.
     */
    inline void SetCharacterSize(float size) { characterSize = size; };

    /** \brief Get the character size.
     */
    inline float GetCharacterSize() const { return characterSize; };

    /** \brief Return the font filename.
     */
    inline std::string GetFontFilename() const {return fontName; };

    /** \brief Change the font filename.
     */
    void SetFontFilename(const std::string & fontFilename) { fontName = fontFilename; };

    bool IsBold() const { return bold; };
    void SetBold(bool enable) { bold = enable; };
    bool IsItalic() const { return italic; };
    void SetItalic(bool enable) { italic = enable; };
    bool IsUnderlined() const { return underlined; };
    void SetUnderlined(bool enable) { underlined = enable; };

    void SetSmooth(bool smooth) { smoothed = smooth; };
    bool IsSmoothed() const {return smoothed;};

    void SetColor(unsigned int r, unsigned int g, unsigned int b) { colorR = r; colorG = g; colorB = b; };
    unsigned int GetColorR() const { return colorR; };
    unsigned int GetColorG() const { return colorG; };
    unsigned int GetColorB() const { return colorB; };

private:

    virtual void DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element);
    #if defined(GD_IDE_ONLY)
    virtual void DoSerializeTo(gd::SerializerElement & element) const;
    #endif

    std::string text;
    float characterSize;
    std::string fontName;
    bool smoothed;
    bool bold, italic, underlined;
    unsigned int colorR;
    unsigned int colorG;
    unsigned int colorB;
    #if defined(GD_IDE_ONLY)
    const sf::Font * font; ///< The font used to render the object in the IDE. This is just a pointer to a font stored in the FontManager.
    #endif
};

class GD_EXTENSION_API RuntimeTextObject : public RuntimeObject
{
public :

    RuntimeTextObject(RuntimeScene & scene, const gd::Object & object);
    virtual ~RuntimeTextObject() {};
    virtual RuntimeObject * Clone() const { return new RuntimeTextObject(*this);}

    virtual bool Draw(sf::RenderTarget & renderTarget);

    virtual void OnPositionChanged();

    virtual float GetWidth() const;
    virtual float GetHeight() const;

    virtual float GetDrawableX() const;
    virtual float GetDrawableY() const;

    virtual bool SetAngle(float newAngle) { angle = newAngle; text.setRotation(angle); return true;};
    virtual float GetAngle() const {return angle;};

    inline void SetString(const std::string & str) { text.setString(str); text.setOrigin(text.getLocalBounds().width/2, text.getLocalBounds().height/2); };
    inline std::string GetString() const {return text.getString();};

    inline void SetCharacterSize(float size) { text.setCharacterSize(size); text.setOrigin(text.getLocalBounds().width/2, text.getLocalBounds().height/2); };
    inline float GetCharacterSize() const { return text.getCharacterSize(); };

    /** \brief Change the text object font filename and reload the font
     */
    void ChangeFont(const std::string & fontFilename);

    /** \brief Return the font file name.
     */
    inline std::string GetFontFilename() const {return fontName; };

    void SetFontStyle(int style);
    int GetFontStyle();
    bool HasFontStyle(sf::Text::Style style);

    bool IsBold();
    void SetBold(bool bold);
    bool IsItalic();
    void SetItalic(bool italic);
    bool IsUnderlined();
    void SetUnderlined(bool underlined);

    void SetSmooth(bool smooth);
    bool IsSmoothed() const {return smoothed;};

    void SetOpacity(float val);
    float GetOpacity() const { return opacity; };

    void SetColor(unsigned int r, unsigned int g, unsigned int b);
    void SetColor(const std::string & colorStr);
    unsigned int GetColorR() const { return text.getColor().r; };
    unsigned int GetColorG() const { return text.getColor().g; };
    unsigned int GetColorB() const { return text.getColor().b; };

    virtual std::vector<Polygon2d> GetHitBoxes() const;

    #if defined(GD_IDE_ONLY)
    virtual void GetPropertyForDebugger (unsigned int propertyNb, std::string & name, std::string & value) const;
    virtual bool ChangeProperty(unsigned int propertyNb, std::string newValue);
    virtual unsigned int GetNumberOfProperties() const;
    #endif

private:
    sf::Text text;
    std::string fontName;
    float opacity;
    bool smoothed;
    float angle;
};

void DestroyTextObject(gd::Object * object);
gd::Object * CreateTextObject(std::string name);

void DestroyRuntimeTextObject(RuntimeObject * object);
RuntimeObject * CreateRuntimeTextObject(RuntimeScene & scene, const gd::Object & object);

#endif // TEXTOBJECT_H

