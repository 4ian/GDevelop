#include "Box3DObject.h"
#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>
#include "GDL/Object.h"
#include "GDL/Access.h"
#include "GDL/ImageManager.h"
#include "GDL/FontManager.h"
#include "GDL/tinyxml.h"

#ifdef GDE
#include <wx/wx.h>
#include "GDL/StdAlgo.h"
#include "GDL/MainEditorCommand.h"
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

bool Box3DObject::LoadResources(const ImageManager & imageMgr )
{
    frontTexture =  imageMgr.images.find(frontTextureName) != imageMgr.images.end() ?
                    imageMgr.images.find(frontTextureName)->second :
                    imageMgr.imageVide;

    topTexture =    imageMgr.images.find(topTextureName) != imageMgr.images.end() ?
                    imageMgr.images.find(topTextureName)->second :
                    imageMgr.imageVide;

    bottomTexture = imageMgr.images.find(bottomTextureName) != imageMgr.images.end() ?
                    imageMgr.images.find(bottomTextureName)->second :
                    imageMgr.imageVide;

    leftTexture =   imageMgr.images.find(leftTextureName) != imageMgr.images.end() ?
                    imageMgr.images.find(leftTextureName)->second :
                    imageMgr.imageVide;

    rightTexture =  imageMgr.images.find(rightTextureName) != imageMgr.images.end() ?
                    imageMgr.images.find(rightTextureName)->second :
                    imageMgr.imageVide;

    backTexture =   imageMgr.images.find(backTextureName) != imageMgr.images.end() ?
                    imageMgr.images.find(backTextureName)->second :
                    imageMgr.imageVide;

    return true;
}

/**
 * Update from the inital position
 */
bool Box3DObject::InitializeFromInitialPosition(const InitialPosition & position)
{
    if ( position.floatInfos.find("z") != position.floatInfos.end() )
        zPosition = position.floatInfos.find("z")->second;

    if ( position.floatInfos.find("yaw") != position.floatInfos.end() )
        yaw = position.floatInfos.find("yaw")->second;

    if ( position.floatInfos.find("pitch") != position.floatInfos.end() )
        pitch = position.floatInfos.find("pitch")->second;

    if ( position.floatInfos.find("roll") != position.floatInfos.end() )
        roll = position.floatInfos.find("roll")->second;

    return true;
}

/**
 * Render object at runtime
 */
bool Box3DObject::Draw( sf::RenderWindow& window )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;

    window.RestoreGLStates();

    float windowRatio = static_cast<float>(window.GetWidth())/static_cast<float>(window.GetHeight());
    float sizeRatio =   0.3125 //To make base have the same size as a rectangle drawn by SFML
                        *(window.GetView().GetSize().x/static_cast<float>(window.GetWidth()))
                        *1/window.GetView().GetSize().y*600.f; //To make size window's size independant

    //Get the position of the box
    float x = ( (GetX()-window.GetView().GetCenter().x+window.GetWidth()/2) * 200.f / window.GetWidth()  - 100.f)*windowRatio;
    float y = -(GetY()-window.GetView().GetCenter().y+window.GetHeight()/2) * 200.f / window.GetHeight() + 100.f;

    //Prepare for rendering
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    glRotatef(window.GetView().GetRotation(), 0, 0, 1);
    glTranslatef(x, y, -100*(window.GetView().GetSize().x/static_cast<double>(window.GetWidth()))+zPosition*0.3125);

    //Prepare size of the renderered box
    float sizeWidth =   width * sizeRatio;
    float sizeHeight =  -height * sizeRatio;
    float sizeDepth =   depth * sizeRatio;

    glTranslatef(sizeWidth/2, sizeHeight/2, sizeDepth/2);
    glRotatef(-yaw, 0, 0, 1);
    glRotatef(pitch, 0, 1, 0);
    glRotatef(roll, 1, 0, 0);
    glTranslatef(-sizeWidth/2, -sizeHeight/2, -sizeDepth/2);

    //Render the box
    backTexture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(0        , 0,            0);
        glTexCoord2f(0, 1); glVertex3f(0        , sizeHeight,   0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth, sizeHeight,   0);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth, 0,            0);
    glEnd();

    frontTexture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(0        , 0,            sizeDepth);
        glTexCoord2f(0, 1); glVertex3f(0        , sizeHeight,   sizeDepth);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth, sizeHeight,   sizeDepth);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth, 0,            sizeDepth);
    glEnd();

    leftTexture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(0,       0,              0);
        glTexCoord2f(0, 1); glVertex3f(0,       sizeHeight,     0);
        glTexCoord2f(1, 1); glVertex3f(0,       sizeHeight,     sizeDepth);
        glTexCoord2f(1, 0); glVertex3f(0,       0,              sizeDepth);
    glEnd();

    rightTexture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(sizeWidth, 0,            0);
        glTexCoord2f(0, 1); glVertex3f(sizeWidth, sizeHeight,   0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth, sizeHeight,   sizeDepth);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth, 0,            sizeDepth);
    glEnd();

    bottomTexture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 1); glVertex3f(0,           0,          sizeDepth);
        glTexCoord2f(0, 0); glVertex3f(0,           0,          0);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth,   0,          0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth,   0,          sizeDepth);
    glEnd();

    topTexture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 1); glVertex3f(0,           sizeHeight, sizeDepth);
        glTexCoord2f(0, 0); glVertex3f(0,           sizeHeight, 0);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth,   sizeHeight, 0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth,   sizeHeight, sizeDepth);
    glEnd();

    window.SaveGLStates();

    return true;
}

