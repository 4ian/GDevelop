/**

Game Develop - Video Object Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

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
#include <SFML/Graphics.hpp>
#include "GDCpp/Object.h"

#include "GDCpp/ImageManager.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/FontManager.h"
#include "GDCpp/Position.h"
#include "GDCpp/Polygon.h"
#include "GDCpp/CommonTools.h"
#include "VideoObject.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
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

void VideoObject::DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element)
{
    videoFile = element.GetStringAttribute("videoFile");
    looping = element.GetBoolAttribute("looping");
    opacity = element.GetFloatAttribute("opacity");

    SetColor(
        element.GetIntAttribute("colorR", 255),
        element.GetIntAttribute("colorG", 255),
        element.GetIntAttribute("colorB", 255));

    SetVolume(element.GetIntAttribute("volume", 100));
}

#if defined(GD_IDE_ONLY)
void VideoObject::DoSerializeTo(gd::SerializerElement & element) const
{
    element.SetAttribute("videoFile", videoFile);
    element.SetAttribute("looping", looping);
    element.SetAttribute("opacity", opacity);
    element.SetAttribute("colorR", colorR);
    element.SetAttribute("colorG", colorG);
    element.SetAttribute("colorB", colorB);
    element.SetAttribute("volume", static_cast<double>(GetVolume()));
}
#endif

bool VideoObject::LoadRuntimeResources(const RuntimeScene & scene, const gd::ImageManager & imageMgr )
{
    ReloadVideo();
    return true;
}

void VideoObject::ReloadVideo()
{
    video.Load(videoFile);
    video.SetLooping(looping);
    video.SetPause(paused);
    video.GetRenderSprite().setTexture(video.GetNextFrameImage(), true);
    video.GetRenderSprite().setOrigin(video.GetRenderSprite().getLocalBounds().width/2, video.GetRenderSprite().getLocalBounds().height/2);
}
bool VideoObject::SetAngle(float newAngle)
{
    angle = newAngle;
    video.GetRenderSprite().setRotation(angle);
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

unsigned int VideoObject::GetVolume()
{
    return video.GetVolume();
}

void VideoObject::SetVolume(unsigned int vol)
{
    if(vol < 0)
        video.SetVolume(vol);
}

/**
 * Update animation and direction from the inital position
 */
bool VideoObject::InitializeFromInitialInstance(const gd::InitialInstance & position)
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

	video.GetRenderSprite().setTexture(video.GetNextFrameImage(), true);
    renderTarget.draw( video.GetRenderSprite() );

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
            badVideoIcon.loadFromFile("CppPlatform/Extensions/badVideo.png");
            badImageLoaded = true;
        }
        video.GetRenderSprite().setTexture(badVideoIcon, true);
    }
    else
    {
        sf::RectangleShape rectangle(sf::Vector2f(video.GetRenderSprite().getLocalBounds().width, video.GetRenderSprite().getLocalBounds().height));
        rectangle.setFillColor(sf::Color(0,0,0));
        rectangle.setOrigin(video.GetRenderSprite().getLocalBounds().width/2, video.GetRenderSprite().getLocalBounds().height/2);
        rectangle.setPosition(GetX(), GetY());
        rectangle.setRotation(video.GetRenderSprite().getRotation());
        renderTarget.draw(rectangle);

        //Display first frame
        video.Seek(0.1);
        video.GetRenderSprite().setTexture(video.GetNextFrameImage(), true);
    }

    renderTarget.draw( video.GetRenderSprite() );

    return true;
}

void VideoObject::ExposeResources(gd::ArbitraryResourceWorker & worker)
{
    worker.ExposeResource(videoFile);
}

bool VideoObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const
{
    thumbnail = wxBitmap("CppPlatform/Extensions/videoicon24.png", wxBITMAP_TYPE_ANY);

    return true;
}

void VideoObject::EditObject( wxWindow* parent, gd::Project & game, gd::MainFrameWrapper & mainFrameWrapper )
{
    VideoObjectEditor dialog(parent, game, *this, mainFrameWrapper);
    dialog.ShowModal();
}

void VideoObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("File");                     value = GetVideoFile();}
    else if ( propertyNb == 1 ) {name = _("Automatic restart");                    value = looping ? _("Yes") : _("No");}
    else if ( propertyNb == 2 ) {name = _("Position in video");      value = ToString(video.GetTimePosition())+"s";}
    else if ( propertyNb == 3 ) {name = _("Paused");                    value = paused ? _("Yes") : _("No");}
    else if ( propertyNb == 4 ) {name = _("Length");                       value = ToString(video.GetDuration())+"s";}
    else if ( propertyNb == 5 ) {name = _("Color");                     value = ToString(colorR)+";"+ToString(colorG)+";"+ToString(colorB);}
    else if ( propertyNb == 6 ) {name = _("Opacity");       value = ToString(GetOpacity());}
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
    video.GetRenderSprite().setPosition( GetX(), GetY() );
}

/**
 * VideoObject provides a basic bounding box.
 */
std::vector<Polygon2d> VideoObject::GetHitBoxes() const
{
    std::vector<Polygon2d> mask;
    Polygon2d rectangle = Polygon2d::CreateRectangle(GetWidth(), GetHeight());
    rectangle.Rotate(GetAngle()/180*3.14159);
    rectangle.Move(GetX()+GetCenterX(), GetY()+GetCenterY());

    mask.push_back(rectangle);
    return mask;
}

/**
 * Get the real X position of the sprite
 */
float VideoObject::GetDrawableX() const
{
    return video.GetRenderSprite().getPosition().x-video.GetRenderSprite().getOrigin().x;
}

/**
 * Get the real Y position of the text
 */
float VideoObject::GetDrawableY() const
{
    return video.GetRenderSprite().getPosition().y-video.GetRenderSprite().getOrigin().y;
}

/**
 * Width is the width of the current sprite.
 */
float VideoObject::GetWidth() const
{
    return video.GetRenderSprite().getLocalBounds().width;
}

/**
 * Height is the height of the current sprite.
 */
float VideoObject::GetHeight() const
{
    return video.GetRenderSprite().getLocalBounds().height;
}

/**
 * X center is computed with text rectangle
 */
float VideoObject::GetCenterX() const
{
    return video.GetRenderSprite().getLocalBounds().width/2;
}

/**
 * Y center is computed with text rectangle
 */
float VideoObject::GetCenterY() const
{
    return video.GetRenderSprite().getLocalBounds().height/2;
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
    video.GetRenderSprite().setColor(sf::Color(colorR, colorG, colorB, opacity));
}

void VideoObject::SetOpacity(float val)
{
    if ( val > 255 )
        val = 255;
    else if ( val < 0 )
        val = 0;

    opacity = val;
    video.GetRenderSprite().setColor(sf::Color(colorR, colorG, colorB, opacity));
}

void DestroyRuntimeVideoObject(RuntimeObject * object)
{
    delete object;
}

RuntimeObject * CreateRuntimeVideoObject(RuntimeScene & scene, const gd::Object & object)
{
    return new RuntimeVideoObject(scene, object);
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyVideoObject(gd::Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
gd::Object * CreateVideoObject(std::string name)
{
    return new VideoObject(name);
}


