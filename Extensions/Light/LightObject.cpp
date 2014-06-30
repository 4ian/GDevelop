/**

Game Develop - Light Extension
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
#include <wx/wx.h> //Must be placed first, otherwise we get nice errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#endif
#include <SFML/Graphics.hpp>
#include "GDCpp/Object.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/ImageManager.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/FontManager.h"
#include "GDCpp/Position.h"
#include "GDCpp/Polygon.h"
#include "GDCpp/CommonTools.h"
#include "LightObject.h"
#include "LightManager.h"

#if defined(GD_IDE_ONLY)
#include "GDCpp/CommonTools.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "LightObjectEditor.h"
#endif

using namespace std;

std::map<const gd::Layout*, boost::weak_ptr<Light_Manager> >  RuntimeLightObject::lightManagersList;
#if defined(GD_IDE_ONLY)
sf::Texture LightObject::edittimeIconImage;
sf::Sprite LightObject::edittimeIcon;
#endif

LightObject::LightObject(std::string name_) :
    Object(name_),
    light(sf::Vector2f(0,0)/*(Useless)*/, 150, 128, 16, sf::Color(255,255,255)),
    globalLight(false),
    globalLightColor(128,128,128,150)
{
}

void LightObject::DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element)
{
    SetIntensity(element.GetIntAttribute("intensity", 255));
    SetRadius(element.GetIntAttribute("radius", 180));
    SetQuality(element.GetIntAttribute("quality", 16));

    {
        int r = element.GetIntAttribute("colorR", 255);
        int g = element.GetIntAttribute("colorG", 255);
        int b = element.GetIntAttribute("colorB", 255);
        SetColor(sf::Color(r,g,b));
    }

    globalLight = element.GetBoolAttribute("globalLight", false);

    {
        int r = element.GetIntAttribute("globalColorR", 255);
        int g = element.GetIntAttribute("globalColorG", 255);
        int b = element.GetIntAttribute("globalColorB", 255);
        int a = element.GetIntAttribute("globalColorA", 255);
        globalLightColor = sf::Color(r,g,b,a);
    }

}

#if defined(GD_IDE_ONLY)
void LightObject::DoSerializeTo(gd::SerializerElement & element) const
{
    element.SetAttribute("intensity", GetIntensity());
    element.SetAttribute("radius", GetRadius());
    element.SetAttribute("quality", GetQuality());

    element.SetAttribute("colorR", GetColor().r);
    element.SetAttribute("colorG", GetColor().g);
    element.SetAttribute("colorB", GetColor().b);

    element.SetAttribute("globalLight", globalLight);
    element.SetAttribute("globalColorR", globalLightColor.r);
    element.SetAttribute("globalColorG", globalLightColor.g);
    element.SetAttribute("globalColorB", globalLightColor.b);
    element.SetAttribute("globalColorA", globalLightColor.a);
}
#endif

RuntimeLightObject::RuntimeLightObject(RuntimeScene & scene, const gd::Object & object) :
    RuntimeObject(scene, object),
    angle(0)
{
    const LightObject & lightObject = static_cast<const LightObject&>(object);

    globalLight = lightObject.IsGlobalLight();
    globalLightColor = lightObject.GetGlobalColor();
    light = Light(sf::Vector2f(GetX(),GetY()), lightObject.GetIntensity(), lightObject.GetRadius(), lightObject.GetQuality(), lightObject.GetColor());

    //Get a manager for the scene
    if ( lightManagersList[&scene].expired() )
    {
        manager = boost::shared_ptr<Light_Manager>(new Light_Manager);
        lightManagersList[&scene] = manager;
    }
    else
        manager = lightManagersList[&scene].lock();

    //Load ( only once for each scene ) the common blur effect, shared by all lights.
    if ( !manager->commonBlurEffectLoaded )
    {
        manager->commonBlurEffect.loadFromMemory("uniform sampler2D texture;\nuniform float offset;\n\nvoid main()\n{\n	vec2 offx = vec2(offset, 0.0);\n	vec2 offy = vec2(0.0, offset);\n\n	vec4 pixel = texture2D(texture, gl_TexCoord[0].xy)               * 1 +\n                 texture2D(texture, gl_TexCoord[0].xy - offx)        * 2 +\n                 texture2D(texture, gl_TexCoord[0].xy + offx)        * 2 +\n                 texture2D(texture, gl_TexCoord[0].xy - offy)        * 2 +\n                 texture2D(texture, gl_TexCoord[0].xy + offy)        * 2 +\n                 texture2D(texture, gl_TexCoord[0].xy - offx - offy) * 1 +\n                 texture2D(texture, gl_TexCoord[0].xy - offx + offy) * 1 +\n                 texture2D(texture, gl_TexCoord[0].xy + offx - offy) * 1 +\n                 texture2D(texture, gl_TexCoord[0].xy + offx + offy) * 1;\n\n	gl_FragColor =  gl_Color * (pixel / 13.0);\n}\n",
                                        sf::Shader::Fragment);
        manager->commonBlurEffect.setParameter("texture", sf::Shader::CurrentTexture);

        manager->commonBlurEffectLoaded = true;
    }

    UpdateGlobalLightMembers();
}

