/**

GDevelop - TextEntry Object Extension
Copyright (c) 2011-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/bitmap.h>
#endif
#include <SFML/Graphics.hpp>
#include <string>
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Project/Object.h"
#include "GDCpp/ImageManager.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/Project/InitialInstance.h"
#include "GDCpp/Project/Project.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCore/Utf8/utf8.h"
#include "TextEntryObject.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCpp/CommonTools.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#endif

using namespace std;

#if defined(GD_IDE_ONLY)
sf::Texture TextEntryObject::edittimeIconImage;
sf::Sprite TextEntryObject::edittimeIcon;
#endif

TextEntryObject::TextEntryObject(gd::String name_) :
    Object(name_)
{
}

RuntimeTextEntryObject::RuntimeTextEntryObject(RuntimeScene & scene_, const gd::Object & object) :
    RuntimeObject(scene_, object),
    text(),
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

    //Retrieve text entered
    const auto & characters = scene->GetInputManager().GetCharactersEntered();
    for (std::size_t i = 0;i<characters.size();++i)
    {
        //Skip some non displayable characters
        if (characters[i] > 30 && (characters[i] < 127 || characters[i] > 159))
        {
            std::cout << characters[i] << std::endl;
            text += static_cast<char32_t>(characters[i]);
        }
        else if (characters[i] == 8)
        {
            std::cout << "Backspace" << std::endl;
            //Backspace : find the previous codepoint and remove it
            if(text.empty())
                continue;

            text.pop_back();
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
#if !defined(GD_NO_WX_GUI)
    thumbnail = wxBitmap("CppPlatform/Extensions/textentry.png", wxBITMAP_TYPE_ANY);
#endif

    return true;
}

void RuntimeTextEntryObject::GetPropertyForDebugger(std::size_t propertyNb, gd::String & name, gd::String & value) const
{
    if      ( propertyNb == 0 ) {name = _("Text in memory");    value = GetString();}
    else if ( propertyNb == 1 ) {name = _("Activated \?");      value = activated ? _("Yes") : _("No");}
}

bool RuntimeTextEntryObject::ChangeProperty(std::size_t propertyNb, gd::String newValue)
{
    if      ( propertyNb == 0 ) { SetString(newValue); return true; }
    else if ( propertyNb == 1 ) { activated = (newValue != _("No")); return true; }

    return true;
}

std::size_t RuntimeTextEntryObject::GetNumberOfProperties() const
{
    return 2;
}
#endif

RuntimeObject * CreateRuntimeTextEntryObject(RuntimeScene & scene, const gd::Object & object)
{
    return new RuntimeTextEntryObject(scene, object);
}

gd::Object * CreateTextEntryObject(gd::String name)
{
    return new TextEntryObject(name);
}
