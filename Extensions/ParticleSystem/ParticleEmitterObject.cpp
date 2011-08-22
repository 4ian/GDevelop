/**

Game Develop - Particle System Extension
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

#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>
#include "GDL/Object.h"
#include "GDL/ImageManager.h"
#include "GDL/tinyxml.h"
#include "GDL/FontManager.h"
#include "GDL/Position.h"
#include "GDL/XmlMacros.h"
#include "GDL/RuntimeScene.h"
#include "GDL/RotatedRectangle.h"
#include "ParticleEmitterObject.h"
#include "ParticleSystemWrapper.h"
#include <SPK.h>
#include <SPK_GL.h>

#if defined(GD_IDE_ONLY)
#include <wx/wx.h>
#include "GDL/CommonTools.h"
#include "GDL/ResourcesMergingHelper.h"
#include "GDL/MainEditorCommand.h"
#include "ParticleEmitterObjectEditor.h"
#endif

#if defined(GD_IDE_ONLY)
sf::Image ParticleEmitterObject::edittimeIconImage;
sf::Sprite ParticleEmitterObject::edittimeIcon;
#endif

ParticleEmitterObject::ParticleEmitterObject(std::string name_) :
Object(name_),
#if defined(GD_IDE_ONLY)
particleEditionSimpleMode(true),
emissionEditionSimpleMode(true),
gravityEditionSimpleMode(true),
#endif
rendererType(Point),
rendererParam1(3.0f),
rendererParam2(1.0f),
additive(true),
tank(-1),
flow(300),
emitterForceMin(25.0f),
emitterForceMax(65.0f),
emitterXDirection(0.0f),
emitterYDirection(1.0f),
emitterZDirection(0.0f),
emitterAngleA(0),
emitterAngleB(180),
zoneRadius(3.0f),
particleGravityX(0.0f),
particleGravityY(-100.0f),
particleGravityZ(0.0f),
friction(2.0f),
particleLifeTimeMin(0.5f),
particleLifeTimeMax(2.5f),
redParam(Enabled),
greenParam(Random),
blueParam(Random),
alphaParam(Mutable),
sizeParam(Mutable),
angleParam(Mutable),
particleRed1(255.0f),
particleRed2(255.0f),
particleGreen1(51),
particleGreen2(255),
particleBlue1(51),
particleBlue2(0.0f),
particleAlpha1(204),
particleAlpha2(0.0f),
particleSize1(100.0f),
particleSize2(100.0f),
particleAngle1(0.0f),
particleAngle2(0.0f),
particleAlphaRandomness1(0), particleAlphaRandomness2(0),
particleSizeRandomness1(0), particleSizeRandomness2(0), particleAngleRandomness1(0), particleAngleRandomness2(0),
maxParticleNb(5000),
hasSomeParticles(true),
opacity( 255 ),
colorR( 255 ),
colorG( 255 ),
colorB( 255 ),
angle(0)
{
}

void ParticleEmitterObject::LoadFromXml(const TiXmlElement * elem)
{
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("tank", tank);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("flow", flow);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("emitterForceMin", emitterForceMin);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("emitterForceMax", emitterForceMax);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("emitterXDirection", emitterXDirection);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("emitterYDirection", emitterYDirection);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("emitterZDirection", emitterZDirection);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("emitterAngleA", emitterAngleA);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("emitterAngleB", emitterAngleB);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("zoneRadius", zoneRadius);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleGravityX", particleGravityX);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleGravityY", particleGravityY);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleGravityZ", particleGravityZ);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("friction", friction);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleLifeTimeMin", particleLifeTimeMin);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleLifeTimeMax", particleLifeTimeMax);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleRed1", particleRed1);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleRed2", particleRed2);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleGreen1", particleGreen1);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleGreen2", particleGreen2);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleBlue1", particleBlue1);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleBlue2", particleBlue2);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleAlpha1", particleAlpha1);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleAlpha2", particleAlpha2);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("rendererParam1", rendererParam1);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("rendererParam2", rendererParam2);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleSize1", particleSize1);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleSize2", particleSize2);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleAngle1", particleAngle1);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleAngle2", particleAngle2);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleAlphaRandomness1", particleAlphaRandomness1);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleAlphaRandomness2", particleAlphaRandomness2);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleSizeRandomness1", particleSizeRandomness1);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleSizeRandomness2", particleSizeRandomness2);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleAngleRandomness1", particleAngleRandomness1);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("particleAngleRandomness2", particleAngleRandomness2);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("additive", additive);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("textureParticleName", textureParticleName);

    {
        int result = 5000;
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("maxParticleNb", result);
        maxParticleNb = result;
    }

    {
        std::string result;
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("rendererType", result);
        if ( result == "Line") rendererType = Line;
        else if ( result == "Quad") rendererType = Quad;
        else rendererType = Point;
    }
    {
        std::string result;
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("redParam", result);
        if ( result == "Mutable") redParam = Mutable;
        else if ( result == "Random") redParam = Random;
        else redParam = Enabled;
    }
    {
        std::string result;
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("greenParam", result);
        if ( result == "Mutable") greenParam = Mutable;
        else if ( result == "Random") greenParam = Random;
        else greenParam = Enabled;
    }
    {
        std::string result;
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("blueParam", result);
        if ( result == "Mutable") blueParam = Mutable;
        else if ( result == "Random") blueParam = Random;
        else blueParam = Enabled;
    }
    {
        std::string result;
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("alphaParam", result);
        if ( result == "Mutable") alphaParam = Mutable;
        else if ( result == "Random") alphaParam = Random;
        else alphaParam = Enabled;
    }
    {
        std::string result;
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("sizeParam", result);
        if ( result == "Mutable") sizeParam = Mutable;
        else if ( result == "Random") sizeParam = Random;
        else sizeParam = Nothing;
    }
    {
        std::string result;
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("angleParam", result);
        if ( result == "Mutable") angleParam = Mutable;
        else if ( result == "Random") angleParam = Random;
        else angleParam = Nothing;
    }

    int r,g,b;
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("colorR", r);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("colorG", g);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("colorB", b);
    colorR = r; colorG = g; colorB = b;

    #if defined(GD_IDE_ONLY)
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("particleEditionSimpleMode", particleEditionSimpleMode);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("emissionEditionSimpleMode", emissionEditionSimpleMode);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("gravityEditionSimpleMode", gravityEditionSimpleMode);
    #endif
}

#if defined(GD_IDE_ONLY)
void ParticleEmitterObject::SaveToXml(TiXmlElement * elem)
{
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("tank", tank);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("flow", flow);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("emitterForceMin", emitterForceMin);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("emitterForceMax", emitterForceMax);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("emitterXDirection", emitterXDirection);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("emitterYDirection", emitterYDirection);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("emitterZDirection", emitterZDirection);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("emitterAngleA", emitterAngleA);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("emitterAngleB", emitterAngleB);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("zoneRadius", zoneRadius);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleGravityX", particleGravityX);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleGravityY", particleGravityY);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleGravityZ", particleGravityZ);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("friction", friction);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleLifeTimeMin", particleLifeTimeMin);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleLifeTimeMax", particleLifeTimeMax);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleRed1", particleRed1);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleRed2", particleRed2);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleGreen1", particleGreen1);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleGreen2", particleGreen2);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleBlue1", particleBlue1);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleBlue2", particleBlue2);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleAlpha1", particleAlpha1);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleAlpha2", particleAlpha2);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleSize1", particleSize1);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleSize2", particleSize2);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleAngle1", particleAngle1);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleAngle2", particleAngle2);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("rendererParam1", rendererParam1);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("rendererParam2", rendererParam2);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleAlphaRandomness1", particleAlphaRandomness1);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleAlphaRandomness2", particleAlphaRandomness2);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleSizeRandomness1", particleSizeRandomness1);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleSizeRandomness2", particleSizeRandomness2);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleAngleRandomness1", particleAngleRandomness1);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("particleAngleRandomness2", particleAngleRandomness2);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("additive", additive);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("textureParticleName", textureParticleName);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("maxParticleNb", maxParticleNb);

    std::string rendererTypeStr = "Point";
    if ( rendererType == Line ) rendererTypeStr = "Line";
    else if ( rendererType == Quad ) rendererTypeStr = "Quad";
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("rendererType", rendererTypeStr);

    std::string redParamStr = "Enabled";
    if ( redParam == Mutable ) redParamStr = "Mutable";
    else if ( redParam == Random ) redParamStr = "Random";
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("redParam", redParamStr);

    std::string greenParamStr = "Enabled";
    if ( greenParam == Mutable ) greenParamStr = "Mutable";
    else if ( greenParam == Random ) greenParamStr = "Random";
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("greenParam", greenParamStr);

    std::string blueParamStr = "Enabled";
    if ( blueParam == Mutable ) blueParamStr = "Mutable";
    else if ( blueParam == Random ) blueParamStr = "Random";
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("blueParam", blueParamStr);

    std::string alphaParamStr = "Enabled";
    if ( alphaParam == Mutable ) alphaParamStr = "Mutable";
    else if ( alphaParam == Random ) alphaParamStr = "Random";
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("alphaParam", alphaParamStr);

    std::string sizeParamStr = "Nothing";
    if ( sizeParam == Mutable ) sizeParamStr = "Mutable";
    else if ( sizeParam == Random ) sizeParamStr = "Random";
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("sizeParam", sizeParamStr);

    std::string angleParamStr = "Nothing";
    if ( angleParam == Mutable ) angleParamStr = "Mutable";
    else if ( angleParam == Random ) angleParamStr = "Random";
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("angleParam", angleParamStr);

    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("colorR", colorR);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("colorG", colorG);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("colorB", colorB);

    #if defined(GD_IDE_ONLY)
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("particleEditionSimpleMode", particleEditionSimpleMode);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("emissionEditionSimpleMode", emissionEditionSimpleMode);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("gravityEditionSimpleMode", gravityEditionSimpleMode);
    #endif
}
#endif

/**
 * Create particle system from parameters
 */
