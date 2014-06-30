/**

Game Develop - Panel Sprite Extension
Copyright (c) 2012 Victor Levasseur (victorlevasseur01@orange.fr)

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
#include <wx/bitmap.h> //Must be placed first, otherwise we get errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#include <wx/panel.h>
#endif
#include "PanelSpriteObject.h"
#include <SFML/Graphics.hpp>
#include "GDCpp/Object.h"
#include "GDCpp/ImageManager.h"
#include "GDCpp/FontManager.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeGame.h"
#include "GDCpp/Project.h"
#include "GDCpp/Position.h"
#include "GDCpp/Polygon.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/CommonTools.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "PanelSpriteObjectEditor.h"
#endif

using namespace std;

PanelSpriteObject::PanelSpriteObject(std::string name_) :
    Object(name_),
    textureName(""),
    width(32),
    height(32),
    leftMargin(0),
    topMargin(0),
    rightMargin(0),
    bottomMargin(0)
{
}

PanelSpriteObject::~PanelSpriteObject()
{
}

void PanelSpriteObject::DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element)
{
    textureName = element.GetStringAttribute("texture");
    width = element.GetIntAttribute("width", 32);
    height = element.GetIntAttribute("height", 32);
    leftMargin = element.GetIntAttribute("leftMargin");
    topMargin = element.GetIntAttribute("topMargin");
    rightMargin = element.GetIntAttribute("rightMargin");
    bottomMargin = element.GetIntAttribute("bottomMargin");
}

#if defined(GD_IDE_ONLY)
void PanelSpriteObject::DoSerializeTo(gd::SerializerElement & element) const
{
    element.SetAttribute("texture", textureName);
    element.SetAttribute("width", width);
    element.SetAttribute("height", height);
    element.SetAttribute("leftMargin", leftMargin);
    element.SetAttribute("topMargin", topMargin);
    element.SetAttribute("rightMargin", rightMargin);
    element.SetAttribute("bottomMargin", bottomMargin);
}

void PanelSpriteObject::LoadResources(gd::Project & project, gd::Layout & layout)
{
    texture = project.GetImageManager()->GetSFMLTexture(textureName);
}
#endif

RuntimePanelSpriteObject::RuntimePanelSpriteObject(RuntimeScene & scene, const gd::Object & object) :
    RuntimeObject(scene, object),
    width(32),
    height(32),
    angle(0)
{
    const PanelSpriteObject & panelSpriteObject = static_cast<const PanelSpriteObject&>(object);

    SetRightMargin(panelSpriteObject.GetRightMargin());
    SetLeftMargin(panelSpriteObject.GetLeftMargin());
    SetBottomMargin(panelSpriteObject.GetBottomMargin());
    SetTopMargin(panelSpriteObject.GetTopMargin());
    SetWidth(panelSpriteObject.GetWidth());
    SetHeight(panelSpriteObject.GetHeight());

    textureName = panelSpriteObject.textureName;
    ChangeAndReloadImage(textureName, scene);
}

/**
* Render object at runtime
*/
bool RuntimePanelSpriteObject::Draw( sf::RenderTarget& window )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;
    if (!texture) return true;

    sf::Vector2f centerPosition = sf::Vector2f(GetX()+GetCenterX(),GetY()+GetCenterY());

    float imageWidth = texture->texture.getSize().x;
    float imageHeight = texture->texture.getSize().y;

    sf::Vertex vertices[] =
    {
        //Center part (streched)
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,-height/2 + topMargin   ), sf::Vector2f(leftMargin              ,topMargin            )),
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,-height/2 + topMargin   ), sf::Vector2f(imageWidth - rightMargin,topMargin            )),
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,+height/2 - bottomMargin), sf::Vector2f(imageWidth - rightMargin,imageHeight - bottomMargin)),
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,+height/2 - bottomMargin), sf::Vector2f(leftMargin              ,imageHeight - bottomMargin)),

        //Top-left
        sf::Vertex( sf::Vector2f(-width/2              ,-height/2               ), sf::Vector2f(0                       ,0                    )),
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,-height/2               ), sf::Vector2f(leftMargin              ,0                    )),
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,-height/2 + topMargin   ), sf::Vector2f(leftMargin              ,topMargin            )),
        sf::Vertex( sf::Vector2f(-width/2              ,-height/2 + topMargin   ), sf::Vector2f(0                       ,topMargin            )),

        //Top
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,-height/2               ), sf::Vector2f(leftMargin              ,0                    )),
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,-height/2               ), sf::Vector2f(imageWidth - rightMargin,0                    )),
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,-height/2 + topMargin   ), sf::Vector2f(imageWidth - rightMargin,topMargin            )),
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,-height/2 + topMargin   ), sf::Vector2f(leftMargin              ,topMargin            )),

        //Top-right
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,-height/2               ), sf::Vector2f(imageWidth - rightMargin,0                    )),
        sf::Vertex( sf::Vector2f(+width/2              ,-height/2               ), sf::Vector2f(imageWidth              ,0                    )),
        sf::Vertex( sf::Vector2f(+width/2              ,-height/2 + topMargin   ), sf::Vector2f(imageWidth              ,topMargin            )),
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,-height/2 + topMargin   ), sf::Vector2f(imageWidth - rightMargin,topMargin            )),

        //Right
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,-height/2 + topMargin   ), sf::Vector2f(imageWidth - rightMargin,topMargin                 )),
        sf::Vertex( sf::Vector2f(+width/2              ,-height/2 + topMargin   ), sf::Vector2f(imageWidth              ,topMargin                 )),
        sf::Vertex( sf::Vector2f(+width/2              ,+height/2 - bottomMargin), sf::Vector2f(imageWidth              ,imageHeight - bottomMargin)),
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,+height/2 - bottomMargin), sf::Vector2f(imageWidth - rightMargin,imageHeight - bottomMargin)),

        //Bottom-left
        sf::Vertex( sf::Vector2f(-width/2              ,+height/2 - bottomMargin), sf::Vector2f(0                       ,imageHeight - bottomMargin)),
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,+height/2 - bottomMargin), sf::Vector2f(leftMargin              ,imageHeight - bottomMargin)),
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,+height/2               ), sf::Vector2f(leftMargin              ,imageHeight               )),
        sf::Vertex( sf::Vector2f(-width/2              ,+height/2               ), sf::Vector2f(0                       ,imageHeight               )),

        //Bottom
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,+height/2 - bottomMargin), sf::Vector2f(leftMargin              ,imageHeight - bottomMargin)),
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,+height/2 - bottomMargin), sf::Vector2f(imageWidth - rightMargin,imageHeight - bottomMargin)),
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,+height/2               ), sf::Vector2f(imageWidth - rightMargin,imageHeight               )),
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,+height/2               ), sf::Vector2f(leftMargin              ,imageHeight               )),

        //Bottom-right
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,+height/2 - bottomMargin), sf::Vector2f(imageWidth - rightMargin,imageHeight - bottomMargin)),
        sf::Vertex( sf::Vector2f(+width/2              ,+height/2 - bottomMargin), sf::Vector2f(imageWidth              ,imageHeight - bottomMargin)),
        sf::Vertex( sf::Vector2f(+width/2              ,+height/2               ), sf::Vector2f(imageWidth              ,imageHeight               )),
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,+height/2               ), sf::Vector2f(imageWidth - rightMargin,imageHeight               )),

        //Left
        sf::Vertex( sf::Vector2f(-width/2              ,-height/2 + topMargin   ), sf::Vector2f(0                       ,topMargin                 )),
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,-height/2 + topMargin   ), sf::Vector2f(leftMargin              ,topMargin                 )),
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,+height/2 - bottomMargin), sf::Vector2f(leftMargin              ,imageHeight - bottomMargin)),
        sf::Vertex( sf::Vector2f(-width/2              ,+height/2 - bottomMargin), sf::Vector2f(0                       ,imageHeight - bottomMargin)),

    };

    sf::Transform matrix;
    matrix.translate(centerPosition);
    matrix.rotate(angle);

    sf::RenderStates states;
    states.transform = matrix;
    states.texture = &texture->texture;

    window.draw(vertices, 36, sf::Quads, states);

    return true;
}

