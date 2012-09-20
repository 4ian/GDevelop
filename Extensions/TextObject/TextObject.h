/**

Game Develop - Text Object Extension
Copyright (c) 2008-2012 Florian Rival (Florian.Rival@gmail.com)

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
#include "GDL/Object.h"
class ImageManager;
class RuntimeScene;
class Object;
class ImageManager;
class InitialPosition;
#if defined(GD_IDE_ONLY)
class wxBitmap;
class Game;
class wxWindow;
namespace gd { class MainFrameWrapper; }
namespace gd {class ResourcesMergingHelper;}
#endif

/**
 * Text Object
 */
class GD_EXTENSION_API TextObject : public Object
{
public :

    TextObject(std::string name_);
    virtual ~TextObject() {};
    virtual Object * Clone() const { return new TextObject(*this); }

    virtual bool LoadResources(const RuntimeScene & scene, const ImageManager & imageMgr );
    virtual bool InitializeFromInitialPosition(const InitialPosition & position);

    virtual bool Draw(sf::RenderTarget & renderTarget);

    #if defined(GD_IDE_ONLY)
    virtual bool DrawEdittime(sf::RenderTarget & renderTarget);
    virtual void ExposeResources(gd::ArbitraryResourceWorker & worker);
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail);

    virtual void EditObject( wxWindow* parent, Game & game_, gd::MainFrameWrapper & mainFrameWrapper_ );
    virtual wxPanel * CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position );
    virtual void UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position);

    virtual void GetPropertyForDebugger (unsigned int propertyNb, std::string & name, std::string & value) const;
    virtual bool ChangeProperty(unsigned int propertyNb, std::string newValue);
    virtual unsigned int GetNumberOfProperties() const;
    #endif

    virtual void LoadFromXml(const TiXmlElement * elemScene);
    #if defined(GD_IDE_ONLY)
    virtual void SaveToXml(TiXmlElement * elemScene);
    #endif

    virtual void UpdateTime(float timeElapsed);

    virtual void OnPositionChanged();

    virtual float GetWidth() const;
    virtual float GetHeight() const;
    virtual void SetWidth(float ) {};
    virtual void SetHeight(float ) {};

    virtual float GetDrawableX() const;
    virtual float GetDrawableY() const;

    virtual float GetCenterX() const;
    virtual float GetCenterY() const;

    virtual bool SetAngle(float newAngle) { angle = newAngle; text.SetRotation(angle); return true;};
    virtual float GetAngle() const {return angle;};

    inline void SetString(const std::string & str) { text.SetString(str); text.SetOrigin(text.GetRect().Width/2, text.GetRect().Height/2); };
    inline std::string GetString() const {return text.GetString();};

    inline void SetCharacterSize(float size) { text.SetCharacterSize(size); text.SetOrigin(text.GetRect().Width/2, text.GetRect().Height/2); };
    inline float GetCharacterSize() const { return text.GetCharacterSize(); };

    /**
     * Change the text object font filename.
     * Call ReloadFont to make the change effective
     */
    void SetFontFilename(const std::string & fontFilename);

    /**
     * Change the text object font filename and reload the font
     */
    void ChangeFont(const std::string & fontFilename);

    /**
     * Load the font according to font filename stored in the object.
     * \see SetFontFilename
     */
    void ReloadFont();

    /**
     * Return the font file name.
     */
    inline std::string GetFontFilename() const {return fontName; };

    void SetOpacity(float val);
    inline float GetOpacity() const {return opacity;};

    void SetColor(unsigned int r,unsigned int v,unsigned int b);
    inline unsigned int GetColorR() const { return colorR; };
    inline unsigned int GetColorG() const { return colorG; };
    inline unsigned int GetColorB() const { return colorB; };
    void SetColor(const std::string & colorStr);

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

    virtual std::vector<Polygon2d> GetHitBoxes() const;
private:

    //The text to display
    sf::Text text;
    std::string fontName;

    //Opacity
    float opacity;

    bool smoothed;

    //Color
    unsigned int colorR;
    unsigned int colorG;
    unsigned int colorB;

    float angle;
};

void DestroyTextObject(Object * object);
Object * CreateTextObject(std::string name);

#endif // TEXTOBJECT_H