void ParticleEmitterObject::CreateParticleSystem()
{
    int enabledFlag = 0;
    int mutableFlag = 0;
    int randomFlag = 0;

    if ( redParam == Enabled ) enabledFlag |= SPK::FLAG_RED;
    else if ( redParam == Mutable )
    {
        enabledFlag |= SPK::FLAG_RED; mutableFlag |= SPK::FLAG_RED;
    }
    else if ( redParam == Random )
    {
        enabledFlag |= SPK::FLAG_RED; randomFlag |= SPK::FLAG_RED;
    }

    if ( greenParam == Enabled ) enabledFlag |= SPK::FLAG_RED;
    else if ( greenParam == Mutable )
    {
        enabledFlag |= SPK::FLAG_GREEN; mutableFlag |= SPK::FLAG_GREEN;
    }
    else if ( greenParam == Random )
    {
        enabledFlag |= SPK::FLAG_GREEN; randomFlag |= SPK::FLAG_GREEN;
    }

    if ( blueParam == Enabled ) enabledFlag |= SPK::FLAG_BLUE;
    else if ( blueParam == Mutable )
    {
        enabledFlag |= SPK::FLAG_BLUE; mutableFlag |= SPK::FLAG_BLUE;
    }
    else if ( blueParam == Random )
    {
        enabledFlag |= SPK::FLAG_BLUE; randomFlag |= SPK::FLAG_BLUE;
    }

    if ( alphaParam == Enabled ) enabledFlag |= SPK::FLAG_ALPHA;
    else if ( alphaParam == Mutable )
    {
        enabledFlag |= SPK::FLAG_ALPHA;  randomFlag |= SPK::FLAG_ALPHA; mutableFlag |= SPK::FLAG_ALPHA;
    }
    else if ( alphaParam == Random )
    {
        enabledFlag |= SPK::FLAG_ALPHA; randomFlag |= SPK::FLAG_ALPHA;
    }

    if ( sizeParam == Mutable )
    {
        enabledFlag |= SPK::FLAG_SIZE; randomFlag |= SPK::FLAG_SIZE; mutableFlag |= SPK::FLAG_SIZE;
    }
    else if ( sizeParam == Random )
    {
        enabledFlag |= SPK::FLAG_SIZE; randomFlag |= SPK::FLAG_SIZE;
    }

    if ( angleParam == Mutable )
    {
        enabledFlag |= SPK::FLAG_ANGLE; randomFlag |= SPK::FLAG_ANGLE; mutableFlag |= SPK::FLAG_ANGLE;
    }
    else if ( angleParam == Random )
    {
        enabledFlag |= SPK::FLAG_ANGLE; randomFlag |= SPK::FLAG_ANGLE;
    }

    if ( rendererType == Quad) enabledFlag |= SPK::PARAM_TEXTURE_INDEX;

	// Create the model
	particleSystem.particleModel = SPK::Model::create( enabledFlag, mutableFlag, randomFlag );
	UpdateRedParameters();
	UpdateGreenParameters();
    UpdateBlueParameters();
    UpdateAlphaParameters();
    UpdateSizeParameters();
    UpdateAngleParameters();
	UpdateLifeTime();

	// Create the renderer
	if ( rendererType == Line )
	    particleSystem.renderer = SPK::GL::GLLineRenderer::create(rendererParam1,rendererParam2);
	else if ( rendererType == Quad)
	{
	    SPK::GL::GLQuadRenderer * quadRenderer = new SPK::GL::GLQuadRenderer(rendererParam1,rendererParam2);

        if ( particleSystem.openGLTextureParticle->GetOpenGLTexture() != 0 )
        {
            quadRenderer->setTexturingMode(SPK::TEXTURE_2D);
            quadRenderer->setTexture(particleSystem.openGLTextureParticle->GetOpenGLTexture());
        }

        particleSystem.renderer = quadRenderer;
	}
	else
	{
	    SPK::GL::GLPointRenderer* pointRenderer = SPK::GL::GLPointRenderer::create();
        pointRenderer->setType(SPK::POINT_CIRCLE);
        pointRenderer->setSize(rendererParam1);

        particleSystem.renderer = pointRenderer;
	}

	particleSystem.renderer->enableBlending(true);
	if ( additive ) particleSystem.renderer->setBlendingFunctions(GL_SRC_ALPHA,GL_ONE);
    else particleSystem.renderer->setBlendingFunctions(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	particleSystem.renderer->setTextureBlending(GL_MODULATE); //Texture color modulated with particle color
	particleSystem.renderer->enableRenderingHint(SPK::DEPTH_TEST,false); //No depth test for performance

	// Create the zone
	particleSystem.zone = SPK::Sphere::create(SPK::Vector3D(GetX()*0.25f, -GetY()*0.25f, 0.0f), zoneRadius);

	// Create the emitter
	particleSystem.emitter = SPK::SphericEmitter::create(SPK::Vector3D(emitterXDirection,-emitterYDirection,emitterZDirection), emitterAngleA/180.0f*3.14159f, emitterAngleB/180.0f*3.14159f);
	particleSystem.emitter->setForce(emitterForceMin,emitterForceMax);
	particleSystem.emitter->setZone(particleSystem.zone);
	particleSystem.emitter->setTank(tank);
	particleSystem.emitter->setFlow(flow);

	// Create the Group
	particleSystem.group = SPK::Group::create(particleSystem.particleModel, maxParticleNb);
	particleSystem.group->addEmitter(particleSystem.emitter);
	particleSystem.group->setGravity(SPK::Vector3D(particleGravityX,-particleGravityY,particleGravityZ));
	particleSystem.group->setFriction(friction);
	particleSystem.group->setRenderer(particleSystem.renderer);

	// Create the System
	particleSystem.particleSystem = SPK::System::create();
	particleSystem.particleSystem->addGroup(particleSystem.group);
}

void ParticleEmitterObject::UpdateRedParameters()
{
    if ( !particleSystem.particleModel ) return;

	if ( redParam == Mutable || redParam == Random ) particleSystem.particleModel->setParam(SPK::PARAM_RED, particleRed1/255.0f,particleRed2/255.0f);
	else particleSystem.particleModel->setParam(SPK::PARAM_RED, particleRed1/255.0f);
}

void ParticleEmitterObject::UpdateGreenParameters()
{
    if ( !particleSystem.particleModel ) return;

	if ( greenParam == Mutable || greenParam == Random ) particleSystem.particleModel->setParam(SPK::PARAM_GREEN, particleGreen1/255.0f,particleGreen2/255.0f);
	else particleSystem.particleModel->setParam(SPK::PARAM_GREEN, particleGreen1/255.0f);
}

void ParticleEmitterObject::UpdateBlueParameters()
{
    if ( !particleSystem.particleModel ) return;

	if ( blueParam == Mutable || blueParam == Random ) particleSystem.particleModel->setParam(SPK::PARAM_BLUE, particleBlue1/255.0f,particleBlue2/255.0f);
	else particleSystem.particleModel->setParam(SPK::PARAM_BLUE, particleBlue1/255.0f);
}

void ParticleEmitterObject::UpdateAlphaParameters()
{
    if ( !particleSystem.particleModel ) return;

	if ( alphaParam == Mutable ) particleSystem.particleModel->setParam(SPK::PARAM_ALPHA,
                                                                        (particleAlpha1-particleAlphaRandomness1/2.0f)/255.0f,
                                                                        (particleAlpha1+particleAlphaRandomness1/2.0f)/255.0f,
                                                                        (particleAlpha2-particleAlphaRandomness2/2.0f)/255.0f,
                                                                        (particleAlpha2+particleAlphaRandomness2/2.0f)/255.0f);
	else if ( alphaParam == Random ) particleSystem.particleModel->setParam(SPK::PARAM_ALPHA,(particleAlpha1)/255.0f,(particleAlpha2)/255.0f);
	else particleSystem.particleModel->setParam(SPK::PARAM_ALPHA, particleAlpha1/255.0f);
}

void ParticleEmitterObject::UpdateSizeParameters()
{
    if ( !particleSystem.particleModel ) return;

	if ( sizeParam == Mutable ) particleSystem.particleModel->setParam(SPK::PARAM_SIZE,
                                                                       (particleSize1-particleSizeRandomness1/2.0f)/100.0f,
                                                                       (particleSize1+particleSizeRandomness1/2.0f)/100.0f,
                                                                       (particleSize2-particleSizeRandomness2/2.0f)/100.0f,
                                                                       (particleSize2+particleSizeRandomness2/2.0f)/100.0f);
	else if ( sizeParam == Random ) particleSystem.particleModel->setParam(SPK::PARAM_SIZE,(particleSize1)/100.0f, (particleSize2)/100.0f);
	else particleSystem.particleModel->setParam(SPK::PARAM_SIZE, particleSize1/100.0f);
}

void ParticleEmitterObject::UpdateAngleParameters()
{
    if ( !particleSystem.particleModel ) return;

	if ( angleParam == Mutable ) particleSystem.particleModel->setParam(SPK::PARAM_ANGLE,
                                                                        -(particleAngle1-particleAngleRandomness1/2.0f)/180.0f*3.14159f,
                                                                        -(particleAngle1+particleAngleRandomness1/2.0f)/180.0f*3.14159f,
                                                                        -(particleAngle2-particleAngleRandomness2/2.0f)/180.0f*3.14159f,
                                                                        -(particleAngle2+particleAngleRandomness2/2.0f)/180.0f*3.14159f);
	else if ( angleParam == Random ) particleSystem.particleModel->setParam(SPK::PARAM_ANGLE, -(particleAngle1)/180.0f*3.14159f, -(particleAngle2)/180.0f*3.14159f);
	else particleSystem.particleModel->setParam(SPK::PARAM_ANGLE, -particleAngle1/180.0f*3.14159f);
}

void ParticleEmitterObject::UpdateLifeTime()
{
    if ( !particleSystem.particleModel ) return;

    particleSystem.particleModel->setLifeTime(particleLifeTimeMin,particleLifeTimeMax);
}

bool ParticleEmitterObject::LoadRuntimeResources(const RuntimeScene & scene, const ImageManager & imageMgr )
{
    //Get the texture if necessary
    if ( rendererType == Quad ) particleSystem.openGLTextureParticle = imageMgr.GetOpenGLTexture(textureParticleName);

	CreateParticleSystem();

    return true;
}

bool ParticleEmitterObject::LoadResources(const RuntimeScene & scene, const ImageManager & imageMgr)
{
    #if defined(GD_IDE_ONLY)
    edittimeIconImage.LoadFromFile("Extensions/particleSystemSceneIcon.png");
    edittimeIconImage.SetSmooth(false);
    edittimeIcon.SetImage(edittimeIconImage);
    #endif

    return true;
}

ParticleEmitterObject::~ParticleEmitterObject()
{
}

void ParticleEmitterObject::RecreateParticleSystem()
{
    particleSystem = ParticleSystemWrapper(); //Automatically destroy particle system
	CreateParticleSystem();
}

/**
 * Update animation and direction from the inital position
 */
bool ParticleEmitterObject::InitializeFromInitialPosition(const InitialPosition & position)
{
    return true;
}

/**
 * Render object at runtime
 */
bool ParticleEmitterObject::Draw( sf::RenderWindow& window )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;

    window.RestoreGLStates();

    float xView =  window.GetView().GetCenter().x*0.25f;
    float yView = -window.GetView().GetCenter().y*0.25f;

    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();

    glRotatef(window.GetView().GetRotation(), 0, 0, 1);
    glTranslatef(-xView, -yView, -75.0f*(window.GetView().GetSize().y/600.0f));

	SPK::GL::GLRenderer::saveGLStates();
	particleSystem.particleSystem->render();
	SPK::GL::GLRenderer::restoreGLStates();

    window.SaveGLStates();

    return true;
}

