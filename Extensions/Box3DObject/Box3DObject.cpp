/**

Game Develop - Box 3D Extension
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
#include <wx/bitmap.h> //Must be placed first, otherwise we get errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#include <wx/panel.h>
#endif
#include "Box3DObject.h"
#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>
#include "GDCpp/Project.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeGame.h"
#include "GDCpp/Object.h"
#include "GDCpp/ImageManager.h"
#include "GDCpp/FontManager.h"
#include "GDCpp/Position.h"
#include "GDCpp/Polygon.h"
#include "GDCore/Serialization/SerializerElement.h"

#if defined(GD_IDE_ONLY)
#include "GDCpp/CommonTools.h"
#include "Box3DObjectEditor.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#endif

using namespace std;

Box3DObject::Box3DObject(std::string name_) :
    Object(name_),
    frontTextureName(""),
    topTextureName(""),
    bottomTextureName(""),
    leftTextureName(""),
    rightTextureName(""),
    backTextureName(""),
    width(32),
    height(32),
    depth(32)
{
}

Box3DObject::~Box3DObject()
{
}

void Box3DObject::DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element)
{
    frontTextureName = element.GetChild("frontTexture").GetValue().GetString();
    topTextureName = element.GetChild("topTexture").GetValue().GetString();
    bottomTextureName = element.GetChild("bottomTexture").GetValue().GetString();
    leftTextureName = element.GetChild("leftTexture").GetValue().GetString();
    rightTextureName = element.GetChild("rightTexture").GetValue().GetString();
    backTextureName = element.GetChild("backTexture").GetValue().GetString();
    width = element.GetChild("width").GetValue().GetInt();
    height = element.GetChild("height").GetValue().GetInt();
    depth = element.GetChild("depth").GetValue().GetInt();
}

#if defined(GD_IDE_ONLY)
void Box3DObject::DoSerializeTo(gd::SerializerElement & element) const
{
    element.AddChild("frontTexture").SetValue(frontTextureName);
    element.AddChild("topTexture").SetValue(topTextureName);
    element.AddChild("bottomTexture").SetValue(bottomTextureName);
    element.AddChild("leftTexture").SetValue(leftTextureName);
    element.AddChild("rightTexture").SetValue(rightTextureName);
    element.AddChild("backTexture").SetValue(backTextureName);
    element.AddChild("width").SetValue(width);
    element.AddChild("height").SetValue(height);
    element.AddChild("depth").SetValue(depth);
}

void Box3DObject::LoadResources(gd::Project & project, gd::Layout & layout)
{
    frontTexture =  project.GetImageManager()->GetSFMLTexture(frontTextureName);
    topTexture =    project.GetImageManager()->GetSFMLTexture(topTextureName);
    bottomTexture = project.GetImageManager()->GetSFMLTexture(bottomTextureName) ;
    leftTexture =   project.GetImageManager()->GetSFMLTexture(leftTextureName);
    rightTexture =  project.GetImageManager()->GetSFMLTexture(rightTextureName);
    backTexture =   project.GetImageManager()->GetSFMLTexture(backTextureName);
}
#endif

/**
 * Update from the inital position
 */
bool RuntimeBox3DObject::ExtraInitializationFromInitialInstance(const gd::InitialInstance & position)
{
    if ( position.floatInfos.find("z") != position.floatInfos.end() )
        zPosition = position.floatInfos.find("z")->second;

    if ( position.floatInfos.find("pitch") != position.floatInfos.end() )
        pitch = position.floatInfos.find("pitch")->second;

    if ( position.floatInfos.find("roll") != position.floatInfos.end() )
        roll = position.floatInfos.find("roll")->second;

    return true;
}

/**
 * Render object at runtime
 */
