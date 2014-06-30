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

#if defined(GD_IDE_ONLY)
#include "TextObjectEditor.h" //Must be placed first, otherwise we get errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#endif
#include <SFML/Graphics.hpp>
#include "GDCpp/Object.h"

#include "GDCpp/ImageManager.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/FontManager.h"
#include "GDCpp/Position.h"
#include "GDCpp/Polygon.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "TextObject.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/ArbitraryResourceWorker.h"
namespace gd { class MainFrameWrapper; }
#endif

using namespace std;

TextObject::TextObject(std::string name_) :
    Object(name_),
    text("Text"),
    characterSize(20),
    fontName(""),
    smoothed(true),
    bold(false),
    italic(false),
    underlined(false),
    colorR( 255 ),
    colorG( 255 ),
    colorB( 255 )
    #if defined(GD_IDE_ONLY)
    ,font(NULL)
    #endif
{
}

TextObject::~TextObject()
{
};

void TextObject::DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element)
{
    SetString(element.GetChild("string", 0,"String").GetValue().GetString());
    SetFontFilename(element.GetChild("font", 0,"Font").GetValue().GetString());
    SetCharacterSize(element.GetChild("characterSize", 0, "CharacterSize").GetValue().GetInt());
    SetColor(element.GetChild("color", 0,"Color").GetIntAttribute("r", 255),
        element.GetChild("color", 0,"Color").GetIntAttribute("g", 255),
        element.GetChild("color", 0,"Color").GetIntAttribute("b", 255));


    smoothed = element.GetBoolAttribute("smoothed");
    bold = element.GetBoolAttribute("bold");
    italic = element.GetBoolAttribute("italic");
    underlined = element.GetBoolAttribute("underlined");
}

#if defined(GD_IDE_ONLY)
void TextObject::DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout)
{
    sf::Text sfText;
    sfText.setString(text);
    sfText.setCharacterSize(characterSize);
    sfText.setStyle((bold ? sf::Text::Bold : 0) |
                 (IsItalic() ? sf::Text::Italic : 0) |
                 (IsUnderlined() ? sf::Text::Underlined : 0) );
    if ( font ) sfText.setFont(*font);
    else sfText.setFont(*FontManager::Get()->GetFont(""));
    sfText.setOrigin(sfText.getLocalBounds().width/2, sfText.getLocalBounds().height/2);
    sfText.setPosition( instance.GetX()+sfText.getOrigin().x, instance.GetY()+sfText.getOrigin().y );
    sfText.setRotation( instance.GetAngle() );
    sfText.setColor(sf::Color(colorR, colorG, colorB));

    renderTarget.draw(sfText);
}

sf::Vector2f TextObject::GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const
{
    sf::Text sfText;
    sfText.setString(text);
    sfText.setCharacterSize(characterSize);
    sfText.setStyle((bold ? sf::Text::Bold : 0) |
                 (IsItalic() ? sf::Text::Italic : 0) |
                 (IsUnderlined() ? sf::Text::Underlined : 0) );
    if ( font ) sfText.setFont(*font);
    else sfText.setFont(*FontManager::Get()->GetFont(""));

    return sf::Vector2f(sfText.getLocalBounds().width, sfText.getLocalBounds().height+ sfText.getLocalBounds().top);
}

void TextObject::LoadResources(gd::Project & project, gd::Layout & layout)
{
    font = FontManager::Get()->GetFont(fontName);
}

void TextObject::DoSerializeTo(gd::SerializerElement & element) const
{
    element.AddChild("string").SetValue(GetString());
    element.AddChild("font").SetValue(GetFontFilename());
    element.AddChild("characterSize").SetValue(GetCharacterSize());
    element.AddChild("color").SetAttribute("r", (int)GetColorR())
        .SetAttribute("g", (int)GetColorG())
        .SetAttribute("b", (int)GetColorB());

    element.SetAttribute("smoothed", smoothed);
    element.SetAttribute("bold", bold);
    element.SetAttribute("italic", italic);
    element.SetAttribute("underlined", underlined);
}

void TextObject::ExposeResources(gd::ArbitraryResourceWorker & worker)
{
    worker.ExposeResource(fontName);
}

bool TextObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const
{
    thumbnail = wxBitmap("CppPlatform/Extensions/texticon24.png", wxBITMAP_TYPE_ANY);

    return true;
}

void TextObject::EditObject( wxWindow* parent, gd::Project & game, gd::MainFrameWrapper & mainFrameWrapper )
{
    TextObjectEditor dialog(parent, game, *this, mainFrameWrapper);
    dialog.ShowModal();
}
#endif

/* RuntimeTextObject : */

RuntimeTextObject::RuntimeTextObject(RuntimeScene & scene, const gd::Object & object) :
    RuntimeObject(scene, object),
    opacity(255),
    angle(0)
{
    const TextObject & textObject = static_cast<const TextObject&>(object);

    ChangeFont(textObject.GetFontFilename());
    SetSmooth(textObject.IsSmoothed());
    SetColor(textObject.GetColorR(), textObject.GetColorG(), textObject.GetColorB());
    SetString(textObject.GetString());
    SetCharacterSize(textObject.GetCharacterSize());
    SetAngle(0);
    SetBold(textObject.IsBold());
    SetItalic(textObject.IsItalic());
    SetUnderlined(textObject.IsUnderlined());
}

bool RuntimeTextObject::Draw( sf::RenderTarget& renderTarget )
{
    if ( hidden ) return true; //Don't draw anything if hidden

    renderTarget.draw( text );
    return true;
}