void ParticleEmitterObject::OnPositionChanged()
{
    if ( particleSystem.zone )
        particleSystem.zone->setPosition(SPK::Vector3D(GetX()*0.25f, -GetY()*0.25f, 0));
}

#if defined(GD_IDE_ONLY)
/**
 * Render object at edittime
 */
bool ParticleEmitterObject::DrawEdittime(sf::RenderWindow& renderWindow)
{
    edittimeIcon.SetPosition(GetX(), GetY());
    renderWindow.Draw(edittimeIcon);

    return true;
}

void ParticleEmitterObject::PrepareResourcesForMerging(ResourcesMergingHelper & resourcesMergingHelper)
{
}

bool ParticleEmitterObject::GenerateThumbnail(const Game & game, wxBitmap & thumbnail)
{
    thumbnail = wxBitmap("Extensions/particleSystemicon24.png", wxBITMAP_TYPE_ANY);

    return true;
}

void ParticleEmitterObject::EditObject( wxWindow* parent, Game & game, MainEditorCommand & mainEditorCommand )
{
    ParticleEmitterObjectEditor dialog(parent, game, *this, mainEditorCommand);
    dialog.ShowModal();
}

wxPanel * ParticleEmitterObject::CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position )
{
    return NULL;
}

void ParticleEmitterObject::UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position)
{
}

void ParticleEmitterObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if ( !particleSystem.particleSystem ) return;

    if      ( propertyNb == 0 ) {name = _("Nombre de particules");      value = ToString(particleSystem.particleSystem->getNbParticles());}
}

bool ParticleEmitterObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if      ( propertyNb == 0 ) { return false; }

    return true;
}

unsigned int ParticleEmitterObject::GetNumberOfProperties() const
{
    return 1;
}
#endif

void ParticleEmitterObject::SetTank(float newValue)
{
    tank = newValue;
    if ( particleSystem.emitter ) particleSystem.emitter->setFlow(tank);
}
void ParticleEmitterObject::SetFlow(float newValue)
{
    flow = newValue;
    if ( particleSystem.emitter ) particleSystem.emitter->setFlow(flow);
}
void ParticleEmitterObject::SetEmitterForceMin(float newValue)
{
    emitterForceMin = newValue;
    if ( particleSystem.emitter ) particleSystem.emitter->setForce(emitterForceMin, emitterForceMax);
}
void ParticleEmitterObject::SetEmitterForceMax(float newValue)
{
    emitterForceMax = newValue;
    if ( particleSystem.emitter ) particleSystem.emitter->setForce(emitterForceMin, emitterForceMax);
}
void ParticleEmitterObject::SetParticleGravityX(float newValue)
{
    particleGravityX = newValue;
    if ( particleSystem.group ) particleSystem.group->setGravity(SPK::Vector3D(particleGravityX,-particleGravityY,particleGravityZ));
}
void ParticleEmitterObject::SetParticleGravityY(float newValue)
{
    particleGravityY = newValue;
    if ( particleSystem.group ) particleSystem.group->setGravity(SPK::Vector3D(particleGravityX,-particleGravityY,particleGravityZ));
}
void ParticleEmitterObject::SetParticleGravityZ(float newValue)
{
    particleGravityZ = newValue;
    if ( particleSystem.group ) particleSystem.group->setGravity(SPK::Vector3D(particleGravityX,-particleGravityY,particleGravityZ));
}
void ParticleEmitterObject::SetFriction(float newValue)
{
    friction = newValue;
    if ( particleSystem.group ) particleSystem.group->setFriction(friction);
}
void ParticleEmitterObject::SetEmitterXDirection(float newValue)
{
    emitterXDirection = newValue;
    if ( particleSystem.emitter ) particleSystem.emitter->setDirection(SPK::Vector3D(emitterXDirection, -emitterYDirection, emitterZDirection));
}
void ParticleEmitterObject::SetEmitterYDirection(float newValue)
{
    emitterYDirection = newValue;
    if ( particleSystem.emitter ) particleSystem.emitter->setDirection(SPK::Vector3D(emitterXDirection, -emitterYDirection, emitterZDirection));
}
void ParticleEmitterObject::SetEmitterZDirection(float newValue)
{
    emitterZDirection = newValue;
    if ( particleSystem.emitter ) particleSystem.emitter->setDirection(SPK::Vector3D(emitterXDirection, -emitterYDirection, emitterZDirection));
}
void ParticleEmitterObject::SetEmitterAngleA(float newValue)
{
    emitterAngleA = newValue;
    if ( particleSystem.emitter ) particleSystem.emitter->setAngles(emitterAngleA/180.0f*3.14159f, emitterAngleB/180.0f*3.14159f);
}
void ParticleEmitterObject::SetEmitterAngleB(float newValue)
{
    emitterAngleB = newValue;
    if ( particleSystem.emitter ) particleSystem.emitter->setAngles(emitterAngleA/180.0f*3.14159f, emitterAngleB/180.0f*3.14159f);
}
void ParticleEmitterObject::SetZoneRadius(float newValue)
{
    zoneRadius = newValue;
    if ( particleSystem.zone ) particleSystem.zone->setRadius(zoneRadius);
}

