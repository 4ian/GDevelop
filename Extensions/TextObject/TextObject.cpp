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

#if defined(GD_IDE_ONLY)
#include "TextObjectEditor.h" //Must be placed first, otherwise we get errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#endif
#include <SFML/Graphics.hpp>
#include "GDL/Object.h"

#include "GDL/ImageManager.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/FontManager.h"
#include "GDL/Position.h"
#include "GDL/Polygon.h"
#include "GDL/CommonTools.h"
#include "GDL/XmlMacros.h"
#include "TextObject.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/ArbitraryResourceWorker.h"
namespace gd { class MainFrameWrapper; }
#endif

TextObject::TextObject(std::string name_) :
Object(name_),
opacity( 255 ),
smoothed(true),
colorR( 255 ),
colorG( 255 ),
colorB( 255 ),
angle(0)
{
    SetString("Text");
}

void TextObject::LoadFromXml(const TiXmlElement * elem)
{
    if ( elem->FirstChildElement( "String" ) == NULL ||
         elem->FirstChildElement( "String" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant le texte d'un objet Text manquent.";
    }
    else
    {
        SetString(elem->FirstChildElement("String")->Attribute("value"));
    }

    if ( elem->FirstChildElement( "Font" ) == NULL ||
         elem->FirstChildElement( "Font" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant la police d'un objet Text manquent.";
    }
    else
    {
        SetFontFilename(elem->FirstChildElement("Font")->Attribute("value"));
    }

    if ( elem->FirstChildElement( "CharacterSize" ) == NULL ||
         elem->FirstChildElement( "CharacterSize" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant la taille du texte d'un objet Text manquent.";
    }
    else
    {
        float size = 20;
        elem->FirstChildElement("CharacterSize")->QueryFloatAttribute("value", &size);

        SetCharacterSize(size);
    }

    if ( elem->FirstChildElement( "Color" ) == NULL ||
         elem->FirstChildElement( "Color" )->Attribute("r") == NULL ||
         elem->FirstChildElement( "Color" )->Attribute("g") == NULL ||
         elem->FirstChildElement( "Color" )->Attribute("b") == NULL )
    {
        cout << "Les informations concernant la couleur du texte d'un objet Text manquent.";
    }
    else
    {
        int r = 255;
        int g = 255;
        int b = 255;
        elem->FirstChildElement("Color")->QueryIntAttribute("r", &r);
        elem->FirstChildElement("Color")->QueryIntAttribute("g", &g);
        elem->FirstChildElement("Color")->QueryIntAttribute("b", &b);

        SetColor(r,g,b);
    }

    if ( elem->FirstChildElement( "Style" ) == NULL ||
         elem->FirstChildElement( "Style" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant le style du texte manquent.";
    }
    else
    {
        int style = 0;
        elem->FirstChildElement("Style")->QueryIntAttribute("value", &style);

        SetFontStyle(style);
    }

    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("smoothed", smoothed);
    SetSmooth(smoothed);
}

#if defined(GD_IDE_ONLY)
void TextObject::SaveToXml(TiXmlElement * elem)
{
    TiXmlElement * str = new TiXmlElement( "String" );
    elem->LinkEndChild( str );
    str->SetAttribute("value", GetString().c_str());

    TiXmlElement * font = new TiXmlElement( "Font" );
    elem->LinkEndChild( font );
    font->SetAttribute("value", GetFontFilename().c_str());

    TiXmlElement * characterSize = new TiXmlElement( "CharacterSize" );
    elem->LinkEndChild( characterSize );
    characterSize->SetAttribute("value", GetCharacterSize());

    TiXmlElement * color = new TiXmlElement( "Color" );
    elem->LinkEndChild( color );
    color->SetAttribute("r", GetColorR());
    color->SetAttribute("g", GetColorG());
    color->SetAttribute("b", GetColorB());

    TiXmlElement * style = new TiXmlElement( "Style" );
    style->SetAttribute("value", GetFontStyle());
    elem->LinkEndChild( style );

    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("smoothed", smoothed);
}
#endif

bool TextObject::LoadResources(const RuntimeScene & scene, const ImageManager & imageMgr )
{
    ReloadFont();

    return true;
}

/**
 * Update animation and direction from the inital position
 */
bool TextObject::InitializeFromInitialPosition(const InitialPosition & position)
{
    return true;
}

/**
 * Render object at runtime
 */
bool TextObject::Draw( sf::RenderTarget& renderTarget )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;

    renderTarget.Draw( text );

    return true;
}

#if defined(GD_IDE_ONLY)
/**
 * Render object at edittime
 */
bool TextObject::DrawEdittime( sf::RenderTarget& renderTarget )
{
    renderTarget.Draw( text );

    return true;
}

void TextObject::ExposeResources(gd::ArbitraryResourceWorker & worker)
{
    worker.ExposeResource(fontName);
}

bool TextObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail)
{
    thumbnail = wxBitmap("Extensions/texticon.png", wxBITMAP_TYPE_ANY);

    return true;
}

void TextObject::EditObject( wxWindow* parent, Game & game, gd::MainFrameWrapper & mainFrameWrapper )
{
    TextObjectEditor dialog(parent, game, *this, mainFrameWrapper);
    dialog.ShowModal();
}

wxPanel * TextObject::CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position )
{
    return NULL;
}

void TextObject::UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position)
{
}

void TextObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Text");                     value = GetString();}
    else if ( propertyNb == 1 ) {name = _("Font");                    value = GetFontFilename();}
    else if ( propertyNb == 2 ) {name = _("Font Size");      value = ToString(GetCharacterSize());}
    else if ( propertyNb == 3 ) {name = _("Color");       value = ToString(GetColorR())+";"+ToString(GetColorG())+";"+ToString(GetColorB());}
    else if ( propertyNb == 4 ) {name = _("Opacity");       value = ToString(GetOpacity());}
    else if ( propertyNb == 5 ) {name = _("Smoothing");       value = smoothed ? _("Yes") : _("No");}
}

bool TextObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if      ( propertyNb == 0 ) { SetString(newValue); return true; }
    else if ( propertyNb == 1 ) { SetFontFilename(newValue); }
    else if ( propertyNb == 2 ) { SetCharacterSize(ToInt(newValue)); }
    else if ( propertyNb == 3 )
    {
        string r, gb, g, b;
        {
            size_t separationPos = newValue.find(";");

            if ( separationPos > newValue.length())
                return false;

            r = newValue.substr(0, separationPos);
            gb = newValue.substr(separationPos+1, newValue.length());
        }

        {
            size_t separationPos = gb.find(";");

            if ( separationPos > gb.length())
                return false;

            g = gb.substr(0, separationPos);
            b = gb.substr(separationPos+1, gb.length());
        }

        SetColor(ToInt(r), ToInt(g), ToInt(b));
    }
    else if ( propertyNb == 4 ) { SetOpacity(ToFloat(newValue)); }
    else if ( propertyNb == 5 ) { SetSmooth(!(newValue == _("No"))); }

    return true;
}

unsigned int TextObject::GetNumberOfProperties() const
{
    return 6;
}
#endif

void TextObject::OnPositionChanged()
{
    text.SetX( GetX()+text.GetRect().Width/2 );
    text.SetY( GetY()+text.GetRect().Height/2 );
}

/**
 * TextObject provides a basic bounding box.
 */
std::vector<Polygon2d> TextObject::GetHitBoxes() const
{
    std::vector<Polygon2d> mask;
    Polygon2d rectangle = Polygon2d::CreateRectangle(GetWidth(), GetHeight());
    rectangle.Rotate(GetAngle()/180*3.14159);
    rectangle.Move(GetX()+GetCenterX(), GetY()+GetCenterY());

    mask.push_back(rectangle);
    return mask;
}

