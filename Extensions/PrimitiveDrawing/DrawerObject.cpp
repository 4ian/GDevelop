/**

Game Develop - Primitive Drawing Extension
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
#include <wx/wx.h> //Must be placed first, otherwise we get errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#endif
#include "DrawerObject.h"
#include <SFML/Graphics.hpp>
#include "GDCpp/Object.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/Project.h"
#include "GDCpp/ImageManager.h"
#include "GDCpp/Polygon.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/FontManager.h"
#include "GDCpp/Position.h"
#include "GDCpp/CommonTools.h"

#if defined(GD_IDE_ONLY)
#include "GDCpp/CommonTools.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "DrawerObjectEditor.h"
#endif

#if defined(GD_IDE_ONLY)
sf::Texture DrawerObject::edittimeIconImage;
sf::Sprite DrawerObject::edittimeIcon;
#endif

using namespace std;

DrawerObjectBase::DrawerObjectBase() :
    fillColorR( 255 ),
    fillColorG( 255 ),
    fillColorB( 255 ),
    fillOpacity( 255 ),
    outlineSize(1),
    outlineColorR(0),
    outlineColorG(0),
    outlineColorB(0),
    outlineOpacity(255),
    absoluteCoordinates(true)
{
}

DrawerObject::DrawerObject(std::string name_) :
    gd::Object(name_)
{
}

RuntimeDrawerObject::RuntimeDrawerObject(RuntimeScene & scene, const gd::Object & object) :
    RuntimeObject(scene, object)
{
    const DrawerObject & drawerObject = static_cast<const DrawerObject&>(object);
    DrawerObjectBase::operator=(drawerObject);
}

void DrawerObjectBase::UnserializeFrom(const gd::SerializerElement & element)
{
    fillOpacity = element.GetChild("fillOpacity", 0, "FillOpacity").GetValue().GetInt();
    outlineSize = element.GetChild("outlineSize", 0, "OutlineSize").GetValue().GetInt();
    outlineOpacity = element.GetChild("outlineOpacity", 0, "OutlineOpacity").GetValue().GetInt();

    fillColorR = element.GetChild("fillColor", 0, "FillColor").GetIntAttribute("r");
    fillColorG = element.GetChild("fillColor", 0, "FillColor").GetIntAttribute("g");
    fillColorB = element.GetChild("fillColor", 0, "FillColor").GetIntAttribute("b");

    outlineColorR = element.GetChild("outlineColor", 0, "OutlineColor").GetIntAttribute("r");
    outlineColorG = element.GetChild("outlineColor", 0, "OutlineColor").GetIntAttribute("g");
    outlineColorB = element.GetChild("outlineColor", 0, "OutlineColor").GetIntAttribute("b");

    absoluteCoordinates = element.GetChild("absoluteCoordinates", 0, "AbsoluteCoordinates").GetValue().GetBool();
}

void DrawerObject::DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element)
{
    DrawerObjectBase::UnserializeFrom(element);
}

#if defined(GD_IDE_ONLY)
void DrawerObjectBase::SerializeTo(gd::SerializerElement & element) const
{
    element.AddChild("fillOpacity").SetValue(fillOpacity);
    element.AddChild("outlineSize").SetValue(outlineSize);
    element.AddChild("outlineOpacity").SetValue(outlineOpacity);
    element.AddChild("fillColor")
        .SetAttribute("r", (int)fillColorR)
        .SetAttribute("g", (int)fillColorG)
        .SetAttribute("b", (int)fillColorB);
    element.AddChild("outlineColor")
        .SetAttribute("r", (int)outlineColorR)
        .SetAttribute("g", (int)outlineColorG)
        .SetAttribute("b", (int)outlineColorB);
    element.AddChild("absoluteCoordinates").SetValue(absoluteCoordinates);
}

void DrawerObject::DoSerializeTo(gd::SerializerElement & element) const
{
    DrawerObjectBase::SerializeTo(element);
}
#endif

/**
 * Render object at runtime
 */