void ParticleEmitterObject::UpdateTime(float deltaTime)
{
	hasSomeParticles = particleSystem.particleSystem->update (deltaTime);
}

void ParticleEmitterObject::SetParticleGravityAngle( float newAngleInDegree )
{
    float length = sqrt(GetParticleGravityY()*GetParticleGravityY()+GetParticleGravityX()*GetParticleGravityX());

    SetParticleGravityX(cos(newAngleInDegree/180.0f*3.14159f)*length);
    SetParticleGravityY(sin(newAngleInDegree/180.0f*3.14159f)*length);
}
void ParticleEmitterObject::SetParticleGravityLength( float length )
{
    float angle = atan2(GetParticleGravityY(), GetParticleGravityX());

    SetParticleGravityX(cos(angle)*length);
    SetParticleGravityY(sin(angle)*length);
}

float ParticleEmitterObject::GetParticleGravityAngle() const
{
    return atan2(GetParticleGravityY(), GetParticleGravityX())*180.0f/3.14159f;
}
float ParticleEmitterObject::GetParticleGravityLength() const
{
    return sqrt(GetParticleGravityY()*GetParticleGravityY()+GetParticleGravityX()*GetParticleGravityX());
}


void ParticleEmitterObject::SetParticleColor1( const std::string & color )
{
    vector < string > colors = SplitString <string> (color, ';');

    if ( colors.size() < 3 ) return; //Color is incorrect

    SetParticleRed1(ToInt(colors[0]));
    SetParticleBlue1(ToInt(colors[1]));
    SetParticleGreen1(ToInt(colors[2]));
}
void ParticleEmitterObject::SetParticleColor2( const std::string & color )
{
    vector < string > colors = SplitString <string> (color, ';');

    if ( colors.size() < 3 ) return; //Color is incorrect

    SetParticleRed2(ToInt(colors[0]));
    SetParticleBlue2(ToInt(colors[1]));
    SetParticleGreen2(ToInt(colors[2]));
}

