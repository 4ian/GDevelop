/**

Game Develop - TextEntry Object Extension
Copyright (c) 2011-2014 Florian Rival (Florian.Rival@gmail.com)

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
#include <string>
#include "GDCpp/Object.h"
#include "GDCpp/ImageManager.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/Position.h"
#include "GDCpp/Project.h"
#include "GDCpp/RuntimeScene.h"
#include "TextEntryObject.h"
#if defined(GD_IDE_ONLY)
#include <wx/bitmap.h>
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCpp/CommonTools.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#endif

using namespace std;

#if defined(GD_IDE_ONLY)
sf::Texture TextEntryObject::edittimeIconImage;
sf::Sprite TextEntryObject::edittimeIcon;
#endif

TextEntryObject::TextEntryObject(std::string name_) :
    Object(name_)
{
}

RuntimeTextEntryObject::RuntimeTextEntryObject(RuntimeScene & scene_, const gd::Object & object) :
    RuntimeObject(scene_, object),
    scene(&scene_),
    activated(true)
{
}

/**
 * \brief Used to update input
 */
void RuntimeTextEntryObject::UpdateTime(float)
{
    if (!activated || scene == NULL) return;

    std::string textEntered;

    //Retrieve text entered
    const std::vector<sf::Event> & events = scene->GetRenderTargetEvents();
    for (unsigned int i = 0;i<events.size();++i)
    {
        if (events[i].type == sf::Event::TextEntered )
        {
            //Skip some non displayable characters
            if (events[i].text.unicode > 30 && (events[i].text.unicode < 127 || events[i].text.unicode > 159))
                text += events[i].text.unicode;
            else if (events[i].text.unicode == 8)
            {
                //Backspace
                if ( !text.empty() ) text.erase(text.end()-1);
            }
        }
    }
}

#if defined(GD_IDE_ONLY)
void TextEntryObject::DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout)
{
    edittimeIcon.setPosition(instance.GetX(), instance.GetY());
    renderTarget.draw(edittimeIcon);
}

void TextEntryObject::LoadEdittimeIcon()
{
    edittimeIconImage.loadFromFile("CppPlatform/Extensions/textentry.png");
    edittimeIcon.setTexture(edittimeIconImage);
}

bool TextEntryObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const
{
    thumbnail = wxBitmap("CppPlatform/Extensions/textentry.png", wxBITMAP_TYPE_ANY);

    return true;
}

void RuntimeTextEntryObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Text in memory");    value = GetString();}
    else if ( propertyNb == 1 ) {name = _("Activated \?");      value = activated ? _("Yes") : _("No");}
}

bool RuntimeTextEntryObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if      ( propertyNb == 0 ) { SetString(newValue); return true; }
    else if ( propertyNb == 1 ) { activated = (newValue != _("No")); return true; }

    return true;
}

unsigned int RuntimeTextEntryObject::GetNumberOfProperties() const
{
    return 2;
}
#endif

void DestroyRuntimeTextEntryObject(RuntimeObject * object)
{
    delete object;
}

RuntimeObject * CreateRuntimeTextEntryObject(RuntimeScene & scene, const gd::Object & object)
{
    return new RuntimeTextEntryObject(scene, object);
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyTextEntryObject(gd::Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
gd::Object * CreateTextEntryObject(std::string name)
{
    return new TextEntryObject(name);
}


