/**

Game Develop - Light Extension
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

#include <SFML/Graphics.hpp>
#include "GDL/Object.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ImageManager.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/FontManager.h"
#include "GDL/XmlMacros.h"
#include "GDL/Position.h"
#include "GDL/RotatedRectangle.h"
#include "LightObject.h"
#include "LightManager.h"

#if defined(GD_IDE_ONLY)
#include <wx/wx.h>
#include "GDL/CommonTools.h"
#include "GDL/IDE/ArbitraryResourceWorker.h"
#include "GDL/IDE/MainEditorCommand.h"
#include "LightObjectEditor.h"
#endif

std::map<const Scene*, boost::weak_ptr<Light_Manager> >  LightObject::lightManagersList;
sf::Shader LightObject::commonBlurEffect;
bool LightObject::commonBlurEffectLoaded = false;
#if defined(GD_IDE_ONLY)
sf::Texture LightObject::edittimeIconImage;
sf::Sprite LightObject::edittimeIcon;
#endif

LightObject::LightObject(std::string name_) :
Object(name_),
angle(0),
light(sf::Vector2f(GetX(),GetY()), 150, 128, 16, sf::Color(255,255,255)),
globalLight(false),
globalLightColor(128,128,128,150)
{
}

void LightObject::LoadFromXml(const TiXmlElement * elem)
{
    {
        float intensity = 255;
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("intensity", intensity);
        SetRadius(intensity);
    }
    {
        float radius = 180;
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("radius", radius);
        SetRadius(radius);
    }
    {
        int quality = 16;
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("quality", quality);
        SetQuality(quality);
    }

    {
        int r = 255;
        int g = 255;
        int b = 255;
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("colorR", r);
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("colorG", g);
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("colorB", b);
        SetColor(sf::Color(r,g,b));
    }

    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("globalLight", globalLight);

    {
        int r = 255;
        int g = 255;
        int b = 255;
        int a = 255;
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("globalColorR", r);
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("globalColorG", g);
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("globalColorB", b);
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("globalColorA", a);
        globalLightColor = sf::Color(r,g,b,a);
    }

}

#if defined(GD_IDE_ONLY)
void LightObject::SaveToXml(TiXmlElement * elem)
{
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_DOUBLE("intensity", GetIntensity());
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_DOUBLE("radius", GetRadius());
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("quality", GetQuality());

    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("colorR", GetColor().r);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("colorG", GetColor().g);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("colorB", GetColor().b);

    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("globalLight", globalLight);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("globalColorR", globalLightColor.r);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("globalColorG", globalLightColor.g);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("globalColorB", globalLightColor.b);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("globalColorA", globalLightColor.a);
}
#endif

bool LightObject::LoadResources(const RuntimeScene & scene, const ImageManager & imageMgr)
{
    #if defined(GD_IDE_ONLY)
    edittimeIconImage.LoadFromFile("Extensions/lightIcon32.png");
    edittimeIconImage.SetSmooth(false);
    edittimeIcon.SetTexture(edittimeIconImage);
    #endif

    return true;
}

bool LightObject::LoadRuntimeResources(const RuntimeScene & scene, const ImageManager & imageMgr )
{
    //Get a manager for the scene
    if ( lightManagersList[&scene].expired() )
    {
        manager = boost::shared_ptr<Light_Manager>(new Light_Manager);
        lightManagersList[&scene] = manager;
    }
    else
        manager = lightManagersList[&scene].lock();

    //Load ( only once during program use ) the common blur effect, shared by all lights.
    if ( !commonBlurEffectLoaded )
    {
        commonBlurEffect.LoadFromMemory("uniform sampler2D texture;\nuniform float offset;\n\nvoid main()\n{\n	vec2 offx = vec2(offset, 0.0);\n	vec2 offy = vec2(0.0, offset);\n\n	vec4 pixel = texture2D(texture, gl_TexCoord[0].xy)               * 1 +\n                 texture2D(texture, gl_TexCoord[0].xy - offx)        * 2 +\n                 texture2D(texture, gl_TexCoord[0].xy + offx)        * 2 +\n                 texture2D(texture, gl_TexCoord[0].xy - offy)        * 2 +\n                 texture2D(texture, gl_TexCoord[0].xy + offy)        * 2 +\n                 texture2D(texture, gl_TexCoord[0].xy - offx - offy) * 1 +\n                 texture2D(texture, gl_TexCoord[0].xy - offx + offy) * 1 +\n                 texture2D(texture, gl_TexCoord[0].xy + offx - offy) * 1 +\n                 texture2D(texture, gl_TexCoord[0].xy + offx + offy) * 1;\n\n	gl_FragColor =  gl_Color * (pixel / 13.0);\n}\n");
        commonBlurEffect.SetCurrentTexture("texture");

        commonBlurEffectLoaded = true;
    }

    UpdateGlobalLightMembers();

    return true;
}

void LightObject::UpdateGlobalLightMembers()
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
 * Update animation and direction from the inital position
 */
bool LightObject::InitializeFromInitialPosition(const InitialPosition & position)
{
    return true;
}

/**
 * Render object at runtime
 */
