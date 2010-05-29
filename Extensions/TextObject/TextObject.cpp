/**

Game Develop - Text Object Extension
Copyright (c) 2008-2010 Florian Rival (Florian.Rival@gmail.com)

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

#include <SFML/Graphics.hpp>
#include "GDL/Object.h"
#include "GDL/Access.h"
#include "GDL/ImageManager.h"
#include "GDL/tinyxml.h"
#include "GDL/FontManager.h"
#include "GDL/Position.h"
#include "TextObject.h"

#ifdef GDE
#include <wx/wx.h>
#include "GDL/CommonTools.h"
#include "GDL/MainEditorCommand.h"
#include "TextObjectEditor.h"
#endif

TextObject::TextObject(std::string name_) :
Object(name_),
text("Text", FontManager->getInstance()->GetFont("")),
opacity( 255 ),
colorR( 255 ),
colorG( 255 ),
colorB( 255 ),
angle(0)
{
}

void TextObject::LoadFromXml(const TiXmlElement * object)
{
    if ( object->FirstChildElement( "String" ) == NULL ||
         object->FirstChildElement( "String" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant le texte d'un objet Text manquent.";
    }
    else
    {
        text.SetString(object->FirstChildElement("String")->Attribute("value"));
    }

    if ( object->FirstChildElement( "Font" ) == NULL ||
         object->FirstChildElement( "Font" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant la police d'un objet Text manquent.";
    }
    else
    {
        SetFont(object->FirstChildElement("Font")->Attribute("value"));
    }

    if ( object->FirstChildElement( "CharacterSize" ) == NULL ||
         object->FirstChildElement( "CharacterSize" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant la taille du texte d'un objet Text manquent.";
    }
    else
    {
        float size = 20;
        object->FirstChildElement("CharacterSize")->QueryFloatAttribute("value", &size);

        SetCharacterSize(size);
    }

    if ( object->FirstChildElement( "Color" ) == NULL ||
         object->FirstChildElement( "Color" )->Attribute("r") == NULL ||
         object->FirstChildElement( "Color" )->Attribute("g") == NULL ||
         object->FirstChildElement( "Color" )->Attribute("b") == NULL )
    {
        cout << "Les informations concernant la couleur du texte d'un objet Text manquent.";
    }
    else
    {
        int r = 255;
        int g = 255;
        int b = 255;
        object->FirstChildElement("Color")->QueryIntAttribute("r", &r);
        object->FirstChildElement("Color")->QueryIntAttribute("g", &g);
        object->FirstChildElement("Color")->QueryIntAttribute("b", &b);

        SetColor(r,g,b);
    }
}

void TextObject::SaveToXml(TiXmlElement * object)
{
    TiXmlElement * str = new TiXmlElement( "String" );
    object->LinkEndChild( str );
    str->SetAttribute("value", string(text.GetString()).c_str());

    TiXmlElement * font = new TiXmlElement( "Font" );
    object->LinkEndChild( font );
    font->SetAttribute("value", GetFont().c_str());

    TiXmlElement * characterSize = new TiXmlElement( "CharacterSize" );
    object->LinkEndChild( characterSize );
    characterSize->SetAttribute("value", GetCharacterSize());

    TiXmlElement * color = new TiXmlElement( "Color" );
    object->LinkEndChild( color );
    color->SetAttribute("r", colorR);
    color->SetAttribute("g", colorG);
    color->SetAttribute("b", colorB);
}

bool TextObject::LoadResources(const ImageManager & imageMgr )
{
    //No ressources to load.

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
bool TextObject::Draw( sf::RenderWindow& window )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;

    text.SetX( GetX()+text.GetRect().GetSize().x/2 );
    text.SetY( GetY()+text.GetRect().GetSize().y/2 );
    text.SetColor(sf::Color(colorR, colorG, colorB, opacity));
    text.SetOrigin(text.GetRect().GetSize().x/2, text.GetRect().GetSize().y/2);
    text.SetRotation(-angle);

    window.Draw( text );

    return true;
}

#ifdef GDE
/**
 * Render object at edittime
 */
bool TextObject::DrawEdittime(sf::RenderWindow& renderWindow)
{
    text.SetX( GetX()+text.GetRect().GetSize().x/2 );
    text.SetY( GetY()+text.GetRect().GetSize().y/2 );
    text.SetColor(sf::Color(colorR, colorG, colorB, opacity));
    text.SetOrigin(text.GetRect().GetSize().x/2, text.GetRect().GetSize().y/2);
    text.SetRotation(-angle);

    renderWindow.Draw( text );

    return true;
}

bool TextObject::GenerateThumbnail(const Game & game, wxBitmap & thumbnail)
{
    thumbnail = wxBitmap("Extensions/texticon.png", wxBITMAP_TYPE_ANY);

    return true;
}

void TextObject::EditObject( wxWindow* parent, Game & game, MainEditorCommand & mainEditorCommand )
{
    TextObjectEditor dialog(parent, game, *this, mainEditorCommand);
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
    if      ( propertyNb == 0 ) {name = _("Texte");                     value = text.GetString();}
    else if ( propertyNb == 1 ) {name = _("Police");                    value = fontName;}
    else if ( propertyNb == 2 ) {name = _("Taille de caractères");      value = ToString(GetCharacterSize());}
    else if ( propertyNb == 3 ) {name = _("Couleur");       value = ToString(colorR)+";"+ToString(colorG)+";"+ToString(colorB);}
    else if ( propertyNb == 4 ) {name = _("Opacité");       value = ToString(GetOpacity());}
}

bool TextObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if      ( propertyNb == 0 ) { text.SetString(newValue); return true; }
    else if ( propertyNb == 1 ) { SetFont(newValue); }
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
    else if ( propertyNb == 4 ) { SetOpacity(ToInt(newValue)); }

    return true;
}

unsigned int TextObject::GetNumberOfProperties() const
{
    return 5;
}
#endif

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
    return text.GetRect().GetSize().x;
}

/**
 * Height is the height of the current sprite.
 */
float TextObject::GetHeight() const
{
    return text.GetRect().GetSize().y;
}

/**
 * X center is computed with text rectangle
 */
float TextObject::GetCenterX() const
{
    return text.GetRect().GetSize().x/2;
}

/**
 * Y center is computed with text rectangle
 */
float TextObject::GetCenterY() const
{
    return text.GetRect().GetSize().y/2;
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
}

void TextObject::SetOpacity(int val)
{
    if ( val > 255 )
        val = 255;
    else if ( val < 0 )
        val = 0;

    opacity = val;
}

void TextObject::SetFont(string fontName_)
{
    fontName = fontName_;

    FontManager * fontManager = FontManager::getInstance();
    text.SetFont(*fontManager->GetFont(fontName));
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

/**
 * Function creating an extension Object from another.
 * Game Develop can not directly create an extension object.
 *
 * Note that it is safe to do the static cast, as this function
 * is called owing to the typeId of the object to copy.
 */
Object * CreateTextObjectByCopy(Object * object)
{
    return new TextObject(*static_cast<TextObject *>(object));
}
