/**

GDevelop - Panel Sprite Extension
Copyright (c) 2012-2015 Victor Levasseur (victorlevasseur01@orange.fr)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/bitmap.h> //Must be placed first, otherwise we get errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#include <wx/panel.h>
#endif
#include "GDCore/Tools/Localization.h"
#include "PanelSpriteObject.h"
#include <SFML/Graphics.hpp>
#include "GDCpp/Project/Object.h"
#include "GDCpp/ImageManager.h"
#include "GDCpp/FontManager.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeGame.h"
#include "GDCpp/Project/Project.h"
#include "GDCpp/Project/InitialInstance.h"
#include "GDCpp/Polygon2d.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/CommonTools.h"
#include "GDCore/Tools/Localization.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "PanelSpriteObjectEditor.h"
#endif

using namespace std;

PanelSpriteObject::PanelSpriteObject(gd::String name_) :
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
    tiled = element.GetBoolAttribute("tiled");
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
    element.SetAttribute("tiled", tiled);
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
#if !defined(GD_NO_WX_GUI)
    thumbnail = wxBitmap("CppPlatform/Extensions/PanelSpriteIcon24.png", wxBITMAP_TYPE_ANY);
#endif

    return true;
}

void PanelSpriteObject::EditObject( wxWindow* parent, gd::Project & game, gd::MainFrameWrapper & mainFrameWrapper )
{
#if !defined(GD_NO_WX_GUI)
    PanelSpriteObjectEditor dialog(parent, game, *this, mainFrameWrapper);
    dialog.ShowModal();
#endif
}

void RuntimePanelSpriteObject::GetPropertyForDebugger(std::size_t propertyNb, gd::String & name, gd::String & value) const
{
    if      ( propertyNb == 0 ) {name = _("Width");       value = gd::String::From(width);}
    else if ( propertyNb == 1 ) {name = _("Height");       value = gd::String::From(height);}
    else if ( propertyNb == 2 ) {name = _("Left Margin");       value = gd::String::From(leftMargin);}
    else if ( propertyNb == 3 ) {name = _("Top Margin");       value = gd::String::From(topMargin);}
    else if ( propertyNb == 4 ) {name = _("Right Margin");       value = gd::String::From(rightMargin);}
    else if ( propertyNb == 5 ) {name = _("Bottom Margin");       value = gd::String::From(bottomMargin);}
}

bool RuntimePanelSpriteObject::ChangeProperty(std::size_t propertyNb, gd::String newValue)
{
    if      ( propertyNb == 0 ) {width = newValue.To<float>();}
    else if ( propertyNb == 1 ) {height = newValue.To<float>();}
    else if ( propertyNb == 2 ) {leftMargin = newValue.To<float>();}
    else if ( propertyNb == 3 ) {topMargin = newValue.To<float>();}
    else if ( propertyNb == 4 ) {rightMargin = newValue.To<float>();}
    else if ( propertyNb == 5 ) {bottomMargin = newValue.To<float>();}

    return true;
}

std::size_t RuntimePanelSpriteObject::GetNumberOfProperties() const
{
    return 6;
}
#endif


void RuntimePanelSpriteObject::ChangeAndReloadImage(const gd::String &txtName, const RuntimeScene &scene)
{
    textureName = txtName;
    texture = scene.GetImageManager()->GetSFMLTexture(textureName);
}

RuntimeObject * CreateRuntimePanelSpriteObject(RuntimeScene & scene, const gd::Object & object)
{
    return new RuntimePanelSpriteObject(scene, object);
}

gd::Object * CreatePanelSpriteObject(gd::String name)
{
    return new PanelSpriteObject(name);
}
