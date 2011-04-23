/**

Game Develop - Light Extension
Copyright (c) 2008-2011 Florian Rival (Florian.Rival@gmail.com)

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
#include "GDL/tinyxml.h"
#include "GDL/FontManager.h"
#include "GDL/XmlMacros.h"
#include "GDL/Position.h"
#include "LightObject.h"
#include "LightManager.h"

#if defined(GD_IDE_ONLY)
#include <wx/wx.h>
#include "GDL/CommonTools.h"
#include "GDL/ResourcesMergingHelper.h"
#include "GDL/MainEditorCommand.h"
#include "LightObjectEditor.h"
#endif

std::map<const Scene*, boost::weak_ptr<Light_Manager> >  LightObject::lightManagersList;

LightObject::LightObject(std::string name_) :
Object(name_),
angle(0),
light(sf::Vector2f(GetX(),GetY()), 150, 128, 16, sf::Color(255,255,255))
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

    int r = 255;
    int g = 255;
    int b = 255;
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("colorR", r);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("colorG", g);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("colorB", b);

    SetColor(sf::Color(r,g,b));
}

#if defined(GD_IDE_ONLY)
void LightObject::SaveToXml(TiXmlElement * elem)
{
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_DOUBLE("intensity", GetIntensity());
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_DOUBLE("radius", GetRadius());
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("quality", GetQuality());

    {
        int r = GetColor().r;
        int g = GetColor().g;
        int b = GetColor().b;

        GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("colorR", r);
        GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("colorG", g);
        GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("colorB", b);
    }
}
#endif

bool LightObject::LoadResources(const RuntimeScene & scene, const ImageManager & imageMgr)
{
    #if defined(GD_IDE_ONLY)
    edittimeIconImage.LoadFromFile("Extensions/particleSystemSceneIcon.png");
    edittimeIconImage.SetSmooth(false);
    edittimeIcon.SetImage(edittimeIconImage);
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

    return true;
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
bool LightObject::Draw( sf::RenderWindow& window )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;

    if ( !manager ) return false;

    if ( updateClock.GetElapsedTime() >0.025 )
    {
        light.Generate(manager->walls);
        updateClock.Reset();
    }

    light.Draw(&window);

    return true;
}

#if defined(GD_IDE_ONLY)
/**
 * Render object at edittime
 */
bool LightObject::DrawEdittime(sf::RenderWindow& renderWindow)
{
    edittimeIcon.SetPosition(GetX(), GetY());
    renderWindow.Draw(edittimeIcon);

    return true;
}

void LightObject::PrepareResourcesForMerging(ResourcesMergingHelper & resourcesMergingHelper)
{
}

bool LightObject::GenerateThumbnail(const Game & game, wxBitmap & thumbnail)
{
    thumbnail = wxBitmap("Extensions/texticon.png", wxBITMAP_TYPE_ANY);

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