#if defined(GD_IDE_ONLY)
sf::Vector2f PanelSpriteObject::GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const
{
    return sf::Vector2f(width,height);
}

/**
 * Render object at edittime
 */
void PanelSpriteObject::DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout)
{
    if (!texture) return;

    float imageWidth = texture->texture.getSize().x;
    float imageHeight = texture->texture.getSize().y;
    float width = instance.HasCustomSize() ? instance.GetCustomWidth() : GetInitialInstanceDefaultSize(instance, project, layout).x;
    float height = instance.HasCustomSize() ? instance.GetCustomHeight() : GetInitialInstanceDefaultSize(instance, project, layout).y;

    sf::Vertex vertices[] =
    {
        //Center part (streched)
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,-height/2 + topMargin   ), sf::Vector2f(leftMargin              ,topMargin            )),
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,-height/2 + topMargin   ), sf::Vector2f(imageWidth - rightMargin,topMargin            )),
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,+height/2 - bottomMargin), sf::Vector2f(imageWidth - rightMargin,imageHeight - bottomMargin)),
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,+height/2 - bottomMargin), sf::Vector2f(leftMargin              ,imageHeight - bottomMargin)),

        //Top-left
        sf::Vertex( sf::Vector2f(-width/2              ,-height/2               ), sf::Vector2f(0                       ,0                    )),
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,-height/2               ), sf::Vector2f(leftMargin              ,0                    )),
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,-height/2 + topMargin   ), sf::Vector2f(leftMargin              ,topMargin            )),
        sf::Vertex( sf::Vector2f(-width/2              ,-height/2 + topMargin   ), sf::Vector2f(0                       ,topMargin            )),

        //Top
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,-height/2               ), sf::Vector2f(leftMargin              ,0                    )),
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,-height/2               ), sf::Vector2f(imageWidth - rightMargin,0                    )),
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,-height/2 + topMargin   ), sf::Vector2f(imageWidth - rightMargin,topMargin            )),
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,-height/2 + topMargin   ), sf::Vector2f(leftMargin              ,topMargin            )),

        //Top-right
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,-height/2               ), sf::Vector2f(imageWidth - rightMargin,0                    )),
        sf::Vertex( sf::Vector2f(+width/2              ,-height/2               ), sf::Vector2f(imageWidth              ,0                    )),
        sf::Vertex( sf::Vector2f(+width/2              ,-height/2 + topMargin   ), sf::Vector2f(imageWidth              ,topMargin            )),
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,-height/2 + topMargin   ), sf::Vector2f(imageWidth - rightMargin,topMargin            )),

        //Right
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,-height/2 + topMargin   ), sf::Vector2f(imageWidth - rightMargin,topMargin                 )),
        sf::Vertex( sf::Vector2f(+width/2              ,-height/2 + topMargin   ), sf::Vector2f(imageWidth              ,topMargin                 )),
        sf::Vertex( sf::Vector2f(+width/2              ,+height/2 - bottomMargin), sf::Vector2f(imageWidth              ,imageHeight - bottomMargin)),
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,+height/2 - bottomMargin), sf::Vector2f(imageWidth - rightMargin,imageHeight - bottomMargin)),

        //Bottom-left
        sf::Vertex( sf::Vector2f(-width/2              ,+height/2 - bottomMargin), sf::Vector2f(0                       ,imageHeight - bottomMargin)),
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,+height/2 - bottomMargin), sf::Vector2f(leftMargin              ,imageHeight - bottomMargin)),
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,+height/2               ), sf::Vector2f(leftMargin              ,imageHeight               )),
        sf::Vertex( sf::Vector2f(-width/2              ,+height/2               ), sf::Vector2f(0                       ,imageHeight               )),

        //Bottom
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,+height/2 - bottomMargin), sf::Vector2f(leftMargin              ,imageHeight - bottomMargin)),
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,+height/2 - bottomMargin), sf::Vector2f(imageWidth - rightMargin,imageHeight - bottomMargin)),
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,+height/2               ), sf::Vector2f(imageWidth - rightMargin,imageHeight               )),
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,+height/2               ), sf::Vector2f(leftMargin              ,imageHeight               )),

        //Bottom-right
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,+height/2 - bottomMargin), sf::Vector2f(imageWidth - rightMargin,imageHeight - bottomMargin)),
        sf::Vertex( sf::Vector2f(+width/2              ,+height/2 - bottomMargin), sf::Vector2f(imageWidth              ,imageHeight - bottomMargin)),
        sf::Vertex( sf::Vector2f(+width/2              ,+height/2               ), sf::Vector2f(imageWidth              ,imageHeight               )),
        sf::Vertex( sf::Vector2f(+width/2 - rightMargin,+height/2               ), sf::Vector2f(imageWidth - rightMargin,imageHeight               )),

        //Left
        sf::Vertex( sf::Vector2f(-width/2              ,-height/2 + topMargin   ), sf::Vector2f(0                       ,topMargin                 )),
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,-height/2 + topMargin   ), sf::Vector2f(leftMargin              ,topMargin                 )),
        sf::Vertex( sf::Vector2f(-width/2 + leftMargin ,+height/2 - bottomMargin), sf::Vector2f(leftMargin              ,imageHeight - bottomMargin)),
        sf::Vertex( sf::Vector2f(-width/2              ,+height/2 - bottomMargin), sf::Vector2f(0                       ,imageHeight - bottomMargin)),

    };
    sf::Vector2f centerPosition = sf::Vector2f(instance.GetX()+width/2, instance.GetY()+height/2);

    sf::Transform matrix;
    matrix.translate(centerPosition);
    matrix.rotate(instance.GetAngle());

    sf::RenderStates states;
    states.transform = matrix;
    states.texture = &texture->texture;

    renderTarget.draw(vertices, 36, sf::Quads, states);

    return;
}

