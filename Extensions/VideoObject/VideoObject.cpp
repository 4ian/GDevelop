/**

Game Develop - Video Object Extension
Copyright (c) 2010-2012 Florian Rival (Florian.Rival@gmail.com)

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
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/FontManager.h"
#include "GDL/Position.h"
#include "GDL/XmlMacros.h"
#include "GDL/RotatedRectangle.h"
#include "GDL/CommonTools.h"
#include "VideoObject.h"

#if defined(GD_IDE_ONLY)
#include <wx/wx.h>
#include "GDL/IDE/ArbitraryResourceWorker.h"
#include "GDL/IDE/MainEditorCommand.h"
#include "VideoObjectEditor.h"
#endif

VideoObject::VideoObject(std::string name_) :
    Object(name_),
    looping(true),
    paused(false),
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

void VideoObject::LoadFromXml(const TiXmlElement * elem)
{
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("videoFile", videoFile);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("looping", looping);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("opacity", opacity);

    int r = 255;
    int g = 255;
    int b = 255;
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("colorR", r);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("colorG", g);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("colorB", b);
    SetColor(r,g,b);
}

#if defined(GD_IDE_ONLY)
void VideoObject::SaveToXml(TiXmlElement * elem)
{
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("videoFile", videoFile);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("looping", looping);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("opacity", opacity);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("colorR", colorR);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("colorG", colorG);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("colorB", colorB);
}
#endif

bool VideoObject::LoadRuntimeResources(const RuntimeScene & scene, const ImageManager & imageMgr )
{
    ReloadVideo();
    return true;
}

void VideoObject::ReloadVideo()
{
    video.Load(videoFile);
    video.SetLooping(looping);
    video.SetPause(paused);
    video.GetRenderSprite().SetTexture(video.GetNextFrameImage(), true);
    video.GetRenderSprite().SetOrigin(video.GetRenderSprite().GetSize().x/2, video.GetRenderSprite().GetSize().y/2);
}
bool VideoObject::SetAngle(float newAngle)
{
    angle = newAngle;
    video.GetRenderSprite().SetRotation(angle);
    return true;
};
double VideoObject::GetTimePosition() const
{
    return video.GetTimePosition();
}

double VideoObject::GetDuration() const
{
    return video.GetDuration();
}

/**
 * Load a new video
 */
void VideoObject::LoadAndPlayVideo( const std::string & videoFile )
{
    SetVideoFile(videoFile);
    ReloadVideo();
    video.SetPause(false);
}

void VideoObject::Seek( double position )
{
    video.Seek(position);
}

void VideoObject::SetColor(const std::string & colorStr)
{
    vector < string > colors = SplitString<string>(colorStr, ';');

    if ( colors.size() < 3 ) return; //La couleur est incorrecte

    SetColor(  ToInt(colors[0]),
               ToInt(colors[1]),
               ToInt(colors[2]) );
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
bool VideoObject::Draw( sf::RenderTarget& renderTarget )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;

	video.GetRenderSprite().SetTexture(video.GetNextFrameImage(), true);
    renderTarget.Draw( video.GetRenderSprite() );

    return true;
}

#if defined(GD_IDE_ONLY)
/**
 * Render object at edittime
 */
bool VideoObject::DrawEdittime(sf::RenderTarget& renderTarget)
{
    if ( !video.IsValid() )
    {
        static bool badImageLoaded = false;
        static sf::Texture badVideoIcon;
        if ( !badImageLoaded )
        {
            badVideoIcon.LoadFromFile("Extensions/badVideo.png");
            badImageLoaded = true;
        }
        video.GetRenderSprite().SetTexture(badVideoIcon, true);
    }
    else
    {
        sf::Shape rectangle = sf::Shape::Rectangle(0, 0, video.GetRenderSprite().GetSize().x, video.GetRenderSprite().GetSize().y, sf::Color(0,0,0));
        rectangle.SetOrigin(video.GetRenderSprite().GetSize().x/2, video.GetRenderSprite().GetSize().y/2);
        rectangle.SetPosition(GetX(), GetY());
        rectangle.SetRotation(video.GetRenderSprite().GetRotation());
        renderTarget.Draw(rectangle);
    }

    renderTarget.Draw( video.GetRenderSprite() );

    return true;
}