void RuntimeLightObject::UpdateGlobalLightMembers()
{
    if ( globalLight )
    {
        //Create supplementary members for the global light
        if ( !globalLightImage ) globalLightImage = boost::shared_ptr<sf::RenderTexture>(new sf::RenderTexture);
    }
    else
    {
        //Not a global light, destroy all members related to
        globalLightImage.reset();
    }

}

/**
 * Render object at runtime
 */
bool RuntimeLightObject::Draw( sf::RenderTarget& window )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;

    if ( !manager ) return false;

    if ( updateClock.getElapsedTime().asMilliseconds() > 25 )
    {
        light.Generate(manager->walls);
        updateClock.restart(); //Update each 25 milliseconds
    }

    if ( globalLight )
    {
        //Create render image
        if ( globalLightImage->getSize().x != window.getSize().x || globalLightImage->getSize().y != window.getSize().y )
            globalLightImage->create(window.getSize().x, window.getSize().y);

        //Render light on an intermediate image
        globalLightImage->clear(globalLightColor);
        globalLightImage->setView(window.getView());
        light.Draw(globalLightImage.get());
        globalLightImage->display();

        //Display the intermediate image
        sf::Sprite sprite;
        sprite.setTexture(globalLightImage->getTexture());
        manager->commonBlurEffect.setParameter("offset",0.005 * 1);

        window.setView(sf::View(sf::FloatRect(0,0,window.getSize().x, window.getSize().y)));
        sf::RenderStates renderStates;
        renderStates.blendMode = sf::BlendMultiply;
        renderStates.shader = &manager->commonBlurEffect;
        window.draw(sprite, renderStates);
        window.setView(globalLightImage->getView());
    }
    else
    {
        light.Draw(&window);
    }

    //Debug draw
    /*for (unsigned int i = 0;i<manager->walls.size();++i)
    {
        sf::Shape shape = sf::Shape::Line(manager->walls[i]->pt1, manager->walls[i]->pt2, 1, sf::Color(255,0,0));
        window.draw(shape);
    }*/

    return true;
}

#if defined(GD_IDE_ONLY)
void LightObject::DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout)
{
    edittimeIcon.setPosition(instance.GetX(), instance.GetY());
    renderTarget.draw(edittimeIcon);
}

sf::Vector2f LightObject::GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const
{
    return sf::Vector2f(32,32);
}

void LightObject::LoadEdittimeIcon()
{
    edittimeIconImage.loadFromFile("CppPlatform/Extensions/lightIcon32.png");
    edittimeIconImage.setSmooth(false);
    edittimeIcon.setTexture(edittimeIconImage);
}

bool LightObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const
{
    thumbnail = wxBitmap("CppPlatform/Extensions/lightIcon24.png", wxBITMAP_TYPE_ANY);

    return true;
}

void LightObject::EditObject( wxWindow* parent, gd::Project & game, gd::MainFrameWrapper & mainFrameWrapper )
{
    LightObjectEditor dialog(parent, game, *this);
    dialog.ShowModal();
}

void RuntimeLightObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if ( propertyNb == 0 ) {name = _("Color");       value = ToString(GetColor().r)+";"+ToString(GetColor().g)+";"+ToString(GetColor().b);}
    else if ( propertyNb == 1 ) {name = _("Intensity");       value = ToString(GetIntensity());}
    else if ( propertyNb == 2 ) {name = _("Radius");       value = ToString(GetRadius());}
    else if ( propertyNb == 2 ) {name = _("Quality");       value = ToString(GetQuality());}
}

bool RuntimeLightObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if ( propertyNb == 0 )
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

        SetColor(sf::Color(ToInt(r), ToInt(g), ToInt(b)));
    }
    else if ( propertyNb == 1 ) { SetIntensity(ToFloat(newValue)); }
    else if ( propertyNb == 2 ) { SetRadius(ToFloat(newValue)); }
    else if ( propertyNb == 3 ) { SetQuality(ToInt(newValue)); }

    return true;
}

unsigned int RuntimeLightObject::GetNumberOfProperties() const
{
    return 2;
}
#endif

void RuntimeLightObject::OnPositionChanged()
{
    light.SetPosition(sf::Vector2f(GetX(),GetY()));
}

void RuntimeLightObject::SetColor(const std::string & colorStr)
{
    vector < string > colors = SplitString<string>(colorStr, ';');

    if ( colors.size() < 3 ) return; //La couleur est incorrecte

    SetColor(sf::Color( ToInt(colors[0]), ToInt(colors[1]), ToInt(colors[2]) ));
}

void RuntimeLightObject::SetGlobalColor(const std::string & colorStr)
{
    vector < string > colors = SplitString<string>(colorStr, ';');

    if ( colors.size() < 3 ) return; //La couleur est incorrecte

    SetGlobalColor(sf::Color( ToInt(colors[0]),ToInt(colors[1]),ToInt(colors[2]) ));
}

void DestroyRuntimeLightObject(RuntimeObject * object)
{
    delete object;
}

RuntimeObject * CreateRuntimeLightObject(RuntimeScene & scene, const gd::Object & object)
{
    return new RuntimeLightObject(scene, object);
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyLightObject(gd::Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
gd::Object * CreateLightObject(std::string name)
{
    return new LightObject(name);
}