bool RuntimeBox3DObject::Draw( sf::RenderTarget& window )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;

    window.popGLStates();

    float xView =  window.getView().getCenter().x*0.25f;
    float yView = -window.getView().getCenter().y*0.25f;

    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();

    //Position
    glRotatef(window.getView().getRotation(), 0, 0, 1);
    glTranslatef(GetX()*0.25f - xView, -GetY()*0.25f - yView, zPosition*0.25f - 75.0f*(window.getView().getSize().y/600.0f));

    float sizeWidth  =  width*0.25f;
    float sizeHeight = -height*0.25f;
    float sizeDepth  =  depth*0.25f;

    //Rotation
    glTranslatef(sizeWidth/2, sizeHeight/2, sizeDepth/2);
    glRotatef(-yaw, 0, 0, 1);
    glRotatef(pitch, 0, 1, 0);
    glRotatef(roll, 1, 0, 0);
    glTranslatef(-sizeWidth/2, -sizeHeight/2, -sizeDepth/2);

    //Render the box
    glEnable(GL_BLEND);
    glEnable(GL_TEXTURE_2D);
    glBlendFunc (GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    sf::Texture::bind(&backTexture->texture);
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(0        , 0,            0);
        glTexCoord2f(0, 1); glVertex3f(0        , sizeHeight,   0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth, sizeHeight,   0);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth, 0,            0);
    glEnd();

    sf::Texture::bind(&frontTexture->texture);
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(0        , 0,            sizeDepth);
        glTexCoord2f(0, 1); glVertex3f(0        , sizeHeight,   sizeDepth);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth, sizeHeight,   sizeDepth);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth, 0,            sizeDepth);
    glEnd();

    sf::Texture::bind(&leftTexture->texture);
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(0,       0,              0);
        glTexCoord2f(0, 1); glVertex3f(0,       sizeHeight,     0);
        glTexCoord2f(1, 1); glVertex3f(0,       sizeHeight,     sizeDepth);
        glTexCoord2f(1, 0); glVertex3f(0,       0,              sizeDepth);
    glEnd();

    sf::Texture::bind(&rightTexture->texture);
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(sizeWidth, 0,            0);
        glTexCoord2f(0, 1); glVertex3f(sizeWidth, sizeHeight,   0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth, sizeHeight,   sizeDepth);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth, 0,            sizeDepth);
    glEnd();

    sf::Texture::bind(&bottomTexture->texture);
    glBegin(GL_QUADS);
        glTexCoord2f(0, 1); glVertex3f(0,           0,          sizeDepth);
        glTexCoord2f(0, 0); glVertex3f(0,           0,          0);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth,   0,          0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth,   0,          sizeDepth);
    glEnd();

    sf::Texture::bind(&topTexture->texture);
    glBegin(GL_QUADS);
        glTexCoord2f(0, 1); glVertex3f(0,           sizeHeight, sizeDepth);
        glTexCoord2f(0, 0); glVertex3f(0,           sizeHeight, 0);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth,   sizeHeight, 0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth,   sizeHeight, sizeDepth);
    glEnd();

    window.pushGLStates();

    return true;
}

RuntimeBox3DObject::RuntimeBox3DObject(RuntimeScene & scene, const gd::Object & object) :
    RuntimeObject(scene, object),
    zPosition(0),
    yaw(0),
    pitch(0),
    roll(0)
{
    const Box3DObject & box3DObject = static_cast<const Box3DObject&>(object);

    SetWidth(box3DObject.GetWidth());
    SetHeight(box3DObject.GetHeight());
    SetDepth(box3DObject.GetDepth());

    //Load resources
    frontTextureName =  box3DObject.frontTextureName;
    topTextureName =    box3DObject.topTextureName;
    bottomTextureName = box3DObject.bottomTextureName;
    leftTextureName =   box3DObject.leftTextureName;
    rightTextureName =  box3DObject.rightTextureName;
    backTextureName =   box3DObject.backTextureName;
    frontTexture =  scene.GetImageManager()->GetSFMLTexture(frontTextureName);
    topTexture =    scene.GetImageManager()->GetSFMLTexture(topTextureName);
    bottomTexture = scene.GetImageManager()->GetSFMLTexture(bottomTextureName) ;
    leftTexture =   scene.GetImageManager()->GetSFMLTexture(leftTextureName);
    rightTexture =  scene.GetImageManager()->GetSFMLTexture(rightTextureName);
    backTexture =   scene.GetImageManager()->GetSFMLTexture(backTextureName);
}

