/**

Game Develop - Video Object Extension
Copyright (c) 2010-2011 Florian Rival (Florian.Rival@gmail.com)

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
#include "VideoWrapper.h"
#include <SFML/Graphics.hpp>
class Evaluateur;
class ImageManager;
class RuntimeScene;
class Object;
class ExpressionInstruction;
class ObjectsConcerned;
class ImageManager;
class InitialPosition;
#if defined(GD_IDE_ONLY)
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

        virtual bool LoadRuntimeResources(const ImageManager & imageMgr );
        virtual bool InitializeFromInitialPosition(const InitialPosition & position);

        virtual bool Draw(sf::RenderWindow& main_window);

        #if defined(GD_IDE_ONLY)
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
        #if defined(GD_IDE_ONLY)
        virtual void SaveToXml(TiXmlElement * elemScene);
        #endif

        virtual void UpdateTime(float timeElapsed);

        virtual void OnPositionChanged();

        /**
         * Change the video file loaded when a call is made to LoadRuntimeResources
         */
        void SetVideoFile(std::string file) { videoFile = file; }

        /**
         * Get video filename.
         */
        std::string GetVideoFile() const { return videoFile; }

        /**
         * Load and start video using the video Filename.
         */
        void ReloadVideo();

        /**
         * Set the looping of the video
         */
        void SetLooping(bool loop_) { looping = loop_; video.SetLooping(looping); }

        /**
         * Return true if looping is activated
         */
        bool GetLooping() const { return looping; }

        virtual float GetWidth() const;
        virtual float GetHeight() const;
        virtual void SetWidth(float ) {};
        virtual void SetHeight(float ) {};

        virtual float GetDrawableX() const;
        virtual float GetDrawableY() const;

        virtual float GetCenterX() const;
        virtual float GetCenterY() const;

        virtual bool SetAngle(float newAngle) { angle = newAngle; renderSprite.SetRotation(-angle); return true;};
        virtual float GetAngle() const {return angle;};

        void SetOpacity(float val);
        inline float GetOpacity() const {return opacity;};

        void SetColor(unsigned int r,unsigned int v,unsigned int b);
        inline unsigned int GetColorR() const { return colorR; };
        inline unsigned int GetColorG() const { return colorG; };
        inline unsigned int GetColorB() const { return colorB; };

        virtual std::vector<RotatedRectangle> GetHitBoxes() const;

        //ACE for opacity
        bool CondOpacity( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActOpacity( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        double ExpOpacity( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );

        //ACE for angle
        bool CondAngle( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActAngle( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        double ExpAngle( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );

        //Action for color
        bool ActChangeColor( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

        std::string ExpVideoFile( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction );

        bool ActLoadVideo( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActSetPause( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActSetLooping( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActRestart( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActSeek( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

        bool CondPaused( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondLooping( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondTimePosition( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

        double ExpTimePosition( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpDuration( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );

    private:

        std::string videoFile;
        VideoWrapper video;
        sf::Sprite renderSprite;

        bool looping;
        bool paused;

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
