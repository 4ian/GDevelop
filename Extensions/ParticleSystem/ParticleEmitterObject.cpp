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
#include "GDL/Object.h"

#include "GDL/ImageManager.h"
#include "GDL/tinyxml.h"
#include "GDL/FontManager.h"
#include "GDL/Position.h"
#include "GDL/XmlMacros.h"
#include "ParticleEmitterObject.h"
#include <SPK_GL.h>

#ifdef GDE
#include <wx/wx.h>
#include "GDL/CommonTools.h"
#include "GDL/ResourcesMergingHelper.h"
#include "GDL/MainEditorCommand.h"
#include "ParticleEmitterObjectEditor.h"
#endif

bool ParticleEmitterObject::SPKinitialized = false;

ParticleEmitterObject::ParticleEmitterObject(std::string name_) :
Object(name_),
baseParticleSystemID(SPK::NO_ID),
particleSystem(NULL),
particleModel(NULL),
emitter(NULL),
group(NULL),
rendererType(Point),
rendererParam1(1.0f),
rendererParam2(1.0f),
additive(true),
tank(-1),
flow(300),
emitterForceMin(70.0f),
emitterForceMax(170.0f),
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
particleRed1(1.0f),
particleRed2(1.0f),
particleGreen1(0.2f),
particleGreen2(0.8f),
particleBlue1(0.2f),
particleBlue2(0.0f),
particleAlpha1(0.8f),
particleAlpha2(0.0f),
opacity( 255 ),
colorR( 255 ),
colorG( 255 ),
colorB( 255 ),
angle(0)
{
    if ( !SPKinitialized )
    {
        SPK::randomSeed = static_cast<unsigned int>(time(NULL));
        SPK::System::setClampStep(true,0.1f);			// clamp the step to 100 ms
        SPK::System::useAdaptiveStep(0.001f,0.01f);		// use an adaptive step from 1ms to 10ms (1000fps to 100fps)

        SPK::SFML::SFMLRenderer::setZFactor(1.0f);
        SPK::SFML::setCameraPosition(SPK::SFML::CAMERA_CENTER,SPK::SFML::CAMERA_BOTTOM,static_cast<float>(800),0.0f);

        SPKinitialized = true;
    }
}

void ParticleEmitterObject::LoadFromXml(const TiXmlElement * elem)
{
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("tank", tank);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("flow", flow);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("emitterForceMin", emitterForceMin);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("emitterForceMax", emitterForceMax);
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

    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("colorR", colorR);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("colorG", colorG);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("colorB", colorB);
}
#endif