#if defined(GD_IDE_ONLY)
/**
 * Render object at edittime
 */
void Box3DObject::DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout)
{
    if ( !topTexture || !bottomTexture || ! rightTexture || !leftTexture || !frontTexture || !backTexture ) return;

    renderTarget.popGLStates();

    float width = instance.HasCustomSize() ? instance.GetCustomWidth() : GetInitialInstanceDefaultSize(instance, project, layout).x;
    float height = instance.HasCustomSize() ? instance.GetCustomHeight() : GetInitialInstanceDefaultSize(instance, project, layout).y;
    float xView =  renderTarget.getView().getCenter().x*0.25f;
    float yView = -renderTarget.getView().getCenter().y*0.25f;
    float zPosition = instance.floatInfos.find("z") != instance.floatInfos.end() ?
                                   instance.floatInfos.find("z")->second :
                                   0;

    float pitch = instance.floatInfos.find("pitch") != instance.floatInfos.end() ?
                                   instance.floatInfos.find("pitch")->second :
                                   0;

    float roll = instance.floatInfos.find("roll") != instance.floatInfos.end() ?
                                   instance.floatInfos.find("roll")->second :
                                   0;
    float yaw = instance.GetAngle();

    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();

    //Position
    glRotatef(renderTarget.getView().getRotation(), 0, 0, 1);
    glTranslatef(instance.GetX()*0.25f - xView, -instance.GetY()*0.25f - yView, zPosition*0.25f - 75.0f*(renderTarget.getView().getSize().y/600.0f));

    float sizeWidth  =  width*0.25f;
    float sizeHeight = -height*0.25f;
    float sizeDepth  =  depth*0.25f;

    //Rotation
    glTranslatef(sizeWidth/2, sizeHeight/2, sizeDepth/2);
    glRotatef(-yaw, 0, 0, 1);
    glRotatef(pitch, 0, 1, 0);
    glRotatef(roll, 1, 0, 0);
    glTranslatef(-sizeWidth/2, -sizeHeight/2, -sizeDepth/2);

    //Render the box
    glEnable(GL_BLEND);
    glEnable(GL_TEXTURE_2D);
    glBlendFunc (GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    sf::Texture::bind(&backTexture->texture);
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(0        , 0,            0);
        glTexCoord2f(0, 1); glVertex3f(0        , sizeHeight,   0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth, sizeHeight,   0);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth, 0,            0);
    glEnd();

    sf::Texture::bind(&frontTexture->texture);
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(0        , 0,            sizeDepth);
        glTexCoord2f(0, 1); glVertex3f(0        , sizeHeight,   sizeDepth);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth, sizeHeight,   sizeDepth);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth, 0,            sizeDepth);
    glEnd();

    sf::Texture::bind(&leftTexture->texture);
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(0,       0,              0);
        glTexCoord2f(0, 1); glVertex3f(0,       sizeHeight,     0);
        glTexCoord2f(1, 1); glVertex3f(0,       sizeHeight,     sizeDepth);
        glTexCoord2f(1, 0); glVertex3f(0,       0,              sizeDepth);
    glEnd();

    sf::Texture::bind(&rightTexture->texture);
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(sizeWidth, 0,            0);
        glTexCoord2f(0, 1); glVertex3f(sizeWidth, sizeHeight,   0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth, sizeHeight,   sizeDepth);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth, 0,            sizeDepth);
    glEnd();

    sf::Texture::bind(&bottomTexture->texture);
    glBegin(GL_QUADS);
        glTexCoord2f(0, 1); glVertex3f(0,           0,          sizeDepth);
        glTexCoord2f(0, 0); glVertex3f(0,           0,          0);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth,   0,          0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth,   0,          sizeDepth);
    glEnd();

    sf::Texture::bind(&topTexture->texture);
    glBegin(GL_QUADS);
        glTexCoord2f(0, 1); glVertex3f(0,           sizeHeight, sizeDepth);
        glTexCoord2f(0, 0); glVertex3f(0,           sizeHeight, 0);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth,   sizeHeight, 0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth,   sizeHeight, sizeDepth);
    glEnd();

    renderTarget.pushGLStates();
}

