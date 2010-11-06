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
#include "ParticleSystemWrapper.h"
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

        void UpdateRedParameters();
        void UpdateGreenParameters();
        void UpdateBlueParameters();
        void UpdateAlphaParameters();
        void UpdateSizeParameters();
        void UpdateAngleParameters();
        void UpdateLifeTime();
        void RecreateParticleSystem();

        //Getters/Setters
        void SetRendererParam1(float newValue) { rendererParam1 = newValue; };
        void SetRendererParam2(float newValue) { rendererParam2 = newValue; };
        void SetTank(float newValue);
        void SetFlow(float newValue);
        void SetEmitterForceMin(float newValue);
        void SetEmitterForceMax(float newValue);
        void SetEmitterXDirection(float newValue);
        void SetEmitterYDirection(float newValue);
        void SetEmitterZDirection(float newValue);
        void SetEmitterAngleA(float newValue);
        void SetEmitterAngleB(float newValue);
        void SetZoneRadius(float newValue);
        void SetParticleGravityX(float newValue);
        void SetParticleGravityY(float newValue);
        void SetParticleGravityZ(float newValue);
        void SetFriction(float newValue);

        enum ParticleParameterType {Nothing, Enabled, Mutable, Random};
        void SetRedParameterType(ParticleParameterType type) { redParam = type; };
        void SetGreenParameterType(ParticleParameterType type) { greenParam = type; };
        void SetBlueParameterType(ParticleParameterType type) { blueParam = type; };
        void SetAlphaParameterType(ParticleParameterType type) { alphaParam = type; };
        void SetSizeParameterType(ParticleParameterType type) { sizeParam = type; };
        void SetAngleParameterType(ParticleParameterType type) { angleParam = type; };

        void SetParticleRed1(float newValue) { particleRed1= newValue; UpdateRedParameters();};
        void SetParticleRed2(float newValue) { particleRed2= newValue; UpdateRedParameters();};
        void SetParticleGreen1(float newValue) { particleGreen1= newValue; UpdateGreenParameters();};
        void SetParticleGreen2(float newValue) { particleGreen2= newValue; UpdateGreenParameters();};
        void SetParticleBlue1(float newValue) { particleBlue1= newValue; UpdateBlueParameters();};
        void SetParticleBlue2(float newValue) { particleBlue2= newValue; UpdateBlueParameters();};
        void SetParticleAlpha1(float newValue) { particleAlpha1= newValue; UpdateAlphaParameters();};
        void SetParticleAlpha2(float newValue) { particleAlpha2= newValue; UpdateAlphaParameters();};
        void SetParticleSize1(float newValue) { particleSize1= newValue; UpdateSizeParameters();};
        void SetParticleSize2(float newValue) { particleSize2= newValue; UpdateSizeParameters();};
        void SetParticleAngle1(float newValue) { particleAngle1= newValue; UpdateAngleParameters();};
        void SetParticleAngle2(float newValue) { particleAngle2= newValue; UpdateAngleParameters();};
        void SetParticleAlphaRandomness1(float newValue) { particleAlphaRandomness1= newValue; UpdateAlphaParameters();};
        void SetParticleAlphaRandomness2(float newValue) { particleAlphaRandomness2= newValue; UpdateAlphaParameters();};
        void SetParticleSizeRandomness1(float newValue) { particleSizeRandomness1= newValue; UpdateSizeParameters();};
        void SetParticleSizeRandomness2(float newValue) { particleSizeRandomness2= newValue; UpdateSizeParameters();};
        void SetParticleAngleRandomness1(float newValue) { particleAngleRandomness1= newValue; UpdateAngleParameters();};
        void SetParticleAngleRandomness2(float newValue) { particleAngleRandomness2= newValue; UpdateAngleParameters();};
        void SetParticleLifeTimeMin(float newValue) { particleLifeTimeMin= newValue; UpdateLifeTime();};
        void SetParticleLifeTimeMax(float newValue) { particleLifeTimeMax= newValue; UpdateLifeTime();};
        void SetMaxParticleNb(unsigned int newValue) { maxParticleNb = newValue; };

        float GetRendererParam1() const { return rendererParam1; };
        float GetRendererParam2() const { return rendererParam2; };
        float GetTank() const { return tank; };
        float GetFlow() const { return flow; };
        float GetEmitterForceMin() const { return emitterForceMin; };
        float GetEmitterForceMax() const { return emitterForceMax; };
        float GetEmitterXDirection() const { return emitterXDirection; };
        float GetEmitterYDirection() const { return emitterYDirection; };
        float GetEmitterZDirection() const { return emitterZDirection; };
        float GetEmitterAngleA() const { return emitterAngleA; };
        float GetEmitterAngleB() const { return  emitterAngleB; };
        float GetZoneRadius() const { return  zoneRadius; };
        float GetParticleGravityX() const { return particleGravityX; };
        float GetParticleGravityY() const { return particleGravityY; };
        float GetParticleGravityZ() const { return particleGravityZ; };
        float GetFriction() const { return friction; };
        float GetParticleLifeTimeMin() const { return particleLifeTimeMin; };
        float GetParticleLifeTimeMax() const { return particleLifeTimeMax; };
        unsigned int GetMaxParticleNb() const { return maxParticleNb; };

        ParticleParameterType GetRedParameterType() const { return redParam; };
        ParticleParameterType GetGreenParameterType() const { return greenParam; };
        ParticleParameterType GetBlueParameterType() const { return blueParam; };
        ParticleParameterType GetAlphaParameterType() const { return alphaParam; };
        ParticleParameterType GetSizeParameterType() const { return sizeParam; };
        ParticleParameterType GetAngleParameterType() const { return angleParam; };

        float GetParticleRed1() const { return particleRed1; };
        float GetParticleRed2() const { return particleRed2; };
        float GetParticleGreen1() const { return particleGreen1; };
        float GetParticleGreen2() const { return particleGreen2; };
        float GetParticleBlue1() const { return particleBlue1; };
        float GetParticleBlue2() const { return particleBlue2; };
        float GetParticleAlpha1() const { return particleAlpha1; };
        float GetParticleAlpha2() const { return particleAlpha2; };
        float GetParticleSize1() const { return particleSize1; };
        float GetParticleSize2() const { return particleSize2; };
        float GetParticleAngle1() const { return particleAngle1; };
        float GetParticleAngle2() const { return particleAngle2; };
        float GetParticleAlphaRandomness1() const { return particleAlphaRandomness1; };
        float GetParticleAlphaRandomness2() const { return particleAlphaRandomness2; };
        float GetParticleSizeRandomness1() const { return particleSizeRandomness1; };
        float GetParticleSizeRandomness2() const { return particleSizeRandomness2; };
        float GetParticleAngleRandomness1() const { return particleAngleRandomness1; };
        float GetParticleAngleRandomness2() const { return particleAngleRandomness2; };

        enum RendererType {Point, Line, Quad};
        void SetRendererType(RendererType type) { rendererType = type; };
        RendererType GetRendererType() const { return rendererType; };

        bool IsRenderingAdditive() { return additive; };
        void SetRenderingAdditive() { additive = true;};
        void SetRenderingAlpha() { additive = false;};

        void SetParticleTexture(std::string imageName) { textureParticleName = imageName; };
        std::string GetParticleTexture() const { return textureParticleName; };

        #if defined(GDE)
        bool particleEditionSimpleMode; ///< User preference related to object's edition
        bool emissionEditionSimpleMode; ///< User preference related to object's edition
        bool gravityEditionSimpleMode; ///< User preference related to object's edition
        #endif

        //Actions, conditions and expressions
        bool ActRecreateParticleSystem( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

        bool CondEmitterXDirection( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActEmitterXDirection( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondEmitterYDirection( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActEmitterYDirection( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondEmitterZDirection( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActEmitterZDirection( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondParticleGravityX( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleGravityX( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondParticleGravityY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleGravityY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondParticleGravityZ( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleGravityZ( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondEmitterForceMin( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActEmitterForceMin( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondEmitterForceMax( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActEmitterForceMax( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActRendererParam1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActRendererParam2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondRendererParam1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondRendererParam2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondTank( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondFlow( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActTank( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActFlow( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActEmitterAngleA( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondEmitterAngleA( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActEmitterAngleB( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondEmitterAngleB( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActFriction( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondFriction( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActZoneRadius( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondZoneRadius( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondParticleLifeTimeMin( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleLifeTimeMin( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleLifeTimeMax( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleLifeTimeMax( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondConeSprayAngle( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActConeSprayAngle( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleGravityLength( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondParticleGravityAngle( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActParticleGravityLength( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActParticleGravityAngle( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool CondEmitterAngle( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActEmitterAngle( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

        double ExpRendererParam1( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return rendererParam1; };
        double ExpRendererParam2( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return rendererParam2; };
        double ExpTank( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return tank; };
        double ExpFlow( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return flow; };
        double ExpEmitterForceMin( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return emitterForceMin; };
        double ExpEmitterForceMax( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return emitterForceMax; };
        double ExpEmitterXDirection( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return emitterXDirection; };
        double ExpEmitterYDirection( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return emitterYDirection; };
        double ExpEmitterZDirection( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return emitterZDirection; };
        double ExpEmitterAngleA( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return emitterAngleA; };
        double ExpEmitterAngleB( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return  emitterAngleB; };
        double ExpZoneRadius( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return  zoneRadius; };
        double ExpParticleGravityX( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return particleGravityX; };
        double ExpParticleGravityY( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return particleGravityY; };
        double ExpParticleGravityZ( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return particleGravityZ; };
        double ExpFriction( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return friction; };
        double ExpParticleLifeTimeMin( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return particleLifeTimeMin; };
        double ExpParticleLifeTimeMax( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return particleLifeTimeMax; };
        double ExpEmitterAngle( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return atan2(GetEmitterYDirection(), GetEmitterXDirection())*180.0f/3.14159f; };
        double ExpParticleGravityAngle( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return atan2(GetParticleGravityY(), GetParticleGravityX())*180.0f/3.14159f; };
        double ExpParticleGravityLength( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ){ return sqrt(GetParticleGravityY()*GetParticleGravityY() + GetParticleGravityX()*GetParticleGravityX()); };

        bool ActParticleColor1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleColor2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleRed1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleRed2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleGreen1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleGreen2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleBlue1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleBlue2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleAlpha1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleAlpha2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleSize1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleSize2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleAngle1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleAngle2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleAlphaRandomness1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleAlphaRandomness2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleSizeRandomness1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleSizeRandomness2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleAngleRandomness1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool ActParticleAngleRandomness2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleRed1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleRed2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleGreen1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleGreen2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleBlue1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleBlue2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleAlpha1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleAlpha2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleSize1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleSize2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleAngle1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleAngle2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleAlphaRandomness1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleAlphaRandomness2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleSizeRandomness1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleSizeRandomness2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleAngleRandomness1( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondParticleAngleRandomness2( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

        double ExpParticleRed1( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ) { return particleRed1; };
        double ExpParticleRed2( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ) { return particleRed2; };
        double ExpParticleGreen1( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ) { return particleGreen1; };
        double ExpParticleGreen2( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ) { return particleGreen2; };
        double ExpParticleBlue1( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ) { return particleBlue1; };
        double ExpParticleBlue2( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ) { return particleBlue2; };
        double ExpParticleAlpha1( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ) { return particleAlpha1; };
        double ExpParticleAlpha2( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ) { return particleAlpha2; };
        double ExpParticleSize1( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ) { return particleSize1; };
        double ExpParticleSize2( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ) { return particleSize2; };
        double ExpParticleAngle1( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ) { return particleAngle1; };
        double ExpParticleAngle2( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ) { return particleAngle2; };
        double ExpParticleAlphaRandomness1( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ) { return particleAlphaRandomness1; };
        double ExpParticleAlphaRandomness2( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ) { return particleAlphaRandomness2; };
        double ExpParticleSizeRandomness1( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ) { return particleSizeRandomness1; };
        double ExpParticleSizeRandomness2( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ) { return particleSizeRandomness2; };
        double ExpParticleAngleRandomness1( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ) { return particleAngleRandomness1; };
        double ExpParticleAngleRandomness2( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ) { return particleAngleRandomness2; };

        bool CondNoMoreParticles( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        double ExpNbParticles( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );

    private:

        void CreateParticleSystem();

        ParticleSystemWrapper particleSystem;

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
        float emitterXDirection;
        float emitterYDirection;
        float emitterZDirection;
        float emitterAngleA;
        float emitterAngleB;
        float zoneRadius;
        float particleGravityX,particleGravityY,particleGravityZ;
        float friction;
        float particleLifeTimeMin, particleLifeTimeMax;
        ParticleParameterType redParam, greenParam, blueParam, alphaParam, sizeParam, angleParam;
        float particleRed1, particleRed2, particleGreen1, particleGreen2, particleBlue1, particleBlue2, particleAlpha1, particleAlpha2;
        float particleSize1, particleSize2, particleAngle1, particleAngle2;
        float particleAlphaRandomness1, particleAlphaRandomness2;
        float particleSizeRandomness1, particleSizeRandomness2, particleAngleRandomness1, particleAngleRandomness2;
        unsigned int maxParticleNb;

        bool hasSomeParticles;

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
};

void DestroyParticleEmitterObject(Object * object);
Object * CreateParticleEmitterObject(std::string name);

#endif // TEXTOBJECT_H