void PanelSpriteObject::ExposeResources(gd::ArbitraryResourceWorker & worker)
{
    worker.ExposeImage(textureName);
}

bool PanelSpriteObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const
{
    thumbnail = wxBitmap("CppPlatform/Extensions/PanelSpriteIcon24.png", wxBITMAP_TYPE_ANY);

    return true;
}

void PanelSpriteObject::EditObject( wxWindow* parent, gd::Project & game, gd::MainFrameWrapper & mainFrameWrapper )
{
    PanelSpriteObjectEditor dialog(parent, game, *this, mainFrameWrapper);
    dialog.ShowModal();
}

void RuntimePanelSpriteObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Width");       value = ToString(width);}
    else if ( propertyNb == 1 ) {name = _("Height");       value = ToString(height);}
    else if ( propertyNb == 2 ) {name = _("Left Margin");       value = ToString(leftMargin);}
    else if ( propertyNb == 3 ) {name = _("Top Margin");       value = ToString(topMargin);}
    else if ( propertyNb == 4 ) {name = _("Right Margin");       value = ToString(rightMargin);}
    else if ( propertyNb == 5 ) {name = _("Bottom Margin");       value = ToString(bottomMargin);}
}

bool RuntimePanelSpriteObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if      ( propertyNb == 0 ) {width = ToFloat(newValue);}
    else if ( propertyNb == 1 ) {height = ToFloat(newValue);}
    else if ( propertyNb == 2 ) {leftMargin = ToFloat(newValue);}
    else if ( propertyNb == 3 ) {topMargin = ToFloat(newValue);}
    else if ( propertyNb == 4 ) {rightMargin = ToFloat(newValue);}
    else if ( propertyNb == 5 ) {bottomMargin = ToFloat(newValue);}

    return true;
}

unsigned int RuntimePanelSpriteObject::GetNumberOfProperties() const
{
    return 6;
}
#endif


void RuntimePanelSpriteObject::ChangeAndReloadImage(const std::string &txtName, const RuntimeScene &scene)
{
    textureName = txtName;
    texture = scene.GetImageManager()->GetSFMLTexture(textureName);
}

void DestroyRuntimePanelSpriteObject(RuntimeObject * object)
{
    delete object;
}

RuntimeObject * CreateRuntimePanelSpriteObject(RuntimeScene & scene, const gd::Object & object)
{
    return new RuntimePanelSpriteObject(scene, object);
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyPanelSpriteObject(gd::Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
gd::Object * CreatePanelSpriteObject(std::string name)
{
    return new PanelSpriteObject(name);
}

