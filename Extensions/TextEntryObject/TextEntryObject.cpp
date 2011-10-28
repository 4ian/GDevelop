/**

Game Develop - TextEntry Object Extension
Copyright (c) 2011 Florian Rival (Florian.Rival@gmail.com)

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

#include "GDL/ImageManager.h"
#include "GDL/tinyxml.h"
#include "GDL/Position.h"
#include "GDL/RuntimeScene.h"
#include "TextEntryObject.h"

#if defined(GD_IDE_ONLY)
#include <wx/wx.h>
#include "GDL/CommonTools.h"
#include "GDL/ArbitraryResourceWorker.h"
#include "GDL/MainEditorCommand.h"
#include "TextEntryObjectEditor.h"
#endif

TextEntryObject::TextEntryObject(std::string name_) :
    Object(name_),
    scene(NULL),
    activated(true)
{
}

void TextEntryObject::LoadFromXml(const TiXmlElement * object)
{
}

#if defined(GD_IDE_ONLY)
void TextEntryObject::SaveToXml(TiXmlElement * object)
{
}
#endif

bool TextEntryObject::LoadRuntimeResources(const RuntimeScene & scene_, const ImageManager & imageMgr )
{
    scene = &scene_;

    return true;
}

bool TextEntryObject::InitializeFromInitialPosition(const InitialPosition & position)
{
    return true;
}

/**
 * Does not render anything
 */
bool TextEntryObject::Draw( sf::RenderTarget& renderTarget )
{
    return true;
}

/**
 * Used to update input
 */
void TextEntryObject::UpdateTime(float)
{
    if (!activated || scene == NULL) return;

    std::string textEntered;

    //Retrieve text entered
    const std::vector<sf::Event> & events = scene->GetRenderTargetEvents();
    for (unsigned int i = 0;i<events.size();++i)
    {
        if (events[i].Type == sf::Event::TextEntered )
        {
            //Skip some non displayable characters
            if (events[i].Text.Unicode > 30 && (events[i].Text.Unicode < 127 || events[i].Text.Unicode > 159))
                text += events[i].Text.Unicode;
            else if (events[i].Text.Unicode == 8) //Backspace
            if ( !text.empty() ) text.erase(text.end()-1);
        }
    }
}

#if defined(GD_IDE_ONLY)
/**
 * Does not render anything
 */
bool TextEntryObject::DrawEdittime( sf::RenderTarget& renderTarget )
{
    return true;
}

void TextEntryObject::ExposeResources(ArbitraryResourceWorker & worker)
{
}

bool TextEntryObject::GenerateThumbnail(const Game & game, wxBitmap & thumbnail)
{
    thumbnail = wxBitmap("Extensions/textentry.png", wxBITMAP_TYPE_ANY);

    return true;
}

void TextEntryObject::EditObject( wxWindow* parent, Game & game, MainEditorCommand & mainEditorCommand )
{
    /*TextEntryObjectEditor dialog(parent, game, *this, mainEditorCommand);
    dialog.ShowModal();*/
}

wxPanel * TextEntryObject::CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position )
{
    return NULL;
}

void TextEntryObject::UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position)
{
}

void TextEntryObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Texte en mémoire");             value = GetString();}
    else if ( propertyNb == 1 ) {name = _("Activé ?");                     value = activated ? _("Oui") : _("Non");}
}

bool TextEntryObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if      ( propertyNb == 0 ) { SetString(newValue); return true; }
    else if ( propertyNb == 1 ) { activated = (newValue != _("Non")); return true; }

    return true;
}

unsigned int TextEntryObject::GetNumberOfProperties() const
{
    return 1;
}
#endif

/**
 * Get the real X position of the sprite
 */
float TextEntryObject::GetDrawableX() const
{
    return GetX();
}

/**
 * Get the real Y position of the text
 */
float TextEntryObject::GetDrawableY() const
{
    return GetY();
}

/**
 * Width is the width of the current sprite.
 */
float TextEntryObject::GetWidth() const
{
    return 32;
}

/**
 * Height is the height of the current sprite.
 */
float TextEntryObject::GetHeight() const
{
    return 32;
}

/**
 * X center is computed with text rectangle
 */
float TextEntryObject::GetCenterX() const
{
    return 16;
}

/**
 * Y center is computed with text rectangle
 */
float TextEntryObject::GetCenterY() const
{
    return 16;
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyTextEntryObject(Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
Object * CreateTextEntryObject(std::string name)
{
    return new TextEntryObject(name);
}

