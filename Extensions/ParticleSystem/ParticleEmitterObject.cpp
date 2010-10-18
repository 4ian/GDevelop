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

#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>
#include "GDL/Object.h"

#include "GDL/ImageManager.h"
#include "GDL/tinyxml.h"
#include "GDL/FontManager.h"
#include "GDL/Position.h"
#include "GDL/XmlMacros.h"
#include "ParticleEmitterObject.h"
#include "ParticleSystemWrapper.h"
#include <SPK_GL.h>

#ifdef GDE
#include <wx/wx.h>
#include "GDL/CommonTools.h"
#include "GDL/ResourcesMergingHelper.h"
#include "GDL/MainEditorCommand.h"
#include "ParticleEmitterObjectEditor.h"
#endif

ParticleEmitterObject::ParticleEmitterObject(std::string name_) :
Object(name_),
rendererType(Point),
rendererParam1(1.0f),
rendererParam2(1.0f),
additive(true),
tank(-1),
flow(300),
emitterForceMin(70.0f),
emitterForceMax(170.0f),
emitterXDirection(0.0f),
emitterYDirection(1.0f),
emitterZDirection(0.0f),
emitterAngleA(3.14f/4.0f),
emitterAngleB(3.14f),
zoneRadius(5.0f),
particleGravityX(0.0f),
particleGravityY(0.0f),
particleGravityZ(100.0f),
friction(2.0f),
particleLifeTimeMin(0.5f),
particleLifeTimeMax(2.5f),
redParam(Enabled),
greenParam(Random),
blueParam(Random),
alphaParam(Mutable),
sizeParam(Nothing),
angleParam(Nothing),
particleRed1(1.0f),
particleRed2(1.0f),
particleGreen1(0.2f),
particleGreen2(0.8f),
particleBlue1(0.2f),
particleBlue2(0.0f),
particleAlpha1(0.8f),
particleAlpha2(0.0f),
particleSize1(0.0f),
particleSize2(0.0f),
particleAngle1(0.0f),
particleAngle2(0.0f),
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
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("additive", additive);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("textureParticleName", textureParticleName);

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
}

#if defined(GDE)
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
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("additive", additive);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("textureParticleName", textureParticleName);

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
}
#endif

