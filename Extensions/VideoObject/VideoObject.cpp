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
extern "C"
{

#include <libavcodec/avcodec.h>
#include <libavformat/avformat.h>
#include <libswscale/swscale.h>
}

#ifdef GDE
#include <wx/wx.h>
#include "GDL/CommonTools.h"
#include "GDL/ResourcesMergingHelper.h"
#include "GDL/MainEditorCommand.h"
#include "VideoObjectEditor.h"
#endif

VideoObject::VideoObject(std::string name_) :
    Object(name_),
    pCodec(NULL),
    pFormatCtx(NULL),
    pCodecCtx(NULL),
    pFrame(NULL),
    pFrameRGB(NULL),
    buffer(NULL),
    img_convert_ctx(NULL),
    packetValid(false),
    opacity( 255 ),
    colorR( 255 ),
    colorG( 255 ),
    colorB( 255 ),
    angle(0)
{
}

VideoObject::~VideoObject()
{
    if (pFrameRGB) av_free(pFrameRGB); //Safe to destroy
    if (pFrame) av_free(pFrame); //Safe to destroy
    if (buffer) av_free(buffer);

    if(!packetValid) return;

    cout << "Destr1";
    // Libérer le packet alloué par av_read_frame
    if(packetValid)av_free_packet(&packet);
    // Libérer l'image RGB
    cout << "Destr1.1";

    cout << "Destr1.2";
    cout << "Destr2";
    // Libérer l'image YUV
    cout << "Destr4";
    // Fermer le codec
    if (pCodecCtx) avcodec_close(pCodecCtx); // Not safe to destroy
    cout << "Destr5";
    // Fermer le  fichier video
    if (packetValid && pFormatCtx) av_close_input_file(pFormatCtx);
    cout << "Destr3";

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
    std::string filename = "D:/Florian/Videos/LegoStarWars.avi";

    av_register_all();

    if(av_open_input_file(&pFormatCtx, filename.c_str(), NULL, 0, NULL)!=0)
    {
        cout << "Unexisting file!\n";
    }

    if(av_find_stream_info(pFormatCtx)<0)
    {
        cout << "Couldn't find stream information!\n";
    }

    dump_format(pFormatCtx, 0, filename.c_str(), 0);
    videoStream=-1;
    for(int i=0; i<pFormatCtx->nb_streams; i++)
    {
        if(pFormatCtx->streams[i]->codec->codec_type==CODEC_TYPE_VIDEO)
        {
            videoStream=i;
            break;
        }
    }
    if(videoStream==-1)
        cout << endl << "videoStream == -1" << endl;

    pCodecCtx=pFormatCtx->streams[videoStream]->codec;
    pCodec=avcodec_find_decoder(pCodecCtx->codec_id);
    if(pCodec==NULL)
    {
        cout << endl << "Unsupported codec!\n"<< endl;
    }

    if(avcodec_open(pCodecCtx, pCodec)<0)
        cout << endl << "avcodec_open(pCodecCtx, pCodec)<0"<< endl;
    iFrameSize = pCodecCtx->width * pCodecCtx->height * 3;
    cout << "FrameSize" << iFrameSize;
    pFrame=avcodec_alloc_frame();

    pFrameRGB=avcodec_alloc_frame();
    if(pFrameRGB==NULL)
        cout << "Unable to alloc_frame RGB";

    int numBytes=avpicture_get_size(PIX_FMT_RGB24, pCodecCtx->width, pCodecCtx->height);
    buffer=(uint8_t *)av_malloc(numBytes*sizeof(uint8_t));

    avpicture_fill((AVPicture *)pFrameRGB, buffer, PIX_FMT_RGB24,
                   pCodecCtx->width, pCodecCtx->height);

    Data = new sf::Uint8[pCodecCtx->width * pCodecCtx->height * 4];

    im_video.Create(pCodecCtx->width, pCodecCtx->height, sf::Color(100,255,255,255));
    im_video.SetSmooth(false);
    sp_video.SetImage(im_video);
    sp_video.SetOrigin(sp_video.GetSize().x/2,sp_video.GetSize().y/2);

    //Initialize image converter
    img_convert_ctx = sws_getContext(pCodecCtx->width, pCodecCtx->height,
                                     pCodecCtx->pix_fmt, //Source format
                                     pCodecCtx->width, pCodecCtx->height,
                                     PIX_FMT_RGB24, //Destination format, compatible with SFML
                                     SWS_BICUBIC, NULL, NULL, NULL);
    if(img_convert_ctx == NULL)
    {
        cout << "Cannot initialize the conversion context!\n";
    }

    return true;
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

    if ( !packetValid ) return true;

    if(packet.stream_index==videoStream)
    {
        //Get frame
        int frameFinished;
        if ( avcodec_decode_video(pCodecCtx, pFrame, &frameFinished,
                             packet.data, packet.size) <0) cout << "error" << endl;

        if(frameFinished) //Changing frame ? Prepare so the new frame
        {
            sws_scale(img_convert_ctx, pFrame->data,
                      pFrame->linesize, 0,
                      pCodecCtx->height,
                      pFrameRGB->data, pFrameRGB->linesize);
        }

        //Adapt frame to SFML image format.
        int j = 0;
        for(int i = 0 ; i < (iFrameSize) ; i+=3)
        {
            Data[j] = pFrameRGB->data[0][i];
            Data[j+1] = pFrameRGB->data[0][i+1];
            Data[j+2] = pFrameRGB->data[0][i+2];
            Data[j+3] = 255;
            j+=4;
        }

        im_video.LoadFromPixels(pCodecCtx->width, pCodecCtx->height, Data);
        sp_video.SetImage(im_video);
    }

    window.Draw( sp_video );

    return true;
}