void VideoObject::ExposeResources(ArbitraryResourceWorker & worker)
{
    worker.ExposeResource(videoFile);
}

bool VideoObject::GenerateThumbnail(const Game & game, wxBitmap & thumbnail)
{
    thumbnail = wxBitmap("Extensions/videoicon24.png", wxBITMAP_TYPE_ANY);

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
    if      ( propertyNb == 0 ) {name = _("Fichier");                     value = GetVideoFile();}
    else if ( propertyNb == 1 ) {name = _("Bouclage");                    value = looping ? _("Oui") : _("Non");}
    else if ( propertyNb == 2 ) {name = _("Position dans la vidéo");      value = ToString(video.GetTimePosition())+"s";}
    else if ( propertyNb == 3 ) {name = _("En pause");                    value = paused ? _("Oui") : _("Non");}
    else if ( propertyNb == 4 ) {name = _("Durée");                       value = ToString(video.GetDuration())+"s";}
    else if ( propertyNb == 5 ) {name = _("Couleur");                     value = ToString(colorR)+";"+ToString(colorG)+";"+ToString(colorB);}
    else if ( propertyNb == 6 ) {name = _("Opacité");       value = ToString(GetOpacity());}
}

bool VideoObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if      ( propertyNb == 0 ) { SetVideoFile(newValue); ReloadVideo(); }
    else if ( propertyNb == 1 ) { looping = (newValue == _T("Oui")); video.SetLooping(looping); }
    else if ( propertyNb == 2 ) { video.Seek(ToFloat(newValue)); }
    else if ( propertyNb == 3 ) { paused = (newValue == _T("Oui")); video.SetPause(paused); }
    else if ( propertyNb == 4 ) { return false; }
    else if ( propertyNb == 5 )
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

        SetColor(ToInt(r), ToInt(g), ToInt(b));
    }
    else if ( propertyNb == 6 ) { SetOpacity(ToFloat(newValue)); }

    return true;
}

unsigned int VideoObject::GetNumberOfProperties() const
{
    return 7;
}
#endif

void VideoObject::OnPositionChanged()
{
    video.GetRenderSprite().SetX( GetX() );
    video.GetRenderSprite().SetY( GetY() );
}

/**
 * VideoObject provides a basic bounding box.
 */
std::vector<RotatedRectangle> VideoObject::GetHitBoxes() const
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
float VideoObject::GetDrawableX() const
{
    return video.GetRenderSprite().GetPosition().x-video.GetRenderSprite().GetOrigin().x;
}

/**
 * Get the real Y position of the text
 */
float VideoObject::GetDrawableY() const
{
    return video.GetRenderSprite().GetPosition().y-video.GetRenderSprite().GetOrigin().y;
}

/**
 * Width is the width of the current sprite.
 */
float VideoObject::GetWidth() const
{
    return video.GetRenderSprite().GetSize().x;
}

/**
 * Height is the height of the current sprite.
 */
float VideoObject::GetHeight() const
{
    return video.GetRenderSprite().GetSize().y;
}

/**
 * X center is computed with text rectangle
 */
float VideoObject::GetCenterX() const
{
    return video.GetRenderSprite().GetSize().x/2;
}

/**
 * Y center is computed with text rectangle
 */
float VideoObject::GetCenterY() const
{
    return video.GetRenderSprite().GetSize().y/2;
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
    video.GetRenderSprite().SetColor(sf::Color(colorR, colorG, colorB, opacity));
}

void VideoObject::SetOpacity(float val)
{
    if ( val > 255 )
        val = 255;
    else if ( val < 0 )
        val = 0;

    opacity = val;
    video.GetRenderSprite().SetColor(sf::Color(colorR, colorG, colorB, opacity));
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

