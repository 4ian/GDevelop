/**

Game Develop - Box 3D Extension
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

#include "Box3DObject.h"
#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>
#include "GDL/Object.h"
#include "GDL/ImageManager.h"
#include "GDL/FontManager.h"
#include "GDL/Position.h"
#include "GDL/RotatedRectangle.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/IDE/ArbitraryResourceWorker.h"

#if defined(GD_IDE_ONLY)
#include <wx/bitmap.h>
#include <wx/panel.h>
#include "GDL/CommonTools.h"
#include "GDL/IDE/MainEditorCommand.h"
#include "Box3DObjectEditor.h"
#include "Box3DInitialPositionPanel.h"
#endif

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
depth(32),
zPosition(0),
yaw(0),
pitch(0),
roll(0)
{
}

Box3DObject::~Box3DObject()
{
}

void Box3DObject::LoadFromXml(const TiXmlElement * object)
{
    if ( object->FirstChildElement( "frontTexture" ) == NULL ||
         object->FirstChildElement( "frontTexture" )->Attribute("value") == NULL )
    {
        cout << "Box3DObject : frontTexture is missing.";
    }
    else
        frontTextureName = object->FirstChildElement("frontTexture")->Attribute("value");

    if ( object->FirstChildElement( "topTexture" ) == NULL ||
         object->FirstChildElement( "topTexture" )->Attribute("value") == NULL )
    {
        cout << "Box3DObject : topTexture is missing.";
    }
    else
        topTextureName = object->FirstChildElement("topTexture")->Attribute("value");

    if ( object->FirstChildElement( "bottomTexture" ) == NULL ||
         object->FirstChildElement( "bottomTexture" )->Attribute("value") == NULL )
    {
        cout << "Box3DObject : bottomTexture is missing.";
    }
    else
        bottomTextureName = object->FirstChildElement("bottomTexture")->Attribute("value");

    if ( object->FirstChildElement( "leftTexture" ) == NULL ||
         object->FirstChildElement( "leftTexture" )->Attribute("value") == NULL )
    {
        cout << "Box3DObject : leftTexture is missing.";
    }
    else
        leftTextureName = object->FirstChildElement("leftTexture")->Attribute("value");

    if ( object->FirstChildElement( "rightTexture" ) == NULL ||
         object->FirstChildElement( "rightTexture" )->Attribute("value") == NULL )
    {
        cout << "Box3DObject : rightTexture is missing.";
    }
    else
        rightTextureName = object->FirstChildElement("rightTexture")->Attribute("value");

    if ( object->FirstChildElement( "backTexture" ) == NULL ||
         object->FirstChildElement( "backTexture" )->Attribute("value") == NULL )
    {
        cout << "Box3DObject : backTexture is missing.";
    }
    else
        backTextureName = object->FirstChildElement("backTexture")->Attribute("value");

    if ( object->FirstChildElement( "width" ) == NULL ||
         object->FirstChildElement( "width" )->Attribute("value") == NULL )
    {
        cout << "Box3DObject : width is missing.";
    }
    else
        object->FirstChildElement("width")->QueryFloatAttribute("value", &width);

    if ( object->FirstChildElement( "height" ) == NULL ||
         object->FirstChildElement( "height" )->Attribute("value") == NULL )
    {
        cout << "Box3DObject : height is missing.";
    }
    else
        object->FirstChildElement("height")->QueryFloatAttribute("value", &height);

    if ( object->FirstChildElement( "depth" ) == NULL ||
         object->FirstChildElement( "depth" )->Attribute("value") == NULL )
    {
        cout << "Box3DObject : depth is missing.";
    }
    else
        object->FirstChildElement("depth")->QueryFloatAttribute("value", &depth);
}

#if defined(GD_IDE_ONLY)
void Box3DObject::SaveToXml(TiXmlElement * object)
{
    {
        TiXmlElement * elem = new TiXmlElement( "frontTexture" );
        object->LinkEndChild( elem );
        elem->SetAttribute("value", frontTextureName.c_str());
    }
    {
        TiXmlElement * elem = new TiXmlElement( "topTexture" );
        object->LinkEndChild( elem );
        elem->SetAttribute("value", topTextureName.c_str());
    }
    {
        TiXmlElement * elem = new TiXmlElement( "bottomTexture" );
        object->LinkEndChild( elem );
        elem->SetAttribute("value", bottomTextureName.c_str());
    }
    {
        TiXmlElement * elem = new TiXmlElement( "leftTexture" );
        object->LinkEndChild( elem );
        elem->SetAttribute("value", leftTextureName.c_str());
    }
    {
        TiXmlElement * elem = new TiXmlElement( "rightTexture" );
        object->LinkEndChild( elem );
        elem->SetAttribute("value", rightTextureName.c_str());
    }
    {
        TiXmlElement * elem = new TiXmlElement( "backTexture" );
        object->LinkEndChild( elem );
        elem->SetAttribute("value", backTextureName.c_str());
    }
    {
        TiXmlElement * elem = new TiXmlElement( "width" );
        object->LinkEndChild( elem );
        elem->SetAttribute("value", width);
    }
    {
        TiXmlElement * elem = new TiXmlElement( "height" );
        object->LinkEndChild( elem );
        elem->SetAttribute("value", height);
    }
    {
        TiXmlElement * elem = new TiXmlElement( "depth" );
        object->LinkEndChild( elem );
        elem->SetAttribute("value", depth);
    }
}
#endif

bool Box3DObject::LoadResources(const RuntimeScene & scene, const ImageManager & imageMgr )
{
    frontTexture =  imageMgr.GetSFMLTexture(frontTextureName);
    topTexture =    imageMgr.GetSFMLTexture(topTextureName);
    bottomTexture = imageMgr.GetSFMLTexture(bottomTextureName) ;
    leftTexture =   imageMgr.GetSFMLTexture(leftTextureName);
    rightTexture =  imageMgr.GetSFMLTexture(rightTextureName);
    backTexture =   imageMgr.GetSFMLTexture(backTextureName);

    return true;
}

/**
 * Update from the inital position
 */