#ifdef GDE
/**
 * Render object at edittime
 */
bool VideoObject::DrawEdittime(sf::RenderWindow& renderWindow)
{
    sp_video.SetImage(im_video);
    renderWindow.Draw( sp_video );

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
    sp_video.SetX( GetX()+sp_video.GetSize().x/2 );
    sp_video.SetY( GetY()+sp_video.GetSize().y/2 );
}

/**
 * Get the real X position of the sprite
 */
float VideoObject::GetDrawableX() const
{
    return sp_video.GetPosition().x-sp_video.GetOrigin().x;
}

/**
 * Get the real Y position of the text
 */
float VideoObject::GetDrawableY() const
{
    return sp_video.GetPosition().y-sp_video.GetOrigin().y;
}

/**
 * Width is the width of the current sprite.
 */
float VideoObject::GetWidth() const
{
    return sp_video.GetSize().x;
}

/**
 * Height is the height of the current sprite.
 */
float VideoObject::GetHeight() const
{
    return sp_video.GetSize().y;
}

/**
 * X center is computed with text rectangle
 */
float VideoObject::GetCenterX() const
{
    return sp_video.GetSize().x/2;
}

/**
 * Y center is computed with text rectangle
 */
float VideoObject::GetCenterY() const
{
    return sp_video.GetSize().y/2;
}

/**
 * Nothing to do when updating time
 */
void VideoObject::UpdateTime(float)
{
    if (av_read_frame(pFormatCtx, &packet) < 0) //Changed to av_read_frame
    {
        //Video ended.
    }
    packetValid = true;
}

/**
 * Change the color filter of the sprite object
 */
void VideoObject::SetColor( unsigned int r, unsigned int g, unsigned int b )
{
    colorR = r;
    colorG = g;
    colorB = b;
    sp_video.SetColor(sf::Color(colorR, colorG, colorB, opacity));
}

void VideoObject::SetOpacity(float val)
{
    if ( val > 255 )
        val = 255;
    else if ( val < 0 )
        val = 0;

    opacity = val;
    sp_video.SetColor(sf::Color(colorR, colorG, colorB, opacity));
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