/**
 * Get the real X position of the sprite
 */
float TextObject::GetDrawableX() const
{
    return text.GetPosition().x-text.GetOrigin().x;
}

/**
 * Get the real Y position of the text
 */
float TextObject::GetDrawableY() const
{
    return text.GetPosition().y-text.GetOrigin().y;
}

/**
 * Width is the width of the current sprite.
 */
float TextObject::GetWidth() const
{
    return text.GetRect().Width;
}

/**
 * Height is the height of the current sprite.
 */
float TextObject::GetHeight() const
{
    return text.GetRect().Height;
}

/**
 * X center is computed with text rectangle
 */
float TextObject::GetCenterX() const
{
    return text.GetRect().Width/2;
}

/**
 * Y center is computed with text rectangle
 */
float TextObject::GetCenterY() const
{
    return text.GetRect().Height/2;
}

/**
 * Nothing to do when updating time
 */
void TextObject::UpdateTime(float)
{
}

/**
 * Change the color filter of the sprite object
 */
void TextObject::SetColor( unsigned int r, unsigned int g, unsigned int b )
{
    colorR = r;
    colorG = g;
    colorB = b;
    text.SetColor(sf::Color(colorR, colorG, colorB, opacity));
}

void TextObject::SetColor(const std::string & colorStr)
{
    vector < string > colors = SplitString<string>(colorStr, ';');

    if ( colors.size() < 3 ) return; //La couleur est incorrecte

    SetColor(  ToInt(colors[0]),
               ToInt(colors[1]),
               ToInt(colors[2]) );
}

void TextObject::SetOpacity(float val)
{
    if ( val > 255 )
        val = 255;
    else if ( val < 0 )
        val = 0;

    opacity = val;
    text.SetColor(sf::Color(colorR, colorG, colorB, opacity));
}

void TextObject::SetFontFilename(const std::string & fontName_)
{
    fontName = fontName_;
}

void TextObject::ChangeFont(const std::string & fontName_)
{
    SetFontFilename(fontName_);
    ReloadFont();
}

void TextObject::ReloadFont()
{
    text.SetFont(*FontManager::GetInstance()->GetFont(fontName));
    text.SetOrigin(text.GetRect().Width/2, text.GetRect().Height/2);
}

void TextObject::SetFontStyle(int style)
{
    text.SetStyle(style);
}

int TextObject::GetFontStyle()
{
    return text.GetStyle();
}

bool TextObject::HasFontStyle(sf::Text::Style style)
{
    return (text.GetStyle() & style) != 0;
}

bool TextObject::IsBold()
{
    return HasFontStyle(sf::Text::Bold);
}

void TextObject::SetBold(bool bold)
{
    SetFontStyle((bold ? sf::Text::Bold : 0) |
                 (IsItalic() ? sf::Text::Italic : 0) |
                 (IsUnderlined() ? sf::Text::Underlined : 0) );
}

bool TextObject::IsItalic()
{
    return HasFontStyle(sf::Text::Italic);
}

void TextObject::SetItalic(bool italic)
{
    SetFontStyle((IsBold() ? sf::Text::Bold : 0) |
                 (italic ? sf::Text::Italic : 0) |
                 (IsUnderlined() ? sf::Text::Underlined : 0) );
}

bool TextObject::IsUnderlined()
{
    return HasFontStyle(sf::Text::Underlined);
}

void TextObject::SetUnderlined(bool underlined)
{
    SetFontStyle((IsBold() ? sf::Text::Bold : 0) |
                 (IsItalic() ? sf::Text::Italic : 0) |
                 (underlined ? sf::Text::Underlined : 0) );
}

void TextObject::SetSmooth(bool smooth)
{
    smoothed = smooth;

    const_cast<sf::Texture&>(text.GetFont().GetTexture(GetCharacterSize())).SetSmooth(smooth);
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyTextObject(Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
Object * CreateTextObject(std::string name)
{
    return new TextObject(name);
}