bool RuntimeDrawerObject::Draw( sf::RenderTarget& renderTarget )
{
    //Don't draw anything if hidden
    if ( hidden )
    {
        shapesToDraw.clear();
        return true;
    }

    for (unsigned int i = 0;i<shapesToDraw.size();++i)
    {
    	renderTarget.draw(shapesToDraw[i].rectangleShape);
    	renderTarget.draw(shapesToDraw[i].circleShape);
    }

    shapesToDraw.clear();

    return true;
}

#if defined(GD_IDE_ONLY)
/**
 * Render object at edittime
 */
void DrawerObject::DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout)
{
    edittimeIcon.setPosition(instance.GetX(), instance.GetY());
    renderTarget.draw(edittimeIcon);
}

void DrawerObject::LoadEdittimeIcon()
{
    edittimeIconImage.loadFromFile("CppPlatform/Extensions/primitivedrawingicon.png");
    edittimeIcon.setTexture(edittimeIconImage);
}

bool DrawerObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const
{
    thumbnail = wxBitmap("CppPlatform/Extensions/primitivedrawingicon.png", wxBITMAP_TYPE_ANY);

    return true;
}

void DrawerObject::EditObject( wxWindow* parent, gd::Project & game, gd::MainFrameWrapper & mainFrameWrapper )
{
    DrawerObjectEditor dialog(parent, game, *this);
    dialog.ShowModal();
}

void RuntimeDrawerObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Fill color");    value = ToString(GetFillColorR())+";"+ToString(GetFillColorG())+";"+ToString(GetFillColorB());}
    else if ( propertyNb == 1 ) {name = _("Fill opacity");    value = ToString(GetFillOpacity());}
    else if ( propertyNb == 2 ) {name = _("Outline size");         value = ToString(GetOutlineSize());}
    else if ( propertyNb == 3 ) {name = _("Outline color");        value = ToString(GetOutlineColorR())+";"+ToString(GetOutlineColorG())+";"+ToString(GetOutlineColorB());}
    else if ( propertyNb == 4 ) {name = _("Outline opacity");        value = ToString(GetOutlineOpacity());}
}

bool RuntimeDrawerObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if      ( propertyNb == 0 )
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

        SetFillColor(ToInt(r), ToInt(g), ToInt(b));
    }
    else if ( propertyNb == 1 ) { SetFillOpacity(ToFloat(newValue)); }
    else if ( propertyNb == 2 ) { SetOutlineSize(ToInt(newValue)); }
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

        SetOutlineColor(ToInt(r), ToInt(g), ToInt(b));
    }
    else if ( propertyNb == 4 ) { SetOutlineOpacity(ToFloat(newValue)); }

    return true;
}

unsigned int RuntimeDrawerObject::GetNumberOfProperties() const
{
    return 5;
}
#endif

/**
 * Change the color filter of the sprite object
 */
void DrawerObjectBase::SetFillColor( unsigned int r, unsigned int g, unsigned int b )
{
    fillColorR = r;
    fillColorG = g;
    fillColorB = b;
}

void DrawerObjectBase::SetFillOpacity(float val)
{
    if ( val > 255 )
        val = 255;
    else if ( val < 0 )
        val = 0;

    fillOpacity = val;
}

/**
 * Change the color filter of the sprite object
 */
void DrawerObjectBase::SetOutlineColor( unsigned int r, unsigned int g, unsigned int b )
{
    outlineColorR = r;
    outlineColorG = g;
    outlineColorB = b;
}

void DrawerObjectBase::SetOutlineOpacity(float val)
{
    if ( val > 255 )
        val = 255;
    else if ( val < 0 )
        val = 0;

    outlineOpacity = val;
}

/**
 * Change the fill color
 */