// creates and register the base system
SPK::SPK_ID ParticleEmitterObject::CreateBaseParticleSystem()
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
    if ( rendererType == Quad) enabledFlag |= SPK::PARAM_TEXTURE_INDEX;

	// Creates the model
	particleModel = SPK::Model::create( enabledFlag, mutableFlag, randomFlag );
	if ( redParam == Mutable || redParam == Random ) particleModel->setParam(SPK::PARAM_RED, particleRed1,particleRed2);
	else particleModel->setParam(SPK::PARAM_RED, particleRed1);

	if ( greenParam == Mutable || greenParam == Random ) particleModel->setParam(SPK::PARAM_GREEN, particleGreen1,particleGreen2);
	else particleModel->setParam(SPK::PARAM_GREEN, particleGreen1);

	if ( blueParam == Mutable || blueParam == Random ) particleModel->setParam(SPK::PARAM_BLUE, particleBlue1,particleBlue2);
	else particleModel->setParam(SPK::PARAM_BLUE, particleBlue1);

	if ( alphaParam == Mutable || alphaParam == Random ) particleModel->setParam(SPK::PARAM_ALPHA, particleAlpha1,particleAlpha2);
	else particleModel->setParam(SPK::PARAM_ALPHA, particleAlpha1);

	particleModel->setLifeTime(particleLifeTimeMin,particleLifeTimeMax);
	particleModel->setParam(SPK::PARAM_TEXTURE_INDEX, 0.0f);

	// Creates the renderer
	SPK::SFML::SFMLRenderer * renderer = NULL;
	if ( rendererType == Line )
	    renderer = SPK::SFML::SFMLLineRenderer::create(rendererParam1,rendererParam2);
	else if ( rendererType == Quad)
	{
	    cout << "Quad" << textureParticle.get();
	    SPK::SFML::SFMLQuadRenderer * smokeRenderer = SPK::SFML::SFMLQuadRenderer::create(textureParticle.get(), rendererParam1,rendererParam2);
        smokeRenderer->setScale(087.5f,087.5f); // optim

        renderer = smokeRenderer;
	}
	else
	{
	    renderer = SPK::SFML::SFMLPointRenderer::create(rendererParam1);
	}
	renderer->setGroundCulling(true);
	renderer->setBlendMode(additive ? sf::Blend::Add : sf::Blend::Alpha);

	// Creates the zone
	SPK::Sphere* sparkSource = SPK::Sphere::create(SPK::Vector3D(0.0f,0.0f,0.0f),5.0f);

	// Creates the emitter
	emitter = SPK::SphericEmitter::create(SPK::Vector3D(0.0f,0.0f,1.0f),3.14159f / 4.0f,3.0f * 3.14159f / 4.0f);
	emitter->setForce(emitterForceMin,emitterForceMax);
	emitter->setZone(sparkSource);
	emitter->setTank(tank);
	emitter->setFlow(flow);

	// Creates the Group
	group = SPK::Group::create(particleModel);
	group->setRenderer(renderer);
	group->addEmitter(emitter);
	group->setGravity(SPK::Vector3D(particleGravityX,particleGravityY,particleGravityZ));
	group->setFriction(friction);
	if ( rendererType == Quad )
	{
        //group->enableSorting(true);
	}

	// Creates the System
	SPK::SFML::SFMLSystem* sparkSystem = SPK::SFML::SFMLSystem::create();
	sparkSystem->addGroup(group);

	// Defines which objects will be shared by all systems
	particleModel->setShared(true);
	renderer->setShared(true);

	// Creates the base and gets the ID
	return sparkSystem->getID();
}

bool ParticleEmitterObject::LoadRuntimeResources(const ImageManager & imageMgr )
{
	// Loads particle texture
	textureParticle = imageMgr.GetImage(textureParticleName);

	baseParticleSystemID = CreateBaseParticleSystem();
    particleSystem = SPK_Copy(SPK::SFML::SFMLSystem, baseParticleSystemID);
	particleSystem->SetPosition(GetX(), GetY());

    return true;
}

bool ParticleEmitterObject::LoadResources(const ImageManager & imageMgr)
{
    #if defined(GDE)
    edittimeIconImage.LoadFromFile("Extensions/particleSystemicon.png");
    edittimeIcon.SetImage(edittimeIconImage);
    #endif

    return true;
}

ParticleEmitterObject::~ParticleEmitterObject()
{
    if ( particleSystem ) SPK_Destroy(particleSystem);
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

    /*sf::View originalView = window.GetView();
    window.RestoreGLStates();
    glLoadIdentity();
    float windowRatio = static_cast<float>(window.GetView().GetSize().x)/static_cast<float>(window.GetView().GetSize().y);
    float sizeRatio =   0.3330 //To make base have the same size as a rectangle drawn by SFML
                        *1/window.GetView().GetSize().y*600.f; //To make size window's size independant

    //Get the position of the box
    float x = GetX();
    float y = GetY();

    glRotatef(-window.GetView().GetRotation(), 0, 0, 1);
    glTranslatef(x, y, 0);*/

    //Commenting these two lines make the first rendered emitter object not to be displayed :
    /*{window.RestoreGLStates();
    window.SaveGLStates();}*/

    {window.RestoreGLStates();
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();

    cout << "ParticleDrawing, center size : " << window.GetView().GetCenter().x << ";" << window.GetView().GetCenter().y << endl;
    cout << "ParticleDrawing, position : " << GetX() << ";" << GetY() << endl;
    cout << "ParticleDrawing, position2 : " << particleSystem->GetPosition().x << ";" << particleSystem->GetPosition().y << endl;

    GLint values[5];glGetIntegerv(GL_VIEWPORT, values);
    cout << "GL" << ";" << values[0] << ";" << values[1] << ";" << values[2] << ";" << values[3] << ";" << values[4];

    float windowRatio = static_cast<float>(window.GetView().GetSize().x)/static_cast<float>(window.GetView().GetSize().y);
    float sizeRatio =   0.3330 //To make base have the same size as a rectangle drawn by SFML
                        *1/window.GetView().GetSize().y*600.f; //To make size window's size independant

    //Get the position of the box
    float x = ( (GetX()-window.GetView().GetCenter().x+window.GetView().GetSize().x/2) * 200.f / window.GetView().GetSize().x  - 100.f)*windowRatio;
    float y = -(GetY()-window.GetView().GetCenter().y+window.GetView().GetSize().y/2) * 200.f / window.GetView().GetSize().y + 100.f;

    cout << "x:" << x << " y:" << y <<endl;
    cout << "--" << endl;

    glTranslatef(x, y, 0);
	particleSystem->SetPosition(window.ConvertCoords(GetX(), 0).x, window.ConvertCoords(0, GetY()).y);
    window.Draw(*particleSystem);
    particleSystem->SetRotation(0);
	particleSystem->SetPosition(GetX(), GetY());
    window.SaveGLStates();}
    /*window.SaveGLStates();
    window.SetView(originalView);*/

    //PROBLEM : (One) problem : First rendered particle emitter is not displayed..
    //Note : When doing twice the entire rendering the second rendering is displayed.

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
    if ( !particleSystem ) return;

    if      ( propertyNb == 0 ) {name = _("Nombre de particules");      value = ToString(particleSystem->getNbParticles());}
    else if ( propertyNb == 1 ) {name = _("Couleur");       value = ToString(GetColorR())+";"+ToString(GetColorG())+";"+ToString(GetColorB());}
    else if ( propertyNb == 2 ) {name = _("Opacité");       value = ToString(GetOpacity());}
}