bool Box3DObject::InitializeFromInitialPosition(const InitialPosition & position)
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
bool Box3DObject::Draw( sf::RenderTarget& window )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;

    window.RestoreGLStates();

    float xView =  window.GetView().GetCenter().x*0.25f;
    float yView = -window.GetView().GetCenter().y*0.25f;

    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();

    //Position
    glRotatef(window.GetView().GetRotation(), 0, 0, 1);
    glTranslatef(GetX()*0.25f - xView, -GetY()*0.25f - yView, zPosition*0.25f - 75.0f*(window.GetView().GetSize().y/600.0f));

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
    glBlendFunc (GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    backTexture->texture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(0        , 0,            0);
        glTexCoord2f(0, 1); glVertex3f(0        , sizeHeight,   0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth, sizeHeight,   0);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth, 0,            0);
    glEnd();

    frontTexture->texture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(0        , 0,            sizeDepth);
        glTexCoord2f(0, 1); glVertex3f(0        , sizeHeight,   sizeDepth);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth, sizeHeight,   sizeDepth);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth, 0,            sizeDepth);
    glEnd();

    leftTexture->texture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(0,       0,              0);
        glTexCoord2f(0, 1); glVertex3f(0,       sizeHeight,     0);
        glTexCoord2f(1, 1); glVertex3f(0,       sizeHeight,     sizeDepth);
        glTexCoord2f(1, 0); glVertex3f(0,       0,              sizeDepth);
    glEnd();

    rightTexture->texture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(sizeWidth, 0,            0);
        glTexCoord2f(0, 1); glVertex3f(sizeWidth, sizeHeight,   0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth, sizeHeight,   sizeDepth);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth, 0,            sizeDepth);
    glEnd();

    bottomTexture->texture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 1); glVertex3f(0,           0,          sizeDepth);
        glTexCoord2f(0, 0); glVertex3f(0,           0,          0);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth,   0,          0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth,   0,          sizeDepth);
    glEnd();

    topTexture->texture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 1); glVertex3f(0,           sizeHeight, sizeDepth);
        glTexCoord2f(0, 0); glVertex3f(0,           sizeHeight, 0);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth,   sizeHeight, 0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth,   sizeHeight, sizeDepth);
    glEnd();

    window.SaveGLStates();

    return true;
}

#if defined(GD_IDE_ONLY)
/**
 * Render object at edittime
 */
bool Box3DObject::DrawEdittime(sf::RenderTarget& window)
{
    window.RestoreGLStates();

    float xView =  window.GetView().GetCenter().x*0.25f;
    float yView = -window.GetView().GetCenter().y*0.25f;

    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();

    //Position
    glRotatef(window.GetView().GetRotation(), 0, 0, 1);
    glTranslatef(GetX()*0.25f - xView, -GetY()*0.25f - yView, zPosition*0.25f - 75.0f*(window.GetView().GetSize().y/600.0f));

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
    glBlendFunc (GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    backTexture->texture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(0        , 0,            0);
        glTexCoord2f(0, 1); glVertex3f(0        , sizeHeight,   0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth, sizeHeight,   0);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth, 0,            0);
    glEnd();

    frontTexture->texture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(0        , 0,            sizeDepth);
        glTexCoord2f(0, 1); glVertex3f(0        , sizeHeight,   sizeDepth);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth, sizeHeight,   sizeDepth);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth, 0,            sizeDepth);
    glEnd();

    leftTexture->texture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(0,       0,              0);
        glTexCoord2f(0, 1); glVertex3f(0,       sizeHeight,     0);
        glTexCoord2f(1, 1); glVertex3f(0,       sizeHeight,     sizeDepth);
        glTexCoord2f(1, 0); glVertex3f(0,       0,              sizeDepth);
    glEnd();

    rightTexture->texture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(sizeWidth, 0,            0);
        glTexCoord2f(0, 1); glVertex3f(sizeWidth, sizeHeight,   0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth, sizeHeight,   sizeDepth);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth, 0,            sizeDepth);
    glEnd();

    bottomTexture->texture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 1); glVertex3f(0,           0,          sizeDepth);
        glTexCoord2f(0, 0); glVertex3f(0,           0,          0);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth,   0,          0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth,   0,          sizeDepth);
    glEnd();

    topTexture->texture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 1); glVertex3f(0,           sizeHeight, sizeDepth);
        glTexCoord2f(0, 0); glVertex3f(0,           sizeHeight, 0);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth,   sizeHeight, 0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth,   sizeHeight, sizeDepth);
    glEnd();

    window.SaveGLStates();

    return true;
}