#ifdef GDE
/**
 * Render object at edittime
 */
bool Box3DObject::DrawEdittime(sf::RenderWindow& window)
{
    window.RestoreGLStates();

    float windowRatio = static_cast<float>(window.GetWidth())/static_cast<float>(window.GetHeight());
    float sizeRatio =   0.3125 //To make base have the same size as a rectangle drawn by SFML
                        *(window.GetView().GetSize().x/static_cast<float>(window.GetWidth()))
                        *1/window.GetView().GetSize().y*600.f; //To make size window's size independant

    //Get the position of the box
    float x = ( (GetX()-window.GetView().GetCenter().x+window.GetWidth()/2) * 200.f / window.GetWidth()  - 100.f)*windowRatio;
    float y = -(GetY()-window.GetView().GetCenter().y+window.GetHeight()/2) * 200.f / window.GetHeight() + 100.f;

    //Prepare for rendering
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    glRotatef(window.GetView().GetRotation(), 0, 0, 1);
    glTranslatef(x, y, -100*(window.GetView().GetSize().x/static_cast<double>(window.GetWidth()))+zPosition*0.3125);

    //Prepare size of the renderered box
    float sizeWidth =   width * sizeRatio;
    float sizeHeight =  -height * sizeRatio;
    float sizeDepth =   depth * sizeRatio;

    glTranslatef(sizeWidth/2, sizeHeight/2, sizeDepth/2);
    glRotatef(-yaw, 0, 0, 1);
    glRotatef(pitch, 0, 1, 0);
    glRotatef(roll, 1, 0, 0);
    glTranslatef(-sizeWidth/2, -sizeHeight/2, -sizeDepth/2);

    //Render the box
    backTexture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(0        , 0,            0);
        glTexCoord2f(0, 1); glVertex3f(0        , sizeHeight,   0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth, sizeHeight,   0);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth, 0,            0);
    glEnd();

    frontTexture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(0        , 0,            sizeDepth);
        glTexCoord2f(0, 1); glVertex3f(0        , sizeHeight,   sizeDepth);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth, sizeHeight,   sizeDepth);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth, 0,            sizeDepth);
    glEnd();

    leftTexture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(0,       0,              0);
        glTexCoord2f(0, 1); glVertex3f(0,       sizeHeight,     0);
        glTexCoord2f(1, 1); glVertex3f(0,       sizeHeight,     sizeDepth);
        glTexCoord2f(1, 0); glVertex3f(0,       0,              sizeDepth);
    glEnd();

    rightTexture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 0); glVertex3f(sizeWidth, 0,            0);
        glTexCoord2f(0, 1); glVertex3f(sizeWidth, sizeHeight,   0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth, sizeHeight,   sizeDepth);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth, 0,            sizeDepth);
    glEnd();

    bottomTexture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 1); glVertex3f(0,           0,          sizeDepth);
        glTexCoord2f(0, 0); glVertex3f(0,           0,          0);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth,   0,          0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth,   0,          sizeDepth);
    glEnd();

    topTexture.Bind();
    glBegin(GL_QUADS);
        glTexCoord2f(0, 1); glVertex3f(0,           sizeHeight, sizeDepth);
        glTexCoord2f(0, 0); glVertex3f(0,           sizeHeight, 0);
        glTexCoord2f(1, 0); glVertex3f(sizeWidth,   sizeHeight, 0);
        glTexCoord2f(1, 1); glVertex3f(sizeWidth,   sizeHeight, sizeDepth);
    glEnd();

    window.SaveGLStates();

    return true;
}

