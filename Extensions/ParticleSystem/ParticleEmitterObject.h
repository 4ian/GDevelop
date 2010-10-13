/**

Game Develop - Particle System Extension
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

#ifndef TEXTOBJECT_H
#define TEXTOBJECT_H

#include "GDL/Object.h"
#include <SFML/Graphics.hpp>
#include <SPK.h>
#include <SPK_SFML.h>
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
 * Text Object
 */
class ParticleEmitterObject : public Object
{
    public :

        ParticleEmitterObject(std::string name_);
        virtual ~ParticleEmitterObject();
        virtual ObjSPtr Clone() { return boost::shared_ptr<Object>(new ParticleEmitterObject(*this));}

        virtual bool LoadRuntimeResources(const ImageManager & imageMgr );
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

        virtual bool SetAngle(float newAngle) { angle = newAngle; if ( particleSystem ) particleSystem->SetRotation(-angle); return true;};
        virtual float GetAngle() const {return angle;};

        void SetOpacity(float val);
        inline float GetOpacity() const {return opacity;};

        void SetColor(unsigned int r,unsigned int v,unsigned int b);
        inline unsigned int GetColorR() const { return colorR; };
        inline unsigned int GetColorG() const { return colorG; };
        inline unsigned int GetColorB() const { return colorB; };

        //ACE for string
        bool CondString( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActString( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        std::string ExpString( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction );

        //ACE for font and size
        bool ActFont( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondSize( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActSize( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

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

        void SetRendererParam1(float newValue) { rendererParam1 = newValue; };
        void SetRendererParam2(float newValue) { rendererParam2 = newValue; };
        void SetTank(float newValue);
        void SetFlow(float newValue);
        void SetEmitterForceMin(float newValue);
        void SetEmitterForceMax(float newValue);
        void SetParticleGravityX(float newValue);
        void SetParticleGravityY(float newValue);
        void SetParticleGravityZ(float newValue);
        void SetFriction(float newValue);

        enum ParticleParameterType {Nothing, Enabled, Mutable, Random};
        void SetRedParameterType(ParticleParameterType type) { redParam = type; };
        void SetGreenParameterType(ParticleParameterType type) { greenParam = type; };
        void SetBlueParameterType(ParticleParameterType type) { blueParam = type; };
        void SetAlphaParameterType(ParticleParameterType type) { alphaParam = type; };

        void SetParticleRed1(float newValue) { particleRed1= newValue; };
        void SetParticleRed2(float newValue) { particleRed2= newValue; };
        void SetParticleGreen1(float newValue) { particleGreen1= newValue; };
        void SetParticleGreen2(float newValue) { particleGreen2= newValue; };
        void SetParticleBlue1(float newValue) { particleBlue1= newValue; };
        void SetParticleBlue2(float newValue) { particleBlue2= newValue; };
        void SetParticleAlpha1(float newValue) { particleAlpha1= newValue; };
        void SetParticleAlpha2(float newValue) { particleAlpha2= newValue; };
        void SetParticleLifeTimeMin(float newValue) { particleLifeTimeMin= newValue; };
        void SetParticleLifeTimeMax(float newValue) { particleLifeTimeMax= newValue; };

        float GetRendererParam1() const { return rendererParam1; };
        float GetRendererParam2() const { return rendererParam2; };
        float GetTank() const { return tank; };
        float GetFlow() const { return flow; };
        float GetEmitterForceMin() const { return emitterForceMin; };
        float GetEmitterForceMax() const { return emitterForceMax; };
        float GetParticleGravityX() const { return particleGravityX; };
        float GetParticleGravityY() const { return particleGravityY; };
        float GetParticleGravityZ() const { return particleGravityZ; };
        float GetFriction() const { return friction; };
        float GetParticleLifeTimeMin() const { return particleLifeTimeMin; };
        float GetParticleLifeTimeMax() const { return particleLifeTimeMax; };

        ParticleParameterType GetRedParameterType() const { return redParam; };
        ParticleParameterType GetGreenParameterType() const { return greenParam; };
        ParticleParameterType GetBlueParameterType() const { return blueParam; };
        ParticleParameterType GetAlphaParameterType() const { return alphaParam; };

        float GetParticleRed1() const { return particleRed1; };
        float GetParticleRed2() const { return particleRed2; };
        float GetParticleGreen1() const { return particleGreen1; };
        float GetParticleGreen2() const { return particleGreen2; };
        float GetParticleBlue1() const { return particleBlue1; };
        float GetParticleBlue2() const { return particleBlue2; };
        float GetParticleAlpha1() const { return particleAlpha1; };
        float GetParticleAlpha2() const { return particleAlpha2; };

        enum RendererType {Point, Line, Quad};
        void SetRendererType(RendererType type) { rendererType = type; };
        RendererType GetRendererType() const { return rendererType; };

        bool IsRenderingAdditive() { return additive; };
        void SetRenderingAdditive() { additive = true;};
        void SetRenderingAlpha() { additive = false;};

        void SetParticleTexture(std::string imageName) { textureParticleName = imageName; };
        std::string GetParticleTexture() const { return textureParticleName; };

    private:

        SPK::SPK_ID CreateBaseParticleSystem();

        SPK::SPK_ID baseParticleSystemID;
        SPK::SFML::SFMLSystem * particleSystem;
        SPK::Model * particleModel;
        SPK::Emitter * emitter;
        SPK::Group * group;

        std::string textureParticleName;
        boost::shared_ptr<sf::Image> textureParticle;
        RendererType rendererType;
        float rendererParam1;
        float rendererParam2;
        bool additive;
        float tank;
        float flow;
        float emitterForceMin;
        float emitterForceMax;
        float particleGravityX,particleGravityY,particleGravityZ;
        float friction;
        float particleLifeTimeMin, particleLifeTimeMax;
        ParticleParameterType redParam, greenParam, blueParam, alphaParam;
        float particleRed1, particleRed2, particleGreen1, particleGreen2, particleBlue1, particleBlue2, particleAlpha1, particleAlpha2;

        //Opacity
        float opacity;

        //Color
        unsigned int colorR;
        unsigned int colorG;
        unsigned int colorB;

        float angle;

        #if defined(GDE)
        sf::Image edittimeIconImage;
        sf::Sprite edittimeIcon;
        #endif

        static bool SPKinitialized;
};

void DestroyParticleEmitterObject(Object * object);
Object * CreateParticleEmitterObject(std::string name);

#endif // TEXTOBJECT_H