void DrawerObjectBase::SetFillColor( const std::string & color )
{
    vector < string > colors = SplitString <string> (color, ';');

    if ( colors.size() < 3 ) return;

    fillColorR = ToInt(colors[0]);
    fillColorG = ToInt(colors[1]);
    fillColorB = ToInt(colors[2]);
}

/**
 * Change the color of the outline
 */
void DrawerObjectBase::SetOutlineColor( const std::string & color )
{
    vector < string > colors = SplitString <string> (color, ';');

    if ( colors.size() < 3 ) return; //La couleur est incorrecte

    outlineColorR = ToInt(colors[0]);
    outlineColorG = ToInt(colors[1]);
    outlineColorB = ToInt(colors[2]);
}

void RuntimeDrawerObject::DrawRectangle( float x, float y, float x2, float y2 )
{
    float Xgap = AreCoordinatesAbsolute() ? 0 : GetX();
    float Ygap = AreCoordinatesAbsolute() ? 0 : GetY();

    DrawingCommand command(sf::RectangleShape(sf::Vector2f(x2-x+Xgap, y2-y+Ygap)));
    command.rectangleShape.setPosition(x+Xgap, y+Ygap);
    command.rectangleShape.setFillColor(sf::Color(GetFillColorR(), GetFillColorG(), GetFillColorB(), GetFillOpacity()));
    command.rectangleShape.setOutlineThickness(GetOutlineSize());
    command.rectangleShape.setOutlineColor(sf::Color(GetOutlineColorR(), GetOutlineColorG(), GetOutlineColorB(), GetOutlineOpacity()));

    shapesToDraw.push_back(command);
}

void RuntimeDrawerObject::DrawLine( float x, float y, float x2, float y2, float thickness )
{
    float Xgap = AreCoordinatesAbsolute() ? 0 : GetX();
    float Ygap = AreCoordinatesAbsolute() ? 0 : GetY();

    float length = sqrt((x-x2)*(x-x2)+(y-y2)*(y-y2));
    DrawingCommand command(sf::RectangleShape(sf::Vector2f(length, thickness)));
    command.rectangleShape.setPosition((x+x2)/2+Xgap, (y+y2)/2+Ygap);
    command.rectangleShape.setOrigin(length/2, thickness/2);
    command.rectangleShape.setRotation(atan2(y2-y,x2-x)*180/3.14159);
    command.rectangleShape.setFillColor(sf::Color(GetFillColorR(), GetFillColorG(), GetFillColorB(), GetFillOpacity()));
    command.rectangleShape.setOutlineThickness(GetOutlineSize());
    command.rectangleShape.setOutlineColor(sf::Color(GetOutlineColorR(), GetOutlineColorG(), GetOutlineColorB(), GetOutlineOpacity()));

    shapesToDraw.push_back(command);
}

void RuntimeDrawerObject::DrawCircle( float x, float y, float radius )
{
    float Xgap = AreCoordinatesAbsolute() ? 0 : GetX();
    float Ygap = AreCoordinatesAbsolute() ? 0 : GetY();

    sf::CircleShape circle(radius);
    DrawingCommand command(circle);
    command.circleShape.setPosition(x+Xgap, y+Ygap);
    command.circleShape.setFillColor(sf::Color(GetFillColorR(), GetFillColorG(), GetFillColorB(), GetFillOpacity()));
    command.circleShape.setOutlineThickness(GetOutlineSize());
    command.circleShape.setOutlineColor(sf::Color(GetOutlineColorR(), GetOutlineColorG(), GetOutlineColorB(), GetOutlineOpacity()));

    shapesToDraw.push_back(command);
}

void DestroyRuntimeDrawerObject(RuntimeObject * object)
{
    delete object;
}

RuntimeObject * CreateRuntimeDrawerObject(RuntimeScene & scene, const gd::Object & object)
{
    return new RuntimeDrawerObject(scene, object);
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyDrawerObject(gd::Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
gd::Object * CreateDrawerObject(std::string name)
{
    return new DrawerObject(name);
}