bool ParticleEmitterObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if      ( propertyNb == 0 ) { return false; }
    else if ( propertyNb == 1 )
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
    else if ( propertyNb == 2 ) { SetOpacity(ToFloat(newValue)); }

    return true;
}

unsigned int ParticleEmitterObject::GetNumberOfProperties() const
{
    return 3;
}
#endif

void ParticleEmitterObject::SetTank(float newValue)
{
    tank = newValue;
    if ( emitter ) emitter->setFlow(tank);
}
void ParticleEmitterObject::SetFlow(float newValue)
{
    flow = newValue;
    if ( emitter ) emitter->setFlow(flow);
}
void ParticleEmitterObject::SetEmitterForceMin(float newValue)
{
    emitterForceMin = newValue;
    if ( emitter ) emitter->setForce(emitterForceMin, emitterForceMax);
}
void ParticleEmitterObject::SetEmitterForceMax(float newValue)
{
    emitterForceMax = newValue;
    if ( emitter ) emitter->setForce(emitterForceMin, emitterForceMax);
}
void ParticleEmitterObject::SetParticleGravityX(float newValue)
{
    particleGravityX = newValue;
    if ( group ) group->setGravity(SPK::Vector3D(particleGravityX,particleGravityY,particleGravityZ));
}
void ParticleEmitterObject::SetParticleGravityY(float newValue)
{
    particleGravityY = newValue;
    if ( group ) group->setGravity(SPK::Vector3D(particleGravityX,particleGravityY,particleGravityZ));
}
void ParticleEmitterObject::SetParticleGravityZ(float newValue)
{
    particleGravityZ = newValue;
    if ( group ) group->setGravity(SPK::Vector3D(particleGravityX,particleGravityY,particleGravityZ));
}
void ParticleEmitterObject::SetFriction(float newValue)
{
    friction = newValue;
    if ( group ) group->setFriction(friction);
}

void ParticleEmitterObject::OnPositionChanged()
{
    if ( particleSystem )
        particleSystem->SetPosition(GetX(), GetY());
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
	particleSystem->update (deltaTime);
}

/**
 * Change the color filter of the sprite object
 */
void ParticleEmitterObject::SetColor( unsigned int r, unsigned int g, unsigned int b )
{
    colorR = r;
    colorG = g;
    colorB = b;
    if ( particleSystem ) particleSystem->SetColor(sf::Color(colorR, colorG, colorB, opacity));
}

void ParticleEmitterObject::SetOpacity(float val)
{
    if ( val > 255 )
        val = 255;
    else if ( val < 0 )
        val = 0;

    opacity = val;
    if ( particleSystem ) particleSystem->SetColor(sf::Color(colorR, colorG, colorB, opacity));
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

