/**

GDevelop - TextEntry Object Extension
Copyright (c) 2011-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
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

    //Retrieve text entered
    const auto & characters = scene->GetInputManager().GetCharactersEntered();
    for (unsigned int i = 0;i<characters.size();++i)
    {
        //Skip some non displayable characters
        if (characters[i] > 30 && (characters[i] < 127 || characters[i] > 159))
            text += characters[i];
        else if (characters[i] == 8)
        {
            //Backspace
            if (!text.empty()) text.erase(text.end()-1);
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
    if      ( propertyNb == 0 ) {name = GD_T("Text in memory");    value = GetString();}
    else if ( propertyNb == 1 ) {name = GD_T("Activated \?");      value = activated ? GD_T("Yes") : GD_T("No");}
}

bool RuntimeTextEntryObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if      ( propertyNb == 0 ) { SetString(newValue); return true; }
    else if ( propertyNb == 1 ) { activated = (newValue != GD_T("No")); return true; }

    return true;
}

unsigned int RuntimeTextEntryObject::GetNumberOfProperties() const
{
    return 2;
}
#endif

RuntimeObject * CreateRuntimeTextEntryObject(RuntimeScene & scene, const gd::Object & object)
{
    return new RuntimeTextEntryObject(scene, object);
}

gd::Object * CreateTextEntryObject(std::string name)
{
    return new TextEntryObject(name);
}