bool LightObject::Draw( sf::RenderTarget& window )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;

    if ( !manager ) return false;

    if ( updateClock.GetElapsedTime() > 25 ) //Update each 25 milliseconds
    {
        light.Generate(manager->walls);
        updateClock.Reset();
    }

    if ( globalLight )
    {
        //Create render image
        if ( globalLightImage->GetWidth() != window.GetWidth() || globalLightImage->GetHeight() != window.GetHeight() )
            globalLightImage->Create(window.GetWidth(), window.GetHeight());

        //Render light on an intermediate image
        globalLightImage->Clear(globalLightColor);
        globalLightImage->SetView(window.GetView());
        //light.SetPosition(sf::Vector2f(light.GetPosition().x-(window.GetView().GetCenter().x-window.GetView().GetSize().x/2), light.GetPosition().y-(window.GetView().GetCenter().y-window.GetView().GetSize().y/2)));
        light.Draw(globalLightImage.get());
        globalLightImage->Display();

        //Display the intermediate image
        sf::Sprite sprite;
        sprite.SetTexture(globalLightImage->GetTexture());
        sprite.SetBlendMode(sf::Blend::Multiply);
        commonBlurEffect.SetParameter("offset",0.005 * 1);

        window.SetView(sf::View(sf::FloatRect(0,0,window.GetWidth(), window.GetHeight())));
        window.Draw(sprite, commonBlurEffect);
        window.SetView(globalLightImage->GetView());
    }
    else
    {
        light.Draw(&window);
    }

    //Debug draw
    /*for (unsigned int i = 0;i<manager->walls.size();++i)
    {
        sf::Shape shape = sf::Shape::Line(manager->walls[i]->pt1, manager->walls[i]->pt2, 1, sf::Color(255,0,0));
        window.Draw(shape);
    }*/

    return true;
}

#if defined(GD_IDE_ONLY)
/**
 * Render object at edittime
 */
bool LightObject::DrawEdittime(sf::RenderTarget& renderWindow)
{
    edittimeIcon.SetPosition(GetX(), GetY());
    renderWindow.Draw(edittimeIcon);

    return true;
}

void LightObject::ExposeResources(ArbitraryResourceWorker & worker)
{
}

bool LightObject::GenerateThumbnail(const Game & game, wxBitmap & thumbnail)
{
    thumbnail = wxBitmap("Extensions/lightIcon24.png", wxBITMAP_TYPE_ANY);

    return true;
}

void LightObject::EditObject( wxWindow* parent, Game & game, MainEditorCommand & mainEditorCommand )
{
    LightObjectEditor dialog(parent, game, *this, mainEditorCommand);
    dialog.ShowModal();
}

wxPanel * LightObject::CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position )
{
    return NULL;
}

void LightObject::UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position)
{
}

void LightObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if ( propertyNb == 0 ) {name = _("Couleur");       value = ToString(GetColor().r)+";"+ToString(GetColor().g)+";"+ToString(GetColor().b);}
    else if ( propertyNb == 1 ) {name = _("Intensité");       value = ToString(GetIntensity());}
    else if ( propertyNb == 2 ) {name = _("Rayon");       value = ToString(GetRadius());}
    else if ( propertyNb == 2 ) {name = _("Qualité");       value = ToString(GetQuality());}
}

bool LightObject::ChangeProperty(unsigned int propertyNb, string newValue)
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

unsigned int LightObject::GetNumberOfProperties() const
{
    return 2;
}
#endif

void LightObject::OnPositionChanged()
{
    light.SetPosition(sf::Vector2f(GetX(),GetY()));
}

void LightObject::SetColor(const std::string & colorStr)
{
    vector < string > colors = SplitString<string>(colorStr, ';');

    if ( colors.size() < 3 ) return; //La couleur est incorrecte

    SetColor(sf::Color( ToInt(colors[0]), ToInt(colors[1]), ToInt(colors[2]) ));
}

void LightObject::SetGlobalColor(const std::string & colorStr)
{
    vector < string > colors = SplitString<string>(colorStr, ';');

    if ( colors.size() < 3 ) return; //La couleur est incorrecte

    SetGlobalColor(sf::Color( ToInt(colors[0]),ToInt(colors[1]),ToInt(colors[2]) ));
}

/**
 * LightObject provides a basic bounding box.
 */
std::vector<RotatedRectangle> LightObject::GetHitBoxes() const
{
    std::vector<RotatedRectangle> boxes;
    RotatedRectangle rectangle;
    rectangle.angle = GetAngle()*3.14/180.0f;
    rectangle.center.x = GetX()+GetCenterX();
    rectangle.center.y = GetY()+GetCenterY();
    rectangle.halfSize.x = GetWidth()/2;
    rectangle.halfSize.y = GetHeight()/2;

    boxes.push_back(rectangle);
    return boxes;
}

/**
 * Get the real X position of the sprite
 */
float LightObject::GetDrawableX() const
{
    return GetX();
}

/**
 * Get the real Y position of the text
 */
float LightObject::GetDrawableY() const
{
    return GetY();
}

/**
 * Width is the width of the current sprite.
 */
float LightObject::GetWidth() const
{
    return 32;
}

/**
 * Height is the height of the current sprite.
 */
float LightObject::GetHeight() const
{
    return 32;
}

/**
 * X center is computed with text rectangle
 */
float LightObject::GetCenterX() const
{
    return 16;
}

/**
 * Y center is computed with text rectangle
 */
float LightObject::GetCenterY() const
{
    return 16;
}

/**
 * Nothing to do when updating time
 */
void LightObject::UpdateTime(float)
{
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyLightObject(Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
Object * CreateLightObject(std::string name)
{
    return new LightObject(name);
}

