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

#ifndef VIDEOOBJECT_H
#define VIDEOOBJECT_H

#include "GDL/Object.h"
#include <SFML/Graphics.hpp>
extern "C"
{
#include <libavcodec/avcodec.h>
#include <libavformat/avformat.h>
#include <libswscale/swscale.h>
}
class Evaluateur;
class ImageManager;
class RuntimeScene;
class Object;
class ExpressionInstruction;
class ObjectsConcerned;
class ImageManager;
class InitialPosition;
#ifdef GDE
class wxBitmap;
class Game;
class wxWindow;
class MainEditorCommand;
class ResourcesMergingHelper;
#endif

/**
 * Video Object
 */
class VideoObject : public Object
{
    public :

        VideoObject(std::string name_);
        virtual ~VideoObject();
        virtual ObjSPtr Clone() { return boost::shared_ptr<Object>(new VideoObject(*this));}

        virtual bool LoadResources(const ImageManager & imageMgr );
        virtual bool InitializeFromInitialPosition(const InitialPosition & position);

        virtual bool Draw(sf::RenderWindow& main_window);

        #ifdef GDE
        virtual bool DrawEdittime(sf::RenderWindow& main_window);
        virtual void PrepareResourcesForMerging(ResourcesMergingHelper & resourcesMergingHelper);
        virtual bool GenerateThumbnail(const Game & game, wxBitmap & thumbnail);

        virtual void EditObject( wxWindow* parent, Game & game_, MainEditorCommand & mainEditorCommand_ );
        virtual wxPanel * CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position );
        virtual void UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position);

        virtual void GetPropertyForDebugger (unsigned int propertyNb, string & name, string & value) const;
        virtual bool ChangeProperty(unsigned int propertyNb, string newValue);
        virtual unsigned int GetNumberOfProperties() const;
        #endif

        virtual void LoadFromXml(const TiXmlElement * elemScene);
        #if defined(GDE)
        virtual void SaveToXml(TiXmlElement * elemScene);
        #endif

        virtual void UpdateTime(float timeElapsed);

        virtual void OnPositionChanged();

        virtual float GetWidth() const;
        virtual float GetHeight() const;
        virtual void SetWidth(float ) {};
        virtual void SetHeight(float ) {};

        virtual float GetDrawableX() const;
        virtual float GetDrawableY() const;

        virtual float GetCenterX() const;
        virtual float GetCenterY() const;

        virtual bool SetAngle(float newAngle) { angle = newAngle; sp_video.SetRotation(-angle); return true;};
        virtual float GetAngle() const {return angle;};

        void SetOpacity(float val);
        inline float GetOpacity() const {return opacity;};

        void SetColor(unsigned int r,unsigned int v,unsigned int b);
        inline unsigned int GetColorR() const { return colorR; };
        inline unsigned int GetColorG() const { return colorG; };
        inline unsigned int GetColorB() const { return colorB; };

    private:

        sf::Image im_video;
        sf::Sprite sp_video;
        sf::Uint8 *Data;
        int iFrameSize;

        std::string file;

        AVFrame *Frame,*FrameRGB;
        AVFormatContext *FormatCtx;
        AVCodecContext  *videoCodecCtx ,*audioCodecCtx ,*dataCodecCtx;
        AVCodec         *videoCodec    ,*audioCodec    ,*dataCodec;

        uint8_t *buffer;

            double videoFPS;
            int  nFrm, frame, numBytes, windowFPS;
            int  videoStream, audioStream, dataStream;
            bool drawFrame, Sound, Play, Replay, writeConsol;

        SwsContext *img_convert_ctx; //Video stuff : Image converter

        //Opacity
        float opacity;

        //Color
        unsigned int colorR;
        unsigned int colorG;
        unsigned int colorB;

        float angle;
};

void DestroyVideoObject(Object * object);
Object * CreateVideoObject(std::string name);

#endif // VIDEOOBJECT_H