/**
 * Change the texture
 */
void ParticleEmitterObject::SetTexture( RuntimeScene & scene, const std::string & textureParticleName )
{
    if ( rendererType == Quad )
    {
        //Load new texture
        particleSystem.openGLTextureParticle = scene.game->imageManager->GetOpenGLTexture(textureParticleName);

	    //Notify the renderer of the change
	    SPK::GL::GLQuadRenderer * quadRenderer = dynamic_cast<SPK::GL::GLQuadRenderer*>(particleSystem.renderer);

        if ( quadRenderer && particleSystem.openGLTextureParticle->GetOpenGLTexture() != 0 )
        {
            quadRenderer->setTexturingMode(SPK::TEXTURE_2D);
            quadRenderer->setTexture(particleSystem.openGLTextureParticle->GetOpenGLTexture());
        }
    }
}

/**
 * Get the real X position of the object
 */
float ParticleEmitterObject::GetDrawableX() const
{
    return GetX();
}

/**
 * Get the real Y position of the object
 */
float ParticleEmitterObject::GetDrawableY() const
{
    return GetY();
}

float ParticleEmitterObject::GetWidth() const
{
    return 32;
}

float ParticleEmitterObject::GetHeight() const
{
    return 32;
}

float ParticleEmitterObject::GetCenterX() const
{
    return 16;
}

float ParticleEmitterObject::GetCenterY() const
{
    return 16;
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyParticleEmitterObject(Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
Object * CreateParticleEmitterObject(std::string name)
{
    return new ParticleEmitterObject(name);
}