void Box3DObject::ExposeResources(ArbitraryResourceWorker & worker)
{
    worker.ExposeImage(frontTextureName);
    worker.ExposeImage(topTextureName);
    worker.ExposeImage(bottomTextureName);
    worker.ExposeImage(leftTextureName);
    worker.ExposeImage(rightTextureName);
    worker.ExposeImage(backTextureName);
}

bool Box3DObject::GenerateThumbnail(const Game & game, wxBitmap & thumbnail)
{
    thumbnail = wxBitmap("Extensions/Box3Dicon24.png", wxBITMAP_TYPE_ANY);

    return true;
}

void Box3DObject::EditObject( wxWindow* parent, Game & game, MainEditorCommand & mainEditorCommand )
{
    Box3DObjectEditor dialog(parent, game, *this, mainEditorCommand);
    dialog.ShowModal();
}

wxPanel * Box3DObject::CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position )
{
    Box3DInitialPositionPanel * panel = new Box3DInitialPositionPanel(parent);

    if ( position.floatInfos.find("z") != position.floatInfos.end())
        panel->zEdit->ChangeValue(ToString( position.floatInfos.find("z")->second));

    panel->yawEdit->ChangeValue(ToString(position.angle));

    if ( position.floatInfos.find("pitch") != position.floatInfos.end())
        panel->pitchEdit->ChangeValue(ToString(position.floatInfos.find("pitch")->second));

    if ( position.floatInfos.find("roll") != position.floatInfos.end())
        panel->rollEdit->ChangeValue(ToString(position.floatInfos.find("roll")->second));

    return panel;
}

void Box3DObject::UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position)
{
    Box3DInitialPositionPanel * box3DPanel = dynamic_cast<Box3DInitialPositionPanel*>(panel);
    if (box3DPanel == NULL) return;

    position.floatInfos["z"] = ToFloat(string(box3DPanel->zEdit->GetValue().mb_str()));
    position.angle = ToFloat(string(box3DPanel->yawEdit->GetValue().mb_str()));
    position.floatInfos["pitch"] = ToFloat(string(box3DPanel->pitchEdit->GetValue().mb_str()));
    position.floatInfos["roll"] = ToFloat(string(box3DPanel->rollEdit->GetValue().mb_str()));
}

void Box3DObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Largeur");       value = ToString(width);}
    else if ( propertyNb == 1 ) {name = _("Hauteur");       value = ToString(height);}
    else if ( propertyNb == 2 ) {name = _("Profondeur");    value = ToString(depth);}
    else if ( propertyNb == 3 ) {name = _("Coordonnée Z");  value = ToString(zPosition);}
    else if ( propertyNb == 4 ) {name = _("Yaw");           value = ToString(yaw);}
    else if ( propertyNb == 5 ) {name = _("Pitch");         value = ToString(pitch);}
    else if ( propertyNb == 6 ) {name = _("Roll");          value = ToString(roll);}
}

bool Box3DObject::ChangeProperty(unsigned int propertyNb, string newValue)
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

unsigned int Box3DObject::GetNumberOfProperties() const
{
    return 7;
}
#endif

/**
 * Box3D object provides a basic bounding box.
 */
std::vector<RotatedRectangle> Box3DObject::GetHitBoxes() const
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
 * Get the real X position of the box
 */
float Box3DObject::GetDrawableX() const
{
    return GetX();
}

/**
 * Get the real Y position of the box
 */
float Box3DObject::GetDrawableY() const
{
    return GetY();
}

/**
 * Width is the width of the current sprite.
 */
float Box3DObject::GetWidth() const
{
    return width;
}

/**
 * Height is the height of the current sprite.
 */
float Box3DObject::GetHeight() const
{
    return height;
}

/**
 * X center
 */
float Box3DObject::GetCenterX() const
{
    return width/2;
}

/**
 * Y center
 */
float Box3DObject::GetCenterY() const
{
    return height/2;
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyBox3DObject(Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
Object * CreateBox3DObject(std::string name)
{
    return new Box3DObject(name);
}