bool Box3DObject::GenerateThumbnail(const Game & game, wxBitmap & thumbnail)
{
    thumbnail = wxBitmap("Extensions/texticon.png", wxBITMAP_TYPE_ANY);

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
        panel->zEdit->SetValue(toString( position.floatInfos.find("z")->second));

    if ( position.floatInfos.find("yaw") != position.floatInfos.end())
        panel->yawEdit->SetValue(toString(position.floatInfos.find("yaw")->second));

    if ( position.floatInfos.find("pitch") != position.floatInfos.end())
        panel->pitchEdit->SetValue(toString(position.floatInfos.find("pitch")->second));

    if ( position.floatInfos.find("roll") != position.floatInfos.end())
        panel->rollEdit->SetValue(toString(position.floatInfos.find("roll")->second));

    return panel;
}

void Box3DObject::UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position)
{
    Box3DInitialPositionPanel * box3DPanel = dynamic_cast<Box3DInitialPositionPanel*>(panel);
    if (box3DPanel == NULL) return;

    position.floatInfos["z"] = toInt(string(box3DPanel->zEdit->GetValue().mb_str()));
    position.floatInfos["yaw"] = toInt(string(box3DPanel->yawEdit->GetValue().mb_str()));
    position.floatInfos["pitch"] = toInt(string(box3DPanel->pitchEdit->GetValue().mb_str()));
    position.floatInfos["roll"] = toInt(string(box3DPanel->rollEdit->GetValue().mb_str()));
}

void Box3DObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Largeur");       value = width;}
    else if ( propertyNb == 1 ) {name = _("Hauteur");       value = height;}
    else if ( propertyNb == 2 ) {name = _("Profondeur");    value = depth;}
    else if ( propertyNb == 3 ) {name = _("Coordonnée Z");  value = zPosition;}
    else if ( propertyNb == 4 ) {name = _("Yaw");           value = yaw;}
    else if ( propertyNb == 5 ) {name = _("Pitch");         value = pitch;}
    else if ( propertyNb == 6 ) {name = _("Roll");          value = roll;}
}

bool Box3DObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if      ( propertyNb == 0 ) {width = toInt(newValue);}
    else if ( propertyNb == 1 ) {height = toInt(newValue);}
    else if ( propertyNb == 2 ) {depth = toInt(newValue);}
    else if ( propertyNb == 3 ) {zPosition = toInt(newValue);}
    else if ( propertyNb == 4 ) {yaw = toInt(newValue);}
    else if ( propertyNb == 5 ) {pitch = toInt(newValue);}
    else if ( propertyNb == 6 ) {roll = toInt(newValue);}

    return true;
}

unsigned int Box3DObject::GetNumberOfProperties() const
{
    return 5;
}
#endif

void Box3DObject::UpdateTime(float)
{
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

/**
 * Function creating an extension Object from another.
 * Game Develop can not directly create an extension object.
 *
 * Note that it is safe to do the static cast, as this function
 * is called owing to the typeId of the object to copy.
 */
Object * CreateBox3DObjectByCopy(Object * object)
{
    return new Box3DObject(*static_cast<Box3DObject *>(object));
}