/**
 *
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
        enabledFlag |= SPK::FLAG_ALPHA; mutableFlag |= SPK::FLAG_ALPHA;
    }
    else if ( alphaParam == Random )
    {
        enabledFlag |= SPK::FLAG_ALPHA; randomFlag |= SPK::FLAG_ALPHA;
    }

    if ( sizeParam == Mutable )
    {
        enabledFlag |= SPK::FLAG_SIZE; mutableFlag |= SPK::FLAG_SIZE;
    }
    else if ( sizeParam == Random )
    {
        enabledFlag |= SPK::FLAG_SIZE; randomFlag |= SPK::FLAG_SIZE;
    }

    if ( angleParam == Mutable )
    {
        enabledFlag |= SPK::FLAG_ANGLE; mutableFlag |= SPK::FLAG_ANGLE;
    }
    else if ( angleParam == Random )
    {
        enabledFlag |= SPK::FLAG_ANGLE; randomFlag |= SPK::FLAG_ANGLE;
    }

    if ( rendererType == Quad) enabledFlag |= SPK::PARAM_TEXTURE_INDEX;

	// Create the model
	particleSystem.particleModel = SPK::Model::create( enabledFlag, mutableFlag, randomFlag );
	if ( redParam == Mutable || redParam == Random ) particleSystem.particleModel->setParam(SPK::PARAM_RED, particleRed1,particleRed2);
	else particleSystem.particleModel->setParam(SPK::PARAM_RED, particleRed1);

	if ( greenParam == Mutable || greenParam == Random ) particleSystem.particleModel->setParam(SPK::PARAM_GREEN, particleGreen1,particleGreen2);
	else particleSystem.particleModel->setParam(SPK::PARAM_GREEN, particleGreen1);

	if ( blueParam == Mutable || blueParam == Random ) particleSystem.particleModel->setParam(SPK::PARAM_BLUE, particleBlue1,particleBlue2);
	else particleSystem.particleModel->setParam(SPK::PARAM_BLUE, particleBlue1);

	if ( alphaParam == Mutable || alphaParam == Random ) particleSystem.particleModel->setParam(SPK::PARAM_ALPHA, particleAlpha1,particleAlpha2);
	else particleSystem.particleModel->setParam(SPK::PARAM_ALPHA, particleAlpha1);

	if ( sizeParam == Mutable || sizeParam == Random ) particleSystem.particleModel->setParam(SPK::PARAM_SIZE, particleSize1,particleSize2);
	else particleSystem.particleModel->setParam(SPK::PARAM_SIZE, particleSize1);

	if ( angleParam == Mutable || angleParam == Random ) particleSystem.particleModel->setParam(SPK::PARAM_ANGLE, particleAngle1,particleAngle2);
	else particleSystem.particleModel->setParam(SPK::PARAM_ANGLE, particleAngle1);

	particleSystem.particleModel->setLifeTime(particleLifeTimeMin,particleLifeTimeMax);

	// Create the renderer
	SPK::GL::GLRenderer* renderer = NULL;
	if ( rendererType == Line )
	    renderer = SPK::GL::GLLineRenderer::create(rendererParam1,rendererParam2);
	else if ( rendererType == Quad)
	{
	    SPK::GL::GLQuadRenderer * quadRenderer = new SPK::GL::GLQuadRenderer(rendererParam1,rendererParam2);

	    //Prepare texture from SFML Image
        //We're going to use it directly with OpenGL
        glGenTextures(1, &particleSystem.openGLTextureParticle);
        glBindTexture(GL_TEXTURE_2D, particleSystem.openGLTextureParticle);
        gluBuild2DMipmaps(GL_TEXTURE_2D, GL_RGBA, textureParticle->GetWidth(), textureParticle->GetHeight(), GL_RGBA, GL_UNSIGNED_BYTE, textureParticle->GetPixelsPtr());
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
        if ( particleSystem.openGLTextureParticle != 0 )
        {
            quadRenderer->setTexturingMode(SPK::TEXTURE_2D);
            quadRenderer->setTexture(particleSystem.openGLTextureParticle);
        }

        renderer = quadRenderer;
	}
	else
	{
	    SPK::GL::GLPointRenderer* pointRenderer = SPK::GL::GLPointRenderer::create();
        pointRenderer->setType(SPK::POINT_CIRCLE);
        pointRenderer->setSize(rendererParam1);

        renderer = pointRenderer;
	}

	renderer->enableBlending(true);
	if ( additive ) renderer->setBlendingFunctions(GL_SRC_ALPHA,GL_ONE);
    else renderer->setBlendingFunctions(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	renderer->setTextureBlending(GL_MODULATE); //Texture color modulated with particle color
	renderer->enableRenderingHint(SPK::DEPTH_TEST,false); //No depth test for performance

	// Create the zone
	particleSystem.zone = SPK::Sphere::create(SPK::Vector3D(0.0f, 0.0f, 0.0f), zoneRadius);

	// Create the emitter
	particleSystem.emitter = SPK::SphericEmitter::create(SPK::Vector3D(emitterXDirection,emitterYDirection,emitterZDirection), emitterAngleA, emitterAngleB); //TODO : Personalize this
	particleSystem.emitter->setForce(emitterForceMin,emitterForceMax);
	particleSystem.emitter->setZone(particleSystem.zone);
	particleSystem.emitter->setTank(tank);
	particleSystem.emitter->setFlow(flow);

	// Create the Group
	particleSystem.group = SPK::Group::create(particleSystem.particleModel);
	particleSystem.group->addEmitter(particleSystem.emitter);
	particleSystem.group->setGravity(SPK::Vector3D(particleGravityX,particleGravityY,particleGravityZ));
	particleSystem.group->setFriction(friction);
	particleSystem.group->setRenderer(renderer);

	// Create the System
	particleSystem.particleSystem = SPK::System::create();
	particleSystem.particleSystem->addGroup(particleSystem.group);
}

bool ParticleEmitterObject::LoadRuntimeResources(const ImageManager & imageMgr )
{
    //Get the texture if necessary
    if ( rendererType == Quad ) textureParticle = imageMgr.GetImage(textureParticleName);

	CreateParticleSystem();

    return true;
}

bool ParticleEmitterObject::LoadResources(const ImageManager & imageMgr)
{
    #if defined(GDE)
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

    float x =  (200.0f*window.GetView().GetSize().x*(GetX()-window.GetView().GetCenter().x))/(window.GetView().GetSize().y*window.GetWidth());
    float y = -(200.0f*window.GetView().GetSize().x*(GetY()-window.GetView().GetCenter().y))/(window.GetView().GetSize().y*window.GetWidth());

    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();

    glRotatef(window.GetView().GetRotation(), 0, 0, 1);
    glTranslatef(x, y, -100.0f/(window.GetWidth()/window.GetView().GetSize().x));

	SPK::GL::GLRenderer::saveGLStates();
	particleSystem.particleSystem->render();
	SPK::GL::GLRenderer::restoreGLStates();

    window.SaveGLStates();

    return true;
}

#ifdef GDE
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
    if ( particleSystem.group ) particleSystem.group->setGravity(SPK::Vector3D(particleGravityX,particleGravityY,particleGravityZ));
}
void ParticleEmitterObject::SetParticleGravityY(float newValue)
{
    particleGravityY = newValue;
    if ( particleSystem.group ) particleSystem.group->setGravity(SPK::Vector3D(particleGravityX,particleGravityY,particleGravityZ));
}
void ParticleEmitterObject::SetParticleGravityZ(float newValue)
{
    particleGravityZ = newValue;
    if ( particleSystem.group ) particleSystem.group->setGravity(SPK::Vector3D(particleGravityX,particleGravityY,particleGravityZ));
}
void ParticleEmitterObject::SetFriction(float newValue)
{
    friction = newValue;
    if ( particleSystem.group ) particleSystem.group->setFriction(friction);
}
void ParticleEmitterObject::SetEmitterXDirection(float newValue)
{
    emitterXDirection = newValue;
    if ( particleSystem.emitter ) particleSystem.emitter->setDirection(SPK::Vector3D(emitterXDirection, emitterYDirection, emitterZDirection));
}
void ParticleEmitterObject::SetEmitterYDirection(float newValue)
{
    emitterYDirection = newValue;
    if ( particleSystem.emitter ) particleSystem.emitter->setDirection(SPK::Vector3D(emitterXDirection, emitterYDirection, emitterZDirection));
}
void ParticleEmitterObject::SetEmitterZDirection(float newValue)
{
    emitterZDirection = newValue;
    if ( particleSystem.emitter ) particleSystem.emitter->setDirection(SPK::Vector3D(emitterXDirection, emitterYDirection, emitterZDirection));
}
void ParticleEmitterObject::SetEmitterAngleA(float newValue)
{
    emitterAngleA = newValue;
    if ( particleSystem.emitter ) particleSystem.emitter->setAngles(emitterAngleA, emitterAngleB);
}
void ParticleEmitterObject::SetEmitterAngleB(float newValue)
{
    emitterAngleB = newValue;
    if ( particleSystem.emitter ) particleSystem.emitter->setAngles(emitterAngleA, emitterAngleB);
}
void ParticleEmitterObject::SetZoneRadius(float newValue)
{
    zoneRadius = newValue;
    if ( particleSystem.zone ) particleSystem.zone->setRadius(zoneRadius);
}

void ParticleEmitterObject::OnPositionChanged()
{
    /*if ( particleSystem )
        particleSystem->SetPosition(GetX(), GetY());*/
}

/**
 * Get the real X position of the sprite
 */
float ParticleEmitterObject::GetDrawableX() const
{
    return GetX();
}

/**
 * Get the real Y position of the text
 */
float ParticleEmitterObject::GetDrawableY() const
{
    return GetY();
}

/**
 * Width is the width of the current sprite.
 */
float ParticleEmitterObject::GetWidth() const
{
    return 32;
}

/**
 * Height is the height of the current sprite.
 */
float ParticleEmitterObject::GetHeight() const
{
    return 32;
}

/**
 * X center is computed with text rectangle
 */
float ParticleEmitterObject::GetCenterX() const
{
    return 16;
}

/**
 * Y center is computed with text rectangle
 */
float ParticleEmitterObject::GetCenterY() const
{
    return 16;
}

/**
 * Nothing to do when updating time
 */
void ParticleEmitterObject::UpdateTime(float deltaTime)
{
	hasSomeParticles = particleSystem.particleSystem->update (deltaTime);
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