void RuntimeTextObject::OnPositionChanged()
{
    text.setPosition( GetX()+text.getOrigin().x, GetY()+text.getOrigin().y );
}

/**
 * RuntimeTextObject provides a basic bounding box.
 */
std::vector<Polygon2d> RuntimeTextObject::GetHitBoxes() const
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
float RuntimeTextObject::GetDrawableX() const
{
    return text.getPosition().x-text.getOrigin().x;
}

/**
 * Get the real Y position of the text
 */
float RuntimeTextObject::GetDrawableY() const
{
    return text.getPosition().y-text.getOrigin().y;
}

/**
 * Width is the width of the current sprite.
 */
float RuntimeTextObject::GetWidth() const
{
    return text.getLocalBounds().width;
}

/**
 * Height is the height of the current sprite.
 */
float RuntimeTextObject::GetHeight() const
{
    return text.getLocalBounds().height + text.getLocalBounds().top;
}

/**
 * Change the color filter of the sprite object
 */
void RuntimeTextObject::SetColor( unsigned int r, unsigned int g, unsigned int b )
{
    text.setColor(sf::Color(r, g, b, opacity));
}

void RuntimeTextObject::SetColor(const std::string & colorStr)
{
    std::vector < std::string > colors = SplitString<std::string>(colorStr, ';');

    if ( colors.size() < 3 ) return; //La couleur est incorrecte

    SetColor(  ToInt(colors[0]),
               ToInt(colors[1]),
               ToInt(colors[2]) );
}

void RuntimeTextObject::SetOpacity(float val)
{
    if ( val > 255 ) val = 255;
    else if ( val < 0 ) val = 0;

    opacity = val;
    const sf::Color & currentColor = text.getColor();
    text.setColor(sf::Color(currentColor.r, currentColor.g, currentColor.b, opacity));
}

void RuntimeTextObject::ChangeFont(const std::string & fontName_)
{
    if ( !text.getFont() || fontName_ != fontName )
    {
        fontName = fontName_;
        text.setFont(*FontManager::Get()->GetFont(fontName));
        text.setOrigin(text.getLocalBounds().width/2, text.getLocalBounds().height/2);
        OnPositionChanged();
        SetSmooth(smoothed); //Ensure texture smoothing is up to date.
    }
}

void RuntimeTextObject::SetFontStyle(int style)
{
    text.setStyle(style);
}

int RuntimeTextObject::GetFontStyle()
{
    return text.getStyle();
}

bool RuntimeTextObject::HasFontStyle(sf::Text::Style style)
{
    return (text.getStyle() & style) != 0;
}

bool RuntimeTextObject::IsBold()
{
    return HasFontStyle(sf::Text::Bold);
}

void RuntimeTextObject::SetBold(bool bold)
{
    SetFontStyle((bold ? sf::Text::Bold : 0) |
                 (IsItalic() ? sf::Text::Italic : 0) |
                 (IsUnderlined() ? sf::Text::Underlined : 0) );
}

bool RuntimeTextObject::IsItalic()
{
    return HasFontStyle(sf::Text::Italic);
}

void RuntimeTextObject::SetItalic(bool italic)
{
    SetFontStyle((IsBold() ? sf::Text::Bold : 0) |
                 (italic ? sf::Text::Italic : 0) |
                 (IsUnderlined() ? sf::Text::Underlined : 0) );
}

bool RuntimeTextObject::IsUnderlined()
{
    return HasFontStyle(sf::Text::Underlined);
}

void RuntimeTextObject::SetUnderlined(bool underlined)
{
    SetFontStyle((IsBold() ? sf::Text::Bold : 0) |
                 (IsItalic() ? sf::Text::Italic : 0) |
                 (underlined ? sf::Text::Underlined : 0) );
}

void RuntimeTextObject::SetSmooth(bool smooth)
{
    smoothed = smooth;

    if ( text.getFont() )
        const_cast<sf::Texture&>(text.getFont()->getTexture(GetCharacterSize())).setSmooth(smooth);
}

#if defined(GD_IDE_ONLY)
void RuntimeTextObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Text");                     value = GetString();}
    else if ( propertyNb == 1 ) {name = _("Font");                    value = GetFontFilename();}
    else if ( propertyNb == 2 ) {name = _("Font Size");      value = ToString(GetCharacterSize());}
    else if ( propertyNb == 3 ) {name = _("Color");       value = ToString(GetColorR())+";"+ToString(GetColorG())+";"+ToString(GetColorB());}
    else if ( propertyNb == 4 ) {name = _("Opacity");       value = ToString(GetOpacity());}
    else if ( propertyNb == 5 ) {name = _("Smoothing");       value = smoothed ? _("Yes") : _("No");}
}

bool RuntimeTextObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if      ( propertyNb == 0 ) { SetString(newValue); return true; }
    else if ( propertyNb == 1 ) { ChangeFont(newValue); }
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

unsigned int RuntimeTextObject::GetNumberOfProperties() const
{
    return 6;
}
#endif

void DestroyRuntimeTextObject(RuntimeObject * object)
{
    delete object;
}

RuntimeObject * CreateRuntimeTextObject(RuntimeScene & scene, const gd::Object & object)
{
    return new RuntimeTextObject(scene, object);
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyTextObject(gd::Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
gd::Object * CreateTextObject(std::string name)
{
    return new TextObject(name);
}


