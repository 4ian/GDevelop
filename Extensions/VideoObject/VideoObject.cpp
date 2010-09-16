/**

Game Develop - Video Object Extension
Copyright (c) 2010 Florian Rival (Florian.Rival@gmail.com)

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

#include "GDL/ImageManager.h"
#include "GDL/tinyxml.h"
#include "GDL/FontManager.h"
#include "GDL/Position.h"
#include "VideoObject.h"

#ifdef GDE
#include <wx/wx.h>
#include "GDL/CommonTools.h"
#include "GDL/ResourcesMergingHelper.h"
#include "GDL/MainEditorCommand.h"
#include "VideoObjectEditor.h"
#endif

VideoObject::VideoObject(std::string name_) :
    Object(name_),
    started(true),
    opacity( 255 ),
    colorR( 255 ),
    colorG( 255 ),
    colorB( 255 ),
    angle(0)
{
}

VideoObject::~VideoObject()
{
}

void VideoObject::LoadFromXml(const TiXmlElement * object)
{
}

#if defined(GDE)
void VideoObject::SaveToXml(TiXmlElement * object)
{
}
#endif

bool VideoObject::LoadResources(const ImageManager & imageMgr )
{
    renderSprite.SetImage(video.GetFrameImage(), true);
    renderSprite.SetOrigin(renderSprite.GetSize().x/2, renderSprite.GetSize().y/2);
}

bool VideoObject::LoadRuntimeResources(const ImageManager & imageMgr )
{
    video.Load("C:/Libs/libtheoraplayer/trunk/demos/media/short.ogg");
    renderSprite.SetImage(video.GetFrameImage(), true);
    renderSprite.SetOrigin(renderSprite.GetSize().x/2, renderSprite.GetSize().y/2);
}

/**
 * Update animation and direction from the inital position
 */
bool VideoObject::InitializeFromInitialPosition(const InitialPosition & position)
{
    return true;
}

/**
 * Render object at runtime
 */
bool VideoObject::Draw( sf::RenderWindow& window )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;

	renderSprite.SetImage(video.GetNextFrameImage(), true);
    renderSprite.SetOrigin(renderSprite.GetSize().x/2, renderSprite.GetSize().y/2);
    window.Draw( renderSprite );

    return true;
}

#ifdef GDE
/**
 * Render object at edittime
 */
bool VideoObject::DrawEdittime(sf::RenderWindow& renderWindow)
{
    renderWindow.Draw( renderSprite );
    renderSprite.SetOrigin(renderSprite.GetSize().x/2, renderSprite.GetSize().y/2);

    return true;
}

void VideoObject::PrepareResourcesForMerging(ResourcesMergingHelper & resourcesMergingHelper)
{
}

bool VideoObject::GenerateThumbnail(const Game & game, wxBitmap & thumbnail)
{
    thumbnail = wxBitmap("Extensions/texticon.png", wxBITMAP_TYPE_ANY);

    return true;
}

void VideoObject::EditObject( wxWindow* parent, Game & game, MainEditorCommand & mainEditorCommand )
{
    VideoObjectEditor dialog(parent, game, *this, mainEditorCommand);
    dialog.ShowModal();
}

wxPanel * VideoObject::CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position )
{
    return NULL;
}

void VideoObject::UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position)
{
}

void VideoObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
}

bool VideoObject::ChangeProperty(unsigned int propertyNb, string newValue)
{

    return true;
}

unsigned int VideoObject::GetNumberOfProperties() const
{
    return 0;
}
#endif

void VideoObject::OnPositionChanged()
{
    renderSprite.SetX( GetX()+renderSprite.GetSize().x/2 );
    renderSprite.SetY( GetY()+renderSprite.GetSize().y/2 );
}

/**
 * Get the real X position of the sprite
 */
float VideoObject::GetDrawableX() const
{
    return renderSprite.GetPosition().x-renderSprite.GetOrigin().x;
}

/**
 * Get the real Y position of the text
 */
float VideoObject::GetDrawableY() const
{
    return renderSprite.GetPosition().y-renderSprite.GetOrigin().y;
}

/**
 * Width is the width of the current sprite.
 */
float VideoObject::GetWidth() const
{
    return renderSprite.GetSize().x;
}

/**
 * Height is the height of the current sprite.
 */
float VideoObject::GetHeight() const
{
    return renderSprite.GetSize().y;
}

/**
 * X center is computed with text rectangle
 */
float VideoObject::GetCenterX() const
{
    return renderSprite.GetSize().x/2;
}

/**
 * Y center is computed with text rectangle
 */
float VideoObject::GetCenterY() const
{
    return renderSprite.GetSize().y/2;
}

/**
 * Nothing to do when updating time
 */
void VideoObject::UpdateTime(float time_increase)
{
    video.UpdateTime(time_increase);
}

/**
 * Change the color filter of the sprite object
 */
void VideoObject::SetColor( unsigned int r, unsigned int g, unsigned int b )
{
    colorR = r;
    colorG = g;
    colorB = b;
    renderSprite.SetColor(sf::Color(colorR, colorG, colorB, opacity));
}

void VideoObject::SetOpacity(float val)
{
    if ( val > 255 )
        val = 255;
    else if ( val < 0 )
        val = 0;

    opacity = val;
    renderSprite.SetColor(sf::Color(colorR, colorG, colorB, opacity));
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyVideoObject(Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
Object * CreateVideoObject(std::string name)
{
    return new VideoObject(name);
}