sf::Vector2f Box3DObject::GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const
{
    return sf::Vector2f(width, height);
}

void Box3DObject::ExposeResources(gd::ArbitraryResourceWorker & worker)
{
    worker.ExposeImage(frontTextureName);
    worker.ExposeImage(topTextureName);
    worker.ExposeImage(bottomTextureName);
    worker.ExposeImage(leftTextureName);
    worker.ExposeImage(rightTextureName);
    worker.ExposeImage(backTextureName);
}

bool Box3DObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const
{
    thumbnail = wxBitmap("CppPlatform/Extensions/Box3Dicon24.png", wxBITMAP_TYPE_ANY);

    return true;
}

void Box3DObject::EditObject( wxWindow* parent, gd::Project & game, gd::MainFrameWrapper & mainFrameWrapper )
{
    Box3DObjectEditor dialog(parent, game, *this, mainFrameWrapper);
    dialog.ShowModal();
}

std::map<std::string, gd::PropertyDescriptor> Box3DObject::GetInitialInstanceProperties(const gd::InitialInstance & position, gd::Project & game, gd::Layout & scene)
{
    std::map<std::string, gd::PropertyDescriptor> properties;
    properties[ToString(_("Z"))] = position.floatInfos.find("z") != position.floatInfos.end() ?
                                   ToString(position.floatInfos.find("z")->second) :
                                   "0";

    properties[ToString(_("Pitch"))] = position.floatInfos.find("pitch") != position.floatInfos.end() ?
                                   ToString(position.floatInfos.find("pitch")->second) :
                                   "0";

    properties[ToString(_("Roll"))] = position.floatInfos.find("roll") != position.floatInfos.end() ?
                                   ToString(position.floatInfos.find("roll")->second) :
                                   "0";

    return properties;
}

bool Box3DObject::UpdateInitialInstanceProperty(gd::InitialInstance & position, const std::string & name, const std::string & value, gd::Project & game, gd::Layout & scene)
{
    if ( name == _("Z") ) position.floatInfos["z"] = ToFloat(value);
    if ( name == _("Pitch") ) position.floatInfos["pitch"] = ToFloat(value);
    if ( name == _("Roll") ) position.floatInfos["roll"] = ToFloat(value);

    return true;
}

void RuntimeBox3DObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Width");       value = ToString(width);}
    else if ( propertyNb == 1 ) {name = _("Height");       value = ToString(height);}
    else if ( propertyNb == 2 ) {name = _("Depth");    value = ToString(depth);}
    else if ( propertyNb == 3 ) {name = _("Z Coordinate");  value = ToString(zPosition);}
    else if ( propertyNb == 4 ) {name = _("Yaw");           value = ToString(yaw);}
    else if ( propertyNb == 5 ) {name = _("Pitch");         value = ToString(pitch);}
    else if ( propertyNb == 6 ) {name = _("Roll");          value = ToString(roll);}
}

bool RuntimeBox3DObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if      ( propertyNb == 0 ) {width = ToInt(newValue);}
    else if ( propertyNb == 1 ) {height = ToInt(newValue);}
    else if ( propertyNb == 2 ) {depth = ToInt(newValue);}
    else if ( propertyNb == 3 ) {zPosition = ToInt(newValue);}
    else if ( propertyNb == 4 ) {yaw = ToInt(newValue);}
    else if ( propertyNb == 5 ) {pitch = ToInt(newValue);}
    else if ( propertyNb == 6 ) {roll = ToInt(newValue);}

    return true;
}

unsigned int RuntimeBox3DObject::GetNumberOfProperties() const
{
    return 7;
}
#endif

void DestroyRuntimeBox3DObject(RuntimeObject * object)
{
    delete object;
}

RuntimeObject * CreateRuntimeBox3DObject(RuntimeScene & scene, const gd::Object & object)
{
    return new RuntimeBox3DObject(scene, object);
}


/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyBox3DObject(gd::Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
gd::Object * CreateBox3DObject(std::string name)
{
    return new Box3DObject(name);
}

